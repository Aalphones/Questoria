# Modelle & Einstellungen

Drei Wege, Questoria-Grafik zu erzeugen. Die Prompt-Grundregeln sind für alle
drei gleich ([README.md](README.md)) — die Zahlen unten sind es nicht.

## Welches Modell wofür

| Aufgabe | Empfehlung | Warum |
|---|---|---|
| Hintergründe, Karten | **Krea 2 Turbo** | bis 2k trainiert, unsere Zielauflösung passt ohne Hochskalieren; permissive Lizenz |
| Charakter-Sprites | **FLUX.2 klein 9B** | nimmt bis zu 3 Referenzbilder — der einzige verlässliche Weg zu einem konsistenten Emotionsset |
| Sammelkarten-Rahmen | **Krea 2 Turbo** | Ornamentik und saubere Kanten; Lizenz unkritisch, falls Karten je gedruckt/verkauft werden |
| Bildantworten | **Krea 2 Turbo** | einfache, eindeutige Einzelmotive, schnell in Serie |
| Text im Bild | **FLUX.2 klein** oder ChatGPT | rendern Schrift deutlich zuverlässiger |
| Bestehendes Bild gezielt ändern | **ChatGPT** | Änderungswünsche im Dialog, ohne Maskerei |
| Fandom-Figuren | **nur lokal** | ChatGPT lehnt geschützte Charaktere in der Regel ab |

---

## FLUX.2 klein 9B (lokal, ComfyUI)

Setup: `flux-2-klein-9b-Q4_K_M.gguf` + `qwen_3_8b_fp8mixed.safetensors`
(Text-Encoder) + `flux2-vae.safetensors`.

| | **klein 9B (distilled)** | **klein base 9B** |
|---|---|---|
| Steps | **4** (fix) | 20–30 |
| CFG | **1.0** | 3.5–5.0 |
| Sampler / Scheduler | Euler / Simple | Euler / Simple |

- Auflösung: Minimum **768 px** pro Kante, Sweet Spot **1024–1536 px**.
- **Referenzbilder: maximal 3** (Grenze des Zwischenspeichers).
- Encoder muss zur Modellgröße passen: 9B → Qwen3-8B, 4B → Qwen3-4B. Kreuzweise
  gibt es Shape-Mismatch-Fehler.
- GGUF nach `models/unet/`, geladen über den **Unet-Loader der
  ComfyUI-GGUF-Node** — nicht über den normalen Diffusion-Model-Loader.
  Encoder nach `models/text_encoders/`.
- Bei Sampling-Fehlern: Vorschau-Methode in ComfyUI auf „none" stellen.
- **FLUX.1-LoRAs sind inkompatibel** (andere Architektur).
- **Lizenz: nicht-kommerziell** (klein 4B wäre Apache 2.0).

## Krea 2 Turbo (lokal, ComfyUI)

Setup: `krea2_turbo_*Q4_K_M.gguf` + `qwen3vl_4b_fp8_scaled.safetensors`
(Text-Encoder) + `qwen_image_vae.safetensors`.

| | **Turbo (distilled)** | **RAW (base)** |
|---|---|---|
| Steps | **8** (6–10 möglich, 8 ist der Punkt) | 52 |
| CFG | **1.0** | 3.0–3.5 |
| Sampler / Scheduler | Euler / Simple | Euler / Simple |
| Denoise | 1.0 | 1.0 |
| Timestep-Shift (mu) | 1.15 | — |

- Auflösung: **1024–2048 px**, offizielle Beispiele sind 2k. RAW nur bis ~1k.
- **Mehr Steps helfen nicht** — Turbo ist auf niedrige Step-Zahl destilliert,
  höhere Werte und CFG > 1.0 kochen das Bild über.
- **CLIPLoader braucht Typ `krea2`** (nativ ab ComfyUI ≥ v0.26.0).
- VAE ist die von Qwen-Image, keine Standard-VAE.
- 🟡 Der Standard-GGUF-Node kennt den `krea2`-Architektur-Tag je nach Build
  nicht und wirft einen Fehler — dann den gepatchten Fork
  `RealRebelAI/ComfyUI-GGUF_KREA-2` installieren.
- Zum Wegdrücken einzelner Bildinhalte gibt es die Community-Node
  `ComfyUI-krea2-negpip` (erlaubt negative Gewichte ohne Guidance). Ohne sie:
  ins Positive umformulieren.
- Lizenz: Community-Lizenz, permissive Nutzung. 🟡 Vor kommerzieller Nutzung
  selbst lesen — „permissiv" ist Marketing, kein Rechtsbegriff.

## ChatGPT / GPT Image (OpenAI, Chat oder API)

Aktuelles Modell ist **`gpt-image-2`** (seit April 2026). Es gibt keine Steps,
kein CFG, keinen Seed, keinen Sampler und kein Negativfeld — du redest mit dem
Modell.

**Der Prompt sieht hier anders aus als bei den lokalen Modellen.** OpenAI
empfiehlt ausdrücklich **gegliederte Prompts mit kurzen beschrifteten
Abschnitten oder Zeilenumbrüchen**, nicht den einen Prosa-Absatz:

```
Szene:      A deserted harbour dock at late afternoon, wooden planks, moored
            fishing boats, a windmill village on the far shore.
Stil:       Anime-inspired painterly illustration, soft cel-shading, clean
            linework, warm saturated palette.
Licht:      Low warm sun from the left, long soft shadows, golden hour.
Komposition: Wide eye-level framing. The lower left and lower right thirds stay
            calm and uncluttered for figures placed later. All sign boards blank.
```

