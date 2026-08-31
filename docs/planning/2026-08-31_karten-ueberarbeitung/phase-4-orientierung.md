# Phase 4 — Orientierung: Minikarte und Legende

**Rating:** standard — neue Anzeige, aber alle Zahlen dafür liegen in der
Kartenfläche bereits vor.

**Setzt voraus:** Phase 1 (braucht `visibleBounds` und den Maßstab als Signal)
und Phase 2 (die Minikarte zeigt dieselbe Nebelform).

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `frontend/src/app/ui/map-canvas/map-canvas.ts` | `visibleBounds`, `scale`, `translateX/Y`, `viewportWidth/Height` |
| `frontend/src/app/ui/map-canvas/map-canvas.html` | wohin die Minikarte kommt (außerhalb `__world`!) |
| `frontend/src/app/ui/map-canvas/map-canvas.scss` | `__zoom-controls` als Vorbild für schwebende Bedienelemente |
| `frontend/src/styles/_breakpoints.scss` | `$map-narrow` = 42rem, Container-Query-Schwelle |
| `docs/conventions/css.md` | Container Queries für komponenteneigene Umbrüche |

## Der Befund

Es gibt keine Orientierungshilfe. Auf einer Karte aus mehreren Kacheln, halb im
Nebel, hineingezoomt, weiß niemand, wo er ist. Das Konzept löst das mit einer
Minikarte oben rechts, in der ein Rechteck den sichtbaren Ausschnitt zeigt.

🟡 **Im Konzept ist die Minikarte ausdrücklich eine Attrappe** — ein festes
`<div>` mit fixen Pixelwerten (`left: 70px; top: 52px`). Die eigene README sagt
dazu: „Für die Angular-Version sollte sie die echte Viewport-Position
widerspiegeln." Genau das wird hier gebaut; die Attrappe wäre schlimmer als
nichts, weil sie eine Auskunft vortäuscht.

## Entscheidungen

**E1 — Die Minikarte lebt in `map-canvas`, nicht in den Screens.**
Alle nötigen Zahlen (Fläche, Maßstab, Verschiebung, Kachelzustand) liegen dort.
Ein Screen, der sie selbst zeichnen müsste, bräuchte Ausgänge für den halben
inneren Zustand der Kartenfläche. Neuer Eingang: `showMinimap` (Vorgabe `true`).

**E2 — Die Minikarte ist eine verkleinerte Kopie derselben Geometrie, kein
zweites Bild.** Sie zeichnet in einer eigenen kleinen `<svg>`:

- ein Rechteck über `visibleBounds` in `--color-map-void`,
- ein Rechteck pro **freigeschalteter** Kachel in `--color-map-chart-bg`,
- einen Punkt pro Knoten, in derselben Farbe wie sein Zustand,
- ein Rahmen-Rechteck für den sichtbaren Ausschnitt in `--color-accent`.

Kartenbilder werden **nicht** verkleinert eingebettet. Sechs 1024er-Bilder
nochmal zu laden und auf 160 px zu quetschen kostet Bandbreite und liefert
Matsch; die Kachelform allein beantwortet „wo bin ich" vollständig.

**E3 — Das Ausschnitt-Rechteck rechnet sich aus dem, was ohnehin da ist.**
In Weltkoordinaten:

```
x      = (0 - translateX) / scale
y      = (0 - translateY) / scale
breite = viewportWidth  / scale
höhe   = viewportHeight / scale
```

`translateX/Y` sind heute `private`. Sie werden `protected`, damit das Template
sie sieht — kein neuer Zustand, keine zweite Rechnung, die auseinanderlaufen
könnte.

**E4 — Die Minikarte ist eine Anzeige, kein Bedienelement.** Kein Klick, kein
Ziehen darin. Sie bekommt `aria-hidden="true"` und stattdessen eine
Textauskunft für Hilfstechnik: eine `aria-live="polite"`-Region, die bei
Änderung des Zoomstands meldet „Ganze Karte sichtbar" bzw. „Ausschnitt
vergrößert". Grund: ein zweites, kleineres Ziehfeld neben dem großen ist für
Grundschulkinder eine Fehlerquelle, kein Gewinn — und das Konzept schreibt
selbst „Sie sollte nicht die eigentliche Map-Interaktion duplizieren."

