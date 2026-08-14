# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 3/7 — Ausgelagerte Events über `config.ref` + `multiple_choice` (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 4 (`text_input` + `image_search`) — Rating „standard", also `sonnet`.
Offen vor Phase 4: für beide Typen existiert kein Mockup — freihändig bauen
oder erst einen Entwurf machen. Das ist eine Entscheidung, keine Nebensache.

**Zuletzt abgeschlossen:** Phase 3 der Event Engine — Aufgaben liegen jetzt in
eigenen Dateien und kommen über einen neuen Aufruf der Content-Schnittstelle
(`.../themes/{themeId}/events/{eventId}`, ADR-007). Das Gerüst löst `config.ref`
und die Lernstufen-Variante auf, prüft die fertige Konfiguration gegen ihren
Eventtyp und schickt Kaputtes in den Fehlerpfad statt auf die Bühne. Neu: die
gemeinsame Aufgaben-Hülle `ui/task-card/` und der erste Aufgaben-Typ
`features/events/multiple-choice/` mit Weiterraten (nur der erste Versuch zählt
für die Sterne). Backend-Lint, Build und Frontend-Lint grün; der neue Aufruf ist
am lokalen Server gegen `dev_fixture`/`probe_quiz` belegt, inklusive `404`.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
