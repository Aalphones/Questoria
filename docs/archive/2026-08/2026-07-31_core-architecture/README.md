# Plan: Core Architecture (Meilenstein 1)

Deckt genau Meilenstein 1 aus [docs/PROJECT.md](../../PROJECT.md) ab: Angular-Scaffold
mit Main-Hub + Lernstufen-Filterung, PHP-Backend-Grundgerüst, MySQL-Schema.
Kein Content-API-Wiring zwischen Frontend und Backend in diesem Plan — das ist
Meilenstein 2 ("Timeline & Map", eigener späterer Plan).

## Overview

| Phase | Thema | Rating | Status |
|---|---|---|---|
| 1 | Frontend-Scaffold: Angular-Projekt, `GameStateService`, Main-Hub mit Lernstufen-Filterung | standard | complete |
| 2 | Backend-Scaffold: Composer-Projekt, FastRoute, JWT-Middleware-Skelett, Herkunftssperre, Health-Endpoint, Hochlade-Skript | heikel | complete — live auf questoria.info |
| 3 | MySQL-Schema: 6 Tabellen + Migrations-Runner | standard | complete — live verifiziert |

## Kontrakt (cross-modul, Phase 1 ↔ Phase 2/3)

**In diesem Plan gibt es noch keine echte HTTP-Verbindung zwischen Frontend und
Backend** — das ist eine bewusste Scope-Grenze, kein Versehen (siehe ADR-001).
Trotzdem legen die Phasen bereits die Datenverträge fest, die Meilenstein 2
übernehmen wird:

- **Content-Delivery (Phase 1):** Das Frontend liest `main_hub.json` und
  `world_config.json` **direkt als statische Dateien** aus dem eigenen Build
  (`frontend/public/`), nicht über eine API. Details + Begründung: ADR-001
  (`docs/decisions/001-content-delivery-mvp-phase1.md`).
  **Korrektur aus der Umsetzung:** Der ursprünglich geplante Build-Schritt,
  der `data/themes/` aus dem Repository-Wurzelverzeichnis in den Build
  kopiert, ist nicht möglich — der Angular-Build lehnt Asset-Quellen
  außerhalb des Projektordners ab. Es liegt daher **alles** unter
  `frontend/public/`; echter Content kommt mit der Content-API.
- **Backend-Health-Contract (Phase 2):** `GET /api/health` → `200
  {"status":"ok","php_version":"…","db_connected":true|false}` — das einzige
  Endpoint in diesem Plan, dient als Rauchtest für
  Composer/FastRoute/Datenbankverbindung, keine Business-Logik dahinter.
  **Erweitert am 2026-08-01:** ursprünglich war nur `{"status":"ok"}` geplant.
  Da das Backend auf dem Strato-Paket läuft und es dort keinen
  Kommandozeilenzugang gibt, ist diese Antwort die einzige Möglichkeit, PHP-
  Version und Datenbank-Zugangsdaten von außen zu prüfen. `db_connected: false`
  ist ein gültiges Ergebnis, kein Fehler der Auskunft.
- **Betriebsmodell (ab Phase 2):** Backend läuft auf dem Strato-Paket, Frontend
  wird lokal entwickelt und spricht gegen die dort laufende API. Gebaut wird
  lokal (PHP 8.2.31 + Composer 2.10.2 auf dieser Maschine), hochgeladen per
  `deploy.cmd` — der Server hat weder Kommandozeile noch Composer. Daraus
  folgen eine Herkunftssperre (CORS), Zugriffsregeln per `.htaccess` und das
  Hochlade-Skript, alle drei nicht im Ursprungsplan.
  Begründung: [ADR-002](../../decisions/002-php-stack-und-betrieb.md).
- **DB-Schema (Phase 3):** legt die Tabellen fest, die Meilenstein 4
  (Nutzerverwaltung/Savegames) über Repositories anspricht. Keine
  Repository-Klassen in diesem Plan — nur das Schema selbst.

## Finale Akzeptanzkriterien (gesamter Plan)

1. `cd frontend && npm ci && npm run build` läuft grün; `npm start` zeigt die
   Main-Hub mit mind. einer Themenwelt-Karte, Auswahl einer Lernstufe setzt
   sichtbar eine Bestätigung ("Ausgewählt: ...").
