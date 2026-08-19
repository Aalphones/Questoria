---
name: krea2-bilder
description: Hintergründe, Karten, Sammelkarten, Erfolgs-Icons und Bildantworten für Questoria lokal mit Krea 2 Turbo in ComfyUI erzeugen. TRIGGER wenn ein Szenen-Hintergrund, eine Planeten-/Etappen-/Ortskarte, ein Sammelkarten-Motiv oder -Rahmen, ein Erfolgs-Icon oder ein Bildantwort-Motiv gebraucht wird — auch bei "bild generieren", "hintergrund für welt X", "krea2", "comfyui". SKIP für Charakter-Sprites und alles mit Referenzbild oder Schrift im Bild (→ flux2-bilder) und für reine Prompt-Formulierung ohne Generierung.
---

# Krea 2 Turbo — Szenen, Karten, Motive

Krea 2 Turbo ist das Arbeitspferd für alles ohne Figur im Bild: Hintergründe, Karten, Sammelkarten, Bildantworten, Erfolgs-Icons. Es ist bis 2k trainiert, die Zielauflösungen passen ohne Hochskalieren, und die Lizenz ist permissiv.

Für Charakter-Sprites, Motive mit Referenzbild oder Schrift im Bild ist FLUX.2 klein zuständig → Skill `flux2-bilder`.

## Bevor du anfängst

ComfyUI Desktop muss laufen. Prüfen: `curl http://127.0.0.1:8188/system_stats` — antwortet das nicht, ComfyUI starten lassen, sonst geht nichts.

Ein Bild in 1920×1080 dauert rund zwei Minuten auf dieser Maschine. Das ist normal.

## Prompt schreiben

Krea 2 hängt nicht an CLIP, sondern an einem Sprachmodell (Qwen3-VL-4B). **Man schreibt Sätze, keine Tag-Listen.** Die vollständigen Regeln stehen in `data/_authoring/image-prompts/README.md`, die fertigen Vorlagen pro Bildtyp daneben:

| Bildtyp | Vorlage |
|---|---|
| Szenen-Hintergrund | `data/_authoring/image-prompts/BACKGROUNDS.md` |
| Planeten-, Etappen-, Ortskarte | `data/_authoring/image-prompts/MAPS.md` |
| Sammelkarte (Rahmen + Motiv) | `data/_authoring/image-prompts/CARDS.md` |
| Bildantwort für den Vorlesemodus | `data/_authoring/image-prompts/ANSWER_IMAGES.md` |
| Profil-Avatar | `data/_authoring/image-prompts/AVATARS.md` |

Die sechs Regeln, die am meisten ausmachen:

1. **Ein zusammenhängender Prosa-Absatz**, 60–200 Wörter. Unter 40 Wörtern verschenkst du das Modell.
2. **Reihenfolge:** Subjekt → Handlung → Szene → Stil → Licht → Kamera.
3. **Keine Negativ-Prompts.** Krea 2 fährt ohne Führung (Stärke 1.0), es gibt keinen Durchlauf, gegen den es wegsteuern könnte. Alles Unerwünschte **positiv umformulieren**: nicht „keine Menschen", sondern „der Steg liegt verlassen da, seine Planken leer".
4. **Material statt Oberbegriff** — „verwittertes Eichenholz mit ausgewaschener Maserung" schlägt „Holz" deutlich.
5. **Licht wie ein Fotograf beschreiben:** Quelle, Richtung, Charakter, Farbtemperatur.
6. **Qualitäts-Füllwörter weglassen.** `masterpiece`, `8k`, `award winning` bringen nichts.

Bei Hintergründen zusätzlich: **unten links und unten rechts ruhig und unverstellt halten** — dort stehen später die Sprites. Und alle Schilder ausdrücklich als leere Flächen beschreiben, Beschriftung macht die Engine.

## Erzeugen

Der Arbeitsablauf heißt `Krea2 Txt2Img` und liegt in der laufenden ComfyUI-Instanz, **nicht** im Repo. Immer über die Schnittstelle holen — im Installationsordner liegen veraltete Stände unter anderen Namen.

**Die entscheidende Eigenheit:** Der Ablauf steckt in einem Knotenpaket (Subgraph). Werte, die du am äußeren Paket-Knoten setzt, werden bei der Umwandlung in einen Auftrag **ignoriert**. Du musst die Knoten *im* Paket setzen. Verbindungen von außen wirken dagegen sehr wohl — deshalb kommt die Bildgröße vom `ResolutionSelector` auf der obersten Ebene und überschreibt, was im Paket steht.

