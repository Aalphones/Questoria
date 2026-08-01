<?php

declare(strict_types=1);

use App\Database\Connection;
use App\Migrations\MigrationRunner;
use Dotenv\Dotenv;

require __DIR__ . '/../vendor/autoload.php';

// CLI-Huelle um denselben Runner, den auch der tokengeschuetzte HTTP-Endpoint
// nutzt (MigrateController). Auf dem Strato-Paket gibt es keine Kommandozeile —
// dieses Skript ist fuer den Fall gedacht, dass irgendwann doch Fernzugriff auf
// die MySQL-Datenbank besteht, oder fuer einen lokalen Test gegen eine eigene
// Datenbank.
Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

$runner = new MigrationRunner(Connection::pdo());

foreach ($runner->run() as $result) {
    echo "{$result['status']}: {$result['migration']}\n";
}
