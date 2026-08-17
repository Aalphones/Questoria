# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 4/7 — `text_input` + `image_search` (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 5 (`reward` + Ergebnis-Screen + echte Sterne) — Rating „standard", also
`sonnet`.

**Zuletzt abgeschlossen:** Phase 4 der Event Engine — zwei weitere Aufgaben-Typen
in der Hülle aus Phase 3, beide ohne Mockup freihändig gebaut (Entscheidung war
bei der Plan-Freigabe schon getroffen). `text_input`: Eingabefeld mit Prüfen-Knopf,
Weiterraten erlaubt, Vergleich gegen `accepted_answers` als reine Funktion.
`image_search`: Suchbild mit unsichtbaren Zielen, Trefferprüfung immer über die
echten Tipp-Koordinaten gegen `radius` (nie über die vergrößerte Tastfläche),
Ziele zusätzlich per Tastatur (Tab + Enter) erreichbar; wiederverwendet
`qst-map-point` aus den Kartenscreens für die Prozent-Positionierung. Beide Typen
in `EVENT_COMPONENTS` und `EVENT_CONFIG_GUARDS` eingetragen. Build und
Frontend-Lint grün, Backend-Lint unverändert grün (kein Backend-Code berührt).
Noch nicht am echten Gerät/Browser durchgespielt — das passiert im Smoke-Test am
Plan-Ende.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
