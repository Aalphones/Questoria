---
name: flux2-bilder
description: Charakter-Sprites (inkl. vollständigem Emotionsset), Motive mit Referenzbild, Motive mit Schrift im Bild und gezielte Bildänderungen für Questoria lokal mit FLUX.2 klein 9B in ComfyUI erzeugen. TRIGGER wenn ein Sprite, ein Emotionsset, ein konsistenter Charakter über mehrere Bilder, eine Bildbearbeitung oder Text im Bild gebraucht wird — auch bei "sprite generieren", "charakter für welt X", "flux", "bild ändern". SKIP für Hintergründe, Karten, Sammelkarten und Bildantworten (→ krea2-bilder) und für reine Prompt-Formulierung ohne Generierung.
---

# FLUX.2 klein 9B — Sprites, Referenzbilder, Bildänderung

FLUX.2 klein 9B ist das einzige lokale Modell, das **bis zu drei Referenzbilder** nimmt. Genau das ist der verlässliche Weg zu einem konsistenten Emotionsset: dieselbe Figur viermal, nur mit anderem Gesichtsausdruck. Außerdem rendert es Schrift deutlich zuverlässiger als Krea 2.

Für Hintergründe, Karten und Sammelkarten ist Krea 2 Turbo zuständig → Skill `krea2-bilder`.

🟡 **Lizenz: nicht-kommerziell.** Für Questoria (privater Nutzerkreis) unkritisch, aber es ist ein Unterschied zu Krea 2.

## Bevor du anfängst

ComfyUI Desktop muss laufen. Prüfen: `curl http://127.0.0.1:8188/system_stats` — antwortet das nicht, ComfyUI starten lassen.

`Flux2 Txt2Img` ist am 19.08.2026 mit acht Sprites durchgelaufen, die Knotennummern unten stimmen. 🟡 `Flux Edit` dagegen ist eingerichtet, aber **noch nie gelaufen** — dessen Nummern stammen aus der Datei, nicht aus einem Lauf.

**Zwei Dinge, an denen der erste Versuch scheiterte:**

