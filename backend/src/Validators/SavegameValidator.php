<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;
use stdClass;

final class SavegameValidator
{
    private const SUPPORTED_STATE_VERSION = 1;

    private const MAXIMUM_POSITION_LENGTH = 100;

    /**
     * 256 KB. Deckel gegen einen kaputten Client, der die Tabelle sonst mit
     * einem einzigen Aufruf sprengt — ein echter Spielstand liegt bei wenigen
     * Kilobyte.
     */
    private const MAXIMUM_STATE_BYTES = 262144;

    /**
     * @param array<string, mixed> $requestBody Assoziativ dekodierter Koerper — fuer die Formpruefung.
     * @param string $rawBody Derselbe Koerper im Original — daraus kommt der Zustand wortgetreu.
     * @return array{episode_id: string|null, node_id: string|null, state_json: string}
     */
    public function validateUpsert(array $requestBody, string $rawBody): array
    {
        $positionRule = Validator::optional(Validator::stringType()->length(1, self::MAXIMUM_POSITION_LENGTH));

        $rules = Validator::key('episode_id', $positionRule, false)
            ->key('node_id', $positionRule, false)
            ->key('state', Validator::arrayType());

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(422, 'Der Spielstand hat nicht das erwartete Format', $failure);
        }

        $version = $requestBody['state']['version'] ?? null;

        if ($version !== self::SUPPORTED_STATE_VERSION) {
            // Bewusst hart: ein unbekanntes Format still zu speichern hiesse,
            // spaeter nicht mehr zu wissen, was in der Spalte steht.
            throw new ApiException(422, 'Unbekannte Version des Spielstands');
        }

        return [
            'episode_id' => $this->optionalString($requestBody['episode_id'] ?? null),
            'node_id' => $this->optionalString($requestBody['node_id'] ?? null),
            'state_json' => $this->extractStateJson($rawBody),
        ];
    }

    /**
     * Holt den Zustand aus dem Rohtext statt aus dem assoziativen Array: PHP
     * macht aus einem leeren Objekt `{}` beim Dekodieren eine leere Liste,
     * und die kaeme beim Kind als kaputter Fortschritt wieder an.
     */
    private function extractStateJson(string $rawBody): string
    {
        $body = json_decode($rawBody, false);

        if (!$body instanceof stdClass || !isset($body->state) || !$body->state instanceof stdClass) {
            throw new ApiException(422, 'Der Spielstand hat nicht das erwartete Format');
        }

        $stateJson = json_encode($body->state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($stateJson === false) {
            throw new ApiException(422, 'Der Spielstand laesst sich nicht speichern');
        }

        if (strlen($stateJson) > self::MAXIMUM_STATE_BYTES) {
            throw new ApiException(422, 'Der Spielstand ist zu gross');
        }

        return $stateJson;
    }

    private function optionalString(mixed $value): ?string
    {
        return $value === null ? null : (string) $value;
    }
}
