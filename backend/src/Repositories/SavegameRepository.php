<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database\Connection;
use PDO;

final class SavegameRepository
{
    private const SELECT_COLUMNS = 'theme_id, episode_id, node_id, game_state_json, updated_at';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function allForProfile(int $profileId): array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS . ' FROM savegames WHERE profile_id = :profile_id ORDER BY theme_id',
        );
        $statement->execute(['profile_id' => $profileId]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Schreibt den Stand einer Welt vollstaendig neu. Der eindeutige Schluessel
     * (profile_id, theme_id) aus Migration 004 macht daraus ein Update statt
     * eines zweiten Eintrags — das Backend fuehrt bewusst nichts zusammen
     * (ADR-009).
     *
     * @param string $gameStateJson Bereits kodierter JSON-Text — das Backend
     *   liest den Inhalt nicht.
     */
    public function upsert(
        int $profileId,
        string $themeId,
        ?string $episodeId,
        ?string $nodeId,
        string $gameStateJson,
    ): array {
        $statement = Connection::pdo()->prepare(
            'INSERT INTO savegames (profile_id, theme_id, episode_id, node_id, game_state_json)'
            . ' VALUES (:profile_id, :theme_id, :episode_id, :node_id, :game_state_json)'
            . ' ON DUPLICATE KEY UPDATE'
            . ' episode_id = VALUES(episode_id),'
            . ' node_id = VALUES(node_id),'
            . ' game_state_json = VALUES(game_state_json)',
        );
        $statement->execute([
            'profile_id' => $profileId,
            'theme_id' => $themeId,
            'episode_id' => $episodeId,
            'node_id' => $nodeId,
            'game_state_json' => $gameStateJson,
        ]);

        return $this->findForProfile($profileId, $themeId) ?? [
            'theme_id' => $themeId,
            'episode_id' => $episodeId,
            'node_id' => $nodeId,
            'game_state_json' => $gameStateJson,
            'updated_at' => null,
        ];
    }

    public function findForProfile(int $profileId, string $themeId): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS
            . ' FROM savegames WHERE profile_id = :profile_id AND theme_id = :theme_id LIMIT 1',
        );
        $statement->execute(['profile_id' => $profileId, 'theme_id' => $themeId]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }
}
