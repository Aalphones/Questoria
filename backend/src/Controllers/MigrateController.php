<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database\Connection;
use App\Exceptions\ApiException;
use App\Migrations\MigrationRunner;

final class MigrateController
{
    // Gleiches Muster wie api-bridge/diag.php: falsches oder fehlendes Token
    // antwortet mit 404, nicht 401 — der Endpoint soll sich nach aussen wie
    // ein nicht existierender Pfad verhalten, kein Scan soll ihn ueberhaupt
    // als vorhanden erkennen.
    public function handle(): array
    {
        $expectedToken = $_ENV['MIGRATE_TOKEN'] ?? '';
        $providedToken = $_SERVER['HTTP_X_MIGRATE_TOKEN'] ?? '';

        if ($expectedToken === '' || !hash_equals($expectedToken, $providedToken)) {
            throw new ApiException(404, 'Not Found');
        }

        $runner = new MigrationRunner(Connection::pdo());

        return ['results' => $runner->run()];
    }
}
