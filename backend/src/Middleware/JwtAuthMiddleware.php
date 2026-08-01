<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Exceptions\ApiException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

final class JwtAuthMiddleware
{
    private const ALGORITHM = 'HS256';

    public function __construct(private readonly string $secret)
    {
    }

    public function issue(array $claims): string
    {
        return JWT::encode($claims, $this->secret, self::ALGORITHM);
    }

    public function verify(string $token): array
    {
        try {
            $payload = JWT::decode($token, new Key($this->secret, self::ALGORITHM));
        } catch (Throwable $failure) {
            throw new ApiException(401, 'Invalid token', $failure);
        }

        return (array) $payload;
    }
}
