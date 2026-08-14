# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 2/7 — Ablauf-Gerüst, Event Loader, `dialog` (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 3 (ausgelagerte Events über `config.ref` + `multiple_choice`) — Rating
„heikel", also `opusplan` empfohlen. Offen vor Phase 4: für `text_input` und
`image_search` existiert kein Mockup — freihändig bauen oder erst einen Entwurf.

**Zuletzt abgeschlossen:** Phase 2 der Event Engine — der Episoden-Screen
(`features/episode/`) spielt die Eventliste ab, wählt die Komponente über
`ngComponentOutlet` + `event-type-map.ts`, `EpisodeRun` hält den Laufstand.
Erster Eventtyp `dialog` als Visual-Novel-Bühne. Der Ort-Platzhalter
(`features/location/`) ist gelöscht, die Ortskarte verlinkt auf
`theme/:themeId/episode/:episodeId`. Build und Lint grün. Die Injektor-Frage
aus dem Konfidenz-Ausweis ist entschieden: `inject(EpisodeRun)` reicht, kein
`ngComponentOutletInjector` nötig.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
