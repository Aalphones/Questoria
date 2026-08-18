# Phase 5 — Druckbogen

Der A4-Bogen. Die einzige Stelle im Projekt, an der Millimeter zählen und nicht
Pixel. **Die Geometrie wird nicht erfunden, sie steht schon geschrieben** —
in [docs/knowledge/druckbogen-geometrie.md](../../knowledge/druckbogen-geometrie.md),
einer erprobten Vorlage samt Rechnung, Konstanten und Begründungen.

## Kontext (vorher lesen)

- **[docs/knowledge/druckbogen-geometrie.md](../../knowledge/druckbogen-geometrie.md)
  — die Hauptquelle dieser Phase.** Maße, `sheetGeometry`, `sheetFrames`,
  `cutPositions`, der PDF-Weg und die Vorschau-Rechnung stehen dort vollständig
  mit Code.
- `docs/design/HANDOFF.md` Abschnitt „9c" — verbindlich für die *Oberfläche*
  (Werkzeugleiste, Texte, Zusammenfassung), **nicht** für den Druckweg
- `docs/design/README.md` Abweichung 10 — warum PDF statt Browserdruck
- `AGENTS.md` Critical Rule 7 — Kartenkoordinaten sind Prozentwerte
- Ergebnis von Phase 4: `services/print-selection.service.ts`
- `frontend/src/app/services/content.service.ts` — `assetUrl()` für die Kartenbilder

## Warum nicht der Prototyp-Weg

`window.print()` liefert den Maßstab an den Druckdialog aus. Steht dort „an
Seite anpassen" (bei vielen Treibern die Vorgabe), schrumpft die Karte um ein
paar Prozent — sichtbar erst mit dem Lineal, wenn schon geschnitten ist. Eine
PDF-Datei mit Millimeter-Koordinaten hat diese Stelle nicht: 63 mm sind 63 mm,
egal welcher Drucker sie öffnet. Ausführlich in der Wissensdatei, entschieden
in ADR-013.

## Abnahmekriterien

1. Screen unter `theme/:themeId/cards/print`; ohne gewählte Karten führt er
   zurück in die Halle statt einen leeren Bogen zu zeigen.
2. `services/sheet-layout.ts` ist die **eine** Geometrie-Quelle: reine
   Funktionen, kein Angular, keine Signale. Konstanten und Funktionen exakt wie
   in der Wissensdatei. Angepasst wird nur die Eingabeform: Questoria hat keine
   Stückzahlen, eine gewählte Karte ist genau ein Platz.
3. Die Rechenprobe stimmt: ohne Beschnitt bleiben 10,5 mm seitlich und 16,5 mm
   oben/unten übrig, mit Beschnitt 7,5 / 13,5 mm.
4. Zwei Schalter in der Werkzeugleiste, beide in Klartext beschriftet:
   - **„Schnittlinien"** (Vorgabe an) — kurze Striche in den Blatträndern,
     nie über einer Karte. Erklärung: „Kurze Striche am Blattrand zeigen, wo
     du schneiden musst."
   - **„Rand zum Schneiden"** (Vorgabe aus) — Karten 1 mm größer drucken
     (65 × 90 mm), die Schnittkante liegt dann im Motiv. Erklärung: „Druckt die
     Karten einen Millimeter größer, damit ein schiefer Schnitt kein weißes
     Papier trifft. Am Rand fällt dafür etwas vom Bild weg."
     *(Ersetzt den „Kartenabstand"-Schalter des Prototyps — derselbe Zweck,
     die erprobte Lösung.)*
5. Bildschirm-Vorschau: Blatt mit `aspect-ratio: 210 / 297`, Plätze absolut in
   **Prozent** aus den mm-Werten — die Rechnung steht in der Wissensdatei,
   Abschnitt „Bildschirm-Vorschau". Leere Plätze bleiben sichtbar hell, gefüllte
   zeigen das Kartenbild randlos (`object-fit: cover`).
