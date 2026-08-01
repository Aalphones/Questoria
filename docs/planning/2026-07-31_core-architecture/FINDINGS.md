# Findings — Core Architecture

Erkenntnisse während der Umsetzung, die eine spätere Phase betreffen. Format:

- [ ] → Phase N: <Erkenntnis>

---

- [ ] → Meilenstein 2 (Content-API): Der Angular-Build kann **keine** Assets
  außerhalb von `frontend/` einsammeln — `data/themes/` im
  Repository-Wurzelverzeichnis landet nicht im Build (ADR-001). Solange die
  Content-Schnittstelle fehlt, liegt Content nur unter `frontend/public/`.
  Wer echten Content vor der API braucht, braucht einen Kopier-Schritt vor
  dem Build.
- [x] → Phase 2 (Backend): PHP und MySQL sind auf dieser Maschine **nicht im
  PATH**. Vor Phase 2 installieren oder Pfade setzen, sonst scheitert schon
  `composer install`.
  **Erledigt (2026-08-01):** PHP 8.2.31 (ohne Threads) nach `C:\Tools\php-8.2`,
  Composer 2.10.2 nach `C:\Tools\composer`, beides im Suchpfad des Benutzers.
  Der winget-Eintrag für PHP 8.2 zeigt auf einen toten Link (php.net hat die
  Fassung ins Archiv verschoben) — der Weg ging über das Archiv von php.net
  direkt. MySQL bleibt bewusst uninstalliert.
- [ ] → Phase 3 (Schema): Das Ziel-Hosting hat **keinen Kommandozeilenzugang**.
  Ein Migrations-Runner, der per `php bin/migrate.php` auf dem Server gestartet
  wird, ist damit unmöglich. Vor dem Bauen klären: erlaubt Strato Fernzugriff
  auf MySQL (dann läuft der Runner lokal gegen die entfernte Datenbank), oder
  braucht es einen tokengeschützten Endpoint, der ihn auslöst? Das
  Schwesterprojekt CardMaker hat sich für den Endpoint entschieden.
  **Hinweis aus Phase 2:** Das Muster für einen tokengeschützten Aufruf steht
  bereits — `api-bridge/diag.php` prüft `X-Diag-Token` gegen `DIAG_TOKEN` aus
  der Konfiguration und antwortet ohne gültigen Wert mit `404`.
- [ ] → alle weiteren Phasen: **Das Paket beantwortet jeden unbekannten Pfad mit
  der Startseite und Status `200`.** Ein `200` auf `/irgendwas` beweist also
  nicht, dass es dort etwas gibt — beim Prüfen immer den Inhalt ansehen, nicht
  den Statuscode. Praktischer Nebeneffekt: Angulars Deep-Links funktionieren
  ohne eigene Umschreibungsregel im Webbereich. Verlassen sollte man sich darauf
  nicht; ändert das Paket sein Verhalten, braucht der Frontend-Build eine eigene
  Regel.
- [ ] → Meilenstein 2 (Content-API): Beim lokalen Entwickeln leitet
  `frontend/proxy.conf.json` alles unter `/api` an `questoria.info` weiter. Neue
  Aufrufe im Frontend deshalb **relativ** schreiben (`/api/...`), nie mit
  absoluter Adresse — sonst funktioniert lokal etwas anderes als in Betrieb.
- [ ] → Phase 3 (Schema) / Meilenstein 4: Das Frontend wird lokal entwickelt und
  spricht gegen die API auf dem Server. Jeder neue Endpoint braucht die
  Herkunft `http://localhost:4200` in `CORS_ORIGINS`, sonst sieht der Browser
  nur einen Verbindungsfehler und nicht die eigentliche Antwort.
- [ ] → Phase 2/3: Die Testpflicht ist projektweit gestrichen (siehe
  `docs/conventions/testing.md`) — kein PHPUnit, kein `composer test`, kein
  Test-Schritt in der CI. Die JWT-Middleware wird von Hand gegengeprüft.
- [ ] → Meilenstein 2 (Karten): Die Abstands-Tokens stammen wertgleich aus
  dem Prototyp und sind krumme Pixelwerte (4.4px, 8.8px …). Für die
  Kartenansichten prüfen, ob daraus eine saubere Skala in `rem` wird —
  sobald das passiert, ändert sich nur die Token-Datei, keine Komponente.
