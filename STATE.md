# STATE

**Aktiver Plan:** (kein aktiver Plan — umgesetzt wird gerade nichts)

**Im Backlog:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md),
9 Phasen, freigegeben am 17.08.2026. Startet über `/implement`.

**Zuletzt abgeschlossen:** Event Engine, Meilenstein 3 — alle 7 Phasen,
Smoke-Test und Archivierung am 17.08.2026, liegt unter
[docs/archive/2026-08/2026-08-14_event-engine/](docs/archive/2026-08/2026-08-14_event-engine/README.md).
Eine Episode ist von der Ortskarte aus komplett durchspielbar (Dialog → Quiz →
Texteingabe → Bildsuche → Belohnung → Ergebnis), Vorlesemodus vollständig,
Abbruch mitten in der Episode wird aufgefangen.

**Nächster Schritt:** Meilenstein 4 umsetzen (Phase 1: Anmeldung im Backend) —
oder vorher `/session-review` für den Rückblick auf Meilenstein 3.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
