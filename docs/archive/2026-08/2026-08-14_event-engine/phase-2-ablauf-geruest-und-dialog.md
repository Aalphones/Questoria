# Phase 2 — Ablauf-Gerüst, Event Loader, `dialog`

**Rating:** heikel · **Status:** complete

Die Phase, die den Kontrakt setzt: Ein Screen spielt die Eventliste einer
Episode der Reihe nach ab, wählt pro Event die Komponente über
`ngComponentOutlet` und sammelt das Ergebnis ein. Der erste Eventtyp `dialog`
beweist, dass der Kontrakt trägt. Der Ort-Platzhalter aus Meilenstein 2 wird
dabei ersetzt.

## Kontext — vorher lesen

- [README.md](README.md), Abschnitt „Kontrakt" — Ergebnis-Typ,
  Komponenten-Außenfläche, Event Loader. **Verbindlich, nicht neu erfinden.**
- [ADR-004](../../decisions/004-event-engine.md) und `AGENTS.md` Critical
  Rules 8 + 9
- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „6. Dialog
  (`dialog`)" — Maße, Zustände, Copy. Verbindlich als Zielbild.
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 4 (Episode) und 5.1 (`dialog`)
- `frontend/src/app/features/location/location.ts` — das Muster für
  Route-Inputs, `LoadState` und den reaktiven Episoden-Aufruf. Diese Datei wird
  in dieser Phase gelöscht, ihr Ladecode wandert mit.
- `frontend/src/app/app.routes.ts`, `frontend/src/app/features/map/map.ts`
  (verlinkt heute auf `location/:episodeId`)
- `frontend/src/app/models/content.types.ts` (`Episode`, `EpisodeEvent`,
  `EVENT_TYPES`, `DialogueLine`), `models/game-state.types.ts` (`LoadState`)
- Phase 1 → `NarrationService`, `qst-read-aloud-button`
- [docs/conventions/angular.md](../../conventions/angular.md)

## Akzeptanzkriterien

### Ablauf-Gerüst

1. Route `theme/:themeId/episode/:episodeId` lädt `features/episode/` mit den
   Eingaben `themeId`, `episodeId`, `world` (wie bisher über
   `withComponentInputBinding()` + `worldConfigResolver` + `difficultyChosenGuard`).
   Die alte Route `location/:episodeId` und der Ordner `features/location/`
   existieren nicht mehr; die Ortskarte verlinkt auf die neue Adresse.
2. Der Screen lädt die Episode über `ContentService.getEpisode()` und zeigt
   während des Ladens denselben Zwischenzustand wie die Kartenscreens, bei
   Fehler `qst-content-error`.
3. Der Hintergrund der Episode (`background`) steht als Bühnenbild hinter dem
   laufenden Event, aufgelöst über `assetUrl(themeId, 'backgrounds', …)`, mit
   `qst-image-slot` als Platzhalter.
4. **Das Gerüst verzweigt nicht nach Eventtyp.** Die Komponente kommt aus
   `EVENT_COMPONENTS[event.type]`, geladen über `ngComponentOutlet` mit
   `[ngComponentOutletInputs]="{ config, context }"`. Kein `@switch`, kein
   `@if` über Typen (Critical Rule 9).
5. Meldet ein Event über `EpisodeRun.finish()` Vollzug, rückt das Gerüst auf
   das nächste Event vor. Nach dem letzten Event ist die Episode fertig.
6. **Kopfleiste:** Zurück führt auf die Ortskarte, aus der die Episode gestartet
   wurde (`active_map_id` der Episode).
7. Ein unbekannter Eventtyp (nicht in `EVENT_TYPES`) oder ein Eventtyp ohne
   Eintrag in `EVENT_COMPONENTS` zeigt `qst-content-error` mit dem Weg zurück
   auf die Karte — keine leere Bühne, kein stummer Abbruch.
8. **Zwischenstand bis Phase 5, ausdrücklich temporär:** Nach dem letzten Event
   schreibt der Screen wie bisher `completeEpisode(themeId, episodeId, 3)` und
   navigiert auf die Ortskarte. Ergebnis-Screen und echte Sterne kommen in
   Phase 5; die Stelle trägt einen Kommentar, der genau das sagt.

### `dialog`

9. Visual-Novel-Bühne nach Design: zwei Sprite-Plätze links/rechts
   (`min(28vw, 286px) × min(46vh, 392px)`, oben abgerundet), Sprites über
   `assetUrl(themeId, 'sprites', line.sprite)` in einem `qst-image-slot`.
10. Der sprechende Platz ist voll gesättigt und wippt (`eqBob` aus
    `_motion.scss`), der andere ist entsättigt und ruhig. Eine Zeile, die
    denselben Platz mit anderem Sprite belegt, tauscht die Figur dort aus.
11. Textbox als Karte mit überlappendem Namensschild in der Farbe der
    Sprecherseite; die ganze Box ist die „Weiter"-Fläche. Dialogtext
    `max-width: 52ch`, `text-wrap: pretty`.
