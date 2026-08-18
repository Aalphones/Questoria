# Druckbogen-Geometrie — erprobte Vorlage

Alles, was ein Druckbogen mit Sammelkarten braucht: Maße, Rechnung,
Schnittlinien und der Ausgabeweg. **Diese Datei ist die Quelle für Questoria** —
sie ist bewusst vollständig, damit niemand woanders nachschlagen muss.

Das Verfahren ist nicht ausgedacht: Es stammt aus einem Werkzeug, mit dem
Sammelkarten tatsächlich gedruckt, geschnitten und in handelsübliche Hüllen
gesteckt wurden. Übernommen am 18.08.2026, samt der Begründungen, die man beim
Nachbauen sonst verliert.

## Die harten Zahlen

| Größe | Wert | Warum |
|---|---|---|
| Blatt | 210 × 297 mm | DIN A4 |
| Karte | 63 × 88 mm | Standard-Sammelkartenmaß, für das es Hüllen und Sortierkästen gibt |
| Bildvorlage | 630 × 880 px | 63 mm bei 300 dpi — die Kartenbilder liegen genau so im Content |
| Raster | 3 Spalten × 3 Zeilen | 9 Karten je Blatt |
| Abstand zwischen Karten | 0 mm | Karten stoßen aneinander: **eine** Schnittlinie bedient zwei Karten |
| Beschnitt (optional) | 1 mm rundum | siehe unten |
| Schnittstrich-Länge | 5 mm | liegt im Blattrand, nie über einer Karte |
| Schnittstrich-Stärke | 0,2 mm | dünn genug, um exakt schneiden zu können |

Daraus folgt der Rand, der auf dem Blatt übrig bleibt — das ist zugleich die
**Rechenprobe** jeder Portierung:

- ohne Beschnitt: `(210 − 3 × 63) / 2` = **10,5 mm** seitlich, `(297 − 3 × 88) / 2` = **16,5 mm** oben und unten
- mit Beschnitt: **7,5 mm** seitlich, **13,5 mm** oben und unten

## Warum „Beschnitt" hier Vergrößern heißt

Im Druckhandwerk legt man um das fertige Motiv einen Rand aus Material, das
über die Schnittkante hinausragt — damit ein leicht verrutschter Schnitt nicht
weißes Papier freilegt. Ein fertiges Kartenbild hat das nicht: Die Bilddatei
endet exakt an der Kartenkante, jenseits davon existiert nichts.

Also andersherum: Die ganze Karte wird auf **65 × 90 mm** aufgezogen. Die
Schnittlinie liegt dann 1 mm **innerhalb** des Gedruckten, und ein schiefer
Schnitt trifft immer noch Motiv. Der Preis gehört in den Oberflächen-Text: am
Rand fällt etwas vom Bild weg.

## Die Rechnung

Eine reine Funktion, kein Framework, keine Zustandsverwaltung — damit Vorschau
und Ausgabe garantiert dieselbe Geometrie benutzen und keine zweite Rechnung
entsteht.

```ts
export const SHEET_WIDTH_MM = 210;
export const SHEET_HEIGHT_MM = 297;
export const CARD_WIDTH_MM = 63;
export const CARD_HEIGHT_MM = 88;
export const BLEED_MM = 1;
export const MARK_LENGTH_MM = 5;
export const MARK_WIDTH_MM = 0.2;
export const COLUMNS = 3;
export const ROWS = 3;
export const SLOTS_PER_SHEET = COLUMNS * ROWS;
export const MM_PER_INCH = 25.4;

/** Millimeter → Bildpunkte. Jede Umrechnung geht hier durch. */
export function mmToPx(millimeters: number, dpi: number): number {
  return Math.round((millimeters / MM_PER_INCH) * dpi);
}

/** Gedruckte Kartengröße und die Ränder, die dann übrig bleiben. Raster sitzt mittig. */
export function sheetGeometry(options: SheetOptions): SheetMetrics {
  const overhang = options.bleed ? BLEED_MM * 2 : 0;
  const widthMm = CARD_WIDTH_MM + overhang;
  const heightMm = CARD_HEIGHT_MM + overhang;

  return {
    widthMm,
    heightMm,
    marginXMm: (SHEET_WIDTH_MM - COLUMNS * widthMm) / 2,
    marginYMm: (SHEET_HEIGHT_MM - ROWS * heightMm) / 2,
  };
}

/** Die neun Plätze eines Bogens, zeilenweise von links oben. */
export function sheetFrames(options: SheetOptions): SheetFrame[] {
  const { widthMm, heightMm, marginXMm, marginYMm } = sheetGeometry(options);
  const frames: SheetFrame[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      frames.push({
        xMm: marginXMm + column * widthMm,
        yMm: marginYMm + row * heightMm,
        widthMm,
        heightMm,
      });
    }
  }

  return frames;
}
```

