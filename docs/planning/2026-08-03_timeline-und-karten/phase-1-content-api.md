# Phase 1 — Content-Schnittstelle im Backend

**Rating:** heikel (Pfad-Härtung, neue Ablage auf dem Server, Deploy-Weg)

Das Backend liefert ab hier den Content aus dem JSON-Repository aus. Bilder
gehen weiter direkt über den Webserver, ohne PHP dazwischen.

## Kontext — vorher lesen

- [README.md](README.md) → Kontrakt-Sektion (Adressen, Fehlerfälle)
- [docs/conventions/php.md](../../conventions/php.md) — Stil, Namensschema
- [backend/public/index.php](../../../backend/public/index.php) — Routen-Tabelle,
  Fehlerbehandlung, Auto-Migration
- [backend/src/Controllers/HealthController.php](../../../backend/src/Controllers/HealthController.php)
  — Controller-Muster: Methode gibt ein Array zurück, `index.php` verpackt es
- [backend/src/Exceptions/ApiException.php](../../../backend/src/Exceptions/ApiException.php),
  [backend/src/Http/JsonResponse.php](../../../backend/src/Http/JsonResponse.php)
- [api-bridge/diag.php](../../../api-bridge/diag.php) — Serverauskunft, liefert
  `document_root`
- [deploy.cmd](../../../deploy.cmd) — Zielwahl (Zeile ~17), Ordner-Vorlauf
  (~150), Abgleich-Befehle (~166)
- [ADR-001](../../decisions/001-content-delivery-mvp-phase1.md) — was diese
  Phase ablöst

## Akzeptanzkriterien

1. `GET /api/content/themes` liefert den Inhalt von `data/main_hub.json`,
   `GET /api/content/themes/dev_fixture` den der `world_config.json`,
   `GET /api/content/themes/dev_fixture/episodes/<id>` die Episodendatei.
2. Diese Aufrufe liefern `404` mit `{"error":"Not Found"}`:
   `…/themes/gibtsnicht`, `…/themes/../../etc/passwd`,
   `…/themes/DEV_FIXTURE` (Großbuchstaben sind nicht erlaubt),
   `…/themes/dev_fixture/episodes/..%2f..%2fworld_config`.
3. `backend\serve.cmd` startet einen lokalen Server auf Port 8000, der die
   Aufrufe aus (1) aus dem Repository-Ordner `data/` beantwortet **und**
   `/content/themes/…/maps/x.webp` als Datei ausliefert.
4. `npm start` im Frontend erreicht beides über den Proxy, ohne absolute
   Adressen im Code.
5. `deploy.cmd content` lädt `data/` (ohne `_authoring/`) in den Content-Ordner
   des Webbereichs; `deploy.cmd frontend` löscht ihn danach **nicht**.
6. `composer lint` grün.

## Checkliste

### Vorab-Prüfung (blockiert den Rest der Phase)

- [ ] `api-bridge/diag.php` mit gültigem `X-Diag-Token` abrufen und
      `document_root` notieren. Ist das **nicht** der Ordner, in den
      `deploy.cmd` das Frontend legt (`REMOTE_WEB_PATH`), dann in Phase 1
      durchgängig den Not-Ausgang `CONTENT_PATH` benutzen und die Abweichung in
      [FINDINGS.md](FINDINGS.md) festhalten.

### Backend

- [ ] `backend/src/Services/ContentService.php` — neuer Ordner `Services/`.
      Verantwortung: Content-Wurzel bestimmen, IDs prüfen, Datei lesen, JSON
      dekodieren.
  - Wurzel: `$_ENV['CONTENT_PATH'] ?? ($_SERVER['DOCUMENT_ROOT'] . '/content')`
  - ID-Prüfung: `preg_match('/^[a-z0-9_]{1,64}$/', $id)` — schlägt sie fehl,
    sofort `ApiException` mit `404` (nicht `400`: eine erfundene ID soll sich
    verhalten wie ein nicht existierender Ort, nicht wie ein Formularfehler)
  - Nach dem Zusammenbauen des Pfads zusätzlich `realpath()` und prüfen, dass
    das Ergebnis mit der `realpath()`-Wurzel beginnt. Die ID-Prüfung allein
    reicht formal — der zweite Riegel steht, weil eine spätere Erweiterung des
    Musters sonst still ein Loch aufreißt. Kommentar genau dazu in den Code.
  - Datei fehlt / kein gültiges JSON → `ApiException` `404`
- [ ] `backend/src/Controllers/ContentController.php` mit drei Methoden
      (`themes()`, `world(string $themeId)`, `episode(string $themeId, string $episodeId)`),
      Rückgabe jeweils das dekodierte Array — Muster wie `HealthController`.
- [ ] Routen in `backend/public/index.php` ergänzen:
      `GET /api/content/themes`, `GET /api/content/themes/{themeId}`,
      `GET /api/content/themes/{themeId}/episodes/{episodeId}`.
- [ ] Prüfen, dass die Auto-Migration die Content-Aufrufe nicht ausbremst: sie
      läuft nach dem Routen-Treffer und schluckt ihre Fehler bereits — nichts
      zu ändern, nur einmal gegengelesen und hier abgehakt.

