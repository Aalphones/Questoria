# STATE

**Aktiver Plan:** [docs/planning/2026-08-19_ui-umbau-vollbild/README.md](docs/planning/2026-08-19_ui-umbau-vollbild/README.md) — **alle 5 Phasen fertig (19.08.2026), Abnahme am Bildschirm offen.** Build und Lint grün, das heißt bei Layout wie immer nichts.

**Nächster Schritt:** Die finalen Abnahmekriterien der README (Abschnitt „Finale Abnahmekriterien", 8 Punkte) plus Phase-5-Report-Back im Browser prüfen. Danach: Plan-Ende-Schritte (Doc-Abgleich ist erledigt, Archivieren steht noch aus) — oder direkt weiter mit „erste echte Welt" Phase 3 (siehe unten), die auf denselben Screens sitzt und in derselben Runde mitgeprüft werden kann.

**Phase 4 ist fertig (19.08.2026), ungesehen.** Die Lernstufen-Auswahl zeigt jetzt drei farbige Karten mit Punkten, Beschreibungssatz und je einer Trainerfigur — vorher waren es drei Textpillen. Die Bilder stehen im Content (`difficulty_levels[].image` / `.image_label` / `.description`), nicht im Code: eine Welt ohne Bilder zeigt dieselbe Karte ohne Bildfläche, kein Loch. Drei Figuren für die Pokémon-Welt liegen unter `data/themes/pokemon_lesen/levels/`, 512×768 mit Transparenz, mit Krea 2 erzeugt und angesehen. Entscheidung samt Begründung: [ADR-018](docs/decisions/018-lernstufen-bilder-im-content.md). **Beim Ansehen zusätzlich prüfen:** einmal mit absichtlich falschem Dateinamen starten, damit die beschriftete Ersatzfläche wirklich geprüft ist (AK 3 der Phase).

**Phase 1, 2 und 3 sind fertig (19.08.2026), alle drei ungesehen.** Phase 1: die App hat jetzt eine Bühne, `100dvh`, die Seite rollt nie mehr, jeder Screen erbt die Höhe. Phase 2: die Planetenkarte füllt die Bühnenhöhe, wächst in die Breite und rollt waagerecht, wenn mehr Welten kommen. Phase 3: Etappen- und Ortskarte passen sich in die Bühne ein (`min(100cqw, 100cqh·16/9)`), behalten 16:9, die Rahmenfläche trägt jetzt eine Token-Farbe statt Grau — `overflow: auto` und die `90rem`-Bremse aus Phase 1 sind raus. Build und Lint grün nach allen drei Phasen — das heißt bei Layout gar nichts. Prüflisten für den Bildschirm stehen in den Report-Backs von [phase-1-buehne.md](docs/planning/2026-08-19_ui-umbau-vollbild/phase-1-buehne.md), [phase-2-planetenkarte.md](docs/planning/2026-08-19_ui-umbau-vollbild/phase-2-planetenkarte.md) und [phase-3-karten.md](docs/planning/2026-08-19_ui-umbau-vollbild/phase-3-karten.md). Wackligste Stellen: das Profilmenü in der Kopfleiste (Phase 1), das CSS-Auto-Sizing der Planetenkarte aus `aspect-ratio` (Phase 2) und die `cqw`/`cqh`-Einpassformel samt `container-type: size` auf `.timeline`/`.map` (Phase 3) — alle drei moderne Browser-Mechanismen, keiner am Bildschirm bestätigt.

**Der Plan wurde vorgezogen** — er sollte nach Phase 3 der ersten echten Welt starten. Die hängt am langsamen Server, der UI-Umbau braucht ihn nicht. Was aus Phase 3 offen ist, steht unverändert unten.

---

**Vorheriger Plan, noch offen:** [docs/planning/2026-08-18_erste-echte-welt/README.md](docs/planning/2026-08-18_erste-echte-welt/README.md) — **Phase 3 (Durchspielen)**. Phase 1 und Phase 2 sind fertig. **Alle 52 Bilder der Welt liegen im Zielformat**, dazu die bis dahin fehlende Planetenkarte. Nichts fehlt mehr, was die Welt zum Spielen braucht.

**Vorlauf-Check (19.08.2026) erledigt:** Alle 42 Bild-/Ton-Verweise aus `world_config.json`, `cards.json`, den drei Episodendateien und `main_hub.json` gegen die Platte geprüft — **0 fehlende Dateien**. Das nimmt dir nur die dumme Hälfte von AK 2 ab (Datei existiert); ob sie an der richtigen Stelle im Layout sitzt, sieht nur dein Auge.

✅ **Beide Koordinaten-Verdachte sind geprüft (19.08.2026), einer war ein echter Treffer:**
1. Route-1-Punkte und Etappen-Position auf der Übersichtskarte (Labor 20/62, Wiese 50/38, Wald 79/58, Etappe 44/50) — am Bild geprüft, treffen alle ihre Landmarke. Kein Fix nötig.
2. `data/main_hub.json`: die Pokémon-Kachel lag bei `x:63, y:36` im leeren Himmel zwischen den Inseln — bildgenau bestätigt, kein Zuschnitt hätte das gerettet. **Behoben auf `x:73, y:78`**, trifft jetzt die Insel unten rechts.

**Testwelt `dev_fixture` ist komplett entfernt (19.08.2026, Sascha-Wunsch):** Ordner, Hub-Eintrag, Doku-Rolle als Schema-Testbett (`JSON_SCHEMA_REFERENCE.md`, `_authoring/README.md`, `glossary.md`). Der freigegebene Sammelkarten-Plan hing in Phase 6 an ihr als Testbett für den Druckbogen (≥11 Karten, drei Gruppen) — jetzt umgeschrieben auf `pokemon_lesen`, das dafür erst von 6 auf ≥11 Karten in drei Gruppen ausgebaut werden muss. Das passiert erst, wenn dieser Plan dran ist, nicht jetzt.

**Erste Runde ist gelaufen (19.08.2026), Befunde stehen in FINDINGS.md unter „Aus Phase 3".** Zwei Engine-Bugs gefixt und am Bildschirm bestätigt:
1. Vertonung spielte nirgends ab — doppelter Pfad in `dialog.ts` (`audio/voices` zweimal). ✅ behoben.
2. Etappenkarte zeigte nur ein Karo-Raster statt der Übersichtskarte. ✅ behoben.

**Dazu eine dritte Änderung am 19.08.2026, noch nicht am Bildschirm gesehen:** Die Antworten im Quiz stehen jetzt in gemischter Reihenfolge. Vorher stand die richtige Antwort auf genau dem Platz, den `correct_index` in der Content-Datei vorgibt — in `reim_1` also auf Platz 1, 2 und 3 je Lernstufe, in jeder Runde gleich. Das Kind lernt so die Kachel statt der Aufgabe, und jede Beobachtung beim Durchspielen wäre davon verfälscht. Die Mischung liegt jetzt geteilt in `frontend/src/app/features/events/shuffled-indexes.ts`, statt wie vorher nur lokal in der Wort-Bild-Aufgabe. **Beim Durchspielen darauf achten:** Buchstabe bzw. Ziffer neben der Antwort muss der angezeigten Reihenfolge folgen (oben links immer A bzw. 1), und ein falscher Tipp muss weiterhin genau die angetippte Antwort ausgrauen.

Der Rest der Spielrunden-Befunde (Vollbild-Planetenkarte mit Pfad, Lernstufen-Grafiken, Bildsuche-Layout, „Ort geschafft"-Screen, generelles Vollbild ohne Scrollen) ist **am 19.08.2026 aufgeplant**: [docs/planning/2026-08-19_ui-umbau-vollbild/](docs/planning/2026-08-19_ui-umbau-vollbild/README.md), fünf Phasen, startet direkt nach Abschluss von Phase 3. Die gemeinsame Ursache ist belegt und nicht mehr Vermutung: `app.html` ist nur ein `<router-outlet />`, `app.scss` ist leer, `styles.scss` gibt `body` keine Höhe — es gibt schlicht keine Bühne, auf der ein Screen stehen könnte, also rollt der Browser die ganze Seite.

**Server-Vorfall (19.08.2026):** Nach einem vollen Deploy brauchte jeder API-Aufruf ~30-40s (PHP-Bootstrap selbst nur 1,4s, die Verzögerung liegt vor PHP — DNS und TCP-Connect zur DB sind beide belegt schnell). Ursache noch offen, Diagnose-Zeilen in `api-bridge/diag.php` liegen bereit. Sascha wartet ab und prüft selbst wieder, wann `/api/health` schnell ist — bis dahin kein Live-Spielen möglich.

**Derweil statisch geprüft, ohne Server nötig (19.08.2026):** Vorlesemodus-Regel gegen alle 8 Aufgaben-Dateien und alle 3 Episoden-Dialoge — kein Zielwort wird vor seiner Aufgabe verraten. Alle vier `learning_objectives`-IDs stehen im Lernziel-Katalog. Alle ID-Querverweise (Maps/Nodes/Episoden/Karten) konsistent. Totes `background`/`music`-Beispiel aus `JSON_SCHEMA_REFERENCE.md` Abschnitt 4 gestrichen (Phase-1-Finding jetzt geschlossen).

Nächster Schritt: sobald der Server wieder schnell ist, Rest der Smoke-Checkliste aus der README — Lernstufe wechseln (andere Aufgaben, gleiche Geschichte), alle drei Episoden bis zum Ergebnis, Gerät des Kindes, `deploy.cmd content` + Server-Runde. Danach Phase 3 zu Ende bringen (Doku, Archivierung) und mit dem UI-Umbau beginnen — der Plan steht.

## Was am 19.08.2026 dazugekommen ist

| Gruppe | Anzahl | Modell | Ergebnis |
|---|---|---|---|
| Antwortbilder | 25 | Krea 2 | 512×512 PNG mit Transparenz, alle freigestellt |
| Sammelkarten | 6 | FLUX.2 (4 Figuren) · Krea 2 (2 Motive) | 630×880 PNG, randlos |
| Erfolgs-Icons | 4 | Krea 2 | 128×128 PNG mit Transparenz |
| Planetenkarte | 1 | Krea 2 | `data/hub/map_planetenkarte.webp`, 1920×1080 |

Zusammen mit den 17 Bildern vom Vormittag sind das **52 von 52** aus der [Bestellliste](docs/planning/2026-08-18_erste-echte-welt/bestellliste.md) — nachgezählt mit einem Prüflauf, der jede Datei der Liste öffnet und Maß, Farbmodell und Transparenz gegen die Vorgabe hält. Null fehlend, null falsches Maß. Alle Bilder wurden als Kontaktbogen nebeneinandergelegt und angesehen, nicht nur gezählt.

**Die vier Figurenkarten laufen über FLUX.2 mit den Ankerbildern der Sprites.** Damit ist Bisasam auf der Sammelkarte dasselbe Bisasam wie im Dialog — mit Krea 2 ohne Vorlage wäre es eine zweite, fremde Figur geworden.

## Was das gekostet hat und was daraus folgt

Drei Dinge sind schiefgegangen und stehen jetzt in der Werkstatt-Doku, damit sie nicht wieder Zeit kosten:

1. **Das Standard-Freistellmodell zerlegt flache Grafik.** `isnet-anime` lieferte die goldenen Sternenreihen als halbdurchsichtige graue Geister. `--model u2net` löst es. Merksatz: Lebewesen `isnet-anime`, Gegenstände und Symbole `u2net`. (→ [GENERATING.md](data/_authoring/image-prompts/GENERATING.md))
2. **„Seitenansicht" reicht dem Modell nicht.** Der Hase kam von hinten. Die Blickrichtung gehört ausdrücklich in den Prompt. (→ [ANSWER_IMAGES.md](data/_authoring/image-prompts/ANSWER_IMAGES.md))
3. **Sterne zum Abzählen kleben zusammen**, wenn der Prompt den Abstand nicht erzwingt. Bei drei und vier Sternen entscheidet genau dieser Satz über die Brauchbarkeit.

Neu belegt: **630×880 für Sammelkarten stimmt** — der offene Punkt vom Vormittag ist an sechs echten Karten geprüft, nicht mehr gerechnet. Der Beschnitt kostet oben und unten je rund 60 Pixel, der ruhige Rand in der Prompt-Vorlage ist also kein Schmuck.

## Drei Punkte, die dein Auge brauchen

🟡 **„Nase" und „Mund" sind Ermessensfragen.** Beide Wörter gibt es als freigestelltes Körperteil und als Gesicht, in dem das Teil dominiert. Umgesetzt ist: Mund als Gesicht (der offene Mund trägt das Bild), Nase freigestellt (im Gesicht bleibt sie zu klein, um die Antwort zu sein). Die verworfene Nasen-Variante liegt noch im Sitzungs-Zwischenspeicher und ist nach einem `/clear` weg — wer sie vergleichen will, sagt es vorher.

🟡 **`data/hub/` ist neu und steht nicht in `.gitignore`.** `data/themes/` und `data/avatars/` sind bewusst ausgenommen (Drive-Verknüpfung), `data/hub/` würde dagegen mit dem Bild im Repo landen. Das Hochladen betrifft es nicht — `deploy.cmd content` spiegelt `data/` ohnehin komplett. Zu entscheiden: mitversionieren oder wie die anderen Content-Ordner ausnehmen.

🟡 **Nichts davon ist am Bildschirm gesehen.** Maße und Dateien sind belegt; wie die Bilder im echten Layout wirken, entscheidet erst Phase 3 — zusammen mit den 16 Sprachaufnahmen, die ebenfalls noch niemand angehört hat.

## Die Bilderzeugung im Griff

**Sie läuft ferngesteuert.** Die lokale Bildmaschine wird über den MCP-Server `comfy` bedient, ein Agent erzeugt die Dateien selbst. Voraussetzung ist jedes Mal, dass Comfy Desktop läuft. Bedienung, Werte und alle bekannten Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` (Szenen, Karten, Motive) und `flux2-bilder` (Sprites, Referenzbilder, Schrift im Bild).

**Für Serien gilt: einreihen statt warten.** `comfy run --workflow <datei>.json --no-notify` ohne `--wait` legt den Auftrag in die Warteschlange und kommt sofort zurück. Dreißig Aufrufe hintereinander, danach einmal auf `GET /queue` warten, bis beide Listen leer sind. So sind die 35 Bilder in einer halben Stunde entstanden statt in fünfunddreißig Einzelwartungen.

🟡 **Der Dateizähler zählt weiter.** Ein zweiter Lauf desselben Namens wird `_00002_`, nicht überschrieben. Beim Einsammeln bewusst entscheiden, welche Fassung gilt — die neuere ist nicht immer die bessere.

Die Arbeitsdateien der Läufe (Workflow-Vorlagen, Bauskripte, Rohbilder, Kontaktbögen) liegen im Sitzungs-Zwischenspeicher und sind nach einem `/clear` weg. Das ist in Ordnung: aus GENERATING.md sind sie in Minuten neu gebaut.

## Vertonung ist fertig

**Alle 16 Dialogzeilen dieser Welt sind gesprochen.** Erzeugt am 19.08.2026 mit dem Skill `vertonung`, Modell Orpheus deutsch, 0 Fehler: 16 mp3-Dateien unter `data/themes/pokemon_lesen/audio/voices/`, dazu 16 `audio_path`-Einträge in den drei Episodendateien. Besetzung in `data/_authoring/voice-tools/voices.json`: Professor Eich → Julian, Bisasam → Lina, Pikachu → Lea, Rattfratz → Felix, Erzähler → Sophie.

🟡 **Angehört hat das noch niemand.** Die Zahlen belegen Dateien und Format (24 kHz mono); ob die Stimmen zu den Figuren passen, entscheidet nur das Ohr — Runde von Phase 3. 🟡 Zweiter offener Punkt: `_default` steht auf **Julian**, derselben Stimme wie Professor Eich; jede künftig unbesetzte Figur klingt damit unbemerkt wie er. Jakob wäre frei und schon geprobt.

## Werkzeuge und Vorgaben

**Der Bildstil ist Pflichtfeld.** `world_config.json` trägt `art_style` — ein englischer Satz, der **wörtlich** in jeden Bild-Prompt kopiert wird. Für diese Welt ein heller Anime-Fernsehserien-Look mit kräftiger Kontur, zweistufiger Zellschattierung und warmen Farben. Verankert an drei Stellen: Schema Abschnitt 2, Welt-Bauprompt, Critical Rule 9 in `AGENTS.md`.

**Alle Antwortbilder einer Welt teilen sich eine Hintergrundfarbe** — hier blasses Flieder. Nicht Geschmack, sondern Notwendigkeit: dasselbe Motiv steht in mehreren Aufgaben, und ein Bild mit abweichendem Look wäre in jedem Satz der Ausreißer.

**Freistellen und Formatieren laufen lokal**, [data/_authoring/image-tools/](data/_authoring/image-tools/README.md), Python mit Pillow und rembg:

| Werkzeug | Wofür | Stand |
|---|---|---|
| `cutout.py` | Hintergrund entfernen, echter Alphakanal | ✅ an 37 Bildern geprüft — Modellwahl beachten (siehe oben) |
| `format_assets.py` | Zielgröße und Dateiformat, aus dem Zielpfad abgeleitet | ✅ geprüft für alle sechs Zieltypen |

Bei Sprites, Icons und Antwortbildern **erst freistellen, dann formatieren**. Freigestellte Motive werden ins Zielmaß **eingepasst**, nicht beschnitten; Sammelkarten und Szenen dagegen mittig beschnitten. Das passiert bewusst lokal: die App soll offline laufen, also liegt jedes Bild fertig auf der Platte.

| Ziel | Anzahl | Ergebnis |
|---|---|---|
| `cover.webp`, `maps/`, `backgrounds/` | 9 | 1920×1080 webp ✅ |
| `sprites/` | 8 | 1024×1536 PNG mit Transparenz ✅ |
| `answers/` | 25 | 512×512 PNG mit Transparenz ✅ |
| `cards/` | 6 | 630×880 PNG ✅ |
| `achievements/` | 4 | 128×128 PNG mit Transparenz ✅ |
| `data/hub/` | 1 | 1920×1080 webp ✅ |

🟡 ImageMagick ist auf dieser Maschine **nicht** installiert — das `convert` im Suchpfad ist das Windows-Werkzeug für Dateisysteme und richtet bei falschem Aufruf Schaden an. Die Werkzeuge oben brauchen es nicht.

## Danach in dieser Reihenfolge

1. Erste echte Welt Phase 3 (Durchspielen) — echte Runde am Bildschirm, gefundene Lücken protokollieren, Doku und Deploy.
2. UI-Umbau — Vollbild, Karten, Erfolgsmoment, fünf Phasen: [docs/planning/2026-08-19_ui-umbau-vollbild/](docs/planning/2026-08-19_ui-umbau-vollbild/README.md). Steht vor Meilenstein 5, weil die Sammelkarten-Screens sonst auf derselben fehlenden Bühne gebaut werden.
3. Meilenstein 5 — Sammelkarten & Druckbogen, sechs Phasen, freigegeben am 18.08.2026: [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).
4. Curriculum & Variation — Lernziele als Ausgangspunkt, Aufgaben-Pools statt Einzelaufgaben, neue Eventtypen für Mathematik: [docs/planning/2026-08-19_curriculum-und-variation/](docs/planning/2026-08-19_curriculum-und-variation/README.md). Löst den Einzelplan `2026-08-19_curriculum-layer.md` ab.
5. Pokéball werfen — das erste Franchise-Spiel, drei Phasen: [docs/planning/2026-08-19_pokeball-fangen/](docs/planning/2026-08-19_pokeball-fangen/README.md). Hängt an nichts außer der laufenden Phase 3 und kann jederzeit dazwischen.

Alle gesammelten Spielideen (Kern-, Auflockerungs- und Franchise-Spiele, mit Stand und Bewertung) liegen als Ideenspeicher unter [docs/knowledge/spielmechaniken-katalog.md](docs/knowledge/spielmechaniken-katalog.md) — Grundlage für beide Pläne, aber selbst kein Fahrplan.

**Offen aus Meilenstein 4:** Die Smoke-Checkliste der archivierten README ([docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md)) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Merkposten

PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.

Python gibt es in diesem Projekt nur in den Werkzeug-Umgebungen — `data/_authoring/image-tools/.venv/Scripts/python.exe`. Ein blankes `python` liegt nicht im Suchpfad.

Der Content unter `data/themes/` liegt außerhalb von Git (Drive-Verknüpfung) — Weltdateien und erzeugte Bilder tauchen in keinem Commit auf. Sie landen im Drive-Backup, nicht in der Versionsgeschichte.
