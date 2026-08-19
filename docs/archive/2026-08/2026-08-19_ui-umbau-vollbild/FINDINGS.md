# Findings — UI-Umbau

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Abgearbeitete Zeilen abhaken, nicht löschen.

## Aus Phase 1

- [x] → Phase 2: `.main-hub` hat übergangsweise `overflow: auto` bekommen, damit
      die Planetenkarte nach dem Bühnen-Umbau nichts abschneidet. Sobald sie
      vollflächig ist, muss das wieder raus — eine Karte, die rollt, ist keine
      Vollbild-Karte. Ebenso fällt `max-inline-size: 90rem` + `padding` weg,
      die halten die Karte heute von den Rändern fern.
      **Erledigt:** `overflow: auto` durch gezieltes `overflow-x: auto` /
      `overflow-y: hidden` ersetzt (das ist jetzt die eine rollende Fläche aus
      AK 6, kein Auffangnetz mehr), `max-inline-size` + `padding` entfernt.
- [x] → Phase 3: Dasselbe für `.map` und `.timeline` — beide haben jetzt
      `overflow: auto` als Auffangnetz und dieselbe `90rem`-Begrenzung.
      **Erledigt:** beide entfernt, die Karte passt sich jetzt ein statt zu
      rollen — kein Auffangnetz mehr nötig.
- [x] → Phase 5: `.episode__stage` rollt jetzt selbst (`overflow: auto`), statt
      die Seite zu rollen. Das ist das Auffangnetz, nicht das Ziel: Bei der
      Bildsuche müssen Aufgabe, Bild, „Weiter" und Rückmeldung **ohne** Rollen
      ins Bild passen (AK 5) — dann greift es dort nie.
      **Erledigt:** Bildsuche füllt jetzt die Bühnenhöhe selbst (`task-card`
      `fill`-Modus, siehe Report-Back Phase 5), das Auffangnetz bleibt als
      Sicherheitsnetz für die anderen vier Aufgabentypen stehen.
- [x] → Phase 5: Zwei Tokens rechnen noch mit `vh` statt `dvh`:
      `--size-dialog-figure-block: min(46vh, …)` und
      `--size-answer-min-block: clamp(…, 8vh, …)`. Das sind keine Bühnenhöhen,
      aber dieselbe Tablet-Falle — die Figur springt beim Ein- und Ausfahren
      der Browserleiste. Beim Anfassen der Aufgabenfläche mitziehen.
      **Erledigt:** beide auf `dvh` umgestellt.

## Aus Phase 4

- [x] → Phase 5: `--size-level-image-block: clamp(6rem, 22vh, 13rem)` ist die
      dritte Stelle mit `vh` statt `dvh` und gehört zum selben Aufräumen wie die
      beiden Tokens oben. Nicht dringend — die Stufenauswahl hat Luft nach unten,
      ein springender Wert kostet dort nichts.
      **Erledigt:** auf `dvh` umgestellt.
- [x] → Phase 5: `qst-image-slot` hat jetzt einen `fit`-Eingang
      (`cover` | `contain`). Die Bildsuche und die Antwortbilder stehen bis heute
      auf `cover` und beschneiden damit freigestellte Motive an den Rändern —
      beim Anfassen der Aufgabenfläche prüfen, ob `contain` dort das Richtige ist.
      **Erledigt:** Antwortbilder (Quiz, Wörter zuordnen) auf `contain`
      umgestellt — das sind die freigestellten 512×512-Motive. Die Bildsuche
      bleibt bei `cover`: ihr Bild ist eine volle Szene aus `backgrounds/`,
      kein freigestelltes Motiv, Beschneiden ist dort das Richtige.

## Aus der Abnahme am Bildschirm (19.08.2026)

Drei Befunde von Sascha, alle behoben — zwei davon aus **einer** Ursache.

- [x] **Die Bühne hat nie funktioniert.** `app.html` enthält
      `<main class="stage"><router-outlet /></main>`, und Angular hängt den Screen
      als **Geschwister nach** dem Outlet ein — das Outlet-Element bleibt im DOM.
      Damit hatte das Bühnen-Grid zwei Elemente statt einem: das leere Outlet
      belegte die einzige `minmax(0, 1fr)`-Zeile, der Screen landete in einer
      impliziten `auto`-Zeile darunter. Sichtbare Folge: eine leere Fläche oben,
      die Kopfleiste in der Mitte (Lernstufen) oder ganz unten (Etappenkarte),
      der Rest aus der Bühne geschoben und von `overflow: clip` abgeschnitten.
      **Behoben:** `.stage > router-outlet { display: none; }`.
      **Lehre:** Phase 1 war „Build grün, Lint grün" und trotzdem an der
      zentralen Annahme vorbei — ein Grid-Elternteil mit `router-outlet` hat
      immer ein Element mehr, als das Template zu zeigen scheint.
- [x] **Planetenkarte lief unten rechts aus dem Bild.** Zwei Anteile: die
      Fehlplatzierung oben, plus die Pokémon-Kachel bei `y: 78` mit Namensschild,
      die über die Kartenunterkante hinausragt.
      **Behoben:** `.main-hub` passt die Karte jetzt ein wie Etappen- und
      Ortskarte (`container-type: size`, Formel aus `map-canvas`), stellt sie
      mittig und lässt einen Luftring (`padding`), in den Knoten am Rand ragen
      dürfen.
- [x] **Der Bildschirmrand blieb leer.** Die eingepasste 16:9-Karte lässt auf
      breiten Fenstern Bänder frei.
      **Behoben:** `.main-hub__backdrop` — dieselbe Karte, weichgezeichnet und
      abgedunkelt, formatfüllend hinter der Kartenfläche. Bewusst eine zweite
      Ebene statt die Karte selbst zu beschneiden: die Weltkoordinaten im Content
      hängen am unbeschnittenen 16:9, ein Zuschnitt würde jeden Knoten von seiner
      Landmarke wegschieben (dieselbe Falle, die am 19.08. schon die Pokémon-
      Kachel in den leeren Himmel gesetzt hatte).
- [ ] **Abweichung von Phase 2, AK 6:** Das waagerechte Rollen der Planetenkarte
      bei mehr Welten ist damit **entfallen** — es widerspricht direkt Saschas
      Vorgabe „die Planeten dürfen nicht hinauslaufen". Alle Welten sind jetzt
      immer gleichzeitig im Bild. Wenn die Karte irgendwann mehr Welten trägt,
      als lesbar nebeneinanderpassen, ist das ein neuer Befund — kein Zurück zum
      Rollen ohne Entscheidung.
