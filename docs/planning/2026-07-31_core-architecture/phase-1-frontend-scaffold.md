# Phase 1: Frontend-Scaffold

Rating: **standard**

## Kontext (vorher lesen)

- [docs/conventions/angular.md](../../conventions/angular.md) — Stack, Naming, `:host`-Regel, Signals
- [docs/conventions/typescript.md](../../conventions/typescript.md) — Discriminated Unions statt Magic Strings
- [docs/code-map.md](../../code-map.md) — Namensschema, Feature-Ordner
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md) Abschnitt 1+2 — `main_hub.json` + `world_config.json` Schema (verbindlich, hier 1:1 übernehmen)
- [docs/design/README.md](../../design/README.md) — Design-Tokens und Zielbild des Main-Hubs; die Token-Werte selbst in `docs/design/prototype/ds/styles.css`
- README.md dieses Plan-Ordners → Kontrakt-Sektion (Content-Delivery-Entscheidung)

> ⚠️ **Schema-Stand vom 31.07.2026 beachten.** `main_hub.json` und
> `world_config.json` haben mit dem Design-Handoff Kartendaten dazubekommen
> (Planetenkarte, Etappenkarte, Node-Koordinaten). Die Fixtures unten sind
> bereits darauf angepasst. Phase 1 **rendert** davon nichts — die Karten
> entstehen mit Meilenstein 2 —, aber die Fixtures und Interfaces sind von
> Anfang an schema-konform, damit später nichts nachgezogen werden muss.

## Architektur-Entscheidung (bereits getroffen, hier nur umsetzen)

**Content-Delivery in Phase 1:** Kein Backend-Aufruf. Das Frontend liest
`main_hub.json` und `world_config.json` als statische Dateien aus dem
eigenen Build-Output. Dazu kopiert `angular.json` den Ordner `data/themes/`
(Repo-Root) beim Build nach `frontend/public/data/themes/`, plus eine
eigene `frontend/public/assets/main_hub.json`. Diese Datei ist Frontend-
Eigentum (wird von Hand gepflegt, referenziert aber Pfade unter
`data/themes/`) — sobald Meilenstein 2 die echte Content-API bringt, wandert
das Lesen von `ContentService` auf HTTP-Calls gegen das Backend um, ohne dass
sich das Schema oder die Komponenten-Signaturen ändern.

Das ist Task 1.1 unten — schreib dazu **ADR-001**
(`docs/decisions/001-content-delivery-mvp-phase1.md`, 10 Zeilen:
Kontext/Optionen/Entscheidung/Konsequenzen).

## Akzeptanzkriterien

1. `frontend/` ist ein lauffähiges Angular-v20-Projekt (`npm start` startet den Dev-Server ohne Fehler).
2. Main-Hub zeigt eine Karte pro Eintrag aus `main_hub.json` (Titel + Cover-Bild, Cover darf 404 zeigen — es gibt noch keine echten Assets).
3. Klick auf eine Themenwelt-Karte lädt deren `world_config.json` und zeigt die `difficulty_levels` als auswählbare Karten/Radio-Buttons mit Label.
4. Neben dem Lernstufen-Picker steht ein kleines Info-Icon mit Tooltip/Erklärtext ("Die Lernstufe bestimmt den Schwierigkeitsgrad der Aufgaben — Story und Charaktere bleiben für alle gleich.").
5. Auswahl einer Lernstufe ruft `GameStateService.setActiveTheme()` + `.setActiveDifficultyLevel()` auf und zeigt sichtbar eine Bestätigungszeile ("Ausgewählt: `<Titel>` · `<Lernstufe-Label>`").
6. Die Oberfläche nutzt die Design-Tokens: Hintergrund, Schriften und
   Kartenflächen sehen aus wie im Prototyp, und in den Komponenten-Styles
   steht kein einziger Hex-Wert.
7. `ng lint` (bzw. `npm run lint`) läuft ohne Fehler.

## Implementation

- [ ] `node -v` prüfen (Konfidenz-Ausweis README) — Node 22 erwartet, sonst Version in diesem Task-File korrigieren
- [ ] `ng new frontend --directory=frontend --style=scss --routing --skip-git --skip-tests --package-manager=npm` im Repo-Root ausführen (`--skip-tests`: dieses Projekt hat kein Test-Setup, siehe `testing.md`)
- [ ] `frontend/angular.json`: `"prefix": "qst"` setzen
- [ ] `frontend/angular.json`: Assets-Konfiguration um zwei Einträge erweitern, die zur Build-Zeit kopieren:
      - `../data/themes` (Repo-Root) → `data/themes` im Output
      - `public/assets/main_hub.json` bleibt regulärer Teil von `public/`
