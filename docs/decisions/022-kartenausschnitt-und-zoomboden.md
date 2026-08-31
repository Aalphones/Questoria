# ADR-022 — Kartenausschnitt und Zoom-Boden

**Datum:** 31.08.2026 · **Status:** angenommen

## Kontext

`qst-map-canvas` skalierte die Karte immer randlos füllend (Cover) und ließ als
untersten Zoomstand genau diesen Zustand zu (`MIN_ZOOM = 1`). Die Karte war
damit **nie** vollständig zu sehen — an der schmaleren Achse wurde immer
abgeschnitten. Auf einer Karte aus mehreren Kacheln, teils im Nebel, fehlte
jede Übersicht.

Zweitens war die Bezugsfläche die Bounding-Box der **freigeschalteten**
Kacheln. Gesperrte Kacheln lagen außerhalb der geklemmten Fläche und wurden
nur zufällig sichtbar, wenn die Cover-Skalierung überschoss. Ein bewusster
Nebelrand als Einladung „hier geht es weiter" war so nicht möglich.

## Betrachtete Optionen

1. **Nur den Zoom-Boden senken.** Billig, löst aber die Nebelrand-Frage nicht
   und zeigt beim Herauszoomen einen willkürlichen Ausschnitt.
2. **Bezugsfläche = alle Kacheln.** Konsequent, aber man kann bis in Bereiche
   wandern, die auf Jahre gesperrt bleiben — auf einer 8×8-Leinwand wären das
   63 leere Felder.
3. **Bezugsfläche = freigeschaltet plus ein Kachelrand, Zoom-Boden = passt
   vollständig hinein.** Gewählt.

## Entscheidung

Die sichtbare Fläche ist die Bounding-Box der freigeschalteten Kacheln, um
genau eine Kachelbreite erweitert und auf die Bounding-Box aller Kacheln
beschnitten. Sind alle Kacheln frei, verschwindet der Rand von selbst.

Der Maßstab wird direkt geklemmt statt über einen Zoomfaktor:

- Untergrenze `fitScale` — die ganze Fläche ist sichtbar.
- Startzustand `coverScale` — randlos füllend, wie bisher (ADR-017).
- Obergrenze `max(coverScale, 1)` — hinein bis zur nativen Kachelgröße von
  1024 px; `coverScale` steht darin, weil eine kleine Karte auf einem großen
  Bildschirm schon über nativer Größe füllt und der Startzustand nie über dem
  Anschlag liegen darf.

`clampWorldEdge` bekommt dafür einen zweiten Zweig: ist die Karte auf einer
Achse kleiner als die Fläche, wird zentriert statt geklemmt.

Kartenknoten bekommen über die Custom Property `--map-inverse-scale` eine
Gegenskalierung und behalten damit ihre Bildschirmgröße.

## Konsequenzen

- Herauszoomen zeigt die ganze Karte, mittig, mit Nebelrand.
- Antippziele bleiben in jedem Zoomstand mindestens 44 × 44 px.
- Zoomschritte sind multiplikativ (Rad 1,15 · Knopf 1,4); additive Schritte auf
  einem Maßstab fühlen sich an den Enden ungleich an.
- `focusZoom` ist ein Vielfaches des **füllenden** Zustands, nicht des
  Zoom-Bodens — sonst wäre die automatische Zentrierung mit dem neuen Boden
  stillschweigend weiter weggerückt.
- Wird eine Kachel freigeschaltet, wächst die Bezugsfläche. Der Maßstab bleibt
  als absoluter Wert erhalten, die Ansicht springt also nicht — genau deshalb
  hält das Bauteil den Maßstab und keinen Faktor darauf.
