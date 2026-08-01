<?php

declare(strict_types=1);

namespace App\Database;

use PDO;

final class Connection
{
    private static ?PDO $instance = null;

    public static function pdo(): PDO
    {
        if (self::$instance instanceof PDO) {
            return self::$instance;
        }

        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $name = $_ENV['DB_NAME'] ?? '';
        $user = $_ENV['DB_USER'] ?? '';
        $password = $_ENV['DB_PASS'] ?? '';

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

        self::$instance = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            // Ohne Deckel haengt ein gescheiterter Verbindungsversuch am
            // OS-TCP-Timeout (auf dieser Maschine ~21s). AutoMigrator und ein
            // Controller koennen beide in einem Request eine eigene Verbindung
            // versuchen — zwei ungedeckelte Versuche reissen PHPs
            // max_execution_time, ein Fatal Error, den kein try/catch faengt.
            PDO::ATTR_TIMEOUT => 5,
        ]);

        return self::$instance;
    }
}
