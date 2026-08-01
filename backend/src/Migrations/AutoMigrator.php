<?php

declare(strict_types=1);

namespace App\Migrations;

use PDO;
use Psr\Log\LoggerInterface;
use Throwable;

final class AutoMigrator
{
    private const LOCK_NAME = 'questoria_schema_migrations';
    private const LOCK_TIMEOUT_SECONDS = 5;

    public function __construct(
        private readonly PDO $pdo,
        private readonly LoggerInterface $logger,
    ) {
    }

    // Wird bei jedem echten Request aufgerufen (nicht bei 404/OPTIONS). GET_LOCK
    // verhindert, dass zwei Requests kurz nach einem Deploy gleichzeitig dieselbe
    // neue Migration anwenden — MySQL committet CREATE TABLE sofort, ein
    // gleichzeitiger zweiter Versuch wuerde also nicht sauber scheitern, sondern
    // haesslich stolpern. Ein Fehlschlag reisst nur diesen einen Request mit
    // (geloggt), nicht jeden folgenden — sonst legt eine kaputte SQL-Datei die
    // ganze Seite fuer jeden Besucher lahm, bis es jemand bemerkt.
    public function runIfPending(): void
    {
        $runner = new MigrationRunner($this->pdo);

        if (!$runner->hasPending()) {
            return;
        }

        $lockName = $this->pdo->quote(self::LOCK_NAME);
        $locked = (bool) $this->pdo
            ->query("SELECT GET_LOCK({$lockName}, " . self::LOCK_TIMEOUT_SECONDS . ')')
            ->fetchColumn();

        if (!$locked) {
            // Ein anderer Request haelt den Lock schon (migriert gerade oder haengt
            // fest) — dieser Request macht mit dem vorhandenen Schema weiter.
            return;
        }

        try {
            $applied = array_filter(
                $runner->run(),
                static fn (array $result): bool => $result['status'] === 'applied',
            );

            if ($applied !== []) {
                $this->logger->info('Migrationen automatisch angewendet', [
                    'migrations' => array_column($applied, 'migration'),
                ]);
            }
        } catch (Throwable $failure) {
            $this->logger->error('Automatische Migration fehlgeschlagen', [
                'message' => $failure->getMessage(),
            ]);
        } finally {
            $this->pdo->query("SELECT RELEASE_LOCK({$lockName})");
        }
    }
}
