# ADR-016: Fassungsauswahl sitzt im Ablauf-Gerüst, nicht in der Komponente

**Status:** entschieden · 20.08.2026

## Kontext

Die zweite Runde derselben Episode war Zeichen für Zeichen die erste: gleiche
Aufgabenformulierung, gleiche Antwortreihenfolge, gleiche Zahl. Das
Variationssystem (`docs/planning/2026-08-19_curriculum-und-variation/`) löst
das mit zwei neuen, optionalen Feldern je Lernstufen-Variante: `pool` (mehrere
handgeschriebene Fassungen) und `generated` (Vorlage plus Zahlenbereich plus
Bedingungen).

Zwei Fragen waren vor dem Bauen zu entscheiden: **wo** die Auswahl passiert,
und ob `variants` seine Bedeutung behält.

## Entscheidung 1: `variants` bleibt die Lernstufe

`variants` ist im Bestand vergeben (`jungtrainer` / `trainer` / `arenaleiter`)
und wird nicht umgedeutet. `pool`/`generated` sitzen **innerhalb** einer
Lernstufen-Variante, nicht daneben — eine Aufgabe hat weiterhin genau eine
Lernstufe und innerhalb dieser Lernstufe wahlweise mehrere Fassungen.

## Entscheidung 2: Die Auswahl sitzt im Ablauf-Gerüst

`resolve-event-config.ts` löst seit jeher `config.ref` und die
Lernstufen-Variante auf, bevor eine Event-Komponente etwas sieht — das ist
genau die Stelle, an der jetzt auch `pool`/`generated` aufgelöst werden.

**Optionen:**

1. **Jede Komponente löst ihren eigenen Pool auf.** Kein neuer gemeinsamer
   Code, aber jeder der fünf für Phase 3 vorgesehenen neuen Aufgabentypen
   bringt seinen eigenen Zufallsgenerator mit — bei `multiple-choice.ts` und
   `word-match.ts` war das bereits zweimal derselbe `Math.random()`-Aufruf an
   zwei Stellen, leicht verschieden.
2. **Die Auswahl sitzt im Ablauf-Gerüst**, die Komponente bekommt wie bisher
   eine fertig aufgelöste Konfiguration und weiß nicht, ob sie aus einem
   Pool, einem Generator oder direkt aus der Content-Datei kam.

Option 2. Damit bleibt der Vertrag aus Abschnitt 4 („Inline oder ausgelagert")
bestehen: Eine Event-Komponente sieht niemals `ref`, niemals die übrigen
Lernstufen — und jetzt auch niemals `pool`, `generated` oder eine
Fassungs-`id`. Sie bekommt eine Aufgabe, keine Auswahl.

## Der eine Würfel

`services/variation.ts` bündelt alle Zufallsfunktionen als reine Funktionen
(Muster wie `services/progress.rules.ts`) — `seededRandom`, `shuffle`,
`selectFromPool`, `generateInteger`, `resolveTemplate`,
`satisfiesConstraints`. Kein `Math.random()` mehr außerhalb dieser Datei.

**Reproduzierbarkeit:** Ein Lauf trägt einen Startwert, abgeleitet aus
Profil-ID, Episoden-ID und der Nummer des Versuchs (`deriveRunSeed`). Jedes
Event im Lauf leitet daraus über seine Position einen eigenen Startwert ab
(`deriveEventSeed`) — sonst zöge jede Aufgabe eines Laufs denselben ersten
Zufallswert. Der Lauf-Startwert überlebt im Spielstand (`StoredRun.seed`); ein
Wiedereinstieg zieht keine neuen Fassungen.

**Wiederholungsschutz:** Die letzten drei benutzten Pool-Fassungen je Aufgabe
(`VariantHistoryService`, Schlüssel `event_id`) überleben das Beenden der App
— anders als der angefangene Lauf, den `RunStoreService` beim Episodenende
löscht. Die Meidungsliste ist **Teil der Eingabe** von `selectFromPool`, kein
nachträglicher Filter: Ein Startwert wäre sonst nicht mehr reproduzierbar,
sobald sich die zuletzt benutzten Fassungen zwischen zwei Läufen ändern.

## Konsequenzen

- Bestandscontent ohne `pool`/`generated` bleibt unverändert gültig — eine
  Variante ohne beide Felder ist weiterhin genau eine Aufgabe.
- Ein fehlender Startwert in einem alten Spielstand ist kein Fehler: Die
  Engine zieht dann neu, statt den Lauf zu verwerfen.
- Phase 3 (neue Eventtypen für Mathematik) baut auf `generateInteger`,
  `resolveTemplate` und `satisfiesConstraints` auf, statt sie neu zu
  erfinden — das war der Grund, warum diese Phase vor Phase 3 steht.
