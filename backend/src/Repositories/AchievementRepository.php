<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database\Connection;
use PDO;

final class AchievementRepository
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function allForProfile(int $profileId): array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT theme_id, achievement_key, unlocked_at'
            . ' FROM player_achievements WHERE profile_id = :profile_id ORDER BY unlocked_at',
        );
        $statement->execute(['profile_id' => $profileId]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * `INSERT IGNORE`, damit ein zweiter Aufruf mit demselben Schlüssel kein
     * Fehler ist (Plan-README, Kontrakt Erfolge: "mehrfach aufrufbar ohne
     * Fehler") — anders als der Spielstand setzt ein Erfolg nur einmal, nie
     * erneut.
     *
     * @return array<string, mixed>
     */
    public function unlock(int $profileId, string $themeId, string $achievementKey): array
    {
        $statement = Connection::pdo()->prepare(
            'INSERT IGNORE INTO player_achievements (profile_id, theme_id, achievement_key)'
            . ' VALUES (:profile_id, :theme_id, :achievement_key)',
        );
        $statement->execute([
            'profile_id' => $profileId,
            'theme_id' => $themeId,
            'achievement_key' => $achievementKey,
        ]);

        return $this->find($profileId, $themeId, $achievementKey) ?? [
            'theme_id' => $themeId,
            'achievement_key' => $achievementKey,
            'unlocked_at' => null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function find(int $profileId, string $themeId, string $achievementKey): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT theme_id, achievement_key, unlocked_at FROM player_achievements'
            . ' WHERE profile_id = :profile_id AND theme_id = :theme_id AND achievement_key = :achievement_key'
            . ' LIMIT 1',
        );
        $statement->execute([
            'profile_id' => $profileId,
            'theme_id' => $themeId,
            'achievement_key' => $achievementKey,
        ]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }
}
