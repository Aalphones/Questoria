# Pokéball werfen — das erste Franchise-Spiel

**Status:** freigegeben am 19.08.2026, geparkt. Umsetzung nach Abschluss von
Phase 3 der ersten echten Welt; unabhängig von Meilenstein 5 und vom
Variationssystem.

## Warum genau dieses Spiel

Die Pokémon-Welt besteht heute aus Lesen, Zuordnen und Suchen — vier
Aufgabentypen, die in jeder anderen Welt genauso aussähen. Es fehlt der Moment,
den ein Kind meint, wenn es „Pokémon" sagt. Der Wurf ist die ikonischste
Handlung des Franchise, braucht kein Regelwerk und keine Story-Änderung, und die
Belohnungsstelle dafür ist bereits da.

Aus dem [Spielmechaniken-Katalog](../../knowledge/spielmechaniken-katalog.md):
Lernwert ★★, Spaß ★★★★★. Das ist ehrlich — **dieses Spiel unterrichtet nichts.**
Es ist eine Belohnung, und es wird auch als solche gebaut: keine Sterne, kein
Lernziel, kein Scheitern.

## Entschieden vor dem Bauen

1. **Eigener Eventtyp `pokemon_catch`, keine zweite Vermittlungsschicht.** Die
   Zuordnung Eventtyp → Komponente in `event-type-map.ts` ist bereits das
   Register, das ein Franchise-Spiel braucht. Ein zusätzlicher Typ
   `franchise_game` mit `game_id` im Inneren wäre eine zweite Verteilstelle ohne
   Gewinn. → **ADR-015**
2. **Das Spiel ist ein Story-Event, kein bewertetes.** Es meldet `kind: 'story'`
   zurück, steht nicht in `SCORED_EVENT_TYPES` und beeinflusst die Sterne nicht.
   Wer den Ball dreimal verfehlt, hat trotzdem eine gute Episode gespielt.
3. **Es kann nicht schiefgehen.** Nach drei Fehlwürfen kommt das Pokémon näher
   und wird langsamer; ab dem fünften Wurf trifft jeder Ball. Ein Kind, das
   motorisch noch nicht so weit ist, wird nicht bestraft — es dauert nur länger.
4. **Timing statt Zielen.** Das Pokémon läuft hin und her, ein Knopf löst den
   Wurf aus, der Ball fliegt auf die Stelle, an der das Ziel beim Abwurf stand.
   Eine Achse, ein Zeitfenster. Das funktioniert mit Finger, Maus und Tastatur
   gleich gut — Zielen mit Wischgeste tut das nicht.
5. **Keine Sammelkarte, kein Erfolg.** Das gefangene Pokémon wird gezeigt und
   gefeiert, mehr nicht. Besitz und Sammlung hängen an Meilenstein 5; die beiden
   Pläne werden nicht verheddert.
6. **Konfiguration inline**, wie `dialog` und `reward` — keine Lernstufen-
   Varianten. Ein Belohnungsmoment skaliert nicht mit der Lesefähigkeit.

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Eventtyp und Bühne](phase-1-eventtyp-und-buehne.md) | standard | pending |
| 2 | [Die Wurfmechanik](phase-2-wurfmechanik.md) | heikel | pending |
| 3 | [Einbau in die Pokémon-Welt](phase-3-einbau.md) | mechanisch | pending |

## Kontrakt — die Konfiguration

```json
{
  "type": "pokemon_catch",
  "config": {
    "targets": [
      { "sprite": "pikachu/pikachu_neutral.png", "name": "Pikachu" },
      { "sprite": "rattfratz/rattfratz_neutral.png", "name": "Rattfratz" }
    ],
    "ball": "pokeball.png",
    "ball_blink": "pokeball_blink.png",
    "speed": "normal",
    "intro": "Wirf den Ball, wenn Pikachu vor dir steht!"
  }
}
```

