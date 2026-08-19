"""Stellt Figuren und Icons frei — entfernt den Hintergrund, setzt Alphakanal.

Zwölf der Bilddateien einer Welt brauchen echte Transparenz: die Charakter-
Sprites und die Erfolgs-Icons. Die Bildmaschine liefert sie auf einer flachen
Hintergrundfarbe; dieses Werkzeug schneidet die Figur heraus.

Damit das sauber wird, muss die Hintergrundfarbe im Prompt eine Farbe sein, die
NICHT in der Figur vorkommt — sonst frisst das Freistellen Löcher hinein. Der
sichere Standard ist 'mid grey', siehe image-prompts/SPRITES.md.

Beispiele:
    python cutout.py roh.png --out pikachu_neutral.png
    python cutout.py roh.png --out icon.png --trim --margin 4
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

# Windows-Python schreibt sonst nach cp1252 und bricht beim ersten Umlaut ab.
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# u2net ist das Allzweckmodell und trifft gezeichnete Figuren gut.
# isnet-anime ist auf Anime-Figuren trainiert und liefert dort sauberere Kanten.
DEFAULT_MODEL = "isnet-anime"
FALLBACK_MODEL = "u2net"

# Ab welcher Deckkraft ein Pixel beim Zuschneiden als "gehört zur Figur" gilt.
OPAQUE_THRESHOLD = 8


def trim_to_content(image: Image.Image, margin_percent: int) -> Image.Image:
    """Schneidet auf den sichtbaren Inhalt zu und legt einen Rand drumherum."""
    alpha = image.getchannel("A")
    bounds = alpha.point(lambda value: 255 if value > OPAQUE_THRESHOLD else 0).getbbox()

    if bounds is None:
        print("  WARNUNG: Bild ist vollständig transparent — nichts zum Zuschneiden.")
        return image

    left, top, right, bottom = bounds
    margin_x = round((right - left) * margin_percent / 100)
    margin_y = round((bottom - top) * margin_percent / 100)

    return image.crop(
        (
            max(0, left - margin_x),
            max(0, top - margin_y),
            min(image.width, right + margin_x),
            min(image.height, bottom + margin_y),
        )
    )


def cut_out(source_path: Path, target_path: Path, model_name: str, trim: bool, margin_percent: int) -> None:
    session = new_session(model_name)

    with Image.open(source_path) as opened:
        source_image = opened.convert("RGBA")
        cut_image = remove(source_image, session=session)

    if trim:
        cut_image = trim_to_content(cut_image, margin_percent)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    cut_image.save(target_path, "PNG", optimize=True)

    alpha_histogram = cut_image.getchannel("A").histogram()
    opaque_pixels = sum(alpha_histogram[OPAQUE_THRESHOLD + 1 :])
    coverage = opaque_pixels / (cut_image.width * cut_image.height) * 100
    print(f"  {source_path.name} -> {target_path} ({cut_image.width}x{cut_image.height}, {coverage:.0f}% Figur)")

    if coverage < 5:
        print("  WARNUNG: fast nichts übrig — Hintergrundfarbe zu nah an der Figur?")
    if coverage > 95:
        print("  WARNUNG: fast nichts entfernt — hatte das Bild überhaupt einen flachen Hintergrund?")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("sources", nargs="+", type=Path, help="Rohbilder mit flachem Hintergrund")
    parser.add_argument("--out", type=Path, help="Zieldatei (nur bei genau einer Quelle)")
    parser.add_argument("--out-dir", type=Path, help="Zielordner, Dateiname bleibt")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"rembg-Modell (Standard: {DEFAULT_MODEL})")
    parser.add_argument("--trim", action="store_true", help="auf den sichtbaren Inhalt zuschneiden")
    parser.add_argument("--margin", type=int, default=4, help="Rand beim Zuschneiden in %% (Standard: 4)")
    arguments = parser.parse_args()

    if arguments.out is None and arguments.out_dir is None:
        parser.error("--out oder --out-dir angeben")
    if arguments.out is not None and len(arguments.sources) > 1:
        parser.error("--out geht nur mit genau einer Quelle, sonst --out-dir nutzen")

    print(f"Modell: {arguments.model}")

    for source_path in arguments.sources:
        if not source_path.is_file():
            print(f"  FEHLT: {source_path}", file=sys.stderr)
            return 1

        if arguments.out is not None:
            target_path = arguments.out
        else:
            target_path = arguments.out_dir / f"{source_path.stem}.png"

        cut_out(source_path, target_path, arguments.model, arguments.trim, arguments.margin)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
