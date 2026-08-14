# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 7/8 — Ortskarte + Ort-Platzhalter (pending)

**Nächster Schritt:** `/implement` starten. Phase 7 baut die Ortskarte in
`frontend/src/app/features/map/` (existiert als schlanker Platzhalter aus
Phase 5, **nicht neu `ng generate`n**, direkt hineinbauen) plus den
Ort-Platzhalter in `features/location/`, und entfernt `features/map-demo/`
samt Route (siehe FINDINGS.md). Rating standard, `sonnet` reicht. Vorher
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-7-ortskarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-7-ortskarte.md)
lesen.

**Phase 6 ist fertig** (echte Etappenkarte). `timeline.ts`/`.html`/`.scss`
ersetzen den Phase-5-Platzhalter: Inseln aus `arc_overview.stages[]` mit
Zustandsfarben (`done`/`current`/`locked` aus `progress.rules.ts`), Panel,
Legende, „Fortschritt zurücksetzen"-Dialog. Klick/Enter auf eine erreichbare
Etappe navigiert zur Ortskarte. Build und Lint grün, kein Browser-Durchlauf
(private-Profil, User prüft am Plan-Ende). 🟡 `timeline.scss` reißt das
4-kB-Style-Budget um ~0,7 kB (Warnung, keine 8-kB-Fehlergrenze). Details:
[phase-6-etappenkarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-6-etappenkarte.md)
→ Report-Back.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
