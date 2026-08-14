# Phase 3 — Kartenfläche: Knoten, Routen, Bildplatzhalter

**Rating:** heikel (neue Geometrie, Bauteil für drei Screens, korrigiert zwei
bekannte Fehler des Prototyps)

Drei Screens zeichnen dieselbe Karte: Planetenkarte, Etappenkarte, Ortskarte.
Diese Phase baut das gemeinsame Bauteil — einmal richtig, statt dreimal ähnlich.

## Kontext — vorher lesen

- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitte 2, 4, 5 (die drei
  Kartenscreens) und „Interaktionen & Verhalten" → Animationstabelle
- [docs/design/README.md](../../design/README.md) → „Offene Punkte": genau die
  zwei Fehler, die hier behoben werden
- [docs/conventions/css.md](../../conventions/css.md) — Zwei-Ebenen-Tokens,
  Critical Rule 3 (Laufzeitwerte über gebundene Custom Properties)
- [docs/conventions/angular.md](../../conventions/angular.md) — `ui/`-Ordner für
  wiederverwendete Bausteine, `input()`/`output()`, OnPush, `ng generate`
- [frontend/src/styles/_tokens.scss](../../../frontend/src/styles/_tokens.scss)
- [frontend/src/app/models/content.types.ts](../../../frontend/src/app/models/content.types.ts)
  → `RoutePair`

## Was hier gebaut wird

| Bauteil | Ordner | Aufgabe |
|---|---|---|
| `qst-map-canvas` | `ui/map-canvas/` | Kartenfläche im Seitenverhältnis 16:9, Hintergrund, Routenlinien |
| `qst-map-point` | `ui/map-canvas/map-point/` | Setzt ein beliebiges Kind auf eine Prozent-Position der Karte |
| `qst-image-slot` | `ui/image-slot/` | Bild mit beschriftetem Platzhalter, wenn die Datei fehlt |

Die Knoten selbst (Insel, Ortspunkt, Weltkugel) bauen die Screens — sie sehen
pro Screen anders aus. Gemeinsam ist nur die Geometrie.

## Akzeptanzkriterien

1. Eine Demo mit zwei Knoten und einer Route sitzt bei **jeder** Fensterbreite
   auf denselben Punkten des Hintergrundbilds; die Route trifft beide Knoten
   mittig, ihre Strichstärke bleibt konstant.
2. Knotengrößen skalieren mit der Kartenbreite (Angabe in Prozent der
   Kartenbreite, nicht in Pixeln) — bei 360 px Fensterbreite überlappen die
   Knoten der Testwelt nicht.
3. Fehlt das Hintergrundbild, steht an seiner Stelle eine gestrichelte Fläche
   mit dem erwarteten Dateinamen — kein zerbrochenes Bildsymbol, kein Absturz.
   Gilt auch, wenn der Server statt des Bildes eine HTML-Seite mit `200`
   liefert (bekanntes Verhalten des Pakets).
4. Bei `prefers-reduced-motion: reduce` steht jede Dauerbewegung still.
5. Kein Hex-Wert, keine rohe Pixelgröße in einem der drei
   Komponenten-Stylesheets.

## Checkliste

### Tokens (`frontend/src/styles/_tokens.scss`)

- [x] Zweck-Tokens für Fortschrittszustände ergänzen — die Screens sollen
      `done/current/locked` einfärben, ohne die Palette anzufassen:
      `--color-progress-done` (Moos 500), `--color-progress-done-strong`
      (Moos 600), `--color-progress-current` (Akzent 300),
      `--color-progress-current-strong` (Akzent 500), `--color-progress-locked`
      (Neutral 300), `--color-progress-locked-strong` (Neutral 400).
- [x] Karten-Tokens: `--color-map-route` (Akzent 500),
      `--color-map-route-locked` (Neutral 400), `--color-map-ring`
      (Akzent 200 @70 %), `--color-map-chart-bg` (Moos 300),
      `--color-map-chart-line` (Neutral 100 @42 %), `--color-map-label-bg`
      (Neutral 100).
- [x] Größen aus dem Design als Tokens statt als Zahlen im Stylesheet:
      `--size-map-chip: 52px`, `--size-map-point: 32px`,
      `--size-map-point-current: 46px`, `--ring-map-node: 10px`,
      `--ring-map-point: 6px`, `--stroke-map-route: 7px`.
