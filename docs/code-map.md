# Code Map — Questoria

Feature → Ordner, grob gehalten (kein Zeilen-Tracking — das veraltet sofort
und lügt dann). Ziel: „wo ist Feature X" wird ein Read statt N Greps.

## Namensschema (Layer-übergreifend)

Ein Feature heißt in jedem Layer gleich (snake_case im Content, kebab-case
im Frontend-Ordnernamen, PascalCase in PHP-Klassen):

| Layer | Muster | Beispiel |
|---|---|---|
| Angular Feature | `frontend/src/app/features/<feature>/` | `features/main-hub/`, `features/timeline/` |
| Event-Komponente | `frontend/src/app/features/events/<type>/` | `features/events/multiple-choice/` für `type: "multiple_choice"` |
| Angular Service | `frontend/src/app/services/<name>.service.ts` | `services/game-state.service.ts` |
| Angular Shared UI | `frontend/src/app/ui/<name>/` | `ui/speech-bubble/` |
| PHP Controller | `backend/src/Controllers/<Name>Controller.php` | `Controllers/SavegameController.php` |
| PHP Service | `backend/src/Services/<Name>Service.php` | `Services/ContentService.php` |
| PHP Repository | `backend/src/Repositories/<Name>Repository.php` | `Repositories/ProfileRepository.php` |
| Content-Welt | `data/themes/<theme_id>/` | `data/themes/one_piece_sachkunde/` |

## Frontend (`frontend/src/app/`)