2. `cd backend && composer install && composer lint` laufen grün;
   `php -S localhost:8000 -t public` beantwortet `GET /api/health` mit `200`
   und einem Rumpf, der `status`, `php_version` und `db_connected` enthält.
3. Das Schema aus Phase 3 wird in einer leeren MySQL-Datenbank ohne Fehler
   angelegt, ein zweiter Lauf ist idempotent (keine Doppel-Anwendung).
   **Geklärt in Phase 3:** Fernzugriff auf die entfernte MySQL scheitert
   (lokaler Verbindungsversuch lief nach 5s in einen Timeout) — der Runner
   läuft daher serverseitig, nicht per CLI. Zwei Wege dorthin: automatisch bei
   jedem echten API-Aufruf (`AutoMigrator`, mit DB-Lock gegen Doppellauf und
   `AUTO_MIGRATE`-Not-Aus in `.env`) und manuell über den tokengeschützten
   `POST /api/migrate` (gleiches Muster wie `diag.php`) als Debug-Werkzeug.
4. `docs/code-map.md` und `AGENTS.md` spiegeln die neu entstandene
   Ordnerstruktur (kein Stub-Text mehr in `frontend/README.md` /
   `backend/README.md`).

## Konfidenz-Ausweis

- ✅ **Versionen geprüft (2026-08-01).** Node 26.4.0, npm 11.17.0. PHP war auf
  dieser Maschine gar nicht vorhanden und wurde nachinstalliert: PHP 8.2.31
  (ohne Threads) plus Composer 2.10.2, beide unter
  `C:\Users\sasch\develop\.tools\` — **nicht** im Suchpfad des Benutzers
  (Korrektur zur ursprünglichen Notiz „`C:\Tools\...`, dauerhaft im Suchpfad" —
  das stimmte zum Zeitpunkt dieser Zeile nicht mehr; Phase 3 hat direkt über
  den vollen Pfad bzw. `.tools\php.cmd` / `.tools\composer.cmd` gearbeitet).
  Bewusst 8.2 und nicht neuer: die Abhängigkeiten werden damit gegen die
  Untergrenze aufgelöst, die das Projekt zusagt — was so entsteht, läuft auch
  auf einem Server mit 8.3 oder höher.
- 🟡 **MySQL gibt es lokal nicht und soll es auch nicht geben.** Die Datenbank
  lebt auf dem Strato-Paket; eine zweite lokale wäre eine zweite Wahrheit, die
  niemand pflegt. Folge: `db_connected` ist bei einem lokalen Start erwartbar
  `false`, und Phase 3 muss klären, wie das Schema ohne Kommandozeile auf den
  Server kommt.
- 🟡 **Angular v20 CLI-Verhalten (Standalone-Default, neue Dateibenennung ohne
  `.component.`-Infix) ungeprüft an dieser Maschine** — Check: nach `ng new`
  in Phase 1 einmal `ng generate component features/main-hub/theme-card
  --skip-tests --dry-run` laufen lassen und die erzeugten Dateinamen gegen
  `docs/conventions/angular.md` abgleichen, bevor der Rest der Phase darauf
  aufbaut.

## Follow-ups (nicht Teil dieses Plans)

- Content-API + echtes Frontend↔Backend-Wiring → Meilenstein 2
- Etappen-/Ortskarte mit Prozent-Koordinaten → Meilenstein 2
- Repository-Klassen auf dem Phase-3-Schema → Meilenstein 4
- Vorlesemodus (Umschalter, Sprachausgabe, Bildantworten) → Meilenstein 3 + 4
- Sammelkarten, Trophäenhalle und Druckbogen → Meilenstein 5 (eigener Plan)
- Reale Theme-Assets (Cover, Sprites, Kartenbilder) → sobald ein Content-Autoring-Durchlauf ansteht

Die Datenbank-Tabellen aus Phase 3 tragen bereits, was die späteren
Meilensteine brauchen — Kartenbesitz und Moduseinstellung sind Spielstand,
kein Content. Beim Umsetzen von Phase 3 gegen `docs/PROJECT.md` gegenprüfen,
ob das Schema beides abdeckt.

## Summary

Meilenstein 1 fertig: Angular-Frontend mit Main-Hub und Lernstufen-Auswahl,
PHP-Backend live auf questoria.info (Health-Endpoint, Herkunftssperre,
Hochlade-Skript), 7-Tabellen-MySQL-Schema mit automatischem
Migrations-Nachzug bei jedem echten API-Aufruf. Kein HTTP-Wiring zwischen
Frontend und Backend — bewusste Grenze, kommt mit Meilenstein 2.

## Files touched

- `frontend/` — komplettes Angular-Scaffold (`app/`, `features/main-hub/`,
  `services/`, `models/`, `styles/`), Konfiguration (`angular.json`,
  `eslint.config.js`, `.prettierrc`), statischer Dev-Content unter `public/`.
- `backend/` — Composer-Projekt (`src/Controllers`, `Database`, `Middleware`,
  `Exceptions`, `Http`, `Migrations` inkl. `sql/`, `bin/migrate.php`),
  Einstiegspunkt `public/index.php`, `.htaccess`.
- `api-bridge/` — die drei Dateien im ausgelieferten Bereich (`index.php`,
  `diag.php`, `.htaccess`).
- Projektstamm — `deploy.cmd` + `deploy.env.example`, `.github/workflows/ci.yml`,
  `.gitattributes`.
- Doku — `docs/PROJECT.md`, `docs/code-map.md`, `docs/conventions/{css,php}.md`,
  drei ADRs unter `docs/decisions/`, `AGENTS.md`.

## Commits

- `ed19a41` feat(frontend): Angular-Scaffold mit Startbildschirm und Lernstufen-Auswahl
- `bd01da8` feat(backend): REST-API-Gerüst mit Health-Endpoint und Hochlade-Skript
- `17055da` feat(backend): Backend live auf questoria.info, Programmcode außerhalb des Webbereichs
- `5f68f9f` feat(backend): MySQL-Schema mit tokengeschütztem Migrations-Endpoint
- `5b8ee44` feat(backend): Migrationen automatisch bei jedem Request nachziehen
- `1dc0105` fix(backend): Migrationslauf brach nach je einer Datei ab
- `d4d03a2` docs: Phase 3 als live verifiziert abschließen

## Deviations from plan

- **Phase 3, Migrations-Weg:** Ursprünglich als CLI-Skript geplant. Fernzugriff
  auf die entfernte MySQL erwies sich als blockiert (gemessener 5s-Timeout),
  Kommandozeile auf dem Server gibt es nicht — der Runner läuft stattdessen
  über einen tokengeschützten Endpoint und, auf expliziten Nutzerwunsch
  danach, zusätzlich automatisch bei jedem echten API-Aufruf (`AutoMigrator`).
  Nicht im Ursprungsplan.
- **Zwei während der Umsetzung gefundene Bugs, beide gefixt:** kein
  Verbindungs-Timeout in `Connection.php` (hätte bei toter DB PHPs
  Ausführungslimit reißen können) und eine PDO-Transaktion um `CREATE TABLE`,
  die MySQLs impliziten DDL-Commit ignorierte und jeden Migrationslauf nach
  einer Datei abbrechen ließ (live auf Produktion beobachtet, per Server-Log
  aufgedeckt, nicht durch einen offensichtlichen Fehlerbildschirm).
- **Content-Kopierschritt (Phase 1) entfällt:** siehe Kontrakt-Abschnitt oben
  (Angular-Build akzeptiert keine Asset-Quellen außerhalb des Projektordners).
- **`frontend/README.md` wurde in Phase 1 entfernt, nie neu befüllt** — AK 4
  erwartet echten Inhalt statt Stub-Text; aktuell fehlt die Datei ganz. Nicht
  in dieser Session nachgezogen, siehe Follow-ups.

## Follow-ups (offen nach Archivierung)

- `frontend/README.md` fehlt komplett — nachträglich befüllen (siehe Deviations).
- AK 1 (Frontend-Build/Main-Hub) wurde in dieser Session nicht erneut geprüft —
  vor dem nächsten Meilenstein einmal smoke-testen.
- Direkte Einsicht ins Live-Schema (z. B. per phpMyAdmin) steht aus — die
  Foreign-Key-Prüfung aus AK 3 ist nur indirekt über das fehlerfreie
  Server-Log belegt, nicht per `SHOW CREATE TABLE` eingesehen.
