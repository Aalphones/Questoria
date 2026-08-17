# Phase 2 — Türsteher vor Content und App

Bilder, Sprites und Audio liegen im ausgelieferten Bereich und werden heute von
Apache direkt herausgegeben — an jeden, der die Adresse kennt. Diese Phase legt
eine PHP-Weiche davor, die dieselbe Sitzung prüft wie die Schnittstelle.

## Kontext (vorher lesen)

- [README.md](README.md) → „Auslieferung der Dateien"
- Phase 1 → `Http/SessionCookie.php`, `Services/AuthService.php`
- `backend/dev-router.php` — liefert Content beim lokalen Entwickeln schon über PHP aus
- `backend/public/.htaccess` — Muster für Umschreibe-Regeln
- `deploy.cmd`, Zeilen um `REMOTE_CONTENT_PATH` — wohin der Content wandert
- `deploy.env.example` → Abschnitt „Zielverzeichnisse auf dem Server"
- [ADR-003](../../decisions/003-backend-ausserhalb-des-webbereichs.md) — warum der
  Programmcode neben statt im ausgelieferten Bereich liegt

## Abnahmekriterien

1. `/content/hub/<beliebige Datei>` ohne Sitzungs-Cookie antwortet `403` und
   liefert keine Dateidaten.
2. Mit gültigem Cookie liefert dieselbe Adresse die Datei mit korrektem
   `Content-Type` (Bild als Bild, Audio als Audio) — alle Screens sehen
   unverändert aus.
3. Ein Pfad mit `..` (z.B. `/content/../../backend/.env`) antwortet `403` oder
   `404`, niemals Dateiinhalt.
4. Der lokale Entwicklungsserver (`backend\serve.cmd`) verhält sich genauso wie
   der Server — dieselbe Weiche, nicht zwei getrennte Wege.
5. `deploy.cmd content` legt die Umschreibe-Regel auf dem Server mit ab; ein
   erneuter Lauf löscht sie nicht wieder weg.

## Checkliste

- [ ] `backend/src/Services/ContentFileService.php`: nimmt einen relativen
      Pfad, prüft ihn (`realpath` muss innerhalb von `CONTENT_PATH` liegen,
      sonst `ApiException(403, …)`), bestimmt den MIME-Typ und liefert die
      Datei aus. **Die gesamte Auslieferungslogik lebt hier**, nicht in zwei
      Kopien.
- [ ] `backend/public/content-gate.php`: winziger Einstiegspunkt — `.env`
      laden, Cookie über `SessionCookie::read()` prüfen, Token über
      `JwtAuthMiddleware::verify()` gegenprüfen, dann `ContentFileService`
      aufrufen. Bei fehlender oder ungültiger Sitzung `403`.
      🟡 **Kein Datenbank-Zugriff in dieser Weiche.** Das Token trägt seine
      Gültigkeit in der Signatur; würde die Weiche zusätzlich den Benutzer in
      der Datenbank nachschlagen, wäre bei einer hakenden Datenbank nicht nur
      der Spielstand weg, sondern jedes Bild im Spiel.
- [ ] `backend/dev-router.php` auf `ContentFileService` + dieselbe
      Sitzungsprüfung umstellen, damit lokal und auf dem Server dasselbe
      passiert (bisher liefert der Router jede Datei ungeprüft aus).
- [ ] `api-bridge/content-gate.php` anlegen — dieselbe Brücken-Zeile wie
      `api-bridge/index.php`, zeigt auf `backend/public/content-gate.php`.
      Landet auf dem Server unter `public/api/content-gate.php`.
- [ ] `data/.htaccess` anlegen (wandert mit `deploy.cmd content` nach
      `public/content/`): schreibt jede Anfrage auf
      `/api/content-gate.php?file=$1` um und schaltet `Options -Indexes`.
      Kommentar in der Datei, dass sie bewusst neben dem Content liegt, weil
      der Ordner beim Hochladen gespiegelt wird und eine Regel von woanders
      dabei verloren ginge.
- [ ] `deploy.cmd`: Filtermaske des Content-Ziels prüfen — `.htaccess` darf
      **nicht** ausgeschlossen werden, `_authoring/` bleibt ausgeschlossen.
- [ ] `frontend/proxy.conf.json` gegenlesen: `/content` geht bereits an
      `localhost:8000`, muss aber Cookies weiterreichen (`changeOrigin`
      belassen, nichts hinzufügen, wenn es schon läuft — nur verifizieren).

## Doku-Updates

- [ ] `docs/decisions/008-zugang-und-sitzung.md` (aus Phase 1) um den Abschnitt
      zur Dateiauslieferung ergänzen: warum eine PHP-Weiche und nicht ein
      Serverpasswort vor dem ganzen Ordner (Kollision mit dem
      `Authorization`-Kopf der Schnittstelle, zweite Passwortabfrage pro Gerät).
- [ ] `docs/code-map.md`: Zeile für `content-gate.php` im Projektstamm-Abschnitt
      und in der Backend-Tabelle (`Services/ContentFileService.php`).
- [ ] `AGENTS.md` → Critical Rule 6: den Halbsatz ergänzen, dass die Regel seit
      diesem Meilenstein auch für die Auslieferung der Bilder gilt, nicht nur
      für die Anwendung.

## Report-Back
