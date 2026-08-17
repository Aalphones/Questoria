<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;

final class CreateUserValidator
{
    private const MINIMUM_PASSWORD_LENGTH = 8;

    // Laenge wie in der Tabelle users (VARCHAR(50)/VARCHAR(255)) — sonst
    // scheitert erst die Datenbank, und der Aufrufer bekaeme eine 500 statt
    // einer Auskunft, was an seiner Eingabe nicht passt.
    private const MAXIMUM_USERNAME_LENGTH = 50;
    private const MAXIMUM_EMAIL_LENGTH = 255;

    /**
     * @return array{email: string, username: string, password: string}
     */
    public function validate(array $requestBody): array
    {
        $rules = Validator::key('email', Validator::email()->length(null, self::MAXIMUM_EMAIL_LENGTH))
            ->key('username', Validator::stringType()->length(2, self::MAXIMUM_USERNAME_LENGTH))
            ->key('password', Validator::stringType()->length(self::MINIMUM_PASSWORD_LENGTH, null));

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(
                422,
                'E-Mail, Benutzername oder Passwort hat nicht das erwartete Format',
                $failure,
            );
        }

        return [
            'email' => (string) $requestBody['email'],
            'username' => (string) $requestBody['username'],
            'password' => (string) $requestBody['password'],
        ];
    }
}
