<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Http\JsonResponse;

final class CorsMiddleware
{
    private const ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';
    private const ALLOWED_HEADERS = 'Content-Type, Authorization';

    /** @var list<string> */
    private readonly array $allowedOrigins;

    public function __construct(string $originList)
    {
        $origins = array_map(
            static fn (string $origin): string => trim($origin),
            explode(',', $originList),
        );

        $this->allowedOrigins = array_values(array_filter(
            $origins,
            static fn (string $origin): bool => $origin !== '',
        ));
    }

    // Beantwortet Vorab-Anfragen selbst und beendet damit den Aufruf. Muss laufen,
    // bevor irgendetwas ausgegeben wird — sonst sieht der Browser statt einer
    // Fehlermeldung nur einen Verbindungsabbruch.
    public function handle(string $requestMethod, ?string $requestOrigin): void
    {
        if ($requestOrigin !== null && in_array($requestOrigin, $this->allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $requestOrigin);
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }

        if (strtoupper($requestMethod) !== 'OPTIONS') {
            return;
        }

        header('Access-Control-Allow-Methods: ' . self::ALLOWED_METHODS);
        header('Access-Control-Allow-Headers: ' . self::ALLOWED_HEADERS);
        header('Access-Control-Max-Age: 86400');

        JsonResponse::noContent();
    }
}
