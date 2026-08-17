# Findings — Nutzerverwaltung & Spielstand

Erkenntnisse aus der Umsetzung, die eine spätere Phase oder einen späteren
Meilenstein betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein bis drei Zeilen>
- [ ] → Meilenstein N: <Erkenntnis>
```

Abgehakt wird, sobald die Ziel-Phase die Erkenntnis aufgenommen hat.

## Offen

- [ ] → Phase 2: Die Anmeldung lässt sich auf dieser Maschine nicht lokal
  ausprobieren. Die Datenbank des Pakets antwortet von außen nicht (Port 3306
  geschlossen, geprüft 17.08.2026), und `backend/.env` steht auf
  `APP_ENV=production` — das `Secure`-Cookie käme über `http://localhost`
  ohnehin nie an. Alles, was eine echte Sitzung braucht, wird auf dem
  hochgeladenen Stand geprüft. Beim lokalen Entwicklungs-Router mitdenken:
  `APP_ENV=local` in `.env` ist Voraussetzung, sobald es lokal je gehen soll.
- [ ] → Phase 3: `GET /api/content/themes` (und jede andere Content-Route)
  antwortet ohne Sitzung jetzt `401`, nicht mehr `200`. Der Abfang im Frontend
  muss also an der zentralen Aufrufstelle sitzen, nicht nur an den Auth-Routen —
  sonst läuft ein abgelaufenes Cookie in eine Ladefehler-Anzeige statt auf den
  Anmeldebildschirm.
- [ ] → Phase 9: Es gibt noch keinen Weg, den **ersten** Account auf dem Server
  anzulegen — `bin/create-user.php` braucht eine Datenbankverbindung von außen,
  die das Paket nicht hergibt. Offene Entscheidung, siehe ADR-008
  („Accounts entstehen außerhalb der Anwendung").
- [ ] → Meilenstein 5: Kartenbesitz braucht eine eigene Ablage. Der
  Spielstand-Zustand (Phase 5) hat dafür bewusst **kein** Feld — beim Bau der
  Sammelkarten entscheiden, ob `state.cards` dazukommt oder eine eigene
  Tabelle. `EpisodeRun.pendingCardId` aus Meilenstein 3 ist der Haken.
- [ ] → Meilenstein 6: Die PHP-Weiche vor den Content-Dateien (Phase 2) liegt
  genau dort, wo der Offline-Cache ansetzen wird. Beim Bau prüfen, ob sie
  Caching-Köpfe setzen muss, damit der Browser Bilder nicht bei jedem Aufruf
  neu zieht.
