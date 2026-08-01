# Code Map — Questoria

Feature → Ordner, grob gehalten (kein Zeilen-Tracking — das veraltet sofort
und lügt dann). Ziel: „wo ist Feature X" wird ein Read statt N Greps.

## Namensschema (Layer-übergreifend)

Ein Feature heißt in jedem Layer gleich (snake_case im Content, kebab-case
im Frontend-Ordnernamen, PascalCase in PHP-Klassen):

| Layer | Muster | Beispiel |
|---|---|---|
| Angular Feature | `frontend/src/app/features/<feature>/` | `features/main-hub/`, `features/timeline/` |
| Angular Service | `frontend/src/app/services/<name>.service.ts` | `services/game-state.service.ts` |
| Angular Shared UI | `frontend/src/app/ui/<name>/` | `ui/speech-bubble/` |
| PHP Controller | `backend/src/Controllers/<Name>Controller.php` | `Controllers/SavegameController.php` |
| PHP Service | `backend/src/Services/<Name>Service.php` | `Services/ContentService.php` |
| PHP Repository | `backend/src/Repositories/<Name>Repository.php` | `Repositories/ProfileRepository.php` |
| Content-Welt | `data/themes/<theme_id>/` | `data/themes/one_piece_sachkunde/` |

## Frontend (`frontend/src/app/`)

| Feature | Ordner | Zweck |
|---|---|---|
| Main-Hub | `features/main-hub/` | Einstieg, Planetenkarte mit installierten Themenwelten, Lernstufen-Auswahl |
| Timeline | `features/timeline/` | Etappenkarte pro Welt, Fortschrittsmarkierung mit Sternen |
| Map | `features/map/` | Interaktive Ortskarte pro Arc |
| Dialog | `features/dialog/` | Speech-Bubble-Engine, zwei Bühnenplätze `left`/`right` |
| Minispiele | `features/minigames/<game_type>/` | Eine Komponente pro `game_type` (`MultipleChoiceComponent` etc.), dynamisch geladen über `ngComponentOutlet` |
| Ergebnis | `features/result/` | Sterne, Statistiken, Erfolge, Banner für die neu gewonnene Sammelkarte |
| Sammelkarten | `features/cards/`, `features/cards/print/` | Trophäenhalle (Gruppen, Filter, Detail, Druckauswahl) und A4-Druckbogen |
| Nutzerverwaltung | `features/auth/`, `features/profile/` | Login, Profile anlegen/wechseln |
| Gemeinsame UI | `ui/hud/`, `ui/speech-bubble/` | Kopfleiste auf allen Spiel-Screens, Sprechblasen |
| Zentrale Services | `services/game-state.service.ts`, `services/content.service.ts`, `services/savegame.service.ts`, `services/narration.service.ts` | Aktive Welt/Profil/Lernstufe, JSON-Content lesen, Speichern/Laden, Vorlesemodus + Sprachausgabe |
| Content-Typen | `models/` | TypeScript-Abbild des JSON-Schemas (`content.types.ts`) und der Ladezustände (`game-state.types.ts`) |
| Design-Tokens | `frontend/src/styles/` | `_tokens.scss` (Farben, Schrift, Abstände, Radien) und `_fonts.scss`; global über `src/styles.scss` eingebunden |
| Statischer Content | `frontend/public/assets/`, `frontend/public/data/themes/` | `main_hub.json` und die Entwickler-Testwelt — bis die Content-API existiert (ADR-001) |

**Ist-Stand:** gebaut sind bisher `features/main-hub/` (mit `theme-card/` und
`difficulty-picker/`), `services/`, `models/` und `styles/`. Alle übrigen Zeilen
sind Soll-Zustand für spätere Meilensteine.

## Backend (`backend/src/`)

Struktur übernommen aus promptigofant (gleiches Muster, eigenes Repo):

| Ordner | Zweck |
|---|---|
| `Controllers/` | HTTP-Endpunkte (Content-API, User-API, Savegame-API) |
| `Services/` | Geschäftslogik (Content lesen, Savegame-Verwaltung, Auth) |
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
`Migrations/` (7 Tabellen-DDLs unter `sql/`, `MigrationRunner.php`, plus
`backend/bin/migrate.php` als CLI-Hülle für den Fall eines späteren lokalen/
Fernzugriff-Tests) und der Einstiegspunkt. Fehlende Migrationen werden bei
jedem echten API-Aufruf automatisch nachgezogen (`AutoMigrator`, verdrahtet in
`public/index.php`, Not-Aus über `AUTO_MIGRATE` in `.env`) — `MigrateController`
bleibt zusätzlich als manuell aufrufbares Debug-Werkzeug. `Services/`,
`Repositories/` und `Validators/` sind Soll-Zustand für spätere Meilensteine
und existieren noch nicht als Ordner.

## Projektstamm

| Datei / Ordner | Zweck |
|---|---|
| `deploy.cmd` | Bringt Backend und Frontend auf den Server (Ziel wählbar: `backend`, `frontend`, ohne Angabe beides) |
| `deploy.env.example` | Vorlage für die Zugangsdaten; die echte `deploy.env` liegt nicht im Git |
| `api-bridge/` | Die drei Dateien, die im ausgelieferten Bereich stehen und auf das Backend daneben zeigen ([ADR-003](decisions/003-backend-ausserhalb-des-webbereichs.md)). Landen auf dem Server unter `public/api/` |
| `frontend/proxy.conf.json` | Leitet `/api` beim lokalen Entwickeln an `questoria.info` weiter — so laufen die Aufrufe im Code relativ, lokal wie in Betrieb |

## Content-Repository (`data/`)

| Ordner | Zweck |
|---|---|
| `data/_authoring/` | LLM-Prompt-Toolkit + Schema-Referenz — kein Runtime-Code |
| `data/themes/<theme_id>/world_config.json` | Lernstufen, Etappenkarte, Ortskarten mit Node-Koordinaten |
| `data/themes/<theme_id>/cards.json` | Kartenformat + alle Sammelkarten der Welt |
| `data/themes/<theme_id>/episodes/` | Level-Nodes (Hintergrund, Dialog, Minispiel-Referenz, Belohnungskarte) |
| `data/themes/<theme_id>/minigames/` | Minispiel-Payloads, eine Variante pro Lernstufe |
| `data/themes/<theme_id>/{maps,backgrounds,sprites,audio,cards,answers}/` | Assets, siehe `data/_authoring/ASSET_REQUIREMENTS.md` |

Vollständiges Content-Schema (verbindlich): `data/_authoring/JSON_SCHEMA_REFERENCE.md`.
Visuelles Zielbild dazu: `docs/design/README.md`.
