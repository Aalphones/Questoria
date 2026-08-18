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

- [x] `ProgressService` umbauen: Datenquelle ist `SavegameService`, nicht mehr
      `localStorage`. Öffentliche Methoden (`isEpisodeCompleted`, `starsFor`,
      `completeEpisode`, `resetTheme`) behalten Namen **und** Signatur.
      Der Stern-Vergleich bleibt wortgleich erhalten.
- [x] `RunStoreService` umbauen: `load`/`save`/`clear` arbeiten auf
      `state.run` der aktiven Welt. Die Signatur bleibt, `StoredRun` bleibt.
      🟡 `StoredRun` trägt heute `themeId` **und** `episodeId`; im Spielstand
      hängt der Lauf schon an einer Welt. `themeId` im Typ belassen (die
      Aufrufer in `features/episode/` lesen ihn), beim Schreiben aus dem
      Schlüssel ableiten.
- [x] `frontend/src/app/services/legacy-progress-import.ts`: liest
      `questoria.progress.v1`, gibt ihn als `ProgressStore` zurück, löscht den
      Schlüssel. Wird genau einmal aufgerufen — direkt nach der Profilwahl,
      nachdem `SavegameService.loadAll()` durch ist.
- [x] Aufrufstellen in `features/episode/`, `features/timeline/`,
      `features/map/`, `features/main-hub/` durchsehen: keine sollte sich
      ändern müssen. Muss doch eine — im Report-Back begründen, das wäre ein
      Bruch der ADR-006-Zusage.
- [x] `questoria.run.v1` (alter Schlüssel des angefangenen Laufs) beim Umzug
      löschen, ohne Übernahme — ein halb gespielter Lauf ist es nicht wert,
      und ein doppelter Wiedereinstiegs-Dialog verwirrt mehr, als er rettet.

## Doku-Updates

- [x] `docs/decisions/006-fortschritt-vor-der-nutzerverwaltung.md`: Status auf
      „abgelöst" setzen mit Datum und Verweis auf ADR-009 und diese Phase. Die
      Datei nicht löschen — sie erklärt, warum es den Zwischenstand gab.
- [x] `docs/glossary.md`: Eintrag „Fortschritt" — der Halbsatz „bis Meilenstein
      4 im Browser-Speicher" wird zur Vergangenheitsform, der angefangene Lauf
      liegt jetzt ebenfalls im Spielstand.
- [x] `docs/code-map.md`: die Beschreibung der zentralen Dienste nachziehen
      (kein „Browser-Speicher" mehr bei Fortschritt und Lauf).

## Report-Back

**Status:** complete · 18.08.2026

Fortschritt und angefangener Lauf kommen jetzt aus dem Spielstand des aktiven
Profils. `progress.rules.ts` ist unangetastet (leerer Diff), und keine der vier
Screen-Mappen musste angefasst werden — die Zusage aus ADR-006 hält. Der alte
Browser-Stand zieht beim ersten Anmelden einmalig um, beide alten Schlüssel
verschwinden dabei.

### Abweichungen vom Plan

- **Die Übernahme hängt nicht am Profil-Screen, sondern im Dienst.** Der Plan
  sah den Aufruf „direkt nach der Profilwahl" vor. Genau dort geht er verloren:
  die Profilauswahl navigiert sofort weiter, das Warten auf den Server stirbt
  mit der Komponente. `SavegameService.ensureLoaded()` holt den Stand deshalb
  selbst und übernimmt danach — aufgerufen vom Profil-Wächter, der vor jedem
  geschützten Screen läuft. Nebengewinn: auch ein Neuladen in einem zweiten
  Browser holt sich den Serverstand, nicht nur die erste Profilwahl.
- **Übernommen wird nur nach einer geglückten Antwort des Servers.** Bei totem
  Netz weiß niemand, ob das Profil längst einen Stand hat; die Übernahme würde
  ihn überschreiben, sobald die Leitung wieder steht. Der alte Schlüssel bleibt
  dann liegen und wird beim nächsten Versuch geholt.
- **Die Profilauswahl ruft `flushPending()` nicht mehr selbst** (Phase 5). Der
  Wächter macht mit `ensureLoaded()` mehr: Serverstand holen, zusammenführen,
  offene Einträge nachschicken.
- **Ein Aufrufer hat sich doch geändert:** `routing/profile-chosen.guard.ts`.
  Kein Bruch der ADR-006-Zusage — die betrifft `progress.rules.ts` und die
  Screens, und die sind unberührt. Der Wächter ist die einzige Stelle, die
  „ein Profil ist gewählt" schon kennt und noch vor dem ersten Screen liegt.

### Offene Wackelstelle

`RunStoreService.load()` leitet die Welt aus `GameStateService.activeThemeId()`
ab, weil der Lauf im Spielstand keine Welt-Kennung mehr trägt. Der Resolver
setzt sie bei jeder Navigation in eine Welt — steht sie wider Erwarten doch
einmal leer, bliebe die Weiterspielen-Frage stumm. Prüfung: Episode mittendrin
verlassen, Seite neu laden, Episode erneut öffnen — die Frage muss kommen.
