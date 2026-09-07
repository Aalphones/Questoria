# Phase 2 — Nebel als eigene Schicht

**Rating:** heikel — neue Rendering-Schicht, und die Entscheidung, wie weicher
Nebel in Weltkoordinaten entsteht, fällt hier.

**Setzt voraus:** Phase 1 (braucht `visibleBounds` und `unlockedBounds` als
getrennte Rechnungen).

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `frontend/src/app/ui/map-canvas/map-canvas.html` | die Kachel-Schleife und die Reihenfolge der Schichten |
| `frontend/src/app/ui/map-canvas/map-canvas.scss` | `.map-canvas__background-tile--fog` (fliegt raus) |
| `frontend/src/app/ui/map-canvas/map-canvas.ts` | `unlockedTileSet`, `visibleBounds` aus Phase 1 |
| `frontend/src/styles/_tokens.scss` | Zweck-Token-Ebene, hier kommen drei Token dazu |
| `docs/conventions/css.md` | Komponenten sehen nur Zweck-Tokens |

## Der Befund

`map-canvas.html` zeichnet für jede gesperrte Kachel ein `<div>` mit der Klasse
`--fog`. Dessen einzige Gestaltung steht in `map-canvas.scss:32`:

```scss
&--fog {
  background: color-mix(in srgb, var(--color-map-frame-bg) 85%, var(--palette-ink));
}
```

Eine Volltonfläche, 1024 × 1024 px, mit messerscharfer Kante zur Nachbarkachel.
Auf der Ortskarte Alabastia besteht die Karte aus zwei Kacheln — ist eine davon
gesperrt, ist die halbe Karte ein beiger Klotz. Das ist der Hauptgrund für das
Urteil „grafisch schlecht".

**Chesterton's Fence — warum es so gebaut wurde:** Der `--fog`-Zweig existiert,
damit für gesperrte Kacheln **keine Bildanfrage** rausgeht (ADR-020,
Kachel-Freischaltung). Diese Eigenschaft ist wertvoll und bleibt: auch nach
dieser Phase wird für eine gesperrte Kachel kein `<qst-image-slot>` erzeugt.
Nur die sichtbare Fläche wandert von N Kacheldivs in **eine** Schicht.

## Entscheidungen

**E1 — Der Nebel ist eine SVG-Schicht in Weltkoordinaten, keine Kacheln.**
Eine `<svg class="map-canvas__fog">` liegt im `__world`-Element und spannt die
`visibleBounds` aus Phase 1 auf. Sie enthält zwei gefüllte Rechtecke über der
ganzen Fläche, jedes durch eine eigene Maske gelöchert.

**E2 — Die Löcher sind die freigeschalteten Kacheln, weichgezeichnet.**
Jede Maske ist: ein weißes Rechteck über die gesamte Fläche (= Nebel sichtbar),
darüber eine Gruppe schwarzer Rechtecke — je eines pro freigeschalteter Kachel,
in Weltkoordinaten — und auf dieser Gruppe ein `feGaussianBlur`. Aneinander
grenzende Kacheln ergeben eine zusammenhängende schwarze Fläche, deren Inneres
uniform ist; eine Naht zwischen zwei freigeschalteten Nachbarn kann dabei nicht
entstehen.

**E3 — Zwei Lagen statt einer, damit es nach Dunst aussieht und nicht nach
Weichzeichner.** Eine enge, kräftige Lage und eine weite, schwache:

| Lage | Weichzeichnung (Weltpixel) | Deckkraft |
|---|---|---|
| Kern | 48 | 0.96 |
| Hof | 190 | 0.5 |

Die Weichzeichnung steht in Weltpixeln und skaliert deshalb mit der Karte mit —
beim Hineinzoomen wird die Nebelkante genauso größer wie das Gelände darunter.
Das ist beabsichtigt: der Nebel gehört zur Welt, nicht zur Bedienoberfläche.

**E4 — Der Nebel liegt über Gelände und Routen, unter den Knoten.**
Reihenfolge im `__world`: Kacheln → Routen → **Nebel** → `qst-map-point`.
Eine Route, die in gesperrtes Gebiet führt, verliert sich damit im Dunst statt
scharf abzubrechen. Knoten bleiben oben; ihre Sichtbarkeit regelt Phase 3.

**E5 — Farben kommen aus drei neuen Zweck-Tokens**, die Weichzeichnungswerte
als benannte Konstanten aus `map-canvas.ts` (SVG-Attribute, keine CSS-Werte):

```scss
--color-map-fog: var(--palette-neutral-300);
--color-map-fog-deep: color-mix(in srgb, var(--palette-neutral-500) 45%, var(--palette-parchment-deep));
--color-map-void: color-mix(in srgb, var(--palette-ink) 10%, var(--palette-parchment-deep));
```

`--color-map-void` füllt die Fläche **außerhalb** der Karte, die es seit
Phase 1 gibt, wenn vollständig herausgezoomt wird — sie kommt auf den `:host`
der Kartenfläche.

**Alternative, die verworfen wurde:** Weiterhin ein Element pro gesperrter
Kachel, aber mit `mask-image` aus Verläufen je nach Nachbarschaft. Das braucht
pro Kachel die Kenntnis, welche der vier Nachbarn frei sind, also acht
Sonderfälle im Stylesheet und einen Rechenschritt im Bauteil — und bleibt an
Diagonalen trotzdem eckig. Eine Maske über alles kennt keine Sonderfälle.

