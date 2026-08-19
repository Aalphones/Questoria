"""Bringt erzeugte Rohbilder in das Format, das die Engine erwartet.

Die Bildmaschine liefert PNG in Generierungsgröße. Die Engine erwartet je nach
Ordner eine andere Größe und ein anderes Dateiformat — die Vorgaben stehen in
data/_authoring/ASSET_REQUIREMENTS.md und sind hier abgebildet.

Bewusste Entscheidung: es wird **zugeschnitten, nie verzerrt**. Ein Bild mit
falschem Seitenverhältnis verliert Rand, statt dass Figuren in die Länge
gezogen werden.

Beispiele:
    python format_assets.py roh.png --out .../backgrounds/alabastia_labor.webp
    python format_assets.py roh1.png roh2.png --out-dir .../answers/
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path

from PIL import Image

# Windows-Python schreibt sonst nach cp1252 und bricht beim ersten Umlaut ab.
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


class AssetKind(StrEnum):
    BACKGROUND = "background"
    MAP = "map"
    COVER = "cover"
    ANSWER = "answer"
    CARD = "card"
    ACHIEVEMENT = "achievement"
    SPRITE = "sprite"


@dataclass(frozen=True)
class TargetFormat:
    width: int
    height: int
    suffix: str
    keep_alpha: bool


TARGET_FORMATS: dict[AssetKind, TargetFormat] = {
    AssetKind.BACKGROUND: TargetFormat(1920, 1080, ".webp", keep_alpha=False),
    AssetKind.MAP: TargetFormat(1920, 1080, ".webp", keep_alpha=False),
    AssetKind.COVER: TargetFormat(1920, 1080, ".webp", keep_alpha=False),
    AssetKind.ANSWER: TargetFormat(512, 512, ".png", keep_alpha=True),
    AssetKind.CARD: TargetFormat(630, 880, ".png", keep_alpha=False),
    AssetKind.ACHIEVEMENT: TargetFormat(128, 128, ".png", keep_alpha=True),
    AssetKind.SPRITE: TargetFormat(1024, 1536, ".png", keep_alpha=True),
}

# Der Ordnername unter data/themes/<welt>/ verrät den Typ — das erspart beim
# Stapellauf das Mitschleppen von --kind.
FOLDER_TO_KIND: dict[str, AssetKind] = {
    "backgrounds": AssetKind.BACKGROUND,
    "maps": AssetKind.MAP,
    "answers": AssetKind.ANSWER,
    "cards": AssetKind.CARD,
    "achievements": AssetKind.ACHIEVEMENT,
    "sprites": AssetKind.SPRITE,
}

WEBP_QUALITY = 92


def detect_kind(target_path: Path) -> AssetKind:
    """Leitet den Asset-Typ aus dem Zielpfad ab."""
    if target_path.stem == "cover":
        return AssetKind.COVER

    for folder in target_path.parts:
        kind = FOLDER_TO_KIND.get(folder)
        if kind is not None:
            return kind

    raise ValueError(
        f"Typ nicht erkennbar aus '{target_path}'. Erwartet wird ein Ordner "
        f"{sorted(FOLDER_TO_KIND)} im Pfad oder der Dateiname 'cover'. "
        f"Sonst --kind explizit angeben."
    )


def crop_to_aspect(image: Image.Image, target_width: int, target_height: int) -> Image.Image:
    """Schneidet mittig auf das Zielseitenverhältnis zu, ohne zu verzerren."""
    source_aspect = image.width / image.height
    target_aspect = target_width / target_height

    if abs(source_aspect - target_aspect) < 0.001:
        return image

    if source_aspect > target_aspect:
        # Quelle ist zu breit — links und rechts abschneiden.
        new_width = round(image.height * target_aspect)
        offset = (image.width - new_width) // 2
        return image.crop((offset, 0, offset + new_width, image.height))

    # Quelle ist zu hoch — oben und unten abschneiden.
    new_height = round(image.width / target_aspect)
    offset = (image.height - new_height) // 2
    return image.crop((0, offset, image.width, offset + new_height))


def convert_image(source_path: Path, target_path: Path, kind: AssetKind) -> None:
    target_format = TARGET_FORMATS[kind]

    with Image.open(source_path) as opened:
        image = opened.convert("RGBA" if target_format.keep_alpha else "RGB")

        if image.width < target_format.width or image.height < target_format.height:
            print(
                f"  WARNUNG: Quelle {image.width}x{image.height} ist kleiner als "
                f"das Ziel {target_format.width}x{target_format.height} — "
                f"wird hochskaliert und verliert Schärfe."
            )

        image = crop_to_aspect(image, target_format.width, target_format.height)
        image = image.resize((target_format.width, target_format.height), Image.LANCZOS)

        target_path.parent.mkdir(parents=True, exist_ok=True)

        if target_format.suffix == ".webp":
            image.save(target_path, "WEBP", quality=WEBP_QUALITY, method=6)
        else:
            image.save(target_path, "PNG", optimize=True)

    size_kb = target_path.stat().st_size / 1024
    print(f"  {source_path.name} -> {target_path} ({target_format.width}x{target_format.height}, {size_kb:.0f} kB)")


def build_target_path(source_path: Path, out_dir: Path, kind: AssetKind) -> Path:
    return out_dir / f"{source_path.stem}{TARGET_FORMATS[kind].suffix}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("sources", nargs="+", type=Path, help="Rohbilder aus der Bildmaschine")
    parser.add_argument("--out", type=Path, help="Zieldatei (nur bei genau einer Quelle)")
    parser.add_argument("--out-dir", type=Path, help="Zielordner, Dateiname bleibt, Endung wird angepasst")
    parser.add_argument("--kind", type=AssetKind, choices=list(AssetKind), help="Typ erzwingen statt ableiten")
    arguments = parser.parse_args()

    if arguments.out is None and arguments.out_dir is None:
        parser.error("--out oder --out-dir angeben")
    if arguments.out is not None and len(arguments.sources) > 1:
        parser.error("--out geht nur mit genau einer Quelle, sonst --out-dir nutzen")

    reference_path: Path = arguments.out if arguments.out is not None else arguments.out_dir
    kind: AssetKind = arguments.kind if arguments.kind is not None else detect_kind(reference_path)
    print(f"Typ: {kind}")

    for source_path in arguments.sources:
        if not source_path.is_file():
            print(f"  FEHLT: {source_path}", file=sys.stderr)
            return 1

        if arguments.out is not None:
            target_path = arguments.out
        else:
            target_path = build_target_path(source_path, arguments.out_dir, kind)

        convert_image(source_path, target_path, kind)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
