# Phase 5 — Router-Struktur + Kopfleiste

**Rating:** standard

Ab hier hat jeder Screen eine eigene Adresse, die Welt-Konfiguration wird einmal
zentral geladen, und oben steht auf jedem Spiel-Screen dieselbe Kopfleiste.

## Kontext — vorher lesen

- [README.md](README.md) → Kontrakt-Sektion „Routen"
- [docs/design/HANDOFF.md](../../../design/HANDOFF.md) Abschnitt „0. HUD" und die
  Rückwärts-Navigation direkt darüber (`hub→login, level→hub, timeline→level,
  map→timeline, dialog→map`)
- [docs/conventions/angular.md](../../../conventions/angular.md) → „Routing"
  (nur funktionale Guards/Resolver, `loadComponent`)
- [frontend/src/app/app.routes.ts](../../../../frontend/src/app/app.routes.ts),
  [app.config.ts](../../../../frontend/src/app/app.config.ts),
  [app.html](../../../../frontend/src/app/app.html)
- [frontend/src/app/services/game-state.service.ts](../../../../frontend/src/app/services/game-state.service.ts)
- Phase 4 → `ProgressService`, `progress.rules.ts`

## Akzeptanzkriterien

1. Alle fünf Adressen aus dem Kontrakt sind erreichbar, jede lädt ihre
   Komponente nach (`loadComponent`).
2. Ein Tieflink auf Etappen- oder Ortskarte lädt die Welt eigenständig — ohne
   dass man vorher über die Planetenkarte gegangen ist.
3. Ohne gewählte Lernstufe landet jeder Tieflink unterhalb von
   `theme/:themeId/` auf der Lernstufen-Auswahl.
4. Eine unbekannte Welt-ID in der Adresse zeigt eine verständliche Meldung mit
   einem Weg zurück zur Übersicht — keine leere Seite, kein Konsolenfehler.
5. Die Kopfleiste steht auf Lernstufen-Auswahl, Etappenkarte, Ortskarte und
   Ort; der Zurück-Knopf folgt exakt der Kette aus dem Design.
6. Die Fortschrittsleiste zeigt geschaffte Orte der aktiven Welt und ändert
   sich sichtbar, sobald ein Ort geschafft wird.

## Checkliste

### Routen

- [x] `app.routes.ts` neu aufbauen — Pfade und Reihenfolge exakt:
      `''` (Planetenkarte) · `'theme/:themeId/level'` ·
      `'theme/:themeId/timeline'` · `'theme/:themeId/map/:mapId'` ·
      `'theme/:themeId/location/:episodeId'` · `'**'` → Umleitung auf `''`.
- [x] Alle vier `theme/…`-Routen bekommen `resolve: { world: worldConfigResolver }`
      und `canActivate: [difficultyChosenGuard]` — **außer** der
      Lernstufen-Route, sonst leitet der Guard auf sich selbst um
      (Endlosschleife).
- [x] `app.config.ts`: `provideRouter(routes, withComponentInputBinding())` —
      damit landen Routen-Parameter und aufgelöste Daten direkt als
      Komponenten-Eingaben, ohne `ActivatedRoute`-Verdrahtung in jedem Screen.
- [x] Neuer Ordner `frontend/src/app/routing/`:
  - `world-config.resolver.ts` — `ResolveFn<WorldConfig | null>`: liest
    `themeId` aus den Routen-Parametern, holt die Konfiguration über den
    zwischengespeicherten `ContentService`, setzt `GameStateService.activeThemeId`
    und liefert bei einem Fehler `null` (statt die Navigation abzubrechen —
    der Screen zeigt dann die Meldung aus Punkt 4).
  - `difficulty-chosen.guard.ts` — `CanActivateFn`: ist keine Lernstufe
    gewählt, `router.createUrlTree(['theme', themeId, 'level'])`.
- [x] `GameStateService.setActiveTheme` korrigieren: die Lernstufe **nur**
      zurücksetzen, wenn sich die Welt tatsächlich ändert. Heute setzt jeder
      Aufruf sie auf `null` — der Resolver läuft bei jeder Navigation, damit
      würde die Stufenwahl bei jedem Screenwechsel verloren gehen und der Guard
      sofort zurück zur Stufenwahl schicken. Kommentar an die Stelle.
- [x] **Nachgezogen (nicht im ursprünglichen Wortlaut):** AK 1 verlangt, dass
      alle fünf Adressen sofort eine Komponente laden — `features/timeline/`,
      `features/map/`, `features/location/` existierten aber noch nicht (die
      kommen laut Overview erst in Phase 6/7). Angelegt als schlanke
      Platzhalter (Kopfleiste + „wird noch gebaut"-Text, korrekt verdrahtete
      Inputs `themeId`/`mapId`/`episodeId`/`world`). Phase 6/7 bauen **in**
      diesen Dateien weiter, nicht per erneutem `ng generate` — Details in
      [FINDINGS.md](FINDINGS.md).

### Kopfleiste (`ui/hud/`)

- [x] `ng generate component ui/hud --skip-tests`
- [x] Eingaben: `backLink = input<readonly string[] | null>(null)`,
      `worldTitle = input<string | null>(null)`,
      `levelLabel = input<string | null>(null)`,
      `levelLink = input<readonly string[] | null>(null)`,
      `progress = input<{ done: number; total: number } | null>(null)`.
- [x] Aufbau nach Design-Abschnitt 0, mit richtigem HTML:
  - Zurück: `<a [routerLink]>` als Pille mit Chevron — das ist Navigation, kein
    Knopf
  - Profil-Chip: runder Platzhalter-Punkt + „Gast". Kommentar: echte Profile
    kommen mit Meilenstein 4
  - Stufen-Schild: `<a [routerLink]="levelLink()">` mit dem Stufennamen, ohne
    Wahl der Text „Stufe wählen"
  - Fortschritt: `<progress [value] [max]>` plus sichtbare Beschriftung
    „x von y Orten" — die Zahl steht da, niemand muss einen Balken deuten
