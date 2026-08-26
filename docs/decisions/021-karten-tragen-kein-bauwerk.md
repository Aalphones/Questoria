# ADR-021: Karten tragen kein Bauwerk

**Status:** entschieden · 26.08.2026

## Kontext

Kartenkacheln werden einzeln durchs Spiel freigeschaltet — eine nicht
freigeschaltete Kachel ist schwarz, eine freigeschaltete zeigt ihr Bild.
Zusätzlich sitzen auf jeder Kachel benannte Stationen (Haus, Labor, Markt,
Waldeingang, …), die eine eigene Episode oder einen Hinweistext öffnen.

Die Frage: Malt man Häuser, Türme und sonstige Bauwerke direkt in die
Kartenleinwand, oder bleiben sie draußen?

## Optionen

1. **Bauwerke in der Leinwand.** Eine Szene aus einem Guss, kein zweiter
   Ebenen-Aufwand. Dagegen: Ein eingemaltes Haus ist immer da, in immer
   demselben Zustand. Es kann nicht zeigen, dass sein Ort noch verschlossen
   ist, und es lässt sich nicht verschieben, wenn eine Station umzieht oder
   eine Kachel umgruppiert wird (genau das ist am 26.08.2026 mit der
   Alabastia-Kachel passiert — Nachtrag 5b).
2. **Weg C — Karte ist Untergrund, Bauwerke sind Sprites.** Die Leinwand zeigt
   nur Gelände (Wiese, Wald, Wege, Wasser, Küste, Fels). Jede Station ist ein
   eigenes freigestelltes PNG, das die App über die Kachel legt und einzeln
   austauschen, verschieben oder ausblenden kann.

## Entscheidung

Weg C. Karten-Prompts (positiv **und** negativ) verbieten Häuser, Ortschaften,
Türme, Brücken und Zäune um Grundstücke ausdrücklich — nur Gelände. Jede
Station, jedes Bauwerk und jeder Ort auf der Weltenkarte bekommt stattdessen
ein eigenes freigestelltes Sprite (`illustration`-Feld, Ordner
`data/themes/<welt>/maps/`).

## Konsequenzen

- Eine Kachel kann denselben Grafikstand für „Station noch verschlossen" und
  „Station freigeschaltet" tragen — der Unterschied sitzt im Sprite (Anzeige/
  Ausblendung), nicht in der Leinwand.
- Umgruppieren einer Station auf eine andere Kachel oder Position ist eine
  Koordinatenänderung in `world_config.json`, keine neue Bildbestellung.
- Zusätzlicher Bildaufwand: **zwei** neue Orts-Sprites (Alabastia, Vertania
  City) auf der Weltenkarte, die es ohne Weg C nicht gebraucht hätte — die
  Karte muss ja irgendwie zeigen, dass dort ein bewohnter Ort liegt.
- Ein Karten-Prompt, der als Vorlage ein bestehendes, noch nicht auf Weg C
  umgestelltes Kartenbild bekommt, malt dessen Bauwerke brav mit (belegter
  Vorfall 26.08.2026, `map_route_1.webp`-Vorlage). Alte Karten aus dem Bestand
  taugen deshalb nur als Stilreferenz, nie als Bild-Vorlage.
- Die Karte selbst bleibt bewusst leerer als eine Illustration aus einem Guss
  — Reichtum kommt aus der Summe der Sprites, nicht aus der Leinwand.
