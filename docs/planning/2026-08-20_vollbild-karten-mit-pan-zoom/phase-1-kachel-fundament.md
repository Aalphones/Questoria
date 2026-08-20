# Phase 1 — Kachel-Fundament

**Rating:** standard (kein Gesten-/Persistenz-Code, aber mehr Geometrie als
eine reine Layout-Phase — sorgfältig lesen)

## Kontext (lesen, bevor du anfängst)

- `frontend/src/app/ui/map-canvas/map-canvas.ts`/`.html`/`.scss` — bestehende
  Komponente, wird umgebaut (nicht neu geschrieben — Routen-Rendering/
  `buildRoutePath` bleiben strukturell erhalten).
- `frontend/src/app/ui/map-canvas/map-canvas.types.ts` — `MapCanvasPoint`
  (bekommt `tileId`), `MapCanvasRoute` (unverändert).
- `frontend/src/app/ui/map-canvas/map-point/map-point.ts`/`.scss` — **nicht
  ändern**, setzt weiterhin `left/top` in `%` relativ zum nächsten
  positionierten Vorfahren.
- `frontend/src/app/ui/image-slot/image-slot.ts` — unverändert genutzt.
- `frontend/src/app/features/main-hub/`, `frontend/src/app/features/map/`,
  `frontend/src/app/features/timeline/` — alle drei Screens werden in dieser
  Phase auf das neue Kontrakt umgestellt (Details unten je Screen).
- [ADR-017](../../decisions/017-vollbild-doktrin.md) — `overflow: clip`, nie
  `hidden`.
- README dieses Plans → Kontrakt-Sektion (Kachel-Datenmodell, neue Inputs).

## Ziel dieser Phase

`MapCanvas` rendert eine Karte nicht mehr als ein einziges 16:9-Bild, sondern
als eine **Liste von 1024×1024-Kacheln**, jede an einer eigenen `{row, col}`-
Position in einem offenen (nicht auf eine feste Größe begrenzten)
Koordinatensystem. Nicht freigeschaltete Kacheln zeigen einen Nebel-
Platzhalter statt eines Bildes und laden **keine** Bilddatei. Freischaltung
selbst kommt erst in Phase 3 — diese Phase bekommt die Information nur als
fertige Liste (`unlockedTileIds`) von außen gereicht.

**Noch keine Interaktion** (kein Ziehen, kein Zoom) — reines Layout- und
Rendering-Fundament, damit Phase 2 sich nur um Gesten kümmern muss.

## Datenmodell

### `map-canvas.types.ts` — erweitern

```ts
export interface MapCanvasTile {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Aufgelöste Bild-URL — `null` heißt „freigeschaltet, aber Datei fehlt" (zeigt Platzhalter, kein Nebel). */
  readonly url: string | null;
}

export interface MapCanvasPoint {
  readonly id: string;
  readonly tileId: string;
  /** horizontale Position, in % der Kachelbreite (0–100, bezogen auf DIESE Kachel, nicht die ganze Karte) */
  readonly x: number;
  /** vertikale Position, in % der Kachelhöhe */
  readonly y: number;
}

export interface MapCanvasRoute {
  readonly id: string;
  readonly path: string;
  readonly dimmed: boolean;
}
```

`MapCanvasRoute` bleibt unverändert — Routenlinien verbinden weiterhin zwei
Punkte, deren Weltposition sich jetzt nur anders berechnet (siehe unten).

## Umsetzung

### 0. `content.types.ts` — Schema-Grundlage (bricht mit dem Bestand, gewollt)

`pokemon_lesen`s Content wird in Phase 5 ohnehin komplett neu geplant — diese
Phase darf das Schema deshalb **hart** ändern, keine Rückwärtskompatibilität
nötig.

```ts
export interface MapTileDef {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Dateiname unter maps/ bzw. dem Welt-Ordner, quadratisch, 1024×1024 */
  readonly background: string;
}
```

- `HubMap`: `background: string` → `tiles: MapTileDef[]`.
- `InstalledTheme`: neues Pflichtfeld `tile_id: string`.
- `ArcOverview`: `background: string` → `tiles: MapTileDef[]`.
- `ArcStage`: neues Pflichtfeld `tile_id: string`; `x`/`y`-Kommentar ändern
  von „% der Kartenbreite/-höhe" zu „% der Kachelbreite/-höhe (bezogen auf
  `tile_id`)".
- `MapEntry`: `file: string` → `tiles: MapTileDef[]`.
- `MapNode`: neues Pflichtfeld `tile_id: string`; `x`/`y`-Kommentar analog
  ändern.

