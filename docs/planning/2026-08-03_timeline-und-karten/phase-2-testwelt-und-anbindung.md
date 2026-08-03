# Phase 2 — Testwelt im Repo + Frontend liest über die Schnittstelle

**Rating:** standard

Die Testwelt zieht aus dem Frontend-Build in das Content-Repository um, und das
Frontend holt sie ab jetzt über die Schnittstelle aus Phase 1.

## Kontext — vorher lesen

- [README.md](README.md) → Kontrakt-Sektion, besonders die zwei
  Schema-Änderungen an `main_hub.json`
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 1, 2, 4, 5 — verbindliches Format der Dateien, die hier entstehen
- [data/_authoring/README.md](../../../data/_authoring/README.md) → „Pflegepflicht"
- [frontend/src/app/services/content.service.ts](../../../frontend/src/app/services/content.service.ts)
  — die zwei Aufrufe, die umgestellt werden
- [frontend/src/app/models/content.types.ts](../../../frontend/src/app/models/content.types.ts)
- [frontend/src/app/features/main-hub/main-hub.ts](../../../frontend/src/app/features/main-hub/main-hub.ts)
  — einziger heutiger Aufrufer
- [docs/conventions/angular.md](../../conventions/angular.md),
  [docs/conventions/typescript.md](../../conventions/typescript.md)

## Akzeptanzkriterien

1. `data/main_hub.json` und `data/themes/dev_fixture/` (Welt-Konfiguration, fünf
   Episoden, ein Minispiel) erfüllen die Prüfliste aus Abschnitt 9 der
   Schema-Referenz — jede Verweis-ID trifft ein existierendes Ziel.
2. Unter `frontend/public/` liegt **kein** Content mehr (weder
   `assets/main_hub.json` noch `data/`).
3. `npm start` zeigt den Main-Hub weiterhin vollständig — Welt wählen, Lernstufe
   wählen, Bestätigung erscheint —, jetzt gespeist über
   `/api/content/…` gegen den lokalen Server aus Phase 1.
4. In den Entwicklerwerkzeugen des Browsers steht **ein** Aufruf pro
   Welt-Konfiguration, auch wenn mehrere Stellen sie anfragen (Zwischenspeicher).
5. `npm run build` grün, keine `any`, keine ungenutzten Typen.

## Checkliste

### Content anlegen

