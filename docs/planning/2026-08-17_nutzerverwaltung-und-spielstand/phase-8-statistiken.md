# Phase 8 — Statistiken

Vier Zahlen pro Welt und Profil, die über alle Läufe hinweg wachsen. Das
Frontend zählt, das Backend addiert und verwahrt.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Statistiken), „Entschieden vor dem
  Bauen" Punkt 6
- `backend/src/Migrations/sql/007_create_statistics.sql` und `008_*.sql`
  (Spalte heißt `events_completed`, nicht `minigames_completed`)
- `docs/design/README.md` → „Bewusste Abweichungen" Punkt 7 — der Grund, warum
  die dritte Kachel bisher fehlt
- `docs/design/HANDOFF.md` → „8. Ergebnis" — Maße der Statistik-Karten
- `frontend/src/app/features/result/` — die zwei bestehenden Kacheln
- `frontend/src/app/features/episode/episode-run.ts` — wo die Zahlen eines
  Laufs entstehen

## Abnahmekriterien

1. Am Ende einer Episode wachsen die vier Zahlen der Welt um das, was in diesem
   Lauf passiert ist: geschaffte Aufgaben, richtige Antworten, falsche
   Antworten, Spielzeit in Minuten.
2. Ein zweiter Aufruf desselben Laufs (Neuladen des Ergebnis-Screens) zählt
   **nicht** doppelt.
3. Der Ergebnis-Screen zeigt drei Kacheln (min. 196px): „Richtige Antworten"
   `x/y` aus dem Lauf, „Dialogzeilen gehört" aus dem Lauf, und als dritte
   „Aufgaben geschafft" mit der Gesamtzahl dieser Welt.
4. Die Spielzeit zählt die Zeit zwischen erstem und letztem Event einer
   Episode, nicht die Zeit seit Öffnen des Browsers.
   🟡 Ein Kind, das die Episode offen liegen lässt und nach zwei Stunden
   weiterspielt, darf keine 120 Minuten gutgeschrieben bekommen: Zeitabschnitte
   über 5 Minuten ohne Ereignis zählen als 5 Minuten.
5. Bei totem Server erscheinen die Zahlen später, ohne Doppelzählung
   (Puffer aus Phase 5).

## Checkliste

- [ ] `backend/src/Migrations/sql/011_statistics_last_run.sql`: Spalte
      `last_run_id VARCHAR(64) NULL` auf `statistics`. Kommentarkopf wie in
      Migration 008.
- [ ] `backend/src/Repositories/StatisticsRepository.php`: `allForProfile`,
      `addDeltas` (`INSERT … ON DUPLICATE KEY UPDATE spalte = spalte + VALUES(spalte)`).
      **Vor dem Addieren `last_run_id` vergleichen** — stimmt sie mit der
      mitgeschickten überein, wird nichts addiert und der aktuelle Stand
      zurückgegeben (siehe README → 🟡 bei den Statistiken). Beim Addieren wird
      sie mitgeschrieben.
- [ ] `backend/src/Validators/StatisticsValidator.php`: `run_id` Pflicht,
      1–64 Zeichen; die vier Zahlen optional, jeweils ganze Zahl `>= 0`,
      Obergrenze pro Aufruf (z.B. 10 000) gegen kaputte Clients.
- [ ] `backend/src/Controllers/StatisticsController.php`, Routen registrieren.
- [ ] `frontend/src/app/services/statistics.service.ts`: Stand als Signal,
      `refresh(profileId)`, `add(themeId, deltas)`. Wie die Erfolge über den
      Puffer-Weg aus Phase 5.
- [ ] `episode-run.ts` um die Zeitmessung erweitern (Zeitstempel je Event,
      Deckelung nach Regel 4). Die Zählwerte für richtige/falsche Antworten
      existieren bereits — nicht neu erfinden, nur einsammeln.
- [ ] Gegen Doppelzählung, zwei Schichten: (a) die Zuwächse werden genau einmal
      beim Übergang in den Ergebnis-Screen gesendet und im Laufzustand als
      „gesendet" markiert — der Ergebnis-Screen selbst sendet nichts; (b) jeder
      Lauf bekommt beim Start eine Kennung aus `crypto.randomUUID()`, die
      mitgeschickt wird und die Wiederholung aus dem Puffer entschärft.
- [ ] `features/result/`: dritte Kachel „Aufgaben geschafft".

## Doku-Updates

- [ ] `docs/design/README.md` → „Bewusste Abweichungen" Punkt 7 umschreiben:
      die dritte Kachel existiert jetzt, heißt aber „Aufgaben geschafft" statt
      „Neue Wörter gelernt" — die Zahl aus dem Prototyp hat in keiner Spalte
      eine Entsprechung und hätte erfunden werden müssen.
- [ ] `docs/glossary.md`: Eintrag „Statistik" (vier Zahlen pro Welt und Profil,
      wachsen über alle Läufe, Abgrenzung zu den Zahlen eines einzelnen Laufs).
- [ ] `docs/code-map.md`: neue Dateien in den Ist-Stand.

## Report-Back