- [x] Bewegungs-Tokens `--duration-ambient: 5s` und `--duration-pulse: 2s`,
      beide im `prefers-reduced-motion`-Block auf `0s` — damit steht die
      Bewegung über denselben Schalter still wie `--duration-fast`.

### Gemeinsame Bewegungen

- [x] `frontend/src/styles/_motion.scss` neu: die zwei Bildfolgen aus dem
      Design-Handoff, die mehrere Komponenten brauchen — `eqBob`
      (`translateY(0 → -7px → 0)`) und `eqPulse` (`scale(1 → 1.14 → 1)`) —,
      global über `styles.scss` eingebunden.
      **Bewusste Abweichung** von `css.md` („Animationen im
      Komponenten-Stylesheet"): gekapselte Keyframes wären in drei Komponenten
      dreimal dasselbe. Komponenten setzen nur noch `animation-name` und die
      Dauer aus dem Token. Eine Zeile dazu in `docs/conventions/css.md`.

### `qst-image-slot` (`ui/image-slot/`)

- [x] `ng generate component ui/image-slot --skip-tests`
- [x] Eingaben: `src = input<string | null>(null)`, `label = input.required<string>()`
      (Text im Platzhalter, üblicherweise der erwartete Dateiname).
- [x] Bild über `NgOptimizedImage` (`[ngSrc]`, `fill`, `sizes="100vw"`) —
      Konvention für statische Bilder.
- [x] Internes Signal `failed`; `(error)` auf dem Bild setzt es. Ist `src` leer
      oder `failed` gesetzt → gestrichelte Fläche mit `label` anzeigen.
      **Das Fehler-Ereignis ist die einzige verlässliche Quelle** — der Server
      antwortet auf fehlende Dateien mit `200` und HTML.
- [x] Wechselt `src`, wird `failed` zurückgesetzt (`effect` oder `computed`
      über die Eingabe — kein hängender Fehlerzustand beim Kartenwechsel).

### `qst-map-canvas` (`ui/map-canvas/`)

- [x] `ng generate component ui/map-canvas --skip-tests`
- [x] Eingaben:
  - `background = input<string | null>(null)` — Bildadresse; `null` = keine
    Bildfläche (die Etappenkarte zeichnet stattdessen ihr Gitternetz)
  - `backgroundLabel = input<string>('')` — Text für den Platzhalter
  - `points = input<readonly MapCanvasPoint[]>([])` — `{ id, x, y }`, nur für
    die Routengeometrie
  - `routes = input<readonly RoutePair[]>([])`
  - `dimmedPointIds = input<readonly string[]>([])` — Routen, deren Ende hier
    steht, werden neutral gezeichnet
- [x] `map-canvas.types.ts` für `MapCanvasPoint`.
- [x] Fläche: `aspect-ratio: 16 / 9`, `container-type: inline-size`,
      `position: relative`, volle Breite. **Das feste Seitenverhältnis ist der
      ganze Trick** — dadurch stimmen Bild, Knoten und Routen zusammen, ohne
      dass etwas verzerrt gestreckt werden muss.
- [x] Routenebene: ein `<svg>` über die volle Fläche, `viewBox="0 0 1600 900"`,
      **ohne** `preserveAspectRatio="none"` (der Fehler des Prototyps),
      `pointer-events: none`.
- [x] Pfadberechnung als `computed()`, nicht im Template:
  - Prozent → viewBox: `px = x / 100 * 1600`, `py = y / 100 * 900`
  - `dx`, `dy`, `len = Math.hypot(dx, dy)`; `bow = Math.min(110, len * 0.18)`
  - Kontrollpunkt = Mittelpunkt + Normale (`-dy/len`, `dx/len`) × `bow`
  - Pfad: `M ax ay Q cx cy bx by`
  - Route mit unbekannter Knoten-ID wird **übersprungen**, nicht gezeichnet —
    ein Tippfehler im Content darf keinen Screen abschießen. Bei `len === 0`
    ebenfalls überspringen (Division durch null).
- [x] Linienstil: `--stroke-map-route`, `stroke-dasharray: 16 22`,
      `stroke-linecap: round`, `fill: none`, **`vector-effect: non-scaling-stroke`**
      — ohne das wird die Linie beim Skalieren dick.
- [x] `<ng-content>` für die Knoten, über der Routenebene.

### `qst-map-point` (`ui/map-canvas/map-point/`)

- [x] `ng generate component ui/map-canvas/map-point --skip-tests`
- [x] Eingaben: `x = input.required<number>()`, `y = input.required<number>()`
      (Prozent), `size = input<number | null>(null)` (Prozent der Kartenbreite).
- [x] Positionierung über `host`-Bindungen: `[style.left.%]="x()"`,
      `[style.top.%]="y()"`, dazu `position: absolute; translate: -50% -50%` im
      Stylesheet.
- [x] Größe als Custom Property für die projizierten Kinder:
      `[style.--map-point-size]` auf `${size()}cqw` — Container-Einheiten machen
      die Größe zum Anteil der Kartenbreite. **Das behebt den zweiten
      Prototyp-Fehler** (dort Pixel, dadurch überlappende Knoten auf kleinen
      Bildschirmen). Nimmt Angular die Bindung auf eine Custom Property nicht
      an, stattdessen `setProperty` in einem `effect()` — Verhalten identisch,
      kein Umbau.
- [x] `:host` bekommt ein `display` (Konvention) und `z-index` über der
      Routenebene.

### Doku

- [x] `docs/code-map.md`: `ui/map-canvas/`, `ui/image-slot/` und
      `src/styles/_motion.scss` eintragen.
- [x] `docs/design/README.md` → „Offene Punkte": beide 🟡 als erledigt
      markieren, mit einem Halbsatz **wie** sie gelöst wurden (Container-
      Einheiten, festes Seitenverhältnis) — nicht kommentarlos löschen.
- [x] `docs/conventions/css.md`: eine Zeile zu den gemeinsamen Bewegungen in
      `_motion.scss`.

## Risiken

- 🟡 Container-Einheiten (`cqw`) verhalten sich nur so, wie hier gerechnet,
  solange **die Kartenfläche selbst** der Container ist. Wer später ein
  `container-type` auf ein Elternelement setzt, verschiebt den Bezug still.
  Kommentar an der Stelle im Stylesheet.

## Report-Back

**Status: complete** (14.08.2026). `npm run build` und `npm run lint` grün.

Gebaut wie geplant: `qst-map-canvas` (16:9-Fläche, `container-type: inline-size`,
SVG-Routenebene mit `viewBox="0 0 1600 900"` ohne Verzerrung),
`qst-map-point` (Prozent-Position, Größe als `cqw`) und `qst-image-slot`
(Platzhalter über das Fehler-Ereignis des Bildes). Tokens für
Fortschrittszustände, Kartenfarben, Kartenmaße und die zwei Dauerbewegungen
liegen in `_tokens.scss`, die geteilten Keyframes in `_motion.scss`.

**Zwei Abweichungen — beide vom Plan als Ausweichweg vorgesehen bzw. klein:**

1. **Größe wird direkt gesetzt statt gebunden.** `[style.--map-point-size]` ist
   in Angular nicht zugesichert; `map-point.ts` setzt die Custom Property in
   einem `effect()` über `style.setProperty`. Der Plan nennt genau diesen
   Ausweichweg, Verhalten identisch.
2. **Temporäres Prüfbild `features/map-demo/` unter `/map-demo`.** Die
   Akzeptanzkriterien 1–4 lassen sich nur am Bildschirm prüfen, und die echten
   Kartenscreens kommen erst in Phase 6–8. Das Prüfbild zeigt die drei Knoten
   der Testwelt, zwei Routen, eine absichtlich ins Leere zeigende Route und den
   Bildplatzhalter. Fällt mit Phase 7 weg (Eintrag in FINDINGS.md).

**Neue Tokens, die die Screens ab Phase 6 benutzen sollen:**
`--color-progress-*` (done/current/locked, je normal + `-strong`),
`--color-map-route`, `--color-map-route-locked`, `--color-map-ring`,
`--color-map-chart-bg`, `--color-map-chart-line`, `--color-map-label-bg`,
`--size-map-chip`, `--size-map-point`, `--size-map-point-current`,
`--ring-map-node`, `--ring-map-point`, `--stroke-map-route`,
`--dash-map-route`, `--border-width-placeholder`.

**Nicht geprüft:** alles Sichtbare. Ob Knoten und Routen auf schmalen Fenstern
wirklich sitzen (AK 1–3) und ob die Bewegung bei `prefers-reduced-motion`
stillsteht (AK 4), sieht erst der Blick auf `/map-demo`.
