# Questoria — Kontext

## Ziel & Vision

Questoria ist keine Lernplattform mit Minispielen. Questoria ist eine
**datengetriebene Story-Engine** für Kinder (ca. 6–10 Jahre, ausdrücklich auch
für Kinder, die noch nicht lesen): bekannte Fandom-Welten (One Piece,
Miraculous, ...) werden zu spielbaren Abenteuern.

Ein Kind startet Questoria nicht, um Aufgaben zu lösen. Es startet Questoria,
weil es wissen will, **wie die Geschichte weitergeht**. Lernen trägt das
Gameplay, Gameplay transportiert die Story.

Kinder erkunden eine Themenwelt über eine Timeline aus Episoden. Jede Episode
ist ein Abenteuer an einem Ort und besteht aus einer **Eventliste** — Dialog,
Erkundung, Rätsel, Kampf, Belohnung, in der Reihenfolge, die die Geschichte
verlangt. Nicht Dialog → Quiz → Ende, sondern Dialog → Handlung → Konsequenz →
Dialog. Eine Lernstufe pro Welt sorgt dafür, dass Story und Charaktere für alle
gleich bleiben, aber die Aufgaben mit dem Alter/Wissensstand skalieren. Als
Belohnung gibt es Sammelkarten, die sich zu Hause ausdrucken lassen — der Anreiz
reicht damit über den Bildschirm hinaus.

**Der Leitsatz:** Questoria besteht aus einer generischen Spiel-Engine im
Browser und austauschbaren Content-Paketen. Die Engine implementiert sämtliche
Spielmechaniken, das Backend liefert ausschließlich Daten und speichert den
Spielstand. Neue Abenteuer entstehen durch Content, nicht durch Backend-Logik
([ADR-004](decisions/004-event-engine.md)).

## Scope (MVP)

- Game-Player: Planetenkarte → Etappenkarte → Ortskarte → Episode als Eventablauf
- **Event Engine:** ein Ablaufmechanismus für alles Spielbare. Der Event Loader
  wählt pro Event über `ngComponentOutlet` die passende Komponente — Starttypen
  sind `dialog`, `multiple_choice`, `text_input`, `image_search` und `reward`.
  Das Repertoire ist offen, kein Deckel.
- Dialog als Eventtyp inklusive Audio (zwei feste Bühnenplätze `left`/`right`,
  kein Koordinatensystem)
- **Vorlesemodus für nicht-lesende Kinder:** umschaltbar zwischen „Bilder &
  Vorlesen" und „Selbst lesen" — kurze Textfassung, Bildantworten im Quiz,
  automatische Sprachausgabe, vorproduzierte Sprachaufnahmen wo vorhanden
- **Sammelkarten als Belohnung:** freispielen, in einer Trophäenhalle ansehen,
  auswählen und maßstabsgetreu auf DIN A4 ausdrucken (63 × 88 mm, 3×3 pro Bogen)
- Lernstufen-Filterung, datengetrieben — keine Klassenstufen fest im Code
- Nutzerverwaltung: Accounts, mehrere Spielerprofile pro Account, Login. Kein
  Registrierungs-UI — Accounts legt ausschließlich der Betreiber an
  ([docs/knowledge/erster-account.md](knowledge/erster-account.md))
- Spielstände: Speichern, Laden, Fortschritt, Achievements, Statistiken
- Content-Repository als von Hand geschriebene, versionierte JSON-Dateien im
  Git-Repo (`data/themes/<theme_id>/...`), LLM-gestützt über das
  Authoring-Toolkit unter `data/_authoring/`
- Einheitliches Design-System nach [docs/design/](design/) — Farben, Typografie
  und Abstände kommen aus einer Token-Quelle, nicht pro Komponente neu erfunden

## Nicht-Ziele (MVP)

- Kein Admin-Dashboard, kein No-Code-Editor — Content entsteht per Commit/PR
- Kein Dynamic Level Creator, kein Multi-Map-Manager, kein Dialog-Sequenzer (UI)
- Kein Asset-Uploader, keine Validierungs-Engine als UI-Tool
- Keine KI-Grafik-Pipeline als Produktfeature (die Bild-Prompts sind
  Autoren-Werkzeug, kein Runtime-Feature)
- **Kein Sammelkarten-Generator.** Questoria zeigt und druckt fertige
  Kartenbilder, es erzeugt keine. Der Template-/Layer-Editor dafür ist ein
  eigenes Projekt und berührt dieses Repo nicht.
- Keine Gruppenszenen mit 3+ gleichzeitigen Sprechern (zwei feste Plätze reichen)
- Kein Mehrspieler, kein Marketplace für Lernwelten
- Kein Offline-Betrieb im MVP — die Architektur bereitet ihn vor (aller Content
  läuft über den `ContentService` als einzige Ladestelle), gebaut wird er als
  Meilenstein 6

