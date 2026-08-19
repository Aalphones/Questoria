# Bilder erzeugen — lokale ComfyUI-Anbindung

Wie aus einem Prompt aus dieser Werkstatt tatsächlich eine Datei wird. Die Prompt-Vorlagen stehen in den Nachbardateien ([README.md](README.md)), die Modellwerte in [MODEL_SETTINGS.md](MODEL_SETTINGS.md), die Nachbearbeitung in [../image-tools/README.md](../image-tools/README.md) — hier steht die Bedienung der Bildmaschine.

**Der Stil ist keine Prompt-Entscheidung.** Er steht als `art_style` in `world_config.json` der jeweiligen Welt und wird wörtlich übernommen (Schema Abschnitt 2, Critical Rule 9 in `AGENTS.md`).

**Ein Agent kann Bilder selbst erzeugen.** Dafür ist ein MCP-Server namens `comfy` eingerichtet, der die lokal laufende ComfyUI-Installation fernsteuert.

---

## Voraussetzungen

| Was | Stand |
|---|---|
| ComfyUI Desktop läuft und antwortet auf `http://127.0.0.1:8188` | muss vorher gestartet sein |
| MCP-Server `comfy` (offizielles `comfy-mcp` von Comfy Org) | auf Nutzerebene registriert, gilt für alle Projekte |
| Unterbau `comfy-cli` | in einer eigenen uv-Umgebung, greift die Desktop-Installation nicht an |

Läuft ComfyUI nicht, meldet der Server das sofort — dann Comfy Desktop starten, sonst geht nichts. Prüfen lässt sich das ohne den Server auch direkt: `curl http://127.0.0.1:8188/system_stats`.

Die Werkzeuge des Servers stehen erst **nach einem Neustart der Sitzung** zur Verfügung. Ohne sie geht derselbe Weg über die Kommandozeile: `comfy run --workflow <datei.json> --wait --no-notify`.

Grafikkarte: RTX 3060 mit 12 GB. Ein Hintergrund in 1920×1080 braucht rund **zwei Minuten**. Das ist normal, nicht hängengeblieben.

🟡 **Immer `--timeout 300` mitgeben.** Der Standard sind 120 Sekunden und liegt damit genau auf der Kante — gemessene Läufe brauchen 102 bis 131 Sekunden. Ohne den Wert bricht die Wartezeit mitten im Rendern ab.

🟡 **Die Bildmaschine ist eine geteilte Ressource.** Arbeitet jemand parallel in der ComfyUI-Oberfläche, stehen die Aufträge in einer gemeinsamen Warteschlange und die eigenen warten. Ein scheinbarer Timeout ist deshalb oft nur ein besetzter Platz. Vor der Fehlersuche in die Warteschlange sehen:

```
GET  http://127.0.0.1:8188/queue                       (läuft / wartet)
POST http://127.0.0.1:8188/queue  {"delete":["<id>"]}  (eigenen Auftrag zurückziehen)
```

Ein abgebrochenes Warten **storniert den Auftrag nicht** — er läuft weiter und landet in der Historie. Das Ergebnis lässt sich über `GET /history/<prompt_id>` nachträglich abholen, statt neu zu rendern.

---

## Die drei Arbeitsabläufe

Sie liegen **in der laufenden ComfyUI-Instanz**, nicht im Repo:

| Name | Modell | Wofür |
|---|---|---|
| `Krea2 Txt2Img` | Krea 2 Turbo | Hintergründe, Karten, Sammelkarten, Bildantworten |
| `Flux2 Txt2Img` | FLUX.2 klein 9B | Sprites, Motive mit Schrift im Bild, Referenzbild-gestützte Motive |
| `Flux Edit` | FLUX.2 klein 9B | ein bestehendes Bild gezielt ändern |

**Immer über die Schnittstelle holen, nie von der Festplatte lesen.** Im Installationsordner liegen ältere Stände unter abweichenden Namen — wer die nimmt, arbeitet mit einer veralteten Fassung:

```
GET  http://127.0.0.1:8188/userdata?dir=workflows&recurse=true&split=false
GET  http://127.0.0.1:8188/userdata/workflows%2FKrea2%20Txt2Img.json
POST http://127.0.0.1:8188/userdata/workflows%2F...json?overwrite=true
```

