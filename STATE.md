# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_erste-echte-welt/README.md](docs/planning/2026-08-18_erste-echte-welt/README.md) — **Phase 2 (Bilder)**. Phase 1 ist fertig und archiviert, das Prüfskript meldet 0 strukturelle Verstöße über `pokemon_lesen`. Was fehlt, sind die Bilder: **0 von 52 vorhanden**, die Ordner unter `data/themes/pokemon_lesen/` sind leer.

**Das ist seit dem 19.08.2026 keine Handarbeit mehr.** Die lokale Bildmaschine wird über den MCP-Server `comfy` ferngesteuert, ein Agent erzeugt die Dateien selbst. Bedienung, Werte und drei bekannte Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` (Szenen, Karten, Motive) und `flux2-bilder` (Sprites, Referenzbilder). Voraussetzung ist jedes Mal, dass Comfy Desktop läuft.

## 🔴 Zwei Dinge müssen vor dem ersten Serienbild entschieden sein

**1. Der Stil der Welt ist nirgends festgelegt.** `world_config.json` hat kein Stilfeld, die Prompt-Vorlagen haben nur einen Platzhalter. 52 Bilder ohne festen Stilsatz werden 52 verschiedene Welten. Vorschlag als Ausgangspunkt, am ersten Bild zu prüfen und dann wörtlich in jedem Prompt zu wiederholen:

> Anime-inspired painterly illustration, soft cel-shading, clean confident linework, warm saturated colour palette, gentle rounded shapes suitable for young children.

Der Satz gehört nach der Freigabe in `world_config.json` oder an den Kopf der Bestellliste, damit ihn niemand neu erfindet.

**2. Freistellen ist noch nicht möglich.** 12 der 52 Dateien brauchen einen echten Alphakanal (8 Sprites, 4 Erfolgs-Icons). Die ComfyUI-Installation hat keine passende Erweiterung — unter `custom_nodes/` liegt nur `ComfyUI-GGUF`, und der Erweiterungs-Manager antwortet nicht (404). Ohne Lösung stehen die Figuren auf einem grauen Kasten. Zwei Wege, **beide ungeprüft**:

- `comfy node install <name>` — installiert eine Freistell-Erweiterung in ComfyUI. Setzt vermutlich den Manager voraus, der hier fehlt.
- `uv tool install rembg` — eigenständiges Werkzeug außerhalb von ComfyUI, greift die Installation nicht an. Wahrscheinlich der schnellere Weg.

## Reihenfolge der Arbeit

1. **Ein Testbild** mit dem Stilsatz oben (`backgrounds/alabastia_labor.webp`), ansehen, Stil freigeben. Erst danach Serie.
2. **Freistell-Werkzeug** bereitstellen und an einem Sprite prüfen.
3. **Szenen und Karten** mit Krea 2 Turbo — `cover.webp`, 3 Karten unter `maps/`, 3 reguläre Hintergründe. 16:9 bei `1.98` Megapixeln ergibt exakt 1920×1080 (gemessen).
4. **Die zwei Suchbilder** — Sonderfall, siehe unten.
5. **Sprites** mit FLUX.2 klein: pro Figur zuerst `neutral` ohne Referenz, bis sie sitzt, dann die zweite Emotion **mit dem neutralen Bild als Referenz**. Nur so bleibt die Figur dieselbe.
6. **25 Antwortbilder** mit Krea 2 als Serie — einzelnes Motiv, freigestellt wirkender heller Hintergrund, quadratisch. Kein Text im Bild (`ASSET_REQUIREMENTS.md` Abschnitt 8).
7. **4 Erfolgs-Icons** und **6 Sammelkarten**.
8. **Formate nachziehen** (siehe unten), Dateinamen gegen die Bestellliste abgleichen, Prüfskript laufen lassen.

Die verbindliche Dateiliste steht in [docs/planning/2026-08-18_erste-echte-welt/bestellliste.md](docs/planning/2026-08-18_erste-echte-welt/bestellliste.md) — 52 Namen, exakt so müssen die Dateien heißen.

## Die zwei Suchbilder sind der schwierigste Posten

Beide tragen Fundstücke an **fest vorgegebenen Prozentpunkten**. Kein Bildmodell trifft Koordinaten auf Zuruf. Realistisch: Bild erzeugen, nachsehen wo die Dinge tatsächlich liegen, und **die Koordinaten im Content nachziehen** — nicht umgekehrt. Die Bestellliste formuliert es andersherum; das ist der unrealistischere Weg.

| Bild | Fundstücke (Soll-Position) | Quelle |
|---|---|---|
| `backgrounds/suchbild_labor_dinge.webp` | Ball 28/62 · Blatt 64/45 · Beere 80/70 · Mütze 46/28 · Malstift 18/38 · Muschel 72/72 | `events/anlaut_b_suche.json`, `events/anlaut_m_suche.json` |
| `backgrounds/suchbild_waldlichtung.webp` | Sonne 78/18 · Stein 22/68 · Specht 58/30 | `events/wald_suche.json` |

Alle sechs bzw. drei Dinge müssen **sichtbar und klar getrennt** liegen, sonst ist die Aufgabe nicht lösbar.

## Referenzbilder liegen bereit

Sascha hat sechs Vorlagen geliefert. Sie liegen jetzt dort, wo ComfyUI sie lesen kann: `F:\Comfy-Desktop\ComfyUI-Shared\input\pokemon_lesen_refs\` — `bisasam.png`, `pikachu.jpg`, `prof_eich.png`, `rattfratz.png` decken alle vier Sprite-Figuren ab. `glumanda.png` und `schiggy.png` stehen auf keiner Bestellung, sind also Reserve.

## Formate: Nacharbeit ist Pflicht

Die Bildmaschine liefert PNG in Generierungsgröße. Gebraucht werden andere Formate:

| Ziel | Anzahl | Von → Nach |
|---|---|---|
| `cover.webp`, `maps/`, `backgrounds/` | 9 | PNG 1920×1080 → **webp** |
| `answers/` | 25 | PNG → **512×512** quadratisch |
| `cards/` | 6 | PNG → **exakt 630×880**, randlos |
| `achievements/` | 4 | PNG → **128×128** mit Transparenz |

🟡 **ImageMagick ist nicht installiert.** Das `convert` im Suchpfad ist das Windows-Werkzeug für Dateisysteme, nicht der Bildkonverter — wer es aufruft, bekommt etwas ganz anderes. Vorhanden und geeignet ist **ffmpeg** (`ffmpeg -i ein.png -vf scale=512:512 aus.png`, webp direkt über die Endung).

## Danach in dieser Reihenfolge

1. Erste echte Welt Phase 3 (Durchspielen) — echte Runde am Bildschirm, gefundene Lücken protokollieren, Doku und Deploy.
2. Meilenstein 5 — Sammelkarten & Druckbogen, sechs Phasen, freigegeben am 18.08.2026: [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).

**Offen aus Meilenstein 4:** Die Smoke-Checkliste der archivierten README ([docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md)) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Merkposten

PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.

Der Content unter `data/themes/` liegt außerhalb von Git (Drive-Verknüpfung) — Weltdateien, erzeugte Bilder und die Testwelt-Aufgabe tauchen in keinem Commit auf. Die 52 Bilder landen also im Drive-Backup, nicht in der Versionsgeschichte.
