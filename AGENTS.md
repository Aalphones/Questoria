# Questoria — Agenten-Hub

Datengetriebene Story-Engine: Fandom-Welten (One Piece, Miraculous, ...) werden
zu spielbaren Lernabenteuern. Voller Kontext: [docs/PROJECT.md](docs/PROJECT.md).

🚧 Aktive Arbeit → [STATE.md](STATE.md)

## Der Architekturschnitt in vier Zeilen

Eine generische Spiel-Engine im Browser plus austauschbare Content-Pakete
([ADR-004](docs/decisions/004-event-engine.md)):

- **Das Frontend ist das Spiel.** Story-Ablauf, Event Engine, Dialogfluss,
  Quests, Inventar, Auslöser, Story-Merker, Erfolge, Ton, Animation, alle Regeln.
- **Das Backend interpretiert kein Gameplay.** Es liefert Event-Konfigurationen,
  Episoden, Welten, Assets, Lokalisierungen und speichert Nutzer und Spielstände.
- **Eine Episode ist eine Eventliste.** Dialog ist ein Eventtyp wie jeder
  andere — es gibt genau einen Ablaufmechanismus.
- **Neue Mechaniken entstehen aus Eventtyp + Komponente + Content**, nie aus
  Backend-Code (Critical Rule 8).

## Stack

| Layer | Wahl |
|---|---|
| Frontend | Angular v20+, Standalone Components, Signals |
| Backend | PHP 8.5, kein Framework — FastRoute + JWT + phpdotenv + monolog + respect/validation |
| Datenbank | MySQL/MariaDB |
| Content | Statische, versionierte JSON-Dateien unter `data/themes/` |
| Hosting | Shared Hosting ohne Kommandozeilenzugang — lokal bauen, per `deploy.cmd` hochladen ([ADR-002](docs/decisions/002-php-stack-und-betrieb.md)) |

## Conventions-Index

| Thema | Datei |
|---|---|
| Angular | [docs/conventions/angular.md](docs/conventions/angular.md) |
| TypeScript | [docs/conventions/typescript.md](docs/conventions/typescript.md) |
| CSS / Styling | [docs/conventions/css.md](docs/conventions/css.md) |
| PHP | [docs/conventions/php.md](docs/conventions/php.md) |
| Commits | [docs/conventions/commits.md](docs/conventions/commits.md) |
| Linting | [docs/conventions/linting.md](docs/conventions/linting.md) |
| Testing | [docs/conventions/testing.md](docs/conventions/testing.md) |

## Doc-Index

| Datei | Inhalt |
|---|---|
| [docs/PROJECT.md](docs/PROJECT.md) | Ziel, Scope, Nicht-Ziele, Constraints, Meilensteine |
| [docs/glossary.md](docs/glossary.md) | Gemeinsames Vokabular (Themenwelt, Lernstufe, Event, Event Engine, ...) |
| [docs/code-map.md](docs/code-map.md) | Feature → Ordner, Namensschema über alle Layer |
| [docs/design/](docs/design/) | Visuelles Zielbild: Design-Tokens, alle Screens, lauffähiger Prototyp |
| [docs/decisions/](docs/decisions/) | Architektur-Entscheidungen (ADRs) |
| [docs/planning/](docs/planning/) | Aktive Pläne (Git-Dateien, kein Manager-Tracker für dieses Solo-Projekt) |
| [docs/archive/](docs/archive/) | Abgeschlossene Pläne + Ursprungskonzept |
| [docs/knowledge/INDEX.md](docs/knowledge/INDEX.md) | Projekt-Wissenskatalog |
| `data/_authoring/README.md` | Content-Authoring-Toolkit: JSON-Schema, LLM-Prompt, Asset-Vorgaben, Bild-Prompts |

## Content-Repository

Content (Welten, Episoden mit ihren Eventlisten, ausgelagerte Event-Konfigurationen,
Sammelkarten) lebt als statische
JSON unter `data/themes/<theme_id>/`, kein Editor im MVP. **`data/themes/` ist
lokal eine NTFS-Junction auf Google Drive (`H:\Meine Ablage\U105_Questoria`)** —
der Ordner liegt bewusst außerhalb von Git (`.gitignore`), Backup und
Versionsstand übernimmt Drive. Deploy liest davon unbeeinflusst: `deploy.cmd`
synct den lokalen Ordnerinhalt, egal ob Datei oder Junction dahintersteht.
Das verbindliche Schema + LLM-Copy-Paste-Prompt liegt unter `data/_authoring/`
(bleibt regulär in Git, ist Werkzeug/Doku, kein generierter Content).
**Jede Engine-Änderung, die das Content-Format betrifft, zieht das
Authoring-Toolkit im selben Commit mit** — siehe
`data/_authoring/README.md` → „Pflegepflicht".

