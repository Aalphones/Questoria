# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 6/9 — Fortschritt zieht um (complete)

**Nächster Schritt:** Phase 7 (Erfolge) —
[phase-7-erfolge.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-7-erfolge.md).
Rating „heikel" — `opusplan` empfohlen.

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 6 — Fortschritt und angefangener Lauf kommen
jetzt aus dem Spielstand des aktiven Profils statt aus dem Browser-Speicher.
`ProgressService` liest über eine neue Alle-Welten-Sicht `statesByTheme` des
`SavegameService`, `RunStoreService` arbeitet auf `state.run` der aktiven Welt.
Neu: `legacy-progress-import.ts` (holt `questoria.progress.v1`, löscht ihn und
`questoria.run.v1`) — angewandt in `SavegameService.ensureLoaded()`, das der
Profil-Wächter vor jedem geschützten Screen einmal je Profil aufruft.
`progress.rules.ts` und alle vier Screen-Mappen sind unberührt (leerer Diff),
damit hält die Zusage aus ADR-006; ADR-006 steht jetzt auf „abgelöst".
`ng build` und `ng lint` grün; gegen eine echte Datenbank nicht geprüft
(lokal keine Verbindung). Wackligste Stelle steht am Ende von
`phase-6-fortschritt-umzug.md`.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
Die MySQL-Datenbank des Pakets ist von außen **nicht** erreichbar (Port 3306 zu,
geprüft 17.08.2026) — alles, was eine Sitzung braucht, ist nur auf dem
hochgeladenen Stand prüfbar. Lokal sind seit Phase 2 auch alle Bilder gesperrt;
ohne Cookie liefert `/content/**` am Entwicklungsserver `403`, und das ist
richtig so.
