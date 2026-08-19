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

- [x] Einpass-Regel in `map-canvas.scss`: die Fläche nimmt die kleinere der
      beiden möglichen Größen (Breite der Bühne bzw. Höhe der Bühne × 16/9).
      Umgesetzt über `min(100cqw, 100cqh*16/9)` / `min(100cqh, 100cqw*9/16)` —
      der Elternrahmen (`.timeline`/`.map`) ist jetzt `container-type: size`.
- [x] Rahmenfläche einfärben, Zweck-Token dafür in `_tokens.scss`
      (`--color-map-frame-bg: var(--color-surface)`)
- [x] Den Warnkommentar zu `container-type` geprüft: `.timeline`/`.map`
      liegen **oberhalb** von `qst-map-canvas`, nicht dazwischen — die
      cqw-Kette für Knoten/Panels bleibt bei `qst-map-canvas` selbst, der
      neue Size-Container ändert daran nichts. Kein Auflösen nötig.
- [x] `timeline` und `map` auf die Bühnenhöhe verdrahten (`block-size: 100%`,
      `overflow`/`max-inline-size: 90rem` entfernt, wie in Phase 1 bei
      `.main-hub` vorgemacht)
- [ ] Bei drei Fensterformaten ansehen: quer, hoch, sehr breit — **am
      Bildschirm offen**, siehe Report-Back
- [ ] Berührziele auf dem Tablet nachmessen (AK 6) — **am Bildschirm offen**
- [x] Die geratenen Koordinaten aus FINDINGS des Weltplans korrigiert — bereits
      am 19.08.2026 erledigt (Route-1, Etappe, Planetenkarte alle bildgenau
      geprüft, ein echter Treffer behoben). Offen bleiben nur die
      Bildsuche-Suchziel-Koordinaten, die gehören zu Phase 5, nicht hierher.
- [x] `docs/design/README.md`: Einpass-Entscheidung als Abweichung festgehalten

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

**Umgesetzt (19.08.2026):** `map-canvas.scss` passt die Kartenfläche jetzt per
`min(100cqw, 100cqh·16/9)` / `min(100cqh, 100cqw·9/16)` in ihren Rahmen ein —
16:9 bleibt erhalten, kein Punkt fällt aus dem Bild. `.timeline` und `.map`
sind dafür `container-type: size` geworden, tragen die neue Rahmenfarbe
`--color-map-frame-bg` und haben ihr `overflow: auto` sowie die alte
`90rem`-Breitenbremse verloren (FINDINGS-Zeile aus Phase 1 abgehakt). Build
und Lint sind grün.

**Nicht gebaut, weil schon erledigt:** Die Koordinatenkorrektur aus der
Checkliste war bereits am 19.08.2026 im Rahmen der ersten Spielrunde
abgeschlossen (siehe FINDINGS des Weltplans) — hier nichts mehr zu tun.

**Am Bildschirm offen (Sascha):**
1. Quer, Hoch und ein sehr breites Fenster ansehen — verschwindet der
   Rollbalken, bleibt 16:9 sichtbar, ist die Rahmenfläche eingefärbt statt
   grau?
2. Im Hochformat: ist die Karte noch bedienbar, oder wirkt der 16:9-Streifen
   zu schmal? (🟡 im Plan als Risiko benannt — falls ja, Hinweis „Tablet quer
   drehen" statt Beschneiden, als neuer Befund, kein Spontanumbau.)
3. Berührziele mit dem Finger/Lineal nachmessen (AK 6, ≥ 44×44 px).
4. Kompassrose, Legende, Panels weiterhin an ihren HANDOFF-Plätzen?

**Wackligste Stelle:** die `cqw`/`cqh`-Formel selbst — moderner
Container-Query-Mechanismus, in diesem Projekt schon für die Planetenkarte in
Phase 2 verwendet, aber auch die war am Bildschirm noch nicht bestätigt.
Zweiter Kandidat: `container-type: size` auf `.timeline`/`.map` verlangt eine
explizite Blockgröße vom Elternelement — die kommt aus dem Grid-Row
`minmax(0, 1fr)` der Bühne (ADR-017); falls ein Browser das anders aufteilt
als erwartet, bleibt die Karte 0×0.
