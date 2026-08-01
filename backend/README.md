# backend/ — Questoria REST-API

PHP 8.2, kein Framework. Wegfindung, Anmelde-Token, Konfiguration, Protokoll und
Eingabeprüfung kommen aus fünf kleinen Bibliotheken; Konventionen und Ziel-Layout
stehen in [docs/conventions/php.md](../docs/conventions/php.md).

## Wo das hier läuft

**Auf dem Server, nicht auf deinem Rechner.** Gebaut wird lokal, betrieben wird
auf dem Shared-Hosting-Paket — der Server hat keinen Kommandozeilenzugang, dort
lässt sich also nichts installieren. Begründung:
[ADR-002](../docs/decisions/002-php-stack-und-betrieb.md).

Das Frontend wird lokal entwickelt und spricht gegen die API auf dem Server.
Deshalb muss dessen Adresse in `CORS_ORIGINS` stehen — sonst blockiert der
Browser jede Anfrage, und zwar mit einer Meldung, die wie ein Netzwerkproblem
aussieht.

## Örtlich starten (zum Ausprobieren)

```
composer install
copy .env.example .env
php -S localhost:8000 -t public
```

Dann `http://localhost:8000/api/health` aufrufen. Erwartet:

```json
{"status":"ok","php_version":"8.2.31","db_connected":false}
```

`db_connected: false` ist hier richtig — es gibt bewusst keine lokale Datenbank.
Auf dem Server muss dort `true` stehen; tut es das nicht, stimmen die
Datenbankwerte in `deploy.env` nicht.

## Auf den Server bringen

Aus dem Projektstamm, nicht von hier:

```
deploy.cmd            Backend und Frontend
deploy.cmd backend    nur das Backend
deploy.cmd frontend   nur das Frontend
```

Beim ersten Mal `deploy.env.example` nach `deploy.env` kopieren und die
Zugangsdaten eintragen. Die Datei liegt nicht im Git und ist die einzige Stelle,
an der Geheimnisse stehen — `backend/.env` wird bei jedem Lauf daraus neu
geschrieben und kann deshalb nicht veralten.

## Stil prüfen

```
composer lint       meldet Abweichungen
composer lint:fix   räumt sie auf
```
