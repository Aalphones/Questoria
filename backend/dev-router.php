<?php

declare(strict_types=1);

// Weichen-Skript fuer den eingebauten PHP-Server, nur fuer die Entwicklung.
// Wird ueber `php -S ... dev-router.php` als Router uebergeben (backend/serve.cmd).

// Vor allem anderen gesetzt: Dotenv::safeLoad() ueberschreibt bestehende
// $_ENV-Werte nicht, dieser Wert gewinnt also gegen ein evtl. vorhandenes
// backend\.env.
$_ENV['CONTENT_PATH'] = dirname(__DIR__) . '/data';

$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

// Content laeuft durch dieselbe Weiche wie auf dem Server, samt Sitzungspruefung.
// Frueher lieferte dieser Router jede Datei ungeprueft aus — dann verhaelt sich
// lokal genau das anders, was am Ende schuetzen soll.
if (str_starts_with($requestPath, '/content/')) {
    require __DIR__ . '/public/content-gate.php';

    return true;
}

require __DIR__ . '/public/index.php';
