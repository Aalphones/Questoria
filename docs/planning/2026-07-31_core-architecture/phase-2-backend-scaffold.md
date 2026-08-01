# Phase 2: Backend-Scaffold & Deploy-Skript

Rating: **heikel** (JWT/Auth-Skelett ist security-relevant, auch als Stub; dazu
der erste Weg auf den Server)

> **Ergänzt am 2026-08-01.** Der Bibliotheks-Stack bleibt wie geplant — PHP 8.2.31
> und Composer 2.10.2 sind jetzt lokal installiert (`C:\Tools\php-8.2`,
> `C:\Tools\composer`), `vendor/` entsteht also hier und wird mit hochgeladen.
> Neu dazu kommt das Betriebsmodell: **das Backend läuft auf dem Strato-Paket,
> das Frontend wird lokal entwickelt und spricht gegen die dort laufende API.**
> Daraus folgen drei Ergänzungen, die der Ursprungsplan nicht hatte:
> eine Herkunftssperre (CORS), Zugriffsregeln per `.htaccess` und ein
> Hochlade-Skript. Begründung: [ADR-002](../../decisions/002-php-stack-und-betrieb.md).

## Kontext (vorher lesen)

- [docs/conventions/php.md](../../conventions/php.md) — Stack, Layout, Critical Rules
- [docs/conventions/testing.md](../../conventions/testing.md) — **keine automatisierten Tests in diesem Projekt**, Lint + Build sind der einzige Gate
- `promptigofant/backend/composer.json` + `.php-cs-fixer.php` (Schwesterprojekt, gleiches Muster — als Vorlage lesen, nicht kopieren, PHP-Version-Pin ist anders: 8.2+ statt 8.1+)
- `CardMaker/deploy.cmd` + `CardMaker/deploy.env.example` (Schwesterprojekt, gleicher Host, gleiche Maschine — Vorlage für das Hochlade-Skript)

## Voraussetzungen (nur der Nutzer kann sie liefern — blockieren das Hochladen, nicht das Bauen)

1. Adresse auf dem Strato-Paket, die auf ein eigenes Verzeichnis für die API zeigt, plus die Zieladresse für die App.
2. FTP- oder SFTP-Zugang: Protokoll, Host, Benutzer, Passwort (bei SFTP zusätzlich der Fingerabdruck — den meldet WinSCP beim ersten Verbinden).
3. MySQL-Datenbank samt Host, Name, Benutzer, Passwort.
4. Bestätigung, dass im Strato-Panel PHP **8.2 oder höher** eingestellt ist.

Steht etwas davon aus: Code fertig bauen, lokal prüfen, Hochladen aussetzen und
im Report-Back festhalten.

## Akzeptanzkriterien

1. `composer install` läuft ohne Fehler, `composer lint` (php-cs-fixer, `--dry-run`) läuft grün.
2. `php -S localhost:8000 -t backend/public` beantwortet `GET /api/health` mit Status 200,
   `Content-Type: application/json` und einem Rumpf, der `status`, `php_version` und
   `db_connected` enthält. Ohne erreichbare Datenbank ist `db_connected: false` — das ist
   lokal der erwartete Zustand, kein Fehler.
3. Eine unbekannte Route liefert 404 als JSON-Fehlerumschlag
   (`{"error":{"code":404,"message":"Not Found"}}`), eine falsche Methode auf einem bekannten
   Pfad 405 im selben Format — keine rohe PHP-Warnung, kein Dateisystempfad in der Antwort.
4. JWT-Middleware manuell gegengeprüft: ein kurzes Wegwerf-Skript signiert einen Token und
   liest ihn wieder aus, ein manipulierter Token wirft `ApiException`. Ergebnis im Report-Back
   festhalten, Skript danach löschen (**nicht committen**).
5. `.env.example` vorhanden, `.env` ist gitignored; `deploy.env` ebenfalls.
6. Ein Aufruf aus dem Browser von `http://localhost:4200` wird nicht von der Herkunftssperre
   blockiert, eine fremde Herkunft schon.
7. Doppelklick auf `deploy.cmd` meldet ohne Zugangsdaten im Klartext, welcher Wert fehlt, und
   hält das Fenster offen. Mit Zugangsdaten lädt es hoch und meldet Erfolg oder Fehler
   deutlich.

