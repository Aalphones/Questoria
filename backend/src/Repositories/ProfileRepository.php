<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database\Connection;
use PDO;

final class ProfileRepository
{
    private const SELECT_COLUMNS = 'id, display_name, avatar, selected_theme, selected_level';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function allForUser(int $userId): array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS . ' FROM player_profiles WHERE user_id = :user_id ORDER BY id',
        );
        $statement->execute(['user_id' => $userId]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Prueft Profil- UND Benutzer-ID in einer Abfrage — ein fremdes Profil
     * liefert `null`, nicht die Daten eines anderen Accounts (Kontrakt-Regel
     * 404 statt 403, siehe Plan-README).
     */
    public function findForUser(int $profileId, int $userId): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS . ' FROM player_profiles WHERE id = :id AND user_id = :user_id LIMIT 1',
        );
        $statement->execute(['id' => $profileId, 'user_id' => $userId]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }

    public function create(int $userId, string $displayName, ?string $avatar): array
    {
        $statement = Connection::pdo()->prepare(
            'INSERT INTO player_profiles (user_id, display_name, avatar) VALUES (:user_id, :display_name, :avatar)',
        );
        $statement->execute([
            'user_id' => $userId,
            'display_name' => $displayName,
            'avatar' => $avatar,
        ]);

        $profileId = (int) Connection::pdo()->lastInsertId();

        return $this->findForUser($profileId, $userId) ?? [
            'id' => $profileId,
            'display_name' => $displayName,
            'avatar' => $avatar,
            'selected_theme' => null,
            'selected_level' => null,
        ];
    }

    /**
     * @param array<string, mixed> $fields Teilmenge aus display_name, avatar,
     *   selected_theme, selected_level — nur die uebergebenen Spalten werden
     *   geschrieben.
     */
    public function update(int $profileId, int $userId, array $fields): void
    {
        if ($fields === []) {
            return;
        }

        $assignments = [];
        $parameters = ['id' => $profileId, 'user_id' => $userId];

        foreach ($fields as $column => $value) {
            $assignments[] = "{$column} = :{$column}";
            $parameters[$column] = $value;
        }

        $statement = Connection::pdo()->prepare(
            'UPDATE player_profiles SET ' . implode(', ', $assignments)
            . ' WHERE id = :id AND user_id = :user_id',
        );
        $statement->execute($parameters);
    }

    public function delete(int $profileId, int $userId): void
    {
        $statement = Connection::pdo()->prepare(
            'DELETE FROM player_profiles WHERE id = :id AND user_id = :user_id',
        );
        $statement->execute(['id' => $profileId, 'user_id' => $userId]);
    }
}
