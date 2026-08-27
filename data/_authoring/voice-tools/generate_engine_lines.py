"""Die festen Ansagen der Engine vertonen — zwei Saetze, jede Welt, ein Lauf.

Aufruf:
    python generate_engine_lines.py --mp3
    python generate_engine_lines.py --mp3 --force

Warum ein eigenes Skript: Diese beiden Saetze stehen in keiner Content-Datei.
Sie sind fest im Frontend verdrahtet, weil sie world-unabhaengig sind — der
Fortsetzen-Dialog und die Erfolgs-Nachricht sehen in jeder Welt gleich aus.
Damit greift weder der Episoden- noch der Event-Leser von voice_lines.py, und
es gibt auch nichts, wohin ein Rueckverweis geschrieben werden koennte: den
Dateinamen kennt das Frontend als Konstante.

ACHTUNG — zwei Quellen fuer denselben Satz: Aendert sich einer der Texte im
Frontend, muss er hier mitgeaendert und die Aufnahme mit --force neu erzeugt
werden. Die Fundstellen stehen unten an jedem Eintrag.
"""

from __future__ import annotations

import argparse
import sys

from generate_orpheus import DEFAULT_MODEL_ID, ENGINE_NAME, OrpheusEngine
from voice_lines import (
    ANNOUNCER_CHARACTER_ID,
    THEMES_ROOT,
    casting_for,
    convert_to_mp3,
    load_casting,
    trim_silence,
    write_wav,
)

# Weltunabhaengige Toene liegen neben data/themes/, nicht darin — sonst gehoerten
# sie einer Welt und waeren in jeder anderen nicht da. Das Frontend holt sie
# ueber ContentService.engineAudioUrl().
ENGINE_AUDIO_FOLDER = THEMES_ROOT.parent / "audio" / "engine"

# Dateiname (ohne Endung) -> gesprochener Satz.
ENGINE_ANNOUNCEMENTS: dict[str, str] = {
    # frontend/src/app/features/episode/resume-prompt/resume-prompt.ts (QUESTION)
    "erzaehler_resume_prompt": (
        "Du warst hier schon mittendrin! Willst du weiterspielen oder von vorn anfangen?"
    ),
    # frontend/src/app/features/events/reward/reward.ts (MESSAGE)
    "erzaehler_reward_done": "Du hast alles geschafft — super gemacht!",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Die festen Engine-Ansagen vertonen.")
    parser.add_argument("--model", default=DEFAULT_MODEL_ID, help="Abweichendes Modell auf Hugging Face")
    parser.add_argument("--device", default="cuda", help="cuda oder cpu")
    parser.add_argument("--load-4bit", action="store_true", help="Modell 4-bit quantisiert laden")
    parser.add_argument("--temperature", type=float, default=0.6)
    parser.add_argument("--top-p", type=float, default=0.95)
    parser.add_argument("--repetition-penalty", type=float, default=1.1)
    parser.add_argument("--max-new-tokens", type=int, default=2000)
    parser.add_argument("--force", action="store_true", help="Vorhandene Aufnahmen neu erzeugen")
    parser.add_argument("--dry-run", action="store_true", help="Nur auflisten, was erzeugt wuerde")
    parser.add_argument("--mp3", action="store_true", help="Nach dem Erzeugen in mp3 umwandeln")
    parser.add_argument("--no-trim", action="store_true", help="Stille am Rand NICHT abschneiden")
    arguments = parser.parse_args()

    casting = load_casting()
    entry = casting_for(casting, ANNOUNCER_CHARACTER_ID)

    if entry.engine != ENGINE_NAME:
        print(f"'{ANNOUNCER_CHARACTER_ID}' ist auf {entry.engine} besetzt — dieses Skript kann nur {ENGINE_NAME}.")
        return 1

    extension = "mp3" if arguments.mp3 else "wav"
    pending = {
        stem: text
        for stem, text in ENGINE_ANNOUNCEMENTS.items()
        if arguments.force or not (ENGINE_AUDIO_FOLDER / f"{stem}.{extension}").exists()
    }

    if arguments.dry_run:
        for stem, text in ENGINE_ANNOUNCEMENTS.items():
            state = "neu" if stem in pending else "schon da"
            print(f"{stem}.{extension} [{entry.voice}] ({state}) {text}")
        return 0

    if not pending:
        print("Beide Engine-Ansagen liegen schon — mit --force neu erzeugen.")
        return 0

    # Erst laden, wenn wirklich etwas zu tun ist: das Modell zu holen kostet
    # mehr Zeit als die zwei Saetze zusammen.
    engine = OrpheusEngine(model_id=arguments.model, device=arguments.device, load_4bit=arguments.load_4bit)
    failed: list[str] = []

    for stem, text in pending.items():
        print(f"{stem} [{entry.voice}] {text}")
        try:
            samples, sample_rate = engine.synthesize(text, entry, arguments)
            if not arguments.no_trim:
                samples = trim_silence(samples, sample_rate)
            wav_target = ENGINE_AUDIO_FOLDER / f"{stem}.wav"
            write_wav(wav_target, samples, sample_rate)
            if arguments.mp3:
                convert_to_mp3(wav_target)
        except Exception as error:  # eine kaputte Zeile darf die zweite nicht verhindern
            failed.append(f"{stem}: {error}")

    print()
    print(f"Erzeugt: {len(pending) - len(failed)} | Fehlgeschlagen: {len(failed)}")
    print(f"Ziel: {ENGINE_AUDIO_FOLDER}")
    for failure in failed:
        print(f"  FEHLER {failure}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
