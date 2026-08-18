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

- [x] `backend/src/Migrations/sql/011_statistics_last_run.sql`: Spalte
      `last_run_id VARCHAR(64) NULL` auf `statistics`. Kommentarkopf wie in
      Migration 008.
- [x] `backend/src/Repositories/StatisticsRepository.php`: `allForProfile`,
      `addDeltas` (`INSERT … ON DUPLICATE KEY UPDATE spalte = spalte + VALUES(spalte)`).
      **Vor dem Addieren `last_run_id` vergleichen** — stimmt sie mit der
      mitgeschickten überein, wird nichts addiert und der aktuelle Stand
      zurückgegeben (siehe README → 🟡 bei den Statistiken). Beim Addieren wird
      sie mitgeschrieben. Abweichung: kein `FOR UPDATE`/Transaktion — an einem
      Profil spielt genau ein Kind auf einem Gerät, siehe Report-Back.
- [x] `backend/src/Validators/StatisticsValidator.php`: `run_id` Pflicht,
      1–64 Zeichen; die vier Zahlen optional, jeweils ganze Zahl `>= 0`,
      Obergrenze pro Aufruf (z.B. 10 000) gegen kaputte Clients.
- [x] `backend/src/Controllers/StatisticsController.php`, Routen registrieren.
- [x] `frontend/src/app/services/statistics.service.ts`: Stand als Signal,
      `ensureLoaded(profileId)`, `add(themeId, delta)`. Wie die Erfolge über den
      Puffer-Weg aus Phase 5 — mit einer Warteschlange statt eines einzelnen
      `pending`-Eintrags, weil ein Zuwachs additiv ist und mehrere offene
      Läufe pro Welt möglich sind.
- [x] `episode-run.ts` um die Zeitmessung erweitert (Zeitstempel je Event,
      Deckelung nach Regel 4). Die Zählwerte für richtige/falsche Antworten
      kommen aus `scoredCount`/`correctFirstTryCount`, die es schon gab.
- [x] Gegen Doppelzählung, zwei Schichten: (a) die Zuwächse werden genau einmal
      beim Übergang in den Ergebnis-Screen gesendet und im Laufzustand als
      „gesendet" markiert (`EpisodeRun.markStatisticsSent()`) — der
      Ergebnis-Screen selbst sendet nichts; (b) jeder Lauf bekommt beim Start
      eine Kennung aus `crypto.randomUUID()` (`EpisodeRun.runId`), die
      mitgeschickt wird und die Wiederholung aus dem Puffer entschärft.
- [x] `features/result/`: dritte Kachel „Aufgaben geschafft".

## Doku-Updates

- [x] `docs/design/README.md` → „Bewusste Abweichungen" Punkt 7 umgeschrieben:
      die dritte Kachel existiert jetzt, heißt aber „Aufgaben geschafft" statt
      „Neue Wörter gelernt" — die Zahl aus dem Prototyp hat in keiner Spalte
      eine Entsprechung und hätte erfunden werden müssen.
- [x] `docs/glossary.md`: Eintrag „Statistik" (vier Zahlen pro Welt und Profil,
      wachsen über alle Läufe, Abgrenzung zu den Zahlen eines einzelnen Laufs).
- [x] `docs/code-map.md`: neue Dateien in den Ist-Stand.

## Report-Back

**Gebaut:** Migration 011 (`last_run_id` auf `statistics`),
`StatisticsRepository`/`Controller`/`Validator` im Backend, Routen
`GET`/`POST /api/profiles/{id}/statistics(/{themeId})`. Im Frontend
`statistics.service.ts` nach dem Puffer-Muster von Erfolgen/Spielstand, aber
mit einer Warteschlange offener Zuwächse statt eines einzelnen `pending`-Flags
(additiv, mehrere Läufe können gleichzeitig offen sein). `EpisodeRun` trägt
jetzt eine `runId` (`crypto.randomUUID()`), misst die Spielzeit als Summe der
— je auf 5 Minuten gedeckelten — Abstände zwischen den Events, und bewacht den
einmaligen Versand über `markStatisticsSent()`. `episode.ts` reicht den
Zuwachs beim Episodenende ein und speist die dritte Ergebnis-Kachel aus
`StatisticsService.totalsByTheme()` (optimistisch: bestätigter Stand plus
offene Zuwächse, damit die gerade geschaffte Aufgabe sofort mitzählt). Der
Wächter `profile-chosen.guard.ts` lädt Statistiken jetzt mit. `ng build`,
`ng lint` und `composer run lint` laufen grün; gegen eine echte Datenbank
nicht geprüft (lokal keine Verbindung, wie in Phase 7).

**Abweichung vom Plan:** `StatisticsRepository::addDeltas` liest den
bestehenden Stand vor dem Schreiben, ohne `FOR UPDATE`/Transaktion — der Plan
erwähnt das nicht explizit, aber ein Wettlauf zweier gleichzeitiger Aufrufe
für dasselbe Profil und dieselbe Welt könnte theoretisch die
`last_run_id`-Prüfung umgehen. Bei genau einem Kind pro Profil und Gerät ist
das Risiko praktisch null; bewusst nicht mit einer Transaktion abgesichert,
um nicht als erste Stelle im Projekt ein neues Muster einzuführen, das sonst
nirgends gebraucht wird.

**Wackligste Stelle:** Die Spielzeitmessung läuft komplett im Speicher der
`EpisodeRun`-Instanz (`lastEventAt`/`playtimeMs`) und wird bei einem
Seiten-Neuladen mitten in der Episode nicht aus dem Spielstand
wiederhergestellt — ein „Weiterspielen" nach Abbruch (Phase 6) zählt die Zeit
vor dem Neuladen nicht mit. Das ist keine der vier AK verletzt (keine zählt
Zeit über einen Neuladen hinweg), aber die Statistik „Spielzeit" fällt nach
einem Abbruch-Resume etwas niedriger aus als real gespielt. Prüfbar am
Server: eine Episode zur Hälfte spielen, Seite neu laden, weiterspielen bis
zum Ende — die verbuchte Spielzeit sollte dann kürzer sein als die tatsächlich
verstrichene Zeit.
