# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 5/8 — Router-Struktur + Kopfleiste (pending)

**Nächster Schritt:** `/implement` starten. Phase 5 baut die Routen für
Timeline/Map/Location, einen Resolver, der die Welt-Konfiguration zentral
lädt, und die gemeinsame Kopfleiste — Rating **standard**, `sonnet` reicht.
Vorher [README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-5-routing-und-kopfleiste.md](docs/planning/2026-08-03_timeline-und-karten/phase-5-routing-und-kopfleiste.md)
lesen.

**Phase 4 ist fertig** (Fortschritts-Speicher `ProgressService` im
Browser-Speicher + reine Freischaltregeln `progress.rules.ts`) — Build und
Lint grün, AK 1–5 gegen die Logik durchgerechnet (kein automatischer Test,
private-Profil). `ng generate` legt Angular-22-Services ohne `.service.`-Suffix
an — auf die Projekt-Konvention umbenannt. ADR-006 dokumentiert die
Entscheidung „Fortschritt lokal, bis Meilenstein 4 die Savegame-Schnittstelle
bringt". Details: [phase-4-fortschritt.md](docs/planning/2026-08-03_timeline-und-karten/phase-4-fortschritt.md)
→ Report-Back.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
