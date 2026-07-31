# Code Map — EduQuest

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
| Main-Hub | `features/main-hub/` | Einstieg, installierte Themenwelten, aktives Profil/Lernstufe |
| Timeline | `features/timeline/` | Episodenübersicht pro Welt, Fortschrittsmarkierung |
| Map | `features/map/` | Interaktive Location-Karte pro Arc |
| Dialog | `features/dialog/` | Speech-Bubble-Engine, zwei Bühnenplätze `left`/`right` |
| Minispiele | `features/minigames/<game_type>/` | Eine Komponente pro `game_type` (`MultipleChoiceComponent` etc.), dynamisch geladen über `ngComponentOutlet` |
| Nutzerverwaltung | `features/auth/`, `features/profile/` | Login, Profile anlegen/wechseln |
| Zentrale Services | `services/game-state.service.ts`, `services/content.service.ts`, `services/savegame.service.ts` | Aktive Welt/Profil/Lernstufe, JSON-Content lesen, Speichern/Laden |

## Backend (`backend/src/`)

Struktur übernommen aus promptigofant (gleiches Muster, eigenes Repo):

| Ordner | Zweck |
|---|---|
| `Controllers/` | HTTP-Endpunkte (Content-API, User-API, Savegame-API) |
| `Services/` | Geschäftslogik (Content lesen, Savegame-Verwaltung, Auth) |
| `Repositories/` | MySQL-Zugriff (users, player_profiles, savegames, achievements, statistics) |
| `Middleware/` | JWT-Auth-Check, o.ä. |
| `Validators/` | Request-Validierung (respect/validation) |
| `Migrations/` | MySQL-Schema-Migrationen |
| `Database/` | Connection/PDO-Setup |
| `Exceptions/` | Domänen-Exceptions |
| `Http/` | Request/Response-Helper |

## Content-Repository (`data/`)

| Ordner | Zweck |
|---|---|
| `data/_authoring/` | LLM-Prompt-Toolkit + Schema-Referenz — kein Runtime-Code |
| `data/themes/<theme_id>/world_config.json` | Lernstufen + alle Maps/Arcs der Welt |
| `data/themes/<theme_id>/episodes/` | Level-Nodes (Hintergrund, Dialog, Minispiel-Referenz) |
| `data/themes/<theme_id>/minigames/` | Minispiel-Payloads, eine Variante pro Lernstufe |
| `data/themes/<theme_id>/{maps,backgrounds,sprites,audio}/` | Assets, siehe `data/_authoring/ASSET_REQUIREMENTS.md` |

Vollständiges Content-Schema (verbindlich): `data/_authoring/JSON_SCHEMA_REFERENCE.md`.
