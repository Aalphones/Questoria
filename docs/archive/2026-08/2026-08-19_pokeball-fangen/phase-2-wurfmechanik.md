# Phase 2 — Die Wurfmechanik

**Rating:** heikel (Bewegung über die Zeit, Trefferentscheidung, und drei
Bedienarten müssen dasselbe Ergebnis liefern)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-eventtyp-und-buehne.md](phase-1-eventtyp-und-buehne.md) — muss fertig
  sein
- [README.md](README.md), Punkte 3 bis 5 unter „Entschieden vor dem Bauen"
- `frontend/src/styles/_motion.scss` — die geteilten Bildfolgen der App
- `frontend/src/app/features/events/image-search/` — wie Ziele in dieser App
  ohne Maus erreichbar gemacht werden
- `docs/conventions/` (Angular)

## Die Mechanik, ausgeschrieben

```
Ziel läuft zwischen linkem und rechtem Rand hin und her
    ↓
Kind löst den Wurf aus (Tippen auf die Bühne, Klick auf den Wurfknopf,
Leertaste oder Eingabetaste auf dem fokussierten Knopf)
    ↓
Ball fliegt in 600 ms von der Bühnenmitte unten zu der x-Position,
an der das Ziel im Moment des Abwurfs stand
    ↓
Treffer, wenn das Ziel beim Aufschlag höchstens eine halbe Sprite-Breite
von dieser Stelle entfernt ist
    ↓
Treffer  → Fangsequenz (unten), Name des Pokémon, „Weiter"
Fehlwurf → kurze Rückmeldung, der nächste Ball liegt bereit
```

## Die Fangsequenz

Nachempfunden, was das Spiel selbst macht — das ist der Moment, für den dieses
Event gebaut wird. Feste Abfolge, keine Zufallsentscheidung:

```
Ball trifft, Pokémon verschwindet          200 ms  Ball wird sichtbar, fällt
Ball fällt zu Boden                        400 ms  fallen + einmal aufsetzen
Wackler 1  ← Taste blinkt                  600 ms  ±12° hin und zurück
Pause                                      200 ms
Wackler 2  ← Taste blinkt                  600 ms
Pause                                      200 ms
Wackler 3  ← Taste blinkt                  600 ms
Bestätigung: Aufblitzen, Name erscheint    400 ms
```

Zusammen gut drei Sekunden. Länger wird es zäh, kürzer trägt die Spannung nicht.

- **Wackeln** ist eine Drehung um ±12° und zurück, reines CSS, kein Bild.
- **Blinken** ist ein Überblenden auf `pokeball_blink.png` und zurück, zeitlich
  im Wackler liegend. Beide Bilder stehen übereinander im selben Rahmen, es
  wechselt nur die Deckkraft — kein Austausch der Bildquelle, sonst flackert es
  beim ersten Mal, während die zweite Datei noch lädt.
- **Beide Bilder vorher laden**, bevor die Sequenz startet.
- **Die Sequenz kann nicht scheitern.** Kein Ausbrechen nach dem zweiten
  Wackler, kein „fast gefangen". Wer trifft, fängt.

Geschwindigkeiten: `langsam` = 12 s je Hin- und Rückweg, `normal` = 8 s,
`schnell` = 5 s. Ab dem vierten Wurf halbiert sich die Geschwindigkeit und die
Trefferbreite verdoppelt sich; ab dem fünften Wurf trifft jeder Ball.

## Abnahmekriterien

1. Die drei Auslöser (Tippen, Klick, Taste) erzeugen denselben Wurf — kein
   Bedienweg trifft leichter als ein anderer.
