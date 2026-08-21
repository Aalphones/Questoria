# Phase 2 — Pan- und Zoom-Interaktion

**Rating:** heikel (Gesten-Mathematik, Clamping gegen eine dynamische
Bounding-Box, Concurrency mehrerer aktiver Pointer)

**Empfehlung:** großes Modell (`/model opusplan` bzw. Opus), nicht
Sonnet-Standard — Phasen-Rating gilt, siehe `mode-implementing`.

## Kontext (lesen, bevor du anfängst)

- `frontend/src/app/ui/map-canvas/map-canvas.ts` — Stand nach Phase 1:
  `tiles()`, `points()`, `unlockedTileIds()`, `unlockedTiles`,
  `unlockedBounds` (`WorldRect | null`), `viewportWidth/Height`, `coverScale`,
  `worldTransform`, `TILE_SIZE = 1024`.
- [ADR-017](../../decisions/017-vollbild-doktrin.md) — `overflow: clip`.
- `frontend/src/styles/_tokens.scss` — Token-Namen für diese Phase:
  `--color-map-label-bg`, `--color-accent`, `--color-focus-ring`,
  `--radius-pill`, `--shadow-md`, `--size-touch-target`, `--space-3`,
  `--space-4`.
- `mode-web-frontend` Skill, Abschnitt „Accessibility".

## Ziel dieser Phase

Die Weltebene aus Phase 1 wird per Maus/Touch ziehbar und per Mausrad/Pinch
zoombar — **geklemmt exakt auf die freigeschaltete Bounding-Box**
(`unlockedBounds()`), nicht auf die gesamte, potenziell viel größere
Kachel-Liste aus `tiles()`. Es lässt sich also **nicht** in noch nicht
freigeschaltetes Gebiet pannen.

## Architektur-Entscheidung: kein externes Pan/Zoom-Paket

Wie in der ersten Planungsrunde entschieden: native Pointer Events + Wheel-
Event, keine Library (`panzoom`, `hammerjs`, …). Kurze Begründung fürs ADR
(Kontext/Optionen/Entscheidung/Konsequenzen, 10 Zeilen, Format wie
ADR-017/018): Interaktion ist Drag + Zoom, kein Momentum/Inertia geplant;
volle Kontrolle übers Clamping (Karte darf nie über die freigeschaltete
Fläche hinausragen) und über die Tab-Reihenfolge der Kartenpunkte wird
gebraucht; keine neue Abhängigkeit. Datei:
`docs/decisions/019-panzoom-ohne-bibliothek.md`.

## Umsetzung

### 1. Zustand in `map-canvas.ts`

- `readonly zoom = signal<number>(1)`, `MAX_ZOOM = 2.5`.
- `readonly panX = signal<number>(0)`, `readonly panY = signal<number>(0)` —
  zusätzlicher Versatz zur zentrierten Cover-Position aus Phase 1, im
  selben Pixel-Koordinatenraum wie `translateX()`/`translateY()`.
- `computed scale = () => this.coverScale() * this.zoom()`.
- `computed rawTranslateX = () => -this.worldOriginOffset().x * this.scale() + (this.viewportWidth() - this.worldWidth() * this.scale()) / 2 + this.panX()`,
  analog `rawTranslateY`.
- **Klemmung gegen `unlockedBounds()`:** anders als in der ersten
  Planungsrunde (feste 1600er-Welt) ist die zu deckende Fläche jetzt
  `unlockedBounds()` selbst — `worldWidth()`/`worldHeight()` aus Phase 1
  liefern schon deren Breite/Höhe. Klemm-Funktion bleibt vom Prinzip
  gleich: `clamp(raw, viewportSize, worldPxSize)` → `[Math.min(0,
  viewportSize - worldPxSize), 0]`, wendet sich aber jetzt relativ zum
  bewegten Nullpunkt an (`worldOriginOffset()` verschiebt sich, wenn eine
  neue Kachel freigeschaltet wird und die Bounding-Box wächst — die
  Klemmung berücksichtigt das automatisch, weil sie auf denselben
  `worldWidth()`/`worldHeight()`-Computeds aufsetzt, die Phase 1 schon
  gegen `unlockedBounds()` berechnet).
- `computed translateX = () => clampTranslate(this.rawTranslateX(), this.viewportWidth(), this.worldWidth() * this.scale())`,
  analog `translateY` — **ersetzt** die Phase-1-Version gleichen Namens.