## Implementation

- [x] `php -v` prüfen (Konfidenz-Ausweis README) — **erledigt: 8.2.31 (NTS), lokal installiert**
- [x] `backend/composer.json` anlegen (PSR-4 `App\` → `src/`):
      ```json
      {
        "name": "questoria/backend",
        "description": "Questoria PHP REST API",
        "type": "project",
        "require": {
          "php": ">=8.2",
          "firebase/php-jwt": "^7.0",
          "vlucas/phpdotenv": "^5.6",
          "nikic/fast-route": "^1.3",
          "monolog/monolog": "^3.7",
          "respect/validation": "^2.3"
        },
        "require-dev": {
          "friendsofphp/php-cs-fixer": "^3.65"
        },
        "autoload": { "psr-4": { "App\\": "src/" } },
        "scripts": {
          "lint": "php-cs-fixer fix --config=.php-cs-fixer.php --dry-run --diff",
          "lint:fix": "php-cs-fixer fix --config=.php-cs-fixer.php"
        },
        "config": { "sort-packages": true, "optimize-autoloader": true }
      }
      ```
      **Zusätzlich `config.platform.php` auf `8.2.0` pinnen** — die Abhängigkeiten werden dann
      gegen 8.2 aufgelöst, egal welche PHP-Version lokal läuft. Was so entsteht, läuft auch
      auf einem Server mit 8.3/8.4/8.5; umgekehrt gilt das nicht.
- [x] `backend/.php-cs-fixer.php` — identisches Regelwerk wie promptigofant (`@PSR12`, `declare_strict_types`, short array syntax, `single_quote`, `ordered_imports`, `trailing_comma_in_multiline`), `Finder` über `src/` und `public/`
- [x] `backend/.env.example`:
      ```
      APP_ENV=local
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_NAME=questoria
      DB_USER=questoria
      DB_PASS=
      JWT_SECRET=change-me-in-production
      CORS_ORIGINS=http://localhost:4200
      ```
- [x] `backend/src/Http/JsonResponse.php` — statische Helper `send(int $status, array $payload): never` (setzt Header `Content-Type: application/json`, `http_response_code()`, `echo json_encode($payload)`, `exit`) und `error(int $status, string $message): never` für den einheitlichen Fehlerumschlag
- [x] `backend/src/Exceptions/ApiException.php` — `extends \RuntimeException`, trägt `int $statusCode`
- [x] `backend/src/Controllers/HealthController.php` — `handle(): array` gibt `status`, `php_version`, `db_connected` zurück. Ein fehlgeschlagener Datenbankverbindungsaufbau ist **kein** Fehler der Auskunft, sondern deren Ergebnis (`db_connected: false`) — ohne Kommandozeile auf dem Server ist das die einzige Möglichkeit, die Zugangsdaten zu prüfen.
- [x] `backend/src/Middleware/JwtAuthMiddleware.php`:
      - Konstruktor nimmt `string $secret` (aus `$_ENV['JWT_SECRET']`)
      - `issue(array $claims): string` — signiert mit `Firebase\JWT\JWT::encode`, Algorithmus `HS256`
      - `verify(string $token): array` — `Firebase\JWT\JWT::decode`, wirft `ApiException(401, 'Invalid token')` bei Fehler
      - **Noch an keine Route gehängt** — nur das Skelett in dieser Phase, echte Nutzung kommt mit der User-API in Meilenstein 4; Roundtrip einmal von Hand gegenprüfen (AK 4)
- [x] `backend/src/Middleware/CorsMiddleware.php` — **neu gegenüber dem Ursprungsplan.** Erlaubte Herkünfte aus `CORS_ORIGINS` (kommagetrennt), setzt bei Treffer die Freigabe-Kopfzeilen, beantwortet `OPTIONS` mit `204`. Erlaubte Kopfzeilen: `Content-Type`, `Authorization`. Erlaubte Methoden: `GET, POST, PATCH, DELETE, OPTIONS`. Ohne das kann das lokal laufende Frontend die Server-API nicht ansprechen — genau das ist ab jetzt der Arbeitsmodus.
- [x] `backend/src/Database/Connection.php` — `static function pdo(): \PDO`, liest `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASS` aus `$_ENV`, DSN `mysql:host=...;port=...;dbname=...;charset=utf8mb4`, `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, `ATTR_EMULATE_PREPARES => false`, Singleton (statische Instanz-Variable)
- [x] `backend/public/index.php` — Front-Controller:
      1. `require __DIR__.'/../vendor/autoload.php'`
      2. `Dotenv\Dotenv::createImmutable(__DIR__.'/..')->safeLoad()` — `safeLoad`, damit ein fehlendes `.env` nicht sofort eine Ausnahme wirft; Pflichtwerte werden einzeln geprüft
      3. Monolog-Logger aufsetzen, schreibt nach `backend/logs/app.log`
      4. Herkunftssperre ausführen (`CorsMiddleware`), `OPTIONS` sofort beantworten
      5. FastRoute-Dispatcher: `GET /api/health` → `HealthController::handle`
      6. **Pfad um das Skriptverzeichnis kürzen, bevor verglichen wird** — liegt das Backend in einem Unterordner statt auf einer eigenen Adresse, kommt sonst `/unterordner/api/health` an und jeder Pfad läuft ins 404
      7. `Dispatcher::NOT_FOUND` → 404 JSON, `METHOD_NOT_ALLOWED` → 405 JSON
      8. Bei jeder gefangenen `\Throwable` → Log via Monolog, `JsonResponse::error(500, 'Internal Server Error')` (keine Stacktraces nach außen, siehe `php.md` Critical Rules)
- [x] `backend/public/.htaccess` — **neu.** Alles, was nicht auf eine existierende Datei zeigt, auf `index.php` umschreiben; `Options -Indexes`
- [x] `backend/.htaccess` — **neu.** Rückfallebene, falls die Web-Wurzel nicht auf `public/` gelegt werden kann: verweigert Zugriff auf `.env`, `src/`, `vendor/`, `logs/`
- [x] `backend/logs/.gitkeep` anlegen (Ordner muss existieren, Inhalt ist gitignored)
- [x] `docs/decisions/002-php-stack-und-betrieb.md` schreiben (ADR: Kontext = Shared Hosting ohne Kommandozeile + Schwesterprojekt-Konsistenz, Optionen = Framework vs. Micro-Stack und lokal bauen vs. auf dem Server bauen, Entscheidung = promptigofant-Muster + lokal bauen + per Skript hochladen, Konsequenzen)

### Deploy-Skript (neu gegenüber dem Ursprungsplan)

- [x] `deploy.env.example` im Projektstamm, jeder Wert im Klartext erklärt. Standardpfad für
      WinSCP: `C:\Users\<name>\AppData\Local\Programs\WinSCP\WinSCP.com`
- [x] `deploy.cmd` im Projektstamm, per Doppelklick lauffähig, Ziel wählbar (`backend`,
      `frontend`, ohne Angabe beides). Ablauf:
  1. `deploy.env` einlesen — **ohne** verzögerte Erweiterung, sonst verschluckt cmd ein
     Ausrufezeichen im Passwort; erst danach einschalten
  2. Fehlende Pflichtwerte einzeln benennen, nicht pauschal
  3. `backend\.env` aus den Werten schreiben — genau ein Ort für Geheimnisse, die Serverdatei
     kann nie veralten
  4. `composer install --no-dev --optimize-autoloader` im Backend, damit `vendor/` aktuell und
     ohne Entwicklungswerkzeuge hochgeht
  5. Frontend bauen (`npm --prefix frontend run build`), bei Fehler abbrechen — **kein**
     kaputter Stand geht hoch
  6. WinSCP-Skript erzeugen, Zugangsdaten als eigene Schalter (`-username=`/`-password=`),
     nicht in der Adresse — ein `#` oder `/` im Passwort zerschneidet sonst die Adresse
  7. Rückgabewert prüfen, Klartext melden, `pause`
- [x] Kein `-hostkey=*` in der ausgelieferten Fassung — das akzeptiert jeden Server, der sich
      für den richtigen ausgibt. Nur FTP verfügbar → `SFTP_PROTOCOL=ftp`, dann entfällt der
      Fingerabdruck; das Skript fängt den Fall ab.
- [x] `.gitattributes` anlegen: `*.cmd text eol=crlf`, `*.bat text eol=crlf` — ein
      Windows-Skript mit LF stolpert über seine eigenen Sprungmarken
- [x] `.gitignore` ergänzen: `deploy.env`

## Doc-Updates

- [x] `docs/code-map.md`: Backend-Tabelle prüfen, Deploy-Skript im Projektstamm ergänzen
- [x] `backend/README.md`: Platzhaltertext durch echten Quickstart ersetzen (Composer install,
      `.env` kopieren, `php -S`, plus der Hinweis, dass der echte Betrieb über `deploy.cmd` läuft)
- [x] `docs/conventions/css.md` neu (aus CardMaker adaptiert) und im Conventions-Index von
      `AGENTS.md` verlinken — auf Wunsch des Nutzers orientiert sich Questoria beim Styling am
      Schwesterprojekt

## Report-Back

**Stand: erledigt und live.** <https://questoria.info/api/health> antwortet mit
`{"status":"ok","php_version":"8.5.7","db_connected":true}`.

### Werkzeug

PHP gab es auf dieser Maschine zunächst scheinbar nicht, also wurde 8.2
nachinstalliert — überflüssig: Unter `develop/.tools` liegen längst ein
portables PHP 8.5.9 und Composer 2.10.2, dieselbe Umgebung wie in den
Schwesterprojekten. Die Doppelinstallation wurde wieder entfernt, gebaut wird mit
dem portablen Werkzeug. Randnotiz für später: Der winget-Eintrag für PHP 8.2
zeigt auf einen toten Link, php.net hat die Fassung ins Archiv verschoben.

### Der Aufbau auf dem Server (ADR-003)

Der SFTP-Zugang beginnt eine Ebene **über** dem ausgelieferten Bereich. Deshalb
liegt der Programmcode neben `public/`, und im Webbereich steht nur die Brücke
aus drei Dateien. Gemessen statt vermutet: `document_root` endet auf
`/htdocs/questoria/public`, `open_basedir` ist leer.

Die im ersten Entwurf eingebaute Pfadkürzung wurde wieder **entfernt** — sie
hätte im Brücken-Aufbau genau das `/api`-Präfix weggeschnitten, das die Routen
brauchen, und lautlos auf jeden Pfad mit 404 geantwortet. Jetzt wird der rohe
angefragte Pfad benutzt.

### Was geprüft ist

| Prüfung | Ergebnis |
|---|---|
| `composer install` | fehlerfrei, gegen PHP 8.5 aufgelöst |
| `composer lint` | 0 von 7 Dateien zu beanstanden |
| `GET /api/health` **live** | `200`, `{"status":"ok","php_version":"8.5.7","db_connected":true}` |
| unbekannter Pfad | `404`, `{"error":{"code":404,"message":"Not Found"}}` |
| falsche Methode | `405` im selben Format, mit `Allow: GET` |
| Herkunft `localhost:4200` | Freigabe-Kopfzeile gesetzt, `Vary: Origin` |
| fremde Herkunft | keine Freigabe-Kopfzeile |
| Vorab-Anfrage (`OPTIONS`) | `204` mit erlaubten Methoden und Kopfzeilen |
| `/api/.env`, `/api/src/…` **live** | `404` — der Programmcode liegt außerhalb des ausgelieferten Bereichs |
| Serverauskunft ohne Token **live** | `404`; mit Token die vollständige Auskunft |

**Anmelde-Token, von Hand gegengeprüft** (Wegwerf-Skript, außerhalb des Repos,
danach gelöscht): Token ausgestellt und wieder ausgelesen (`sub` und `exp`
unverändert); ein Token mit ausgetauschtem Inhalt wird mit `401 Invalid token`
abgewiesen; ein abgelaufener Token ebenso. Beide Abweisungen kommen als
`ApiException` mit dem richtigen Statuscode.

**Hochlade-Skript, gegen eine Attrappe statt gegen WinSCP:**

- Ein Passwort mit `!`, `&`, `<`, `>`, `|`, `#` und `/` überlebt Einlesen und
  Schreiben unverfälscht — genau die Zeichen, an denen Batch-Skripte zerbrechen.
- Die erzeugte WinSCP-Anweisung enthält die Ausschlussliste korrekt
  (`-filemask="|.env.example;logs/;.php-cs-fixer.php"`); das `|` wird nicht als
  Befehlstrenner verschluckt.
- Fehlerwege melden Klartext und halten das Fenster offen: unbekanntes Ziel,
  fehlende `deploy.env`, einzeln benannte fehlende Werte, fehlendes Werkzeug.
- Der Frontend-Build lief im Trockenlauf mit durch.

### Abweichungen vom Plan

1. **Schalter vor den Verzeichnissen** in der WinSCP-Anweisung — WinSCP erwartet
   diese Reihenfolge. Im Schwesterprojekt CardMaker war das eine nachträgliche
   Korrektur; hier gleich richtig gebaut.
2. **Verzögerte Erweiterung erst nach dem Einlesen eingeschaltet.** Vorher
   verschluckt cmd ein Ausrufezeichen im Passwort. Im Trockenlauf belegt.
3. **Prüfung auf vorhandenes Werkzeug ergänzt.** Fehlte Composer, meldete das
   Skript vorher nur cmds „falsch geschrieben oder konnte nicht gefunden
   werden". Jetzt steht dort, was fehlt und dass ein frisches Fenster hilft —
   der Fehler ist im Trockenlauf tatsächlich aufgetreten.
4. **`FRONTEND_DIST` als Wert in `deploy.env`** statt fest im Skript; der
   Ausgabepfad des Angular-Builds hat sich über die Versionen mehrfach geändert.
5. **`.gitattributes` neu**, nagelt `*.cmd`/`*.bat` auf CRLF fest. Ein
   Windows-Skript mit LF stolpert über seine eigenen Sprungmarken.
6. **`docs/conventions/css.md` neu** — auf Wunsch orientiert sich das Styling am
   Schwesterprojekt CardMaker. Der Bestand hielt die Doktrin bereits ein; die
   Datei schreibt sie nur fest und benennt einen offenen Punkt.

### Was der erste echte Lauf gekostet hat

Fünf Dinge, die der Trockenlauf **nicht** gefunden hat und die aus dem
Schwesterprojekt bzw. dem Serverlauf kamen:

1. **WinSCP legt Zielordner beim Abgleich nicht an.** Es braucht einen getrennten
   Vorlauf mit `mkdir` und `option batch continue`.
2. **`phpdotenv` schneidet unquotierte Werte am ersten `#` ab.** Die Werte in
   `backend/.env` gehören in einfache Anführungszeichen — sonst käme ein Passwort
   verstümmelt an, und der Fehler sähe aus wie falsche Zugangsdaten.
3. **Der Frontend-Abgleich hätte die API weggeräumt.** Die Brücke kommt im
   Frontend-Build nicht vor, `-delete` hätte sie beim nächsten Lauf gelöscht.
4. **Composer-Scripts brauchen `@php vendor/bin/…`** statt des nackten
   Binärnamens — sonst verlangen sie `php` im Suchpfad, was ein portables PHP
   nicht liefert.
5. **Der Fehlerbehandler muss `error_reporting()` respektieren.** Ohne diese
   Bedingung wäre auf PHP 8.5 jede Veralterungswarnung einer Bibliothek zu einer
   500 geworden.

Alle fünf sind für künftige Projekte auf diesem Paket festgehalten
(Wissensbestand, Thema „Strato Shared Hosting").

### Wo es klemmen kann

- **`/irgendwas` antwortet mit `200` und der Startseite.** Das Paket beantwortet
  jeden unbekannten Pfad so. Beim Prüfen also den Inhalt ansehen, nicht den
  Statuscode — sonst hält man den Fallback für eine offenliegende Datei. Genau
  das ist beim ersten Lauf passiert.
- **Die Protokolldatei braucht einen beschreibbaren Ordner.** Ist `logs/` auf dem
  Server nicht beschreibbar, antwortet die API trotzdem — der Fehlerbehandler
  fängt das ab —, aber es steht dann nichts im Protokoll. Bisher ungeprüft.
- **Die Brücke muss zum Backend passen.** Ändert sich der Name der
  Eintrittsstelle, ändert sich `api-bridge/index.php` mit.
