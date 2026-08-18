<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;

final class AchievementValidator
{
    // Laenge wie die Spalten in player_achievements (Migration 010) — sonst
    // scheitert erst die Datenbank, und der Aufrufer bekaeme eine 500 statt
    // einer Auskunft, was an seiner Eingabe nicht passt.
    private const MAXIMUM_KEY_LENGTH = 100;

    /**
     * @return array{theme_id: string, achievement_key: string}
     */
    public function validateUnlock(array $requestBody): array
    {
        $rules = Validator::key('theme_id', Validator::stringType()->length(1, self::MAXIMUM_KEY_LENGTH))
            ->key('achievement_key', Validator::stringType()->length(1, self::MAXIMUM_KEY_LENGTH));

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(422, 'Welt oder Erfolg hat nicht das erwartete Format', $failure);
        }

        return [
            'theme_id' => (string) $requestBody['theme_id'],
            'achievement_key' => (string) $requestBody['achievement_key'],
        ];
    }
}
