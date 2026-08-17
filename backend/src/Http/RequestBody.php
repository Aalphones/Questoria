<?php

declare(strict_types=1);

namespace App\Http;

use App\Exceptions\ApiException;

final class RequestBody
{
    public static function json(): array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || $raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            throw new ApiException(400, 'Der Anfragekoerper ist kein gueltiges JSON-Objekt');
        }

        return $decoded;
    }
}
