"""Vertonung mit Orpheus — fuer Zeilen, die tragen muessen.

Aufruf (Beispiele):
    python generate_orpheus.py --probe --probe-voices Julian,Sophie,Jakob
    python generate_orpheus.py --theme one_piece --episode arc_01_foosha
    python generate_orpheus.py --theme one_piece --character shanks --force

Orpheus ist ein Sprachmodell auf Llama-Basis: es sagt keine Wellenform voraus,
sondern Audio-Codes, die der SNAC-Decoder in 24-kHz-Ton zurueckuebersetzt. Das
laeuft hier ueber `transformers` statt ueber vLLM — vLLM gibt es unter Windows
nicht ohne Linux-Unterbau, und fuer einen Stapellauf ueber Nacht ist der
Geschwindigkeitsvorteil egal.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

import numpy as np
import torch

from voice_lines import (
    PROBE_FOLDER,
    CastingEntry,
    VoiceLine,
    audio_target,
    build_common_parser,
    casting_for,
    convert_to_mp3,
    load_casting,
    load_probe_lines,
    relative_audio_path,
    report,
    select_lines,
    trim_silence,
    write_audio_paths,
    write_wav,
)

# Der Ton-Decoder besteht aus Faltungsschichten, und genau die schickt Torch durch
# cuDNN. Passen dessen Teilbibliotheken nicht zusammen, bricht das Decodieren mit
# CUDNN_STATUS_SUBLIBRARY_VERSION_MISMATCH ab. Ohne cuDNN rechnet dieselbe Schicht
# auf der Karte fehlerfrei — das Sprachmodell nutzt gar keine Faltungen, verliert
# hier also nichts.
torch.backends.cudnn.enabled = False

ENGINE_NAME = "orpheus"
# Deutsche Nachschulung mit rund 19 Sprechern, frei zugaenglich. Das offizielle
# canopylabs-Modell braucht ein Hugging-Face-Konto samt Zustimmung — siehe README.
DEFAULT_MODEL_ID = "SebastianBodza/Kartoffel_Orpheus-3B_german_natural-v0.1"
SNAC_MODEL_ID = "hubertsiuzdak/snac_24khz"
SAMPLE_RATE = 24_000

# Steuertoken aus dem offiziellen Repo (orpheus_tts/engine_class.py).
START_OF_HUMAN = 128259
END_OF_TEXT = 128009
END_OF_HUMAN = 128260
START_OF_AUDIO = 128257
END_OF_AUDIO = 128258

# Audio-Codes stehen als <custom_token_N> im Vokabular. <custom_token_10> ist
# Code 0 der ersten Ebene; jede der sieben Positionen im Rahmen ist um eine
# volle Codebuchbreite verschoben (orpheus_tts/decoder.py).
CUSTOM_TOKEN_PATTERN = re.compile(r"<custom_token_(\d+)>")
AUDIO_TOKEN_OFFSET = 10
CODES_PER_FRAME = 7
CODEBOOK_SIZE = 4096


class OrpheusEngine:
    """Modell, Decoder und die Uebersetzung dazwischen."""

    def __init__(self, model_id: str, device: str, load_4bit: bool) -> None:
        from snac import SNAC
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)

        model_arguments: dict[str, Any] = {"dtype": torch.bfloat16}
        if load_4bit:
            from transformers import BitsAndBytesConfig

            model_arguments["quantization_config"] = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
            )
            model_arguments["device_map"] = "auto"

        self.model = AutoModelForCausalLM.from_pretrained(model_id, **model_arguments)
        if not load_4bit:
            self.model = self.model.to(device)
        self.model.eval()

        self.snac = SNAC.from_pretrained(SNAC_MODEL_ID).eval().to(device)

    def build_prompt(self, voice: str, text: str) -> torch.Tensor:
        # Modelle mit Sprecherensemble erwarten "Name: Text". Ein-Stimmen-Modelle
        # wurden auf einen vorangestellten Gedankenstrich trainiert — ein leerer
        # Stimmname in der Besetzungsliste schaltet auf diese Form um.
        spoken_prompt = f"{voice}: {text}" if voice else f"— {text}"
        prompt_ids = self.tokenizer(spoken_prompt, return_tensors="pt").input_ids
        start = torch.tensor([[START_OF_HUMAN]], dtype=torch.int64)
        end = torch.tensor([[END_OF_TEXT, END_OF_HUMAN]], dtype=torch.int64)
        return torch.cat([start, prompt_ids, end], dim=1).to(self.device)

    def generate_codes(self, voice: str, text: str, settings: argparse.Namespace) -> list[int]:
        input_ids = self.build_prompt(voice, text)
        attention_mask = torch.ones_like(input_ids)

        with torch.inference_mode():
            generated = self.model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=settings.max_new_tokens,
                do_sample=True,
                temperature=settings.temperature,
                top_p=settings.top_p,
                repetition_penalty=settings.repetition_penalty,
                eos_token_id=END_OF_AUDIO,
            )

        sequence: list[int] = generated[0].tolist()
        audio_start = max((position for position, token in enumerate(sequence) if token == START_OF_AUDIO), default=-1)
        audio_ids = [token for token in sequence[audio_start + 1 :] if token != END_OF_AUDIO]

        codes: list[int] = []
        for position, token_text in enumerate(self.tokenizer.convert_ids_to_tokens(audio_ids)):
            match = CUSTOM_TOKEN_PATTERN.fullmatch(token_text)
            if match is None:
                break
            codes.append(int(match.group(1)) - AUDIO_TOKEN_OFFSET - (position % CODES_PER_FRAME) * CODEBOOK_SIZE)

        usable_length = len(codes) - (len(codes) % CODES_PER_FRAME)
        return codes[:usable_length]

    def decode_codes(self, codes: list[int]) -> np.ndarray:
        if not codes:
            raise RuntimeError("Orpheus hat keine Audio-Codes geliefert.")
        if any(code < 0 or code >= CODEBOOK_SIZE for code in codes):
            raise RuntimeError("Audio-Codes liegen ausserhalb des gueltigen Bereichs — die Generierung ist entgleist.")

        coarse: list[int] = []
        middle: list[int] = []
        fine: list[int] = []
        for frame_start in range(0, len(codes), CODES_PER_FRAME):
            frame = codes[frame_start : frame_start + CODES_PER_FRAME]
            coarse.append(frame[0])
            middle.extend([frame[1], frame[4]])
            fine.extend([frame[2], frame[3], frame[5], frame[6]])

        layers = [
            torch.tensor([coarse], dtype=torch.int32, device=self.device),
            torch.tensor([middle], dtype=torch.int32, device=self.device),
            torch.tensor([fine], dtype=torch.int32, device=self.device),
        ]
        with torch.inference_mode():
            waveform = self.snac.decode(layers)
        return waveform.squeeze().detach().float().cpu().numpy()

    def synthesize(self, text: str, casting: CastingEntry, settings: argparse.Namespace) -> tuple[np.ndarray, int]:
        codes = self.generate_codes(casting.voice, text, settings)
        samples = self.decode_codes(codes)
        if casting.speed != 1.0:
            samples = stretch(samples, casting.speed)
        return samples, SAMPLE_RATE


def stretch(samples: np.ndarray, speed: float) -> np.ndarray:
    """Grobes Tempo-Nachstellen durch Neuabtastung.

    Orpheus kennt keinen Tempo-Schalter. Das hier veraendert die Tonhoehe mit —
    unter etwa 0.9 oder ueber 1.1 klingt es nach Zeichentrick. Fuer feine
    Tempoarbeit lieber die Stimme wechseln.
    """
    if speed <= 0:
        raise ValueError("speed muss groesser als 0 sein.")
    target_length = int(len(samples) / speed)
    source_positions = np.linspace(0, len(samples) - 1, num=target_length)
    return np.interp(source_positions, np.arange(len(samples)), samples).astype(np.float32)


def run_probe(arguments: argparse.Namespace, engine: OrpheusEngine) -> int:
    """Dieselben Sätze mit mehreren Stimmnamen erzeugen, um sie zu vergleichen."""
    sentences = load_probe_lines(arguments.probe_text, arguments.probe_file)
    PROBE_FOLDER.mkdir(parents=True, exist_ok=True)

    for requested_name in arguments.probe_voices.split(","):
        requested_name = requested_name.strip()
        if not requested_name:
            continue

        # "-" steht fuer ein Modell ohne Stimmnamen (Ein-Stimmen-Modell).
        voice_name = "" if requested_name == "-" else requested_name
        label = requested_name if voice_name else "standard"

        print(f"\nStimme: {label}")
        casting = CastingEntry(engine=ENGINE_NAME, voice=voice_name, speed=1.0, language="de")
        for number, sentence in enumerate(sentences, start=1):
            target = PROBE_FOLDER / f"orpheus_{label}_{number:02d}.wav"
            if target.exists() and not arguments.force:
                print(f"  {number:02d} schon da")
                continue

            try:
                samples, sample_rate = engine.synthesize(sentence, casting, arguments)
                if not arguments.no_trim:
                    samples = trim_silence(samples, sample_rate)
            except RuntimeError as error:
                print(f"  {number:02d} FEHLER {error}")
                continue
            write_wav(target, samples, sample_rate)
            print(f"  {number:02d} {target.name}  ({sentence[:50]})")

    print(f"\nStimmproben liegen in {PROBE_FOLDER}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        parents=[build_common_parser()],
        description="Dialogzeilen mit Orpheus vertonen.",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL_ID, help="Modell auf Hugging Face")
    parser.add_argument("--device", default="cuda", help="cuda oder cpu (cpu ist quaelend langsam)")
    parser.add_argument("--load-4bit", action="store_true", help="Modell 4-bit quantisiert laden (kleinere Karten)")
    parser.add_argument("--temperature", type=float, default=0.6)
    parser.add_argument("--top-p", type=float, default=0.95)
    parser.add_argument("--repetition-penalty", type=float, default=1.1, help="Unter 1.1 faengt das Modell an zu stottern")
    parser.add_argument("--max-new-tokens", type=int, default=2000, help="Rund 85 Token je Sekunde Ton")
    parser.add_argument("--probe", action="store_true", help="Stimmprobe fahren statt zu vertonen")
    parser.add_argument("--probe-text", default=None, help="Nur diesen einen Satz proben statt der festen Batterie")
    parser.add_argument("--probe-file", type=Path, default=None, help="Andere Satzsammlung fuer die Probe")
    parser.add_argument("--probe-voices", default="Julian,Sophie,Jakob", help="Kommagetrennte Stimmnamen fuer die Stimmprobe")
    arguments = parser.parse_args()

    casting = load_casting(arguments.casting)
    lines: list[VoiceLine] = [] if arguments.probe else select_lines(arguments, ENGINE_NAME, casting)

    if not arguments.probe and not lines:
        print("Keine Dialogzeile passt zu dieser Auswahl.")
        return 0

    if arguments.dry_run and not arguments.probe:
        for line in lines:
            print(f"{line.label} [{casting_for(casting, line.character_id).voice}] {line.text[:60]}")
        return 0

    engine = OrpheusEngine(model_id=arguments.model, device=arguments.device, load_4bit=arguments.load_4bit)
    if arguments.probe:
        return run_probe(arguments, engine)

    extension = "mp3" if arguments.mp3 else "wav"
    produced_count = 0
    skipped_count = 0
    failed: list[str] = []
    produced_paths: dict[Path, dict[str, str]] = {}

    for line in lines:
        entry = casting_for(casting, line.character_id)
        target = audio_target(line, extension)

        if target.exists() and not arguments.force:
            skipped_count += 1
            produced_paths.setdefault(line.episode_file, {})[line.slot_key] = relative_audio_path(line, extension)
            continue

        print(f"{line.label} [{entry.voice}] {line.text[:60]}")
        try:
            samples, sample_rate = engine.synthesize(line.text, entry, arguments)
            if not arguments.no_trim:
                samples = trim_silence(samples, sample_rate)
            wav_target = audio_target(line, "wav")
            write_wav(wav_target, samples, sample_rate)
            if arguments.mp3:
                convert_to_mp3(wav_target)
        except Exception as error:  # eine kaputte Zeile darf den Stapel nicht stoppen
            failed.append(f"{line.label}: {error}")
            continue

        produced_count += 1
        produced_paths.setdefault(line.episode_file, {})[line.slot_key] = relative_audio_path(line, extension)

    changed_files = 0
    if not arguments.no_write_json:
        changed_files = write_audio_paths(produced_paths)

    report(produced_count, skipped_count, failed, changed_files)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
