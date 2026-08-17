# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 6/7 — Weiterspielen nach Abbruch (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 7 (Testwelt, Authoring-Toolkit, Doku) — Rating „mechanisch", also
`sonnet`.

**Zuletzt abgeschlossen:** Phase 6 der Event Engine — Abbruch mitten in einer
Episode wird jetzt aufgefangen. Neuer Dienst `RunStoreService` merkt genau
einen angefangenen Lauf im Browser-Speicher (`questoria.run.v1`), `EpisodeRun`
schreibt ihn nach jedem `finish()`. Neuer Dialog `features/episode/resume-prompt/`
(natives `<dialog>`, Muster wie der Fortschritt-zurücksetzen-Dialog aus der
Timeline) fragt „Weiterspielen oder von vorn?", sobald ein passender Eintrag
zur gerade geladenen Episode existiert; ein Eintrag zu einer anderen Episode
bleibt unangetastet. Eintrag wird beim Episodenabschluss und bei „Von vorn
anfangen" gelöscht, ein beschädigter/veralteter Eintrag still verworfen. Build
und Frontend-Lint grün, Backend unverändert. Noch nicht am echten Gerät
durchgespielt — das ist Smoke-Punkt 3 am Plan-Ende (Tab schließen, neu öffnen,
„Weiterspielen" landet am richtigen Event).

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
