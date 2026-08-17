# Phase 4 — `text_input` + `image_search`

**Rating:** standard

Zwei weitere Aufgaben-Typen in der Hülle aus Phase 3. Beide melden dasselbe
Ergebnis wie das Quiz, beide werten den ersten Versuch.

🔴 **Für diese beiden Typen gibt es kein Mockup.** Der Prototyp kennt nur
Dialog und Multiple Choice. Sie werden freihändig gebaut — konsequent aus der
Aufgaben-Hülle `ui/task-card/`, den Zweck-Tokens und den Bedienregeln des
Designs (Touch-Ziele, Fokus, Bewegung). Die Struktur unten ist damit selbst der
Kontrakt, gegen den geprüft wird. *(Entscheidung eingeholt bei der
Plan-Freigabe — siehe Report-Back, falls stattdessen ein Entwurf kam.)*

## Kontext — vorher lesen

- [README.md](README.md), Abschnitt „Kontrakt"
- Phase 3 → `ui/task-card/`, `ContentService.getEvent()`,
  `resolveEventConfig()`, Muster der Multiple-Choice-Komponente
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 5.4 (`text_input`) und 5.5 (`image_search`)
- `frontend/src/app/ui/map-canvas/` — dort steht das Muster, wie
  Prozent-Koordinaten auf eine Bildfläche projiziert werden
  (`qst-map-point`, Container-Einheiten); die Bildsuche nutzt dasselbe Prinzip
- [docs/conventions/css.md](../../conventions/css.md)

## Akzeptanzkriterien

### `text_input`

1. Aufgaben-Hülle mit Frage (Textfassung und Vorlesen wie in Phase 3), darunter
   ein einzelnes, großes Eingabefeld mit sichtbarer Beschriftung und einem
   Knopf „Prüfen".
2. `input_type: 'number'` setzt `inputmode="numeric"`, sonst
   `inputmode="text"`; `autocomplete="off"`, keine Autokorrektur-Großschreibung.
3. Geprüft wird gegen `accepted_answers`; ohne `case_sensitive: true` wird
   Groß-/Kleinschreibung ignoriert und äußerer Leerraum abgeschnitten.
   Sonst nichts — keine Ähnlichkeitssuche, kein Tippfehler-Ausgleich.
