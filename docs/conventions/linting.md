# Linting Conventions — EduQuest

## Frontend (`frontend/`)

| Tool | Zweck |
|---|---|
| ESLint (Angular ESLint config) | TS/HTML-Lint |
| Prettier | Formatierung |

```bash
npm run lint
npm run format
```

## Backend (`backend/`)

| Tool | Zweck |
|---|---|
| `friendsofphp/php-cs-fixer` | Code-Style (`@PSR12` + Projekt-Regeln, siehe `docs/conventions/php.md`) |

```bash
composer lint          # --dry-run --diff
composer lint:fix       # ohne --dry-run
```

## Content (`data/themes/`)

Kein klassischer Linter — die Schema-Checkliste in
`data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 6 übernimmt diese Rolle
manuell, bis eine Validierungs-Engine existiert (bewusst außerhalb MVP-Scope,
siehe `docs/PROJECT.md`).

## Critical Rules

1. **Lint läuft vor jedem Commit, nicht danach** — CI ist das Netz, nicht der Ersatz für den lokalen Lauf.