6. Werkzeugleiste nach HANDOFF 9c: Titel „Druckbogen", Zusammenfassung
   „<N> Karten · <M> Blatt/Blätter DIN A4 · je 63 × 88 mm", „Zurück zur Halle",
   Hauptknopf **„Als PDF speichern"** (statt „Drucken / PDF" — der Knopf tut
   jetzt genau eine Sache).
7. Der Knopf erzeugt eine A4-PDF mit `unit: 'mm'`, legt die Kartenbilder über
   `addImage` auf die Millimeter-Rahmen, zeichnet die Schnittstriche mit
   `MARK_WIDTH_MM` und lädt das Ganze als `sammelkarten.pdf` herunter. `jspdf`
   wird **erst beim Klick** nachgeladen (`await import('jspdf')`).
8. Blattzahl `ceil(anzahl / 9)`; überzählige Plätze auf dem letzten Blatt
   bleiben leer, bekommen aber ihre Schnittlinien. Reihenfolge = die der Auswahl.
9. Ein Kartenbild, das nicht geladen werden kann, lässt seinen Platz leer und
   wird danach benannt („Diese Karten fehlten: …") — der Rest der Datei
   entsteht trotzdem.
10. Keine Größe auf diesem Screen kommt aus einem px-Wert. Kein `@media print`,
    kein `window.print()` — wer das nachrüsten will, muss erst ADR-013 kippen.
11. Nachgemessen stimmt der Maßstab (README, Smoke-Punkt 1).

## Checkliste

- [ ] `npm install jspdf` im Frontend (siehe `mode-dependencies`).
- [ ] `services/sheet-layout.ts` — Konstanten und Funktionen aus der
      Wissensdatei übernehmen, **mit** den dortigen Begründungen als Kommentar
      (besonders: warum „Beschnitt" hier Vergrößern heißt, und warum
      Schnittstriche im Blattrand liegen). Eingabe: `readonly string[]`
      (Karten-IDs in Auswahlreihenfolge).
- [ ] `features/cards/print/print.ts|html|scss` (Klasse `PrintSheet`) —
      Werkzeugleiste, Schalterzustand im Screen, Vorschau nach AK 5.
- [ ] `features/cards/print/print-export.service.ts` — Bilder über
      `ContentService.assetUrl` holen, als Daten-Adresse in die PDF reichen,
      Datei über einen Blob-Download ausliefern. Kein Renderer und keine
      Qualitätswahl nötig: Questorias Karten sind fertige 630 × 880-Bilder, das
      ist bei 63 mm genau 300 dpi.
- [ ] Fortschrittsanzeige beim Bauen der Datei, wenn mehr als ein Blatt entsteht
      (ein Satz genügt: „Blatt 2 von 3 …").
- [ ] Zurück-Weg in die Halle, ohne die Auswahl zu leeren.

## Doku

- [ ] `docs/decisions/013-druckbogen-als-pdf.md` — Kontext (der Maßstab darf
      nicht am Druckdialog hängen), Optionen (Browserdruck mit `@media print`
      wie im Prototyp / PDF mit mm-Koordinaten), Entscheidung, Konsequenzen
      (eine Abhängigkeit mehr im Frontend, dafür ein Ergebnis, das unabhängig
      vom Gerät des Elternteils stimmt; die Datei lässt sich weitergeben oder im
      Copyshop drucken). Verweis auf die Wissensdatei, nicht auf fremde Projekte.
- [ ] `docs/code-map.md`: Routen-Tabelle und Ist-Stand um `features/cards/print/`
      und `services/sheet-layout.ts` ergänzen.
- [ ] `docs/knowledge/druckbogen-geometrie.md`: falls beim Bauen etwas nicht
      aufging (Rundung, Bildformat, Ladeweg), dort nachtragen — die Datei ist
      die Projektquelle, nicht ein Import von einmal.

## Report-Back
