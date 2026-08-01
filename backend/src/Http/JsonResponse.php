<?php

declare(strict_types=1);

namespace App\Http;

final class JsonResponse
{
    public static function send(int $status, array $payload): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        exit;
    }

    public static function error(int $status, string $message): never
    {
        self::send($status, ['error' => ['code' => $status, 'message' => $message]]);
    }

    public static function noContent(): never
    {
        http_response_code(204);

        exit;
    }
}
