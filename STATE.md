# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 4/9 — Spielerprofile (complete)

**Nächster Schritt:** Phase 5 (Spielstand-Schnittstelle) —
[phase-5-savegame.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-5-savegame.md).
Rating „heikel" — `opusplan` empfohlen.

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 4 — Spielerprofile: `ProfileRepository`,
`ProfileValidator`, `ProfileController` mit den vier Aufrufen aus dem
Kontrakt; `ProfileService` (Liste als Signal, laden/anlegen/ändern/löschen/
wählen), `GameStateService.activeProfileId` (überlebt Neuladen über
`questoria.profile.v1`), `profileChosenGuard` vor Planetenkarte und allen
`theme/…`-Routen, Screen `features/profile/` nach dem Prototyp-Screen `login`
(Profilkarten, „Neues Profil", Lösch-Bestätigung als `<dialog>`). Lernstufe
und Welt wandern beim Wechseln automatisch ins Profil. 6 Platzhalter-Avatare
unter `frontend/public/avatars/`. `ng build` und `ng lint` sowie der
PHP-Linter grün; gegen den Server noch nicht getestet (lokal keine
Datenbankverbindung).

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