**Reihenfolge in `tiles[]` ist die Freischalt-Reihenfolge** (Index 0 = Start,
immer freigeschaltet) — Details und wie das mit Fortschritt zusammenhängt:
Phase 3.

### 1. `map-canvas.ts` — Inputs

- `readonly tiles = input<readonly MapCanvasTile[]>([])` — **ersetzt**
  `background`/`backgroundLabel`.
- `readonly points = input<readonly MapCanvasPoint[]>([])` — Typ geändert
  (jetzt mit `tileId`), Name/Signatur-Stelle bleibt.
- `readonly routes = input<readonly RoutePair[]>([])` — unverändert.
- `readonly dimmedPointIds = input<readonly string[]>([])` — unverändert.
- `readonly unlockedTileIds = input<readonly string[]>([])` — **neu**,
  Default leer (= „nichts freigeschaltet", siehe Zwischenzustand-Hinweis
  unten).

### 2. Weltkoordinaten-Rechnung

```ts
const TILE_SIZE = 1024; // Weltkoordinaten == Bildpixel einer Kachel, 1:1

function tileWorldOrigin(tile: MapCanvasTile): { x: number; y: number } {
  return { x: tile.col * TILE_SIZE, y: tile.row * TILE_SIZE };
}

function pointWorldPosition(
  point: MapCanvasPoint,
  tilesById: ReadonlyMap<string, MapCanvasTile>,
): { x: number; y: number } | null {
  const tile = tilesById.get(point.tileId);

  if (tile === undefined) {
    return null; // Content-Tippfehler: Punkt zeigt auf unbekannte Kachel
  }

  const origin = tileWorldOrigin(tile);
  return { x: origin.x + (point.x / 100) * TILE_SIZE, y: origin.y + (point.y / 100) * TILE_SIZE };
}
```

- `computed tilesById = () => new Map(this.tiles().map(t => [t.id, t]))`.
- `computed unlockedTileSet = () => new Set(this.unlockedTileIds())`.
- `computed unlockedTiles = () => this.tiles().filter(t => this.unlockedTileSet().has(t.id))`.
- **Routen-Rechnung (`buildRoutePath`) anpassen:** bisher rechnete sie direkt
  mit `x/100 * VIEWBOX_WIDTH` o. ä. Jetzt: Weltposition beider Punkte über
  `pointWorldPosition()` holen (Punkt muss außerdem zu `points()` gehören —
  gleiche Struktur wie bisher, nur die Positions-Herleitung ändert sich). Ist
  einer der beiden Punkte nicht auflösbar (`null`), Route überspringen
  (gleiches Verhalten wie der bestehende Undefined-Check).

### 3. Bounding-Box der freigeschalteten Fläche

```ts
interface WorldRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

function boundingBoxOf(tiles: readonly MapCanvasTile[]): WorldRect | null {
  if (tiles.length === 0) {
    return null;
  }

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const tile of tiles) {
    const origin = tileWorldOrigin(tile);
    left = Math.min(left, origin.x);
    top = Math.min(top, origin.y);
    right = Math.max(right, origin.x + TILE_SIZE);
    bottom = Math.max(bottom, origin.y + TILE_SIZE);
  }

  return { left, top, right, bottom };
}
```

- `computed unlockedBounds = () => boundingBoxOf(this.unlockedTiles())` —
  `null`, wenn nichts freigeschaltet ist (siehe Zwischenzustand-Hinweis).
- `computed worldWidth = () => { const b = unlockedBounds(); return b === null ? TILE_SIZE : b.right - b.left; }`,
  analog `worldHeight`. Fallback `TILE_SIZE` verhindert Division durch 0, bevor
  überhaupt eine Kachel freigeschaltet ist.

### 4. Viewport-Messung und Cover-Skalierung (Muster wie bisher geplant, jetzt gegen die dynamische Bounding-Box statt eine feste 1600er-Konstante)

- Host-Element per `inject(ElementRef)`, `ResizeObserver` → Signale
  `viewportWidth`/`viewportHeight` (Startwert `TILE_SIZE`, verhindert
  Sprung/NaN vor der ersten Messung — gleiches Muster wie zuvor geplant).
- `computed coverScale = () => Math.max(this.viewportWidth() / this.worldWidth(), this.viewportHeight() / this.worldHeight())`.
- `computed scale = () => this.coverScale()` (Phase 2 macht daraus eine
  Zoom-fähige Version).
- `computed worldOriginOffset = () => { const b = unlockedBounds(); return b === null ? { x: 0, y: 0 } : { x: b.left, y: b.top }; }`
  — der Nullpunkt der sichtbaren Welt verschiebt sich mit den
  freigeschalteten Kacheln, nicht mit dem gesamten (potenziell viel
  größeren) Kachel-Universum aus `tiles()`.
