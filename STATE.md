# STATE

**Aktiver Plan:**
[Nutzerverwaltung & Spielstand, Meilenstein 4](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
— 9 Phasen, freigegeben am 17.08.2026.

**Phase:** 8/9 — Statistiken (complete)

**Nächster Schritt:** Phase 9 (Kopfleiste, Testwelt, Doku) —
[phase-9-kopfleiste-und-doku.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-9-kopfleiste-und-doku.md).
Rating „mechanisch" — `sonnet` reicht. Letzte Phase des Plans: danach steht
die Smoke-Checkliste an (macht Sascha selbst).

**Vor dem nächsten echten Test auf dem Server nötig:** einmal `deploy.cmd`
laufen lassen (bringt `SETUP_TOKEN` in `backend/.env` und die neue
Umschreibe-Regel nach `public/content/`), danach **einmal** einen Account
anlegen — sonst sperrt sich die Plattform vollständig selbst aus. Aufruf steht
in
[phase-2-tuersteher.md](docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)
ganz unten.

**Zuletzt abgeschlossen:** Phase 8 — Statistiken. Vier Zahlen pro Welt und
Profil (`events_completed`, `correct_answers`, `wrong_answers`,
`playtime_minutes`), die über alle Läufe addiert werden. Migration 011
ergänzt `last_run_id` auf `statistics` als Schutz gegen Doppelzählung. Neu im
Backend: `StatisticsRepository` (`allForProfile`, `addDeltas` mit
Lauf-Kennungs-Vergleich vor dem Addieren), `StatisticsController`
(`GET`/`POST /api/profiles/{id}/statistics(/{themeId})`),
`StatisticsValidator`. Neu im Frontend: `statistics.service.ts` — Puffer wie
bei Erfolgen/Spielstand, aber mit einer Warteschlange offener Zuwächse statt
eines einzelnen `pending`-Eintrags. `EpisodeRun` trägt jetzt `runId`
(`crypto.randomUUID()`), misst Spielzeit als Summe der auf 5 Minuten
gedeckelten Event-Abstände, und bewacht den einmaligen Statistik-Versand über
`markStatisticsSent()`. Dritte Ergebnis-Kachel „Aufgaben geschafft" zeigt den
optimistischen Weltstand aus `StatisticsService.totalsByTheme()`.
`ng build`/`ng lint` und `composer run lint` grün; gegen eine echte Datenbank
nicht geprüft (lokal keine Verbindung). Wackligste Stelle: die
Spielzeit-Messung lebt im Speicher der `EpisodeRun`-Instanz und überlebt
einen Seiten-Neuladen mitten in der Episode nicht — Details am Ende von
`phase-8-statistiken.md` → Report-Back.

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
