# Curriculum & Variation — Lernziele vor Fandom, Aufgabenraum statt Aufgabe

**Status:** geparkt. Startet **nach Meilenstein 5** (Sammelkarten & Druckbogen).
Löst den Einzelplan `2026-08-19_curriculum-layer.md` ab (dessen Phasen A und B
sind hier Phase 2 und 3).

## Warum

Zwei Lücken, die dieselbe Wurzel haben: eine Welt entsteht heute vom Franchise
her und wird für **genau eine** Aufgabe pro Station geschrieben.

1. **Fachlich:** Der Lernziel-Katalog
   ([docs/knowledge/lerninhalte-hessen-klasse-1.md](../../knowledge/lerninhalte-hessen-klasse-1.md))
   fordert Lernziel zuerst, Welt als Kostüm. Der Welt-Bauprompt macht es
   umgekehrt.
2. **Spielerisch:** Die zweite Runde derselben Episode ist Zeichen für Zeichen
   die erste. Die richtige Antwort steht auf demselben Platz, dieselben vier
   Bilder, dieselbe Zahl.

Der Ideenspeicher hinter Phase 3 und 4:
[docs/knowledge/spielmechaniken-katalog.md](../../knowledge/spielmechaniken-katalog.md).

## Der Konflikt, der hier entschieden wird

Der Variationsteil der Quelldatei fordert: „Die Episode wird für einen
**Aufgabenraum** geschrieben, nicht für eine Aufgabe." Der Vorgängerplan warnte
wörtlich vor generischen Schablonen, „die pro Welt nur umlackiert werden — die
Bindung an Story und Figuren ist das Produkt, nicht der Overhead."

**Entscheidung: beides gilt, aber je Aufgabenfamilie verschieden.**

| Ebene | Variiert wie | Warum |
|---|---|---|
| Story, Dialog, Figuren | **gar nicht** | jede Textvariante kostet eine Sprachaufnahme, sonst ist die Zeile stumm |
| Deutsch-Aufgaben (Reime, Anlaute, Silben) | **Pool** — mehrere handgeschriebene Fassungen | Sprache lässt sich nicht rechnen; die Formulierung ist die Aufgabe |
| Mathe-Aufgaben | **Generator** — Vorlage plus Zahlenraum | `4 + 3` ist nicht weniger Pokémon, weil eine Formel es erzeugt hat |
| Anzeigereihenfolge, Bildauswahl | **Mischung** | kostet nichts und wirkt sofort |

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Variationssystem — ein Würfel für alle](phase-1-variationssystem.md) | heikel | pending |
| 2 | [Welt-Bauprompt vom Lernziel her](phase-2-bauprompt.md) | standard | pending |
| 3 | [Neue Eventtypen für Mathematik](phase-3-neue-eventtypen.md) | heikel | pending |
| 4 | [Variation im Content der Pokémon-Welt](phase-4-content-pools.md) | mechanisch | pending |

Reihenfolge ist bindend. Phase 1 vor Phase 3, weil sonst jeder der fünf neuen
Aufgabentypen seinen eigenen Zufallsgenerator mitbringt — bei zwei Typen ist das
bereits passiert. Phase 2 vor Phase 3, weil der umgebaute Bauprompt zeigt,
welche Typen wirklich fehlen.

## Kontrakt — die neuen JSON-Schlüssel

Verbindlich für Engine und Content, festgelegt **vor** Phase 1.

- **`variants` bleibt die Lernstufe.** Der Schlüssel ist im Bestand vergeben
  (`jungtrainer` / `trainer` / `arenaleiter`). Er wird nicht umgedeutet.
- **`pool`** — eine Liste vollständiger Aufgabenfassungen **innerhalb** einer
  Lernstufen-Variante. Frage und ihre Antworten sind immer ein Paket und werden
  nie getrennt gemischt.
- **`generated`** — Vorlage plus Zahlenbereiche plus Bedingungen, ebenfalls
  innerhalb einer Lernstufen-Variante.
- **Beide sind optional.** Eine Variante ohne `pool` und ohne `generated` ist
  weiterhin genau eine Aufgabe und bleibt gültig. Kein Bestandscontent bricht.

```json
{
  "variants": {
    "jungtrainer": {
      "pool": [
        { "id": "haus_maus", "question": "…", "options": [], "correct_index": 0 },
        { "id": "baum_blume", "question": "…", "options": [], "correct_index": 0 }
      ]
    }
  }
}
```

## Finale Abnahmekriterien

1. Dieselbe Episode zweimal hintereinander gespielt zeigt bei jeder Aufgabe mit
   Pool eine andere Fassung, und die richtige Antwort steht nicht auf demselben
   Platz.
2. Derselbe Startwert erzeugt denselben Durchlauf — nachweisbar, indem ein
   abgebrochener Lauf nach dem Wiedereinstieg dieselben Aufgaben zeigt.
3. Bestandscontent ohne `pool`/`generated` spielt unverändert.
4. Kein `Math.random()` mehr in einer Event-Komponente.
5. Der Welt-Bauprompt beginnt bei der Lernziel-Liste, und die erzeugte Welt
   nennt pro Aufgabe ihr Lernziel.

## Bewusst nicht eingeplant

Aus der Quelldatei übernommen und **abgelehnt**, mit Grund:

- **Auswertung pro Variante** (welche Aufgabe wird oft falsch beantwortet) —
  Werkzeug für eine Redaktion mit tausenden Spielern. Hier sitzt das Kind im
  selben Raum.
- **Gewichtete Auswahl.** Löst ein Problem, das bei fünf Fassungen nicht
  existiert.
- **Semantische Wiederholungs-Marken** (`concept`, `pattern`) — der
  Pflegeaufwand pro Aufgabe übersteigt den Nutzen bei dieser Poolgröße.

Sie stehen hier, damit sie nicht in einem halben Jahr als „vergessen" neu
auftauchen.

## Summary

_(beim Archivieren füllen)_

## Files touched

## Commits

## Deviations from plan

## Follow-ups
