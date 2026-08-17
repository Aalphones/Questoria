<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;

final class LoginValidator
{
    private const MINIMUM_PASSWORD_LENGTH = 8;

    /**
     * @return array{email: string, password: string}
     */
    public function validate(array $requestBody): array
    {
        $rules = Validator::key('email', Validator::email())
            ->key('password', Validator::stringType()->length(self::MINIMUM_PASSWORD_LENGTH, null));

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            // Bewusst ohne die Detailmeldungen der Bibliothek: die verraten,
            // welches der beiden Felder nicht passt, und sind englisch.
            throw new ApiException(422, 'E-Mail oder Passwort hat nicht das erwartete Format', $failure);
        }

        return [
            'email' => (string) $requestBody['email'],
            'password' => (string) $requestBody['password'],
        ];
    }
}
