<?php

declare(strict_types=1);

namespace App\Http;

use App\Exceptions\ApiException;

final class RequestBody
{
    public static function json(): array
    {
        $raw = self::raw();

        if ($raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            throw new ApiException(400, 'Der Anfragekoerper ist kein gueltiges JSON-Objekt');
        }

        return $decoded;
    }

    /**
     * Der unveraenderte Anfragekoerper. Gebraucht ueberall dort, wo ein Stueck
     * JSON wortgetreu weitergereicht wird: nach dem assoziativen Dekodieren
     * sind ein leeres Objekt und eine leere Liste nicht mehr unterscheidbar,
     * `{}` kaeme als `[]` zurueck (Spielstand, siehe SavegameValidator).
     */
    public static function raw(): string
    {
        $raw = file_get_contents('php://input');

        return $raw === false ? '' : $raw;
    }
}
