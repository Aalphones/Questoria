"""Eine Leinwand verlustarm x4 hochskalieren (Remacri) - Vorstufe der Kachelkarten-Kette.

Baut genau die vier Knoten, die MAPS.md unter "Die Kette" Schritt 1 beschreibt:
LoadImage -> UpscaleModelLoader (4x_foolhardy_Remacri.pth) -> ImageUpscaleWithModel
-> SaveImage. Nahtlos und farbtreu, aber weich - das Ergebnis dient danach als
Geruest fuer refine_map_tiles.py und als Farbvorlage fuer match_map_colour.py.
"""
import argparse
import json
import time
import urllib.request
from pathlib import Path

from PIL import Image

COMFY_URL = "http://127.0.0.1:8188"
COMFY_INPUT_DIR = Path(r"F:\Comfy-Desktop\ComfyUI-Shared\input")

UPSCALE_MODEL = "4x_foolhardy_Remacri.pth"


def build_prompt(image_name: str) -> dict:
    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": image_name, "upload": "image"}},
        "2": {"class_type": "UpscaleModelLoader", "inputs": {"model_name": UPSCALE_MODEL}},
        "3": {"class_type": "ImageUpscaleWithModel", "inputs": {"upscale_model": ["2", 0], "image": ["1", 0]}},
        "4": {"class_type": "SaveImage", "inputs": {"images": ["3", 0], "filename_prefix": "Remacri/remacri"}},
    }


def submit(prompt: dict) -> str:
    payload = json.dumps({"prompt": prompt}).encode("utf-8")
    request = urllib.request.Request(
        f"{COMFY_URL}/prompt", data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request) as response:
        return json.load(response)["prompt_id"]


def await_result(prompt_id: str, timeout_seconds: int = 300) -> Image.Image:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        with urllib.request.urlopen(f"{COMFY_URL}/history/{prompt_id}") as response:
            history = json.load(response)
        entry = history.get(prompt_id)
        if entry and entry.get("outputs", {}).get("4"):
            info = entry["outputs"]["4"]["images"][0]
            url = (
                f"{COMFY_URL}/view?filename={info['filename']}"
                f"&subfolder={info['subfolder']}&type={info['type']}"
            )
            with urllib.request.urlopen(url) as image_response:
                return Image.open(image_response).convert("RGB").copy()
        time.sleep(2)
    raise SystemExit(f"Remacri-Lauf {prompt_id} ist nicht fertig geworden")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="Entwurf, der x4 hochskaliert wird")
    parser.add_argument("target", help="Wohin das Ergebnis geschrieben wird")
    arguments = parser.parse_args()

    COMFY_INPUT_DIR.mkdir(parents=True, exist_ok=True)
    source_path = Path(arguments.source)
    staged_name = f"_remacri_src_{source_path.stem}.png"
    Image.open(source_path).convert("RGB").save(COMFY_INPUT_DIR / staged_name)

    print(f"Remacri x4: {source_path} -> {arguments.target}")
    result = await_result(submit(build_prompt(staged_name)))
    (COMFY_INPUT_DIR / staged_name).unlink(missing_ok=True)

    Path(arguments.target).parent.mkdir(parents=True, exist_ok=True)
    result.save(arguments.target)
    print(f"geschrieben: {arguments.target} {result.size}")


if __name__ == "__main__":
    main()