4. **Weiterraten erlaubt:** Eine falsche Eingabe zeigt die Feedback-Leiste
   („Fast! Versuch es nochmal.") und lässt das Feld weiterbearbeiten. Die
   richtige Eingabe sperrt das Feld und gibt „Weiter" frei.
5. Gemeldet wird `finish({ kind: 'scored', correctFirstTry })` — `true` nur bei
   Treffer im ersten Anlauf.
6. 🟡 Der Typ bleibt für nicht-lesende Kinder ungeeignet; das Schema warnt
   Autoren bereits (Abschnitt 5.4). Hier wird nichts erfunden, um das zu
   kaschieren — kein Bildschirm-Alphabet, keine Sprach-Eingabe.

### `image_search`

7. Aufgaben-Hülle mit Frage, darunter das Suchbild als Fläche mit festem
   Seitenverhältnis (Bild über `assetUrl(themeId, 'backgrounds', image)`,
   fehlend → `qst-image-slot`).
8. Ziele liegen auf ihrer Prozent-Position; ein Tipp innerhalb von `radius`
   (Prozent der Bildbreite) zählt als Treffer. Getroffene Ziele markieren
   sichtbar (Ring + Häkchen) und tragen ihr `label` als Beschriftung.
9. `find_all: true` verlangt alle Ziele, sonst reicht das erste. Ein Zähler in
   der Hülle zeigt „gefunden 1 von 3".
10. Ein Fehlgriff zeigt kurz eine neutrale Rückmeldung an der getippten Stelle
    („Da ist nichts") und zählt als Fehlversuch — Weitersuchen bleibt möglich.
11. Gemeldet wird `finish({ kind: 'scored', correctFirstTry })` — `true` nur,
    wenn **kein** Fehlgriff passiert ist.
12. Ohne Maus bedienbar: die Ziele sind zusätzlich als Liste unsichtbarer
    Knöpfe erreichbar (Tab), Enter zählt als Tipp auf das Ziel. Sonst ist die
    Aufgabe für Tastatur-Nutzer unlösbar.
13. Die Trefferflächen erfüllen auf 360 px Fensterbreite noch
    `--size-touch-target` — ist `radius` kleiner, gilt die Untergrenze für die
    antippbare Fläche, nicht für die Treffer-Prüfung.

## Checkliste

- [x] `models/content.types.ts`: `TextInputConfig` (`question`,
      `question_simple?`, `input_type: 'text' | 'number'`,
      `accepted_answers: string[]`, `case_sensitive?: boolean`),
      `SearchTarget` (`label`, `x`, `y`, `radius`) und `ImageSearchConfig`
      (`image`, `question`, `question_simple?`, `targets`, `find_all`).
- [x] `ng generate component features/events/text-input --skip-tests`, Zeile
      `text_input` in `EVENT_COMPONENTS`.
- [x] Antwortvergleich als reine Funktion neben der Komponente
      (`matchesAcceptedAnswer(input, variant)`), damit die Regel an einer Stelle
      steht.
- [x] `ng generate component features/events/image-search --skip-tests`, Zeile
      `image_search` in `EVENT_COMPONENTS`.
- [x] Trefferprüfung als reine Funktion (`hitTarget(targets, x, y)`), Abstand
      in Prozent der **Bildbreite** gerechnet — dasselbe Bezugsmaß wie
      `radius`, sonst trifft nichts auf hohen Bildern.
- [x] Beide Komponenten: Außenfläche exakt nach Kontrakt (`config`, `context`,
      `inject(EpisodeRun)`), kein eigener Ladeweg, kein Router.
- [x] Beide nutzen `ui/task-card/` — Frage, Vorlesen und Fortschrittspunkte
      werden **nicht** nachgebaut.
- [x] Bewegung (Markierungs-Animation, Fehlgriff-Rückmeldung) mit
      `prefers-reduced-motion`-Zweig.
- [x] `docs/code-map.md`: beide Ordner aufnehmen.

## Report-Back

**Kein Entwurf eingegangen** — beide Typen freihändig gebaut, wie bei der
Plan-Freigabe vereinbart.

**Naming-Abweichung:** Die Checkliste nannte die aufgelösten Konfigurationstypen
`TextInputVariant`/`ImageSearchVariant`. Gebaut wurden `TextInputConfig`/
`ImageSearchConfig` — konsistent zum bereits bestehenden `MultipleChoiceConfig`/
`DialogConfig` (Phase 2/3 nennen die aufgelöste, spielbereite Form durchweg
„Config", nicht „Variant"). Inhaltlich identisch, nur der Name geändert.

**`image_search` — wie „Trefferfläche" und „Treffer-Prüfung" auseinandergehalten
werden** (AK 13): Ein Tipp wird **immer** über die echten Zeigerkoordinaten
gegen `radius` geprüft (`hitTarget()`), unabhängig davon, welches DOM-Element
darunterliegt. Über jedem noch nicht gefundenen Ziel liegt zusätzlich eine
unsichtbare, über `qst-map-point` positionierte Fläche
(`.image-search__hit-floor`), deren CSS-Mindestgröße `--size-touch-target`
nie unterschreitet — sie beeinflusst nur, wie leicht ein Ziel physisch zu
treffen ist, nicht die Auswertung selbst.

**Tastaturweg getrennt vom Zeigerweg:** Eine zusätzliche, visuell verborgene
Knopfliste (`.visually-hidden`, wie schon im Quiz für Zustandstexte genutzt)
bietet jedes Ziel als eigenen, per Tab erreichbaren Knopf an — Enter zählt
als exakter Tipp auf genau dieses Ziel, ohne Koordinatenrechnung.

**Ein neuer Baustein wiederverwendet:** `qst-map-point` (bisher nur auf den
Kartenscreens) positioniert jetzt auch die Ziel-Markierungen und die
Fehlgriff-Rückmeldung der Bildsuche — dieselbe Prozent-auf-Container-Projektion
wie auf der Ortskarte, wie in der Phase vorgeschlagen.

`cd frontend && npm run build` und `npm run lint` laufen grün,
`cd backend && composer lint` unverändert grün (kein Backend-Code berührt).
