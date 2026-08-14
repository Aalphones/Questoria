# Phase 3 — Ausgelagerte Events + `multiple_choice`

**Rating:** heikel

Aufgaben liegen nicht in der Episode, sondern in eigenen Dateien mit einer
Variante pro Lernstufe. Diese Phase baut den Weg dorthin — Backend-Aufruf,
Auflösung im Gerüst, gemeinsame Aufgaben-Hülle — und den ersten Aufgaben-Typ.

## Kontext — vorher lesen

- [README.md](README.md), Abschnitt „Kontrakt" (Content-Aufruf,
  Komponenten-Außenfläche) und „Entschieden vor dem Bauen" Punkt 1+2
  (Weiterraten, Sternenformel)
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 4 („Inline oder ausgelagert"), 5.3 (`multiple_choice`),
  „Varianten-Regel", Abschnitt 6 (Vorlesemodus)
- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „7. Minispiel
  (`minigame`, Multiple Choice)" — Maße, Zustände, Copy. Das Wort „Minispiel"
  dort ist alter Stand ([glossary.md](../../glossary.md)), das Aussehen gilt.
- Backend: `backend/src/Controllers/ContentController.php`,
  `backend/src/Services/ContentService.php`,
  `backend/public/index.php` (Routen-Registrierung, Zeilen um 71–79)
- Frontend: `services/content.service.ts` (Muster `getEpisode()` +
  `worldConfigCache`), Phase 2 → `features/episode/`, `EpisodeRun`,
  `EventContext`
- [docs/conventions/php.md](../../conventions/php.md),
  [docs/conventions/angular.md](../../conventions/angular.md)
- [ADR-005](../../decisions/005-content-auslieferung-ab-meilenstein-2.md) als
  Muster für die ADR, die hier entsteht

## Akzeptanzkriterien

### Content-Schnittstelle

1. `GET /api/content/themes/{themeId}/events/{eventId}` liefert den Inhalt von
   `data/themes/{themeId}/events/{eventId}.json` **unverändert**. Unbekannte
   Datei oder eine ID, die nicht auf `^[a-z0-9_]{1,64}$` passt: `404` mit
   `{"error":"Not Found"}`.
2. Der lokale Entwicklungsserver (`backend\serve.cmd`) beantwortet den Aufruf
   für `dev_fixture`/`probe_quiz` mit dem JSON aus `data/`.
3. `ContentService.getEvent(themeId, eventId)` im Frontend ist die einzige
   Ladestelle dafür und speichert pro `themeId/eventId` zwischen — dieselbe
   Aufgabe in zwei Episoden lädt einmal.
4. **ADR-007** hält fest, warum ausgelagerte Event-Konfigurationen über die
   Schnittstelle laufen und warum das Critical Rule 8 nicht verletzt: der
   Aufruf entsteht einmal für alle Eventtypen und liefert Daten aus, statt
   Gameplay zu interpretieren. Verworfene Option: die Dateien wie Bilder
   statisch unter `/content/…` ausliefern — spart Backend-Code, verliert aber
   die ID-Prüfung und den einheitlichen `404`-Weg von ADR-005.

### Auflösung im Gerüst

5. Trägt ein Event `config.ref`, lädt **das Gerüst** die Datei, wählt die
   Variante der aktiven Lernstufe und reicht der Komponente eine fertige
   Konfiguration. Die Komponente sieht weder `ref` noch die übrigen Varianten.
6. Auftritts-Felder aus der Episode (alles neben `ref`, z. B. `background`,
   `music`) ergänzen die Variante; bei gleichem Feldnamen gewinnt die Variante
   (Schema-Regel: „ergänzen, nicht überschreiben").
7. Fehlt die Variante der aktiven Lernstufe, spielt die erste vorhandene
   Variante und es gibt eine Warnung in der Entwicklerkonsole. **Begründung:**
   ein Kind darf nicht vor einer kaputten Content-Datei stehenbleiben; die
   Warnung macht den Fehler für den Autor sichtbar. Fehlt die **Datei**, greift
   der Fehlerpfad aus Phase 2 (AK 7).
8. Während eine Event-Datei lädt, zeigt die Bühne denselben Zwischenzustand wie
   beim Episodenladen — kein Aufblitzen einer leeren Karte.

### `multiple_choice`

9. Zentrierte Aufgaben-Karte nach Design: Kopf mit Aufgaben-Tag und
   Fortschrittspunkten, Frage mit Vorlese-Knopf, Antworten als 2×2-Raster.
10. **Vorlesemodus:** Bild über jeder Antwort (`option.image`, aufgelöst über
    `assetUrl(themeId, 'answers', …)`, fehlend → `qst-image-slot`-Platzhalter),
    Schlüssel sind die Ziffern 1–4, Frage wird beim Öffnen automatisch
    vorgelesen. **Lesemodus:** kein Bild, Schlüssel A–D, Vorlesen nur auf
    Knopfdruck. Angezeigt wird `textFor(question, question_simple)`.
11. **Weiterraten ist erlaubt** (Entscheidung 1 im README): Eine falsche
    Antwort wird dauerhaft als falsch markiert und ausgegraut, die übrigen
    bleiben antippbar. Die richtige Antwort markiert grün mit Häkchen und gibt
    den Weiter-Knopf frei.
12. Die Feedback-Leiste erscheint nach dem ersten Tippen („Richtig!" bzw.
    „Fast!" mit einem aufmunternden Satz) und wird bei jedem weiteren Versuch
    aktualisiert.
13. Gemeldet wird `finish({ kind: 'scored', correctFirstTry })` — `true` nur,
    wenn der **erste** Tipp saß. Weitere Versuche ändern diesen Wert nicht.
14. Bedienbar mit Tastatur (Tab durch die vier Antworten, Enter löst aus),
    Antworten erfüllen `--size-touch-target`, Fokusrahmen sichtbar.

## Checkliste

### Backend

- [ ] `ContentService::event(string $themeId, string $eventId): array` —
      analog zu `episode()`, liest `themePath($themeId) . '/events/' . $eventId . '.json'`,
      beide IDs über `assertValidId()`.
- [ ] `ContentController::event(string $themeId, string $eventId): array`
      analog zu `episode()`.
- [ ] `backend/public/index.php`: Route
      `GET /api/content/themes/{themeId}/events/{eventId}` neben der
      Episoden-Route registrieren.
- [ ] `cd backend && composer lint` grün.

### Frontend-Ladeweg

- [ ] `models/content.types.ts`: `AnswerOption`, `MultipleChoiceVariant`,
      `EventFile<TVariant>` (`event_id`, `type`, `variants: Record<string, TVariant>`)
      ergänzen.
- [ ] `services/content.service.ts`: `getEvent(themeId, eventId)` mit Cache
      nach dem Muster von `getWorldConfig()` (Schlüssel `themeId/eventId`).
- [ ] `features/episode/`: Auflösung als eigene, testbare Funktion (z. B.
      `resolveEventConfig(episodeConfig, eventFile, difficultyLevelId)`) in
      einer eigenen Datei neben dem Screen — reine Funktion, kein Signal, kein
      HTTP. Der Screen ruft sie, nachdem die Datei geladen ist.
- [ ] Ladezustand der Event-Datei in den bestehenden `LoadState`-Fluss des
      Screens einhängen, nicht als zweiter, paralleler Zustand daneben.

### Gemeinsame Aufgaben-Hülle

- [ ] `ng generate component ui/task-card --skip-tests` — die Hülle, die alle
      drei Aufgaben-Typen teilen: Eingaben `tag` (z. B. „Aufgabe · Quiz"),
      `question`, `questionAudioUrl?`, `stepDone`/`stepTotal` für die
      Fortschrittspunkte; Inhalts-Projektion für den Aufgabenkörper und einen
      benannten Platz für die Feedback-Leiste. Vorlese-Knopf und automatisches
      Vorlesen der Frage leben **hier**, nicht in den drei Typen.
- [ ] Fortschrittspunkte zeigen die Position innerhalb der Eventliste (nur
      bewertete Events zählen) — Werte kommen als Eingabe vom Aufgaben-Typ, der
      sie aus `EpisodeRun` liest.

### `multiple_choice`

- [ ] `ng generate component features/events/multiple-choice --skip-tests`,
      Zeile `multiple_choice` in `EVENT_COMPONENTS` ergänzen.
- [ ] Zustand: `pickedIndexes` als Signal (Menge der bereits getippten
      Antworten), `firstPick` gemerkt für `correctFirstTry`, `solved` als
      `computed()`.
- [ ] Antwort-Schlüssel: `listen` → `1–4`, `read` → `A–D`. Eine kleine reine
      Funktion, keine Ternär-Kette im Template.
- [ ] Auswertungsfarben und Häkchen/Kreuz nach Design; Zustand nie nur über
      Farbe transportieren (Symbol + `aria-live`-Meldung in der
      Feedback-Leiste).
- [ ] Weiter-Knopf erst aktiv, wenn die richtige Antwort gefunden ist; er ruft
      `finish({ kind: 'scored', correctFirstTry })`.

### Doku

- [ ] `docs/decisions/007-ausgelagerte-events-ueber-die-schnittstelle.md`
      schreiben (Kontext / Optionen / Entscheidung / Konsequenzen, ~10 Zeilen).
- [ ] `AGENTS.md`: Content-Repository-Abschnitt um den neuen Aufruf ergänzen,
      Doc-Index um ADR-007.
- [ ] `docs/code-map.md`: `features/events/multiple-choice/`, `ui/task-card/`,
      `getEvent()` und die Backend-Route aufnehmen.
- [ ] `docs/glossary.md`: Eintrag **Event-Konfiguration** um den Satz ergänzen,
      dass die Engine `ref` und Lernstufen-Variante auflöst, bevor eine
      Komponente sie sieht.

## Report-Back

*(beim Umsetzen füllen)*