Fertige Bilder landen unter `F:\Comfy-Desktop\ComfyUI-Shared\output\<Präfix>\` und lassen sich über `http://127.0.0.1:8188/view?filename=…&subfolder=…&type=output` abholen.

---

## Drei Fallen, die Zeit kosten

### 1. Werte am äußeren Knoten wirken nicht

Alle drei Abläufe stecken in einem **Subgraph** — einem zusammengefassten Knotenpaket. Das Paket zeigt nach außen Felder für Prompt, Modell, Größe und Schrittzahl. Diese äußeren Felder werden bei der Umwandlung in einen Auftrag **ignoriert**; verwendet werden die Werte der Knoten *im* Paket.

Praktische Folge: Wer den Prompt in das äußere Feld schreibt, rendert stumm den alten Prompt. **Immer die inneren Knoten setzen.**

Was das trifft und was nicht:

| | wirkt |
|---|---|
| Feld am äußeren Paket-Knoten | ❌ nein |
| Feld an einem Knoten *im* Paket | ✅ ja |
| Verbindung von einem Knoten außerhalb ins Paket | ✅ ja |

Die inneren Knoten (Stand August 2026 — bei Abweichung nach dem Knotentyp suchen, nicht nach der Nummer):

**`Krea2 Txt2Img`**

| Knoten | Typ | Enthält |
|---|---|---|
| 19 | `PrimitiveStringMultiline` | **der Prompt** |
| 3 | `KSampler` | Startwert, Schrittzahl, Führungsstärke |
| 57 | `UnetLoaderGGUF` | das Modell |
| 5 | `EmptyLatentImage` | Größe — wird von außen überschrieben, siehe unten |

