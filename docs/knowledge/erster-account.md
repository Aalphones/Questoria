# Ersten Account anlegen

Es gibt keine Registrierung in der Oberfläche ([Plan-README](../planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md)
→ „Entschieden vor dem Bauen" 2). Auf dem Server ist die Datenbank von außen
nicht erreichbar und es gibt keine Kommandozeile — `backend/bin/create-user.php`
läuft dort also nie. Der einzige Weg auf dem Server ist ein geschützter
Endpunkt, der genau wie `POST /api/migrate` funktioniert: eigener Token im
Kopf, ohne ihn `404` (Phase 2 des Meilensteins, siehe
[Report-Back](../planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-2-tuersteher.md)).

## Aufruf

```
POST https://questoria.info/api/setup/user
Kopf:    X-Setup-Token: <SETUP_TOKEN aus deploy.env>
Körper:  {"email": "...", "username": "...", "password": "mindestens 8 Zeichen"}
```

`SETUP_TOKEN` steht in der lokalen, nicht versionierten `deploy.env` (Vorlage:
`deploy.env.example`) und wird von `deploy.cmd` nach `backend/.env` auf den
Server geschrieben — beide Werte müssen also übereinstimmen, sonst antwortet
der Endpunkt mit `404`.

Antwort bei Erfolg: `201` mit dem angelegten Benutzer. `409`, wenn E-Mail oder
Benutzername schon vergeben sind — dann existiert bereits ein Account und
dieser Schritt ist überflüssig.

## Weitere Accounts

Derselbe Aufruf legt jeden weiteren Account an (z. B. für ein zweites Gerät
oder eine zweite erziehungsberechtigte Person). Der Endpunkt bleibt absichtlich
offen, solange `SETUP_TOKEN` gesetzt ist — kein Ablaufdatum, kein
Einmal-Gebrauch. Wer den Token kennt, kann Accounts anlegen; er gehört
deshalb genauso behandelt wie ein Passwort.

## Lokal

Lokal ist dieser Weg nicht nötig — die Datenbank des Pakets ist von der
Entwicklungsmaschine aus nicht erreichbar, eine echte Anmeldung geht dort
ohnehin nicht (siehe `STATE.md`, Abschnitt „Merkposten").