| Feature | Ordner | Zweck |
|---|---|---|
| Main-Hub | `features/main-hub/` | Zwei Screens: Planetenkarte (Welten als Knoten auf der Kartenfläche, `theme-card/` als Weltknoten, Info-Panel mit „Weiterspielen") und `level-select/` mit der Lernstufen-Auswahl (`difficulty-picker/`) |
| Timeline | `features/timeline/` | Etappenkarte pro Welt, Fortschrittsmarkierung mit Sternen |
| Map | `features/map/` | Interaktive Ortskarte pro Arc — Orte als Punkte, Routen, Kompassrose |
| Ort | `features/location/` | Ehrlicher Platzhalter für den Ort: Name, Hintergrund, Anzahl bereitliegender Events, „Ort geschafft". Die Event Engine (Meilenstein 3) übernimmt diesen Screen und spielt die Eventliste der Episode ab |
| Event Engine | `features/episode/` | Spielt die Eventliste einer Episode ab: Ablauf-Gerüst, Event Loader (`event-type-map.ts`), Ergebnis-Einsammlung. Kein `@switch` über Eventtypen |
| Event-Komponenten | `features/events/<type>/` | Eine Komponente pro Eventtyp (`features/events/dialog/`, `features/events/multiple-choice/`, ...), dynamisch geladen über `ngComponentOutlet` |
| Ergebnis | `features/result/` | Sterne, Statistiken, Erfolge, Banner für die neu gewonnene Sammelkarte |
| Sammelkarten | `features/cards/`, `features/cards/print/` | Trophäenhalle (Gruppen, Filter, Detail, Druckauswahl) und A4-Druckbogen |
| Nutzerverwaltung | `features/auth/`, `features/profile/` | Login, Profile anlegen/wechseln |
| Kartenfläche | `ui/map-canvas/` | Gemeinsames Bauteil von Planeten-, Etappen- und Ortskarte: Fläche im Seitenverhältnis 16:9, Hintergrund, Routenlinien; `map-point/` setzt ein beliebiges Kind auf eine Prozent-Position |
| Bildfläche | `ui/image-slot/` | Bild mit beschriftetem Platzhalter, wenn die Datei fehlt |
| Gemeinsame UI | `ui/hud/`, `ui/content-error/`, `ui/speech-bubble/` | Kopfleiste auf allen Spiel-Screens (jeder Screen bindet sie selbst ein); Meldung bei fehlgeschlagener Welt/Ort-Ladung mit Weg zurück; Sprechblasen |
| Routing | `routing/` | `world-config.resolver.ts` lädt die Welt-Konfiguration zentral für jede `theme/:themeId/…`-Route und setzt die aktive Welt; `difficulty-chosen.guard.ts` schickt ohne gewählte Lernstufe auf die Lernstufen-Auswahl zurück |
| Zentrale Services | `services/game-state.service.ts`, `services/content.service.ts`, `services/progress.service.ts`, `services/progress.rules.ts`, `services/savegame.service.ts`, `services/narration.service.ts` | Aktive Welt/Profil/Lernstufe, JSON-Content lesen, Fortschritt im Browser-Speicher + Freischaltregeln als reine Funktionen (ADR-006), Speichern/Laden, Vorlesemodus + Sprachausgabe. **`ContentService` ist die einzige Ladestelle für Content** — dort hängt später der Offline-Cache (Meilenstein 6) |
| Content-Typen | `models/` | TypeScript-Abbild des JSON-Schemas (`content.types.ts`) und der Ladezustände (`game-state.types.ts`) |
| Design-Tokens | `frontend/src/styles/` | `_tokens.scss` (Farben, Schrift, Abstände, Radien, Kartenmaße), `_fonts.scss` und `_motion.scss` (Bildfolgen, die mehrere Komponenten teilen); global über `src/styles.scss` eingebunden |

**Ist-Stand:** gebaut sind bisher `features/main-hub/` (echte Planetenkarte:
Weltknoten aus `theme-card/`, Routen, Info-Panel; dazu der eigene Screen
`level-select/` mit `difficulty-picker/`), `features/timeline/`
(echte Etappenkarte: Inseln, Panel, Legende, Fortschritt-zurücksetzen-Dialog),
`features/map/` (echte Ortskarte: Punkte, Routen, Kompassrose), `features/location/`
(Ort-Platzhalter: Name, Hintergrund, Event-Anzahl, „Ort geschafft"), `ui/map-canvas/`,
`ui/image-slot/`, `ui/hud/`, `ui/content-error/`, `routing/`, `services/`, `models/`
und `styles/`. Alle übrigen Zeilen sind Soll-Zustand für spätere Meilensteine.

### Routen (Frontend)

| Adresse | Screen |
|---|---|
| `` (leer) | Planetenkarte (`features/main-hub/`) |
| `theme/:themeId/level` | Lernstufen-Auswahl (`features/main-hub/level-select/`) |
| `theme/:themeId/timeline` | Etappenkarte (`features/timeline/`) |
| `theme/:themeId/map/:mapId` | Ortskarte (`features/map/`) |
| `theme/:themeId/location/:episodeId` | Ort, Platzhalter (`features/location/`) |

Alle vier `theme/…`-Routen laden die Welt-Konfiguration über
`worldConfigResolver`; alle außer der Lernstufen-Route verlangen zusätzlich
`difficultyChosenGuard`.

## Backend (`backend/src/`)

Struktur übernommen aus promptigofant (gleiches Muster, eigenes Repo):

| Ordner | Zweck |
|---|---|
| `Controllers/` | HTTP-Endpunkte (Content-API, User-API, Savegame-API) |
| `Services/` | Geschäftslogik. `ContentService` liest `data/` (Wurzel: `CONTENT_PATH` oder `DOCUMENT_ROOT/content`) — Content lesen, Savegame-Verwaltung, Auth |
| `Repositories/` | MySQL-Zugriff (users, player_profiles, savegames, achievements, statistics) |
| `Middleware/` | Herkunftssperre (`CorsMiddleware`) und Anmelde-Token (`JwtAuthMiddleware`) |
| `Validators/` | Request-Validierung (respect/validation) |
| `Migrations/` | MySQL-Schema-Migrationen |
| `Database/` | Connection/PDO-Setup |
| `Exceptions/` | Domänen-Exceptions |
| `Http/` | Request/Response-Helper |
| `public/` | Einstiegspunkt `index.php` + `.htaccess`; das ist die Web-Wurzel auf dem Server |

**Ist-Stand:** gebaut sind `Http/`, `Exceptions/`, `Database/`, `Middleware/`,
`Controllers/HealthController.php`, `Controllers/MigrateController.php`,
`Controllers/ContentController.php`, `Services/ContentService.php`,
`Migrations/` (7 Tabellen in 8 Schritten unter `sql/`, `MigrationRunner.php`, plus
`backend/bin/migrate.php` als CLI-Hülle für den Fall eines späteren lokalen/
Fernzugriff-Tests) und der Einstiegspunkt. Fehlende Migrationen werden bei
jedem echten API-Aufruf automatisch nachgezogen (`AutoMigrator`, verdrahtet in
`public/index.php`, Not-Aus über `AUTO_MIGRATE` in `.env`) — `MigrateController`
bleibt zusätzlich als manuell aufrufbares Debug-Werkzeug. `Repositories/` und
`Validators/` sind Soll-Zustand für spätere Meilensteine und existieren noch
nicht als Ordner.

## Projektstamm

| Datei / Ordner | Zweck |
|---|---|
| `deploy.cmd` | Bringt Backend, Frontend und Content auf den Server (Ziel wählbar: `backend`, `frontend`, `content`, ohne Angabe alle drei) |
| `deploy.env.example` | Vorlage für die Zugangsdaten; die echte `deploy.env` liegt nicht im Git |
| `api-bridge/` | Die drei Dateien, die im ausgelieferten Bereich stehen und auf das Backend daneben zeigen ([ADR-003](decisions/003-backend-ausserhalb-des-webbereichs.md)). Landen auf dem Server unter `public/api/` |
| `backend/serve.cmd` | Startet den lokalen PHP-Entwicklungsserver auf Port 8000 (`backend/dev-router.php` als Weiche: `/content/` direkt aus `data/`, alles andere durch `public/index.php`) — nur für die Entwicklung, nie deployen |
| `frontend/proxy.conf.json` | Leitet `/api` und `/content` beim lokalen Entwickeln an `localhost:8000` weiter (`backend\serve.cmd`) — so laufen die Aufrufe im Code relativ, lokal wie in Betrieb |

## Content-Repository (`data/`)

| Ordner | Zweck |
|---|---|
| `data/_authoring/` | LLM-Prompt-Toolkit + Schema-Referenz — kein Runtime-Code |
| `data/main_hub.json` | Installierte Welten für die Planetenkarte — ausgeliefert über `GET /api/content/themes` |
| `data/hub/` | Bilder der Planetenkarte (Hintergrund), ausgeliefert über `GET /content/hub/<datei>` |
| `data/themes/<theme_id>/world_config.json` | Lernstufen, Etappenkarte, Ortskarten mit Node-Koordinaten |
| `data/themes/<theme_id>/cards.json` | Kartenformat + alle Sammelkarten der Welt |
| `data/themes/<theme_id>/episodes/` | Eine Episode je Datei: Hintergrund + Eventliste (Dialoge inline) |
| `data/themes/<theme_id>/events/` | Ausgelagerte Event-Konfigurationen, eine Variante pro Lernstufe |
| `data/themes/<theme_id>/{maps,backgrounds,sprites,audio,cards,answers}/` | Assets, siehe `data/_authoring/ASSET_REQUIREMENTS.md` |

Vollständiges Content-Schema (verbindlich): `data/_authoring/JSON_SCHEMA_REFERENCE.md`.
Visuelles Zielbild dazu: `docs/design/README.md`.
