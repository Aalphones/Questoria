<?php

declare(strict_types=1);

use App\Repositories\UserRepository;
use Dotenv\Dotenv;

require __DIR__ . '/../vendor/autoload.php';

// Es gibt bewusst keinen Registrierungsweg in der Oberflaeche: Questoria laeuft
// im privaten Kreis, Accounts legt der Betreiber hier an. Auf dem Strato-Paket
// gibt es keine Kommandozeile — dieses Skript setzt eine Datenbankverbindung von
// aussen voraus (siehe ADR-008).
Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

$arguments = array_slice($argv, 1);

if (count($arguments) !== 3) {
    fwrite(STDERR, "Aufruf: php bin/create-user.php <email> <benutzername> <passwort>\n");

    exit(1);
}

[$email, $username, $password] = $arguments;

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    fwrite(STDERR, "Das ist keine gueltige E-Mail-Adresse: {$email}\n");

    exit(1);
}

if (mb_strlen($password) < 8) {
    fwrite(STDERR, "Das Passwort braucht mindestens 8 Zeichen.\n");

    exit(1);
}

try {
    $users = new UserRepository();

    if ($users->findByEmail($email) !== null) {
        fwrite(STDERR, "Zu {$email} gibt es bereits einen Account.\n");

        exit(1);
    }

    $userId = $users->create($email, $username, password_hash($password, PASSWORD_DEFAULT), 'elternteil');
} catch (PDOException $failure) {
    // Faengt auch den Fall, dass der Benutzername schon vergeben ist — dafuer
    // gibt es keine eigene Vorabpruefung, die Datenbank weiss es ohnehin besser.
    fwrite(STDERR, "Der Account konnte nicht angelegt werden: {$failure->getMessage()}\n");

    exit(1);
} catch (Throwable $failure) {
    fwrite(STDERR, "Keine Verbindung zur Datenbank: {$failure->getMessage()}\n");

    exit(1);
}

echo "Account angelegt: {$username} <{$email}>, ID {$userId}\n";
