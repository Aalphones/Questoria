# Phase 3 — Neue Eventtypen für Mathematik

**Rating:** heikel (jeder Typ bringt eine neue Bedienart mit; die
Ziehen-und-Ablegen-Grundlage entscheidet über drei davon)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-variationssystem.md](phase-1-variationssystem.md) — muss fertig sein;
  jeder neue Typ nutzt `services/variation.ts`, keiner würfelt selbst
- `frontend/src/app/features/episode/event-type-map.ts` — die Registrierung
- `frontend/src/app/features/events/word-match/` — nächstes Vorbild: mehrteilige
  Aufgabe, Mischung, Tastaturbedienung, Fehlerzählung
- `frontend/src/app/ui/task-card/` — die gemeinsame Hülle jeder Aufgabe
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0
- `docs/knowledge/lerninhalte-hessen-klasse-1.md` — welcher Typ welches Lernziel
  bedient

## Entscheidung vorab: welche zwei zuerst

Gebaut werden in dieser Reihenfolge **`sorting`** und **`number_line`**.

- `sorting` (Gegenstände in Kategorien) deckt die meisten Lernziele quer über
  Deutsch, Mathe und Sachkunde ab und liefert nebenbei die
  Ziehen-und-Ablegen-Grundlage, auf der `ordering` und `fill_gap` später sitzen.
- `number_line` ist der einzige Typ, den der Zahlenraum-Teil des Katalogs
  zwingend braucht und den kein anderer Typ ersetzen kann.

`ordering`, `fill_gap` und `pattern` folgen erst danach — als eigene Phase oder
eigener Plan, je nachdem, was die ersten beiden gelehrt haben. **Nicht alle fünf
in dieser Phase.**

## Abnahmekriterien

1. `sorting` und `number_line` stehen in `EVENT_TYPES`, in `EVENT_COMPONENTS`,
   in `EVENT_CONFIG_GUARDS`, in `SCORED_EVENT_TYPES` und in der Typ-Tabelle der
   Schema-Referenz — ein Typ steht dort erst, wenn seine Komponente existiert.
2. Beide sind ohne Maus bedienbar: jedes Ziel ist mit der Tastatur erreichbar
   und auslösbar, wie in `image_search` gelöst.
3. Beide zählen wie alle Aufgaben: falsch raten ist kein Sackgassen-Ende, für
   den Stern zählt der erste Versuch.
4. Beide unterstützen `pool` **und** `generated` aus Phase 1 — `number_line`
   erzeugt seine Zielzahl aus einem Bereich, `sorting` zieht seine Gegenstände
   aus einem Vorrat.
5. Beide funktionieren im Vorlesemodus: Aufgabenstellung wird gesprochen,
   Beschriftungen sind auch als Bild verfügbar.

## Checkliste

- [ ] `features/events/sorting/` — Komponente, Typen, Prüffunktion, Stile
- [ ] Ziehen-und-Ablegen als wiederverwendbares Stück lösen (nicht in der
      Sortier-Komponente vergraben) — `ordering` und `fill_gap` erben es
- [ ] `features/events/number-line/` — Komponente, Typen, Prüffunktion, Stile
- [ ] Registrierung in `event-type-map.ts` (vier Stellen, siehe AK 1)
- [ ] Typen in `models/content.types.ts`
- [ ] Schema-Referenz: Abschnitte 5.7 und 5.8 samt Beispiel, Typ-Tabelle
      ergänzen, beide aus der „vorgemerkt"-Liste streichen
- [ ] `docs/code-map.md`: zwei Zeilen unter Event-Komponenten
- [ ] `data/_authoring/README.md` und `LLM_WORLD_BUILDER_PROMPT.md`: die neuen
      Typen dürfen ab jetzt erzeugt werden
- [ ] Je eine Probe-Aufgabe in der Pokémon-Welt, damit die Typen am Bildschirm
      geprüft sind und nicht nur im Schema stehen

## Risiken

🟡 **Ziehen und Ablegen ist auf dem Gerät des Kindes die Bruchstelle.** Am
Bildschirm des Entwicklers funktioniert alles. Vor dem Abschluss auf dem echten
Tablet prüfen — mit dem Finger, nicht mit der Maus.

🟡 **Der Zahlenstrahl braucht eine Genauigkeitsentscheidung**: trifft das Kind
eine exakte Position oder ein Feld? Für Klasse 1 gehört die Antwort in die
Phase, nicht in die Umsetzung — Vorgabe: sichtbare Felder, kein freies
Millimeterziehen.

## Report-Back
