# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 3/8 — Kartenfläche: Knoten, Routen, Bildplatzhalter (pending)

**Nächster Schritt:** `/implement` starten. Phase 3 baut das gemeinsame
Kartenbauteil (`qst-map-canvas`, `qst-map-point`, `qst-image-slot`), das
Planeten-, Etappen- und Ortskarte teilen. Rating **heikel** — vorher
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-3-kartenflaeche.md](docs/planning/2026-08-03_timeline-und-karten/phase-3-kartenflaeche.md)
lesen.

**Phase 2 ist fertig** (Testwelt im Repo + Frontend liest über die
Schnittstelle) — lokal verifiziert (Build + Lint grün, alle drei
Content-Aufrufe gegen die echte `dev_fixture`-Welt getestet), committet.
Dabei einen Bug in `ContentService::themePath()` gefunden und behoben (die
Google-Drive-Junction ließ jede echte Welt an der Pfad-Absicherung
scheitern). Details: [phase-2-testwelt-und-anbindung.md](docs/planning/2026-08-03_timeline-und-karten/phase-2-testwelt-und-anbindung.md)
→ Report-Back.

**Modell-Empfehlung für Phase 3:** `opusplan` (Opus plant, Sonnet setzt um) —
Rating heikel.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
