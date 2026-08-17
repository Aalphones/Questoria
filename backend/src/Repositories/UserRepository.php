<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database\Connection;
use PDO;

final class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT id, username, email, password_hash, role FROM users WHERE email = :email LIMIT 1',
        );
        $statement->execute(['email' => $email]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        if ($row === false) {
            return null;
        }

        return $row;
    }

    public function findById(int $userId): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT id, username, email, password_hash, role FROM users WHERE id = :id LIMIT 1',
        );
        $statement->execute(['id' => $userId]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        if ($row === false) {
            return null;
        }

        return $row;
    }

    public function create(string $email, string $username, string $passwordHash, string $role): int
    {
        $statement = Connection::pdo()->prepare(
            'INSERT INTO users (username, email, password_hash, role)'
            . ' VALUES (:username, :email, :password_hash, :role)',
        );
        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => $passwordHash,
            'role' => $role,
        ]);

        return (int) Connection::pdo()->lastInsertId();
    }

    public function touchLastLogin(int $userId): void
    {
        $statement = Connection::pdo()->prepare(
            'UPDATE users SET last_login = NOW() WHERE id = :id',
        );
        $statement->execute(['id' => $userId]);
    }
}
