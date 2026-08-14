# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 6/8 — Etappenkarte (pending)

**Nächster Schritt:** `/implement` starten. Phase 6 baut die echte
Etappenkarte (Seekarte mit Inseln, Legende, Panel) in
`frontend/src/app/features/timeline/` — der Ordner existiert bereits als
schlanker Platzhalter aus Phase 5, **nicht neu `ng generate`n**, direkt
hineinbauen (siehe FINDINGS.md). Rating standard, `sonnet` reicht. Vorher
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) und
[phase-6-etappenkarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-6-etappenkarte.md)
lesen.

**Phase 5 ist fertig** (Router-Struktur + Kopfleiste). `app.routes.ts` trägt
alle fünf Adressen, `world-config.resolver.ts` + `difficulty-chosen.guard.ts`
in `routing/`, `qst-hud` + `qst-content-error` gebaut, Lernstufen-Auswahl in
einen eigenen Screen (`level-select/`) gezogen, Main-Hub entsprechend
getrimmt. `timeline/`, `map/`, `location/` existieren als Platzhalter (Kopf-
leiste + Hinweistext) — AK 1 verlangte alle fünf Routen sofort ladbar, obwohl
die echten Screens erst in Phase 6/7 kommen; Abweichung dokumentiert in
FINDINGS.md und der Phasen-Datei. Build und Lint grün, kein Browser-Durchlauf
(private-Profil, User prüft am Plan-Ende). Details:
[phase-5-routing-und-kopfleiste.md](docs/planning/2026-08-03_timeline-und-karten/phase-5-routing-und-kopfleiste.md)
→ Report-Back.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