1. **Ohne Referenzbild läuft gar nichts.** Der Ablauf ist im Kern ein Bearbeitungs-Paket: der Skalier-Knoten 717 verlangt ein Bild, und der Server lehnt den Auftrag sonst ab, bevor er rechnet (`required input 'image' is missing`). Ein `LoadImage`-Knoten auf oberster Ebene muss an Eingang **4** (`reference_image1`) des Paket-Knotens 731 hängen. Reines Erzeugen ohne Vorlage kann dieser Ablauf nicht.
2. **Der Server sieht nur die oberste Ebene des Eingangsordners.** Was in einem Unterordner von `F:\Comfy-Desktop\ComfyUI-Shared\input\` liegt, taucht in der Auswahl von `LoadImage` nicht auf — auch nicht als `unterordner/datei.png`. Referenzbilder direkt in den Ordner legen.

Auflösung: `2:3 (Portrait Photo)` mit `1.57` ergibt **1040×1568**, nah genug an den geforderten 1024×1536.

## Was der Skill baut

Ein Charakter braucht **alle vier Emotionen** `neutral`, `happy`, `worried`, `angry`. Fehlt eine, bleibt die Figur bei der falschen Dialogzeile stumm oder die Szene bricht. Das ist keine Kür.

Der Weg zum konsistenten Set:

1. **`neutral` zuerst** erzeugen, ohne Referenzbild. So lange wiederholen, bis die Figur wirklich sitzt — dieses Bild ist der Anker für alle weiteren.
2. Das fertige `neutral`-Bild in den Eingabeordner legen: `F:\Comfy-Desktop\ComfyUI-Shared\input\`.
3. Die drei übrigen Emotionen **mit dem `neutral`-Bild als Referenz** erzeugen, im Prompt nur den Ausdruckssatz austauschen. Alles andere im Prompt bleibt wortgleich — jede Abweichung verschiebt Kleidung oder Gesicht.

## Prompt schreiben

FLUX.2 klein hängt an einem Sprachmodell (Qwen3-8B), nicht an CLIP. **Sätze, keine Tag-Listen.** Die vollständige Vorlage samt ausgefülltem Beispiel steht in `data/_authoring/image-prompts/SPRITES.md`, die allgemeinen Regeln in `data/_authoring/image-prompts/README.md`.

**Der Stil kommt aus der Welt, nicht aus deinem Kopf.** Jede Welt trägt in `data/themes/<welt>/world_config.json` ein Feld `art_style` — einen englischen Satz. Der wird **wörtlich** in den Prompt übernommen, bei jedem Bild derselben Welt dieselbe Zeichenfolge. Bei einem Emotionsset ist das doppelt wichtig: schon eine umformulierte Stilzeile lässt die Figur zwischen zwei Bildern anders aussehen.

Das Wichtigste:

1. **Ein zusammenhängender Prosa-Absatz**, 60–200 Wörter, Reihenfolge Subjekt → Handlung → Szene → Stil → Licht → Kamera.
2. **Keine Negativ-Prompts.** Der Ablauf hat zwar ein Negativfeld, es läuft aber mit Führungsstärke 1.0 — der Text darin wird schlicht nicht verrechnet. Alles Unerwünschte positiv formulieren.
3. **Die ganze Figur muss ins Bild.** Ausdrücklich schreiben, dass sie von Kopf bis Fuß hineinpasst, mit Rand oben und unten — sonst schneidet das Modell Füße oder Scheitel ab.
4. **Hintergrundfarbe wählen, die nicht in der Kleidung vorkommt.** Sonst frisst das spätere Freistellen Löcher in die Figur. `mid grey` ist der sichere Standard, `pure chroma green` nur bei Figuren ohne Grünanteil.
5. **Attribute beim Subjekt gruppieren** — alles zu einer Figur in einem Zug, nicht über den Text verstreut.
6. **Nichts dazuerfinden.** Kleidung, Requisiten und Farben, die nicht gefordert sind, verschieben das Ergebnis.

🟡 Für Fandom-Figuren zwingend lokal arbeiten — GPT Image lehnt geschützte Charaktere unvorhersehbar ab.

## Erzeugen

Zwei Abläufe, beide in der laufenden ComfyUI-Instanz (**nicht** im Repo, immer über die Schnittstelle holen — im Installationsordner liegen veraltete Stände):

| Ablauf | Wofür |
|---|---|
| `Flux2 Txt2Img` | neues Bild, optional mit Referenzbild |
| `Flux Edit` | ein bestehendes Bild gezielt ändern; Ausgangsbild als `LoadImage` auf oberster Ebene (Knoten 81) |

**Die entscheidende Eigenheit:** Der Ablauf steckt in einem Knotenpaket (Subgraph) namens „Image Edit (Flux.2 Klein 9B)". Werte, die du am äußeren Paket-Knoten setzt, werden bei der Umwandlung in einen Auftrag **ignoriert**. Du musst die Knoten *im* Paket setzen. Verbindungen von außen wirken dagegen — deshalb überschreibt der `ResolutionSelector` auf oberster Ebene die Größe aus dem Paket.

Die Knoten im Paket (Stand August 2026 — bei Abweichung nach dem Knotentyp suchen, nicht nach der Nummer):

| Knoten | Typ | Enthält |
|---|---|---|
| 720 | `CLIPTextEncode` | **der Prompt** |
| 721 | `CLIPTextEncode` | Negativ-Text, wirkungslos bei Führungsstärke 1.0 |
| 715 | `RandomNoise` | Startwert |
| 726 | `Flux2Scheduler` | Schrittzahl und Bezugsgröße |
| 717 | `ImageScaleToTotalPixels` | Zielgröße in Megapixeln |
| 919 | `UnetLoaderGGUF` | das Modell |

```js
const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync('flux2.json', 'utf8'));
const paket = workflow.definitions.subgraphs.find((sub) => sub.name.startsWith('Image Edit'));
const innen = (id) => paket.nodes.find((node) => String(node.id) === String(id));

