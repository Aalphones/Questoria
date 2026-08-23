# Phase 4 — Automatischer Fokus auf die aktuelle Position

**Rating:** standard

## Kontext (lesen, bevor du anfängst)

- `frontend/src/app/ui/map-canvas/map-canvas.ts` — Stand nach Phase 1+2+3:
  `tiles()`, `points()`, `unlockedTileIds()`, `zoom`, `panX`/`panY`,
  `resetView()`, `.map-canvas__world--animated`, `resolveTileOrigin()`.
- `frontend/src/app/features/timeline/timeline.ts` — `stageStateMap`,
  `unlockedTileIds` (Phase 3).
- `frontend/src/app/features/map/map.ts` — `nodeStateMap`, `unlockedTileIds`
  (Phase 3).

## Ziel dieser Phase

Beim Öffnen zentriert sich die Ansicht animiert auf die Station, an der es
weitergeht — innerhalb der ohnehin schon freigeschalteten Fläche (Phase 3
garantiert das nicht automatisch, siehe Sicherheitsnetz unten).

## Umsetzung

### 1. `map-canvas.ts` — neuer Input + Zentrier-Logik

- `readonly focusPointId = input<string | null>(null)`.
- `readonly focusZoom = input<number>(1.6)`.
- `computed focusPoint = () => this.points().find(p => p.id === this.focusPointId()) ?? null`.
- `computed focusWorldPosition = () => { const point = focusPoint(); if
  (point === null) return null; return resolveTileOrigin(this.tiles(),
  point.tileId) mit (point.x/100*1024, point.y/100*1024) addiert — analog zu
  Phase 1 Schritt 2, hier aber innerhalb von MapCanvas selbst (die Route-
  Berechnung tut exakt das schon, dieselbe Hilfsfunktion wiederverwenden,
  nicht duplizieren). }`.
- Privates Signal `lastAppliedFocusId = signal<string | null>(null)`.
- `effect`, das bei Änderung von `focusPoint()` prüft: ist `focusPoint()?.id`
  identisch zu `lastAppliedFocusId()`? Wenn ja, nichts tun. Wenn nein und
  `focusWorldPosition()` nicht `null`: `lastAppliedFocusId.set(...)`, dann
  `applyFocus(focusWorldPosition())`.
- **Sicherheitsnetz:** Liegt der Fokuspunkt auf einer Kachel, die laut
  `unlockedTileIds()` (noch) nicht freigeschaltet ist (sollte durch Phase 3
  nicht vorkommen, da die aktuelle Station immer auf einer bereits
  freigeschalteten oder der soeben neu freigeschalteten Kachel liegt — aber
  als Sonnet-Phase explizit prüfen statt stillschweigend vorauszusetzen):
  `applyFocus` bricht ab, wenn `point.tileId` nicht in `unlockedTileIds()`
  steht, und loggt `console.warn` — kein Absturz, aber ein sichtbares Signal
  bei einem Content-/Logikfehler.
- `applyFocus(worldPosition)`: setzt `zoom.set(focusZoom())`, danach
  `panX`/`panY` so, dass `worldPosition` in die Viewport-Mitte rückt (gleiche
  Umkehr-Formel wie der Wheel-Zoom aus Phase 2, Zoom-Zentrum = Viewport-
  Mitte statt Cursor), mit `.map-canvas__world--animated` (Klasse aus
  Phase 2 wiederverwenden).
- Timing: wie in der ersten Planungsrunde — erst ausführen, sobald
  `viewportWidth()`/`viewportHeight()` echte Messwerte haben (`hasMeasured`-
  Signal aus Phase 1/2, vom `ResizeObserver` beim ersten Aufruf gesetzt).

### 2. `timeline.ts` + `timeline.html`

```ts
protected readonly focusStageId = computed<string | null>(() => {
  const states = this.stageStateMap();
  const stages = this.world()?.arc_overview.stages ?? [];
  const current = stages.find((stage) => states.get(stage.map_id) === 'current');
  return current?.map_id ?? stages.at(-1)?.map_id ?? null;
});
```

`timeline.html`: `[focusPointId]="focusStageId()"` an `<qst-map-canvas>`.

### 3. `map.ts` + `map.html`