- [ ] `frontend/public/data/themes/dev_fixture/world_config.json` anlegen (schema-konform, Abschnitt 2 der Schema-Referenz):
      ```json
      {
        "theme_id": "dev_fixture",
        "title": "Entwickler-Testwelt",
        "subject": "Test",
        "difficulty_levels": [
          { "id": "einfach", "label": "Einfach" },
          { "id": "schwer", "label": "Schwer" }
        ],
        "arc_overview": {
          "title": "Test-Reise",
          "background": "map_test_uebersicht.webp",
          "stages": [
            { "map_id": "test_insel", "name": "Test-Etappe", "x": 30, "y": 50, "size": 12, "aspect": 0.72, "shape": "46% 56% 40% 60%", "illustration": "ep_01.webp" }
          ],
          "routes": []
        },
        "maps": [
          {
            "id": "test_insel",
            "name": "Test-Insel",
            "file": "map_test_insel.webp",
            "nodes": [
              { "id": "test_node", "name": "Test-Ort", "x": 40, "y": 60, "episode_ref": "test_episode" }
            ],
            "routes": []
          }
        ]
      }
      ```
      **Hinweis:** Das ist Test-Fixture-Content für die Engine, kein echtes
      Fandom-Theme — bewusst kein Platz unter `data/themes/one_piece_sachkunde/`
      o.ä., damit später kein Autoring-Content mit Dev-Fixtures kollidiert.
- [ ] `frontend/public/assets/main_hub.json` anlegen (schema-konform, Abschnitt 1):
      ```json
      {
        "hub_map": {
          "background": "hub/map_planetenkarte.webp",
          "routes": []
        },
        "installed_themes": [
          {
            "id": "dev_fixture",
            "title": "Entwickler-Testwelt",
            "cover": "data/themes/dev_fixture/cover.webp",
            "config_path": "data/themes/dev_fixture/world_config.json",
            "x": 25,
            "y": 66,
            "size": 13
          }
        ]
      }
      ```
- [ ] `frontend/src/app/models/content.types.ts`: Interfaces `MainHub`, `HubMap`, `InstalledTheme`, `WorldConfig`, `DifficultyLevel`, `ArcOverview`, `ArcStage`, `MapEntry`, `MapNode` — Felder exakt nach Schema-Referenz Abschnitt 1+2
- [ ] `frontend/src/app/models/game-state.types.ts`: `type LoadState<T> = { status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; message: string }` (Discriminated Union statt Boolean-Flags, siehe `typescript.md`)
- [ ] `ng generate service services/content --skip-tests` → `ContentService`: `getMainHub(): Observable<MainHub>` (GET `/assets/main_hub.json`), `getWorldConfig(configPath: string): Observable<WorldConfig>` (GET `/${configPath}`)
- [ ] `ng generate service services/game-state --skip-tests` → `GameStateService`: `readonly activeThemeId = signal<string | null>(null)`, `readonly activeDifficultyLevel = signal<string | null>(null)`, Methoden `setActiveTheme(themeId: string): void`, `setActiveDifficultyLevel(levelId: string): void`, `reset(): void`
- [ ] `ng generate component features/main-hub --skip-tests` → `MainHub`-Komponente:
      - `OnPush`, `inject(ContentService)`, `inject(GameStateService)`
      - `mainHubState = toSignal(...)` als `LoadState<MainHub>` (HttpClient-Call in `LoadState`-Wrapper, `catchError` → `{status:'error', message}`)
      - Auswahl einer Theme-Karte lädt per zweitem Call (`getWorldConfig`) den `WorldConfig` in ein zweites `LoadState<WorldConfig>`-Signal
      - Auswahl einer Lernstufe ruft `GameStateService`-Setter auf, danach Bestätigungszeile rendern (liest `activeThemeId`/`activeDifficultyLevel` per `computed()`)
- [ ] `ng generate component features/main-hub/theme-card --skip-tests` → reine Präsentationskomponente, `input.required<InstalledTheme>()`, `output<string>()` für "ausgewählt"
- [ ] `ng generate component features/main-hub/difficulty-picker --skip-tests` → `input.required<DifficultyLevel[]>()`, `output<string>()`, Info-Icon mit Tooltip (nativ `title`-Attribut reicht für Phase 1, kein Tooltip-Lib-Overhead)
- [ ] `HttpClient` in `app.config.ts` per `provideHttpClient()` registrieren
- [ ] `frontend/src/styles/_tokens.scss` anlegen: die Custom-Properties aus
      `docs/design/prototype/ds/styles.css` **wertgleich** übernehmen (Farben,
      Schrift, Abstände, Radien, Schatten) und global in `styles.scss`
      einbinden. Schriften `Caprasimo` (Headings) und `Figtree` (Body) lokal
      unter `frontend/public/fonts/` ablegen und per `@font-face` einbinden —
      kein CDN, das Spiel soll offline laufen.
- [ ] BEM-SCSS für `theme-card`, `difficulty-picker`, `main-hub` gemäß
      `angular.md` — **ausschließlich** mit den Tokens aus `_tokens.scss`,
      keine Hex-Werte oder px-Abstände direkt in Komponenten
- [ ] `docs/decisions/001-content-delivery-mvp-phase1.md` schreiben (ADR, siehe oben)

## Doc-Updates

- [ ] `docs/code-map.md`: Frontend-Tabelle um tatsächliche Ordner ergänzen (waren vorher Soll-Zustand, jetzt Ist)
- [ ] `frontend/README.md`: Platzhaltertext durch echten Quickstart ersetzen (oder Datei löschen, falls Root-`README.md` genügt — Entscheidung beim Umsetzen: **löschen**, Root-`README.md` deckt den Quickstart bereits ab)
- [ ] `AGENTS.md`: 🚧-Zeile bleibt bis Plan-Ende auf STATE.md zeigen (kein Update hier nötig)

## Report-Back
*(leer, wird beim Umsetzen befüllt)*
