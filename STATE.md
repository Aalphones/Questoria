# STATE

**Aktiver Plan:** (kein aktiver Plan)

**Zuletzt abgeschlossen:** Event Engine, Meilenstein 3 — alle 7 Phasen,
archiviert am 17.08.2026 nach
[docs/archive/2026-08/2026-08-14_event-engine/](docs/archive/2026-08/2026-08-14_event-engine/README.md).
Eine Episode ist von der Ortskarte aus komplett durchspielbar (Dialog → Quiz →
Texteingabe → Bildsuche → Belohnung → Ergebnis), Vorlesemodus vollständig,
Abbruch mitten in der Episode wird aufgefangen. Nächster Plan noch nicht
angelegt — `docs/planning/` ist aktuell leer.

**Nächster Schritt:** Neuen Plan für Meilenstein 4 (Nutzerverwaltung &
Spielstand) anlegen, wenn es losgeht — sonst `/session-review` für den
Meilenstein-Rückblick.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