Auch minimal, JSON oder Tag-Listen funktionieren — entscheidend ist eindeutige
Absicht, nicht die Form.

- **Auflösung:** längste Kante ≤ 3840 px, **beide Kanten Vielfache von 16**,
  Seitenverhältnis höchstens 3:1. **Natives 16:9 gibt es** — 2048×1152 ist die
  passende Größe für unsere Hintergründe. Verlässlich bis 2560×1440; darüber
  (4K) ist Beta-Gebiet.
- **Qualitätsstufe:** `low` / `medium` / `high`. Für kleinen Text und dichte
  Details `high`.
- **Schrift im Bild ist die Kernstärke** — exakte Wortfolge in
  Anführungszeichen oder GROSSBUCHSTABEN, Typografie dazusagen, schwierige
  Wörter buchstabenweise ausschreiben.
- **Kein transparenter Hintergrund.** Die Ausgabe ist deckend, OpenAI empfiehlt
  selbst einen nachgelagerten Freistell-Schritt. Für Sprites also derselbe Weg
  wie lokal: einfarbig generieren, dann freistellen ([SPRITES.md](SPRITES.md)).
- **Bestehende Bilder ändern:** Bild plus Anweisung reicht — dabei **explizit
  sagen, was unverändert bleiben soll**, sonst driftet der Rest. Maskiertes
  Bearbeiten geht ebenfalls (Maske gleiches Format und gleiche Größe wie das
  Bild, mit Alphakanal).
- **Referenzbilder:** mehrere möglich, jedes **per Index benennen** — „Image 1:
  Charakterreferenz … Image 2: Stilreferenz …" — und dazusagen, wie sie
  zusammenwirken.
- **Nachschärfen in kleinen Einzelschritten.** Ein sauberer Basis-Prompt, dann
  je Runde genau eine Änderung. Alles auf einmal ändern macht die Ursache
  unauffindbar.
- **Schwächen:** Physik und Statik, technische Diagramme, Nahaufnahmen von
  Gesichtern, Text auf gekrümmten Flächen.
- **Inhaltsfilter:** Geschützte Charaktere werden per Policy abgelehnt — die
  Durchsetzung ist löchrig, aber unvorhersehbar. **Auf Fandom-Sprites lässt
  sich hiermit keine Pipeline bauen**; dafür lokale Modelle. Dass ein Prompt
  durchkommt, ist außerdem keine Aussage über die Rechtslage am Motiv.

---

## Auflösungs-Matrix — was du eingibst, damit hinten das Richtige rauskommt

Die Zielformate stehen in [ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md).
**Nie in Zielgröße generieren, wenn die unter dem Modell-Minimum liegt** —
das gilt besonders für Karten.

| Asset | Ziel | FLUX.2 klein | Krea 2 Turbo | GPT Image 2 |
|---|---|---|---|---|
| Hintergrund | 1920×1080 | 1536×864, dann hochskalieren | **1920×1080 direkt** | 2048×1152, dann verkleinern |
| Map | 1920×1080 | 1536×864, dann hochskalieren | **1920×1080 direkt** | 2048×1152, dann verkleinern |
| Sprite | ~1024×1536 | **1024×1536 direkt** | 1024×1536 direkt | 1024×1536 direkt |
| Karte / Rahmen | 630×880 | **1024×1432, dann verkleinern** | 1024×1432, dann verkleinern | 1024×1440, dann verkleinern |

Warum Karten nicht in 630×880 generiert werden: das liegt unter dem
768-px-Minimum von FLUX.2 klein und bei Krea am unteren Rand des trainierten
Bandes. Verkleinern schadet nie, Vergrößern immer.

Warum bei GPT Image 1024×1440 statt 1024×1432: **beide Kantenlängen müssen
Vielfache von 16 sein.** 1432 ist keins, der Request fliegt raus. 1440 ergibt
0,711 statt 0,716 Seitenverhältnis — knapp 1 % Beschnitt, unkritisch.

---

## Was hier nicht belegt ist

- **Img2Img-Werte.** Die alte Library nannte Denoising-Stärken (0.3–0.65) aus
  der FLUX.1-Zeit. Für FLUX.2 klein und Krea 2 Turbo sind diese Werte **nicht
  überprüft** — beide sind auf sehr wenige Steps destilliert, was das Verhalten
  bei Teil-Denoising verändert. Wer sie nutzt: tastend anfangen und den Wert,
  der funktioniert, hier eintragen.
- **Qualitätsverlust der Q4-Quantisierung** gegenüber Q8 ist für beide Modelle
  nicht belegt.
- **Seed-Konsistenz über ein Emotionsset** ist plausibel, aber nicht gemessen.
  Der belastbare Weg ist das Referenzbild, nicht der Seed.

## Quellen

- FLUX.2 klein Modelcard — <https://huggingface.co/black-forest-labs/FLUX.2-klein-9B>
- FLUX.2 Prompting-Analyse — <https://deapi.ai/blog/prompting-flux-2-klein-what-works-what-doesnt-and-why>
- FLUX.2 ComfyUI-Doku — <https://docs.comfy.org/tutorials/flux/flux-2-klein>
- Krea 2 Repo (Settings, Lizenz) — <https://github.com/krea-ai/krea-2>
- Krea 2 Prompting-Doku — <https://github.com/krea-ai/krea-2/blob/main/docs/prompting.md>
- Krea 2 ComfyUI-Guide — <https://comfylab.dev/blog/guides-pro/krea-2-comfyui-guide-turbo-model/>
- Gewichtung/NegPiP — <https://github.com/blue-pen5805/ComfyUI-krea2-negpip>
