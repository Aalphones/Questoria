<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\ContentController;
use App\Controllers\HealthController;
use App\Controllers\MigrateController;
use App\Controllers\ProfileController;
use App\Controllers\SetupController;
use App\Database\Connection;
use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\SessionCookie;
use App\Middleware\CorsMiddleware;
use App\Migrations\AutoMigrator;
use App\Services\AuthService;
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

$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$corsMiddleware = new CorsMiddleware($_ENV['CORS_ORIGINS'] ?? '');
$corsMiddleware->handle($requestMethod, $_SERVER['HTTP_ORIGIN'] ?? null);

// Alles unter /api/ verlangt eine gueltige Sitzung — bis auf diese vier. Die
// Liste steht bewusst an einer einzigen Stelle: verstreute Ausnahmen im Code
// sind der Weg, auf dem ein Endpunkt still ungeschuetzt bleibt.
//
// /api/setup/user steht hier, weil es den ERSTEN Account anlegt — es kann keine
// Sitzung voraussetzen, sonst gaebe es nie eine. Geschuetzt ist es stattdessen
// ueber ein eigenes Token im Kopf; ohne das antwortet es 404 (SetupController).
const OPEN_ROUTES = [
    'POST /api/auth/login',
    'GET /api/health',
    'POST /api/migrate',
    'POST /api/setup/user',
];

$dispatcher = FastRoute\simpleDispatcher(static function (RouteCollector $routes): void {
    $routes->addRoute('GET', '/api/health', [HealthController::class, 'handle']);
    $routes->addRoute('POST', '/api/migrate', [MigrateController::class, 'handle']);
    $routes->addRoute('POST', '/api/setup/user', [SetupController::class, 'createUser']);
    $routes->addRoute('POST', '/api/auth/login', [AuthController::class, 'login']);
    $routes->addRoute('POST', '/api/auth/logout', [AuthController::class, 'logout']);
    $routes->addRoute('GET', '/api/auth/me', [AuthController::class, 'me']);
    $routes->addRoute('GET', '/api/profiles', [ProfileController::class, 'index']);
    $routes->addRoute('POST', '/api/profiles', [ProfileController::class, 'create']);
    $routes->addRoute('PATCH', '/api/profiles/{profileId}', [ProfileController::class, 'update']);
    $routes->addRoute('DELETE', '/api/profiles/{profileId}', [ProfileController::class, 'delete']);
    $routes->addRoute('GET', '/api/content/themes', [ContentController::class, 'themes']);
    $routes->addRoute('GET', '/api/content/themes/{themeId}', [ContentController::class, 'world']);
    $routes->addRoute(
        'GET',
        '/api/content/themes/{themeId}/episodes/{episodeId}',
        [ContentController::class, 'episode'],
    );
    $routes->addRoute(
        'GET',
        '/api/content/themes/{themeId}/events/{eventId}',
        [ContentController::class, 'event'],
    );
});

// Der angefragte Pfad wird bewusst nicht um ein Verzeichnis gekuerzt: Die Bruecke
// im ausgelieferten Bereich liegt unter /api/, und genau so heissen die Routen
// auch. Eine Kuerzung wuerde das Praefix wegschneiden, das hier gebraucht wird.
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

$route = $dispatcher->dispatch($requestMethod, $requestPath);

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

// Der Sitzungs-Schutz sitzt zwischen Routen-Treffer und Controller-Aufruf: erst
// hier steht fest, welche Route gemeint war, und noch hat kein Controller-Code
// gelaufen. Der geprueft Angemeldete wandert als Konstruktor-Argument weiter —
// kein Controller liest selbst am Cookie.
$authenticatedUser = null;

if (!in_array($requestMethod . ' ' . $requestPath, OPEN_ROUTES, true)) {
    $sessionToken = SessionCookie::read();

    if ($sessionToken === null) {
        JsonResponse::error(401, 'Nicht angemeldet');
    }

    $authenticatedUser = (new AuthService())->userFromToken($sessionToken);
}

[$controllerClass, $controllerMethod] = $route[1];

// Controller ohne Konstruktor-Parameter (Health, Migrate, Content) bekommen den
// Benutzer nicht aufgedraengt — sonst traegt jede Klasse ein Feld, das sie nie
// benutzt.
$controllerConstructor = (new ReflectionClass($controllerClass))->getConstructor();
$controller = $controllerConstructor === null || $controllerConstructor->getNumberOfParameters() === 0
    ? new $controllerClass()
    : new $controllerClass($authenticatedUser);

$payload = $controller->{$controllerMethod}(...array_values($route[2]));

JsonResponse::send(200, $payload);