- [x] Dezente Erklärungen (Pflicht, nicht Beiwerk): `title` auf Stufen-Schild
      („Die Lernstufe bestimmt, wie schwer die Aufgaben sind") und auf der
      Fortschrittsanzeige („Geschaffte Orte in dieser Welt"). Sichtbarer Text
      bleibt die Hauptinformation — Kinder lesen keine Tooltips.
- [x] Kommentar im Template an der Stelle, wo Modus-Umschalter und Ton-Knopf
      (Meilenstein 3) sowie der Karten-Knopf (Meilenstein 5) eingehängt werden.
      **Keine leeren Attrappen bauen** — ein Knopf, der nichts tut, ist für ein
      Kind schlimmer als keiner.
- [x] Touch-Ziele ≥ 46 px (neuer Token `--size-touch-target`), `:focus-visible`
      mit Akzent-Rahmen (Design, „Interaktionen & Verhalten"). `levelLabel`
      wird noch von keinem Screen befüllt (Stufenname steht erst mit der
      echten Etappenkarte fest) — HUD zeigt bei fehlendem Label „Stufe
      wählen", das Verhalten ist also schon jetzt korrekt.

### Meldung für fehlenden Content (`ui/content-error/`)

- [x] `ng generate component ui/content-error --skip-tests` — Eingabe
      `message = input.required<string>()`, dazu ein Link zurück zur Übersicht.
      Wird von Etappenkarte, Ortskarte und Ort benutzt, wenn die Welt oder der
      Ort nicht geladen werden konnte.

### Lernstufen-Screen

- [x] `ng generate component features/main-hub/level-select --skip-tests` —
      eigener Screen unter `theme/:themeId/level`, benutzt den bestehenden
      `difficulty-picker` unverändert, dazu Kopfleiste und Weiter-Weg auf die
      Etappenkarte. **Abweichung:** Design-Abschnitt 3 (drei Karten, Pips,
      Beschreibungstext) wurde **nicht** nachgebaut — der Checklistensatz
      davor verlangt ausdrücklich „benutzt den bestehenden `difficulty-picker`
      **unverändert**", und der ist die schlichte Fieldset/Radio-Variante aus
      Phase 1. Wirkt das zu karg, ist das ein Phase-8-Thema (Main-Hub aufs
      Design ziehen), kein Phase-5-Nacharbeiten.
- [x] Nach der Wahl der Stufe: Navigation auf `theme/:themeId/timeline`.

### Doku

- [x] `docs/code-map.md`: `routing/`, `ui/hud/`, `ui/content-error/`,
      `features/main-hub/level-select/` eintragen; Routen-Tabelle als eigene
      kleine Sektion aufnehmen (welche Adresse zeigt welchen Screen).
- [x] `docs/conventions/angular.md` → „Project Layout": `routing/` ergänzt
      (dazu `features/location/` neben dem bereits verzeichneten
      `features/episode/` — Platzhalter jetzt, Event Engine ab Meilenstein 3).

## Chesterton's Fence

- **Die Lernstufen-Auswahl steckt heute im Main-Hub-Screen**, weil es in
  Meilenstein 1 keinen Router gab. Sie zieht in einen eigenen Screen um; der
  `difficulty-picker` selbst bleibt unverändert und wird nur woanders
  eingehängt.
- **Die Kopfleiste wird von jedem Screen selbst eingebunden**, nicht aus der
  Hülle heraus. Grund: jeder Screen kennt seinen eigenen Rückweg (die Kette
  steht im Design), und eine aus der Adresse geratene Rück-Navigation ist genau
  die Art Magie, die später falsch abbiegt.

## Report-Back

**Status: complete.** `npm run build` und `npm run lint` grün.

Gebaut: `routing/world-config.resolver.ts` + `difficulty-chosen.guard.ts`,
`app.routes.ts` mit allen fünf Adressen (+ Wildcard), `app.config.ts` mit
`withComponentInputBinding()`, `GameStateService.setActiveTheme` korrigiert
(Lernstufe bleibt bei gleicher Welt erhalten), `ui/hud/`, `ui/content-error/`,
`features/main-hub/level-select/` (Main-Hub dafür getrimmt — zeigt nur noch
die Welt-Wahl, navigiert weiter statt lokal die Lernstufe zu verwalten).

**Abweichung vom Plan (dokumentiert, nicht stillschweigend):**
`features/timeline/`, `features/map/`, `features/location/` existierten noch
nicht (laut Overview Phase 6/7), AK 1 verlangt aber alle fünf Adressen sofort
ladbar. Angelegt als schlanke Platzhalter mit Kopfleiste, korrekt
gebundenen Inputs und „wird noch gebaut"-Text. Findings-Eintrag warnt Phase
6/7 davor, `ng generate` an denselben Pfaden erneut auszuführen.

**Unsicherste Stelle:** Die Routing-/Guard-Logik (Resolver setzt
`activeThemeId`, Guard leitet ohne Lernstufe um, `setActiveTheme` behält die
Stufe bei gleicher Welt) ist nur gegen `npm run build`/`lint` geprüft — kein
echter Browser-Durchlauf. Am ehesten bricht hier etwas: ein Tieflink auf
`theme/dev_fixture/map/test_insel` ohne gewählte Stufe (muss auf `level`
umleiten), und ein Wechsel zwischen zwei Welten (muss die Stufe zurücksetzen,
ein Wechsel innerhalb derselben Welt nicht). Beides steht in der
Smoke-Checkliste des Plans (Punkt 5) — dort zuerst prüfen.
