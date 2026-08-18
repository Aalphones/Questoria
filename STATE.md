# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_erste-echte-welt/](docs/planning/2026-08-18_erste-echte-welt/README.md)
— die erste echte Welt (Pokémon, Lesen lernen für 6–7-Jährige), eine Etappe,
drei Episoden.

**Phase:** 1 von 3 (Weltgerüst und Aufgaben) — noch nicht begonnen.

**Nächster Schritt:** `data/themes/pokemon_lesen/` anlegen und das Gerüst über
die Prompt-Vorlage erzeugen, dann gegen das Schema nachschärfen
([phase-1-weltgeruest.md](docs/planning/2026-08-18_erste-echte-welt/phase-1-weltgeruest.md)).

**Danach geparkt im Backlog:** Meilenstein 5 — Sammelkarten & Druckbogen,
sechs Phasen, freigegeben am 18.08.2026:
[docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).
Bewusst nach der Welt, damit die Halle an echten Karten gebaut wird.

**Offen aus Meilenstein 4:** Die Smoke-Checkliste der archivierten README
([docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md))
ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
Der Content unter `data/themes/` liegt außerhalb von Git (Drive-Verknüpfung) —
Weltdateien tauchen in keinem Commit auf.
