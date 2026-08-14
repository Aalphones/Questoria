# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 8/8 — Planetenkarte: Main-Hub auf das Design ziehen (pending)

**Nächster Schritt:** `/implement` starten. Phase 8 ist die letzte des Plans —
baut die Planetenkarte aus dem Design in `features/main-hub/` (Kachelliste aus
Meilenstein 1 wird zur Kartenfläche, `theme-card/` wird zum Weltknoten).
Rating standard, `sonnet` reicht. Vorher
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-8-planetenkarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-8-planetenkarte.md)
lesen. Nach Phase 8: Plan-Ende — Smoke-Checkliste aus der README an Sascha,
danach archivieren.

**Phase 7 ist fertig** (echte Ortskarte + Ort-Platzhalter). `features/map/`
zeigt Orte als Punkte mit Routen/Kompassrose (Komponente heißt `MapScreen`,
nicht `Map` — Namenskollision mit dem globalen `Map`-Typ). `features/location/`
zeigt den Ort-Platzhalter mit Event-Anzahl und „Ort geschafft". Das temporäre
`features/map-demo/` ist entfernt. Build und Lint grün, kein Browser-Durchlauf
(private-Profil, User prüft am Plan-Ende). 🟡 Zwei kleine Abweichungen vom
Checklisten-Wortlaut, Details in
[phase-7-ortskarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-7-ortskarte.md)
→ Report-Back.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
