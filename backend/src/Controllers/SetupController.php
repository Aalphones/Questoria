<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\RequestBody;
use App\Repositories\UserRepository;
use App\Validators\CreateUserValidator;
use PDOException;

/**
 * Legt einen Account an — der einzige Weg zum ERSTEN Account.
 *
 * backend/bin/create-user.php braucht eine Datenbankverbindung von aussen, die
 * das Strato-Paket nicht hergibt (Port 3306 geschlossen, geprueft 17.08.2026),
 * und eine Kommandozeile gibt es dort auch nicht. Bliebe es dabei, koennte sich
 * nie jemand anmelden. Es gibt bewusst keinen Registrierungsweg in der
 * Oberflaeche (Critical Rule 6) — dieser Endpunkt ersetzt ihn nicht, er ist das
 * Betreiber-Werkzeug mit eigenem Token.
 */
final class SetupController
{
    public function createUser(): never
    {
        // Gleiches Muster wie MigrateController und api-bridge/diag.php:
        // falsches oder fehlendes Token antwortet 404, nicht 401 — kein Scan
        // soll den Endpunkt ueberhaupt als vorhanden erkennen.
        $expectedToken = $_ENV['SETUP_TOKEN'] ?? '';
        $providedToken = $_SERVER['HTTP_X_SETUP_TOKEN'] ?? '';

        if ($expectedToken === '' || !hash_equals($expectedToken, $providedToken)) {
            throw new ApiException(404, 'Not Found');
        }

        $account = (new CreateUserValidator())->validate(RequestBody::json());
        $users = new UserRepository();

        if ($users->findByEmail($account['email']) !== null) {
            throw new ApiException(409, 'Zu dieser E-Mail gibt es bereits einen Account');
        }

        try {
            $userId = $users->create(
                $account['email'],
                $account['username'],
                password_hash($account['password'], PASSWORD_DEFAULT),
                'elternteil',
            );
        } catch (PDOException $failure) {
            // Faengt vor allem den vergebenen Benutzernamen. Dafuer gibt es
            // keine eigene Vorabpruefung — die Datenbank weiss es ohnehin
            // besser, und eine 500 waere hier eine Luege.
            throw new ApiException(409, 'Benutzername oder E-Mail ist schon vergeben', $failure);
        }

        JsonResponse::send(201, [
            'user' => [
                'id' => $userId,
                'username' => $account['username'],
                'role' => 'elternteil',
            ],
        ]);
    }
}
