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
   Episoden, ein ausgelagertes Event) erfüllen die Prüfliste aus Abschnitt 9 der
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

- [x] `data/main_hub.json`: eine Welt `dev_fixture` (`title`
      „Entwickler-Testwelt", `cover` `cover.webp`, `x` 32, `y` 54, `size` 18),
      `hub_map.background` `map_planetenkarte.webp`, `routes` leer.
      **Kein `config_path`** — das Feld entfällt (siehe Kontrakt).
- [x] `data/themes/dev_fixture/world_config.json`:
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
- [x] Fünf Episodendateien unter `data/themes/dev_fixture/episodes/`, je mit
      `active_map_id`, `node_id`, `background` und einer `events`-Liste aus
      zwei Einträgen: ein `dialog`-Event mit zwei Zeilen (`left` und `right`,
      mit `text` und `text_simple`) und ein
      `{ "type": "multiple_choice", "config": { "ref": "probe_quiz" } }`.
      **Kein `reward`-Event** — Sammelkarten kommen mit Meilenstein 5.
- [x] `data/themes/dev_fixture/events/probe_quiz.json`: `event_id`,
      `type: "multiple_choice"`, eine Variante je Lernstufe, vier Optionen.
      Wird in diesem Meilenstein nicht gespielt, hält die Welt aber
      schema-vollständig.
- [x] Keine Bilddateien angelegt. Die Testwelt läuft mit Bildplatzhaltern
      (Phase 3); echte Kartenbilder kommen mit echtem Content.
- [x] `frontend/public/assets/main_hub.json` und `frontend/public/data/`
      gelöscht (inkl. der jetzt leeren `frontend/public/assets/`).

### Frontend

- [x] `models/content.types.ts`:
  - `config_path` aus `InstalledTheme` entfernt, Kommentar bei `cover` auf
    „Dateiname unter dem Welt-Ordner" korrigiert
  - Episoden-Typen ergänzt: `EVENT_TYPES`/`EventType` als const-asserted Union,
    `EpisodeEvent` (`type: EventType`, `config`), `DialogueLine`
    (`position: 'left' | 'right'`, `sprite`, `name`, `text`, `text_simple?`,
    `audio_path?`) und `Episode` mit `events: EpisodeEvent[]`.
- [x] `services/content.service.ts` umgestellt:
  - `getInstalledThemes(): Observable<MainHub>` → `/api/content/themes`
  - `getWorldConfig(themeId: string): Observable<WorldConfig>` →
    `/api/content/themes/${themeId}`, **pro Welt-ID zwischengespeichert**
    (`Map<string, Observable<WorldConfig>>` mit
    `shareReplay({ bufferSize: 1, refCount: false })`)
  - `getEpisode(themeId: string, episodeId: string): Observable<Episode>`
  - `assetUrl` · `themeAssetUrl` · `hubAssetUrl` wie im Kontrakt
  - Klassenkommentar auf den neuen Stand gebracht (ADR-005 statt ADR-001)
- [x] `features/main-hub/main-hub.ts`: `getMainHub()` → `getInstalledThemes()`,
      `getWorldConfig(theme.config_path)` → `getWorldConfig(theme.id)`.
- [x] `features/main-hub/theme-card/theme-card.ts` + `.html`: Cover-Adresse
      über eine neue `coverUrl()`-Methode (`ContentService.themeAssetUrl`)
      aufgelöst, statt direkt an `theme().cover` zu hängen.

### Doku

- [x] `JSON_SCHEMA_REFERENCE.md` Abschnitt 1: Ablageort auf
      `data/main_hub.json` korrigiert, `config_path` gestrichen, `cover` als
      Dateiname beschrieben, Adressierung über die Schnittstelle als
      Kontrakt-Absatz ergänzt.
- [x] `data/_authoring/README.md` geprüft — die Pflegepflicht-Sektion ist
      generisch genug, keine Änderung nötig.
- [x] `docs/code-map.md`: Zeile „Statischer Content" unter Frontend entfernt,
      Content-Repository-Tabelle um `data/hub/` ergänzt (`data/main_hub.json`
      stand bereits aus Phase 1 drin).
- [x] `docs/glossary.md`: Begriffe **Etappe**, **Ort**, **Testwelt** ergänzt.

### Gefundener Bug (nicht im ursprünglichen Plan)

- [x] `backend/src/Services/ContentService.php::themePath()` fixiert: Der
      `realpath()`-Riegel verankerte auf der Content-Wurzel (`data/`) — lokal
      ist `data/themes` aber eine NTFS-Junction auf Google Drive, und
      `realpath()` löst Junctions auf ihr tatsächliches Ziel auf
      (`H:\Meine Ablage\U105_Questoria`). Das Ziel beginnt nicht mehr mit dem
      Pfad von `data/`, also warf **jede echte Welt** einen `404`, obwohl die
      ID-Prüfung sie zu Recht durchließ. Anker jetzt auf `data/themes` selbst
      (wird bei jedem Aufruf frisch aufgelöst, trägt die Junction-Auflösung
      also mit). Getestet gegen `dev_fixture` über `/api/content/themes/…`:
      `200` mit korrektem Inhalt für Welt und Episode, weiterhin `404` für
      eine erfundene Welt-ID. War in Phase 1 nicht aufgefallen, weil dort
      bewusst gegen Scratch-Fixtures getestet wurde, nicht gegen die echte
      Junction (siehe Report-Back Phase 1).

## Chesterton's Fence

- **`frontend/public/data/themes/dev_fixture/`** existierte, weil der
  Angular-Build keine Dateien außerhalb von `frontend/` einsammeln kann
  (ADR-001). Mit der Schnittstelle ist der Grund weg — die Dateien werden
  verschoben, nicht neu erfunden.
- **`config_path`** existierte, damit das Frontend die Konfigurationsdatei
  selbst adressieren konnte. Die Schnittstelle adressiert über die Welt-ID;
  das Feld hätte danach zwei Wahrheiten. Deshalb raus, nicht mitschleppen.

## Report-Back

Alle fünf Akzeptanzkriterien lokal verifiziert. Die Testwelt `dev_fixture`
liegt jetzt vollständig unter `data/` (main_hub.json im Repo, Rest über die
Google-Drive-Junction) und erfüllt die Prüfliste aus
`JSON_SCHEMA_REFERENCE.md` Abschnitt 9 — jede Verweis-ID trifft ihr Ziel.
`frontend/public/` ist content-frei. Gegen den lokalen PHP-Server (Port 8010,
nicht 8000 — siehe Merkposten) liefern alle drei Content-Aufrufe den echten
`dev_fixture`-Inhalt mit `200`, eine erfundene Welt-ID weiterhin `404`.
`npm run build` und `composer lint` beide grün.

**Abweichung vom Plan:** ein Bug in `ContentService::themePath()` gefunden und
behoben, siehe Checkliste oben („Gefundener Bug") — ohne den Fix hätte jede
echte Welt hinter der Google-Drive-Junction einen `404` geworfen, nicht nur
`dev_fixture`.

**Unsicherste Stelle:** der neue `realpath()`-Anker auf `data/themes` ist
gegen die Junction und gegen eine erfundene Welt-ID getestet, aber nicht gegen
jede denkbare Windows-Pfad-Normalisierung (dieselbe Einschränkung wie schon in
Phase 1 vermerkt). Auf dem Produktivserver ist `data/themes` eine normale
Ordnerstruktur ohne Junction — dort greift der ursprüngliche Angriffsvektor
ohnehin nicht, das Risiko besteht nur lokal.
