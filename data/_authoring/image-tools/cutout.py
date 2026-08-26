"""Stellt Figuren und Icons frei — entfernt den Hintergrund, setzt Alphakanal.

Zwölf der Bilddateien einer Welt brauchen echte Transparenz: die Charakter-
Sprites und die Erfolgs-Icons. Die Bildmaschine liefert sie auf einer flachen
Hintergrundfarbe; dieses Werkzeug schneidet die Figur heraus.

Damit das sauber wird, muss die Hintergrundfarbe im Prompt eine Farbe sein, die
NICHT in der Figur vorkommt — sonst frisst das Freistellen Löcher hinein. Der
sichere Standard ist 'mid grey', siehe image-prompts/SPRITES.md.

Gegen Ausfälle MITTEN in der Figur hilft die Farbwahl allerdings nicht: rembg
hält helle, von der Figur umschlossene Flächen für Hintergrund und macht sie
durchscheinend — Augenweiß, Zähne, Glanzlichter. Solche Stellen macht dieses
Werkzeug nach dem Freistellen wieder deckend, siehe fill_translucent_patches().

Beispiele:
    python cutout.py roh.png --out pikachu_neutral.png
    python cutout.py roh.png --out icon.png --trim --margin 4
    python cutout.py henkelkorb.png --out korb.png --keep-holes
"""

from __future__ import annotations

import argparse
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw
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

# Ab welcher Deckkraft ein Pixel als VOLL deckend gilt. Der Ausfall, gegen den
# dieses Werkzeug arbeitet, ist nicht "ganz weg", sondern "durchscheinend":
# gemessen an bisasam_neutral.png lag das ausgefressene Augenweiß bei Alpha
# 9-64 — für eine Suche nach ganz durchsichtigen Flächen unsichtbar, am
# Bildschirm aber deutlich. Deshalb wird gegen diese hohe Schwelle geprüft,
# nicht gegen OPAQUE_THRESHOLD.
SOLID_THRESHOLD = 200

# Bis zu welchem Anteil an der Figurenfläche eine eingeschlossene, nicht voll
# deckende Fläche als Fehler gilt. Größere Aussparungen sind meist Absicht — der
# Ring eines Henkels, ein Spalt zwischen Arm und Körper. Augen und Zähne liegen
# weit darunter (das Bisasam-Auge: 0,57 % der Figur).
MAX_PATCH_PERCENT = 2.0

# Arbeitswerte der Suche: 0 = noch unbesucht und nicht voll deckend, 128 = vom
# Bildrand aus erreichbar, also echter Hintergrund.
UNVISITED_MARKER = 0
OUTSIDE_MARKER = 128


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


def find_enclosed_patches(solid_mask: Image.Image) -> list[list[tuple[int, int]]]:
    """Sucht nicht voll deckende Flächen, die keine Verbindung zum Bildrand haben.

    Alles Durchscheinende, das vom Rand aus erreichbar ist, ist Hintergrund oder
    weiche Figurenkante. Was übrig bleibt, liegt ringsum von voll deckender
    Figur eingeschlossen — und genau das ist der Ausfall.
    """
    width, height = solid_mask.size

    # Ein Pixel Luft ringsum, damit der Rand garantiert zusammenhängt — sonst
    # zählt eine Figur, die den Bildrand berührt, ihren Hintergrund als Ausfall.
    padded = Image.new("L", (width + 2, height + 2), UNVISITED_MARKER)
    padded.paste(solid_mask, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), OUTSIDE_MARKER)

    padded_pixels = padded.load()
    patches: list[list[tuple[int, int]]] = []

    for start_y in range(1, height + 1):
        for start_x in range(1, width + 1):
            if padded_pixels[start_x, start_y] != UNVISITED_MARKER:
                continue

            patch: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            padded_pixels[start_x, start_y] = OUTSIDE_MARKER

            while queue:
                current_x, current_y = queue.popleft()
                patch.append((current_x - 1, current_y - 1))

                neighbours = (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                )
                for neighbour_x, neighbour_y in neighbours:
                    # Der Rahmen ist nach dem Füllen nie mehr UNVISITED_MARKER,
                    # deshalb läuft die Suche nie aus dem Bild heraus.
                    if padded_pixels[neighbour_x, neighbour_y] == UNVISITED_MARKER:
                        padded_pixels[neighbour_x, neighbour_y] = OUTSIDE_MARKER
                        queue.append((neighbour_x, neighbour_y))

            patches.append(patch)

    return patches


def fill_translucent_patches(
    cut_image: Image.Image, source_image: Image.Image, max_patch_percent: float
) -> tuple[int, int]:
    """Macht kleine eingeschlossene Ausfälle wieder deckend, gibt Anzahl und Fläche zurück."""
    alpha = cut_image.getchannel("A")
    solid_mask = alpha.point(lambda value: 255 if value >= SOLID_THRESHOLD else 0)
    figure_area = solid_mask.histogram()[255]
    area_limit = figure_area * max_patch_percent / 100

    cut_pixels = cut_image.load()
    # An den ausgefressenen Stellen ist die Farbe mit dem Hintergrund verrechnet
    # — brauchbare Werte gibt es nur im Originalbild.
    source_pixels = source_image.load()

    filled_count = 0
    filled_area = 0

    for patch in find_enclosed_patches(solid_mask):
        if len(patch) > area_limit:
            continue

        for x, y in patch:
            red, green, blue, _ = source_pixels[x, y]
            cut_pixels[x, y] = (red, green, blue, 255)

        filled_count += 1
        filled_area += len(patch)

    return filled_count, filled_area


def cut_out(
    source_path: Path,
    target_path: Path,
    model_name: str,
    trim: bool,
    margin_percent: int,
    keep_holes: bool,
) -> None:
    session = new_session(model_name)

    with Image.open(source_path) as opened:
        source_image = opened.convert("RGBA")
        cut_image = remove(source_image, session=session)

    # Muss vor dem Zuschneiden laufen: danach passen die Koordinaten des
    # Originalbilds nicht mehr auf das freigestellte.
    if keep_holes:
        filled_count = 0
        filled_area = 0
    else:
        filled_count, filled_area = fill_translucent_patches(cut_image, source_image, MAX_PATCH_PERCENT)

    if trim:
        cut_image = trim_to_content(cut_image, margin_percent)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    cut_image.save(target_path, "PNG", optimize=True)

    alpha_histogram = cut_image.getchannel("A").histogram()
    opaque_pixels = sum(alpha_histogram[OPAQUE_THRESHOLD + 1 :])
    coverage = opaque_pixels / (cut_image.width * cut_image.height) * 100

    if keep_holes:
        patch_report = "Ausfälle unangetastet"
    elif filled_count == 0:
        patch_report = "keine Ausfälle"
    else:
        patch_share = filled_area / opaque_pixels * 100 if opaque_pixels > 0 else 0
        patch_report = f"{filled_count} Ausfälle gefüllt ({filled_area} px, {patch_share:.2f}% der Figur)"

    print(
        f"  {source_path.name} -> {target_path} "
        f"({cut_image.width}x{cut_image.height}, {coverage:.0f}% Figur, {patch_report})"
    )

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
    parser.add_argument(
        "--keep-holes",
        action="store_true",
        help="durchscheinende Innenflächen so lassen, wie rembg sie liefert (z. B. bei einem Henkel)",
    )
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

        cut_out(
            source_path,
            target_path,
            arguments.model,
            arguments.trim,
            arguments.margin,
            arguments.keep_holes,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
