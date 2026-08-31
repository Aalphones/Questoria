# Phase 1 — Kartenausschnitt und Zoom-Boden

**Rating:** heikel — die Flächen- und Klemmrechnung der Kartenfläche wird
umgebaut, und der Umschaltpunkt „Welt kleiner als Fläche" ist heute gar nicht
vorgesehen.

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `frontend/src/app/ui/map-canvas/map-canvas.ts` | die ganze Datei; hier passiert alles |
| `frontend/src/app/ui/map-canvas/map-canvas.scss` | `.map-canvas__world`, Zoom-Knöpfe |
| `frontend/src/app/ui/map-canvas/map-point/map-point.scss` | Knoten sitzen per `translate: -50% -50%` auf ihrer Weltposition |
| `frontend/src/app/ui/map-canvas/map-point/map-point.ts` | Größe kommt als `cqw` über `--map-point-size` |
| `docs/decisions/019-panzoom-ohne-bibliothek.md` | warum ohne Fremdbibliothek |
| `docs/conventions/css.md` | Zweck-Tokens, keine rohen Werte in Komponenten |
| `docs/conventions/angular.md` | Signals, `input()`, `OnPush` |

## Der Befund, gegen den gebaut wird

Drei Stellen in `map-canvas.ts` bilden zusammen die Sperre:

1. `MIN_ZOOM = 1` (Zeile 25).
2. `coverScale` (Zeile 200) nimmt das **Maximum** von Breiten- und
   Höhenverhältnis — die Welt füllt die Fläche also immer randlos und wird an
   der schmaleren Achse abgeschnitten.
3. `clampWorldEdge` (am Dateiende) klemmt mit `Math.min(0, …)`. Die Funktion
   setzt voraus, dass die Welt **größer** als die Fläche ist. Wäre sie kleiner,
   würde sie an die linke obere Ecke gedrückt.

Zusammen heißt das: der herausgezoomteste mögliche Zustand ist „abgeschnitten
füllend". Die ganze Karte zu sehen ist nicht möglich.

**Chesterton's Fence — warum das so gebaut wurde:** Die Cover-Skalierung sorgt
dafür, dass die Karte die Bühne randlos füllt (Vollbild-Doktrin, ADR-017) und
nie ein leerer Rand entsteht. Das Ziel bleibt richtig — es soll nur nicht mehr
die *Untergrenze* sein, sondern der *Startzustand*.

Zweiter Befund: `unlockedBounds` rechnet nur über **freigeschaltete** Kacheln.
Gesperrte Kacheln werden zwar gezeichnet, liegen aber außerhalb der geklemmten
Fläche und tauchen nur zufällig auf, wenn die Cover-Skalierung überschießt.
Ein Nebelrand, der zeigt „hier geht es weiter", ist so nicht möglich —
Phase 2 braucht ihn.

## Entscheidungen (fallen hier, nicht in der Umsetzung)

**E1 — Sichtbare Fläche = freigeschaltete Fläche plus ein Kachelrand.**
Die Bezugsfläche für Skalierung und Klemmung ist die Bounding-Box der
freigeschalteten Kacheln, in alle vier Richtungen um genau `TILE_SIZE`
erweitert, danach auf die Bounding-Box **aller** Kacheln beschnitten. Sind alle
Kacheln frei, ist beides identisch und es gibt keinen Rand. So ist immer genau
so viel Nebel sichtbar, dass er als „da geht es weiter" liest, und man kann nie
in eine leere Fläche hinauswandern.

**E2 — Der Zoom-Boden ist „passt vollständig hinein", nicht „füllt aus".**
Zwei Skalen statt einer:

- `fitScale` = `Math.min(vw / w, vh / h)` — die ganze Fläche ist sichtbar.
- `coverScale` = `Math.max(vw / w, vh / h)` — bleibt für den Startzustand.

Der wirksame Maßstab wird direkt geklemmt, nicht mehr der Zoomfaktor:
`scale ∈ [fitScale, maxScale]` mit `maxScale = Math.max(fitScale, 1)`.
`1` heißt: ein Weltpixel ist ein Bildschirmpixel, eine Kachel erreicht also
ihre native Größe von 1024 px. `Math.max` fängt den Fall ab, dass eine kleine
Karte auf einem großen Bildschirm schon eingepasst über nativer Größe liegt.

**E3 — Startzustand und Zurücksetzen bleiben „füllend".**
`resetView()` setzt den Maßstab auf `coverScale` und die Verschiebung auf
mittig. Die Vollbild-Wirkung von ADR-017 bleibt damit der erste Eindruck; das
Herauszoomen ist eine bewusste Handlung des Kindes.

**E4 — Klemmen kippt, wenn die Welt kleiner als die Fläche ist.**
`clampWorldEdge` bekommt einen zweiten Zweig: ist `worldPxSize <= viewportSize`,
wird zentriert (`(viewportSize - worldPxSize) / 2`) statt geklemmt. Das ist der
Umschaltpunkt und die wahrscheinlichste Fehlerstelle der ganzen Phase.

**E5 — Knoten skalieren nicht mit.**
Die Kartenfläche legt eine Custom Property `--map-inverse-scale` mit dem Wert
`1 / scale` auf `.map-canvas__world`. `qst-map-point` nimmt sie als eigene
`scale`-Eigenschaft auf. Ergebnis: ein Ortssymbol behält seine
Bildschirmgröße, egal wie weit hinein- oder herausgezoomt ist. Ohne das
schrumpft beim Herauszoomen jedes Antippziel unter 44 px — genau die Falle, vor
der das Konzept warnt.

