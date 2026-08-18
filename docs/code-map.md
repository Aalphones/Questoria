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
| Main-Hub | `features/main-hub/` | Zwei Screens: Planetenkarte (Welten als Knoten auf der Kartenfläche, `theme-card/` als Weltknoten, Info-Panel mit „Weiterspielen", Erfolge-Panel mit allen Erfolgen aller installierten Welten) und `level-select/` mit der Lernstufen-Auswahl (`difficulty-picker/`) |
| Timeline | `features/timeline/` | Etappenkarte pro Welt, Fortschrittsmarkierung mit Sternen |
| Map | `features/map/` | Interaktive Ortskarte pro Arc — Orte als Punkte, Routen, Kompassrose |
| Event Engine | `features/episode/` | Spielt die Eventliste einer Episode ab: Ablauf-Gerüst (`episode.ts`), Laufzustand (`episode-run.ts`), Event Loader + Typ-Prüfungen (`event-type-map.ts`), Auflösung ausgelagerter Konfigurationen (`resolve-event-config.ts`), Ergebnis-Einsammlung, Wiedereinstiegs-Frage nach Abbruch (`resume-prompt/`). Kein `@switch` über Eventtypen |
| Event-Komponenten | `features/events/<type>/` | Eine Komponente pro Eventtyp (`features/events/dialog/`, `features/events/multiple-choice/`, ...), dynamisch geladen über `ngComponentOutlet` |
| Ergebnis | `features/result/` | Sterne, Statistiken, Erfolge, Banner für die neu gewonnene Sammelkarte |
| Sammelkarten | `features/cards/`, `features/cards/print/` | Trophäenhalle (Gruppen, Filter, Detail, Druckauswahl) und A4-Druckbogen |
| Nutzerverwaltung | `features/auth/`, `features/profile/` | Anmeldebildschirm (`features/auth/login.ts`), Profilauswahl mit Anlegen/Löschen (`features/profile/profile.ts`, nach Prototyp-Screen `login`) |
| Kartenfläche | `ui/map-canvas/` | Gemeinsames Bauteil von Planeten-, Etappen- und Ortskarte: Fläche im Seitenverhältnis 16:9, Hintergrund, Routenlinien; `map-point/` setzt ein beliebiges Kind auf eine Prozent-Position |
| Bildfläche | `ui/image-slot/` | Bild mit beschriftetem Platzhalter, wenn die Datei fehlt |
| Aufgaben-Hülle | `ui/task-card/` | Gemeinsame Karte aller Aufgaben-Typen: Aufgaben-Tag, Fortschrittspunkte, Frage mit Vorlese-Knopf (und automatischem Vorlesen), Platz für Aufgabenkörper und Feedback-Leiste |
| Gemeinsame UI | `ui/hud/`, `ui/content-error/`, `ui/speech-bubble/`, `ui/read-aloud-button/` | Kopfleiste auf allen Spiel-Screens (jeder Screen bindet sie selbst ein, trägt jetzt auch Modus-Umschalter + Ton-Knopf); Meldung bei fehlgeschlagener Welt/Ort-Ladung mit Weg zurück; Sprechblasen; runder Knopf „Nochmal vorlesen" |
| Routing | `routing/` | `world-config.resolver.ts` lädt die Welt-Konfiguration zentral für jede `theme/:themeId/…`-Route, setzt die aktive Welt und schreibt sie bei echtem Wechsel ins aktive Profil; `difficulty-chosen.guard.ts` schickt ohne gewählte Lernstufe auf die Lernstufen-Auswahl zurück; `profile-chosen.guard.ts` schickt ohne aktives Profil auf `/profiles` zurück (wartet dafür einmal auf `ProfileService.ensureLoaded()`); `auth.guard.ts` schickt ohne Sitzung auf `/login` (wartet dafür einmal auf `AuthService.restoreSession()`); `session-expired.interceptor.ts` fängt ein `401` aus jedem Aufruf ab und schickt ebenfalls auf `/login` |
| Zentrale Services | `services/game-state.service.ts`, `services/content.service.ts`, `services/progress.service.ts`, `services/progress.rules.ts`, `services/run-store.service.ts`, `services/savegame.service.ts`, `services/achievement.service.ts`, `services/achievement.rules.ts`, `services/narration.service.ts`, `services/auth.service.ts`, `services/profile.service.ts`, `services/legacy-progress-import.ts` | Aktive Welt/Profil-ID/Lernstufe (Profil-ID im Browser-Speicher, überlebt Neuladen), JSON-Content lesen, Fortschritt aus dem Spielstand des Profils + Freischaltregeln als reine Funktionen (ADR-009 löst ADR-006 ab), der eine angefangene Lauf im Spielstand derselben Welt, Speichern/Laden mit Puffer im Browser, einmalige Übernahme des alten Browser-Stands, erreichte Erfolge mit demselben Puffer + Auswertung der Content-Bedingungen als reine Funktionen (ADR-010), Vorlesemodus + Sprachausgabe, angemeldeter Benutzer (Sitzung selbst bleibt im HttpOnly-Cookie), Profilliste des Accounts (laden, anlegen, ändern, löschen, wählen). **`ContentService` ist die einzige Ladestelle für Content** — dort hängt später der Offline-Cache (Meilenstein 6) |
| Content-Typen | `models/` | TypeScript-Abbild des JSON-Schemas (`content.types.ts`), der Ladezustände (`game-state.types.ts`) und der Anmeldung/Profile (`auth.types.ts`) |
| Design-Tokens | `frontend/src/styles/` | `_tokens.scss` (Farben, Schrift, Abstände, Radien, Kartenmaße), `_fonts.scss` und `_motion.scss` (Bildfolgen, die mehrere Komponenten teilen); global über `src/styles.scss` eingebunden |

**Ist-Stand:** gebaut sind bisher `features/main-hub/` (echte Planetenkarte:
Weltknoten aus `theme-card/`, Routen, Info-Panel; dazu der eigene Screen
`level-select/` mit `difficulty-picker/`), `features/timeline/`
(echte Etappenkarte: Inseln, Panel, Legende, Fortschritt-zurücksetzen-Dialog),
`features/map/` (echte Ortskarte: Punkte, Routen, Kompassrose), `features/episode/`
(Ablauf-Gerüst mit Event Loader, echter Sternenformel in `star-rules.ts` und
Ergebnis-Screen nach dem letzten Event; löst ausgelagerte Konfigurationen über
`config.ref` auf), `features/events/dialog/` (Visual-Novel-Bühne mit zwei
Plätzen), `features/events/multiple-choice/` (Quiz mit Weiterraten),
`features/events/text-input/` (Texteingabe mit Weiterraten),
`features/events/image-search/` (Bildsuche mit Fehlgriff-Zählung, Ziele auch per Tastatur erreichbar),
`features/events/reward/` (Belohnungs-Moment mit Sternen; merkt `card_id` für
Meilenstein 5, vergibt noch keine Sammelkarte), `features/result/` (Sterne,
zwei Statistik-Karten aus dem Lauf, Erfolgs-Pillen für neu freigeschaltete
Erfolge — noch kein Karten-Banner), `ui/map-canvas/`, `ui/image-slot/`, `ui/task-card/`,
`ui/hud/` (inkl. Modus-Umschalter + Ton-Knopf), `ui/content-error/`,
`ui/read-aloud-button/`, `services/narration.service.ts`, `features/auth/`
(Anmeldebildschirm, `services/auth.service.ts`, `routing/auth.guard.ts`,
`routing/session-expired.interceptor.ts`), `features/profile/`
(Profilauswahl mit Anlegen/Löschen, `services/profile.service.ts`,
`routing/profile-chosen.guard.ts`), `routing/`,
`services/`, `models/` und `styles/`. Alle übrigen Zeilen sind Soll-Zustand
für spätere Meilensteine.

### Routen (Frontend)

| Adresse | Screen |
|---|---|
| `login` | Anmeldebildschirm (`features/auth/login.ts`), ohne Wächter |
| `profiles` | Profilauswahl (`features/profile/profile.ts`), nur `authGuard` |
| `` (leer) | Planetenkarte (`features/main-hub/`) |
| `theme/:themeId/level` | Lernstufen-Auswahl (`features/main-hub/level-select/`) |
| `theme/:themeId/timeline` | Etappenkarte (`features/timeline/`) |
| `theme/:themeId/map/:mapId` | Ortskarte (`features/map/`) |
| `theme/:themeId/episode/:episodeId` | Episode, spielt die Eventliste ab (`features/episode/`) |

Alle Routen außer `login` und `profiles` verlangen `authGuard` **und**
`profileChosenGuard`; die vier `theme/…`-Routen laden zusätzlich die
Welt-Konfiguration über `worldConfigResolver`, alle außer der
Lernstufen-Route zusätzlich `difficultyChosenGuard`.

## Backend (`backend/src/`)

Struktur übernommen aus promptigofant (gleiches Muster, eigenes Repo):

| Ordner | Zweck |
|---|---|
| `Controllers/` | HTTP-Endpunkte (Content-API, User-API, Savegame-API) |
| `Services/` | Geschäftslogik. `ContentService` liest `data/` (Wurzel: `CONTENT_PATH` oder `DOCUMENT_ROOT/content`) — Welt, Episode und ausgelagerte Event-Datei; `ContentFileService` liefert aus derselben Wurzel die Dateien selbst aus (Bilder, Töne) samt Pfadprüfung und Zwischenspeicher-Köpfen; `AuthService` prüft Anmeldedaten und Sitzungs-Token. Spielstände und Erfolge brauchen keinen Dienst — sie gehen ungelesen durch Controller und Repository (ADR-009, ADR-010) |
| `Repositories/` | MySQL-Zugriff (users, player_profiles, savegames, player_achievements, statistics) |
| `Middleware/` | Herkunftssperre (`CorsMiddleware`) und Anmelde-Token (`JwtAuthMiddleware`) |
| `Validators/` | Request-Validierung (respect/validation) |
| `Migrations/` | MySQL-Schema-Migrationen |
| `Database/` | Connection/PDO-Setup |
| `Exceptions/` | Domänen-Exceptions |
| `Http/` | Request/Response-Helper |
| `public/` | Einstiegspunkt `index.php` + `.htaccess`; dazu `content-gate.php`, die Weiche vor `/content/**` (prüft dasselbe Sitzungs-Cookie, ohne Datenbank-Blick — ADR-008). Das ist die Web-Wurzel auf dem Server |

**Ist-Stand:** gebaut sind `Http/` (`JsonResponse.php`, `RequestBody.php` als
JSON-Leser für den Anfragekörper, `SessionCookie.php` für das Sitzungs-Cookie
`qst_session`), `Exceptions/`, `Database/`, `Middleware/`,
`Controllers/HealthController.php`, `Controllers/MigrateController.php`,
`Controllers/ContentController.php`, `Controllers/AuthController.php`,
`Controllers/SetupController.php`, `Controllers/ProfileController.php`,
`Controllers/SavegameController.php`, `Controllers/AchievementController.php`,
`Services/ContentService.php`,
`Services/ContentFileService.php`, `Services/AuthService.php`,
`Repositories/UserRepository.php`, `Repositories/ProfileRepository.php`,
`Repositories/SavegameRepository.php`, `Repositories/AchievementRepository.php`,
`Validators/LoginValidator.php`,
`Validators/CreateUserValidator.php`, `Validators/ProfileValidator.php`,
`Validators/SavegameValidator.php`, `Validators/AchievementValidator.php`,
`Migrations/` (6 Tabellen in 10 Schritten unter `sql/`, `MigrationRunner.php`, plus
`backend/bin/migrate.php` als CLI-Hülle für den Fall eines späteren lokalen/
Fernzugriff-Tests) und der Einstiegspunkt. `backend/bin/create-user.php` legt
einen Account an (dieselbe Einschränkung wie `migrate.php`: braucht eine
Datenbankverbindung von außen). Fehlende Migrationen werden bei
jedem echten API-Aufruf automatisch nachgezogen (`AutoMigrator`, verdrahtet in
`public/index.php`, Not-Aus über `AUTO_MIGRATE` in `.env`) — `MigrateController`
bleibt zusätzlich als manuell aufrufbares Debug-Werkzeug. Der Sitzungs-Schutz
sitzt in `public/index.php` zwischen Routen-Treffer und Controller-Aufruf; die
Liste der ohne Anmeldung erreichbaren Routen steht dort als Konstante
`OPEN_ROUTES`. `SetupController` legt über `POST /api/setup/user` einen Account
an — der einzige Weg zum **ersten**, weil die Datenbank des Pakets von außen
nicht erreichbar ist; geschützt über den eigenen Kopf `X-Setup-Token`, ohne den
er sich wie ein nicht existierender Pfad verhält. Die übrigen Repository- und Validator-Klassen sind Soll-Zustand
für spätere Phasen.

## Projektstamm

| Datei / Ordner | Zweck |
|---|---|
| `deploy.cmd` | Bringt Backend, Frontend und Content auf den Server (Ziel wählbar: `backend`, `frontend`, `content`, ohne Angabe alle drei) |
| `deploy.env.example` | Vorlage für die Zugangsdaten; die echte `deploy.env` liegt nicht im Git |
| `api-bridge/` | Die Dateien, die im ausgelieferten Bereich stehen und auf das Backend daneben zeigen ([ADR-003](decisions/003-backend-ausserhalb-des-webbereichs.md)): `index.php` (Schnittstelle), `content-gate.php` (Weiche vor den Content-Dateien), `diag.php` (Serverauskunft). Landen auf dem Server unter `public/api/` |
| `backend/serve.cmd` | Startet den lokalen PHP-Entwicklungsserver auf Port 8000 (`backend/dev-router.php` als Weiche: `/content/` durch `public/content-gate.php` — dieselbe Sitzungsprüfung wie auf dem Server —, alles andere durch `public/index.php`) — nur für die Entwicklung, nie deployen |
| `frontend/proxy.conf.json` | Leitet `/api` und `/content` beim lokalen Entwickeln an `localhost:8000` weiter (`backend\serve.cmd`) — so laufen die Aufrufe im Code relativ, lokal wie in Betrieb |

## Content-Repository (`data/`)

| Ordner | Zweck |
|---|---|
| `data/.htaccess` | Schickt auf dem Server jede Anfrage an `/content/**` durch die Weiche `/api/content-gate.php`. Liegt bewusst neben dem Content, weil `deploy.cmd content` diesen Ordner spiegelt und eine Regel von woanders dabei verloren ginge |
| `data/_authoring/` | LLM-Prompt-Toolkit + Schema-Referenz — kein Runtime-Code |
| `data/main_hub.json` | Installierte Welten für die Planetenkarte — ausgeliefert über `GET /api/content/themes` |
| `data/hub/` | Bilder der Planetenkarte (Hintergrund), ausgeliefert über `GET /content/hub/<datei>` |
| `data/themes/<theme_id>/world_config.json` | Lernstufen, Etappenkarte, Ortskarten mit Node-Koordinaten, Erfolgs-Katalog (`achievements[]`, ADR-010) |
| `data/themes/<theme_id>/cards.json` | Kartenformat + alle Sammelkarten der Welt |
| `data/themes/<theme_id>/episodes/` | Eine Episode je Datei: Hintergrund + Eventliste (Dialoge inline) |
| `data/themes/<theme_id>/events/` | Ausgelagerte Event-Konfigurationen, eine Variante pro Lernstufe |
| `data/themes/<theme_id>/{maps,backgrounds,sprites,audio,cards,answers,achievements}/` | Assets, siehe `data/_authoring/ASSET_REQUIREMENTS.md` |

Vollständiges Content-Schema (verbindlich): `data/_authoring/JSON_SCHEMA_REFERENCE.md`.
Visuelles Zielbild dazu: `docs/design/README.md`.
