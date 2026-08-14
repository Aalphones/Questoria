# STATE

**Aktiver Plan:** (kein aktiver Plan)

**Phase:** —

**Nächster Schritt:** Meilenstein 3 planen (Event Engine — spielt die Eventliste
einer Episode ab und löst den Ort-Platzhalter ab): `/plan`. Grundlage sind
[PROJECT.md](docs/PROJECT.md) und [ADR-004](docs/decisions/004-event-engine.md).

**Zuletzt abgeschlossen:** Meilenstein 2 „Timeline & Karten", archiviert am
14.08.2026 →
[docs/archive/2026-08/2026-08-03_timeline-und-karten/](docs/archive/2026-08/2026-08-03_timeline-und-karten/README.md).
Die Welt ist begehbar: Planetenkarte → Lernstufe → Etappenkarte → Ortskarte →
Ort, Fortschritt hält im Browser-Speicher. Offene Punkte stehen dort unter
„Follow-ups" (Pixel-Tokens auf `rem` umstellen, `timeline.scss` über der
Warngrenze, pauschale Sterne bis zur Event Engine).

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
