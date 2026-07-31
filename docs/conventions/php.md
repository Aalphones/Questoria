# PHP Conventions — Questoria

> **Source-of-truth references:**
> - Schwesterprojekt `promptigofant/backend` (gleicher Stack, `.php-cs-fixer.php`, `composer.json`)
> - [PSR-12](https://www.php-fig.org/psr/psr-12/)
>
> Kein `lang-php`-User-Skill vorhanden — dieses File ist die alleinige Quelle
> für PHP-Konventionen in diesem Projekt.

## Stack

| Layer | Choice |
|---|---|
| PHP | 8.2+ |
| Routing | `nikic/fast-route` |
| Auth | `firebase/php-jwt` |
| Config | `vlucas/phpdotenv` |
| Logging | `monolog/monolog` |
| Validation | `respect/validation` |
| Linting | `friendsofphp/php-cs-fixer` (`@PSR12`, `declare_strict_types`, short array syntax, single quotes, ordered imports, trailing comma) |
| Autoload | PSR-4, `App\` → `src/` |
| Tests | PHPUnit (`Tests\` → `tests/`) |

## Library Policy

**Forbidden:**
- Full-stack frameworks (Symfony, Laravel) — Overkill für Shared Hosting + reinen REST-API-Scope

**Allowed:**
- `nikic/fast-route` — Routing
- `firebase/php-jwt` — Stateless Auth für die User-/Savegame-API
- `vlucas/phpdotenv` — `.env`-Konfiguration
- `monolog/monolog` — strukturiertes Logging
- `respect/validation` — Request-Validierung

## Project Layout

```
backend/
├── composer.json
├── .php-cs-fixer.php
├── public/            ← Front-Controller (index.php), Apache/Nginx-Docroot
├── src/
│   ├── Controllers/    ← HTTP-Endpunkte (Content-API, User-API, Savegame-API)
│   ├── Services/        ← Geschäftslogik
│   ├── Repositories/    ← MySQL-Zugriff
│   ├── Middleware/      ← JWT-Auth-Check
│   ├── Validators/      ← respect/validation-Regeln pro Request
│   ├── Migrations/      ← MySQL-Schema
│   ├── Database/        ← PDO-Connection-Setup
│   ├── Exceptions/      ← Domänen-Exceptions
│   └── Http/            ← Request/Response-Helper
└── tests/
```

## Code Style

- `declare(strict_types=1);` in jeder Datei
- Short array syntax (`[]`, nie `array()`)
- Single quotes, außer Interpolation nötig
- Imports alphabetisch sortiert, keine ungenutzten Imports
- Trailing comma in mehrzeiligen Arrays/Argumentlisten
- `php-cs-fixer fix --dry-run --diff` vor jedem Commit (Composer-Script `lint`)

## API-Konventionen

- Content-API ist **read-only** — kein Schreibzugriff auf `data/themes/` über HTTP, Content ändert sich nur per Commit
- Jeder Endpoint validiert Eingaben über `respect/validation`, bevor Business-Logik läuft
- JWT im `Authorization: Bearer`-Header, Ablaufzeit kurz + Refresh-Flow
- Fehlerantworten einheitlich als JSON (`{ "error": { "code": ..., "message": ... } }`), keine rohen PHP-Warnings/Stacktraces nach außen

## Critical Rules

1. **`declare(strict_types=1)` in jeder Datei** — implizite Typkonvertierung ist in einer API mit Kinder-Nutzerdaten kein Ort für Überraschungen.
2. **Content-API bleibt read-only** — jeder Schreibpfad auf `data/themes/` außerhalb von Git ist eine zweite Wahrheitsquelle und ein Bug, kein Feature.
3. **Kein Framework nachträglich reinziehen, um ein Problem zu lösen, das `fast-route` + eine Handvoll Klassen auch lösen** — Shared-Hosting-Kompatibilität ist eine harte Grenze, kein Nice-to-have.
