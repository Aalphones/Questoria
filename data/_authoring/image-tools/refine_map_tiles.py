"""Eine Kartenleinwand kachelweise nachschaerfen - mit Ueberblendung statt Stoss.

Warum es dieses Werkzeug gibt: der gespeicherte ComfyUI-Ablauf `Upscale Map`
zerlegt die Leinwand selbst in Kacheln und setzt sie danach **auf Stoss**
wieder zusammen. Dabei bleibt an jeder Kachelgrenze eine harte Linie stehen,
und weil jedes bisschen mehr Rauschen die Linien staerker macht, muss man dort
den Detailgrad kleinhalten - genau den, fuer den der ganze Umweg gebaut wurde.
Dazu kommt, dass die Regler des Nachschaerfers in einem Knotenpaket sitzen und
ueber comfy-cli gar nicht ankommen.

Dieses Werkzeug macht die Kachelung deshalb selbst:

- Es schneidet **ueberlappende** Kacheln (Vorgabe: halbe Kachelbreite Versatz).
- Es schickt jede einzeln durch FLUX.2, mit frei waehlbaren Schritten und
  Rauschstaerke und einem Prompt, der Detail bestellt statt es zu verbieten.
- Es setzt sie mit einem Kosinus-Fenster zusammen. Jeder Punkt der Leinwand
  bekommt Beitraege aus mehreren Kacheln, gewichtet nach Abstand zur jeweiligen
  Kachelmitte. Eine harte Kante kann dabei gar nicht erst entstehen - es gibt
  keine Stelle, an der eine Kachel aufhoert und die naechste anfaengt.

Die Eingabe ist eine Leinwand, die **bereits auf Zielgroesse** liegt (also
vorher mit einem Hochskalierer vergroessert). Dieses Werkzeug aendert die
Groesse nicht, es fuellt nur Detail nach.
"""
import argparse
import json
import shutil
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

COMFY_URL = "http://127.0.0.1:8188"
COMFY_INPUT_DIR = Path(r"F:\Comfy-Desktop\ComfyUI-Shared\input")

UNET_NAME = "flux-2-klein-9b-Q4_K_M.gguf"
CLIP_NAME = "qwen_3_8b_fp8mixed.safetensors"
VAE_NAME = "flux2-vae.safetensors"

NEGATIVE_PROMPT = (
    "text, logo, watermark, lettering, caption, signature, buildings, houses, "
    "people, animals, photorealism, photographic texture, blurry, smudged, "
    "flat plastic colour, seams, tile edges, borders, frame"
)


def build_prompt(image_name: str, positive: str, steps: int, denoise: float, seed: int) -> dict:
    """Der Ablauf fuer genau eine Kachel, in der Auftragsform von ComfyUI.

    Nachgebaut aus dem Knotenpaket von `Upscale Map`, aber ohne dessen
    Kachel-Zerlegung: das Bild geht direkt hinein, das Ergebnis direkt heraus.
    Die beiden `ReferenceLatent` halten die Kachel als Vorlage fest, damit
    FLUX.2 die Zeichnung verfeinert statt sie neu zu erfinden.
    """
    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": image_name, "upload": "image"}},
        "2": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": UNET_NAME}},
        "3": {"class_type": "CLIPLoader", "inputs": {"clip_name": CLIP_NAME, "type": "flux2", "device": "default"}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": VAE_NAME}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 0], "text": positive}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 0], "text": NEGATIVE_PROMPT}},
        "7": {"class_type": "VAEEncode", "inputs": {"pixels": ["1", 0], "vae": ["4", 0]}},
        "8": {"class_type": "ReferenceLatent", "inputs": {"conditioning": ["5", 0], "latent": ["7", 0]}},
        "9": {"class_type": "ReferenceLatent", "inputs": {"conditioning": ["6", 0], "latent": ["7", 0]}},
        "10": {"class_type": "ImageAddNoise", "inputs": {"image": ["1", 0], "seed": seed, "strength": denoise}},
        "11": {"class_type": "VAEEncode", "inputs": {"pixels": ["10", 0], "vae": ["4", 0]}},
        "12": {"class_type": "GetImageSize", "inputs": {"image": ["1", 0]}},
        "13": {"class_type": "Flux2Scheduler", "inputs": {"steps": steps, "width": ["12", 0], "height": ["12", 1]}},
        "14": {"class_type": "CFGGuider", "inputs": {"model": ["2", 0], "positive": ["8", 0], "negative": ["9", 0], "cfg": 1}},
        "15": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "16": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "17": {"class_type": "SamplerCustomAdvanced", "inputs": {
            "noise": ["16", 0], "guider": ["14", 0], "sampler": ["15", 0],
            "sigmas": ["13", 0], "latent_image": ["11", 0]}},
        "18": {"class_type": "VAEDecode", "inputs": {"samples": ["17", 0], "vae": ["4", 0]}},
        "19": {"class_type": "SaveImage", "inputs": {"images": ["18", 0], "filename_prefix": "MapTile/tile"}},
    }


def submit(prompt: dict) -> str:
    payload = json.dumps({"prompt": prompt}).encode("utf-8")
    request = urllib.request.Request(
        f"{COMFY_URL}/prompt", data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request) as response:
        return json.load(response)["prompt_id"]


