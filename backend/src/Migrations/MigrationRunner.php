<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;
use RuntimeException;
use Throwable;

final class MigrationRunner
{
    private const SQL_DIRECTORY = __DIR__ . '/sql';
    private const BOOTSTRAP_MIGRATION = '001_create_schema_migrations.sql';

    public function __construct(private readonly PDO $pdo)
    {
    }

    /** @return list<array{migration: string, status: string}> */
    public function run(): array
    {
        $this->bootstrapMigrationsTable();

        $files = glob(self::SQL_DIRECTORY . '/*.sql') ?: [];
        sort($files);

        $results = [];
        foreach ($files as $file) {
            $results[] = $this->applyIfPending($file);
        }

        return $results;
    }

    // Billiger Vorab-Check fuer AutoMigrator: ein Zeilen-Zaehlvergleich statt des
    // vollen Laufs mit einer Pruefung pro Datei. Existiert schema_migrations noch
    // nicht, ist definitiv etwas offen.
    public function hasPending(): bool
    {
        try {
            $appliedCount = (int) $this->pdo->query('SELECT COUNT(*) FROM schema_migrations')->fetchColumn();
        } catch (Throwable) {
            return true;
        }

        $fileCount = count(glob(self::SQL_DIRECTORY . '/*.sql') ?: []);

        return $appliedCount < $fileCount;
    }

    // schema_migrations kann sich nicht selbst per Registry-Eintrag pruefen, bevor sie
    // existiert — deshalb legt der Bootstrap sie separat an und traegt Migration 001
    // direkt ein. Die Schleife unten sieht sie danach schon als angewendet.
    private function bootstrapMigrationsTable(): void
    {
        $this->pdo->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS schema_migrations (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              migration VARCHAR(255) NOT NULL UNIQUE,
              applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL);

        $statement = $this->pdo->prepare(
            'INSERT IGNORE INTO schema_migrations (migration) VALUES (?)',
        );
        $statement->execute([self::BOOTSTRAP_MIGRATION]);
    }

    /** @return array{migration: string, status: string} */
    private function applyIfPending(string $file): array
    {
        $migration = basename($file);

        if ($this->isApplied($migration)) {
            return ['migration' => $migration, 'status' => 'skip (already applied)'];
        }

        $sql = file_get_contents($file);
        if ($sql === false) {
            throw new RuntimeException("Migration konnte nicht gelesen werden: {$migration}");
        }

        // MySQL committet DDL (CREATE TABLE) implizit und beendet damit jede offene
        // Transaktion von selbst — ein beginTransaction()/commit() drumherum sieht
        // nach Sicherheit aus, scheitert beim commit() aber mit "There is no active
        // transaction", obwohl die Tabelle laengst angelegt ist (gemessen: brach den
        // Lauf nach jeweils einer Datei ab, geloggt, aber unbemerkt weil der Request
        // trotzdem normal antwortete). Deshalb bewusst ohne Transaktion: exec() und
        // die Registry-Buchung sind zwei einzelne, je fuer sich auto-committete
        // Anweisungen. Passt zum Roll-forward-only-Ansatz: ein fehlgeschlagener
        // Migrationslauf wird von Hand repariert, nicht automatisch zurueckgerollt.
        $this->pdo->exec($sql);

        $statement = $this->pdo->prepare(
            'INSERT INTO schema_migrations (migration) VALUES (?)',
        );
        $statement->execute([$migration]);

        return ['migration' => $migration, 'status' => 'applied'];
    }

    private function isApplied(string $migration): bool
    {
        $statement = $this->pdo->prepare(
            'SELECT 1 FROM schema_migrations WHERE migration = ?',
        );
        $statement->execute([$migration]);

        return $statement->fetchColumn() !== false;
    }
}
