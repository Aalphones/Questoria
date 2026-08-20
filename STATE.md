# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md) — Meilenstein 5, 6 Phasen, freigegeben am 18.08.2026. **Noch nicht begonnen.**

**Phase:** 1/6 — Kartenbesitz-Fundament (pending, Rating **heikel**)

**Nächster Schritt:** Phase 1 lesen und umsetzen — Karten über den Welt-Aufruf ausliefern, Spielstand-Format v2, `CardService`, zwei ADRs. Heikle Phase: `/model opusplan` empfohlen.

## Was zuletzt fertig wurde

**Die erste echte Welt ist abgeschlossen und archiviert (20.08.2026):** [docs/archive/2026-08/2026-08-18_erste-echte-welt/](docs/archive/2026-08/2026-08-18_erste-echte-welt/README.md). Pokémon — Die Buchstaben-Route, drei Orte, drei Lernstufen, 52 Bilder, 16 vertonte Dialogzeilen, am Bildschirm abgenommen, auf `questoria.info` deployt, auf dem Gerät des Kindes durchgeklickt.

💡 **Was der Härtetest ergeben hat:** Das Content-Schema trägt echten Content ohne Änderung — aber vier Lücken kamen erst durch das Spielen heraus, nicht durch das Bauen. Zwei Engine-Bugs (Vertonung spielte wegen eines doppelten Pfads nie ab; die Etappenkarte zeigte ein leeres Raster statt ihres Kartenbilds), eine Schema-Zusage, die kein Code einlöste, und eine Sprite-Vorgabe, die Arbeit ohne Gegenwert verlangte. Keiner davon wäre einem Build oder Lint aufgefallen.

**Davor abgeschlossen:** [UI-Umbau auf Vollbild](docs/archive/2026-08/2026-08-19_ui-umbau-vollbild/README.md) (19.08.2026, fünf Phasen) und [Wort-Bild-Paare](docs/archive/2026-08/2026-08-18_wort-bild-paare.md) als eigener Eventtyp.

## Offene Punkte aus abgeschlossenen Plänen

Stehen dort jeweils unter „Follow-ups", hier nur als Merkposten:

- 🟡 **`data/hub/` ist nicht in `.gitignore`** — anders als `data/themes/` und `data/avatars/` würde die Planetenkarte im Repo landen. Zu entscheiden: mitversionieren oder ausnehmen. Aufs Deployen hat es keinen Einfluss.
- 🟡 **`_default` in `voices.json` steht auf Julian**, derselben Stimme wie Professor Eich — jede künftig unbesetzte Figur klingt unbemerkt wie er. Jakob wäre frei und schon geprobt.
- 🟡 **Der Server-Vorfall vom 19.08.2026 ist nicht aufgeklärt** (30–40 s pro API-Aufruf, Verzögerung vor PHP, am 20.08. von selbst weg). Diagnose-Zeilen liegen in `api-bridge/diag.php` bereit.
- Aus dem UI-Umbau: das letzte `vh` statt `dvh` in `--size-answer-image`, das zu klein gewordene Größenbudget des Builds, und der Bühnen-Kontrakt ohne automatischen Wächter.
- Aus Meilenstein 4: die Smoke-Checkliste der [archivierten README](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md) ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

## Danach in dieser Reihenfolge

1. **Meilenstein 5** — Sammelkarten & Druckbogen (der aktive Plan). 🟡 Phase 6 baut `pokemon_lesen` von 6 auf ≥11 Karten in drei Gruppen aus — das war früher die Rolle der Testwelt `dev_fixture`, die es nicht mehr gibt.
2. **Curriculum & Variation** — Lernziele als Ausgangspunkt, Aufgaben-Pools statt Einzelaufgaben, neue Eventtypen für Mathematik: [docs/planning/2026-08-19_curriculum-und-variation/](docs/planning/2026-08-19_curriculum-und-variation/README.md).
3. **Pokéball werfen** — das erste Franchise-Spiel, drei Phasen: [docs/planning/2026-08-19_pokeball-fangen/](docs/planning/2026-08-19_pokeball-fangen/README.md). Hängt an nichts und kann jederzeit dazwischen.

Alle gesammelten Spielideen mit Stand und Bewertung: [docs/knowledge/spielmechaniken-katalog.md](docs/knowledge/spielmechaniken-katalog.md) — Ideenspeicher, kein Fahrplan.

## Merkposten zur Maschine

- **PHP/Composer** liegen unter `C:\Users\sasch\develop\.tools\` (`php.cmd`/`composer.cmd`), nicht im Suchpfad. Für den PHP-Linter müssen die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne `--no-dev`).
- **Ad-hoc-Testserver nie auf Port 8000 oder 4200** — Sascha nutzt beide selbst parallel (`backend\serve.cmd` / `npm start`).
- **Python** gibt es nur in den Werkzeug-Umgebungen: `data/_authoring/image-tools/.venv/Scripts/python.exe`. Ein blankes `python` liegt nicht im Suchpfad. **ImageMagick ist nicht installiert** — das `convert` im Suchpfad ist das Windows-Dateisystem-Werkzeug und richtet bei falschem Aufruf Schaden an.
- **Der Content unter `data/themes/` liegt außerhalb von Git** (Drive-Verknüpfung). Weltdateien und erzeugte Bilder tauchen in keinem Commit auf; gesichert werden sie über Drive, auf den Server kommen sie mit `deploy.cmd content`.
- **Bilderzeugung** läuft ferngesteuert über den MCP-Server `comfy` (Comfy Desktop muss laufen). Bedienung, Werte und alle bekannten Fallen: [data/_authoring/image-prompts/GENERATING.md](data/_authoring/image-prompts/GENERATING.md). Handwerk pro Modell: Skills `krea2-bilder` und `flux2-bilder`, Vertonung: Skill `vertonung`.
