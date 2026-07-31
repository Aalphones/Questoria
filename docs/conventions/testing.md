# Testing Conventions — EduQuest

## Frontend (`frontend/`)

| Layer | Tool |
|---|---|
| Unit/Component | Vitest (Angular's current direction, siehe `angular.md`) |
| E2E | noch nicht entschieden — erst ab Meilenstein 3/4 relevant (Dialog- + Minispiel-Flows testbar) |

```bash
npm test
```

## Backend (`backend/`)

| Layer | Tool |
|---|---|
| Unit/Integration | PHPUnit (`Tests\` → `tests/`, siehe `php.md`) |

```bash
composer test
```

## Content-Schema

Kein automatisierter Test im MVP — die Checkliste in
`data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 6 ist der manuelle
Ersatz, bis eine Validierungs-Engine existiert (bewusst außerhalb MVP-Scope).

## Kein Test-Zwang für Kleinkram (privates Projekt)

Passend zum Ein-Personen-Projekt (`docs/PROJECT.md` → Constraints): Tests
für Kernlogik (Content-Parsing, Lernstufen-Filterung,
Savegame-Merge-Logik, Auth), aber kein Coverage-Ziel und kein Test-Zwang
für triviale UI-Komponenten.

## Critical Rules

1. **Content-Parsing- und Lernstufen-Filter-Logik brauchen Unit-Tests** — ein stiller Parsing-Fehler zeigt sich sonst erst als leeres Minispiel beim Kind am Bildschirm, nicht als roter Test.
