<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;

final class ProfileValidator
{
    private const MAXIMUM_DISPLAY_NAME_LENGTH = 50;

    private const MAXIMUM_AVATAR_LENGTH = 255;

    /**
     * @return array{display_name: string, avatar: string|null}
     */
    public function validateCreate(array $requestBody): array
    {
        $rules = Validator::key('display_name', Validator::stringType()->length(1, self::MAXIMUM_DISPLAY_NAME_LENGTH))
            ->key('avatar', Validator::optional(Validator::stringType()->length(0, self::MAXIMUM_AVATAR_LENGTH)));

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(422, 'Name oder Bild hat nicht das erwartete Format', $failure);
        }

        $avatar = $requestBody['avatar'] ?? null;

        return [
            'display_name' => (string) $requestBody['display_name'],
            'avatar' => $avatar === null ? null : (string) $avatar,
        ];
    }

    /**
     * PATCH erlaubt eine Teilmenge — nur Felder pruefen, die tatsaechlich
     * mitgeschickt wurden. Ein leerer Body ist gueltig (kein-op).
     *
     * @return array<string, string|null>
     */
    public function validateUpdate(array $requestBody): array
    {
        $rules = Validator::allOf();

        if (array_key_exists('display_name', $requestBody)) {
            $rules = $rules->key(
                'display_name',
                Validator::stringType()->length(1, self::MAXIMUM_DISPLAY_NAME_LENGTH),
            );
        }

        if (array_key_exists('avatar', $requestBody)) {
            $rules = $rules->key(
                'avatar',
                Validator::optional(Validator::stringType()->length(0, self::MAXIMUM_AVATAR_LENGTH)),
            );
        }

        if (array_key_exists('selected_theme', $requestBody)) {
            $rules = $rules->key('selected_theme', Validator::optional(Validator::stringType()->length(1, 100)));
        }

        if (array_key_exists('selected_level', $requestBody)) {
            $rules = $rules->key('selected_level', Validator::optional(Validator::stringType()->length(1, 50)));
        }

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(422, 'Mindestens eines der Felder hat nicht das erwartete Format', $failure);
        }

        $fields = [];

        foreach (['display_name', 'avatar', 'selected_theme', 'selected_level'] as $column) {
            if (array_key_exists($column, $requestBody)) {
                $value = $requestBody[$column];
                $fields[$column] = $value === null ? null : (string) $value;
            }
        }

        return $fields;
    }
}
