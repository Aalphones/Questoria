# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_erste-echte-welt/README.md](docs/planning/2026-08-18_erste-echte-welt/README.md) — **Phase 2 (Bilder)**. Phase 1 ist fertig und archiviert, das Prüfskript meldet 0 strukturelle Verstöße über `pokemon_lesen`. Was fehlt, sind die Bilder: **1 von 52 vorhanden**. Fertig ist `backgrounds/alabastia_labor.webp`; es diente als Stilprobe und ist zugleich das erste echte Asset.

**Das ist seit dem 19.08.2026 keine Handarbeit mehr.** Die lokale Bildmaschine wird über den MCP-Server `comfy` ferngesteuert, ein Agent erzeugt die Dateien selbst. Bedienung, Werte und drei bekannte Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` (Szenen, Karten, Motive) und `flux2-bilder` (Sprites, Referenzbilder). Voraussetzung ist jedes Mal, dass Comfy Desktop läuft.

**Die Vertonung ist fertig — alle 16 Dialogzeilen dieser Welt sind gesprochen.** Erzeugt am 19.08.2026 mit dem Skill `vertonung`, Modell Orpheus deutsch, 0 Fehler: 16 mp3-Dateien unter `data/themes/pokemon_lesen/audio/voices/`, dazu 16 `audio_path`-Einträge in den drei Episodendateien — Datei und Verweis einzeln abgeglichen. Besetzung in `data/_authoring/voice-tools/voices.json`: Professor Eich → Julian, Bisasam → Lina, Pikachu → Lea, Rattfratz → Felix, Erzähler → Sophie. Sprachausgabe ist ohnehin optional: fehlt eine Datei, liest das Gerät die Zeile selbst vor.

🟡 **Angehört hat das noch niemand.** Die Zahlen belegen, dass die Dateien da sind und das richtige Format haben (24 kHz mono) — ob die Stimmen zu den Figuren passen, entscheidet nur das Ohr. Gehört in die Runde von Phase 3. 🟡 Zweiter offener Punkt: `_default` steht auf **Julian**, derselben Stimme wie Professor Eich — jede künftig unbesetzte Figur klingt damit unbemerkt wie er. Jakob wäre frei und schon geprobt.

## Die beiden Blocker sind weg

**Der Bildstil ist festgelegt und verankert.** `world_config.json` trägt jetzt ein Pflichtfeld `art_style` — ein englischer Satz, der **wörtlich** in jeden Bild-Prompt kopiert wird. Für diese Welt ein heller Anime-Fernsehserien-Look mit kräftiger Kontur, zweistufiger Zellschattierung und warmen Farben. Damit die nächste Welt ihn nicht wieder vergisst, hängt er an drei Stellen: Pflichtfeld im Schema (Abschnitt 2), Pflichtangabe im Welt-Bauprompt und Critical Rule 9 in `AGENTS.md`.

**Freistellen und Formatieren laufen lokal.** Neue Werkzeuge unter [data/_authoring/image-tools/](data/_authoring/image-tools/README.md), Python mit Pillow und rembg, eigene Umgebung außerhalb von Git:

| Werkzeug | Wofür | Stand |
|---|---|---|
| `cutout.py` | Hintergrund entfernen, echter Alphakanal | ✅ an einer Figur geprüft, saubere Kanten |
| `format_assets.py` | Zielgröße und Dateiformat, aus dem Zielpfad abgeleitet | ✅ an webp und 512×512 geprüft |

Bei Sprites und Icons **erst freistellen, dann formatieren**. Das passiert bewusst lokal: die App soll offline laufen, also liegt jedes Bild fertig auf der Platte — der Server rechnet nichts um und hängt an keiner PHP-Erweiterung.

## Der Stil ist am Bild bestätigt — hier ist das Rezept

`alabastia_labor.webp` ist durchgelaufen und sitzt: kräftige Kontur, zweistufige Zellschattierung, kindgerecht, Vordergrund unten frei für Sprites. **Der Prompt-Aufbau, der das erzeugt hat, ist die Vorlage für alle weiteren Szenen** — vier Teile, in dieser Reihenfolge zu einem Absatz verbunden, zusammen rund 150 Wörter:

1. **Szene** — Raum oder Ort, in Ebenen beschrieben (Vordergrund, Mitte, Hintergrund), mit Materialien statt Oberbegriffen. Endet mit einem Satz, der die Szene ausdrücklich menschenleer erklärt („The room lies quiet and empty of people.").
2. **`art_style` aus `world_config.json`** — wörtlich, unverändert, kein Wort umgestellt.
3. **Licht** — Quelle, Richtung, Charakter („Even friendly daylight falling through the window on the left, soft gentle shadows.").
4. **Rahmen** — „Wide eye-level framing, the lower left and lower right stay calm and uncluttered, crisp sharply rendered detail throughout, all labels and sign boards are blank surfaces."

Einstellungen: `ResolutionSelector` auf `16:9 (Widescreen)` und `1.98` (ergibt exakt 1920×1080), im Paket 8 Schritte, Führungsstärke 1.0, jedes Mal ein neuer Startwert. Danach `format_assets.py` mit dem Zielpfad — das erledigt webp und Größe.

🟡 Zwei Beobachtungen aus diesem Lauf, die für die Serie zählen: Die Bitte um **blanke Schilder wurde nicht eingehalten** — an der Wand hängen zwei Zettel mit Kritzelschrift. Bei Hintergründen unkritisch, bei Bildantworten wäre es ein Fehler (dort ist Text im Bild verboten), also dort genau hinsehen. Und die Farbigkeit fiel **gedämpfter aus als „warm saturated"** verspricht; wer kräftigere Farben will, verstärkt das im Szenenteil, nicht im Stilsatz — der bleibt unangetastet.

## Reihenfolge der Arbeit

1. **Szenen und Karten** mit Krea 2 Turbo — `cover.webp`, 3 Karten unter `maps/`, 2 weitere reguläre Hintergründe (`route_1_wiese`, `vertania_wald`).
2. **Die zwei Suchbilder** — Sonderfall, siehe unten.
3. **Sprites** mit FLUX.2 klein: pro Figur zuerst `neutral` ohne Referenz, bis sie sitzt, dann die zweite Emotion **mit dem neutralen Bild als Referenz**. Nur so bleibt die Figur dieselbe. Danach `cutout.py`, dann `format_assets.py`. 🟡 Dieser Ablauf ist noch **nie durchgelaufen** — die Knotennummern im Skill `flux2-bilder` stammen aus der Datei, nicht aus einem Lauf. Mit einer Figur anfangen und das Ergebnis ansehen, bevor die Serie startet.
4. **25 Antwortbilder** mit Krea 2 als Serie — einzelnes Motiv, freigestellt wirkender heller Hintergrund, quadratisch. Kein Text im Bild (`ASSET_REQUIREMENTS.md` Abschnitt 8), und der Lauf oben zeigt: das Modell hält sich nicht zuverlässig daran, also jedes Bild ansehen.
5. **4 Erfolgs-Icons** (mit Freistellen) und **6 Sammelkarten**. 🟡 Das Kartenmaß 630×880 ist in `format_assets.py` hinterlegt, aber **an keinem echten Bild geprüft** — die erste Karte kontrollieren.
6. Dateinamen gegen die Bestellliste abgleichen, Prüfskript laufen lassen.

🟡 **Bei jedem Lauf `--timeout 300` mitgeben.** Der Standard sind 120 Sekunden, die Läufe brauchen 102 bis 131 — ohne den Wert bricht das Warten mitten im Rendern ab, der Auftrag läuft aber weiter und ist über `GET /history/<prompt_id>` abholbar. Und die Bildmaschine ist geteilt: arbeitet jemand parallel in der ComfyUI-Oberfläche, warten die eigenen Aufträge hinter seinen (`GET /queue` zeigt es).

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

## Formate: erledigt sich per Werkzeug

Die Bildmaschine liefert PNG in Generierungsgröße. `format_assets.py` leitet das Ziel aus dem Zielpfad ab, schneidet mittig zu statt zu verzerren und meldet, wenn die Quelle kleiner ist als das Ziel:

| Ziel | Anzahl | Ergebnis |
|---|---|---|
| `cover.webp`, `maps/`, `backgrounds/` | 9 | 1920×1080 **webp** |
| `answers/` | 25 | **512×512** PNG |
| `cards/` | 6 | **630×880** PNG |
| `achievements/` | 4 | **128×128** PNG mit Transparenz (vorher `cutout.py`) |
| `sprites/` | 8 | **1024×1536** PNG mit Transparenz (vorher `cutout.py`) |

🟡 ImageMagick ist auf dieser Maschine **nicht** installiert — das `convert` im Suchpfad ist das Windows-Werkzeug für Dateisysteme und richtet bei falschem Aufruf Schaden an. Die Werkzeuge oben brauchen es nicht.

## Danach in dieser Reihenfolge

1. Erste echte Welt Phase 3 (Durchspielen) — echte Runde am Bildschirm, gefundene Lücken protokollieren, Doku und Deploy.
2. Meilenstein 5 — Sammelkarten & Druckbogen, sechs Phasen, freigegeben am 18.08.2026: [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).

**Offen aus Meilenstein 4:** Die Smoke-Checkliste der archivierten README ([docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md)) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Merkposten

PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.

Der Content unter `data/themes/` liegt außerhalb von Git (Drive-Verknüpfung) — Weltdateien, erzeugte Bilder und die Testwelt-Aufgabe tauchen in keinem Commit auf. Die 52 Bilder landen also im Drive-Backup, nicht in der Versionsgeschichte.
