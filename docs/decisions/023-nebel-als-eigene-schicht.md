# ADR-023 — Nebel als eigene Schicht

**Datum:** 07.09.2026 · **Status:** angenommen

## Kontext

`qst-map-canvas` zeichnete für jede gesperrte Kachel ein eigenes `<div>` mit
Volltonfarbe, 1024 × 1024 px, mit messerscharfer Kante zur Nachbarkachel. Auf
einer Karte aus wenigen Kacheln — etwa der Ortskarte Alabastia mit zweien —
wirkte eine gesperrte Hälfte wie ein beiger Klotz statt wie Nebel.

Der `--fog`-Zweig existierte, damit für gesperrte Kacheln keine Bildanfrage
rausgeht (ADR-020, Kachel-Freischaltung). Diese Eigenschaft bleibt erhalten —
nur die sichtbare Fläche wandert von N Kachel-`div`s in eine Schicht.

## Betrachtete Optionen

1. **Ein Element pro gesperrter Kachel, `mask-image` aus Verläufen je nach
   Nachbarschaft.** Braucht pro Kachel die Kenntnis, welche der vier Nachbarn
   frei sind — acht Sonderfälle im Stylesheet, ein Rechenschritt im Bauteil —
   und bleibt an Diagonalen trotzdem eckig.
2. **Eine SVG-Schicht in Weltkoordinaten mit einer Lochmaske über die
   freigeschalteten Kacheln.** Gewählt.

## Entscheidung

Der Nebel ist eine `<svg class="map-canvas__fog">` im `__world`-Element,
zwischen der Routen-`<svg>` und den Kartenpunkten. Sie zeichnet zwei
Rechtecke über die gesamte sichtbare Fläche (`visibleBounds` aus ADR-022),
jedes durch eine eigene Maske gelöchert:

- Ein weißes Rechteck über die volle Fläche (= Nebel sichtbar).
- Darüber eine Gruppe schwarzer Rechtecke — je eines pro freigeschalteter
  Kachel, in Weltkoordinaten — mit `feGaussianBlur`.

Aneinandergrenzende Kacheln ergeben eine zusammenhängende schwarze Fläche,
deren Inneres uniform ist; eine Naht zwischen zwei freigeschalteten Nachbarn
kann so nicht entstehen.

Zwei Lagen statt einer, damit es nach Dunst aussieht und nicht nach
Weichzeichner: ein enger, kräftiger Kern (`stdDeviation` 48, Deckkraft 0,96)
und ein weiter, schwacher Hof (`stdDeviation` 190, Deckkraft 0,5). Beide Werte
stehen in Weltpixeln und skalieren deshalb mit der Karte mit — der Nebel
gehört zur Welt, nicht zur Bedienoberfläche.

Die Fläche außerhalb der Karte (sichtbar seit ADR-022, wenn vollständig
herausgezoomt wird) bekommt eine eigene Füllung `--color-map-void` auf dem
`:host`, statt weiß oder transparent zu bleiben.

Drei neue Zweck-Tokens (`--color-map-fog`, `--color-map-fog-deep`,
`--color-map-void`) ersetzen `--color-map-frame-bg`, dessen einziger Nutzer
die alte `--fog`-Regel war.

## Konsequenzen

- Keine sichtbaren Kachelkanten mehr in gesperrten Bereichen, auf keiner der
  drei Kartenebenen.
- Eine Route, die in gesperrtes Gebiet führt, verblasst im Dunst statt scharf
  abzubrechen — Reihenfolge im `__world` bleibt Kacheln → Routen → Nebel →
  Knoten.
- Für eine gesperrte Kachel geht weiterhin keine Bildanfrage raus — der
  Nebel kennt nur `tiles` und `unlockedTileIds`, keine eigene Bildquelle.
- 🟡 `feGaussianBlur` über eine große Fläche kostet Füllrate; der Aufwand
  hängt an der Bildschirmauflösung, nicht an der Weltgröße. Ruckelt es auf
  dem Tablet, ist der Ausweg `will-change: opacity` auf der Nebelschicht plus
  Halbierung von `FOG_BLUR_HALO` — nicht der Rückbau auf Kacheln.