2. Während ein Ball fliegt, löst ein weiterer Auslöser keinen zweiten Wurf aus.
3. Ein Treffer spielt die Fangsequenz oben vollständig ab — drei Wackler, die
   Taste blinkt in jedem, danach der Name; ein Fehlwurf zeigt eine freundliche
   Rückmeldung ohne Wertung („Knapp daneben — noch einen Ball?").
4. Der fünfte Wurf fängt garantiert, unabhängig vom Timing.
5. Bei `prefers-reduced-motion: reduce` steht das Ziel still, der Ball erscheint
   ohne Flugbahn und jeder Wurf trifft. Die Fangsequenz **entfällt nicht**: statt
   zu wackeln blinkt die Taste dreimal an Ort und Stelle, gleiche Dauer, gleicher
   Abschluss. Bewegungsreduktion heißt weniger Bewegung, nicht weniger Belohnung.
6. Die Bewegung läuft über CSS-Bildfolgen, nicht über einen Zeitgeber, der bei
   jedem Bild neu zeichnet.
7. Beim Verlassen der Aufgabe laufen keine Zeitgeber weiter (Aufräumen über
   `DestroyRef`, Muster aus `word-match.ts`).

## Checkliste

- [x] Ziel-Bewegung als CSS-Bildfolge, Dauer aus `speed` als
      benutzerdefinierte Eigenschaft gesetzt
- [x] Position des Ziels im Moment des Abwurfs auslesen — über
      `getBoundingClientRect()` des Sprites, nicht über nachgerechnete Zeit
- [x] Wurf-Zustand als Signal (`bereit` | `fliegt` | `gefangen`), Auslöser
      sperren solange `fliegt`
- [x] Flugbahn des Balls als eigene Bildfolge, Ziel-x als Eigenschaft
- [x] Trefferentscheidung nach Ende der Flugbahn, Toleranz aus der Wurfnummer
- [x] Fehlwurf-Zähler; ab dem vierten Wurf Erleichterung, ab dem fünften
      garantierter Fang
- [x] Fangsequenz als eine zusammenhängende CSS-Bildfolge nach dem Zeitplan
      oben — Fallen, drei Wackler, Blinken der Taste, Aufblitzen
- [x] Beide Ballbilder übereinander im selben Rahmen, Blinken über die
      Deckkraft; beide vor dem Start der Sequenz geladen
- [x] Name des gefangenen Pokémon erscheint zum Abschluss, „Weiter" schließt das
      Event mit `kind: 'story'` ab
- [x] Bewegungsreduktion: eigener Zweig ohne Flugbahn und ohne Wackeln, aber
      **mit** Blinken (AK 5)
- [x] Aufräumen im `DestroyRef` — **entfällt ersatzlos:** es gibt keinen
      einzigen Zeitgeber. Beide Übergänge (Landung, Ende der Fangsequenz)
      hängen am `animationend` der jeweiligen Bildfolge, und die stirbt mit
      ihrem Element. AK 7 ist damit strukturell erfüllt statt aufgeräumt.
- [ ] Am echten Tablet des Kindes prüfen, nicht nur am Entwicklungsrechner
      (steht beim User, siehe Report-Back)

## Risiken

🟡 **Die Trefferentscheidung ist die wackligste Stelle.** Wird die Zielposition
nachgerechnet statt gemessen, gehen Anzeige und Logik auseinander, sobald das
Gerät ins Stocken kommt — das Kind sieht einen Treffer, das Spiel zählt einen
Fehlwurf. Deshalb messen, nicht rechnen. Prüfung: Wurf auslösen, während ein
zweiter Reiter das Gerät auslastet.

🟡 **Ein Timing-Spiel kann für ein Kind der ersten Klasse zu schnell sein.** Die
Voreinstellung im Content ist deshalb `normal`, aber die erste Runde am
Bildschirm entscheidet — wenn drei Fehlwürfe die Regel sind, ist `langsam` der
neue Standard. Das ist eine Content-Änderung, kein Code-Fehler.

## Report-Back

**Status: complete (21.08.2026).** Build grün, Lint grün, Prettier grün.

### Wie es gebaut ist

Kein einziger Zeitgeber. Der ganze Ablauf hängt an drei CSS-Bildfolgen und zwei
`animationend`-Meldungen: Flugbahn → Landung, Fangsequenz → Name. Das war nicht
Sparsamkeit, sondern die Antwort auf das Phase-2-Risiko — ein Zeitgeber, der auf
einem ausgelasteten Gerät spät feuert, entscheidet über eine Lage, die auf dem
Bildschirm längst vorbei ist.

**Die Trefferentscheidung misst beide Kästen im selben Augenblick** — den des
Ziels und den des Balls, beide über `getBoundingClientRect()`. Damit ist der
Vergleich immun gegen Verzögerung: was gemessen wird, ist genau das, was in
diesem Moment auf dem Bildschirm steht. Selbst wenn die Meldung 300 ms zu spät
kommt, sieht das Kind dasselbe Ergebnis, das gezählt wird.

### Abweichungen vom Plan

1. **Das Ziel bleibt beim garantierten Wurf stehen** (ab dem fünften Wurf, sobald
   der Ball fliegt). Nicht geplant. Ohne das landet der Ball auf einer leeren
   Stelle, das Pokémon verschwindet zwei Handbreit daneben und der geschenkte
   Fang sieht aus wie ein Fehler. Eine Klasse, ein `animation-play-state`.
2. **Die Trefferbreite misst den Ziel-Kasten, nicht das Motiv darin.** Ein
   freigestelltes Sprite mit viel Luft im Rahmen macht das Spiel großzügiger als
   die Zahl im Plan verspricht. Bewusst so: der Kasten ist die Fläche, die ein
   Kind als „das Pokémon" sieht.
3. **`DestroyRef` entfällt** (siehe Checkliste).
4. **Die Blink-Ebene ist ein schlichtes `<img>`, kein `qst-image-slot`.** Ein
   beschrifteter Platzhalter würde beim Blinken den Ball verdecken statt zu
   helfen; fehlt die Datei, verschwindet die Ebene ganz.
5. **Der Wurfknopf wird während des Flugs nicht gesperrt.** Ein gesperrter Knopf
   verliert den Tastatur-Fokus — das Kind käme nach dem ersten Wurf mit der
   Leertaste nicht mehr weiter. Den zweiten Wurf hält der Zustand ab, nicht das
   `disabled`.

### Unsicherste Stelle

`pokemon-catch.scss` — die Bewegungsreduktions-Sektion am Dateiende. Sie ist der
einzige Teil, den ich hier nicht sehen kann: dass die Ersatz-Bildfolge
`eqPokeballCatchStill` wirklich dieselbe Dauer läuft und ihr `animationend`
meldet, steht auf dem Papier richtig, aber geprüft ist es nicht. Klärender
Check: im Browser die Bewegungsreduktion einschalten, einmal werfen — kommt der
Name nach gut drei Sekunden, stimmt es; bleibt der Bildschirm nach dem Blinken
stehen, feuert die Meldung nicht.