innen(720).widgets_values[0] = '<der Prompt>';
innen(715).widgets_values[0] = Math.floor(Math.random() * 1e15);
```

```bash
comfy run --workflow flux2.json --wait --timeout 300 --no-notify
```

**`--timeout 300` ist Pflicht.** Der Standard sind 120 Sekunden und liegt auf der Kante — ohne den Wert bricht das Warten mitten im Rendern ab. Der Auftrag läuft trotzdem weiter und lässt sich über `GET /history/<prompt_id>` abholen. Kommt gar nichts, erst in die Warteschlange sehen (`GET /queue`): arbeitet jemand parallel in der ComfyUI-Oberfläche, warten die eigenen Aufträge hinter seinen.

Steht der MCP-Server `comfy` zur Verfügung, geht dasselbe über dessen Werkzeuge. Sie sind erst nach einem Sitzungs-Neustart da; ohne sie ist die Kommandozeile der Weg.

## Werte

| Einstellung | Wert |
|---|---|
| Schritte | **4** (destillierte Fassung, fest) |
| Führungsstärke | **1.0** |
| Sampler | Euler |
| Modell | `flux-2-klein-9b-Q4_K_M.gguf` |
| Text-Encoder | `qwen_3_8b_fp8mixed.safetensors`, Typ `flux2` |
| VAE | `flux2-vae.safetensors` |
| Auflösung | Minimum 768 px pro Kante, Sweet Spot 1024–1536 px |
| Referenzbilder | **maximal 3** (Grenze des Zwischenspeichers) |

Der Encoder muss zur Modellgröße passen: 9B braucht Qwen3-8B. Kreuzweise gibt es Fehler wegen unpassender Formen. **FLUX.1-LoRAs sind inkompatibel** — andere Architektur.

Bei Sampling-Fehlern die Vorschau-Methode in ComfyUI auf „none" stellen.

## Danach

Bild abholen (`http://127.0.0.1:8188/view?filename=…&subfolder=Flux2&type=output`) und **ansehen**. Bei Sprites besonders auf Hände, Gesicht und darauf achten, dass die Figur vollständig im Bild steht.

Dann freistellen — das Sprite braucht einen echten Alphakanal, der flache Hintergrund muss weg. Dafür gibt es zwei Werkzeuge, **in dieser Reihenfolge**:

```bat
:: 1. Hintergrund entfernen und auf die Figur zuschneiden
data\_authoring\image-tools\.venv\Scripts\python.exe data\_authoring\image-tools\cutout.py roh.png --out zwischen.png --trim

:: 2. auf die Zielgröße bringen
data\_authoring\image-tools\.venv\Scripts\python.exe data\_authoring\image-tools\format_assets.py zwischen.png --out data\themes\<welt>\sprites\<character_id>\<character_id>_<emotion>.png
```

Erst freistellen, dann formatieren — andersherum schneidet die Formatierung an einem Rand herum, der gleich wegfällt. Das Freistellen nutzt ein auf gezeichnete Figuren trainiertes Modell und meldet, wie viel Prozent des Bildes am Ende Figur sind; unter 5 % oder über 95 % ist etwas schiefgelaufen. Details: `data/_authoring/image-tools/README.md`.

Zielgröße rund 1024×1536 (2:3 hoch), Format `.png` mit Transparenz. Vollständige Vorgaben: `data/_authoring/ASSET_REQUIREMENTS.md`.

`data/themes/` liegt auf Google Drive hinter einer Junction — Dateien dort landen im Backup, aber nicht in Git.

## Fallstricke

- **Dateinamen-Präfix ohne Doppelpunkt.** Windows macht aus allem nach einem Doppelpunkt einen versteckten Nebenstrom: 0-Byte-Datei im Ordner, Zähler springt nie weiter, jeder Lauf überschreibt den vorherigen. Präfixe sind `Flux2/Flux2` und `FluxEdit/FluxEdit` und müssen getrennt bleiben — teilen sie sich einen Namen, überschreiben sich die beiden Abläufe gegenseitig.
- **Referenzbild muss im Eingabeordner liegen**, bevor der Lauf startet: `F:\Comfy-Desktop\ComfyUI-Shared\input\`.
- **Prompt zwischen den Emotionen nur am Ausdruckssatz ändern.** Jede weitere Abweichung bricht die Konsistenz des Sets.
- **Startwert immer neu setzen**, sonst kommt dasselbe Bild.

Volle Bedienungsanleitung inklusive Herleitung: `data/_authoring/image-prompts/GENERATING.md`.
