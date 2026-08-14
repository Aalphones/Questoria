# Phase 4 — Fortschritts-Speicher + Freischaltregeln

**Rating:** standard

Wer wie weit gekommen ist, entscheidet, was auf beiden Karten offen, aktuell
oder verschlossen ist. Bis zur Nutzerverwaltung (Meilenstein 4) liegt das im
Browser.

## Kontext — vorher lesen

- [README.md](README.md) → Kontrakt-Sektion „Fortschritts-Schnittstelle"
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 7 — was ausdrücklich **nicht** ins Content gehört
- [frontend/src/app/services/game-state.service.ts](../../../frontend/src/app/services/game-state.service.ts)
  — Muster für einen signalbasierten Dienst
- [frontend/src/app/models/game-state.types.ts](../../../frontend/src/app/models/game-state.types.ts)
- [docs/conventions/angular.md](../../conventions/angular.md) → „Services & DI"
  (Zugriff auf den Browser-Speicher gehört in einen Dienst, `DOCUMENT` statt
  globaler Objekte)

## Die Regeln — vollständig, hier entschieden

**Orte einer Etappe** (Reihenfolge = `maps[].nodes`-Reihenfolge im Content):

| Zustand | Bedingung |
|---|---|
| geschafft | die Episode des Orts steht im Fortschritt |
| aktuell | erster nicht geschaffter Ort — **nur wenn die Etappe nicht gesperrt ist** |
| gesperrt | alle Orte nach dem aktuellen, und alle Orte einer gesperrten Etappe |

**Etappen** (Reihenfolge = `arc_overview.stages`):

| Zustand | Bedingung |
|---|---|
| geschafft | alle Orte ihrer Karte sind geschafft |
| aktuell | erste nicht geschaffte Etappe |
| gesperrt | alle Etappen danach |

Eine Etappe ohne Orte gilt als geschafft — sie hat nichts, was man tun könnte.

**Sterne einer Etappe:** abgerundeter Durchschnitt der Sterne ihrer geschafften
Orte, 0 wenn noch keiner geschafft ist. Echte Sterne liefert erst die Event
Engine (Meilenstein 3); der Platzhalter aus Phase 7 vergibt 3.

**Fortschrittsleiste in der Kopfleiste:** geschaffte Orte / Orte gesamt der
aktiven Welt — eine Regel für alle Screens, nicht je nach Ansicht eine andere.

## Akzeptanzkriterien

1. Frisch geleerter Browser-Speicher: erste Etappe aktuell, alle weiteren
   gesperrt; in der ersten Etappe der erste Ort aktuell, Rest gesperrt.
2. Nach `completeEpisode('dev_fixture', 'test_dorf', 3)` ist `dorf` geschafft,
   `hafen` aktuell, `leuchtturm` gesperrt, die zweite Etappe weiter gesperrt.
3. Sind alle Orte der ersten Karte geschafft, ist Etappe 1 geschafft und
   Etappe 2 aktuell.
4. Der Stand übersteht ein Neuladen. Ein von Hand kaputt gemachter Eintrag im
   Browser-Speicher führt zu „alles auf Anfang", nicht zu einem Absturz.
5. `resetTheme('dev_fixture')` setzt genau diese Welt zurück, andere Welten
   bleiben stehen.

## Checkliste

- [ ] `models/game-state.types.ts` erweitern: `ProgressState`
      (`'done' | 'current' | 'locked'`), `EpisodeProgress`
      (`stars: number`, `completedAt: string`), `ThemeProgress`
      (`Record<string, EpisodeProgress>`), `ProgressStore`
      (`Record<string, ThemeProgress>`).
- [ ] `ng generate service services/progress --skip-tests`
  - Signal `store` mit dem gesamten Stand, aus dem Browser-Speicher geladen
    (Schlüssel `questoria.progress.v1`)
  - Lesen in `try/catch`: ungültiges JSON → leerer Stand, eine Warnung in die
    Konsole. **Ein kaputter Eintrag darf die App nicht blockieren** — das
    Kind kommt sonst nicht mehr rein und niemand weiß warum.
  - Schreiben nach jeder Änderung; Zugriff über
    `inject(DOCUMENT).defaultView?.localStorage`, nicht über das globale
    Objekt
  - Methoden: `isEpisodeCompleted(themeId, episodeId): boolean`,
    `starsFor(themeId, episodeId): number | null`,
    `completeEpisode(themeId, episodeId, stars): void`,
    `resetTheme(themeId): void`
  - `completeEpisode` überschreibt einen bestehenden Eintrag **nur, wenn die
    neue Sternzahl höher ist** — ein zweiter, schlechterer Durchlauf darf ein
    Ergebnis nicht verschlechtern. `completedAt` bleibt dann der erste Termin.
- [ ] `services/progress.rules.ts` — reine Funktionen, kein `inject`, kein
      Signal:
  - `stageStates(world: WorldConfig, isCompleted: (episodeId: string) => boolean): Map<string, ProgressState>`
    (Schlüssel = `map_id`)
  - `nodeStates(map: MapEntry, isCompleted: (episodeId: string) => boolean, stage: ProgressState): Map<string, ProgressState>`
  - `stageStars(map: MapEntry, starsFor: (episodeId: string) => number | null): number`
  - `worldProgress(world: WorldConfig, isCompleted: (episodeId: string) => boolean): { done: number; total: number }`
  - Verweist eine Etappe auf eine Karte, die es nicht gibt, gilt sie als
    gesperrt — kein Absturz wegen eines Content-Tippfehlers.
- [ ] Kurzer Kommentarkopf in beiden Dateien: **warum getrennt** — die Regeln
      sind reine Rechnerei und bleiben unverändert, wenn Meilenstein 4 die
      Ablage gegen die Savegame-Schnittstelle tauscht.

### Doku

- [ ] `docs/decisions/005-fortschritt-vor-der-nutzerverwaltung.md` (10 Zeilen):
      Kontext (Login erst Meilenstein 4), Optionen (Savegame-Schnittstelle
      vorziehen · lokal im Browser · gar kein Fortschritt), Entscheidung,
      Konsequenzen — inklusive: der Stand hängt an Browser und Gerät, ein
      Wechsel verliert ihn, und in Meilenstein 4 wird genau eine Datei
      ausgetauscht.
- [ ] `docs/code-map.md`: `services/progress.service.ts` und
      `services/progress.rules.ts` in der Service-Zeile ergänzen.
- [ ] `docs/glossary.md`: **Fortschritt**, **Sterne**, **Etappen-Zustand**
      aufnehmen.

## Risiken

- 🟡 Der Fortschritt hängt am Browser des Geräts. Wer die Website auf dem
  Tablet und am Rechner öffnet, hat zwei getrennte Stände. Das ist bis
  Meilenstein 4 so gewollt, sollte aber niemanden überraschen — deshalb steht
  es in ADR-006 und nicht nur hier.

## Report-Back
