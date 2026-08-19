# Findings — UI-Umbau

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Abgearbeitete Zeilen abhaken, nicht löschen.

## Aus Phase 1

- [ ] → Phase 2: `.main-hub` hat übergangsweise `overflow: auto` bekommen, damit
      die Planetenkarte nach dem Bühnen-Umbau nichts abschneidet. Sobald sie
      vollflächig ist, muss das wieder raus — eine Karte, die rollt, ist keine
      Vollbild-Karte. Ebenso fällt `max-inline-size: 90rem` + `padding` weg,
      die halten die Karte heute von den Rändern fern.
- [ ] → Phase 3: Dasselbe für `.map` und `.timeline` — beide haben jetzt
      `overflow: auto` als Auffangnetz und dieselbe `90rem`-Begrenzung.
- [ ] → Phase 5: `.episode__stage` rollt jetzt selbst (`overflow: auto`), statt
      die Seite zu rollen. Das ist das Auffangnetz, nicht das Ziel: Bei der
      Bildsuche müssen Aufgabe, Bild, „Weiter" und Rückmeldung **ohne** Rollen
      ins Bild passen (AK 5) — dann greift es dort nie.
- [ ] → Phase 5: Zwei Tokens rechnen noch mit `vh` statt `dvh`:
      `--size-dialog-figure-block: min(46vh, …)` und
      `--size-answer-min-block: clamp(…, 8vh, …)`. Das sind keine Bühnenhöhen,
      aber dieselbe Tablet-Falle — die Figur springt beim Ein- und Ausfahren
      der Browserleiste. Beim Anfassen der Aufgabenfläche mitziehen.
