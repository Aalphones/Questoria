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

PHP 8.2.31 und Composer 2.10.2 wurden auf der Entwicklungsmaschine
installiert. Damit entsteht das Abhängigkeitsverzeichnis hier, und der Mini-Stack
des Schwesterprojekts bleibt wie geplant bestehen — insbesondere die geprüfte
Bibliothek für die Anmelde-Token. **Kryptografie wird in diesem Projekt nicht
selbst geschrieben**, und eine Lernplattform mit Kinderprofilen ist der falsche
Ort, um damit anzufangen.

Bewusst PHP 8.2 und nicht neuer: Die Abhängigkeiten werden gegen genau die
Untergrenze aufgelöst, die das Projekt zusagt (`config.platform.php` in
`backend/composer.json` nagelt das fest). Was so entsteht, läuft auch auf einem
Server mit 8.3, 8.4 oder 8.5 — umgekehrt gilt das nicht.

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
- **Zwei Zugriffsregel-Dateien statt einer.** `backend/public/.htaccess` leitet
  alles auf den Einstiegspunkt um. `backend/.htaccess` eine Ebene darüber ist der
  Notnagel für den Fall, dass die Web-Wurzel nicht auf `public/` gelegt werden
  kann — ohne sie stünden Quellcode, Zugangsdaten und Protokolle im Netz.
- **Ein Tippfehler zeigt sich lokal, nicht erst nach dem Hochladen** — anders als
  im Schwesterprojekt CardMaker, wo mangels PHP gar nichts vorab geprüft werden
  kann. Der lokale Start und `composer lint` sind hier der Gate.
- **Jede Backend-Änderung braucht einen Hochlade-Lauf.** Es gibt keine
  Bau-Automatik, die das übernimmt.
