# ADR-019: Ziehen und Zoomen der Karte ohne Fremdbibliothek

**Status:** entschieden · 21.08.2026

## Kontext

Die Kartenfläche (`ui/map-canvas/`) besteht seit Phase 1 dieses Plans aus
einzelnen Kacheln in einem offenen Koordinatensystem. Damit ist sie größer als
der Bildschirm und muss verschiebbar und zoombar werden. Die Besonderheit:
verschoben werden darf **nur innerhalb der freigeschalteten Kacheln** — nicht
freigeschaltetes Gebiet ist keine vernebelte Fläche, die man ansteuern könnte,
sondern liegt außerhalb der Reichweite. Die begrenzende Fläche wächst zur
Laufzeit, sobald das Spiel eine Kachel freischaltet.

## Optionen

1. **Fertige Bibliothek** (`panzoom`, `hammerjs`, `svg-pan-zoom`) — bringt
   Gesten, Trägheit und Zoomgrenzen mit. Die Grenzen sind dort aber ein
   statisches Rechteck oder ein Skalierungsbereich; eine zur Laufzeit wachsende
   Grenzfläche und das Zurückschreiben der geklemmten Position müsste man
   trotzdem selbst danebenbauen. Dazu eine Abhängigkeit, die die
   Tab-Reihenfolge der Kartenpunkte anfassen kann.
2. **Native Pointer Events plus `wheel`** — Ziehen, Zwei-Finger-Zoom und
   Mausrad-Zoom von Hand, rund 150 Zeilen. Volle Kontrolle über die Klemmung
   und darüber, wann ein Tipp noch ein Tipp ist und wann er zum Ziehen wird.

## Entscheidung

Option 2. Gebraucht werden genau zwei Gesten (Ziehen, Zoomen), kein
Nachschwingen, keine Rotation. Der wertvolle Teil der Mechanik ist nicht die
Geste, sondern die Klemmung gegen eine bewegliche Grenzfläche — und genau die
bringt keine der Bibliotheken mit.

Die Umsetzung hält den Zustand in drei Signalen (`zoom`, `panX`, `panY`); die
sichtbare Position entsteht daraus als abgeleiteter Wert und wird beim
Ableiten geklemmt. Nach jeder Bewegung wird der geklemmte Wert in `panX`/`panY`
zurückgeschrieben, damit ein Ziehen über die Kante hinaus keinen unsichtbaren
Überhang ansammelt.

## Konsequenzen

- Keine neue Abhängigkeit; die Kartenfläche bleibt mit Bordmitteln wartbar.
- Wächst die freigeschaltete Fläche, wächst der Bewegungsspielraum
  automatisch, ohne dass die Ansicht springt — die Klemmung setzt auf
  denselben abgeleiteten Werten auf wie die Einpassung.
- Trägheit („Nachschleudern") gibt es nicht. Für eine Lernkarte ist das
  gewollt: Kinder sollen zielen, nicht werfen.
- Die Klemmung wirkt gegen das umschließende Rechteck der freigeschalteten
  Kacheln, nicht gegen deren exakte Fläche. Bei einer geknickten Kachelfolge
  gibt das die Ecke zwischen zwei Kacheln mit frei. Bewusst offen gelassen,
  bis eine echte Route mit Knick vorliegt (Plan-Konfidenzausweis).
- Die Kartenfläche schluckt `touch-action` vollständig — ein Screen, der
  darin künftig etwas Scrollbares unterbringen will, muss das für sein
  Element eigens zurücknehmen.
