# Findings — Nutzerverwaltung & Spielstand

Erkenntnisse aus der Umsetzung, die eine spätere Phase oder einen späteren
Meilenstein betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein bis drei Zeilen>
- [ ] → Meilenstein N: <Erkenntnis>
```

Abgehakt wird, sobald die Ziel-Phase die Erkenntnis aufgenommen hat.

## Offen

- [x] → Phase 2: Die Anmeldung lässt sich auf dieser Maschine nicht lokal
  ausprobieren. Die Datenbank des Pakets antwortet von außen nicht (Port 3306
  geschlossen, geprüft 17.08.2026), und `backend/.env` steht auf
  `APP_ENV=production` — das `Secure`-Cookie käme über `http://localhost`
  ohnehin nie an. Alles, was eine echte Sitzung braucht, wird auf dem
  hochgeladenen Stand geprüft. Beim lokalen Entwicklungs-Router mitdenken:
  `APP_ENV=local` in `.env` ist Voraussetzung, sobald es lokal je gehen soll.
- [x] → Phase 3: `GET /api/content/themes` (und jede andere Content-Route)
  antwortet ohne Sitzung jetzt `401`, nicht mehr `200`. Der Abfang im Frontend
  muss also an der zentralen Aufrufstelle sitzen, nicht nur an den Auth-Routen —
  sonst läuft ein abgelaufenes Cookie in eine Ladefehler-Anzeige statt auf den
  Anmeldebildschirm. **Umgesetzt:** `session-expired.interceptor.ts` sitzt als
  globaler `HttpInterceptorFn` vor jedem Aufruf.
- [x] → Phase 2: Es gibt noch keinen Weg, den **ersten** Account auf dem Server
  anzulegen — `bin/create-user.php` braucht eine Datenbankverbindung von außen,
  die das Paket nicht hergibt. **Entschieden am 17.08.2026 (Sascha):** dafür
  kommt ein geschützter Endpunkt nach dem Muster von `POST /api/migrate` —
  eigener Token im Kopf, ohne Token `404`. Gehört mit in Phase 2, weil ohne
  ihn ab dort nichts mehr testbar ist. Der Endpunkt gehört auf die Liste
  `OPEN_ROUTES` in `backend/public/index.php` (er kann keine Sitzung
  voraussetzen) und schützt sich über seinen eigenen Token.
- [x] → Phase 3: Bevor der Anmeldebildschirm überhaupt etwas anmelden kann,
  muss auf dem Server **einmal** ein Account entstehen: `POST /api/setup/user`
  mit dem Kopf `X-Setup-Token` (Wert steht als `SETUP_TOKEN` in `deploy.env`
  und wandert von dort in `backend/.env`). Vorher gibt es kein Passwort, das
  funktionieren könnte — das ist kein Frontend-Fehler. Steht als Vorbedingung
  in STATE.md, keine Frontend-Änderung nötig.
- [x] → Phase 3: Lokal ist der Content jetzt ebenfalls zugesperrt. Ohne
  Sitzungs-Cookie liefert `/content/**` auch am Entwicklungsserver `403`, alle
  Bilder bleiben leer. Solange die Anmeldung lokal nicht geht (Datenbank von
  außen zu), heißt „bei mir sind alle Bilder weg" also erst einmal genau das
  Richtige, nicht einen Bug. Keine Frontend-Änderung nötig.

- [ ] → Meilenstein 5: Kartenbesitz braucht eine eigene Ablage. Der
  Spielstand-Zustand (Phase 5) hat dafür bewusst **kein** Feld — beim Bau der
  Sammelkarten entscheiden, ob `state.cards` dazukommt oder eine eigene
  Tabelle. `EpisodeRun.pendingCardId` aus Meilenstein 3 ist der Haken.
- [ ] → Meilenstein 6: Die PHP-Weiche vor den Content-Dateien (Phase 2) liegt
  genau dort, wo der Offline-Cache ansetzen wird. Sie setzt bereits
  `Cache-Control: private, max-age=3600` plus `Last-Modified` und beantwortet
  `If-Modified-Since` mit `304`. Beim Bau des Offline-Caches prüfen, ob eine
  Stunde die richtige Größe ist und ob ein `ETag` dazukommen soll — `private`
  ist dabei nicht verhandelbar, sonst könnte ein gemeinsamer Zwischenspeicher
  die Bilder an Unangemeldete geben.
- [ ] → Phase 6: `SavegameService.save()` verlangt ein aktives Profil und wirft
  einen Stand ohne Profil-ID kommentarlos weg (nur eine Warnung in der Konsole).
  Beim Umhängen von `ProgressService`/`RunStoreService` sicherstellen, dass die
  einmalige Übernahme des alten Browser-Stands **nach** der Profilwahl läuft —
  sonst verschwindet sie lautlos.
- [ ] → Phase 6: Der Spiegel merkt sich pro Welt genau einen Stand, `run` ohne
  Welt-Kennung (die steckt im Eintrag). `StoredRun` im Frontend trägt die
  Welt-Kennung dagegen mit — beim Umhängen einmal umformen, nicht durchreichen.
