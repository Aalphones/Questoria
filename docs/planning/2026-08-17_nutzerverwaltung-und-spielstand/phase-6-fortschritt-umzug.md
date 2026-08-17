# Phase 6 — Fortschritt zieht um

ADR-006 hat es angekündigt: `progress.service.ts` wird gegen eine Fassung mit
Spielstand-Anbindung getauscht, `progress.rules.ts` und alle Screens bleiben
unberührt. Dasselbe für den angefangenen Lauf.

## Kontext (vorher lesen)

- [ADR-006](../../decisions/006-fortschritt-vor-der-nutzerverwaltung.md) — der
  Umstieg ist dort wörtlich vorgezeichnet
- Phase 5 → `SavegameService`, Puffer-Regeln, Form von `Zustand`
- `frontend/src/app/services/progress.service.ts` (vollständig)
- `frontend/src/app/services/run-store.service.ts` (vollständig)
- `frontend/src/app/services/progress.rules.ts` — **darf sich nicht ändern**
- `frontend/src/app/features/episode/` — wer `RunStoreService` aufruft
- `frontend/src/app/features/timeline/` — Fortschritt-zurücksetzen-Dialog

## Chesterton's Fence — was hier ersetzt wird

- **`ProgressService`** hält den Fortschritt aller Welten als ein Signal und
  schreibt ihn unter `questoria.progress.v1` in den Browser. Die Regel „ein
  zweiter, schlechterer Durchlauf verschlechtert nichts" (Zeile mit dem
  `existing.stars >= stars`-Vergleich) ist **Spiellogik, kein Speicherdetail**
  — sie muss den Umzug überleben.
- **`RunStoreService`** hält genau einen angefangenen Lauf für die ganze App,
  nicht einen pro Episode. Das war eine bewusste Entscheidung aus Meilenstein 3,
  Phase 6 — der Spielstand-Zustand hat deshalb genau ein `run`-Feld pro Welt und
  nicht eine Liste.
- Beide fangen einen beschädigten Speichereintrag ab und setzen zurück, statt
  die Anwendung zu blockieren. Diese Nachsicht bleibt.

## Abnahmekriterien

1. Eine geschaffte Episode erscheint nach dem Neuladen **in einem anderen
   Browser** mit denselben Sternen.
2. Ein abgebrochener Lauf führt beim nächsten Start zur Weiterspielen-Frage —
   auch im anderen Browser.
3. `progress.rules.ts` ist unverändert (Vergleich im Diff: keine Zeile).
4. Der Fortschritt-zurücksetzen-Dialog auf der Etappenkarte leert die Welt
   weiterhin, jetzt auch auf dem Server.
5. **Einmalige Übernahme:** Ist beim ersten Anmelden ein alter Stand unter
   `questoria.progress.v1` vorhanden und hat das gewählte Profil für diese Welt
   noch keinen Spielstand, wird der alte Stand übernommen. Danach wird der alte
   Schlüssel gelöscht; ein zweites Anmelden übernimmt nichts mehr — auch nicht
   nach mehrfachem Neuladen.
6. Hat das Profil bereits einen Spielstand, wird der alte lokale Stand
   **nicht** übernommen und trotzdem gelöscht (er würde sonst bei jedem Start
   erneut zur Debatte stehen).
7. Zwei Profile im selben Browser haben getrennte Stände.

## Checkliste

- [ ] `ProgressService` umbauen: Datenquelle ist `SavegameService`, nicht mehr
      `localStorage`. Öffentliche Methoden (`isEpisodeCompleted`, `starsFor`,
      `completeEpisode`, `resetTheme`) behalten Namen **und** Signatur.
      Der Stern-Vergleich bleibt wortgleich erhalten.
- [ ] `RunStoreService` umbauen: `load`/`save`/`clear` arbeiten auf
      `state.run` der aktiven Welt. Die Signatur bleibt, `StoredRun` bleibt.
      🟡 `StoredRun` trägt heute `themeId` **und** `episodeId`; im Spielstand
      hängt der Lauf schon an einer Welt. `themeId` im Typ belassen (die
      Aufrufer in `features/episode/` lesen ihn), beim Schreiben aus dem
      Schlüssel ableiten.
- [ ] `frontend/src/app/services/legacy-progress-import.ts`: liest
      `questoria.progress.v1`, gibt ihn als `ProgressStore` zurück, löscht den
      Schlüssel. Wird genau einmal aufgerufen — direkt nach der Profilwahl,
      nachdem `SavegameService.loadAll()` durch ist.
- [ ] Aufrufstellen in `features/episode/`, `features/timeline/`,
      `features/map/`, `features/main-hub/` durchsehen: keine sollte sich
      ändern müssen. Muss doch eine — im Report-Back begründen, das wäre ein
      Bruch der ADR-006-Zusage.
- [ ] `questoria.run.v1` (alter Schlüssel des angefangenen Laufs) beim Umzug
      löschen, ohne Übernahme — ein halb gespielter Lauf ist es nicht wert,
      und ein doppelter Wiedereinstiegs-Dialog verwirrt mehr, als er rettet.

## Doku-Updates

- [ ] `docs/decisions/006-fortschritt-vor-der-nutzerverwaltung.md`: Status auf
      „abgelöst" setzen mit Datum und Verweis auf ADR-009 und diese Phase. Die
      Datei nicht löschen — sie erklärt, warum es den Zwischenstand gab.
- [ ] `docs/glossary.md`: Eintrag „Fortschritt" — der Halbsatz „bis Meilenstein
      4 im Browser-Speicher" wird zur Vergangenheitsform, der angefangene Lauf
      liegt jetzt ebenfalls im Spielstand.
- [ ] `docs/code-map.md`: die Beschreibung der zentralen Dienste nachziehen
      (kein „Browser-Speicher" mehr bei Fortschritt und Lauf).

## Report-Back
