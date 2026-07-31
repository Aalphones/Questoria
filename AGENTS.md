# EduQuest — Agenten-Hub

Story-basierte Lernplattform: Fandom-Welten (One Piece, Miraculous, ...)
werden zu Lernspielen. Voller Kontext: [docs/PROJECT.md](docs/PROJECT.md).

🚧 Aktive Arbeit → STATE.md *(wird beim ersten Plan angelegt)*

## Stack

| Layer | Wahl |
|---|---|
| Frontend | Angular v20+, Standalone Components, Signals |
| Backend | PHP 8.2+, kein Framework — FastRoute + JWT + phpdotenv + monolog + respect/validation |
| Datenbank | MySQL/MariaDB |
| Content | Statische, versionierte JSON-Dateien unter `data/themes/` |
| Hosting | Shared-Hosting-kompatibel — kein Docker/Cloud |

## Conventions-Index

| Thema | Datei |
|---|---|
| Angular | [docs/conventions/angular.md](docs/conventions/angular.md) |
| TypeScript | [docs/conventions/typescript.md](docs/conventions/typescript.md) |
| PHP | [docs/conventions/php.md](docs/conventions/php.md) |
| Commits | [docs/conventions/commits.md](docs/conventions/commits.md) |
| Linting | [docs/conventions/linting.md](docs/conventions/linting.md) |
| Testing | [docs/conventions/testing.md](docs/conventions/testing.md) |

## Doc-Index

| Datei | Inhalt |
|---|---|
| [docs/PROJECT.md](docs/PROJECT.md) | Ziel, Scope, Nicht-Ziele, Constraints, Meilensteine |
| [docs/glossary.md](docs/glossary.md) | Gemeinsames Vokabular (Themenwelt, Lernstufe, Minispiel, ...) |
| [docs/code-map.md](docs/code-map.md) | Feature → Ordner, Namensschema über alle Layer |
| [docs/decisions/](docs/decisions/) | Architektur-Entscheidungen (ADRs) |
| [docs/planning/](docs/planning/) | Aktive Pläne (Git-Dateien, kein Manager-Tracker für dieses Solo-Projekt) |
| [docs/archive/](docs/archive/) | Abgeschlossene Pläne + Ursprungskonzept |
| [docs/knowledge/INDEX.md](docs/knowledge/INDEX.md) | Projekt-Wissenskatalog |
| `data/_authoring/README.md` | Content-Authoring-Toolkit: JSON-Schema, LLM-Prompt, Asset-Vorgaben, Flux-Prompts |

## Content-Repository

Content (Welten, Episoden, Dialoge, Minispiele) lebt als statische JSON unter
`data/themes/<theme_id>/` — versioniert wie Code, kein Editor im MVP. Das
verbindliche Schema + LLM-Copy-Paste-Prompt liegt unter `data/_authoring/`.
**Jede Engine-Änderung, die das Content-Format betrifft, zieht die vier
Authoring-Toolkit-Dateien im selben Commit mit** — siehe
`data/_authoring/README.md` → „Pflegepflicht".

## Critical Rules

1. **Content ist read-only über die API** — Schreibzugriff auf `data/themes/` gibt es nur per Git-Commit, nie über einen Endpoint.
2. **`game_type` und `difficulty_level` sind geschlossene, dokumentierte Wertemengen** — neue Werte zuerst in `data/_authoring/JSON_SCHEMA_REFERENCE.md`, dann erst im Code.
3. **Zwei Bühnenplätze (`left`/`right`), keine Koordinaten** — das ist eine bewusste Vereinfachung, kein Provisorium, das später "richtig" gebaut wird.
