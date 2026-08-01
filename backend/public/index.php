<?php

declare(strict_types=1);

use App\Controllers\HealthController;
use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Middleware\CorsMiddleware;
use Dotenv\Dotenv;
use FastRoute\Dispatcher;
use FastRoute\RouteCollector;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;

require __DIR__ . '/../vendor/autoload.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

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

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

$corsMiddleware = new CorsMiddleware($_ENV['CORS_ORIGINS'] ?? '');
$corsMiddleware->handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['HTTP_ORIGIN'] ?? null);

$dispatcher = FastRoute\simpleDispatcher(static function (RouteCollector $routes): void {
    $routes->addRoute('GET', '/api/health', [HealthController::class, 'handle']);
});

// Liegt das Backend nicht auf einer eigenen Adresse, sondern in einem Unterordner,
// kommt hier "/unterordner/public/api/health" an. Ohne diese Kuerzung liefe jeder
// Pfad ins 404 — und zwar lautlos, was die Suche danach unnoetig teuer macht.
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

if ($basePath !== '' && str_starts_with($requestPath, $basePath)) {
    $requestPath = substr($requestPath, strlen($basePath));
}

if ($requestPath === '') {
    $requestPath = '/';
}

$route = $dispatcher->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $requestPath);

if ($route[0] === Dispatcher::NOT_FOUND) {
    JsonResponse::error(404, 'Not Found');
}

if ($route[0] === Dispatcher::METHOD_NOT_ALLOWED) {
    header('Allow: ' . implode(', ', $route[1]));

    JsonResponse::error(405, 'Method Not Allowed');
}

[$controllerClass, $controllerMethod] = $route[1];
$payload = (new $controllerClass())->{$controllerMethod}(...array_values($route[2]));

JsonResponse::send(200, $payload);
