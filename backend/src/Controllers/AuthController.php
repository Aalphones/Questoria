<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\RequestBody;
use App\Http\SessionCookie;
use App\Services\AuthService;
use App\Validators\LoginValidator;

final class AuthController
{
    // Null nur auf der offenen Anmelde-Route; logout() und me() erreicht der
    // Aufruf erst, nachdem der Front-Controller die Sitzung geprueft hat.
    public function __construct(private readonly ?array $authenticatedUser = null)
    {
    }

    public function login(): array
    {
        $credentials = (new LoginValidator())->validate(RequestBody::json());
        $result = (new AuthService())->login($credentials['email'], $credentials['password']);

        SessionCookie::issue($result['token']);

        return ['user' => $result['user']];
    }

    public function logout(): never
    {
        SessionCookie::clear();

        JsonResponse::noContent();
    }

    public function me(): array
    {
        if ($this->authenticatedUser === null) {
            throw new ApiException(401, 'Nicht angemeldet');
        }

        return ['user' => $this->authenticatedUser];
    }
}