**E5 — Legende nur dort, wo sie etwas erklärt.** Eine feste Legende wie im
Konzept (vier Farbpunkte in der Seitenleiste) verbraucht dauerhaft Fläche für
eine Information, die man einmal braucht. Stattdessen: ein Knopf „Was bedeuten
die Zeichen?" unter den Zoom-Knöpfen, der einen `<dialog>` mit den vier
Zuständen aus Phase 3 öffnet — Symbol, Name, ein Halbsatz. Das ist die
optionale, dezente Erklärung, die für jede nicht-triviale Anzeige gefordert
ist, ohne die Karte zuzustellen.

**E6 — Auf schmalen Karten weicht die Minikarte.** Unterhalb `$map-narrow`
(42rem Kartenbreite) wird sie ausgeblendet, wie es die Kompassrose auf der
Ortskarte schon tut. Auf einem Handy ist der Ausschnitt ohnehin fast die ganze
Karte. Das Container-Query steht in `map-canvas.scss`, weil der Bezug die
Kartenbreite ist, nicht die Fensterbreite.

## Abnahmekriterien

1. Oben rechts auf allen drei Kartenebenen liegt eine Minikarte, die die
   Kachelform der Karte zeigt und sich nicht mitbewegt, wenn die Karte
   gezogen wird.
2. Das Ausschnitt-Rechteck darin bewegt sich beim Ziehen gegenläufig zur
   Karte und passt in Größe zum Zoomstand.
3. Vollständig herausgezoomt füllt das Rechteck die Minikarte ganz.
4. Freigeschaltete und gesperrte Kacheln sind in der Minikarte unterscheidbar.
5. Die Minikarte hat keinen Klick- und keinen Ziehbereich; ein Klick darauf
   verändert die Karte nicht.
6. Der Knopf „Was bedeuten die Zeichen?" öffnet einen Dialog mit allen vier
   Zuständen aus Phase 3; der Dialog fängt den Fokus und gibt ihn beim
   Schließen an den Knopf zurück.
7. Unter 42rem Kartenbreite ist die Minikarte weg, die Zoom-Knöpfe und der
   Legenden-Knopf bleiben.
8. Zoom-Knöpfe, Legenden-Knopf und Dialog-Schließknopf sind mindestens
   44 × 44 px.

## Checkliste

- [ ] `map-canvas.ts`: `showMinimap = input<boolean>(true)`.
- [ ] `map-canvas.ts`: `translateX` / `translateY` von `private` auf
      `protected` (E3).
- [ ] `map-canvas.ts`: `computed` `viewportRect` (E3) und `minimapTiles`
      (Rechtecke aller Kacheln plus Flag „freigeschaltet").
- [ ] `map-canvas.ts`: `computed` `zoomAnnouncement` — Text für die
      `aria-live`-Region (E4), zwei Zustände genügen.
- [ ] `map-canvas.html`: `<aside class="map-canvas__minimap">` **außerhalb**
      von `.map-canvas__world` einhängen, sonst wird sie mitverschoben und
      mitskaliert. Darin die `<svg>` mit `viewBox` = `visibleBounds`.
- [ ] `map-canvas.html`: `<p class="visually-hidden" aria-live="polite">` mit
      `zoomAnnouncement`. `.visually-hidden` steht bereits global in
      `frontend/src/styles.scss` (geprüft am 31.08.2026, vier Nutzer) — nichts
      neu anlegen.
- [ ] `map-canvas.html`: Knopf „Was bedeuten die Zeichen?" in
      `__zoom-controls` ergänzen, plus `<dialog class="map-canvas__legend">`.
      Die vier Zustände als `<dl>`, jeder mit demselben Symbol wie auf der
      Karte.
- [ ] `map-canvas.scss`: `__minimap` positionieren (oben rechts, Abstand
      `--space-4`, Hintergrund `--color-map-label-bg`, Schatten `--shadow-md`);
      `__legend` als Dialog wie `map.scss → &__hint-dialog`.
- [ ] `map-canvas.scss`: `@container (max-width: #{bp.$map-narrow})` blendet
      `__minimap` aus (E6). `@use '../../../styles/breakpoints' as bp;` am
      Dateikopf ergänzen.
- [ ] `docs/code-map.md`, Zeile „Kartenfläche": Minikarte und Legenden-Dialog
      nachtragen.
- [ ] `npm run lint`, `npm run build` im Frontend.

## Report-Back
