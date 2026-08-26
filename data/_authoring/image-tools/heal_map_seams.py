"""Kachelnaehte entfernen, ohne die nachgeschaerfte Zeichnung zu verlieren.

Der Kachel-Durchgang (FLUX.2) erfindet die feine Zeichnung, die eine Karte beim
Hineinzoomen braucht. Er hinterlaesst aber an jeder Kachelgrenze eine harte
Linie: beim Dekodieren bekommt jede Kachel einen Rand, und weil der
Zusammensetz-Knoten auf Stoss stoesst statt zu ueberblenden, reihen sich diese
Raender zu geraden Linien im Raster "Kachelgroesse minus Ueberlappung". Pro
Kachelgrenze sind es zwei Linien wenige Pixel auseinander - die beiden Raender
des Ueberlappungsstreifens.

Es ist kein Tonwertsprung: ein Austausch der groben Toene laesst die Linie
stehen. Sie sitzt in zwei bis drei Pixeln. Behandlung deshalb Linie fuer Linie:
ein schmales Band aus dem nahtlosen Durchgang (reines Hochskalieren desselben
Entwurfs) einsetzen, vorher im Tonwert an die unmittelbare Umgebung
angeglichen, damit kein heller Streifen zurueckbleibt.
"""
import sys

import numpy as np
from PIL import Image

CORE = 1           # so viele Pixel links und rechts der Linie werden voll ersetzt
FEATHER = 3        # ueber so viele weitere Pixel laeuft die Ersetzung aus
REFERENCE = 6      # so breit wird links und rechts der Tonwert gemessen
SMOOTH_ROWS = 65
MIN_COVERAGE = 0.30   # so viel Anteil der Zeilen muss eine Linie treffen
NEIGHBOURHOOD = 16    # so weit darf die zweite Linie eines Paares entfernt liegen


def find_seam_lines(gray: np.ndarray) -> list[tuple[int, int]]:
    """Einzelne durchgehende Linien finden, echte Bildkanten aussparen.

    Eine Kachelnaht laeuft ueber die ganze Bildhoehe und ist dort ueberall
    ungefaehr gleich stark. Eine gezeichnete Kante trifft nur einen Teil der
    Zeilen und ist dazwischen null. Der Unterschied ist der Anteil der Zeilen,
    in denen die Kante ueberhaupt vorkommt - nur wer fast durchgehend da ist,
    wird angefasst.
    """
    per_row = np.abs(np.diff(gray, axis=1))
    gradient = per_row.mean(axis=0)
    threshold = gradient.mean() + 4 * gradient.std()
    lines: list[tuple[int, int]] = []
    for hit in (int(value) for value in np.where(gradient > threshold)[0]):
        coverage = float((per_row[:, hit] > 0.4 * gradient[hit]).mean())
        if coverage < MIN_COVERAGE:
            continue
        if lines and hit - lines[-1][1] <= 1:
            lines[-1] = (lines[-1][0], hit)
        else:
            lines.append((hit, hit))
    return lines


def smooth_along_rows(values: np.ndarray) -> np.ndarray:
    kernel = np.ones(SMOOTH_ROWS, dtype=np.float32) / SMOOTH_ROWS
    padded = np.pad(values, ((SMOOTH_ROWS // 2, SMOOTH_ROWS // 2), (0, 0)), mode="edge")
    return np.stack(
        [np.convolve(padded[:, channel], kernel, mode="valid") for channel in range(values.shape[1])],
        axis=1,
    )


def patch_line(target: np.ndarray, source: np.ndarray, line: tuple[int, int]) -> bool:
    low, high = line
    width = target.shape[1]
    band_low, band_high = low - CORE, high + CORE
    outer_low, outer_high = band_low - FEATHER, band_high + FEATHER
    reference_low, reference_high = outer_low - REFERENCE, outer_high + REFERENCE
    if reference_low < 0 or reference_high + 1 > width:
        return False

    # Tonwert des Ersatzmaterials an die unmittelbare Umgebung angleichen.
    def band_mean(data: np.ndarray) -> np.ndarray:
        left = data[:, reference_low:outer_low].mean(axis=1)
        right = data[:, outer_high + 1:reference_high + 1].mean(axis=1)
        return (left + right) / 2.0

    offset = smooth_along_rows(band_mean(target) - band_mean(source))

    for column in range(outer_low, outer_high + 1):
        if band_low <= column <= band_high:
            weight = 1.0
        else:
            distance = band_low - column if column < band_low else column - band_high
            weight = 1.0 - distance / (FEATHER + 1)
        replacement = source[:, column] + offset
        target[:, column] = target[:, column] * (1 - weight) + replacement * weight
    return True


def patch_axis(target: np.ndarray, source: np.ndarray) -> list[tuple[int, int]]:
    patched = [line for line in find_seam_lines(target.mean(axis=2)) if patch_line(target, source, line)]

    # Jede Kachelgrenze hinterlaesst ein Linienpaar - die zweite ist oft
    # schwaecher und faellt erst auf, wenn die erste weg ist. Ein zweiter
    # Durchgang sucht deshalb nur noch in der Nachbarschaft der bereits
    # behandelten Stellen; alles andere ist Zeichnung und bleibt unberuehrt.
    known = [(low + high) / 2.0 for low, high in patched]
    for line in find_seam_lines(target.mean(axis=2)):
        centre = (line[0] + line[1]) / 2.0
        if not any(abs(centre - position) <= NEIGHBOURHOOD for position in known):
            continue
        if patch_line(target, source, line):
            patched.append(line)
    return patched


tiled_path, seamless_path, target_path = sys.argv[1], sys.argv[2], sys.argv[3]
tiled_image = Image.open(tiled_path).convert("RGB")
seamless_image = Image.open(seamless_path).convert("RGB")
if tiled_image.size != seamless_image.size:
    raise SystemExit(f"Groessen passen nicht: {tiled_image.size} vs {seamless_image.size}")

canvas = np.asarray(tiled_image, dtype=np.float32).copy()
seamless = np.asarray(seamless_image, dtype=np.float32)

seam_columns = patch_axis(canvas, seamless)
canvas = np.ascontiguousarray(canvas.transpose(1, 0, 2))
seam_rows = patch_axis(canvas, np.ascontiguousarray(seamless.transpose(1, 0, 2)))
canvas = np.ascontiguousarray(canvas.transpose(1, 0, 2))

Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8)).save(target_path)
print(f"Linien ersetzt - senkrecht {seam_columns}, waagerecht {seam_rows}")
