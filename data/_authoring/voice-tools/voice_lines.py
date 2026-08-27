"""Gemeinsame Bausteine der Sprachausgabe-Werkstatt.

Beide Generatoren (Kokoro, Orpheus) lesen dieselben Episodendateien, bilden
dieselben Dateinamen und schreiben denselben Rueckverweis ins Content-JSON.
Genau das steht hier — die Skripte daneben kuemmern sich nur um ihr Modell.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

TOOLS_DIR: Path = Path(__file__).resolve().parent
THEMES_ROOT: Path = TOOLS_DIR.parents[1] / "themes"
CASTING_FILE: Path = TOOLS_DIR / "voices.json"
PROBE_FILE: Path = TOOLS_DIR / "probe-lines.txt"
PROBE_FOLDER: Path = TOOLS_DIR / "probe"

# Emotionsset aus ASSET_REQUIREMENTS Abschnitt 2 — daraus wird die character_id
# aus dem Sprite-Dateinamen zurueckgerechnet.
SPRITE_EMOTIONS: tuple[str, ...] = ("neutral", "happy", "worried", "angry")

DEFAULT_CASTING_KEY = "_default"
AUDIO_SUBFOLDER = "audio/voices"
MP3_BITRATE = "96k"

# Ansagen gehoeren keiner Figur — sie kommen aus dem Off und werden ueber den
# Besetzungseintrag `erzaehler` gesprochen, der dafuer schon in voices.json
# steht. Keine Figur traegt diese id als Sprite, also kann der Dateiname nicht
# mit einer Dialogzeile kollidieren.
ANNOUNCER_CHARACTER_ID = "erzaehler"
ANNOUNCER_SPEAKER_NAME = "Ansage"
# Fragen kommen aus demselben Off, sind aber beim Durchsehen einer Liste etwas
# anderes als eine Buehnenansage — deshalb ein eigener Name in der Ausgabe.
QUESTION_SPEAKER_NAME = "Frage"

# Eventtypen, die eine gesprochene Ansage tragen: Feld mit dem Text, Feld fuer
# den Rueckverweis auf die Aufnahme.
ANNOUNCEMENT_EVENT_FIELDS: dict[str, tuple[str, str]] = {
    "pokemon_catch": ("intro", "intro_audio_path"),
}

# Fragetexte stehen nicht in der Episode, sondern in den ausgelagerten
# Event-Dateien unter events/ (JSON_SCHEMA_REFERENCE Abschnitt 4). Die
# Feldnamen sind fuer alle Aufgabentypen dieselben.
QUESTION_TEXT_FIELD = "question"
QUESTION_SIMPLE_FIELD = "question_simple"
QUESTION_AUDIO_FIELD = "question_audio_path"

# Aufgabentypen mit einer gesprochenen Frage. `dialog` und `reward` tragen
# keine, `pokemon_catch` traegt stattdessen eine Ansage (siehe oben).
QUESTION_EVENT_TYPES: frozenset[str] = frozenset(
    {
        "multiple_choice",
        "text_input",
        "image_search",
        "word_match",
        "sorting",
        "number_line",
    }
)

# Alles unter diesem Bruchteil des Spitzenpegels gilt als Stille. Danach bleiben
# 80 ms Luft stehen, damit kein Anlaut abgeschnitten wird.
SILENCE_THRESHOLD = 0.02
TRIM_PADDING_SECONDS = 0.08


@dataclass(frozen=True)
class VoiceLine:
    """Eine einzelne zu vertonende Zeile — Dialog oder Ansage."""

    theme_id: str
    # Bei Dialog und Ansage die Episode, bei einer Frage die ausgelagerte
    # Event-Datei und ihre event_id — die Zeile kennt nur ihre Quelldatei.
    episode_id: str
    episode_file: Path
    line_index: int
    character_id: str
    speaker_name: str
    text: str
    # "dialog" = eine Zeile in einem dialog-Event, "ansage" = ein Ansagetext
    # eines Spiel-Events, "frage" = der Fragetext einer Aufgabe. Jede Art wird
    # getrennt durchnummeriert.
    kind: str = "dialog"

    @property
    def file_stem(self) -> str:
        # Fragen tragen ihre Art im Namen: event_id und episode_id leben in
        # getrennten Namensraeumen und koennten sonst denselben Dateinamen
        # bilden — die zweite Aufnahme wuerde die erste ueberschreiben.
        prefix = "frage_" if self.kind == "frage" else ""
        return f"{self.character_id}_{prefix}{self.episode_id}_{self.line_index:03d}"

    @property
    def slot_key(self) -> str:
        """Eindeutiger Platz innerhalb einer Episode — Art plus laufende Nummer.

        Dialog und Ansage zaehlen jeweils bei 1 los; ohne die Art davor wuerden
        sich beim Rueckschreiben Zeile 1 und Ansage 1 gegenseitig ueberschreiben.
        """
        return f"{self.kind}:{self.line_index}"

    @property
    def label(self) -> str:
        return f"{self.theme_id}/{self.episode_id} #{self.line_index:03d} {self.speaker_name}"


@dataclass(frozen=True)
class CastingEntry:
    """Wer spricht womit — eine Zeile aus voices.json."""

    engine: str
    voice: str
    speed: float
    language: str


def derive_character_id(sprite_filename: str) -> str:
    """`shanks_neutral.png` wird zu `shanks`.

    Eine Dialogzeile fuehrt keine eigene character_id — der Sprite-Dateiname ist
    die einzige Quelle, aus der sich der Sprecher ableiten laesst.
    """
    stem = Path(sprite_filename).stem
    for emotion in SPRITE_EMOTIONS:
        suffix = f"_{emotion}"
        if stem.endswith(suffix):
            return stem[: -len(suffix)]
    return stem


def iter_dialogue_lines(episode: dict[str, Any]) -> Iterator[tuple[int, dict[str, Any]]]:
    """Alle Dialogzeilen einer Episode, fortlaufend durchnummeriert ab 1.

    Eine Episode ist eine Eventliste (JSON_SCHEMA_REFERENCE Abschnitt 4). Dialoge
    stecken in den Events vom Typ `dialog`; eine Episode kann mehrere davon haben.
    Die Nummerierung laeuft ueber die ganze Episode durch, nicht pro Event — sonst
    kollidieren die Audio-Dateinamen zwischen zwei Dialogen derselben Episode.

    Die gelieferten Dicts sind die Originale aus `episode`, nicht Kopien: wer
    `audio_path` setzt, aendert damit die Episode selbst.
    """
    line_index = 0
    events: list[dict[str, Any]] = episode.get("events") or []
    for event in events:
        if event.get("type") != "dialog":
            continue
        lines: list[dict[str, Any]] = (event.get("config") or {}).get("lines") or []
        for dialogue_line in lines:
            line_index += 1
            yield line_index, dialogue_line


def iter_announcement_lines(episode: dict[str, Any]) -> Iterator[tuple[int, dict[str, Any], str, str]]:
    """Alle Ansagetexte einer Episode, eigene Nummerierung ab 1.

    Ansagen sind die gesprochenen Saetze, die ein Spiel-Event ueber seine Buehne
    setzt — kein Dialog, keine Figur, kein Sprite. Welche Events eine tragen,
    steht in ANNOUNCEMENT_EVENT_FIELDS.

    Geliefert werden Nummer, das Original-`config`-Dict, der Text und der Name
    des Feldes, in das der Rueckverweis gehoert.
    """
    line_index = 0
    events: list[dict[str, Any]] = episode.get("events") or []
    for event in events:
        fields = ANNOUNCEMENT_EVENT_FIELDS.get(str(event.get("type")))
        if fields is None:
            continue
        text_field, audio_field = fields
        config: dict[str, Any] = event.get("config") or {}
        text = str(config.get(text_field) or "").strip()
        if not text:
            continue
        line_index += 1
        yield line_index, config, text, audio_field


def iter_question_lines(event_file: dict[str, Any]) -> Iterator[tuple[int, dict[str, Any]]]:
    """Alle Fragetexte einer ausgelagerten Event-Datei, durchnummeriert ab 1.

    Eine Aufgabe traegt je Lernstufe eine Variante (JSON_SCHEMA_REFERENCE
    Abschnitt 4). Ist die Variante ein Pool, hat jeder Pool-Eintrag seinen
    eigenen Fragetext und braucht darum eine eigene Aufnahme; sonst ist die
    Variante selbst der Traeger.

    Die Reihenfolge muss stabil sein: `write_audio_paths` laeuft spaeter noch
    einmal durch dieselbe Datei und ordnet die erzeugten Dateien ueber genau
    diese Nummer zu.

    Die gelieferten Dicts sind die Originale, nicht Kopien: wer
    `question_audio_path` setzt, aendert damit die Event-Datei selbst.
    """
    if str(event_file.get("type")) not in QUESTION_EVENT_TYPES:
        return

    line_index = 0
    variants: dict[str, Any] = event_file.get("variants") or {}
    for variant in variants.values():
        if not isinstance(variant, dict):
            continue
        pool = variant.get("pool")
        holders: list[Any] = pool if isinstance(pool, list) else [variant]
        for holder in holders:
            if not isinstance(holder, dict):
                continue
            if not str(holder.get(QUESTION_TEXT_FIELD) or "").strip():
                continue
            line_index += 1
            yield line_index, holder


def choose_text(
    holder: dict[str, Any],
    prefer_simple: bool,
    full_field: str = "text",
    simple_field: str = "text_simple",
) -> str:
    """Welche Textfassung vertont wird.

    Standard ist die Vorlesefassung (`text_simple` bzw. `question_simple`) —
    vorgelesen wird fuer Kinder, die noch nicht selbst lesen. Fehlt sie, faellt
    es auf die volle Fassung zurueck.
    """
    simple_text = str(holder.get(simple_field) or "").strip()
    full_text = str(holder.get(full_field) or "").strip()
    if prefer_simple and simple_text:
        return simple_text
    return full_text


def collect_voice_lines(
    theme_id: str | None,
    episode_id: str | None,
    prefer_simple_text: bool,
    themes_root: Path = THEMES_ROOT,
) -> list[VoiceLine]:
    """Alle zu vertonenden Zeilen einsammeln — Dialoge, Ansagen und Fragen.

    Dialoge und Ansagen stehen in den Episodendateien, Fragen in den
    ausgelagerten Event-Dateien daneben. Eine Welt kann das eine ohne das
    andere haben, deshalb wird jeder der beiden Ordner fuer sich geprueft.
    """
    if not themes_root.is_dir():
        raise FileNotFoundError(f"Kein Weltenordner unter {themes_root} — vertont wird gegen data/themes/.")

    collected: list[VoiceLine] = []
    theme_folders = sorted(folder for folder in themes_root.iterdir() if folder.is_dir())

    for theme_folder in theme_folders:
        if theme_id is not None and theme_folder.name != theme_id:
            continue
        episodes_folder = theme_folder / "episodes"

        for episode_file in sorted(episodes_folder.glob("*.json")) if episodes_folder.is_dir() else []:
            episode = json.loads(episode_file.read_text(encoding="utf-8"))
            current_episode_id = str(episode.get("episode_id") or episode_file.stem)
            if episode_id is not None and current_episode_id != episode_id:
                continue

            for position, dialogue_line in iter_dialogue_lines(episode):
                text = choose_text(dialogue_line, prefer_simple_text)
                if not text:
                    continue
                collected.append(
                    VoiceLine(
                        theme_id=theme_folder.name,
                        episode_id=current_episode_id,
                        episode_file=episode_file,
                        line_index=position,
                        character_id=derive_character_id(str(dialogue_line.get("sprite") or "unbekannt")),
                        speaker_name=str(dialogue_line.get("name") or "?"),
                        text=text,
                    )
                )

            for position, _config, text, _audio_field in iter_announcement_lines(episode):
                collected.append(
                    VoiceLine(
                        theme_id=theme_folder.name,
                        episode_id=current_episode_id,
                        episode_file=episode_file,
                        line_index=position,
                        character_id=ANNOUNCER_CHARACTER_ID,
                        speaker_name=ANNOUNCER_SPEAKER_NAME,
                        text=text,
                        kind="ansage",
                    )
                )

        events_folder = theme_folder / "events"

        for event_path in sorted(events_folder.glob("*.json")) if events_folder.is_dir() else []:
            event_file = json.loads(event_path.read_text(encoding="utf-8"))
            current_event_id = str(event_file.get("event_id") or event_path.stem)
            # `--episode` grenzt hier auf die event_id ein: eine Frage haengt an
            # ihrer Aufgabe, nicht an einer Episode, und dieselbe Aufgabe kann in
            # mehreren Episoden vorkommen.
            if episode_id is not None and current_event_id != episode_id:
                continue

            for position, holder in iter_question_lines(event_file):
                text = choose_text(
                    holder,
                    prefer_simple_text,
                    QUESTION_TEXT_FIELD,
                    QUESTION_SIMPLE_FIELD,
                )
                if not text:
                    continue
                collected.append(
                    VoiceLine(
                        theme_id=theme_folder.name,
                        episode_id=current_event_id,
                        episode_file=event_path,
                        line_index=position,
                        character_id=ANNOUNCER_CHARACTER_ID,
                        speaker_name=QUESTION_SPEAKER_NAME,
                        text=text,
                        kind="frage",
                    )
                )

    return collected


def load_probe_lines(single_sentence: str | None, probe_file: Path | None) -> list[str]:
    """Die Sätze für einen Stimmvergleich.

    Standard ist die feste Batterie aus probe-lines.txt — immer dieselben Sätze,
    sonst vergleicht man Stimmen anhand verschiedener Texte.
    """
    if single_sentence:
        return [single_sentence]

    source = probe_file or PROBE_FILE
    raw_lines = source.read_text(encoding="utf-8").splitlines()
    sentences = [line.strip() for line in raw_lines if line.strip() and not line.lstrip().startswith("#")]
    if not sentences:
        raise ValueError(f"{source} enthält keinen Probesatz.")
    return sentences


def load_casting(casting_file: Path = CASTING_FILE) -> dict[str, CastingEntry]:
    """voices.json einlesen — die Zuordnung Figur zu Stimme."""
    raw_casting: dict[str, Any] = json.loads(casting_file.read_text(encoding="utf-8"))
    casting: dict[str, CastingEntry] = {}
    for character_id, entry in raw_casting.items():
        if character_id.startswith("//"):
            continue
        casting[character_id] = CastingEntry(
            engine=str(entry["engine"]),
            voice=str(entry["voice"]),
            speed=float(entry.get("speed", 1.0)),
            language=str(entry.get("language", "a")),
        )
    if DEFAULT_CASTING_KEY not in casting:
        raise ValueError(f"{casting_file.name} braucht einen Eintrag '{DEFAULT_CASTING_KEY}' als Rueckfall.")
    return casting


def casting_for(casting: dict[str, CastingEntry], character_id: str) -> CastingEntry:
    return casting.get(character_id, casting[DEFAULT_CASTING_KEY])


def audio_target(line: VoiceLine, extension: str, themes_root: Path = THEMES_ROOT) -> Path:
    return themes_root / line.theme_id / AUDIO_SUBFOLDER / f"{line.file_stem}.{extension}"


def relative_audio_path(line: VoiceLine, extension: str) -> str:
    """Der Wert, der als `audio_path` in der Episodendatei landet."""
    return f"{AUDIO_SUBFOLDER}/{line.file_stem}.{extension}"


def trim_silence(samples: np.ndarray, sample_rate: int) -> np.ndarray:
    """Stille am Anfang und Ende wegschneiden, einen Hauch Luft stehen lassen.

    Beide Sprachmodelle hängen kurzen Sätzen einen langen stillen Schwanz an —
    bei einer Dreiwortzeile war das die halbe Datei. Im Spiel wartet das Kind
    dann auf nichts.
    """
    if samples.size == 0:
        return samples

    window = max(1, sample_rate // 100)
    usable = samples.size - (samples.size % window)
    if usable < window:
        return samples

    energy = np.sqrt((samples[:usable].reshape(-1, window) ** 2).mean(axis=1))
    loud_windows = np.flatnonzero(energy > energy.max() * SILENCE_THRESHOLD)
    if loud_windows.size == 0:
        return samples

    padding = int(TRIM_PADDING_SECONDS * sample_rate)
    start = max(0, loud_windows[0] * window - padding)
    end = min(samples.size, (loud_windows[-1] + 1) * window + padding)
    return samples[start:end]


def write_wav(target: Path, samples: np.ndarray, sample_rate: int) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    sf.write(target, samples, sample_rate, subtype="PCM_16")


def convert_to_mp3(wav_file: Path) -> Path:
    """wav in mp3 umwandeln und das wav entfernen. Braucht ffmpeg im Suchpfad."""
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        raise RuntimeError("ffmpeg ist nicht im Suchpfad — ohne es geht --mp3 nicht.")

    mp3_file = wav_file.with_suffix(".mp3")
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(wav_file),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        MP3_BITRATE,
        "-ac",
        "1",
        str(mp3_file),
    ]
    subprocess.run(command, check=True)
    wav_file.unlink()
    return mp3_file


def audio_targets_of(source_file: Path, data: dict[str, Any]) -> dict[str, tuple[dict[str, Any], str]]:
    """Platz -> (Dict, das den Rueckverweis traegt, Feldname darin).

    Welche Plaetze eine Datei hat, haengt daran, was fuer eine Datei sie ist:
    eine Event-Datei traegt Fragen, eine Episodendatei Dialoge und Ansagen. Die
    Nummerierung entsteht hier genauso wie beim Einsammeln — dieselben
    `iter_*`-Funktionen, dieselbe Reihenfolge.
    """
    if source_file.parent.name == "events":
        return {
            f"frage:{index}": (holder, QUESTION_AUDIO_FIELD)
            for index, holder in iter_question_lines(data)
        }

    targets: dict[str, tuple[dict[str, Any], str]] = {
        f"dialog:{index}": (dialogue_line, "audio_path")
        for index, dialogue_line in iter_dialogue_lines(data)
    }
    for index, config, _text, audio_field in iter_announcement_lines(data):
        targets[f"ansage:{index}"] = (config, audio_field)

    return targets


def write_audio_paths(produced: dict[Path, dict[str, str]]) -> int:
    """Den Rueckverweis auf die Aufnahme in die Content-Dateien zurueckschreiben.

    produced: Quelldatei -> {VoiceLine.slot_key: relativer Audiopfad}

    Dialogzeilen bekommen `audio_path`, Ansagen das Feld, das ihr Eventtyp dafuer
    vorsieht (bei `pokemon_catch` ist das `intro_audio_path`), Fragen
    `question_audio_path`.
    """
    changed_files = 0
    for episode_file, paths_per_slot in produced.items():
        episode = json.loads(episode_file.read_text(encoding="utf-8"))
        targets_by_slot = audio_targets_of(episode_file, episode)

        file_changed = False

        for slot_key, audio_path in paths_per_slot.items():
            holder, audio_field = targets_by_slot[slot_key]
            if holder.get(audio_field) != audio_path:
                holder[audio_field] = audio_path
                file_changed = True

        if file_changed:
            episode_file.write_text(
                json.dumps(episode, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed_files += 1

    return changed_files


def build_common_parser() -> argparse.ArgumentParser:
    """Die Schalter, die beide Generatoren teilen."""
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--theme", default=None, help="Nur diese Welt vertonen (Ordnername unter data/themes/)")
    parser.add_argument("--episode", default=None, help="Nur diese Episode vertonen (episode_id)")
    parser.add_argument(
        "--text",
        choices=("simple", "full"),
        default="simple",
        help="Welche Textfassung gesprochen wird: die Vorlesefassung (Standard) oder der volle Text",
    )
    parser.add_argument("--character", default=None, help="Nur diese Figur vertonen (character_id)")
    parser.add_argument("--force", action="store_true", help="Vorhandene Dateien neu erzeugen statt ueberspringen")
    parser.add_argument("--dry-run", action="store_true", help="Nur auflisten, was erzeugt wuerde")
    parser.add_argument("--mp3", action="store_true", help="Nach dem Erzeugen in mp3 umwandeln (braucht ffmpeg)")
    parser.add_argument("--no-trim", action="store_true", help="Stille am Anfang und Ende NICHT abschneiden")
    parser.add_argument(
        "--no-write-json",
        action="store_true",
        help="`audio_path` NICHT in die Episodendateien zurueckschreiben",
    )
    parser.add_argument("--casting", type=Path, default=CASTING_FILE, help="Abweichende Besetzungsliste")
    return parser


def select_lines(arguments: argparse.Namespace, engine: str, casting: dict[str, CastingEntry]) -> list[VoiceLine]:
    """Zeilen einsammeln und auf die Figuren eingrenzen, die dieser Engine gehoeren."""
    lines = collect_voice_lines(
        theme_id=arguments.theme,
        episode_id=arguments.episode,
        prefer_simple_text=arguments.text == "simple",
    )
    if arguments.character is not None:
        lines = [line for line in lines if line.character_id == arguments.character]
    return [line for line in lines if casting_for(casting, line.character_id).engine == engine]


def report(produced_count: int, skipped_count: int, failed: list[str], changed_files: int) -> None:
    print()
    print(f"Erzeugt: {produced_count} | Uebersprungen (schon da): {skipped_count} | Fehlgeschlagen: {len(failed)}")
    if changed_files:
        print(f"Episodendateien mit neuem audio_path: {changed_files}")
    for failure in failed:
        print(f"  FEHLER {failure}")
