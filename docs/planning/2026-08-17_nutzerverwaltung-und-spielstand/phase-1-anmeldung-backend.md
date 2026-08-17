# Phase 1 — Anmeldung im Backend

Der erste Repository-Code des Projekts, die Sitzung als Cookie und ein
Routenschutz, der alles außer der Anmeldung selbst hinter die Anmeldung stellt.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Anmeldung, Fehlerkörper)
- [docs/conventions/php.md](../../conventions/php.md)
- `backend/public/index.php` — Routing, Fehlerbehandlung, Auto-Migration
- `backend/src/Middleware/JwtAuthMiddleware.php` — `issue()`/`verify()` gibt es schon
- `backend/src/Middleware/CorsMiddleware.php`
- `backend/src/Http/JsonResponse.php`, `backend/src/Database/Connection.php`
- `backend/src/Controllers/ContentController.php` — Muster für einen Controller
- `backend/src/Migrations/sql/002_create_users.sql` — Spalten der Tabelle `users`

## Abnahmekriterien

1. `POST /api/auth/login` mit richtigen Daten antwortet `200` mit dem
   Benutzerobjekt und setzt das Cookie `qst_session` genau wie im Kontrakt.
2. Falsche E-Mail und falsches Passwort antworten beide `401` mit derselben
   Meldung („E-Mail oder Passwort stimmt nicht") — kein Hinweis darauf, welche
   der beiden Angaben falsch war.
3. `GET /api/auth/me` antwortet mit gültigem Cookie `200`, ohne `401`.
4. `POST /api/auth/logout` antwortet `204` und setzt ein Cookie mit
   abgelaufenem Datum.
5. Jeder Aufruf unter `/api/` außer `auth/login`, `health` und `migrate`
   antwortet ohne gültiges Cookie mit `401` — auch die Content-Routen.
6. `php backend/bin/create-user.php <email> <benutzername> <passwort>` legt
   einen Account an und meldet dessen ID. Ein zweiter Aufruf mit derselben
   E-Mail bricht mit einer verständlichen Meldung ab, statt eine
   Datenbank-Ausnahme durchzureichen.
7. Der PHP-Linter läuft grün.

## Checkliste

- [ ] Ordner `backend/src/Repositories/` anlegen, dazu
      `backend/src/Repositories/UserRepository.php`:
      `findByEmail(string $email): ?array` und `touchLastLogin(int $userId): void`.
      PDO über `Connection::pdo()`, vorbereitete Anweisungen, keine
      String-Verkettung in SQL.
- [ ] Ordner `backend/src/Validators/` anlegen, dazu
      `backend/src/Validators/LoginValidator.php` auf Basis von
      `respect/validation` (steht bereits in `composer.json`): E-Mail muss eine
      E-Mail sein, Passwort mindestens 8 Zeichen. Bei Verstoß
      `ApiException(422, …)`.
- [ ] `backend/src/Services/AuthService.php`: `login(string $email, string $password): array`
      (prüft mit `password_verify` gegen `password_hash`, wirft
      `ApiException(401, 'E-Mail oder Passwort stimmt nicht')`),
      `userFromToken(string $token): array`.
      🟡 **Bewusst gleiche Laufzeit bei unbekannter E-Mail:** Findet das
      Repository keinen Benutzer, trotzdem ein `password_verify` gegen einen
      festen Dummy-Hash ausführen, bevor der Fehler kommt — sonst verrät die
      Antwortzeit, welche E-Mail-Adressen existieren.
- [ ] `backend/src/Http/SessionCookie.php`: `issue(string $token): void` und
      `clear(): void` über `setcookie()` mit den Werten aus dem Kontrakt.
      `Secure` nur setzen, wenn `($_ENV['APP_ENV'] ?? '') !== 'local'`.
      `read(): ?string` liest `$_COOKIE['qst_session']`.
- [ ] `backend/src/Controllers/AuthController.php` mit `login()`, `logout()`,
      `me()`. Der Anfragekörper kommt als JSON — dafür in
      `backend/src/Http/` einen kleinen Leser ergänzen
      (`RequestBody::json(): array`), damit nicht jeder Controller
      `file_get_contents('php://input')` selbst aufruft.
- [ ] `backend/public/index.php`: die drei Auth-Routen registrieren und **nach**
      dem Routen-Treffer, **vor** dem Controller-Aufruf den Sitzungs-Schutz
      einhängen. Die Liste der offenen Routen steht als Konstante direkt daneben
      (`auth/login`, `health`, `migrate`) — keine verstreuten Ausnahmen.
      Der geprüfte Benutzer wird dem Controller als Konstruktor-Argument
      übergeben, damit kein Controller selbst am Cookie herumfummelt.
      🟡 Der Aufruf der Controller erfolgt heute über
      `(new $controllerClass())->{$method}(...)` — das muss so erweitert werden,
      dass geschützte Controller den angemeldeten Benutzer bekommen und offene
      nicht. Einfachster Weg ohne Container: eine kleine `Kernel`-Funktion in
      `index.php`, die abhängig von der Routenliste konstruiert.
- [ ] `CorsMiddleware` um `Access-Control-Allow-Credentials: true` ergänzen und
      sicherstellen, dass bei gesetzten Anmeldedaten **kein** `*` als erlaubte
      Herkunft ausgeliefert wird (Browser lehnt die Kombination ab).
- [ ] `backend/bin/create-user.php` — Account anlegen mit `password_hash`
      (`PASSWORD_DEFAULT`). Muster: `backend/bin/migrate.php`. Rolle immer
      `elternteil`.
- [ ] `backend/.env.example` und `deploy.env.example` gegenlesen: `JWT_SECRET`
      steht in beiden schon, `APP_ENV` ebenfalls — nur prüfen, nichts doppeln.

## Doku-Updates

- [ ] `docs/decisions/008-zugang-und-sitzung.md` anlegen: Kontext (privater
      Betrieb, Critical Rule 6), Optionen (Bearer-Token im Browser-Speicher /
      Sitzungs-Cookie / Serverpasswort vor dem Web-Ordner), Entscheidung
      (Cookie, weil nur damit auch die Dateiauslieferung dieselbe Sitzung
      prüfen kann), Konsequenzen (kein Registrierungs-Weg in der Oberfläche;
      Accounts nur per Skript; Sitzung 30 Tage; ohne Datenbank keine Anmeldung).
- [ ] `docs/code-map.md`: `Repositories/` und `Validators/` sind nicht mehr
      Soll-Zustand — Ist-Stand-Absatz im Backend-Abschnitt nachziehen, neue
      Zeile für `Http/SessionCookie.php` im selben Absatz.
- [ ] `docs/glossary.md`: Einträge „Account", „Sitzung" ergänzen (Abgrenzung
      zum bestehenden „Spielerprofil").

## Report-Back