Analoger `focusNodeId`-Computed auf Basis von `nodeStateMap()`/
`mapEntry()?.nodes`. `[focusPointId]="focusNodeId()"`.

### 4. `main-hub.ts` + `main-hub.html`

`[focusPointId]="continueThemeId()"` — vorhandener Computed, unverändert.
`null`, solange nichts gespielt wurde → keine Zentrierung, Standardansicht
bleibt stehen.

## Akzeptanzkriterien

1. Timeline/MapScreen zentrieren beim Öffnen animiert auf die aktuelle
   Station.
2. MainHub zentriert auf die zuletzt gespielte Welt, oder bleibt bei der
   Standardansicht, wenn noch nichts gespielt wurde.
3. Manuelles Zoomen/Pannen nach dem initialen Fokus wird nicht ungefragt
   zurückgesetzt, solange sich der Fokuspunkt nicht ändert.
4. `prefers-reduced-motion: reduce` zeigt den Fokus-Sprung ohne Animation.
5. Das Sicherheitsnetz (Schritt 1) greift nachweisbar: mit Test-Content, bei
   dem der Fokuspunkt absichtlich auf eine gesperrte Kachel zeigt, bricht
   `applyFocus` sauber ab (Konsole zeigt die Warnung, kein Absturz, keine
   falsche Ansicht).

## Report-Back

Umgesetzt wie geplant: `focusPointId`/`focusZoom` als neue Inputs auf
`MapCanvas`, `focusPoint`/`focusWorldPosition` als Computeds (nutzen die
bestehende `resolveTileOrigin`, keine Duplikation), `applyFocusEffect` mit
`lastAppliedFocusId`-Wächter gegen wiederholtes Zentrieren, `applyFocus()`
spiegelt die Umkehr-Formel aus `zoomAround`/`setWorldEdge` mit der
Viewport-Mitte statt dem Cursor als Zentrum. `timeline.ts` und `map.ts`
bekamen je einen `focusStageId`/`focusNodeId`-Computed (aktuelle Station,
sonst die letzte), `main-hub.html` bindet direkt `continueThemeId()` — dessen
Rückgabewert ist bereits die `theme.id`, die auch als `MapCanvasPoint.id`
dient, kein Adapter nötig. `prefers-reduced-motion` brauchte keine eigene
Behandlung: die Animation läuft über den bestehenden Token
`--duration-map-view`, der bei reduzierter Bewegung schon global auf `0ms`
steht.

**Abweichung vom Plantext:** Das erwähnte `hasMeasured`-Signal aus „Phase 1/2"
existierte nicht — nur `viewportWidth`/`viewportHeight` mit `TILE_SIZE`-
Platzhalter als Startwert. Neu angelegt (`hasMeasured`, vom `ResizeObserver`
beim ersten echten Messwert gesetzt), sonst hätte der Fokus-Effekt beim ersten
Lauf mit dem Platzhalterwert statt der echten Viewportgröße zentriert.

Build und Lint grün.

**Smoke (User, priorisiert nach Konfidenz):**
1. Timeline/MapScreen öffnen — zentriert die Ansicht animiert auf die
   aktuelle Station? (AK 1)
2. MainHub öffnen, nachdem etwas gespielt wurde — zentriert auf die zuletzt
   gespielte Welt? Frisches Savegame ohne Fortschritt — bleibt die
   Standardansicht stehen, kein Sprung? (AK 2)
3. Nach dem automatischen Fokus manuell zoomen/ziehen, Screen nicht
   verlassen — bleibt die eigene Ansicht stehen (kein ungefragtes
   Zurückspringen)? (AK 3)
4. Mit `prefers-reduced-motion: reduce` (Betriebssystem-Einstellung) öffnen —
   springt die Ansicht ohne Animation? (AK 4)
5. 🟡 **AK 5 (Sicherheitsnetz) ist nicht praktisch nachstellbar ohne
   absichtlich kaputten Content** — verifiziert durch Code-Lesen
   (`applyFocusEffect` bricht ab und loggt `console.warn`, wenn
   `point.tileId` nicht in `unlockedTileSet()` steht), nicht durch einen
   Live-Repro. Bei Bedarf mit einem Test-Datensatz nachstellbar, in dem eine
   Etappe auf eine noch gesperrte Kachel zeigt.
