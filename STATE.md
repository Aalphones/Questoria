# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 7/9 — Erfolge (complete)

**Nächster Schritt:** Phase 8 (Statistiken) —
[phase-8-statistiken.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-8-statistiken.md).
Rating „standard" — `sonnet` reicht.

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 7 — Erfolge sind jetzt Content
(`world_config.json` → `achievements[]`, ADR-010) statt Datenbank-Katalog;
Migration 010 baut `player_achievements` auf Content-Schlüssel um und löscht
die alte Tabelle `achievements`. Neu im Backend: `AchievementRepository`
(`allForProfile`, `unlock` mit `INSERT IGNORE`), `AchievementController`
(`GET`/`POST /api/profiles/{id}/achievements`), `AchievementValidator`. Neu im
Frontend: `achievement.rules.ts` (reine Auswertung der vier Bedingungstypen +
`conditionHint()` für den Klartext-Hinweis), `achievement.service.ts`
(derselbe Puffer-Mechanismus wie `SavegameService`, additiv statt
überschreibend), eingehängt in `profile-chosen.guard.ts`. `episode.ts` wertet
nach jedem Episodenende neu erreichte Erfolge aus und schaltet sie frei; die
Pille sitzt in `features/result/`, das Erfolge-Panel (alle Erfolge aller
installierten Welten, nicht nur gestarteter) in `features/main-hub/`. Testwelt
`dev_fixture` hat jetzt zwei Erfolge plus zwei generierte Platzhalter-Icons.
`ng build`/`ng lint` und `composer run lint` grün; gegen eine echte Datenbank
nicht geprüft (lokal keine Verbindung). Wackligste Stelle steht am Ende von
`phase-7-erfolge.md` → Report-Back.

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
