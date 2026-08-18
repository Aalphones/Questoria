# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 5/9 — Spielstand-Schnittstelle (complete)

**Nächster Schritt:** Phase 6 (Fortschritt zieht um) —
[phase-6-fortschritt-umzug.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-6-fortschritt-umzug.md).
Rating „heikel" — `opusplan` empfohlen. Vorher die beiden neuen
Phase-6-Einträge in
[FINDINGS.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/FINDINGS.md)
lesen.

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 5 — Spielstand-Schnittstelle:
`SavegameRepository` (`allForProfile`, `upsert` über den eindeutigen Schlüssel),
`SavegameValidator` (Version 1 Pflicht, 256-KB-Deckel, Zustand wortgetreu aus
dem Rohtext statt aus dem dekodierten Körper), `SavegameController` mit den
beiden Aufrufen aus dem Kontrakt, Migration 009 (Episode und Position dürfen
leer sein). Im Frontend `savegame.types.ts` und `SavegameService` mit Puffer:
lokaler Spiegel `questoria.savegame.v1` je Profil und Welt, offene Einträge
gewinnen beim Laden gegen den Server und gehen beim nächsten Anlass erneut
raus; die Profilauswahl ruft einmal `flushPending()`. Dazu `ADR-009`
(Aufteilung des Spielstands) und der Ist-Stand in `docs/code-map.md`.
Das Spielverhalten ist **unverändert** — Phase 6 hängt erst ein.
`ng build`, `ng lint` und der PHP-Linter grün; gegen eine echte Datenbank
nicht geprüft (lokal keine Verbindung).

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