Ab Meilenstein 2 wird der Content über die Schnittstelle gelesen (`GET
/api/content/themes`, `.../themes/{themeId}`,
`.../themes/{themeId}/episodes/{episodeId}` — [ADR-005](docs/decisions/005-content-auslieferung-ab-meilenstein-2.md))
und mit `deploy.cmd content` auf den Server hochgeladen, statt als
Frontend-Asset gebaut zu werden. Ausgelagerte Event-Konfigurationen kommen über
denselben Weg (`.../themes/{themeId}/events/{eventId}` —
[ADR-007](docs/decisions/007-ausgelagerte-events-ueber-die-schnittstelle.md));
dieser eine Aufruf trägt alle Eventtypen, es kommt keiner pro Typ dazu.

**Profil-Avatare** liegen aus demselben Grund neben `data/themes/` in derselben
Drive-Ablage: `data/avatars/` ist eine eigene NTFS-Junction auf
`H:\Meine Ablage\U105_Questoria\avatars`, ausgeliefert über
`GET /content/avatars/<datei>` — technisch derselbe Mechanismus wie
`data/hub/` (statische Datei hinter der Session-Weiche, kein Endpoint). Die
feste Auswahl im Frontend (`AVAILABLE_AVATARS`, `models/auth.types.ts`) trägt
nur noch Dateinamen; `ContentService.avatarUrl()` baut die Adresse. Neue
Avatare kommen wie neue Welten hinzu: Datei nach Drive, Dateiname in
`AVAILABLE_AVATARS` ergänzen — kein Build-Schritt nötig, `deploy.cmd content`
synct `data/` ohnehin komplett (außer `_authoring/`). Prompt-Vorlage fürs
Nachgenerieren: `data/_authoring/image-prompts/AVATARS.md`.

## Critical Rules

1. **Content ist read-only über die API** — Schreibzugriff auf `data/themes/` gibt es nur direkt im Dateisystem (Drive-Ordner), nie über einen Endpoint.
2. **Eventtyp, `difficulty_level` und `rarity` sind geschlossene, dokumentierte Wertemengen** — ein Eventtyp kommt erst in die Tabelle in `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0, **wenn seine Angular-Komponente existiert**. Sonst referenziert generierter Content Events, die es nicht gibt.
3. **Zwei Bühnenplätze (`left`/`right`), keine Koordinaten** — das ist eine bewusste Vereinfachung, kein Provisorium, das später "richtig" gebaut wird.
4. **Fortschritt gehört nie ins Content** — was ein Kind geschafft, gesammelt oder eingestellt hat, liegt im Spielstand in der Datenbank. Kein `status`, `stars`, `earned` in einer JSON-Datei.
5. **Die Engine erzeugt keine Sammelkarten** — sie zeigt fertige Kartenbilder, schaltet sie frei und druckt sie. Ein Kartengenerator ist ausdrücklich kein Teil dieses Projekts.
6. **Kein öffentlich erreichbarer Zugang ohne Login** — der Betrieb ist auf einen privaten Nutzerkreis beschränkt, siehe `docs/PROJECT.md` → Constraints. Das ist eine Deploy-Bedingung, kein Feature-Wunsch. Seit Meilenstein 4 gilt die Regel auch für die **Auslieferung der Bilder und Töne**: `/content/**` läuft durch dieselbe Sitzungsprüfung wie die Schnittstelle ([ADR-008](docs/decisions/008-zugang-und-sitzung.md)), eine offen erreichbare Content-Datei ist ein Bug.
7. **Kartenkoordinaten sind Prozentwerte** — Positionen und Größen auf allen Karten beziehen sich auf das Kartenbild, nie auf Pixel des Bildschirms.
8. **Neue Gameplay-Features brauchen keine neuen REST-Endpunkte** — eine neue Mechanik ist ein neuer Eventtyp plus Angular-Komponente plus Content. Wer für ein Spielfeature Backend-Code schreiben will, hat den Schnitt falsch gelegt ([ADR-004](docs/decisions/004-event-engine.md)).
9. **Kein `@switch` über Eventtypen im Ablauf-Gerüst** — der Event Loader wählt die Komponente über `ngComponentOutlet` und eine Typ-Tabelle. Ein Sonderfall im Gerüst nimmt der Engine genau die Eigenschaft, für die sie gebaut ist.