- [ ] `data/main_hub.json`: eine Welt `dev_fixture` (`title`
      „Entwickler-Testwelt", `cover` `cover.webp`, `x` 32, `y` 54, `size` 18),
      `hub_map.background` `map_planetenkarte.webp`, `routes` leer.
      **Kein `config_path`** — das Feld entfällt (siehe Kontrakt).
- [ ] `data/themes/dev_fixture/world_config.json`:
  - `difficulty_levels`: `einfach` / `schwer` (wie bisher)
  - `arc_overview`: Titel „Test-Reise", Hintergrund `map_test_uebersicht.webp`,
    zwei Etappen — `test_insel` (x 30, y 50, size 12, aspect 0.72, shape
    `46% 56% 40% 60%`, illustration `ep_01.webp`) und `test_riff` (x 62, y 32,
    size 10, aspect 0.69, shape `44% 58% 42% 60%`, illustration `ep_02.webp`),
    `routes` `[["test_insel","test_riff"]]`
  - `maps`: `test_insel` mit den Orten `dorf` (23/64), `hafen` (50/30),
    `leuchtturm` (78/52) und Routen `dorf→hafen→leuchtturm`; `test_riff` mit
    `bucht` (30/40), `riff` (66/58) und Route `bucht→riff`
  - jede `episode_ref` heißt wie die Episodendatei: `test_dorf`, `test_hafen`,
    `test_leuchtturm`, `test_bucht`, `test_riff`
- [ ] Fünf Episodendateien unter `data/themes/dev_fixture/episodes/`, je mit
      `active_map_id`, `node_id`, `background`, zwei Dialogzeilen (`left` und
      `right`, mit `text` und `text_simple`) und
      `minigame_event.minigame_ref: "probe_quiz"`. **Kein `reward_card_id`** —
      Sammelkarten kommen mit Meilenstein 5.
- [ ] `data/themes/dev_fixture/minigames/probe_quiz.json`: `MultipleChoiceGame`
      mit einer Variante je Lernstufe, vier Optionen. Wird in diesem Meilenstein
      nicht gespielt, hält die Welt aber schema-vollständig.
- [ ] Keine Bilddateien anlegen. Die Testwelt läuft mit Bildplatzhaltern
      (Phase 3); echte Kartenbilder kommen mit echtem Content.
- [ ] `frontend/public/assets/main_hub.json` und `frontend/public/data/`
      löschen.

### Frontend

- [ ] `models/content.types.ts`:
  - `config_path` aus `InstalledTheme` entfernen, Kommentar bei `cover` auf
    „Dateiname unter dem Welt-Ordner" korrigieren
  - Episoden-Typen ergänzen: `DialogueLine` (`position: 'left' | 'right'`,
    `sprite`, `name`, `text`, `text_simple?`, `audio_path?`), `MinigameEvent`,
    `Episode`. `position` als String-Union, nicht als loser String.
- [ ] `services/content.service.ts` umstellen:
  - `getInstalledThemes(): Observable<MainHub>` → `/api/content/themes`
  - `getWorldConfig(themeId: string): Observable<WorldConfig>` →
    `/api/content/themes/${themeId}`, Ergebnisse **pro Welt-ID
    zwischenspeichern** (`Map<string, Observable<WorldConfig>>` mit
    `shareReplay({ bufferSize: 1, refCount: false })`) — der Resolver aus
    Phase 5 fragt sonst bei jedem Screenwechsel neu
  - `getEpisode(themeId: string, episodeId: string): Observable<Episode>`
  - `assetUrl(themeId: string, folder: string, file: string): string` →
    `/content/themes/${themeId}/${folder}/${file}`
  - `themeAssetUrl(themeId: string, file: string): string` →
    `/content/themes/${themeId}/${file}` (für Dateien direkt im Welt-Ordner,
    z. B. das Cover)
  - `hubAssetUrl(file: string): string` → `/content/hub/${file}`
  - Klassenkommentar auf den neuen Stand bringen (ADR-004 statt ADR-001)
- [ ] `features/main-hub/main-hub.ts`: `getMainHub()` → `getInstalledThemes()`,
      `getWorldConfig(theme.config_path)` → `getWorldConfig(theme.id)`.
      Sonst nichts — der Screen wird in Phase 8 umgebaut.
- [ ] `features/main-hub/theme-card/theme-card.html` Zeile 8: das Cover-Bild
      hängt heute direkt an `theme().cover`. Adresse über
      `themeAssetUrl(theme.id, theme.cover)` auflösen — sonst zeigt die Kachel
      nach der Schema-Änderung auf einen Dateinamen ohne Pfad.

### Doku

- [ ] `JSON_SCHEMA_REFERENCE.md` Abschnitt 1: Ablageort auf
      `data/main_hub.json` korrigieren, `config_path` streichen, `cover` als
      Dateiname beschreiben, den Hub-Hintergrund unter `data/hub/` verorten.
      Ein Satz dazu, wie die Dateien im Betrieb adressiert werden (Kontrakt).
- [ ] `data/_authoring/README.md`: prüfen, ob die Pflegepflicht-Sektion die
      Änderung erwähnen muss — wenn ja, nachziehen.
- [ ] `docs/code-map.md`: Zeile „Statischer Content" unter Frontend entfernen,
      Content-Repository-Tabelle um `data/main_hub.json` und `data/hub/`
      ergänzen.
- [ ] `docs/glossary.md`: Begriffe **Etappe**, **Ort**, **Testwelt** aufnehmen,
      falls noch nicht drin.

## Chesterton's Fence

- **`frontend/public/data/themes/dev_fixture/`** existierte, weil der
  Angular-Build keine Dateien außerhalb von `frontend/` einsammeln kann
  (ADR-001). Mit der Schnittstelle ist der Grund weg — die Dateien werden
  verschoben, nicht neu erfunden.
- **`config_path`** existierte, damit das Frontend die Konfigurationsdatei
  selbst adressieren konnte. Die Schnittstelle adressiert über die Welt-ID;
  das Feld hätte danach zwei Wahrheiten. Deshalb raus, nicht mitschleppen.

## Report-Back