- `computed translateX = () => -this.worldOriginOffset().x * this.scale() + (this.viewportWidth() - this.worldWidth() * this.scale()) / 2`,
  analog `translateY`. (Zentriert die freigeschaltete Bounding-Box im
  Viewport — dieselbe Cover-Zentrierung wie in der ersten Planungsrunde,
  nur bezogen auf die dynamische statt eine feste Weltgröße.)
- `computed worldTransform = () => \`translate(${translateX()}px, ${translateY()}px) scale(${scale()})\``.

### 5. `map-canvas.html`

```html
<div class="map-canvas__world" [style.transform]="worldTransform()">
  @for (tile of tiles(); track tile.id) {
    @if (unlockedTileSet().has(tile.id)) {
      <qst-image-slot
        class="map-canvas__background-tile"
        [src]="tile.url"
        [label]="tile.id"
        [style.left.px]="tile.col * 1024"
        [style.top.px]="tile.row * 1024"
      />
    } @else {
      <div
        class="map-canvas__background-tile map-canvas__background-tile--fog"
        [style.left.px]="tile.col * 1024"
        [style.top.px]="tile.row * 1024"
        aria-hidden="true"
      ></div>
    }
  }

  <svg class="map-canvas__routes" aria-hidden="true">
    @for (route of routePaths(); track route.id) {
      <path
        class="map-canvas__route"
        [class.map-canvas__route--dimmed]="route.dimmed"
        [attr.d]="route.path"
      />
    }
  </svg>

  <ng-content select="qst-map-point" />
</div>

<ng-content />
```

**Wichtiger Unterschied zur ersten Planungsrunde:** Kacheln liegen jetzt in
einem **offenen** Koordinatenraum (beliebige `row`/`col`, kein 4×4-Raster),
deshalb kein CSS-Grid mit `grid-row`/`grid-column` mehr — stattdessen
`position: absolute; left/top` in Pixeln (`col`/`row` × 1024), analog zu
`qst-map-point`. Die SVG-`viewBox` entfällt (kein festes Koordinatensystem
mehr) — Routenpfade werden direkt in denselben Pixel-Weltkoordinaten
gezeichnet wie die Kacheln selbst, das `<svg>` bekommt `overflow: visible`
und keine `viewBox` (siehe SCSS unten).

### 6. `map-canvas.scss`

```scss
:host {
  display: block;
  position: relative;
  inline-size: 100%;
  block-size: 100%;
  overflow: clip; // ADR-017: niemals `hidden`
  container-type: inline-size; // Bezugsgröße für Panel-Breakpoints der Screens
}

.map-canvas {
  &__world {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }

  &__background-tile {
    position: absolute;
    inline-size: 1024px;
    block-size: 1024px;

    &--fog {
      background: color-mix(in srgb, var(--color-map-frame-bg) 85%, var(--palette-ink));
    }
  }

  &__routes {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    overflow: visible;
    pointer-events: none;
  }

  &__route {
    fill: none;
    stroke: var(--color-map-route);
    stroke-width: var(--stroke-map-route);
    stroke-dasharray: var(--dash-map-route);
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;

    &--dimmed {
      stroke: var(--color-map-route-locked);
    }
  }
}
```

**Punkt-Positionierung — die tatsächliche Umsetzung:** `qst-map-point`
erwartet bisher `x`/`y` als `%` eines bekannten Kartenrahmens — das trägt
nicht mehr, weil die Welt jetzt offen wächst und keine feste Breite hat.
Zwei gezielte Änderungen lösen das:

- `map-point.ts`: Bedeutung von `x`/`y` ändert sich von „% der Kartenbreite"
  zu „absolute Weltkoordinate in Pixeln". Host-Bindings ändern sich von
  `[style.left.%]`/`[style.top.%]` zu `[style.left.px]`/`[style.top.px]`.
  Sonst keine Änderung an der Komponente.
- `map-canvas.ts` exportiert eine reine, freistehende Funktion (Modul-Ebene,
  wie `buildRoutePath`, kein Service):
  ```ts
  export function resolveTileOrigin(
    tiles: readonly MapCanvasTile[],
    tileId: string,
  ): { x: number; y: number } | null {
    const tile = tiles.find((t) => t.id === tileId);
    return tile === undefined ? null : { x: tile.col * TILE_SIZE, y: tile.row * TILE_SIZE };
  }
  ```
  Jeder Screen importiert diese Funktion und rechnet in seinem eigenen
  Template die Pixel-Position aus der kachelrelativen Prozentangabe des
  Contents aus, z. B. in `timeline.ts`:
  ```ts
  protected pointX(tileId: string, percentX: number): number {
    const origin = resolveTileOrigin(this.tiles(), tileId);
    return origin === null ? 0 : origin.x + (percentX / 100) * 1024;
  }
  ```
  und im Template `[x]="pointX(stage.tile_id, stage.x)"` statt bisher
  `[x]="stage.x"`. **Screens ändern damit ihre Bindungslogik**, nicht ihre
  Struktur — die Content-Felder (`stage.x`/`stage.y`, jetzt zusätzlich
  `stage.tile_id`) bleiben, wie der Content sie liefert (Phase 5).