- `targets` — Liste möglicher Ziele, eines wird beim Öffnen gezogen. Pfad wie
  bei Dialog-Sprites relativ zu `sprites/`.
- `ball` / `ball_blink` — beide Dateinamen unter dem neuen Ordner `props/`,
  ausgeschrieben. **Kein Ableiten des zweiten Namens aus dem ersten** — ein
  stillschweigendes `_blink` am Dateinamen ist die Sorte Regel, die niemand
  findet, wenn das Bild mal anders heißt. Fehlt `ball_blink`, blinkt es nicht
  und alles andere läuft weiter.
- `speed` — `langsam` | `normal` | `schnell`, wirkt auf die Laufgeschwindigkeit
  des Ziels. Kein freier Zahlenwert im Content.
- `intro` — Ansage über der Bühne, wird im Vorlesemodus von der Gerätestimme
  gesprochen. **Keine Sprachaufnahme nötig** — sonst kostet jede Änderung an
  diesem Satz einen Vertonungslauf.

## Neue Assets — vollständige Liste

**Zwei neue Dateien.** Alles andere ist Bestand.

| Datei | Maß | Zweck |
|---|---|---|
| `data/themes/pokemon_lesen/props/pokeball.png` | 512×512 PNG mit Alpha | geschlossener Ball, Taste dunkel |
| `data/themes/pokemon_lesen/props/pokeball_blink.png` | 512×512 PNG mit Alpha | **derselbe Ball**, Taste rot leuchtend |

**Das zweite Bild ist keine Bequemlichkeit, sondern die einzige robuste
Lösung.** Die blinkende Taste sitzt an einer bestimmten Stelle des Balls; ein
Leuchtpunkt aus CSS müsste diese Stelle in Pixeln kennen und säße nach jedem
neuen Ballbild daneben. Zwei Bilder, die überblendet werden, sind gegen jede
Bildänderung immun.

**Bedingung an das Paar:** identischer Bildausschnitt, identische Ballgröße,
identische Position im Rahmen — **nur** die Taste unterscheidet sich. Deshalb
wird das zweite Bild mit **FLUX.2 und dem ersten als Ankerbild** erzeugt, nicht
frei mit Krea 2. Ohne Anker entstehen zwei verschiedene Bälle, und das Blinken
wird zum Ruckeln.

- **Wackeln braucht kein Bild** — das ist eine Drehung um wenige Grad in CSS.
- **Ziel-Sprites:** Bestand (`sprites/pikachu/`, `sprites/rattfratz/`).
- **Hintergrund:** der Hintergrund der Episode, wie bei jedem Event.
- **Ton:** keiner. Die App hat bis heute kein System für Geräusche, und dieses
  Spiel ist kein guter Anlass, eines anzufangen. Der Ansagetext läuft über die
  Gerätestimme, ohne Sprachaufnahme. 🟡 Gerade die Fangsequenz lebt im echten
  Spiel vom Klicken — das fehlt hier, bewusst, und ist der erste Kandidat, falls
  Geräusche später ein Thema werden.

## Finale Abnahmekriterien

1. Der Wurf lässt sich mit Finger, Maus **und** Tastatur auslösen.
2. Ein Treffer spielt die Fangsequenz aus dem echten Spiel — Ball fällt, wackelt
   dreimal, die Taste blinkt zwischen den Wacklern, dann Bestätigung mit dem
   Namen des Pokémon. Danach geht die Episode weiter.
3. Fünf Würfe fangen garantiert, egal wie gut das Timing war.
4. Bei eingeschalteter Bewegungsreduktion des Systems steht das Ziel still und
   jeder Wurf trifft — ohne dass die Bestätigung anders aussieht.
5. Das Spiel verändert die Sternenzahl der Episode nicht.
6. Der Ball wird auch dann angezeigt, wenn die Bilddatei fehlt (beschrifteter
   Platzhalter, wie überall in dieser App).

## Summary

_(beim Archivieren füllen)_

## Files touched

## Commits

## Deviations from plan

## Follow-ups
