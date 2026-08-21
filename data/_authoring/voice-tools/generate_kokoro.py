"""Stapelvertonung mit Kokoro — das schnelle Arbeitspferd.

Aufruf (Beispiele):
    python generate_kokoro.py --theme one_piece --dry-run
    python generate_kokoro.py --theme one_piece
    python generate_kokoro.py --backend http --endpoint http://localhost:8881
    python generate_kokoro.py --probe --probe-voices af_heart

Zwei Wege, dasselbe Modell zu fahren:

* `--backend torch` (Standard) spricht die offizielle `kokoro`-Bibliothek an.
  Deren Stimmen decken Englisch, Franzoesisch, Japanisch, Mandarin, Spanisch,
  Hindi, Italienisch und brasilianisches Portugiesisch ab — **kein Deutsch**.
* `--backend http` spricht einen lokal laufenden Kokoro-Server ueber die
  OpenAI-kompatible Schnittstelle an. Das ist der Weg zur deutschen
  Gemeinschafts-Stimme, siehe README.md.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

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

ENGINE_NAME = "kokoro"
TORCH_SAMPLE_RATE = 24_000
HTTP_TIMEOUT_SECONDS = 120


def to_numpy(chunk: Any) -> np.ndarray:
    """Kokoro liefert je nach Version einen Torch-Tensor oder ein numpy-Array."""
    if hasattr(chunk, "detach"):
        return chunk.detach().cpu().numpy()
    return np.asarray(chunk, dtype=np.float32)


class TorchBackend:
    """Die offizielle kokoro-Bibliothek, lokal auf der Grafikkarte."""

    def __init__(self) -> None:
        from kokoro import KPipeline  # lokaler Import: nur dieser Backend braucht die Abhaengigkeit

        self.pipeline_class = KPipeline
        self.pipelines: dict[str, Any] = {}

    def pipeline_for(self, language: str) -> Any:
        if language not in self.pipelines:
            self.pipelines[language] = self.pipeline_class(lang_code=language)
        return self.pipelines[language]

    def synthesize(self, text: str, casting: CastingEntry) -> tuple[np.ndarray, int]:
        pipeline = self.pipeline_for(casting.language)
        chunks = [to_numpy(audio) for _, _, audio in pipeline(text, voice=casting.voice, speed=casting.speed)]
        if not chunks:
            raise RuntimeError("Kokoro hat keine Audiodaten geliefert.")
        return np.concatenate(chunks), TORCH_SAMPLE_RATE


class HttpBackend:
    """Ein lokal laufender Kokoro-Server mit OpenAI-kompatibler Schnittstelle."""

    def __init__(self, endpoint: str, model_name: str) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.model_name = model_name

    def synthesize(self, text: str, casting: CastingEntry) -> tuple[np.ndarray, int]:
        payload = {
            "model": self.model_name,
            "input": text,
            "voice": casting.voice,
            "speed": casting.speed,
            "response_format": "wav",
        }
        request = urllib.request.Request(
            f"{self.endpoint}/v1/audio/speech",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
                audio_bytes = response.read()
        except urllib.error.URLError as error:
            raise RuntimeError(f"Kokoro-Server unter {self.endpoint} antwortet nicht: {error}") from error

        samples, sample_rate = sf.read(io.BytesIO(audio_bytes), dtype="float32")
        return samples, int(sample_rate)


def build_backend(arguments: argparse.Namespace) -> TorchBackend | HttpBackend:
    if arguments.backend == "http":
        return HttpBackend(endpoint=arguments.endpoint, model_name=arguments.model)
    return TorchBackend()


def run_probe(arguments: argparse.Namespace, backend: TorchBackend | HttpBackend) -> int:
    """Dieselben Sätze mit mehreren Stimmen erzeugen, damit man sie vergleichen kann."""
    sentences = load_probe_lines(arguments.probe_text, arguments.probe_file)
    PROBE_FOLDER.mkdir(parents=True, exist_ok=True)

    for voice_name in arguments.probe_voices.split(","):
        voice_name = voice_name.strip()
        if not voice_name:
            continue

        print(f"\nStimme: {voice_name}")
        casting = CastingEntry(engine=ENGINE_NAME, voice=voice_name, speed=1.0, language=arguments.probe_language)
        for number, sentence in enumerate(sentences, start=1):
            try:
                samples, sample_rate = backend.synthesize(sentence, casting)
                if not arguments.no_trim:
                    samples = trim_silence(samples, sample_rate)
            except RuntimeError as error:
                print(f"  {number:02d} FEHLER {error}")
                continue
            target = PROBE_FOLDER / f"kokoro_{voice_name}_{number:02d}.wav"
            write_wav(target, samples, sample_rate)
            print(f"  {number:02d} {target.name}  ({sentence[:50]})")

    print(f"\nStimmproben liegen in {PROBE_FOLDER}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        parents=[build_common_parser()],
        description="Dialogzeilen mit Kokoro vertonen.",
    )
    parser.add_argument("--backend", choices=("torch", "http"), default="torch", help="Wie Kokoro angesprochen wird")
    parser.add_argument("--endpoint", default="http://localhost:8880", help="Adresse des Kokoro-Servers (nur --backend http)")
    parser.add_argument("--model", default="kokoro", help="Modellname, den der Server erwartet (nur --backend http)")
    parser.add_argument("--probe", action="store_true", help="Stimmprobe fahren statt zu vertonen")
    parser.add_argument("--probe-text", default=None, help="Nur diesen einen Satz proben statt der festen Batterie")
    parser.add_argument("--probe-file", type=Path, default=None, help="Andere Satzsammlung fuer die Probe")
    parser.add_argument("--probe-voices", default="af_heart", help="Kommagetrennte Stimmnamen fuer die Stimmprobe")
    parser.add_argument("--probe-language", default="a", help="Sprachkuerzel fuer die Stimmprobe (nur --backend torch)")
    arguments = parser.parse_args()

    backend = build_backend(arguments)
    if arguments.probe:
        return run_probe(arguments, backend)

    casting = load_casting(arguments.casting)
    lines: list[VoiceLine] = select_lines(arguments, ENGINE_NAME, casting)
    if not lines:
        print("Keine Dialogzeile passt zu dieser Auswahl.")
        return 0

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
        if arguments.dry_run:
            continue

        try:
            samples, sample_rate = backend.synthesize(line.text, entry)
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
    if not arguments.dry_run and not arguments.no_write_json:
        changed_files = write_audio_paths(produced_paths)

    report(produced_count, skipped_count, failed, changed_files)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
