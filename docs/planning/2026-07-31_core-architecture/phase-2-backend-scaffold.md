# Phase 2: Backend-Scaffold

Rating: **heikel** (JWT/Auth-Skelett ist security-relevant, auch als Stub)

## Kontext (vorher lesen)

- [docs/conventions/php.md](../../conventions/php.md) — Stack, Layout, Critical Rules
- [docs/conventions/testing.md](../../conventions/testing.md) — PHPUnit-Erwartung für Kernlogik
- `promptigofant/backend/composer.json` + `.php-cs-fixer.php` (Schwesterprojekt, gleiches Muster — als Vorlage lesen, nicht kopieren, PHP-Version-Pin ist anders: 8.2+ statt 8.1+)

## Akzeptanzkriterien

1. `composer install` läuft ohne Fehler, `composer lint` (php-cs-fixer, `--dry-run`) läuft grün auf einem leeren `src/`.
2. `php -S localhost:8000 -t public` beantwortet `GET /api/health` mit Status 200 und Body `{"status":"ok"}`, `Content-Type: application/json`.
3. Eine unbekannte Route liefert 404 als JSON-Fehlerumschlag (`{"error":{"code":404,"message":"Not Found"}}`), keine rohe PHP-Warnung.
4. `composer test` (PHPUnit) läuft grün mit mind. einem Test: JWT encode/decode-Roundtrip über die Middleware-Klasse.
5. `.env.example` vorhanden, `.env` ist gitignored (bereits in Root-`.gitignore` erledigt — hier nur prüfen, kein Duplikat in `backend/.gitignore` nötig).

## Implementation

- [ ] `php -v` prüfen (Konfidenz-Ausweis README) — 8.2+ erwartet, sonst Phase-Vorgaben anpassen
- [ ] `backend/composer.json` anlegen (PSR-4 `App\` → `src/`, `Tests\` → `tests/`):
      ```json
      {
        "name": "questoria/backend",
        "description": "Questoria PHP REST API",
        "type": "project",
        "require": {
          "php": ">=8.2",
          "firebase/php-jwt": "^7.0",
          "vlucas/phpdotenv": "^5.6",
          "nikic/fast-route": "^1.3",
          "monolog/monolog": "^3.7",
          "respect/validation": "^2.3"
        },
        "require-dev": {
          "friendsofphp/php-cs-fixer": "^3.65",
          "phpunit/phpunit": "^11.0"
        },
        "autoload": { "psr-4": { "App\\": "src/" } },
        "autoload-dev": { "psr-4": { "Tests\\": "tests/" } },
        "scripts": {
          "lint": "php-cs-fixer fix --config=.php-cs-fixer.php --dry-run --diff",
          "lint:fix": "php-cs-fixer fix --config=.php-cs-fixer.php",
          "test": "phpunit"
        },
        "config": { "sort-packages": true, "optimize-autoloader": true }
      }
      ```
- [ ] `backend/.php-cs-fixer.php` — identisches Regelwerk wie promptigofant (`@PSR12`, `declare_strict_types`, short array syntax, `single_quote`, `ordered_imports`, `trailing_comma_in_multiline`), `Finder` über `src/`, `public/`, `tests/`
- [ ] `backend/phpunit.xml` — Standard-Config, Testsuite `Tests` → `tests/`
- [ ] `backend/.env.example`:
      ```
      APP_ENV=local
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_NAME=questoria
      DB_USER=questoria
      DB_PASS=
      JWT_SECRET=change-me-in-production
      ```
- [ ] `backend/src/Http/JsonResponse.php` — statische Helper `send(int $status, array $payload): never` (setzt Header `Content-Type: application/json`, `http_response_code()`, `echo json_encode($payload)`, `exit`)
- [ ] `backend/src/Exceptions/ApiException.php` — `extends \RuntimeException`, trägt `int $statusCode`
- [ ] `backend/src/Controllers/HealthController.php` — `handle(): array` gibt `['status' => 'ok']` zurück
- [ ] `backend/src/Middleware/JwtAuthMiddleware.php`:
      - Konstruktor nimmt `string $secret` (aus `$_ENV['JWT_SECRET']`)
      - `issue(array $claims): string` — signiert mit `Firebase\JWT\JWT::encode`, Algorithmus `HS256`
      - `verify(string $token): array` — `Firebase\JWT\JWT::decode`, wirft `ApiException(401, 'Invalid token')` bei Fehler
      - **Noch an keine Route gehängt** — Skelett + Unit-Test in dieser Phase, echte Nutzung kommt mit der User-API in Meilenstein 4
- [ ] `backend/src/Database/Connection.php` — `static function pdo(): \PDO`, liest `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASS` aus `$_ENV`, DSN `mysql:host=...;port=...;dbname=...;charset=utf8mb4`, `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, Singleton (statische Instanz-Variable)
- [ ] `backend/public/index.php` — Front-Controller:
      1. `require __DIR__.'/../vendor/autoload.php'`
      2. `Dotenv\Dotenv::createImmutable(__DIR__.'/..')->load()`
      3. Monolog-Logger aufsetzen, schreibt nach `backend/logs/app.log`
      4. FastRoute-Dispatcher: `GET /api/health` → `HealthController::handle`
      5. Dispatch, bei `Dispatcher::NOT_FOUND` → `JsonResponse::send(404, ['error' => ['code' => 404, 'message' => 'Not Found']])`
      6. Bei jeder gefangenen `\Throwable` → Log via Monolog, `JsonResponse::send(500, ['error' => ['code' => 500, 'message' => 'Internal Server Error']])` (keine Stacktraces nach außen, siehe `php.md` Critical Rules)
- [ ] `backend/tests/Middleware/JwtAuthMiddlewareTest.php` — Roundtrip-Test: `issue(['sub' => 'test'])` → `verify()` → Claim `sub` stimmt; abgelaufener/manipulierter Token wirft `ApiException`
- [ ] `backend/logs/.gitkeep` anlegen (Ordner muss existieren, Inhalt ist gitignored)
- [ ] `docs/decisions/002-php-stack-choice.md` schreiben (ADR, 10 Zeilen: Kontext = Shared Hosting + Schwesterprojekt-Konsistenz, Optionen = Symfony/Laravel vs. Micro-Stack, Entscheidung = promptigofant-Muster übernehmen, Konsequenzen)

## Doc-Updates

- [ ] `docs/code-map.md`: Backend-Tabelle bleibt wie geplant (Struktur stimmt bereits mit der Umsetzung überein — nur prüfen, nicht ändern)
- [ ] `backend/README.md`: Platzhaltertext durch echten Quickstart ersetzen (Composer install, `.env` kopieren, `php -S`)

## Report-Back
*(leer, wird beim Umsetzen befüllt)*