Alle diese Punkte bleiben architektonisch möglich (REST-API-Trennung macht
das offen), werden aber bewusst erst gebaut, wenn sich das Content-Format in
der Praxis bewährt hat (Meilenstein 6+).

## Stack

| Layer | Wahl | Begründung |
|---|---|---|
| Frontend | Angular v20+, Standalone Components, Signals | Aktueller Standard, kein NgModule-Ballast. **Trägt die vollständige Spiel-Engine**: Story-Ablauf, Event Engine, Dialogfluss, Quests, Inventar, Auslöser, Story-Merker, Erfolge, Ton, Animation, alle Spielregeln |
| Backend | PHP 8.5, kein Framework | Shared-Hosting-kompatibel, kein Overhead. **Interpretiert kein Gameplay** — liefert Event-Konfigurationen, Episoden, Welten, Assets, Lokalisierungen und speichert Nutzer, Profile, Spielstände |
| Backend-Libs | FastRoute (Routing), firebase/php-jwt (Auth), vlucas/phpdotenv, monolog, respect/validation | Übernommen aus dem Schwesterprojekt promptigofant — bewährter Mini-Stack, gleiche Konventionen über beide Projekte |
| Datenbank | MySQL/MariaDB | Nutzerdaten, Profile, Spielstände, Statistiken — referenziert nur Content-IDs, nie Content selbst |
| Content | Statische, versionierte JSON-Dateien im Repo | Zweite Wahrheitsquelle vermeiden; Editor kommt erst, wenn das Format sich bewährt hat |
| Hosting | Strato Shared Hosting: PHP 8.5, MySQL, Apache, HTTPS — **kein Kommandozeilenzugang** | Kein Docker/Kubernetes/Cloud im MVP; lokal bauen, per `deploy.cmd` hochladen |
| Domain | `questoria.info` — API darunter unter `/api` | |

## Constraints

- **Neue Gameplay-Features dürfen keine neuen REST-Endpunkte brauchen.** Eine
  neue Mechanik entsteht aus einem neuen Eventtyp, einer neuen Angular-Komponente
  und neuen Event-Konfigurationen im Content. Braucht ein Feature Backend-Code,
  ist der Schnitt falsch — nicht das Backend zu klein
  ([ADR-004](decisions/004-event-engine.md)). Die REST-API bleibt bewusst klein:
  Login, Profile, Welten, Episoden, Assets, Spielstände. Nicht darin: Storylogik,
  Kampfregeln, Kartenspiele, Questlogik, NPC-Verhalten, Entscheidungen, Auslöser.
- Ein-Personen-Projekt (privat/solo) — wenig Prozess-Overhead, kein
  Plan-Zwang für Kleinkram, direkt auf dem Default-Branch
- Shared Hosting: keine Container-Infrastruktur, keine Cloud-Abhängigkeit
- Content-Erstellung im MVP ausschließlich über Git-Commits — kein UI-Tool
- **Geschlossener Betrieb — kein öffentlicher Zugang.** Der Content nutzt
  bewusst geschützte Fandom-Welten. Solange die Nutzung im privaten Kreis
  bleibt (eigene Kinder, Familie), gibt es keine öffentliche Wiedergabe und
  keine Verbreitung. Daraus folgt verbindlich: kein erreichbarer Zugang ohne
  Login, keine offene Registrierung, keine Suchmaschinen-Indexierung, keine
  Weitergabe von Kartenbildern nach außen. Der Login ist deshalb kein Feature
  unter vielen, sondern die Bedingung, unter der die Plattform überhaupt online
  gehen darf.
  🟡 Ein Login allein macht die Nutzung nicht zulässig — entscheidend ist, dass
  der Nutzerkreis tatsächlich privat bleibt. Sobald Accounts an Fremde
  vergeben werden, ist es öffentlich, Passwort hin oder her. (Einschätzung,
  keine Rechtsberatung.)
- Kein festes Datum/Deadline bekannt (Stand 2026-07-31) — Fahrplan ist
  phasenbasiert, nicht terminbasiert

## Meilensteine (aus dem Umsetzungsfahrplan)

1. **Core Architecture** — Angular-Projekt, `GameStateService`, Main-Hub mit
   Lernstufen-Filterung, PHP-Backend-Grundgerüst, MySQL-Schema. Dazu die
   Design-Tokens aus [docs/design/](design/) als Fundament, damit nicht später
   jede Komponente nachgezogen werden muss.
2. **Timeline & Map** — Router-Struktur Timeline/Map/Location, Etappen- und
   Ortskarte mit Prozent-Koordinaten, Fortschrittsanzeige aus Savegame,
   Content-API (liest JSON-Repository)
