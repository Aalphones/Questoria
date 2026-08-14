# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 4/8 — Fortschritts-Speicher + Freischaltregeln (pending)

**Nächster Schritt:** `/implement` starten. Phase 4 baut den Fortschritts-Dienst
(Ablage im Browser-Speicher) und die Freischaltregeln als reine Funktionen —
Rating **standard**, `sonnet` reicht. Vorher
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-4-fortschritt.md](docs/planning/2026-08-03_timeline-und-karten/phase-4-fortschritt.md)
lesen.

**Phase 3 ist fertig** (Kartenfläche, Kartenpunkt, Bildplatzhalter) — Build und
Lint grün. **Am Bildschirm noch ungeprüft:** `npm start` → `/map-demo` zeigt das
temporäre Prüfbild (drei Knoten der Testwelt, zwei Routen, Bildplatzhalter).
Dort gehören die Akzeptanzkriterien 1–4 kontrolliert: Fenster von 360 px bis
Vollbild ziehen, und einmal mit eingeschalteter Bewegungsreduzierung schauen.
Details: [phase-3-kartenflaeche.md](docs/planning/2026-08-03_timeline-und-karten/phase-3-kartenflaeche.md)
→ Report-Back.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
