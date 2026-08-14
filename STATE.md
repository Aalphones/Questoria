# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 1/7 — Lesbarkeit: `rem`-Tokens, Vorlesemodus, Sprachausgabe (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 2 (Ablauf-Gerüst, Event Loader, `dialog`) — Rating „heikel", also
`opusplan` empfohlen. Offen vor Phase 4: für `text_input` und `image_search`
existiert kein Mockup — freihändig bauen oder erst einen Entwurf.

**Zuletzt abgeschlossen:** Phase 1 der Event Engine — `NarrationService`
(Modus + Ton als Signals, Sprachausgabe mit Erst-Entsperrer), Modus-Umschalter
+ Ton-Knopf in der Kopfleiste, `ui/read-aloud-button/`, `_tokens.scss`
komplett auf `rem`. Build und Lint grün.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
