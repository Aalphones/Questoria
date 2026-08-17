<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\ApiException;
use App\Http\SessionCookie;
use App\Middleware\JwtAuthMiddleware;
use App\Repositories\UserRepository;

final class AuthService
{
    // Feste Vergleichsgroesse fuer den Fall "E-Mail unbekannt". Der Klartext
    // spielt keine Rolle, nur die Rechenzeit von password_verify().
    private const DUMMY_HASH = '$2y$12$icmH3BfTbjt2qmFPgbrCpOcFd3WgyBfC..YbX3.OKYUg0QYXQJAp.';

    private const CREDENTIALS_REJECTED = 'E-Mail oder Passwort stimmt nicht';

    private readonly UserRepository $users;
    private readonly JwtAuthMiddleware $tokens;

    public function __construct(?UserRepository $users = null, ?JwtAuthMiddleware $tokens = null)
    {
        $this->users = $users ?? new UserRepository();
        $this->tokens = $tokens ?? JwtAuthMiddleware::fromEnvironment();
    }

    /**
     * @return array{user: array{id: int, username: string, role: string}, token: string}
     */
    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);

        if ($user === null) {
            // Ohne diesen Leerlauf antwortet eine unbekannte E-Mail messbar
            // schneller als ein falsches Passwort — und verraet damit, welche
            // Adressen einen Account haben.
            password_verify($password, self::DUMMY_HASH);

            throw new ApiException(401, self::CREDENTIALS_REJECTED);
        }

        if (!password_verify($password, (string) $user['password_hash'])) {
            throw new ApiException(401, self::CREDENTIALS_REJECTED);
        }

        $userId = (int) $user['id'];
        $this->users->touchLastLogin($userId);

        $issuedAt = time();

        return [
            'user' => $this->publicUser($user),
            'token' => $this->tokens->issue([
                'sub' => $userId,
                'iat' => $issuedAt,
                'exp' => $issuedAt + SessionCookie::LIFETIME_SECONDS,
            ]),
        ];
    }

    /**
     * @return array{id: int, username: string, role: string}
     */
    public function userFromToken(string $token): array
    {
        $claims = $this->tokens->verify($token);
        $userId = (int) ($claims['sub'] ?? 0);

        if ($userId <= 0) {
            throw new ApiException(401, 'Nicht angemeldet');
        }

        // Bewusst ein Datenbank-Blick statt blindem Vertrauen in das Token: ein
        // geloeschter Account soll nicht bis zum Ablauf der 30 Tage weiter
        // angemeldet bleiben.
        $user = $this->users->findById($userId);

        if ($user === null) {
            throw new ApiException(401, 'Nicht angemeldet');
        }

        return $this->publicUser($user);
    }

    /**
     * @return array{id: int, username: string, role: string}
     */
    private function publicUser(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'username' => (string) $row['username'],
            'role' => (string) $row['role'],
        ];
    }
}
