# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 1/9 — Anmeldung im Backend (complete)

**Nächster Schritt:** Phase 2 (Türsteher vor Content und App) —
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md).
Rating „heikel". Phase 2 baut zusätzlich einen geschützten Endpunkt zum Anlegen
des ersten Accounts (entschieden am 17.08.2026 — `bin/create-user.php` läuft auf
dem Paket nicht; Details in FINDINGS → Phase 2).

**Zuletzt abgeschlossen:** Event Engine, Meilenstein 3 — alle 7 Phasen,
Smoke-Test und Archivierung am 17.08.2026, liegt unter
[docs/archive/2026-08/2026-08-14_event-engine/](docs/archive/2026-08/2026-08-14_event-engine/README.md).

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
Die MySQL-Datenbank des Pakets ist von außen **nicht** erreichbar (Port 3306 zu,
geprüft 17.08.2026) — alles, was eine Sitzung braucht, ist nur auf dem
hochgeladenen Stand prüfbar.