**`Flux2 Txt2Img` und `Flux Edit`** (beide nutzen dasselbe Paket „Image Edit (Flux.2 Klein 9B)")

| Knoten | Typ | Enthält |
|---|---|---|
| 720 | `CLIPTextEncode` | **der Prompt** |
| 721 | `CLIPTextEncode` | Negativ-Text — wirkungslos bei Führungsstärke 1.0, siehe [README.md](README.md) |
| 715 | `RandomNoise` | Startwert |
| 726 | `Flux2Scheduler` | Schrittzahl (Standard 4) und Bezugsgröße |
| 717 | `ImageScaleToTotalPixels` | Zielgröße in Megapixeln |
| 919 | `UnetLoaderGGUF` | das Modell |

Bei `Flux Edit` liegt das Ausgangsbild als `LoadImage` (Knoten 81) auf der obersten Ebene. Die Datei muss vorher im Eingabeordner liegen: `F:\Comfy-Desktop\ComfyUI-Shared\input\`.

### 2. Die Größe kommt vom Auflösungswähler, nicht aus dem Paket

Bei `Krea2 Txt2Img` und `Flux2 Txt2Img` liegt ein `ResolutionSelector` **außerhalb** des Pakets und speist Breite und Höhe hinein. Er gewinnt gegen alles, was im Paket steht. Er nimmt ein Seitenverhältnis und eine Zielgröße in Megapixeln:

| Ziel | Einstellung | Ergebnis |
|---|---|---|
| Hintergrund 1920×1080 | `16:9 (Widescreen)` · `1.98` | exakt 1920×1080 ✅ gemessen |
| Sprite 1024×1536 | `2:3 (Portrait Photo)` · `1.57` | 1040×1568 ✅ gemessen, das Formatieren bügelt den Rest |

`1:1 (Square)` mit `2` liefert 1448×1448 — der frühere Standard und der Grund für quadratische Hintergründe.

### 3. Kein Doppelpunkt im Dateinamen-Präfix

Der Präfix des `SaveImage`-Knotens darf **keinen Doppelpunkt** enthalten. Windows liest alles nach dem Doppelpunkt als versteckten Nebenstrom: es entsteht eine Datei mit 0 Bytes, die echten Bilddaten hängen unsichtbar daran, und der Zähler springt nie weiter. **Jeder Lauf überschreibt den vorherigen — der Ordner sieht leer aus, obwohl gerade gerendert wurde.**

Genau das war bis August 2026 der Fall (`Krea2-%date:yyyy-MM-dd-hh-mm%`). Nebenbei: die Datums-Ersetzung greift in dieser Installation ohnehin nicht, der Platzhalter landet wörtlich im Namen.

Gültige Präfixe jetzt: `Krea2/Krea2`, `Flux2/Flux2`, `FluxEdit/FluxEdit` — der Schrägstrich legt einen Unterordner an, ComfyUI zählt selbst sauber hoch.

---

## Rezept: ein Hintergrund

1. Ablauf `Krea2 Txt2Img` über die Schnittstelle holen.
2. Im Paket den Prompt-Knoten setzen (Prosa-Absatz, 60–200 Wörter, positiv formuliert — Regeln in [README.md](README.md)).
3. Im Paket am `KSampler` einen neuen Startwert setzen, sonst kommt bei gleichem Prompt dasselbe Bild.
4. Außen am `ResolutionSelector`: `16:9 (Widescreen)` und `1.98`.
5. Laufen lassen, Bild abholen, **ansehen** — „fertig" heißt nicht „brauchbar".
6. Nach `data/themes/<welt>/backgrounds/<szene>.webp` umwandeln (Vorgaben: [../ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md)).

Geprüfte Werte für Krea 2 Turbo: **8 Schritte, Führungsstärke 1.0**, Euler / Simple. Mehr Schritte verbessern nichts, weniger kosten sichtbar Qualität.

---

## Nach dem Bild: Nachbearbeitung

Die Bildmaschine liefert immer PNG in Generierungsgröße. Zwei lokale Werkzeuge machen daraus die Datei, die die Engine ausliefert — beide unter `data/_authoring/image-tools/`:

| Werkzeug | Wofür |
|---|---|
| `cutout.py` | Hintergrund entfernen, echten Alphakanal setzen — Sprites und Erfolgs-Icons |
| `format_assets.py` | Größe und Dateiformat ins Ziel bringen, Zieltyp wird aus dem Zielpfad abgeleitet |

Bei Sprites und Icons **erst freistellen, dann formatieren**. Einrichtung und alle Aufrufe: [../image-tools/README.md](../image-tools/README.md).

Das passiert bewusst hier und nicht auf dem Server: Die App soll offline laufen, also muss jedes Bild fertig auf der Platte liegen — keine Bildverarbeitung zur Laufzeit, keine Abhängigkeit von PHP-Erweiterungen des Hosters.

## Bekannte offene Punkte

- Die Werte für Sammelkarten (630×880) und Erfolgs-Icons sind gerechnet, nicht an einem echten Bild belegt.
- `Flux Edit` ist eingerichtet, aber **noch nie durchgelaufen**. Die Knotennummern dafür stammen aus der Datei, nicht aus einem Lauf.

---

## Serien fahren: 35 Bilder in einem Zug (19.08.2026)

Für einen Stapel lohnt sich die Warteschlange. `comfy run --workflow <datei>.json --no-notify`
**ohne** `--wait` reiht den Auftrag ein und kommt sofort zurück — dreißig Aufrufe
hintereinander in einer Schleife, danach einmal warten, bis die Warteschlange leer ist:

```
GET http://127.0.0.1:8188/queue    ->  queue_running + queue_pending, beide leer = fertig
```

Das ersetzt dreißig einzelne Wartezeiten durch eine. Ein Bild in 1024×1024 braucht auf der
3060 rund fünfzig Sekunden, ein Stapel von 35 also gut eine halbe Stunde.

Praktischer als Werte einzeln zu setzen: den Ablauf **einmal** über die Schnittstelle holen und
mit einem kleinen Python-Skript pro Bild eine Kopie schreiben — Prompt in Knoten 19, Startwert
in Knoten 3, Dateiname-Präfix am `SaveImage` (`Answers/<name>`, damit jedes Bild seinen eigenen
Zähler bekommt und nie zwei Läufe kollidieren).

🟡 **Der Zähler zählt weiter.** Ein zweiter Lauf desselben Namens wird `<name>_00002_.png`, nicht
überschrieben. Wer nachbessert, muss beim Einsammeln bewusst die **neueste** Datei nehmen — oder,
wenn die ältere die bessere war, ausdrücklich die alte. Beides kommt vor.

## Freistellen: das Standardmodell versagt an flacher Grafik

`cutout.py` arbeitet mit `isnet-anime`. Das trifft Figuren zuverlässig — an **flachen
Grafikmotiven ohne Gesicht** bricht es ein. Vier goldene Sterne in einer Reihe kamen als
halbdurchsichtige graue Geister zurück, dazu ein Schmutzschleier über dem oberen Bildrand. Ein
Bild, das nach dem Freistellen ausgewaschen aussieht, ist genau dieser Fall.

Die Abhilfe ist ein Modellwechsel, kein neuer Prompt:

```bat
.venv\Scripts\python.exe cutout.py roh.png --out ziel.png --trim --model u2net
```

Faustregel: **Figuren und Lebewesen → `isnet-anime`. Gegenstände, Symbole, Icons → `u2net`.**
Das Modell lädt beim ersten Aufruf 176 MB nach, danach nie wieder.

## Sammelkarten: 630×880 ist belegt

Das Maß stand bisher gerechnet in `format_assets.py`, geprüft war es nie. Jetzt schon: sechs
Karten, in `2:3 (Portrait Photo)` bei `1.5` erzeugt (1024×1536), vom Werkzeug **mittig
beschnitten** auf 630×880. Der Beschnitt kostet oben und unten je rund 60 Pixel — die Vorlage
verlangt deshalb zu Recht einen ruhigen Rand auf allen vier Seiten.

## Ein Referenzbild anhängen, ohne die Oberfläche

`Flux2 Txt2Img` braucht zwingend ein Referenzbild (siehe unten). In einem Skript heißt das: einen
`LoadImage`-Knoten auf oberster Ebene ergänzen und ihn auf **Eingang 4** des Paket-Knotens 731
(`reference_image1`) legen. Zwei Zeilen im JSON:

```python
d["nodes"].append({"id": 950, "type": "LoadImage", "widgets_values": ["anker_pikachu.png", "image"],
                   "outputs": [{"name": "IMAGE", "type": "IMAGE", "links": [700]},
                               {"name": "MASK", "type": "MASK", "links": None}], ...})
d["links"].append([700, 950, 0, 731, 4, "IMAGE"])
```

Ob es sitzt, sagt der Server sofort: fehlt die Verbindung, lehnt er den Auftrag beim Einreihen ab
(`required input 'image' is missing`) — er rechnet gar nicht erst los. Das ist ein billiger Test.

## Was der erste Sprite-Lauf gelehrt hat (19.08.2026, 8 Sprites)

`Flux2 Txt2Img` ist durchgelaufen, die Knotennummern oben stimmen. Drei Dinge, die vorher nicht in dieser Anleitung standen und je einen Fehlversuch gekostet haben:

**1. Der Ablauf läuft nicht ohne Referenzbild.** Er ist im Kern ein Bearbeitungs-Paket: der Skalier-Knoten `ImageScaleToTotalPixels` (717) verlangt ein Bild, und ohne eines lehnt der Server den Auftrag ab, bevor irgendetwas rechnet (`required input 'image' is missing`). Der Eingang heißt `reference_image1` und ist Eingang **4** am Paket-Knoten 731. Ein `LoadImage`-Knoten auf oberster Ebene, mit diesem Eingang verbunden, löst es. Reines Erzeugen ohne Vorlage geht mit diesem Ablauf also nicht — was kein Verlust ist, weil das Referenzbild die Figur ohnehin trifft.

**2. Der Server sieht nur die oberste Ebene seines Eingangsordners.** Dateien in einem Unterordner von `F:\Comfy-Desktop\ComfyUI-Shared\input\` tauchen in der Auswahl von `LoadImage` **nicht** auf, auch nicht als `unterordner/datei.png`. Referenzbilder gehören direkt in den Ordner.

**3. Auflösung.** `ResolutionSelector` auf `2:3 (Portrait Photo)` und `1.57` ergibt **1040×1568** — nah genug an den geforderten 1024×1536, das Formatieren bügelt den Rest.

Der Weg zum Emotionsset hat sich bestätigt: erst `neutral` mit der von Hand gelieferten Vorlage, dieses Rohbild (grauer Hintergrund, **nicht** das freigestellte) zurück in den Eingangsordner, dann die zweite Emotion mit ihm als Vorlage. Die Figur bleibt dabei erkennbar dieselbe, nur das Gesicht ändert sich.

🟡 Das Freistellen schneidet eng an die Figur — ein stehender Mensch kommt dabei auf rund 710 Pixel Breite und wird beim Formatieren auf 1024 hochgerechnet. Sichtbar geschadet hat es nicht; wer es schärfer will, erzeugt größer.
- Der Dateiname-Zähler beginnt pro Unterordner bei `00001`. Wer Serien fährt, holt die Bilder besser direkt nach jedem Lauf ab, statt sich auf die Nummerierung zu verlassen.