Bewusst **nicht** über `transform`, sondern über die eigenständige
`scale`-Eigenschaft: `map-point` benutzt bereits `translate: -50% -50%`, und
die beiden Einzeleigenschaften setzen sich sauber zusammen (erst verschieben,
dann um die eigene Mitte skalieren). Ein `transform` würde das `translate`
überschreiben.

**Alternative, die verworfen wurde:** Knoten aus dem verschobenen `__world`
herausziehen und ihre Bildschirmposition pro Rahmen selbst rechnen. Das
entkoppelt Größe und Position sauber, kostet aber eine Positionsrechnung pro
Knoten und pro Bewegung — bei 20 Knoten auf einem Tablet spürbar. Die
Gegenskalierung erledigt dasselbe rein deklarativ.

## Abnahmekriterien

1. Auf der Ortskarte Alabastia (zwei Kacheln) lässt sich so weit herauszoomen,
   dass beide Kacheln plus der eine Kachelrand Nebel vollständig sichtbar sind.
2. Am herausgezoomten Anschlag sitzt die Karte **mittig** in der Fläche, nicht
   oben links.
3. Hineinzoomen endet, wenn eine Kachel 1024 px auf dem Bildschirm misst; ein
   weiterer Radschritt ändert nichts mehr.
4. Beim Öffnen einer Karte und nach Druck auf „Kartenansicht zurücksetzen"
   füllt die Karte die Fläche randlos wie bisher.
5. Ein Ortssymbol hat bei maximalem Herauszoomen dieselbe Bildschirmgröße wie
   bei maximalem Hineinzoomen, gemessen mit dem Element-Inspektor.
6. Das Antippziel eines Knotens ist in jedem Zoomstand mindestens 44 × 44 px.
7. Zwei-Finger-Zoom und Mausrad-Zoom halten den Punkt unter Cursor/Fingermitte
   weiterhin fest, auch über den Umschaltpunkt aus E4 hinweg.
8. Ziehen über den Rand hinaus baut keinen unsichtbaren Überhang auf (die
   bestehende `settlePan`-Zusicherung gilt weiter).

## Checkliste

- [ ] `MIN_ZOOM` / `MAX_ZOOM` aus `map-canvas.ts` entfernen; stattdessen
      `NATIVE_SCALE = 1` einführen und den Maßstab klemmen (E2).
- [ ] `visibleBounds` einführen (E1): `unlockedBounds` um `TILE_SIZE`
      erweitern, auf `boundingBoxOf(this.tiles())` beschneiden. `worldWidth`,
      `worldHeight`, `worldOriginOffset` beziehen sich ab jetzt darauf.
      `unlockedBounds` bleibt als eigene Rechnung erhalten — Phase 2 braucht sie.
- [ ] `fitScale` als eigenes `computed` neben `coverScale` (E2).
- [ ] `scale` klemmt auf `[fitScale, Math.max(fitScale, NATIVE_SCALE)]`.
- [ ] `zoomAround` und `zoomBy` rechnen auf dem Maßstab statt auf einem
      Zoomfaktor; das Signal `zoom` wird zu `scaleSignal` (Maßstab, nicht
      Faktor) umbenannt, damit kein Rest der alten Bedeutung stehenbleibt.
- [ ] `WHEEL_STEP` von einem additiven Faktor auf einen **multiplikativen**
      Schritt umstellen (`1.15` hinein, `1 / 1.15` heraus). Additiv auf dem
      Maßstab fühlt sich am Boden träge und oben ruckartig an.
- [ ] `clampWorldEdge` um den Zentrier-Zweig erweitern (E4).
- [ ] `resetView()` setzt auf `coverScale` mittig statt auf den alten
      Zoomfaktor 1 (E3). Der Startzustand ergibt sich daraus.
- [ ] `focusZoom` (Eingang) von „Zoomfaktor" auf „Vielfaches der eingepassten
      Größe" umdeuten und in `applyFocus` gegen dieselbe Klemmung fahren.
      Aufrufer (`main-hub.html`, `map.html`, `timeline.html`) prüfen: der
      bisherige Vorgabewert `1.6` bleibt gültig, weil er in beiden Lesarten
      „etwas näher als der Boden" heißt.
- [ ] `--map-inverse-scale` auf `.map-canvas__world` setzen (E5), über eine
      Style-Bindung im Template auf dem bestehenden `__world`-Element.
- [ ] `map-point.scss`: `scale: var(--map-inverse-scale, 1);` ergänzen (E5).
- [ ] Prüfen, ob `--map-point-size` in `cqw` dadurch doppelt greift. `cqw`
      bezieht sich auf die Breite des `map-canvas`-Hosts und ist damit
      zoom-unabhängig; die Gegenskalierung ist die einzige Zoomkorrektur.
      Sollte ein Knoten doppelt korrigiert erscheinen, ist die Bindung an der
      falschen Ebene gelandet — nicht die Größe nachjustieren.
- [ ] `docs/decisions/022-kartenausschnitt-und-zoomboden.md` schreiben
      (Kontext / Optionen / Entscheidung / Konsequenzen, 10 Zeilen). Nummer 022
      ist frei: 021 ist die höchste auf Platte, 011–013 sind vom Sammelkarten-Plan
      reserviert.
- [ ] `docs/code-map.md`, Zeile „Kartenfläche": den Halbsatz „exakt auf die
      freigeschaltete Fläche geklemmt" auf die neue Regel ziehen
      (freigeschaltete Fläche plus ein Kachelrand, Zoom-Boden ist die
      Gesamtansicht).
- [ ] `npm run lint`, `npm run build` im Frontend.

## Report-Back
