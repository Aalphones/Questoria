# Phase 3 — Etappen- und Ortskarte im Vollbild

**Rating:** standard (eine Entscheidung, danach zwei gleichartige Screens)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-buehne.md](phase-1-buehne.md) — muss fertig sein
- `frontend/src/app/ui/map-canvas/map-canvas.scss` — dort steht heute
  `aspect-ratio: 16 / 9` und `container-type: inline-size` mit einem
  ausdrücklichen Warnkommentar
- `frontend/src/app/ui/map-canvas/map-point/` — setzt Knoten auf
  Prozent-Positionen und bemisst sie in `cqw`
- `frontend/src/app/features/timeline/`, `frontend/src/app/features/map/`
- `docs/design/HANDOFF.md`, Abschnitte „4. Etappenkarte" und „5. Ortskarte"

## Die Entscheidung: einpassen, nicht beschneiden

Die Kartenfläche ist 16:9. Ein Tablet ist es nicht. Damit gibt es genau zwei
Wege, und die Wahl ist **einpassen** (die Fläche wird so groß wie möglich, behält
16:9, der Rest bleibt Rahmenfläche):

| | einpassen (gewählt) | beschneiden |
|---|---|---|
| Koordinaten | bleiben gültig, jeder Punkt bleibt sichtbar | Punkte am Rand können aus dem Bild fallen |
| Optik | schmale Streifen oben/unten oder seitlich | randlos |
| Risiko | keins | ein Ort, den niemand anklicken kann |

Alle Knotenpositionen sind Prozentwerte **des Kartenbildes**, und sie sind
ohnehin geraten (siehe FINDINGS des Weltplans). Ein Verfahren, das bei
ungünstigem Bildschirmformat einen Ort unerreichbar macht, ist für ein Spiel für
Erstklässler nicht verhandelbar.

**Die Rahmenfläche ist kein Schönheitsfehler, sondern gestaltet:** sie bekommt
die Hintergrundfarbe der Welt, nicht Grau. Damit liest sie sich als Passepartout
und nicht als fehlender Inhalt.

## Abnahmekriterien

1. Etappen- und Ortskarte füllen die Bühne unter der Kopfleiste so weit wie
   möglich, ohne dass ein Rollbalken erscheint.
2. Die Kartenfläche behält 16:9. Jeder Punkt, der vorher sichtbar war, ist es
   danach auch — bei 4:3, bei 16:10 und im Hochformat.
3. Die Rahmenfläche trägt eine Farbe aus den Tokens, keine Fremdfarbe und kein
   Grau.
4. Die Knotengrößen (`cqw`) bleiben stimmig — kein Bauteil weiter oben im Baum
   setzt ein neues `container-type`, das den Bezug still verschiebt.
5. Kompassrose, Legende und Panels liegen weiterhin an ihren Plätzen aus dem
   HANDOFF.
6. Im Hochformat ist die Karte kleiner, aber vollständig und bedienbar —
   Berührziele bleiben mindestens 44 × 44 px.

## Checkliste

- [ ] Einpass-Regel in `map-canvas.scss`: die Fläche nimmt die kleinere der
      beiden möglichen Größen (Breite der Bühne bzw. Höhe der Bühne × 16/9)
- [ ] Rahmenfläche einfärben, Zweck-Token dafür in `_tokens.scss`
- [ ] Den Warnkommentar zu `container-type` prüfen: setzt die neue Bühne aus
      Phase 1 versehentlich einen eigenen Container? Wenn ja, hier auflösen
- [ ] `timeline` und `map` auf die Bühnenhöhe verdrahten
- [ ] Bei drei Fensterformaten ansehen: quer, hoch, sehr breit
- [ ] Berührziele auf dem Tablet nachmessen (AK 6)
- [ ] Die geratenen Koordinaten aus FINDINGS des Weltplans jetzt korrigieren —
      die Karte ist erst ab hier groß genug, um sie ehrlich zu setzen
- [ ] `docs/design/README.md`: Einpass-Entscheidung als Abweichung festhalten

## Risiken

🟡 **Im Hochformat wird die Karte klein.** Eine 16:9-Fläche in einem hochkant
gehaltenen Tablet ist ein Streifen in der Mitte. Falls das in der Hand des
Kindes unbrauchbar aussieht, ist die Antwort **nicht** Beschneiden, sondern ein
Hinweis „dreh das Tablet quer" — als eigener Befund für FINDINGS, nicht als
spontaner Umbau.

🟡 **Die Kartenfläche ist von drei Screens geteilt.** Eine Änderung hier trifft
auch die Planetenkarte aus Phase 2. Deshalb steht die Entscheidung in dieser
Phase und gilt dort mit.

## Report-Back
