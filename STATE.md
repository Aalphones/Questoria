# STATE

**Aktiver Plan:** (kein aktiver Plan)

Meilenstein 4 (Nutzerverwaltung & Spielstand) ist am 18.08.2026 abgeschlossen
und archiviert:
[docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md).
Backend, Frontend und Content liegen live auf `questoria.info`, der erste
Account ist angelegt und geprüft.

**Nächster Schritt:** Vor dem Weitermachen mit Meilenstein 5 (Sammelkarten &
Druckbogen) die **Smoke-Checkliste** aus der archivierten README abarbeiten
(Sascha, am Server) — sieben Punkte, die drei ersten mit 🔴 markiert.
Anschließend `docs/planning/` für einen neuen Plan zu Meilenstein 5 nutzen
(`mode-planning`).

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