**Container-Query-Bezug für `size` (cqw) an `qst-map-point`:** `.map-canvas__world`
bekommt **kein** `container-type` mehr (keine feste Breite, cqw wäre dort
bedeutungslos, weil die Welt wächst). Stattdessen bekommt **`:host`**
`container-type: inline-size` (siehe SCSS oben) — `size` an Kartenpunkten
bezieht sich damit auf die Bildschirmbreite des Kartenausschnitts, nicht auf
eine Weltgröße. Sichtbarer Effekt: ein Punkt mit `size="8"` ist ab jetzt 8 %
der **Bildschirmbreite**, nicht 8 % einer 1600px-Weltbreite — bei Zoom (Phase
2) bleibt die Bildschirmgröße eines Punkts also konstant, statt mit der Welt
mitzuskalieren. **Das ist eine bewusste Verhaltensänderung**, kein Fehler:
Punkte sollen bei jedem Zoomstand gut antippbar bleiben, nicht mit dem Bild
mitschrumpfen/-wachsen.

### 7. Screens umstellen

Alle drei Screens bekommen ein neues `tiles`-Computed (baut `MapCanvasTile[]`
aus dem jeweiligen Content-Feld, siehe Phase 5 für das genaue Schema —
`ArcOverview.tiles`/`MapEntry.tiles`/`HubMap.tiles`), binden es an
`[tiles]="…"` statt der bisherigen `[background]`/`[backgroundLabel]`. Für
`unlockedTileIds` in dieser Phase: **noch keine echte Berechnung** (kommt in
Phase 3) — vorübergehend `[unlockedTileIds]="tiles().map(t => t.id)"` (alles
offen) binden, damit die Screens in dieser Phase überhaupt sichtbar bleiben.
Phase 3 ersetzt diese Zeile durch die echte Fortschritts-Berechnung.

`main-hub.scss`: `.main-hub__backdrop` + `main-hub.ts` `backdropImage`
entfernen (weichgezeichnete Randfüllung war fürs alte Passepartout gedacht,
mit dieser Phase überflüssig — Chesterton's-Fence-Hinweis wie in der ersten
Planungsrunde). `.main-hub`/`.map`/`.timeline`: `padding`,
`background: var(--color-map-frame-bg)`, Zentrierung, `container-type: size`
entfernen — die Kartenfläche füllt jetzt selbst die ganze Bühne.

## 🟡 Erwarteter Zwischenzustand vor Phase 5/6

`pokemon_lesen`s Content trägt noch keine `tiles`/`tile_id`-Felder, bis
Phase 5 sie einführt. Für die Sichtprüfung dieser Phase genügt ein
**Test-Content-Fragment** (z. B. zwei Kacheln mit den drei bestehenden Orten
verteilt) — Wegwerf-Material, kein Teil der Umsetzung.

## Akzeptanzkriterien

1. Mit Test-Content zeigen alle drei Screens ihre Kacheln randlos, zentriert
   auf die (im Test: alle) freigeschalteten Kacheln, kein Rahmen.
2. Setzt man `unlockedTileIds` im Test auf eine Teilmenge, zeigen die
   übrigen Kacheln den Nebel-Platzhalter und lösen **keinen**
   Bild-Request aus (DevTools → Network prüfen).
3. Kartenpunkte sitzen auf der richtigen Stelle ihrer jeweiligen Kachel,
   auch wenn diese nicht bei `{row: 0, col: 0}` liegt.
4. Routenlinien verbinden weiterhin die richtigen Punkte, auch über
   Kachelgrenzen hinweg.
5. Panel/Legende/Erfolge/Kompass unverändert an ihrer Bildschirmecke.
6. `npm run build` läuft ohne neue TypeScript-/Template-Fehler durch.

## Doc-Updates

- `docs/code-map.md` Zeile „Kartenfläche": Beschreibung auf „kachelbasierte,
  fortschrittsgesteuerte Kartenfläche, offenes Koordinatensystem" aktualisieren.

## Report-Back

*(nach Umsetzung ausfüllen)*
