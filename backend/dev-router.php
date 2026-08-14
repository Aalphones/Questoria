<?php

declare(strict_types=1);

// Weichen-Skript fuer den eingebauten PHP-Server, nur fuer die Entwicklung.
// Wird ueber `php -S ... dev-router.php` als Router uebergeben (backend/serve.cmd).

// Vor allem anderen gesetzt: Dotenv::safeLoad() ueberschreibt bestehende
// $_ENV-Werte nicht, dieser Wert gewinnt also gegen ein evtl. vorhandenes
// backend\.env.
$_ENV['CONTENT_PATH'] = dirname(__DIR__) . '/data';

$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

if (str_starts_with($requestPath, '/content/')) {
    $relativePath = substr($requestPath, strlen('/content/'));
    $filePath = $_ENV['CONTENT_PATH'] . '/' . $relativePath;

    if (!is_file($filePath)) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => ['code' => 404, 'message' => 'Not Found']]);

        return true;
    }

    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
    header('Content-Type: ' . $mimeType);
    readfile($filePath);

    return true;
}

require __DIR__ . '/public/index.php';
