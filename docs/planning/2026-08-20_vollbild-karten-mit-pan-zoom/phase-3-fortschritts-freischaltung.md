# Phase 3 — Fortschritts-Freischaltung und Savegame

**Rating:** heikel (neuer persistenter Zustand, Synchronisationslogik)

## Kontext (lesen, bevor du anfängst)

- `frontend/src/app/ui/map-canvas/map-canvas.ts` — Stand nach Phase 1+2:
  `tiles()`, `unlockedTileIds()` (Input, bisher testweise „alles offen").
- `frontend/src/app/models/content.types.ts` — Stand nach Phase 1:
  `MapTileDef.id`, `ArcStage.tile_id`, `MapNode.tile_id`,
  `InstalledTheme.tile_id`.
- `frontend/src/app/models/savegame.types.ts` — `SavegameState`,
  `EMPTY_SAVEGAME_STATE`. **Wichtig, vorab geprüft (20.08.2026):** Das
  Backend liest `state` nicht strukturiert — `SavegameValidator.php` prüft
  nur `state.version === 1` und eine Byte-Obergrenze, der Rest wird als
  JSON-Text opak durchgereicht (`SavegameValidator.php:64-83`). **Ein neues
  Feld in `SavegameState` braucht deshalb keine Backend-Änderung** — reine
  Frontend-Arbeit. (Korrektur gegenüber einer früheren Einschätzung in
  diesem Chat, die pauschal „Backend-Arbeit" vermutet hatte, ohne den
  Validator gelesen zu haben.)
- `frontend/src/app/services/progress.service.ts` — `store`, `resetTheme()`
  (Muster für `savegame.stateFor`/`savegame.save`).
- `frontend/src/app/services/progress.rules.ts` — `stageStates()`,
  `nodeStates()` (liefern `ProgressState` je Punkt — Grundlage für „ist diese
  Kachel durchgespielt").

## Ziel dieser Phase

Jede Kachel außer der ersten ist zu Beginn gesperrt. Sind alle spielbaren
Punkte einer freigeschalteten Kachel abgeschlossen, wird die **nächste**
Kachel in der Content-Reihenfolge (`tiles[]`-Array-Index) freigeschaltet —
dauerhaft, im Spielstand. MainHub bekommt **keine** Sperre: alle seine
Kacheln sind immer offen.

## Architektur-Entscheidung: abgeleitet UND persistiert (ADR-020)

Kein Widerspruch zwischen „ableitbar" und „im Savegame" — beides gleichzeitig,
mit einer klaren Aufgabenteilung:

- **Abgeleitet** ist die Regel *„was SOLLTE laut aktuellem Fortschritt
  freigeschaltet sein"* (reine Funktion über `ProgressState`, unten).
- **Persistiert** ist ein monoton wachsendes „Hochwassermarke"-Set pro Karte
  im Savegame — es wird bei jeder Gelegenheit mit der Ableitung
  **vereinigt** (nie ersetzt, nie verkleinert), nie direkt aus ihr
  zurückgesetzt.
- Tatsächlich an `MapCanvas` gebunden wird **immer die Vereinigung** aus
  beidem: `unlockedTileIds = abgeleitet() ∪ persistiert()`.

**Warum beides:** Rein abgeleitet würde bei jedem Neuberechnen exakt den
Wert zeigen, der zum Fortschritt passt — technisch ausreichend, aber ohne
Gedächtnis für Sonderfälle (ein später möglicher Hinweis-Kauf, ein manuelles
Freischalten) und ohne einfache Möglichkeit, „diese Kachel ist gerade **neu**
aufgetaucht" zu erkennen (dafür bräuchte man den vorherigen Render-Zustand,
den Signals nicht von selbst vorhalten). Persistiert as Hochwassermarke gibt
beides dazu, ohne die Ableitung als Quelle der Wahrheit zu verlieren — die
Vereinigung stellt sicher, dass ein Rechenfehler in der Ableitung nie etwas
**zurücknimmt**, das schon mal sichtbar war. Kurzes ADR (10 Zeilen, Format
wie ADR-017/018/019): `docs/decisions/020-freischaltung-abgeleitet-und-persistiert.md`.

## Umsetzung

### 1. `savegame.types.ts` — neues Feld

```ts
export interface SavegameState {
  readonly version: 1;
  readonly progress: ProgressStore[string];
  readonly run: SavegameRun | null;
  readonly settings: SavegameSettings;
  /** Freigeschaltete Kachel-Ids, indiziert über einen Karten-Geltungsbereich. */
  readonly revealedTiles: Record<string, readonly string[]>;
}
```

`EMPTY_SAVEGAME_STATE` bekommt `revealedTiles: {}`. **Geltungsbereich-
Schlüssel** (der `Record`-Key): `'arc_overview'` für die Timeline-Kacheln,
die `MapEntry.id` für die Kacheln einer Ortskarte — ein Spielstand pro Welt
(`SavegameState` ist bereits pro `themeId`) trägt also mehrere Geltungs-
bereiche nebeneinander. MainHub braucht **keinen** Eintrag (keine Sperre,
siehe Schritt 4).

### 2. `progress.rules.ts` — Ableitungsfunktion

```ts
/**
 * Welche Kachel-Ids laut aktuellem Fortschritt freigeschaltet sein SOLLTEN —
 * Kachel 0 immer, jede weitere erst wenn alle Punkte der vorherigen fertig
 * sind. `pointsByTile` gruppiert die bereits bekannten Punkt-Zustände nach
 * `tile_id` (vom Aufrufer gebaut — diese Funktion kennt kein Content-Schema).
 */
export function derivedUnlockedTileIds(
  orderedTileIds: readonly string[],
  pointsByTile: ReadonlyMap<string, readonly ProgressState[]>,
): readonly string[] {
  const unlocked: string[] = [];

  for (const tileId of orderedTileIds) {
    unlocked.push(tileId);

    const states = pointsByTile.get(tileId) ?? [];
    const tileDone = states.length === 0 || states.every((state) => state === 'done');

    if (!tileDone) {
      break; // diese Kachel ist noch offen — die danach bleibt gesperrt
    }
  }

  return unlocked;
}
```

Eine Kachel **ohne** Punkte (z. B. eine reine „Landschafts"-Kachel ohne
Station) gilt als sofort durchgespielt — sie blockiert die nächste nicht.

### 3. `ProgressService` — Lese-/Schreibzugriff

Neue Methoden, Muster wie `resetTheme()`:

```ts
revealedTileIds(themeId: string, scope: string): readonly string[] {
  return this.savegame.stateFor(themeId).revealedTiles[scope] ?? [];
}

/** Vereinigt `tileIds` mit dem bisherigen Stand — nie kleiner, nie ersetzt. */
syncRevealedTiles(themeId: string, scope: string, tileIds: readonly string[]): void {
  const state = this.savegame.stateFor(themeId);
  const existing = new Set(state.revealedTiles[scope] ?? []);
  const merged = new Set([...existing, ...tileIds]);

  if (merged.size === existing.size) {
    return; // nichts Neues — kein Schreibzugriff, kein Netzwerk-Aufruf
  }

  const position = this.savegame.positionFor(themeId);
  this.savegame.save(
    themeId,
    { ...state, revealedTiles: { ...state.revealedTiles, [scope]: [...merged] } },
    position ?? { episodeId: null, nodeId: null },
  );
}
```

### 4. Screens verdrahten

**`timeline.ts`:**

```ts
protected readonly orderedTileIds = computed<readonly string[]>(
  () => this.world()?.arc_overview.tiles.map((tile) => tile.id) ?? [],
);

private readonly pointsByTile = computed<ReadonlyMap<string, readonly ProgressState[]>>(() => {
  const world = this.world();
  const states = this.stageStateMap();
  if (world === null) return new Map();

  const map = new Map<string, ProgressState[]>();
  for (const stage of world.arc_overview.stages) {
    const list = map.get(stage.tile_id) ?? [];
    list.push(states.get(stage.map_id) === 'done' ? 'done' : 'locked');
    map.set(stage.tile_id, list);
  }
  return map;
});

protected readonly unlockedTileIds = computed<readonly string[]>(() => {
  const derived = derivedUnlockedTileIds(this.orderedTileIds(), this.pointsByTile());
  const persisted = this.progressService.revealedTileIds(this.themeId(), 'arc_overview');
  return [...new Set([...derived, ...persisted])];
});

private readonly syncUnlockedTiles = effect(() => {
  this.progressService.syncRevealedTiles(this.themeId(), 'arc_overview', this.unlockedTileIds());
});
```

`timeline.html`: `[tiles]="…"` (aus `world().arc_overview.tiles`, aufgelöst
zu `MapCanvasTile[]` mit `content.assetUrl()` — analog zum bisherigen
`backgroundUrl`-Muster), `[unlockedTileIds]="unlockedTileIds()"` **ersetzt**
die Phase-1-Übergangszeile (`tiles().map(t => t.id)`).

**`map.ts`:** exakt analog, Geltungsbereich-Schlüssel = `mapEntry()!.id`
statt `'arc_overview'`, `pointsByTile` gruppiert `mapEntry().nodes` über
`node.tile_id` und `nodeStateMap()`.

**`main-hub.ts`:** **kein** `unlockedTileIds`-Computed nötig — bindet
schlicht `[unlockedTileIds]="allHubTileIds()"` mit `allHubTileIds =
computed(() => hub.data.hub_map.tiles.map(t => t.id))` (alles immer offen,
kein Fortschrittsbezug, keine Savegame-Lese-/Schreiblogik).

### 5. „Fortschritt zurücksetzen" (bestehender Dialog in Timeline)

`resetTheme()` in `ProgressService` setzt bereits den gesamten Welt-Zustand
zurück — **muss** `revealedTiles` mit zurücksetzen, sonst bleiben alte
Kacheln nach einem Reset fälschlich offen. Prüfen, ob `resetTheme()` den
kompletten `SavegameState` überschreibt (dann automatisch erledigt) oder nur
`progress` (dann `revealedTiles: {}` explizit ergänzen).

## Akzeptanzkriterien

1. Ein frischer Spielstand zeigt genau Kachel 0 als freigeschaltet, alle
   anderen als Nebel — auf Timeline und auf jeder Ortskarte unabhängig
   voneinander.
2. Schließt man alle Stationen der aktuellen Kachel ab, schaltet sich die
   nächste frei — **sofort**, ohne Neuladen der Seite.
3. Ein Tab-Neustart (bzw. Neuladen der Seite) zeigt denselben Freischalt-
   Stand wie vorher — die Information kommt aus dem Savegame, nicht aus
   einer live-berechneten Momentaufnahme (DevTools: `localStorage`-Schlüssel
   `questoria.savegame.v1` enthält `revealedTiles`).
4. „Fortschritt zurücksetzen" setzt auch den Freischalt-Stand zurück.
5. MainHub zeigt **immer** alle seine Kacheln offen, unabhängig vom
   Fortschritt — Regressionscheck.
6. Kein Netzwerk-Aufruf, wenn sich am Freischalt-Stand nichts ändert
   (`syncRevealedTiles` früher Ausstieg bei `merged.size === existing.size`
   — DevTools → Network bei wiederholtem Laden derselben Karte prüfen).

## Doc-Updates

- `docs/code-map.md`: Ergänzen, dass `ProgressService` seit dieser Phase
  auch Kachel-Freischaltung trägt (`revealedTileIds`/`syncRevealedTiles`).

## Report-Back

*(nach Umsetzung ausfüllen)*