- Wie in der ersten Planungsrunde: `panX`/`panY` selbst werden nicht
  geklemmt, nur das Ergebnis; nach jedem `pointermove` wird `panX`/`panY`
  auf den Wert zurückgerechnet, der das geklemmte `translateX`/`translateY`
  tatsächlich erzeugt hat (verhindert Nachlauf-Sprünge beim Zurückziehen
  vom Rand).
- **Schaltet Phase 3 eine neue Kachel frei** (wächst `unlockedBounds()`),
  bleiben `panX`/`panY` unverändert — der sichtbare Ausschnitt „springt"
  dadurch nicht, er bekommt nur mehr Bewegungsspielraum. Kein Sonderfall
  nötig, ergibt sich aus der Formel.

### 2. Drag (Maus + Touch, ein Pointer)

Unverändert gegenüber der ersten Planungsrunde: `pointerdown`/`pointermove`/
`pointerup` am Host, `DRAG_THRESHOLD_PX = 6`, `setPointerCapture`,
`preventDefault()` erst ab Überschreiten der Schwelle (ein reiner Tap auf
`qst-map-point` bleibt klickbar).

### 3. Zwei-Finger-Pinch (Touch)

Unverändert gegenüber der ersten Planungsrunde: `Map<number, {x,y}>` aktiver
Pointer, Distanz-Verhältnis → `zoom`-Update, Mittelpunkt beider Finger als
Zoom-Zentrum (Formel wie Wheel-Zoom, Punkt 4).

### 4. Mausrad-Zoom (zentriert auf den Cursor)

Unverändert gegenüber der ersten Planungsrunde: manueller
`addEventListener('wheel', handler, { passive: false })`, `WHEEL_STEP =
0.15`, Zoom-Zentrum-Formel (`world = (p - t0) / s0`, `t1 = p - world * s1`,
daraus `panX`/`panY` zurückrechnen).

### 5. Übergangs-Animation, Reset, Doppelklick

Unverändert gegenüber der ersten Planungsrunde: `.map-canvas__world--animated`
mit `transition: transform 300ms var(--easing-standard)`, nur außerhalb von
Drag/Pinch aktiv, `prefers-reduced-motion: reduce` → `transition: none`.
`resetView()`: `zoom.set(1)`, `panX.set(0)`, `panY.set(0)`. `(dblclick)` →
`resetView()`.

### 6. Sichtbare Zoom-Steuerung

Unverändert gegenüber der ersten Planungsrunde: `.map-canvas__zoom-controls`
mit drei Buttons (−, ⤾, +) unten rechts, `--size-touch-target`,
`aria-label`, `:focus-visible`. `zoomBy(delta)`: Zoom-Zentrum = Viewport-
Mitte.

```html
<div class="map-canvas__zoom-controls">
  <button type="button" class="map-canvas__zoom-button" (click)="zoomBy(-0.4)" aria-label="Verkleinern">−</button>
  <button type="button" class="map-canvas__zoom-button" (click)="resetView()" aria-label="Kartenansicht zurücksetzen">⤾</button>
  <button type="button" class="map-canvas__zoom-button" (click)="zoomBy(0.4)" aria-label="Vergrößern">+</button>
</div>
```

```scss
.map-canvas__zoom-controls {
  position: absolute;
  inset-block-end: var(--space-4);
  inset-inline-end: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 2;
}

.map-canvas__zoom-button {
  display: grid;
  place-items: center;
  inline-size: var(--size-touch-target);
  block-size: var(--size-touch-target);
  border: none;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-map-label-bg) 90%, transparent);
  box-shadow: var(--shadow-md);
  color: var(--color-accent);
  font-size: 1.25rem;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
}
```

## 🟡 Kachel-Culling bewusst zurückgestellt

In der ersten Planungsrunde war ein Sichtbarkeits-Culling (nicht sichtbare
Kacheln aus dem DOM nehmen) für ein festes 4×4-Raster (16 Kacheln)
vorgesehen — Textur-/Speichersicherheit bei hohem Zoom. Mit der jetzigen
kleinen, linear wachsenden Kachelzahl (Alabastia-Route: 4 Kacheln, siehe
Phase 5) ist der Speicherdruck deutlich geringer. **Kein Blocker für diese
Phase** — wird nicht gebaut, ist aber sauber nachrüstbar, sobald eine Karte
zweistellig viele freigeschaltete Kacheln gleichzeitig zeigt (Follow-up,
siehe README).

## A11y-Entscheidung (bewusst, im Plan getroffen)

Unverändert gegenüber der ersten Planungsrunde: kein Tastatur-Pan über
Pfeiltasten — Tab-Reihenfolge der `qst-map-point`-Kinder ist unabhängig von
der Pan-Position, Zoom läuft über die drei sichtbaren Buttons.

## Akzeptanzkriterien

