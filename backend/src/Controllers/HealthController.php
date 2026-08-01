<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Database\Connection;
use Throwable;

final class HealthController
{
    public function handle(): array
    {
        return [
            'status' => 'ok',
            'php_version' => PHP_VERSION,
            'db_connected' => $this->isDatabaseReachable(),
        ];
    }

    // Eine unerreichbare Datenbank ist hier ein Messergebnis, kein Fehler: ohne
    // Kommandozeile auf dem Server ist diese Antwort die einzige Moeglichkeit,
    // die Zugangsdaten ueberhaupt zu pruefen.
    private function isDatabaseReachable(): bool
    {
        try {
            Connection::pdo()->query('SELECT 1');

            return true;
        } catch (Throwable) {
            return false;
        }
    }
}
