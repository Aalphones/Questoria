# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 2/9 — Türsteher vor Content und App (complete)

**Nächster Schritt:** Phase 3 (Anmeldebildschirm im Frontend) —
[phase-3-anmeldebildschirm.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-3-anmeldebildschirm.md).
Rating „standard".

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 2 — `/content/**` läuft jetzt durch eine
PHP-Weiche mit derselben Sitzungsprüfung wie die Schnittstelle, lokal wie auf
dem Server; dazu `POST /api/setup/user` für den ersten Account.

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