12. Fußzeile: `qst-read-aloud-button` („Nochmal vorlesen"), Zähler
    `<aktuell> / <gesamt>`, primärer Knopf „Weiter". Nach der letzten Zeile
    meldet „Weiter" `finish({ kind: 'story' })`.
13. **Textfassung und Ton kommen aus dem Vorlesedienst:** angezeigt wird
    `textFor(line.text, line.text_simple)`; im Modus „Bilder & Vorlesen" wird
    jede neue Zeile automatisch gesprochen (`audio_path` schlägt die
    Computerstimme), im Modus „Selbst lesen" nur auf Knopfdruck. Bei einem
    Zeilenwechsel bricht die vorherige Ausgabe ab.
14. Bedienbar mit Tastatur: die Textbox ist ein echter Knopf, Enter/Leertaste
    blättert weiter, Fokusrahmen sichtbar.

## Checkliste

### Typen und Kontrakt

- [x] `models/event-runtime.types.ts` anlegen mit `EventOutcome` und
      `EventContext` — Wortlaut aus [README.md](README.md) → Kontrakt.
- [x] `models/content.types.ts`: `DialogConfig { lines: DialogueLine[] }`
      ergänzen (die Konfiguration, die die Dialog-Komponente als `config`
      bekommt).

### Ablauf-Gerüst

- [x] `ng generate component features/episode --skip-tests`.
- [x] `features/episode/episode-run.ts`: Dienst mit `@Service()`,
      **provided in `Episode`** (`providers: [EpisodeRun]`), nicht global.
      Zustand als Signale: `eventIndex`, `scoredCount`, `correctFirstTryCount`.
      Methode `finish(outcome: EventOutcome): void` zählt bei
      `kind: 'scored'` mit und rückt den Index vor. Zusätzlich `restart()` und
      `startAt(index, scoredCount, correctFirstTryCount)` (Phase 6 setzt darauf
      auf, Phase 2 nutzt nur `restart()`).
- [x] `features/episode/event-type-map.ts`: `EVENT_COMPONENTS` als
      `Readonly<Record<EventType, () => Promise<Type<unknown>>>>`, in dieser
      Phase nur der Eintrag `dialog`. Fehlt ein Typ zur Laufzeit → Fehlerpfad
      aus AK 7.
- [x] `episode.ts`: Route-Inputs, Episoden-Ladung (Muster aus `location.ts`
      übernehmen — reaktiv über `toObservable()` + `switchMap`, weil die
      Pflicht-Inputs im Feld-Initialisierer noch leer sind), `currentEvent` als
      `computed()` über `events[eventIndex]`, Komponente über
      `ngComponentOutlet`.
- [x] `context` als `computed<EventContext>()` aus `themeId` und
      `GameStateService.activeDifficultyLevel()` — ist keine Stufe gesetzt,
      greift bereits der `difficultyChosenGuard`, der Screen rechnet nicht
      selbst nach.
- [x] 🟡 **Injektor prüfen:** Die Dialog-Komponente ruft `inject(EpisodeRun)`.
      Sieht sie den Dienst nicht (Laufzeitfehler „No provider"), den Injektor
      explizit übergeben: `[ngComponentOutletInjector]="episodeInjector"` mit
      einem in `Episode` erzeugten Injektor, der `EpisodeRun` bereitstellt. Den
      gewählten Weg im Report-Back festhalten — der Kontrakt bleibt in beiden
      Fällen gleich.

### Routing und Aufräumen

- [x] `app.routes.ts`: Pfad `theme/:themeId/location/:episodeId` →
      `theme/:themeId/episode/:episodeId`, lädt `features/episode/episode`.
      Resolver und Guard unverändert übernehmen.
- [x] `features/map/map.ts` (und `map.html`, falls der Link dort steht): Ziel
      auf `['/theme', themeId, 'episode', episodeId]` umstellen.
- [x] **Chesterton-Check vor dem Löschen:** `features/location/` zeigte
      Ortsname, Hintergrund, Anzahl bereitliegender Events und einen
      „Ort geschafft"-Knopf mit pauschal 3 Sternen — sein Zweck war der
      Nachweis, dass die Episoden-Schnittstelle trägt. Der neue Screen
      übernimmt Ladeweg, Rückweg-Berechnung und den Fortschritts-Schreibpunkt;
      der Ortsname wandert in die Kopfzeile des Episoden-Screens. Danach
      Ordner `features/location/` löschen.

### `dialog`

- [x] `ng generate component features/events/dialog --skip-tests`.
- [x] Außenfläche exakt nach Kontrakt: `config = input.required<DialogConfig>()`,
      `context = input.required<EventContext>()`, `inject(EpisodeRun)`.
      **Kein** eigener Content-Aufruf, **keine** Router-Nutzung, **kein**
      Schreiben von Fortschritt.
- [x] Zeilenindex als Signal, `currentLine` als `computed()`. Ein `effect()`
      auf `currentLine` spricht im Modus `listen` automatisch
      (`speak(textFor(...), audioUrl)`), sonst nicht.
- [x] Sprite-Plätze, Sättigung/Wippen, Textbox, Namensschild, Fußzeile nach
      Design (AK 9–12). Alle Werte aus Zweck-Tokens; neue Maße, die zweimal
      vorkommen, werden ein Token in `_tokens.scss`.
- [x] `prefers-reduced-motion`-Zweig für das Wippen (`_motion.scss` liefert die
      Bildfolge, die Dauer-Tokens sind dort bereits abgeschaltet).
- [x] **Bewusste Abweichung von der Design-Copy:** Der Knopf heißt auf der
      letzten Zeile „Weiter", nicht „Minispiel starten". Das Gerüst kennt den
      nächsten Eventtyp nicht und soll ihn nicht kennen — eine typabhängige
      Beschriftung wäre die Verzweigung, die Critical Rule 9 verbietet, nur in
      Textform. Im Report-Back vermerken.

### Doku

- [x] `docs/code-map.md`: `features/episode/` und `features/events/dialog/` auf
      Ist ziehen, `features/location/` entfernen, Routen-Tabelle auf
      `theme/:themeId/episode/:episodeId` korrigieren, Ist-Stand-Absatz
      nachziehen.
- [x] `docs/glossary.md`: Eintrag **Ort** so schärfen, dass er den Kartenpunkt
      meint und nicht mehr den Platzhalter-Screen.
- [x] `AGENTS.md`: nichts ändern, aber gegenprüfen — Critical Rule 9 muss zum
      Gebauten passen.

## Report-Back

**Injektor-Frage entschieden: der einfache Weg trägt.** Die Dialog-Komponente
ruft `inject(EpisodeRun)` ohne Zutun des Gerüsts. Belegt am Quelltext von
`NgComponentOutlet` (`@angular/common`, v22.1.0): die Direktive erzeugt die
Komponente mit `this.ngComponentOutletInjector || this._viewContainerRef.parentInjector`
— ohne eigenen Injektor also mit dem Element-Injektor an der Stelle im Template
des Episoden-Screens, und dort liegt `providers: [EpisodeRun]`.
`[ngComponentOutletInjector]` wird **nicht** gebraucht; Phase 3–5 können sich
auf `inject(EpisodeRun)` verlassen. Der Lauf im Browser steht noch aus (Smoke).

**Abweichungen vom Plan:**

1. **Klasse heißt `EpisodeScreen`, nicht `Episode`.** Der Content-Typ `Episode`
   wird in derselben Datei gebraucht, der Name hätte ihn verdeckt — gleiche
   Begründung und gleiches Muster wie bei `MapScreen`. Datei- und Ordnername
   bleiben `features/episode/episode.ts`.
2. **`EVENT_COMPONENTS` ist `Readonly<Partial<Record<…>>>`, nicht
   `Readonly<Record<…>>`.** Ein vollständiges `Record` würde verlangen, dass
   alle fünf Eventtypen eine Komponente haben — genau das ist bis Phase 5 nicht
   der Fall, und ein erzwungener Platzhalter-Eintrag wäre eine Lüge im Typ. Der
   Fehlerpfad aus AK 7 hängt an dieser Lücke: `loadEventComponent()` lehnt einen
   Typ ohne Eintrag ab, das Gerüst zeigt die Meldung.
3. **Knopf-Beschriftung „Weiter" auch auf der letzten Zeile** — wie im Plan
   vorgesehen (statt „Minispiel starten" aus der Design-Copy). Das Gerüst kennt
   den nächsten Eventtyp nicht und soll ihn nicht kennen.
4. **Wippen ohne eigenen `prefers-reduced-motion`-Zweig.** Die Animation holt
   ihre Dauer aus `--duration-ambient`; genau dieses Token wird in `_tokens.scss`
   unter `prefers-reduced-motion` auf `0s` gesetzt. Gleiches Muster wie
   Etappenkarte und Weltknoten — ein zweiter Zweig in der Komponente wäre eine
   zweite Wahrheit.

**Neue Tokens** in `_tokens.scss`: `--color-stage-bg`, `--color-speaker-left`,
`--color-speaker-right`, `--filter-stage-idle`, `--font-size-label`,
`--size-stage-min-block`, `--size-dialog-figure-inline`,
`--size-dialog-figure-block`, `--measure-dialog-text`.

**Was die Testwelt jetzt zeigt:** Die Episoden von `dev_fixture` beginnen mit
einem `dialog` und enden auf `multiple_choice` — der zweite Eventtyp hat noch
keine Komponente und läuft damit sichtbar in den Fehlerpfad aus AK 7. Das ist
der gewollte Zwischenstand bis Phase 3, kein Defekt.
