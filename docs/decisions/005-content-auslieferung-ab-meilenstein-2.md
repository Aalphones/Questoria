# ADR-005: Content-Auslieferung ab Meilenstein 2

**Status:** entschieden · 14.08.2026

## Kontext

ADR-001 hat den Content für Meilenstein 1 bewusst als statisches Asset im
Frontend-Build gelöst — der Angular-Build lässt keine Asset-Quellen außerhalb
des eigenen Projektordners zu, und es gab noch keine echte Welt, nur die
Testwelt `dev_fixture`. Ab Meilenstein 2 kommt echter Fandom-Content dazu, der
im Repository-Wurzelverzeichnis unter `data/themes/` liegt (lokal eine
NTFS-Junction auf Google Drive) und nicht mehr ins Frontend eingebaut werden
soll.

## Optionen

1. **Alles durch PHP schleusen** — auch Bilder und Töne über einen Endpoint
   ausliefern.
2. **JSON außerhalb des Webbereichs, gar nicht über HTTP erreichbar** — nur
   über eine noch zu bauende Auth-Schicht.
3. **JSON per Schnittstelle, Bilder/Töne statisch vom Webserver** — die
   Schnittstelle liefert nur die JSON-Dateien unverändert aus, Assets liegen
   im Webbereich und werden direkt vom Webserver bedient.

## Entscheidung

Option 3. Das Backend bekommt drei Content-Endpunkte
(`/api/content/themes`, `/api/content/themes/{themeId}`,
`/api/content/themes/{themeId}/episodes/{episodeId}`), die den Inhalt der
passenden JSON-Datei unverändert zurückgeben — read-only, keine Umformung.
Bilder und Töne liegen unter `{DOCUMENT_ROOT}/content/` und werden vom
Webserver direkt ausgeliefert, ohne PHP dazwischen.

Der Content-Ordner wird per `deploy.cmd content` aus `data/` (ohne
`_authoring/`) hochgeladen, in denselben Webbereich wie das Frontend, aber als
eigener Unterordner — die Ausnahmeliste des Frontend-Abgleichs spart ihn
deshalb aus (sonst löscht der nächste Frontend-Deploy den Content).

## Konsequenzen

- Der Pfad zum Content-Ordner ist konfigurierbar (`CONTENT_PATH`), fällt aber
  im Betrieb auf `DOCUMENT_ROOT/content` zurück — für den lokalen
  Entwicklungs-Server (`backend\serve.cmd`) wird er auf das
  Repository-Wurzelverzeichnis `data/` gesetzt.
- **Offener Punkt:** Der Content liegt im Webbereich und ist damit ohne
  Anmeldung lesbar — Bilder zwingend (der Browser lädt sie direkt), die
  JSON-Dateien als Nebenwirkung. Es gibt keine Kinderdaten im Content, und wer
  die Adresse nicht kennt, findet nichts; sauber zumachen lässt sich das
  später mit einer Zugriffsregel für `*.json` im Content-Ordner. Bewusst nicht
  Teil dieser Entscheidung.
- Löst [ADR-001](001-content-delivery-mvp-phase1.md) ab.
