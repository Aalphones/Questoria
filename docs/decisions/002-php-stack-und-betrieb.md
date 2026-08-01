# ADR-002: PHP-Stack und Betriebsmodell des Backends

**Status:** entschieden · 01.08.2026

## Kontext

Das Backend soll auf einem Shared-Hosting-Paket bei Strato laufen. Das Paket
bietet PHP, MySQL und Dateizugriff per FTP — aber **keinen
Kommandozeilenzugang**. Auf dem Server lässt sich also nichts starten, nichts
installieren und nichts nachbauen; alles muss fertig hochgeladen werden.

Auf der Entwicklungsmaschine gab es zu Beginn dieser Phase weder PHP noch
Composer noch MySQL. Das Schwesterprojekt CardMaker hat daraus den Schluss
gezogen, ganz auf Bibliotheken zu verzichten und die gebrauchten Bausteine
selbst zu schreiben.

Zwei Fragen waren zu beantworten: Welcher PHP-Stack? Und wo entsteht das, was
auf dem Server landet?

## Optionen

**Zum Stack:**

1. Ein Framework (Symfony, Laravel) — bringt alles mit, wiegt aber ein
   Vielfaches und setzt Dinge voraus, die Shared Hosting nicht hergibt.
2. Der Mini-Stack des Schwesterprojekts promptigofant — FastRoute für die
   Wegfindung, `firebase/php-jwt` für Anmelde-Token, `phpdotenv` für die
   Konfiguration, Monolog fürs Protokoll, `respect/validation` für die
   Eingabeprüfung.
3. Ganz ohne Bibliotheken, alles selbst geschrieben (der CardMaker-Weg).

**Zum Betrieb:**

- (a) PHP und Composer lokal installieren, alles hier bauen, das Ergebnis
  hochladen.
- (b) Nichts lokal installieren und dafür auf Bibliotheken verzichten, weil das
  Abhängigkeitsverzeichnis sonst nirgends entstehen kann.

## Entscheidung

**Stack: Option 2. Betrieb: Option (a).**

Gebaut wird mit dem portablen PHP 8.5.9 und Composer 2.10.2 aus
`develop/.tools` — dieselbe Umgebung, die auch die Schwesterprojekte benutzen.
Damit entsteht das Abhängigkeitsverzeichnis hier, und der Mini-Stack des
Schwesterprojekts bleibt wie geplant bestehen — insbesondere die geprüfte
Bibliothek für die Anmelde-Token. **Kryptografie wird in diesem Projekt nicht
selbst geschrieben**, und eine Lernplattform mit Kinderprofilen ist der falsche
Ort, um damit anzufangen.

**Lokal dieselbe PHP-Fassung wie auf dem Server** (dort läuft 8.5.7):
`config.platform.php` in `backend/composer.json` nagelt die Zielplattform auf
8.5 fest, damit die Abhängigkeiten gegen die Umgebung aufgelöst werden, in der
sie tatsächlich laufen. Der Prüflauf in der CI muss dieselbe Fassung benutzen,
sonst scheitert er an den Plattform-Anforderungen.

**Das Backend läuft nur auf dem Server.** Das Frontend wird lokal entwickelt und
spricht gegen die dort laufende API. Hochgeladen wird per `deploy.cmd` im
Projektstamm: Es schreibt die Serverkonfiguration aus `deploy.env`, holt die
Abhängigkeiten ohne Entwicklungswerkzeuge, baut das Frontend und schiebt beides
per WinSCP hoch. `deploy.env` ist die einzige Stelle mit Zugangsdaten und liegt
nicht im Git.

## Konsequenzen

- **Die Herkunftssperre (CORS) ist kein Beiwerk, sondern Voraussetzung.** Ein
  Frontend auf `http://localhost:4200`, das eine API auf einer fremden Adresse
  anspricht, wird sonst vom Browser blockiert. Jeder neue Endpoint muss die
  erlaubten Herkünfte im Blick behalten.
- **Es gibt keine lokale Datenbank.** `db_connected` ist bei einem lokalen Start
  erwartbar `false`. Wie das Schema ohne Kommandozeile auf den Server kommt, ist
  in Phase 3 zu klären — entweder ein Runner, der von hier aus gegen die
  entfernte Datenbank läuft (falls Strato Fernzugriff erlaubt), oder ein
  tokengeschützter Endpoint, der ihn dort auslöst.
- **Wo der Programmcode auf dem Server liegt, regelt
  [ADR-003](003-backend-ausserhalb-des-webbereichs.md)** — er liegt neben dem
  ausgelieferten Bereich, nicht darin.
- **Ein Tippfehler zeigt sich lokal, nicht erst nach dem Hochladen** — anders als
  im Schwesterprojekt CardMaker, wo mangels PHP gar nichts vorab geprüft werden
  kann. Der lokale Start und `composer lint` sind hier der Gate.
- **Jede Backend-Änderung braucht einen Hochlade-Lauf.** Es gibt keine
  Bau-Automatik, die das übernimmt.
