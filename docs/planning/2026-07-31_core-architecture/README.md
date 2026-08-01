# Plan: Core Architecture (Meilenstein 1)

Deckt genau Meilenstein 1 aus [docs/PROJECT.md](../../PROJECT.md) ab: Angular-Scaffold
mit Main-Hub + Lernstufen-Filterung, PHP-Backend-Grundgerüst, MySQL-Schema.
Kein Content-API-Wiring zwischen Frontend und Backend in diesem Plan — das ist
Meilenstein 2 ("Timeline & Map", eigener späterer Plan).

## Overview

| Phase | Thema | Rating | Status |
|---|---|---|---|
| 1 | Frontend-Scaffold: Angular-Projekt, `GameStateService`, Main-Hub mit Lernstufen-Filterung | standard | pending |
| 2 | Backend-Scaffold: Composer-Projekt, FastRoute, JWT-Middleware-Skelett, Health-Endpoint | heikel | pending |
| 3 | MySQL-Schema: 6 Tabellen + Migrations-Runner | standard | pending |

## Kontrakt (cross-modul, Phase 1 ↔ Phase 2/3)

**In diesem Plan gibt es noch keine echte HTTP-Verbindung zwischen Frontend und
Backend** — das ist eine bewusste Scope-Grenze, kein Versehen (siehe ADR-001).
Trotzdem legen die Phasen bereits die Datenverträge fest, die Meilenstein 2
übernehmen wird:

- **Content-Delivery (Phase 1):** Das Frontend liest `main_hub.json` und
  `world_config.json` **direkt als statische Dateien** aus dem eigenen Build
  (`frontend/public/`), nicht über eine API. Details + Begründung: ADR-001
  (`docs/decisions/001-content-delivery-mvp-phase1.md`, entsteht in Phase 1).
- **Backend-Health-Contract (Phase 2):** `GET /api/health` → `200
  {"status":"ok"}` — das einzige Endpoint in diesem Plan, dient als Rauchtest
  für Composer/FastRoute/Datenbankverbindung, keine Business-Logik dahinter.
- **DB-Schema (Phase 3):** legt die Tabellen fest, die Meilenstein 4
  (Nutzerverwaltung/Savegames) über Repositories anspricht. Keine
  Repository-Klassen in diesem Plan — nur das Schema selbst.

## Finale Akzeptanzkriterien (gesamter Plan)

1. `cd frontend && npm ci && npm run build` läuft grün; `npm start` zeigt die
   Main-Hub mit mind. einer Themenwelt-Karte, Auswahl einer Lernstufe setzt
   sichtbar eine Bestätigung ("Ausgewählt: ...").
2. `cd backend && composer install && composer lint` laufen grün;
   `php -S localhost:8000 -t public` beantwortet
   `GET /api/health` mit `200 {"status":"ok"}`.
3. `php backend/bin/migrate.php` legt alle 6 Tabellen aus Phase 3 in einer
   leeren MySQL-Datenbank an, ohne Fehler, zweiter Lauf ist idempotent
   (keine Doppel-Anwendung).
4. `docs/code-map.md` und `AGENTS.md` spiegeln die neu entstandene
   Ordnerstruktur (kein Stub-Text mehr in `frontend/README.md` /
   `backend/README.md`).

## Konfidenz-Ausweis

- 🟡 **Node-/PHP-/MySQL-Versionen auf dieser Maschine ungeprüft** — der Plan
  geht von Node 22 (CI-Pin) und PHP 8.2+ (lokal installiert, siehe
  `docs/PROJECT.md`) aus. Check: `node -v` und `php -v` vor Phase 1 bzw. 2
  laufen lassen; weicht was ab, Versionsangaben in den Phasen-Dateien
  anpassen, bevor gebaut wird.
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
*(beim Archivieren befüllen)*

## Files touched
*(beim Archivieren befüllen)*

## Commits
*(beim Archivieren befüllen)*

## Deviations from plan
*(beim Archivieren befüllen)*
