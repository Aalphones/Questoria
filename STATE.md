# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_erste-echte-welt/](docs/planning/2026-08-18_erste-echte-welt/README.md)
— die erste echte Welt (Pokémon, Lesen lernen für 6–7-Jährige), eine Etappe,
drei Episoden.

**Phase:** 2 von 3 (Bilder) — noch nicht begonnen. Phase 1 ist fertig: alle 13
JSON-Dateien der Welt liegen unter `data/themes/pokemon_lesen/`, die Welt steht
auf der Planetenkarte, die Schema-Checkliste ist maschinell geprüft (0 Verstöße).

**Nächster Schritt:** Die 47 Bilddateien aus
[bestellliste.md](docs/planning/2026-08-18_erste-echte-welt/bestellliste.md)
erzeugen und einsortieren — die beiden Suchbilder zuerst, weil ihre Motive an
festen Prozentpunkten sitzen müssen
([phase-2-bilder.md](docs/planning/2026-08-18_erste-echte-welt/phase-2-bilder.md)).

**🔴 Offen vor Phase 3:** Multiple Choice kann kein Bild in der Frage zeigen —
die Wortkarten-Aufgaben nennen das Zielwort deshalb gesprochen. Details und
Alternativen in
[FINDINGS.md](docs/planning/2026-08-18_erste-echte-welt/FINDINGS.md).

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