**Aufteilen auf Blätter:** die Karten in ihrer Reihenfolge in Neuner-Blöcke
schneiden, jeder Block ein Blatt. Die Plätze am Ende des letzten Blatts bleiben
leer — sie bekommen trotzdem ihre Schnittlinien, damit das Blatt schneidbar bleibt.

## Schnittlinien

Kurze Striche **in den Blatträndern**, jeder die Verlängerung einer Schnittlinie
über den Rasterrand hinaus. Über eine Karte läuft nie ein Strich — ein
gestrichelter Rahmen auf der Karte selbst wäre mitgedruckt und säße nach dem
Schneiden auf dem Motiv.

Welche Linien es gibt, hängt am Beschnitt:

- **ohne Beschnitt** stoßen die Karten aneinander, benachbarte Kanten fallen auf
  dieselbe Linie → 4 Linien je Achse (3 Kartenanfänge + das Rasterende)
- **mit Beschnitt** liegt die Schnittkante je 1 mm im Gedruckten, jede Karte
  bringt zwei eigene Linien mit → 6 Linien je Achse

```ts
function cutPositions(
  marginMm: number,
  blockSizeMm: number,
  blockCount: number,
  options: SheetOptions,
): number[] {
  const starts = Array.from(
    { length: blockCount },
    (_: unknown, block: number) => marginMm + block * blockSizeMm,
  );

  if (!options.bleed) {
    return [...starts, marginMm + blockCount * blockSizeMm];
  }

  return starts.flatMap((start: number) => [start + BLEED_MM, start + blockSizeMm - BLEED_MM]);
}
```

Je Position zwei Striche: oben und unten am Blatt (senkrechte Achse) bzw. links
und rechts (waagerechte Achse), jeweils `MARK_LENGTH_MM` lang, beginnend genau
am Rasterrand.

## Ausgabe: eine PDF-Datei, kein Browserdruck

**Das ist die wichtigste Lehre der Vorlage.** Der naheliegende Weg — die Seite
per `@media print` auf den Bogen reduzieren und `window.print()` rufen — liefert
den Maßstab an den Druckdialog aus. Steht dort „an Seite anpassen" (bei vielen
Treibern die Vorgabe), schrumpft die Karte um ein paar Prozent. Sichtbar wird
das erst mit dem Lineal, wenn schon geschnitten ist.

Der erprobte Weg erzeugt stattdessen eine A4-PDF mit Millimeter-Koordinaten:

```ts
const { jsPDF } = await import('jspdf'); // erst beim Klick laden
const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

// je Blatt: pdf.addPage() ab dem zweiten
// je Platz:
pdf.addImage(dataUrl, 'JPEG', slot.xMm, slot.yMm, slot.widthMm, slot.heightMm);
// je Schnittstrich:
pdf.setLineWidth(MARK_WIDTH_MM);
pdf.line(mark.x1Mm, mark.y1Mm, mark.x2Mm, mark.y2Mm);
```

63 mm sind damit 63 mm, egal auf welchem Gerät die Datei geöffnet wird. Die
Bibliothek wird **spät geladen** (`await import`), sonst zieht sie beim
Seitenstart ungenutzt mehrere Abhängigkeiten mit.

Zwei Randbedingungen aus der Praxis:

- `jsPDF` nimmt kein `Blob` entgegen — Bilder müssen als Daten-Adresse
  (`data:`-URL) hineingereicht werden.
- Ein Bild, das nicht geladen werden kann, lässt seinen Platz leer; die Datei
  entsteht trotzdem und nennt die fehlenden Karten hinterher.

## Bildschirm-Vorschau

Die Vorschau ist **nicht** der Druck, sie ist ein Bild davon. Bewährt:

```scss
&__paper {
  position: relative;
  width: 420px;          // beliebig, nur die Anzeigegröße
  max-width: 100%;
  aspect-ratio: 210 / 297;
}

&__slot { position: absolute; overflow: hidden; }
```

Die Plätze werden absolut in **Prozent** gesetzt, aus denselben mm-Werten
gerechnet:

```ts
leftPercent: (frame.xMm / SHEET_WIDTH_MM) * 100,
topPercent: (frame.yMm / SHEET_HEIGHT_MM) * 100,
widthPercent: (frame.widthMm / SHEET_WIDTH_MM) * 100,
heightPercent: (frame.heightMm / SHEET_HEIGHT_MM) * 100,
```

Das passt zu Critical Rule 7 („Kartenkoordinaten sind Prozentwerte") und
skaliert mit jeder Anzeigegröße, ohne dass eine zweite Geometrie entsteht.

## Der einzige echte Beweis

Drucken, Lineal anlegen, 63 × 88 mm. Alles andere ist eine Vermutung — kein
Test, kein Build und kein Blick auf den Bildschirm ersetzt das.
