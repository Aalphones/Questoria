# ADR-015: `pokemon_catch` ist ein eigener Eventtyp, kein `franchise_game`

**Status:** entschieden · 21.08.2026

## Kontext

Die Pokémon-Welt besteht bisher aus Lesen, Zuordnen und Suchen — vier
Aufgabentypen, die in jeder anderen Welt genauso aussähen. Es fehlt der
Moment, den ein Kind meint, wenn es „Pokémon" sagt: der Wurf des Balls
(`docs/planning/2026-08-19_pokeball-fangen/README.md`). Das Spiel ist bewusst
kein Lerninhalt — es meldet `kind: 'story'`, steht nicht in
`SCORED_EVENT_TYPES` und beeinflusst die Sterne nicht.

Absehbar ist, dass weitere Franchises eigene, ikonische Spielmomente bekommen
sollen (Katalog unter `docs/knowledge/spielmechaniken-katalog.md`). Die Frage
ist, wie diese Momente sich in die Eventtyp-Struktur einfügen.

## Optionen

1. **Ein generischer Eventtyp `franchise_game`** mit einem inneren `game_id`,
   der zur Laufzeit auf die passende Sub-Komponente verzweigt — eine
   Vermittlungsschicht für alle künftigen Franchise-Spiele.
2. **Jedes Franchise-Spiel sein eigener Eventtyp**, registriert wie jeder
   andere Typ in `event-type-map.ts` und der Schema-Referenz.

## Entscheidung

Option 2.

`event-type-map.ts` ist bereits das Register, das ein Franchise-Spiel
braucht: eine Zeile bindet einen `type` an eine Komponente, geladen über
`ngComponentOutlet` (Critical Rule 9 — kein `@switch` im Ablauf-Gerüst). Ein
zusätzlicher Typ `franchise_game` mit `game_id` im Inneren wäre eine zweite
Verteilstelle neben der ersten, ohne dass irgendetwas dadurch einfacher würde
— sie müsste dieselbe Zuordnung Typ → Komponente noch einmal nachbauen, nur
eine Ebene tiefer und ungeschützt durch die Typ-Tabelle aus
`JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0.

## Konsequenzen

- Jedes künftige Franchise-Spiel entsteht wie jeder andere Eventtyp: ein
  Ordner unter `features/events/`, eine Zeile in `event-type-map.ts`, ein
  Abschnitt im Schema. Kein Backend-Code.
- `pokemon_catch` bekommt keine Lernstufen-Varianten — ein Belohnungsmoment
  skaliert nicht mit der Lesefähigkeit (README „Entschieden vor dem Bauen" 6).
  Die Konfiguration ist inline, wie bei `dialog` und `reward`.
- Besitz und Sammlung (welches Pokémon gefangen wurde) hängen an
  Meilenstein 5 (Sammelkarten) und werden hier nicht vorweggenommen — die
  beiden Pläne bleiben unabhängig voneinander.
