# Wort-Bild-Paare — eine Aufgabenform, bei der wirklich gelesen wird

Die Engine kann Wissen abfragen, aber nicht Lesen üben. Multiple Choice zeigt
vier Antworten und will eine — das ist **ein** Lesevorgang pro Aufgabe, und
sobald ein Motivbild neben dem Wort steht, ist es keiner mehr. Diese Aufgabe
zeigt drei bis vier Bilder und ebenso viele Wortkarten und lässt das Kind
zusammenlegen, was zusammengehört: vier Lesevorgänge in einer Aufgabe, und
kein Vorleser kann etwas verraten, weil die Wörter nie gesprochen werden.

**Profil:** private (lean) · **Format:** Einzeldatei, 2 Phasen
**Auslöser:** Phase 1 der Pokémon-Welt — sechs von acht Aufgaben waren
Hörübungen, in einer Welt, die „Lesen lernen" heißt
([FINDINGS](2026-08-18_erste-echte-welt/FINDINGS.md)).

## Phasen

| # | Phase | Inhalt | Rating | Status |
|---|---|---|---|---|
| 1 | Der Eventtyp | Schema, Typen, Komponente, Registrierung, ADR, Testwelt | heikel | pending |
| 2 | Die Welt umbauen | Episode 2 der Pokémon-Welt auf die neue Form, Doku nachziehen | standard | pending |

## Entschieden, bevor gebaut wird

Diese Punkte sind **keine Vorschläge** — sie sind der Kontrakt der Phase 1.

1. **Der Typ heißt `word_match`.** Ordner `frontend/src/app/features/events/word-match/`,
   Klasse `WordMatch`, Dateien `word-match.ts/.html/.scss/.types.ts` — dasselbe
   Muster wie `features/events/multiple-choice/`.
2. **Getippt wird, nicht gezogen.** Erst ein Bild antippen, dann eine Wortkarte
   (oder umgekehrt) — das angetippte Element bleibt sichtbar markiert, bis das
   zweite kommt. **Kein Drag & Drop:** Ziehen ist für Sechsjährige auf einem
   Tablet motorisch anspruchsvoll und kollidiert mit dem Scrollen der Seite.
3. **Ein Fehlgriff ist kein Ende.** Falsches Paar → beide Elemente gehen wieder
   auf, die Aufgabe läuft weiter. Gleiche Haltung wie bei Multiple Choice.
