# Questoria — Kontext

## Ziel & Vision

Story-basierte Lernplattform für Kinder (ca. 6–10 Jahre, ausdrücklich auch für
Kinder, die noch nicht lesen): bekannte Fandom-Welten (One Piece, Miraculous,
...) werden zu Lernspielen umgebaut. Kinder erkunden eine Themenwelt über eine
Timeline aus Episoden, sehen Dialoge zwischen den Charakteren und lösen
dazwischen Minispiele, die Schulstoff abfragen. Eine Lernstufe pro Welt sorgt
dafür, dass Story und Charaktere für alle gleich bleiben, aber die Aufgaben mit
dem Alter/Wissensstand skalieren. Für gelöste Minispiele gibt es Sammelkarten,
die sich zu Hause ausdrucken lassen — der Anreiz reicht damit über den
Bildschirm hinaus.

## Scope (MVP)

- Game-Player: Main-Hub → Timeline → Map → Location → Dialog/Minispiel
- Dynamisches Minispiel-System über `ngComponentOutlet` (Multiple Choice,
  Freitext, Bild-Suche als Starttypen — Repertoire ist offen, kein Deckel)
- Dialog- und Audiosystem (zwei feste Bühnenplätze `left`/`right`, kein
  Koordinatensystem)
- **Vorlesemodus für nicht-lesende Kinder:** umschaltbar zwischen „Bilder &
  Vorlesen" und „Selbst lesen" — kurze Textfassung, Bildantworten im Quiz,
  automatische Sprachausgabe, vorproduzierte Sprachaufnahmen wo vorhanden
- **Sammelkarten als Belohnung:** freispielen, in einer Trophäenhalle ansehen,
  auswählen und maßstabsgetreu auf DIN A4 ausdrucken (63 × 88 mm, 3×3 pro Bogen)
- Lernstufen-Filterung, datengetrieben — keine Klassenstufen fest im Code
- Nutzerverwaltung: Accounts, mehrere Spielerprofile pro Account, Login
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

Alle diese Punkte bleiben architektonisch möglich (REST-API-Trennung macht
das offen), werden aber bewusst erst gebaut, wenn sich das Content-Format in
der Praxis bewährt hat (Phase 5+).

## Stack

| Layer | Wahl | Begründung |
|---|---|---|
| Frontend | Angular v20+, Standalone Components, Signals | Aktueller Standard, kein NgModule-Ballast |
| Backend | PHP 8.5, kein Framework | Shared-Hosting-kompatibel, kein Overhead |
| Backend-Libs | FastRoute (Routing), firebase/php-jwt (Auth), vlucas/phpdotenv, monolog, respect/validation | Übernommen aus dem Schwesterprojekt promptigofant — bewährter Mini-Stack, gleiche Konventionen über beide Projekte |
| Datenbank | MySQL/MariaDB | Nutzerdaten, Profile, Spielstände, Statistiken — referenziert nur Content-IDs, nie Content selbst |
| Content | Statische, versionierte JSON-Dateien im Repo | Zweite Wahrheitsquelle vermeiden; Editor kommt erst, wenn das Format sich bewährt hat |
| Hosting | Strato Shared Hosting: PHP 8.5, MySQL, Apache, HTTPS — **kein Kommandozeilenzugang** | Kein Docker/Kubernetes/Cloud im MVP; lokal bauen, per `deploy.cmd` hochladen |
| Domain | `questoria.info` — API darunter unter `/api` | |

## Constraints

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
3. **Dialog- & Audio-Engine & Vorlesemodus** — Speech-Bubbles auf den zwei
   Bühnenplätzen, Audio-Service, synchronisierte Wiedergabe; der globale
   Umschalter „Bilder & Vorlesen" / „Selbst lesen" inklusive Sprachausgabe und
   Textfassungs-Auswahl
4. **Minispiel-System & Nutzerverwaltung** — `ngComponentOutlet`-Loader,
   die drei Starttypen (mit Bildantworten für den Vorlesemodus),
   Login/Profile/Savegame-API/Achievements/Statistiken
5. **Sammelkarten & Druckbogen** — Kartenvergabe beim Abschluss einer Episode,
   Trophäenhalle mit Gruppen/Filter/Detail, Druckauswahl und maßstabsgetreuer
   A4-Bogen
6. *(außerhalb MVP-Scope)* Admin-Dashboard, Asset-Uploader,
   Validierungs-Engine, KI-Grafik-Pipeline, Marketplace, Mehrspieler

Nach Meilenstein 5 ist der MVP spielbar — mit Content, der von Hand ins Repo
geschrieben wurde.

Der Vorlesemodus verteilt sich bewusst über zwei Meilensteine: der Umschalter
und die Sprachausgabe entstehen mit der Dialog-Engine (3), die Bildantworten
im Quiz mit dem Minispiel-System (4). Der Modus ist erst nach Meilenstein 4
vollständig.

## Offene Fragen

- ~~Koordinaten-Zuordnung Map → Node~~ — geklärt am 31.07.2026: Prozentwerte
  relativ zum Kartenbild, festgehalten in `data/_authoring/JSON_SCHEMA_REFERENCE.md`
  Abschnitt 2. Die konkreten Werte pro Welt bleiben Handarbeit am fertigen
  Kartenbild.
- 🟡 Der komplette Content-Schema-Stand in `data/_authoring/` ist noch nicht
  gegen eine laufende Engine verifiziert (Meilenstein 4 steht aus) — als 🟡
  markiert, bis das passiert ist
- 🟡 Ob Sprachausgabe über die Browser-Stimme reicht oder pro Dialogzeile
  vorproduzierte Aufnahmen nötig sind, entscheidet sich erst am echten Gerät.
  Das Schema trägt beides (`audio_path` optional), die Antwort kommt mit
  Meilenstein 3.
- Kein festgelegtes Datum für "Spiel muss laufen" — falls es eins gibt
  (Schuljahr, Geburtstag eines Kindes o.ä.), bitte nachtragen

## Quelle

Destilliert aus `docs/archive/2026-07/EduQuest_Engine_MVP_Konzept.md`
(vollständiges Ursprungskonzept, wortgetreu archiviert).
