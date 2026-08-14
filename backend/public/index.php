<?php

declare(strict_types=1);

use App\Controllers\ContentController;
use App\Controllers\HealthController;
use App\Controllers\MigrateController;
use App\Database\Connection;
use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Middleware\CorsMiddleware;
use App\Migrations\AutoMigrator;
use Dotenv\Dotenv;
use FastRoute\Dispatcher;
use FastRoute\RouteCollector;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;

require __DIR__ . '/../vendor/autoload.php';

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED);

// safeLoad statt load: ein fehlendes .env darf keine Ausnahme werfen, sonst
// antwortet ein frisch hochgeladener Server mit einer weissen Seite statt mit
// einer Auskunft, die genau dieses Problem benennt.
Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

$logger = new Logger('questoria');
$logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/app.log', Level::Warning));

$failWithServerError = static function (Throwable $failure) use ($logger): never {
    try {
        $logger->error($failure->getMessage(), [
            'type' => $failure::class,
            'file' => $failure->getFile(),
            'line' => $failure->getLine(),
        ]);
    } catch (Throwable) {
        // Ein nicht beschreibbarer Log-Ordner darf die Antwort nicht ebenfalls
        // zum Absturz bringen — die Anfrage bekommt trotzdem ihre 500.
    }

    JsonResponse::error(500, 'Internal Server Error');
};

set_exception_handler(static function (Throwable $failure) use ($failWithServerError): never {
    if ($failure instanceof ApiException) {
        JsonResponse::error($failure->statusCode(), $failure->getMessage());
    }

    $failWithServerError($failure);
});

// Nur Meldungen eskalieren, die error_reporting auch durchlaesst. Ohne diese
// Bedingung wuerde auf PHP 8.5 jede Veralterungswarnung aus einer Bibliothek zu
// einer 500 — der Server laeuft eine Version ueber dem, was der Code verlangt.
set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if ((error_reporting() & $severity) === 0) {
        return false;
    }

    throw new ErrorException($message, 0, $severity, $file, $line);
});

$corsMiddleware = new CorsMiddleware($_ENV['CORS_ORIGINS'] ?? '');
$corsMiddleware->handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['HTTP_ORIGIN'] ?? null);

$dispatcher = FastRoute\simpleDispatcher(static function (RouteCollector $routes): void {
    $routes->addRoute('GET', '/api/health', [HealthController::class, 'handle']);
    $routes->addRoute('POST', '/api/migrate', [MigrateController::class, 'handle']);
    $routes->addRoute('GET', '/api/content/themes', [ContentController::class, 'themes']);
    $routes->addRoute('GET', '/api/content/themes/{themeId}', [ContentController::class, 'world']);
    $routes->addRoute(
        'GET',
        '/api/content/themes/{themeId}/episodes/{episodeId}',
        [ContentController::class, 'episode'],
    );
});

// Der angefragte Pfad wird bewusst nicht um ein Verzeichnis gekuerzt: Die Bruecke
// im ausgelieferten Bereich liegt unter /api/, und genau so heissen die Routen
// auch. Eine Kuerzung wuerde das Praefix wegschneiden, das hier gebraucht wird.
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

$route = $dispatcher->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $requestPath);

if ($route[0] === Dispatcher::NOT_FOUND) {
    JsonResponse::error(404, 'Not Found');
}

if ($route[0] === Dispatcher::METHOD_NOT_ALLOWED) {
    header('Allow: ' . implode(', ', $route[1]));

    JsonResponse::error(405, 'Method Not Allowed');
}

// Prueft bei jedem echten (gematchten) Request, ob eine SQL-Datei unter
// Migrations/sql/ noch nicht angewendet wurde, und holt das nach — ohne
// Kommandozeile auf dem Server ist das der einzige Weg, ein frisch
// hochgeladenes Schema in Kraft zu setzen. AUTO_MIGRATE=false in .env ist der
// Not-Aus, falls das je Aerger macht. Ein Ausfall hier (DB down, Migration
// kaputt) darf den eigentlichen Request nicht mitreissen — geloggt, nicht
// geworfen.
if (($_ENV['AUTO_MIGRATE'] ?? 'true') !== 'false') {
    try {
        (new AutoMigrator(Connection::pdo(), $logger))->runIfPending();
    } catch (Throwable $failure) {
        $logger->error('Auto-Migrate-Bootstrap fehlgeschlagen', ['message' => $failure->getMessage()]);
    }
}

[$controllerClass, $controllerMethod] = $route[1];
$payload = (new $controllerClass())->{$controllerMethod}(...array_values($route[2]));

JsonResponse::send(200, $payload);