4. **Der Stern hängt an der ganzen Aufgabe:** `correctFirstTry` ist nur dann
   `true`, wenn **jedes** Paar beim ersten Versuch saß. Ein einziger Fehlgriff
   kostet den Stern für diese Aufgabe — nicht anteilig, nicht pro Paar. *(Das
   ist eine Design-Entscheidung, keine Kalibrierung: „drei von vier Paaren
   zählen auch" wäre eine andere Aufgabe.)*
5. **Die Wörter werden nie vorgelesen.** Die Frage schon (macht `ui/task-card/`
   von allein), die Wortkarten nicht. Das ist der ganze Sinn der Aufgabe.
6. **Die Wortkarten erscheinen gemischt**, sonst steht Wort 1 neben Bild 1 und
   die Aufgabe löst sich von selbst. Die Mischung wird **einmal beim Öffnen der
   Aufgabe festgelegt und danach eingefroren** — nicht in einem `computed`,
   sonst springen die Karten bei jedem Neuzeichnen.
7. **Drei oder vier Paare**, nicht mehr. Alles darüber sprengt die Fläche auf
   dem Tablet.
8. **Die Bilder liegen in `answers/`** und folgen der bestehenden Vorgabe
   (PNG, quadratisch, 512 × 512) — kein neuer Ordner, keine neue Bildregel.
9. **Das Aussehen wird freihändig gebaut, und das ist entschieden.** Für eine
   Zuordnungs-Aufgabe gibt es kein Mockup — der Design-Prototyp kennt nur
   `minigame` = Multiple Choice ([docs/design/README.md](../design/README.md),
   Screen-Tabelle). Gebaut wird **innerhalb der bestehenden Aufgaben-Hülle**
   `ui/task-card/`: links die Bilder, rechts die Wortkarten, ausschließlich mit
   den verbindlichen Zweck-Tokens. Kein neuer Screen, kein eigener Rahmen, kein
   neues Farbkonzept. *(Sascha, 18.08.2026 — nicht neu aufrollen.)*

## Der Kontrakt — so sieht die Content-Datei aus

Neuer Abschnitt 5.6 in `data/_authoring/JSON_SCHEMA_REFERENCE.md`, Typ-Zeile in
der Tabelle 5.0. Ausgelagert wie jede Aufgabe, eine Variante je Lernstufe:

```json
{
  "event_id": "wortpaare_1",
  "type": "word_match",
  "variants": {
    "jungtrainer": {
      "question": "Welches Wort gehört zu welchem Bild?",
      "question_simple": "Lege zusammen, was zusammengehört.",
      "pairs": [
        { "word": "Ball", "image": "antwort_ball.png" },
        { "word": "Maus", "image": "antwort_maus.png" },
        { "word": "Igel", "image": "antwort_igel.png" }
      ]
    }
  }
}
```

`pairs` hat drei oder vier Einträge, `word` ist das geschriebene Wort, `image`
ein echter Dateiname unter `answers/`. Mehr Felder gibt es nicht.

## Phase 1 — Der Eventtyp

**Rating: heikel** (neues Bedienkonzept, neue Bewertungsregel, Kontrakt entsteht hier)

### Kontext (vorher lesen)

- `frontend/src/app/features/episode/event-type-map.ts` — die **einzige** Stelle,
  an der ein Typ seiner Komponente zugeordnet wird; hier hängen auch
  `SCORED_EVENT_TYPES` und die Konfigurations-Prüfungen
- `frontend/src/app/features/events/multiple-choice/` — das Muster, dem die neue
  Komponente folgt (alle vier Dateien)
- `frontend/src/app/ui/task-card/task-card.ts` — die Hülle mit Frage,
  Vorlese-Knopf und Fortschrittspunkten; die Aufgabe füllt nur ihren Körper
- `frontend/src/app/models/event-runtime.types.ts` — `EventOutcome`, das
  einzige, was eine Aufgabe zurückmeldet
- `frontend/src/app/models/content.types.ts` — `EVENT_TYPES` und die
  Konfigurations-Typen der bestehenden Aufgaben
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0–5.5
- der Angular-Konventions-Skill; CSS strikt über die bestehenden Zweck-Tokens,
  BEM, keine rohen Farbwerte

### Abnahmekriterien

1. `word_match` steht in `EVENT_TYPES`, in `EVENT_COMPONENTS`, in
   `SCORED_EVENT_TYPES` und in `EVENT_CONFIG_GUARDS` — und in der Typ-Tabelle
   des Schemas (Abschnitt 5.0) mit neuem Abschnitt 5.6.
2. Die Aufgabe zeigt Bilder und Wortkarten getrennt an, Zuordnung per zwei
   Tipps. Ein richtiges Paar bleibt sichtbar verbunden, ein falsches geht auf.
3. Ein Paar-Zustand hängt **nie allein an der Farbe** — jedes verbundene Paar
   trägt zusätzlich ein Zeichen oder eine gemeinsame Nummer (gleiche Regel wie
   die Häkchen bei Multiple Choice).
4. Sind alle Paare gelegt, erscheint die Feedback-Leiste mit „Weiter", und die
   Aufgabe meldet ein bewertetes Ergebnis nach der Regel oben.
5. Die Wortkarten stehen gemischt und **springen nicht**, wenn die Ansicht neu
   zeichnet (Punkt 6 der Entscheidungen).
6. Der Vorlesemodus spricht die Frage, aber **kein** Wort von den Karten.
7. Eine kaputte Konfiguration (weniger als 3 Paare, fehlendes Bild, doppeltes
   Wort) läuft in den Fehlerpfad des Gerüsts, nicht in eine leere Aufgabe —
   `isWordMatchConfig` prüft das.
8. Ein Erstnutzer versteht die Aufgabe ohne Erklärung: Die Frage sagt, was zu
   tun ist, das erste Antippen zeigt sichtbar, dass etwas ausgewählt ist. Kein
   Hilfetext, kein Tutorial-Overlay.
9. Auf schmalem Bildschirm (Tablet hochkant) stehen Bilder und Wortkarten
   untereinander statt nebeneinander — über eine Container Query, **additiv
   ergänzt**, ohne die Regel für breite Schirme zu ersetzen.
10. `dev_fixture` spielt den neuen Typ durch: `events/probe_word_match.json`
    mit Varianten für `einfach` und `schwer`, eingebaut in eine bestehende
    Episode der Testwelt.

### Checkliste

- [ ] `docs/decisions/014-zuordnen-als-eigener-eventtyp.md` schreiben: warum ein
      neuer Typ statt eines Bildfelds in Multiple Choice (Kontext, betrachtete
      Optionen, Entscheidung, Konsequenzen). **Nummer 014 ist frei** — 011 bis
      013 sind vom Sammelkarten-Plan reserviert.
- [ ] `JSON_SCHEMA_REFERENCE.md`: Zeile in Tabelle 5.0, neuer Abschnitt 5.6 mit
      dem Kontrakt oben, Zeile in der Checkliste Abschnitt 9 („`word_match` hat
      3–4 Paare, jedes mit echtem Bildnamen").
- [ ] `content.types.ts`: `word_match` in `EVENT_TYPES`, Typ `WordMatchConfig`
      mit `question`, optionalem `question_simple` und `pairs`.
- [ ] `features/events/word-match/word-match.types.ts`: Ansichts-Typen plus
      `isWordMatchConfig` — Muster: `multiple-choice.types.ts`.
- [ ] Komponente `word-match.ts` + Template + Styles, eingehängt in
      `qst-task-card` mit dem Tag „Aufgabe · Wörter zuordnen".
- [ ] `event-type-map.ts`: die drei Einträge (Komponente, bewertet, Guard) — die
      Datei nennt selbst die Regel „eine Zeile hier, ein Ordner dort".
- [ ] Testwelt: `data/themes/dev_fixture/events/probe_word_match.json` anlegen
      und in eine Episode der Testwelt einhängen.
- [ ] `docs/code-map.md`: Zeile für das neue Feature.
- [ ] `docs/glossary.md`: Eintrag „Wort-Bild-Paare" mit einer Zeile, was die
      Aufgabe misst.

## Phase 2 — Die Welt umbauen

**Rating: standard** (Content und Doku, keine offenen Entscheidungen)

### Kontext (vorher lesen)

- `docs/planning/2026-08-18_erste-echte-welt/README.md` — Eckdaten und die Regel
  „Lesewort nie in die Frage"
- `data/themes/pokemon_lesen/episodes/ep_route_1_wiese.json` und
  `events/wortkarte_1.json` / `wortkarte_2.json` — was ersetzt wird
- der Kontrakt oben (Abschnitt 5.6)

### Abnahmekriterien

1. `events/wortpaare_1.json` und `events/wortpaare_2.json` existieren, jeweils
   mit Varianten für alle drei Lernstufen; `wortkarte_1.json` und
   `wortkarte_2.json` sind gelöscht und in `ep_route_1_wiese.json` ersetzt.
2. Die Steigerung bleibt: `jungtrainer` drei Paare mit sehr verschiedenen
   Wörtern, `trainer` vier Paare mit gleichem Anlaut, `arenaleiter` vier Paare,
   die sich nur in einem Buchstaben unterscheiden (Maus/Haus/Laus/Mais).
3. Kein Wort taucht mehr in einer Frage auf — die ursprüngliche Regel der Welt
   gilt in Episode 2 wieder wörtlich.
4. `bestellliste.md` ist nachgezogen: `antwort_wortkarte.png` fällt weg, die
   Wörter der neuen Paare brauchen echte Motivbilder. Die neue Gesamtzahl steht
   in der Datei und in der Phasen-Tabelle des Welt-Plans.
5. Die Prüfung der Schema-Checkliste läuft erneut über die ganze Welt und
   meldet 0 Verstöße — inklusive der neuen Aufgabenform.

### Checkliste

- [ ] Die beiden neuen Aufgabendateien schreiben, die alten löschen, Episode 2
      nachziehen.
- [ ] `ASSET_REQUIREMENTS.md`: Abschnitt 8 um den Satz ergänzen, dass die
      Bilder einer Zuordnungs-Aufgabe **kein** Wort im Bild tragen dürfen.
- [ ] `bestellliste.md` und die Phasen-Tabelle des Welt-Plans nachziehen.
- [ ] Die betroffenen Einträge in `FINDINGS.md` des Welt-Plans abhaken.
- [ ] Prüfskript über die Welt laufen lassen, Ergebnis ins Report-Back.

## Finale Abnahmekriterien

1. Die Testwelt spielt sechs Eventtypen durch, ohne Fehler in der Konsole.
2. Episode 2 der Pokémon-Welt lässt sich in allen drei Lernstufen spielen und
   verlangt in jeder echtes Lesen.
3. Kein Wort einer Zuordnungs-Aufgabe wird jemals vorgelesen.
4. Schema, Glossar, Code-Map und ADR beschreiben denselben Stand wie der Code.

## Smoke-Checkliste (Sascha, am Ende)

Die drei ersten Punkte sind die Stellen, an denen ich unsicher bin — dort
zuerst hinsehen.

1. 🔴 **Springen die Wortkarten?** Aufgabe öffnen, ein Bild antippen, ein
   falsches Wort antippen, dann warten. Ordnen sich die Karten dabei neu an,
   ist die Mischung im falschen Mechanismus gelandet.
2. 🔴 **Tablet hochkant**: Passen Bilder und Wortkarten ohne Querscrollen aufs
   Gerät, auf dem das Kind wirklich spielt? Sind die Tippflächen groß genug
   für Kinderfinger?
3. 🔴 **Versteht es ein Kind ohne Ansage?** Aufgabe zeigen, nichts erklären.
   Wer zweimal fragen muss, wie es geht, hat eine Aufgabe vor sich, die noch
   nicht fertig ist.
4. Vorlesemodus an: Wird die Frage gesprochen und **kein** Wort von den Karten?
5. Alle drei Lernstufen von Episode 2 anspielen — unterschiedlich schwer,
   gleiche Geschichte.
6. Einmal absichtlich alles richtig legen, einmal absichtlich einen Fehler
   machen: Unterscheiden sich die Sterne am Ende der Episode?

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
