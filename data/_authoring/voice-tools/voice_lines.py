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

# Alles unter diesem Bruchteil des Spitzenpegels gilt als Stille. Danach bleiben
# 80 ms Luft stehen, damit kein Anlaut abgeschnitten wird.
SILENCE_THRESHOLD = 0.02
TRIM_PADDING_SECONDS = 0.08


@dataclass(frozen=True)
class VoiceLine:
    """Eine einzelne Dialogzeile, fertig zum Vertonen."""

    theme_id: str
    episode_id: str
    episode_file: Path
    line_index: int
    character_id: str
    speaker_name: str
    text: str

    @property
    def file_stem(self) -> str:
        return f"{self.character_id}_{self.episode_id}_{self.line_index:03d}"

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


def choose_text(dialogue_line: dict[str, Any], prefer_simple: bool) -> str:
    """Welche Textfassung vertont wird.

    Standard ist die Vorlesefassung `text_simple` — vorgelesen wird fuer Kinder,
    die noch nicht selbst lesen. Fehlt sie, faellt es auf `text` zurueck.
    """
    simple_text = str(dialogue_line.get("text_simple") or "").strip()
    full_text = str(dialogue_line.get("text") or "").strip()
    if prefer_simple and simple_text:
        return simple_text
    return full_text


def collect_voice_lines(
    theme_id: str | None,
    episode_id: str | None,
    prefer_simple_text: bool,
    themes_root: Path = THEMES_ROOT,
) -> list[VoiceLine]:
    """Alle Dialogzeilen einsammeln, die vertont werden sollen."""
    if not themes_root.is_dir():
        raise FileNotFoundError(f"Kein Weltenordner unter {themes_root} — vertont wird gegen data/themes/.")

    collected: list[VoiceLine] = []
    theme_folders = sorted(folder for folder in themes_root.iterdir() if folder.is_dir())

    for theme_folder in theme_folders:
        if theme_id is not None and theme_folder.name != theme_id:
            continue
        episodes_folder = theme_folder / "episodes"
        if not episodes_folder.is_dir():
            continue

        for episode_file in sorted(episodes_folder.glob("*.json")):
            episode = json.loads(episode_file.read_text(encoding="utf-8"))
            current_episode_id = str(episode.get("episode_id") or episode_file.stem)
            if episode_id is not None and current_episode_id != episode_id:
                continue

            dialogue_sequence: list[dict[str, Any]] = episode.get("dialogue_sequence") or []
            for position, dialogue_line in enumerate(dialogue_sequence, start=1):
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


def write_audio_paths(produced: dict[Path, dict[int, str]]) -> int:
    """`audio_path` in die Episodendateien zurueckschreiben.

    produced: Episodendatei -> {Zeilennummer (1-basiert): relativer Audiopfad}
    """
    changed_files = 0
    for episode_file, paths_per_line in produced.items():
        episode = json.loads(episode_file.read_text(encoding="utf-8"))
        dialogue_sequence: list[dict[str, Any]] = episode.get("dialogue_sequence") or []
        file_changed = False

        for line_index, audio_path in paths_per_line.items():
            dialogue_line = dialogue_sequence[line_index - 1]
            if dialogue_line.get("audio_path") != audio_path:
                dialogue_line["audio_path"] = audio_path
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