1. Ziehen mit Maus/Touch verschiebt die Karte, bleibt aber **exakt** an der
   Grenze der freigeschalteten Bounding-Box hängen — kein Leerraum, aber
   auch kein Zugriff auf nicht freigeschaltetes Gebiet (mit Test-Content aus
   Phase 1 prüfen: zwei freigeschaltete, eine gesperrte Kachel).
2. Mausrad zoomt zentriert auf den Cursor, Pinch zentriert auf den
   Mittelpunkt der Finger, Zoom-Bereich 1×–2,5×.
3. Ein Tap/Klick auf einen Kartenpunkt navigiert weiterhin korrekt, auch
   nach einem vorherigen Drag.
4. Zoom-Steuerung sichtbar, ≥44×44px, per Tab erreichbar.
5. Doppelklick/Doppeltipp setzt Zoom und Position zurück, animiert.
6. `prefers-reduced-motion: reduce` deaktiviert jede Übergangsanimation.
7. Schaltet sich während der laufenden Session eine neue Kachel frei
   (Test: `unlockedTileIds` im Test-Content erweitern), wächst der
   Pan-Spielraum sofort, ohne dass die aktuelle Ansicht springt.
8. ADR-019 existiert unter `docs/decisions/019-panzoom-ohne-bibliothek.md`.

## Doc-Updates

- Neues ADR: `docs/decisions/019-panzoom-ohne-bibliothek.md`.

## Report-Back

**Status: complete** (21.08.2026). Build und Lint grün, am Bildschirm noch
nicht abgenommen.

**Gebaut wie geplant:** drei Signale (`zoom`, `panX`, `panY`), abgeleitete
Position mit Klemmung gegen `unlockedBounds()`, Zurückschreiben der geklemmten
Werte nach jeder Bewegung, Ziehen ab 6 px, Zwei-Finger-Zoom, Mausrad-Zoom auf
den Cursor, Zoombereich 1×–2,5×, drei Bedienknöpfe unten rechts, Doppelklick
setzt zurück. ADR-019 liegt.

**Abweichungen und Zusätze:**

1. **Die Klemmung rechnet in der Kante, nicht im Verschiebewert.** Der Plan
   ließ offen, worauf `clamp` genau angewendet wird. Umgesetzt ist: die
   Bildschirmposition der linken/oberen Kante der freigeschalteten Fläche wird
   geklemmt, der Verschiebewert des Transforms fällt daraus ab. Das macht die
   Rückrechnung (`setWorldEdge`) zur exakten Umkehrung und hält die Formel
   frei vom wandernden Nullpunkt.
2. **`touch-action: none` auf der Kartenfläche** — im Plan nicht erwähnt, ohne
   das scrollt der Browser statt zu ziehen und die Zeigerereignisse brechen
   mittendrin ab. Konsequenz für später: ein Screen, der in der Kartenfläche
   etwas Rollbares unterbringen will, muss das für sein Element zurücknehmen
   (steht auch im ADR).
3. **Zeiger wird erst ab der Ziehschwelle eingefangen**, nicht schon beim
   Aufsetzen. Fängt man ihn sofort ein, landet der Klick eines reinen Tipps
   beim Elternelement statt beim Kartenpunkt — AK 3 wäre gerissen.
4. **Klick-Unterdrückung nach einem Ziehen** (Listener in der Capture-Phase):
   ohne sie öffnet ein Ziehen, das zufällig auf einem Kartenpunkt endet,
   dessen Ort. Im Plan nicht vorgesehen.
5. **Neues Token `--duration-map-view: 300ms`** statt eines rohen Werts im
   Komponenten-Stylesheet; die Bewegungsreduktion setzt es wie die anderen
   Bewegungs-Token auf 0 — deshalb steht die Medienabfrage nicht mehr in der
   Komponente.

**Nicht prüfbar in dieser Phase:** AK 1 (Anschlag an einer gesperrten Kachel)
und AK 7 (wachsender Spielraum ohne Springen) — bis Phase 3 melden alle drei
Screens jede Kachel als freigeschaltet. Als Finding an Phase 3 getaggt.

**Unsicherste Stelle:** `map-canvas.ts` → `updatePinch()`. Die Reihenfolge
„erst um die Mittelpunkt-Verschiebung schieben, dann um den Mittelpunkt
zoomen" ist rechnerisch stimmig, aber echtes Zwei-Finger-Verhalten hat noch
kein Mensch angefasst. Prüfen: mit zwei Fingern gleichzeitig zoomen **und**
schieben — wandert die Karte dabei unter den Fingern weg, sitzt der Fehler
hier.
