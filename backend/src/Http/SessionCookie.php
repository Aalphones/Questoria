<?php

declare(strict_types=1);

namespace App\Http;

final class SessionCookie
{
    public const NAME = 'qst_session';
    public const LIFETIME_SECONDS = 2592000;

    public static function issue(string $token): void
    {
        setcookie(self::NAME, $token, self::options(time() + self::LIFETIME_SECONDS));
    }

    public static function clear(): void
    {
        setcookie(self::NAME, '', self::options(time() - 3600));
    }

    public static function read(): ?string
    {
        $token = $_COOKIE[self::NAME] ?? '';

        if (!is_string($token) || $token === '') {
            return null;
        }

        return $token;
    }

    private static function options(int $expiresAt): array
    {
        return [
            'expires' => $expiresAt,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            // Ueber http://localhost wuerde ein Secure-Cookie vom Browser
            // verworfen — lokal waere danach keine Anmeldung moeglich.
            'secure' => ($_ENV['APP_ENV'] ?? '') !== 'local',
        ];
    }
}