### Lokaler Entwicklungs-Server

- [ ] `backend/dev-router.php` — Weichen-Skript für den eingebauten
      PHP-Server, **nur für die Entwicklung**:
  - setzt `$_ENV['CONTENT_PATH']` auf `<repo>/data`, bevor irgendetwas anderes
    passiert (die Konfigurationsdatei überschreibt bestehende Werte nicht)
  - Pfade unter `/content/` → Datei aus `<repo>/data/` ausliefern, mit
    passendem `Content-Type`; fehlt sie, `404`
  - alles andere → `require __DIR__ . '/public/index.php'`
- [ ] `backend/serve.cmd` — startet
      `php -S localhost:8000 -t backend/public backend/dev-router.php`
      über `C:\Users\sasch\develop\.tools\php.cmd` (PHP liegt nicht im
      Suchpfad), mit einer Zeile Ausgabe, was gerade läuft und wie man es
      beendet.
- [ ] `frontend/proxy.conf.json`: `/api` **und** `/content` auf
      `http://localhost:8000`, `secure: false`. Der bisherige Eintrag auf
      questoria.info wird ersetzt — als Kommentarzeile in
      [FINDINGS.md](FINDINGS.md) vermerken, wie man zurückschaltet, wenn man
      gegen den echten Server testen will.

### Deploy

- [ ] `deploy.cmd`: drittes Ziel `content` (erlaubte Werte, Hilfetext, die
      `DO_*`-Weichen, „ohne Angabe = alles drei").
- [ ] Content-Abgleich mit Ausnahme des Autoren-Werkzeugs — sonst wandert die
      Python-Umgebung unter `data/_authoring/voice-tools/` mit auf den Server:
      `synchronize remote -delete -filemask="^|_authoring/" "data" "<Webbereich>content/"`
- [ ] Ordner-Vorlauf (`mkdir`) für den Content-Ordner ergänzen — WinSCP legt
      Zielordner beim Abgleich nicht selbst an.
- [ ] **Ausnahmeliste des Frontend-Abgleichs um `content/` erweitern**
      ([deploy.cmd:173](../../../deploy.cmd)). Ohne das löscht der nächste
      Frontend-Deploy den gesamten Content. Kommentar daneben, warum.
- [ ] `deploy.env.example` um die Content-Ablage ergänzen, falls dafür ein
      eigener Wert nötig wird (sonst aus `REMOTE_WEB_PATH` ableiten).

### Doku

- [ ] `docs/decisions/004-content-auslieferung-ab-meilenstein-2.md` (10 Zeilen):
      Kontext, Optionen (alles durch PHP schleusen · JSON außerhalb des
      Webbereichs · JSON per Schnittstelle + Bilder statisch), Entscheidung,
      Konsequenzen — inklusive der offenen Flanke, dass die Content-Dateien im
      Webbereich ohne Anmeldung erreichbar sind (siehe unten).
- [ ] ADR-001 oben mit einer Zeile als **abgelöst durch ADR-004** markieren —
      nicht löschen, nicht umschreiben.
- [ ] `docs/code-map.md`: Backend-Ist-Stand (`Services/`, `ContentController`),
      Projektstamm (`backend/serve.cmd`, `backend/dev-router.php`,
      deploy-Ziel `content`), Content-Repository (`data/` wird ausgeliefert).
- [ ] `AGENTS.md` → Abschnitt „Content-Repository": ein Satz, dass der Content
      ab jetzt über die Schnittstelle gelesen und mit `deploy.cmd content`
      hochgeladen wird.

## Chesterton's Fence

- **`frontend/proxy.conf.json` zeigt heute auf questoria.info**, weil es in
  Meilenstein 1 kein lokal lauffähiges Backend gab (kein PHP im Suchpfad, keine
  lokale Datenbank). Beides ist inzwischen anders: PHP liegt unter
  `.tools\`, und die Content-Aufrufe brauchen keine Datenbank. Der Eintrag wird
  ersetzt, nicht gelöscht — der Rückweg steht in FINDINGS.
- **`api-bridge/index.php` bleibt unangetastet.** Es reicht die Anfrage eine
  Ebene tiefer durch; neue Routen brauchen dort nichts.

## Risiken

- 🟡 **Der Content liegt im Webbereich und ist damit ohne Anmeldung lesbar** —
  Bilder zwingend (der Browser lädt sie direkt), die JSON-Dateien als
  Nebenwirkung. Das berührt Critical Rule 6 (kein offener Zugang) nur am Rand:
  es gibt keine Kinderdaten im Content, und wer die Adresse nicht kennt, findet
  nichts. Sauber zumachen lässt sich das später mit einer Zugriffsregel für
  `*.json` im Content-Ordner — die Schnittstelle liest über das Dateisystem und
  merkt davon nichts. Gehört in ADR-004 als bewusst offener Punkt.
- 🟡 **Das Paket beantwortet unbekannte Pfade mit der Startseite und `200`**
  (Fund aus Meilenstein 1). Ein fehlendes Kartenbild liefert also HTML statt
  eines Bildes. Der Bildplatzhalter aus Phase 3 muss deshalb am
  Fehler-Ereignis des Bildes hängen, nicht am Statuscode.

## Report-Back
