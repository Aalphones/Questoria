<?php

declare(strict_types=1);

use Dotenv\Dotenv;

// Serverauskunft. Ohne Kommandozeilenzugang ist das die einzige Moeglichkeit,
// nachzusehen, was auf dem Paket tatsaechlich laeuft. Nur mit dem richtigen
// Token abrufbar — ohne verhaelt sich die Datei, als gaebe es sie nicht.
$backendRoot = __DIR__ . '/../../backend';

require $backendRoot . '/vendor/autoload.php';

Dotenv::createImmutable($backendRoot)->safeLoad();

$expectedToken = $_ENV['DIAG_TOKEN'] ?? '';
$providedToken = $_SERVER['HTTP_X_DIAG_TOKEN'] ?? '';

if ($expectedToken === '' || !hash_equals($expectedToken, $providedToken)) {
    http_response_code(404);

    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Reine Namensauflösung, getrennt vom eigentlichen Verbindungsaufbau (der
// steckt hinter PDO::ATTR_TIMEOUT) — soll den Verdacht "DNS-Lookup für
// DB_HOST ist langsam" belegen oder ausräumen, ohne selbst eine DB-Verbindung
// zu öffnen. gethostbyname() liefert bei Fehlschlag den Eingabewert unveraendert
// zurueck, deshalb der Vergleich statt eines einfachen Wahrheitswerts.
$dbHost = $_ENV['DB_HOST'] ?? '';
$dbPort = (int) ($_ENV['DB_PORT'] ?? 3306);
$dnsStart = microtime(true);
$resolved = $dbHost === '' ? null : gethostbyname($dbHost);
$dnsSeconds = round(microtime(true) - $dnsStart, 3);

// Roher TCP-Connect zum DB-Port, ohne MySQL-Protokoll/PDO davor — soll zeigen,
// ob schon das nackte Verbinden lahmt (Netzwerk/Firewall) oder erst der
// MySQL-Handshake danach. errno/errstr sind hier keine Fehlermeldung nach
// aussen, nur eine lokale Diagnose ohne Zugangsdaten.
$tcpStart = microtime(true);
$socket = $dbHost === '' ? false : @fsockopen($dbHost, $dbPort, $errno, $errstr, 10);
$tcpSeconds = round(microtime(true) - $tcpStart, 3);
if ($socket !== false) {
    fclose($socket);
}

echo json_encode([
    'php_version' => PHP_VERSION,
    'extensions' => array_values(array_intersect(
        ['pdo_mysql', 'mbstring', 'fileinfo', 'curl', 'openssl', 'intl', 'zip'],
        get_loaded_extensions(),
    )),
    'open_basedir' => ini_get('open_basedir'),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'post_max_size' => ini_get('post_max_size'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? null,
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? null,
    'db_host_dns_seconds' => $dnsSeconds,
    'db_host_resolved' => $resolved !== null && $resolved !== $dbHost,
    'db_tcp_connect_seconds' => $tcpSeconds,
    'db_tcp_connect_ok' => $socket !== false,
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
