"""Leinwand auf Zielgroesse bringen und in 1024er-Ausliefer-Kacheln zerschneiden."""
import json
import sys
from pathlib import Path

from PIL import Image

source_path = Path(sys.argv[1])
canvas_path = Path(sys.argv[2])
target_width, target_height = (int(value) for value in sys.argv[3].split("x"))
tiles = json.loads(sys.argv[4])

canvas = Image.open(source_path).convert("RGB")

# Auf Zielbreite herunterrechnen, dann mittig auf die Zielhoehe stutzen.
scaled_height = round(canvas.height * target_width / canvas.width)
canvas = canvas.resize((target_width, scaled_height), Image.LANCZOS)
if scaled_height != target_height:
    top = (scaled_height - target_height) // 2
    canvas = canvas.crop((0, top, target_width, top + target_height))

canvas_path.parent.mkdir(parents=True, exist_ok=True)
canvas.save(canvas_path)
print(f"Leinwand: {canvas_path} {canvas.size}")

for tile in tiles:
    left = tile["col"] * 1024
    top = tile["row"] * 1024
    cut = canvas.crop((left, top, left + 1024, top + 1024))
    if cut.size != (1024, 1024):
        raise SystemExit(f"Kachel {tile['id']} ist {cut.size}, nicht 1024x1024")
    out_path = Path(tile["out"])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cut.save(out_path, "WEBP", quality=92, method=6)
    print(f"Kachel {tile['id']}: {out_path} {cut.size} {out_path.stat().st_size // 1024} KB")
