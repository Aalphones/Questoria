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
| Sprite 1024×1536 | `2:3 (Portrait Photo)` · `1.57` | rechnerisch, ungeprüft |

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

- Nur die 16:9-Einstellung für Hintergründe ist gemessen. Die Werte für Sprites, Sammelkarten (630×880) und Erfolgs-Icons sind gerechnet, nicht belegt.
- `Flux2 Txt2Img` und `Flux Edit` sind eingerichtet und zeigen auf das richtige Modell, aber **noch nie durchgelaufen**. Die Knotennummern oben stammen aus der Datei, nicht aus einem Lauf.
- Der Dateiname-Zähler beginnt pro Unterordner bei `00001`. Wer Serien fährt, holt die Bilder besser direkt nach jedem Lauf ab, statt sich auf die Nummerierung zu verlassen.