Vorbereiten und starten:

```js
const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync('krea2.json', 'utf8'));
const paket = workflow.definitions.subgraphs[0];
const innen = (id) => paket.nodes.find((node) => String(node.id) === String(id));
const oben  = (id) => workflow.nodes.find((node) => String(node.id) === String(id));

innen(19).widgets_values[0] = '<der Prompt>';        // PrimitiveStringMultiline
innen(3).widgets_values[0]  = Math.floor(Math.random() * 1e15);  // KSampler: Startwert
innen(3).widgets_values[2]  = 8;                     // Schritte
innen(3).widgets_values[3]  = 1;                     // Führungsstärke
oben(49).widgets_values     = ['16:9 (Widescreen)', 1.98, 8];    // ResolutionSelector
```

```bash
comfy run --workflow krea2.json --wait --no-notify
```

Steht der MCP-Server `comfy` zur Verfügung, geht dasselbe über dessen Werkzeuge (`server_info`, `run_workflow`, `fetch_outputs`). Die Werkzeuge sind erst nach einem Sitzungs-Neustart da; ohne sie ist die Kommandozeile der Weg.

Knotennummern sind der Stand von August 2026. Weichen sie ab, **nach dem Knotentyp suchen, nicht nach der Nummer**.

## Werte, die belegt sind

| Einstellung | Wert |
|---|---|
| Schritte | **8** — mehr verbessert nichts, weniger kostet sichtbar Qualität |
| Führungsstärke | **1.0** (das Modell ist darauf destilliert; höher kocht das Bild über) |
| Sampler / Scheduler | Euler / Simple |
| Modell | `krea2_turbo-Q4_K_M.gguf` |
| Text-Encoder | `qwen3vl_4b_fp8_scaled.safetensors`, Typ `krea2` |
| VAE | `qwen_image_vae.safetensors` (die von Qwen-Image, keine Standard-VAE) |

Bildgrößen über den `ResolutionSelector`:

| Ziel | Seitenverhältnis | Megapixel | Ergebnis |
|---|---|---|---|
| Hintergrund 1920×1080 | `16:9 (Widescreen)` | `1.98` | exakt 1920×1080, gemessen |
| Sammelkarte 630×880 | `2:3 (Portrait Photo)` | gerechnet, ungeprüft | nachrechnen und nachmessen |

`1:1 (Square)` mit `2` gibt 1448×1448 — falls quadratische Bilder herauskommen, steht der Wähler noch auf dem alten Standard.

## Danach

Das Bild abholen (`http://127.0.0.1:8188/view?filename=…&subfolder=Krea2&type=output`) und **ansehen**. „Fertig" heißt nicht „brauchbar" — ein Blick aufs Bild ist Pflicht, bevor es als erledigt gilt.

Dann ins Zielformat bringen und ablegen. Die verbindlichen Vorgaben stehen in `data/_authoring/ASSET_REQUIREMENTS.md`:

| Typ | Format | Größe | Ablage |
|---|---|---|---|
| Hintergrund | `.webp` | 1920×1080 (16:9) | `data/themes/<welt>/backgrounds/<szene>.webp` |
| Karte | `.webp` | siehe Vorgaben | `data/themes/<welt>/maps/` |
| Sammelkarte | `.png` | 630×880 | `data/themes/<welt>/cards/karte_<id>.png` |
| Bildantwort | `.png` | siehe Vorgaben | `data/themes/<welt>/answers/antwort_<slug>.png` |
| Erfolgs-Icon | `.png` | 128×128 | `data/themes/<welt>/achievements/` |

`data/themes/` liegt auf Google Drive hinter einer Junction — Dateien dort landen automatisch im Backup, aber nicht in Git.

## Fallstricke

- **Dateinamen-Präfix ohne Doppelpunkt.** Windows macht aus allem nach einem Doppelpunkt einen versteckten Nebenstrom: der Ordner zeigt eine 0-Byte-Datei, der Zähler springt nie weiter, jeder Lauf überschreibt den vorherigen. Aktueller Präfix ist `Krea2/Krea2` und muss so bleiben.
- **Startwert immer neu setzen**, sonst liefert derselbe Prompt dasselbe Bild.
- **Bei Serien die Bilder nach jedem Lauf abholen**, statt sich auf die Nummerierung zu verlassen.

Volle Bedienungsanleitung inklusive Herleitung: `data/_authoring/image-prompts/GENERATING.md`.