3. **Event Engine** — der eine Ablaufmechanismus: Event Loader über
   `ngComponentOutlet`, der eine Episode als Eventliste abspielt, plus die
   Starttypen `dialog` (Speech-Bubbles auf den zwei Bühnenplätzen, Audio-Service,
   synchronisierte Wiedergabe), `multiple_choice`, `text_input`, `image_search`
   und `reward`. Dazu der Vorlesemodus vollständig: der globale Umschalter
   „Bilder & Vorlesen" / „Selbst lesen", Sprachausgabe, Textfassungs-Auswahl und
   Bildantworten. Am Ende dieses Meilensteins ist eine Episode durchspielbar.
4. **Nutzerverwaltung & Spielstand** — abgeschlossen (18.08.2026). Login, Profile, Savegame-API,
   Achievements, Statistiken. Das verbindliche DB-Schema (7 Tabellen: `users`,
   `player_profiles`, `savegames`, `achievements`, `player_achievements`,
   `statistics`, `schema_migrations`) liegt bereits als rohes SQL unter
   `backend/src/Migrations/sql/` (Meilenstein 1, Phase 3) — Repository-Klassen
   darauf entstehen erst hier. Der lokale Fortschritts-Dienst aus Meilenstein 2
   tauscht nur seine Datenquelle, nicht seine Schnittstelle.
5. **Sammelkarten & Druckbogen** — das `reward`-Event schaltet echte Karten
   frei (in Meilenstein 3 vergibt es nur Sterne), Trophäenhalle mit
   Gruppen/Filter/Detail, Druckauswahl und maßstabsgetreuer A4-Bogen
6. **Offline-Fähigkeit** — Welt-JSON und Assets beim Betreten einer Welt lokal
   ablegen (IndexedDB/Browser-Cache), danach läuft das Gameplay ohne Netz. Das
   Netz wird nur noch für Login, Spielstände, Synchronisation und
   Content-Aktualisierungen gebraucht. Möglich ist das, weil das Spiel ohnehin
   vollständig im Client läuft — eingehängt wird der Cache im `ContentService`,
   der einzigen Ladestelle für Content.
7. *(außerhalb MVP-Scope)* Admin-Dashboard, Asset-Uploader,
   Validierungs-Engine, KI-Grafik-Pipeline, Marketplace, Mehrspieler

Nach Meilenstein 5 ist der MVP spielbar — mit Content, der von Hand ins Repo
geschrieben wurde. Meilenstein 6 macht ihn netzunabhängig.

**Warum 3 und 4 nicht mehr getrennt sind:** Dialog-Engine und Minispiel-System
waren derselbe Mechanismus, zweimal geplant. Seit Dialog ein Eventtyp unter
vielen ist, entsteht der Ablauf genau einmal — und der Vorlesemodus wird in
einem Meilenstein fertig statt über zwei verteilt.

## Offene Fragen

- ~~Koordinaten-Zuordnung Map → Node~~ — geklärt am 31.07.2026: Prozentwerte
  relativ zum Kartenbild, festgehalten in `data/_authoring/JSON_SCHEMA_REFERENCE.md`
  Abschnitt 2. Die konkreten Werte pro Welt bleiben Handarbeit am fertigen
  Kartenbild.
- ~~Der komplette Content-Schema-Stand in `data/_authoring/` ist noch nicht
  gegen eine laufende Engine verifiziert~~ — geklärt in Meilenstein 3, Phase 7:
  die Testwelt `dev_fixture` spielt alle fünf Eventtypen durch, die Typ-Tabelle
  in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0 stimmt wieder.
- ~~Ob Sprachausgabe über die Browser-Stimme reicht oder pro Dialogzeile
  vorproduzierte Aufnahmen nötig sind~~ — geklärt am 17.08.2026 (Sascha,
  Smoke-Test): die Browser-Stimme klingt brauchbar, reicht für den MVP.
  Vorproduzierte Aufnahmen über `audio_path` bleiben trotzdem eingebaut und
  gehen ihr immer vor — die Sprach-Werkstatt unter `data/_authoring/voice-tools/`
  steht bereit, wird aber erst gebraucht, sobald echter Fandom-Content vertont
  werden soll.
- Kein festgelegtes Datum für "Spiel muss laufen" — falls es eins gibt
  (Schuljahr, Geburtstag eines Kindes o.ä.), bitte nachtragen

## Quelle

Destilliert aus `docs/archive/2026-07/EduQuest_Engine_MVP_Konzept.md`
(vollständiges Ursprungskonzept, wortgetreu archiviert). Der Architekturschnitt
— Event Engine statt getrenntem Dialog- und Minispiel-System — ist am
14.08.2026 nachgezogen worden und in
[ADR-004](decisions/004-event-engine.md) begründet; das Archiv beschreibt
bewusst weiterhin den alten Stand.