**🟡 Risiko:** `feGaussianBlur` über eine große Fläche kostet Füllrate. Bei
einer 8×8-Leinwand sind das 8192 × 8192 Weltpixel Filterfläche. Browser rastern
den Filter in Bildschirmauflösung, nicht in Weltauflösung — der Aufwand hängt
also an der Bildschirmgröße, nicht an der Weltgröße. Gegenprobe steht als
Checklistenpunkt: auf dem Tablet ziehen und auf Ruckeln achten. Ruckelt es,
ist der Ausweg `will-change: opacity` auf der Nebelschicht plus Halbierung der
Hof-Weichzeichnung — nicht der Rückbau auf Kacheln.

## Abnahmekriterien

1. Auf keiner Karte ist eine gerade Kante im 1024er-Raster zu sehen, weder an
   der Grenze zum Nebel noch zwischen zwei gesperrten Kacheln.
2. Der Übergang von freigeschalteter Fläche zu Nebel ist ein weicher Verlauf
   über sichtbar mehr als eine Haarlinie.
3. Für eine gesperrte Kachel geht weiterhin **keine** Bildanfrage raus
   (Netzwerk-Tab: keine Anfrage auf `map_*.webp` einer gesperrten Kachel).
4. Eine Route, die zu einem Knoten im Nebel führt, verblasst im Dunst und
   bricht nicht scharf ab.
5. Wird eine Kachel freigeschaltet, weicht der Nebel dort zurück — ohne
   Neuladen der Seite.
6. Vollständig herausgezoomt ist die Fläche außerhalb der Karte in
   `--color-map-void` gefüllt, nicht weiß oder transparent.
7. Ziehen und Zoomen auf dem Tablet bleibt flüssig.

## Checkliste

- [x] `map-canvas.html`: den `@else`-Zweig der Kachel-Schleife (das
      `--fog`-`div`) ersatzlos entfernen. Für gesperrte Kacheln wird nichts
      mehr gezeichnet.
- [x] `map-canvas.scss`: `.map-canvas__background-tile--fog` entfernen.
- [x] `--color-map-frame-bg` aus `_tokens.scss` (Zeile 100) entfernen. Geprüft
      am 31.08.2026: die Nebel-Regel ist der **einzige** Nutzer im ganzen
      Frontend, das Token ist danach tot.
- [x] `_tokens.scss`: die drei Token aus E5 in der Zweck-Ebene ergänzen,
      direkt bei den übrigen `--color-map-*` (dort ab Zeile 90).
- [x] `map-canvas.ts`: Konstanten `FOG_BLUR_CORE = 48`, `FOG_BLUR_HALO = 190`
      mit einem Satz Kommentar, warum zwei Lagen (E3).
- [x] `map-canvas.ts`: `computed` `fogTileRects` — ein Rechteck je
      freigeschalteter Kachel in Weltkoordinaten
      (`{ x: col * TILE_SIZE, y: row * TILE_SIZE }`), plus `fogArea` aus
      `visibleBounds` für das Vollrechteck.
- [x] `map-canvas.html`: `<svg class="map-canvas__fog">` zwischen der
      Routen-`<svg>` und `<ng-content select="qst-map-point" />` einhängen
      (E4). Zwei `<mask>` mit festen IDs (`qst-fog-core`, `qst-fog-halo`), zwei
      `<filter>` mit den Konstanten aus E3, zwei gefüllte `<rect>`.
      `aria-hidden="true"`, `pointer-events: none`.
- [x] `map-canvas.scss`: `.map-canvas__fog` positionieren wie
      `.map-canvas__routes` (absolut, `overflow: visible`, keine Zeigerevents);
      Füllfarben der beiden Rechtecke über `fill: var(--color-map-fog)` bzw.
      `var(--color-map-fog-deep)` und die Deckkraft aus E3.
- [x] `map-canvas.scss`: `:host` bekommt
      `background: var(--color-map-void);` (E5).
- [ ] Auf dem Tablet ziehen und zoomen, auf Ruckeln achten (🟡 oben). Ruckelt
      es: `will-change: opacity` auf `.map-canvas__fog` und `FOG_BLUR_HALO` auf
      `96`; im Report-Back vermerken. **Noch nicht geprüft — Teil der
      Smoke-Checkliste, agentenlose Session prüft nicht selbst am Gerät.**
- [x] `docs/decisions/023-nebel-als-eigene-schicht.md` schreiben.
- [x] `docs/code-map.md`, Zeile „Kartenfläche": Nebel als eigene Schicht
      nachtragen (bisher steht dort nichts dazu).
- [x] `npm run lint`, `npm run build` im Frontend — beide grün, keine der
      Build-Budget-Warnungen betrifft `map-canvas`.

## Report-Back

Umgesetzt wie geplant (E1–E5), keine Abweichung. Kachel-Schleife im Template
rendert jetzt nur noch `unlockedTiles()` direkt statt über `@if`/`@else` —
eine Zeile weniger Verzweigung, gleiche Wirkung. Die zwei `<mask>`-IDs
(`qst-fog-core`, `qst-fog-halo`) sind pro Komponenteninstanz fest verdrahtet;
das ist unkritisch, weil pro Bildschirm immer nur eine `qst-map-canvas`-Instanz
lebt (Planeten-, Etappen- oder Ortskarte, nie zwei gleichzeitig).

**Unsicherste Stelle:** das Ruckel-Risiko aus E3/🟡 — `feGaussianBlur` über die
volle sichtbare Fläche ist am Schreibtisch nicht zu beurteilen, das ist ein
Tablet-Befund. Steht offen in der Smoke-Checkliste der Plan-README, Punkt 1
und 7.
