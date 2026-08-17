<?php

declare(strict_types=1);

use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\SessionCookie;
use App\Middleware\JwtAuthMiddleware;
use App\Services\ContentFileService;
use Dotenv\Dotenv;

// Die Weiche vor den Content-Dateien. Auf dem Server schreibt public/content/
// .htaccess jede Anfrage an /content/... hierher um; beim lokalen Entwickeln
// ruft dev-router.php dieselbe Datei auf. Der eigentliche Einstiegspunkt der
// Schnittstelle (index.php) bleibt aussen vor: Was hier laeuft, laeuft fuer
// jedes einzelne Bild und jeden Ton eines Screens.
require __DIR__ . '/../vendor/autoload.php';

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED);

Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

set_exception_handler(static function (Throwable $failure): never {
    if ($failure instanceof ApiException) {
        JsonResponse::error($failure->statusCode(), $failure->getMessage());
    }

    JsonResponse::error(500, 'Internal Server Error');
});

$sessionToken = SessionCookie::read();

if ($sessionToken === null) {
    JsonResponse::error(403, 'Kein Zugriff');
}

// Bewusst kein Datenbank-Zugriff: Das Token traegt seine Gueltigkeit in der
// Signatur, und der Ablauf steckt darin. Wuerde die Weiche zusaetzlich den
// Benutzer nachschlagen, waere bei einer hakenden Datenbank nicht nur der
// Spielstand weg, sondern jedes Bild im Spiel — aus einem Aussetzer wuerde ein
// Totalausfall.
try {
    JwtAuthMiddleware::fromEnvironment()->verify($sessionToken);
} catch (ApiException $failure) {
    if ($failure->statusCode() === 500) {
        // Fehlendes JWT_SECRET ist ein Serverproblem und keine abgelaufene
        // Sitzung — das darf nicht als "melde dich neu an" durchgehen.
        throw $failure;
    }

    JsonResponse::error(403, 'Kein Zugriff');
}

// Der Dateiname kommt aus der Umschreibe-Regel (?file=...). Faellt die einmal
// aus, liefert der Pfad der Anfrage denselben Wert — nie beides raten.
$requestedFile = $_GET['file'] ?? null;

if (!is_string($requestedFile) || $requestedFile === '') {
    $requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
    $requestedFile = str_starts_with($requestPath, '/content/')
        ? substr($requestPath, strlen('/content/'))
        : '';
}

(new ContentFileService())->serve($requestedFile);