def await_result(prompt_id: str, timeout_seconds: int = 900) -> Image.Image:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        with urllib.request.urlopen(f"{COMFY_URL}/history/{prompt_id}") as response:
            history = json.load(response)
        entry = history.get(prompt_id)
        if entry and entry.get("outputs", {}).get("19"):
            info = entry["outputs"]["19"]["images"][0]
            url = (
                f"{COMFY_URL}/view?filename={info['filename']}"
                f"&subfolder={info['subfolder']}&type={info['type']}"
            )
            with urllib.request.urlopen(url) as image_response:
                return Image.open(image_response).convert("RGB").copy()
        time.sleep(2)
    raise SystemExit(f"Kachel {prompt_id} ist nicht fertig geworden")


def tile_origins(total: int, tile: int, step: int) -> list[int]:
    """Anfangspunkte so, dass die letzte Kachel genau am Rand endet."""
    if total <= tile:
        return [0]
    origins = list(range(0, total - tile + 1, step))
    if origins[-1] != total - tile:
        origins.append(total - tile)
    return origins


def blend_window(length: int, is_first: bool, is_last: bool) -> np.ndarray:
    """Kosinus-Fenster, an den Bildraendern flachgezogen.

    Innen laeuft es zu beiden Seiten weich auf null aus, damit sich benachbarte
    Kacheln ueberblenden. Am Bildrand gibt es keinen Nachbarn, der uebernehmen
    koennte - dort bleibt das Fenster auf eins, sonst frisst es den Rand weg.
    """
    positions = np.arange(length, dtype=np.float32)
    window = 0.5 - 0.5 * np.cos(2.0 * np.pi * (positions + 0.5) / length)
    middle = length // 2
    if is_first:
        window[:middle] = 1.0
    if is_last:
        window[middle:] = 1.0
    return window


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="Leinwand, bereits auf Zielgroesse")
    parser.add_argument("target", help="Wohin das Ergebnis geschrieben wird")
    parser.add_argument("--prompt-file", required=True, help="Textdatei mit dem Detail-Prompt")
    parser.add_argument("--tile", type=int, default=1024, help="Kachelkante (Vorgabe 1024)")
    parser.add_argument("--step", type=int, default=None, help="Versatz (Vorgabe: halbe Kachel)")
    parser.add_argument("--steps", type=int, default=8, help="Rechenschritte je Kachel")
    parser.add_argument("--denoise", type=float, default=0.62, help="Rauschstaerke je Kachel")
    parser.add_argument("--seed", type=int, default=None, help="Startwert, gilt fuer alle Kacheln")
    parser.add_argument("--region", default=None, help="Nur ein Ausschnitt: x,y,breite,hoehe")
    arguments = parser.parse_args()

    tile = arguments.tile
    step = arguments.step or tile // 2
    seed = arguments.seed if arguments.seed is not None else int(time.time() * 1000) % 10**12
    positive = Path(arguments.prompt_file).read_text(encoding="utf-8").strip()

    canvas = Image.open(arguments.source).convert("RGB")
    result = np.asarray(canvas, dtype=np.float32).copy()
    accumulated = np.zeros_like(result)
    weights = np.zeros(result.shape[:2], dtype=np.float32)

    if arguments.region:
        left, top, width, height = (int(value) for value in arguments.region.split(","))
    else:
        left, top, width, height = 0, 0, canvas.width, canvas.height

    columns = [left + offset for offset in tile_origins(width, tile, step)]
    rows = [top + offset for offset in tile_origins(height, tile, step)]
    total = len(columns) * len(rows)
    print(f"Leinwand {canvas.size}, Ausschnitt {width}x{height} ab ({left},{top})")
    print(f"{total} Kacheln a {tile} px, Versatz {step}, {arguments.steps} Schritte, Rauschen {arguments.denoise}")

    COMFY_INPUT_DIR.mkdir(parents=True, exist_ok=True)
    done = 0
    for row_index, origin_y in enumerate(rows):
        for column_index, origin_x in enumerate(columns):
            piece = canvas.crop((origin_x, origin_y, origin_x + tile, origin_y + tile))
            name = f"_maptile_{origin_x}_{origin_y}.png"
            piece.save(COMFY_INPUT_DIR / name)

            refined = await_result(submit(build_prompt(name, positive, arguments.steps, arguments.denoise, seed)))
            if refined.size != (tile, tile):
                refined = refined.resize((tile, tile), Image.LANCZOS)

            window = np.outer(
                blend_window(tile, row_index == 0, row_index == len(rows) - 1),
                blend_window(tile, column_index == 0, column_index == len(columns) - 1),
            ).astype(np.float32)

            patch = slice(origin_y, origin_y + tile), slice(origin_x, origin_x + tile)
            accumulated[patch] += np.asarray(refined, dtype=np.float32) * window[:, :, None]
            weights[patch] += window
            (COMFY_INPUT_DIR / name).unlink(missing_ok=True)

            done += 1
            print(f"  {done}/{total} bei ({origin_x},{origin_y})", flush=True)

    covered = weights > 1e-6
    result[covered] = accumulated[covered] / weights[covered][:, None]
    Image.fromarray(np.clip(result, 0, 255).astype(np.uint8)).save(arguments.target)
    print(f"geschrieben: {arguments.target}")


if __name__ == "__main__":
    main()
