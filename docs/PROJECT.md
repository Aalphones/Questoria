# EduQuest — Kontext

## Ziel & Vision

Story-basierte Lernplattform für Kinder: bekannte Fandom-Welten (One Piece,
Miraculous, ...) werden zu Lernspielen umgebaut. Kinder erkunden eine Themenwelt
über eine Timeline aus Episoden, sehen Dialoge zwischen den Charakteren und
lösen dazwischen Minispiele, die Schulstoff abfragen. Eine Lernstufe pro Welt
sorgt dafür, dass Story und Charaktere für alle gleich bleiben, aber die
Aufgaben mit dem Alter/Wissensstand skalieren.

## Scope (MVP)

- Game-Player: Main-Hub → Timeline → Map → Location → Dialog/Minispiel
- Dynamisches Minispiel-System über `ngComponentOutlet` (Multiple Choice,
  Freitext, Bild-Suche als Starttypen — Repertoire ist offen, kein Deckel)
- Dialog- und Audiosystem (zwei feste Bühnenplätze `left`/`right`, kein
  Koordinatensystem)
- Lernstufen-Filterung, datengetrieben — keine Klassenstufen fest im Code
- Nutzerverwaltung: Accounts, mehrere Spielerprofile pro Account, Login
- Spielstände: Speichern, Laden, Fortschritt, Achievements, Statistiken
- Content-Repository als von Hand geschriebene, versionierte JSON-Dateien im
  Git-Repo (`data/themes/<theme_id>/...`), LLM-gestützt über das
  Authoring-Toolkit unter `data/_authoring/`

## Nicht-Ziele (MVP)

- Kein Admin-Dashboard, kein No-Code-Editor — Content entsteht per Commit/PR
- Kein Dynamic Level Creator, kein Multi-Map-Manager, kein Dialog-Sequenzer (UI)
- Kein Asset-Uploader, keine Validierungs-Engine als UI-Tool
- Keine KI-Grafik-Pipeline als Produktfeature (die Flux-Prompts sind
  Autoren-Werkzeug, kein Runtime-Feature)
- Keine Gruppenszenen mit 3+ gleichzeitigen Sprechern (zwei feste Plätze reichen)
- Kein Mehrspieler, kein Marketplace für Lernwelten

Alle diese Punkte bleiben architektonisch möglich (REST-API-Trennung macht
das offen), werden aber bewusst erst gebaut, wenn sich das Content-Format in
der Praxis bewährt hat (Phase 5+).

## Stack

| Layer | Wahl | Begründung |
|---|---|---|
| Frontend | Angular v20+, Standalone Components, Signals | Aktueller Standard, kein NgModule-Ballast |
| Backend | PHP 8.2+, kein Framework | Shared-Hosting-kompatibel, kein Overhead |
| Backend-Libs | FastRoute (Routing), firebase/php-jwt (Auth), vlucas/phpdotenv, monolog, respect/validation | Übernommen aus dem Schwesterprojekt promptigofant — bewährter Mini-Stack, gleiche Konventionen über beide Projekte |
| Datenbank | MySQL/MariaDB | Nutzerdaten, Profile, Spielstände, Statistiken — referenziert nur Content-IDs, nie Content selbst |
| Content | Statische, versionierte JSON-Dateien im Repo | Zweite Wahrheitsquelle vermeiden; Editor kommt erst, wenn das Format sich bewährt hat |
| Hosting | Shared-Hosting-kompatibel: PHP 8.2+, MySQL/MariaDB, Apache/Nginx, HTTPS | Kein Docker/Kubernetes/Cloud im MVP |

## Constraints

- Ein-Personen-Projekt (privat/solo) — wenig Prozess-Overhead, kein
  Plan-Zwang für Kleinkram, direkt auf dem Default-Branch
- Shared Hosting: keine Container-Infrastruktur, keine Cloud-Abhängigkeit
- Content-Erstellung im MVP ausschließlich über Git-Commits — kein UI-Tool
- Kein festes Datum/Deadline bekannt (Stand 2026-07-31) — Fahrplan ist
  phasenbasiert, nicht terminbasiert

## Meilensteine (aus dem Umsetzungsfahrplan)

1. **Core Architecture** — Angular-Projekt, `GameStateService`, Main-Hub mit
   Lernstufen-Filterung, PHP-Backend-Grundgerüst, MySQL-Schema
2. **Timeline & Map** — Router-Struktur Timeline/Map/Location,
   Fortschrittsanzeige aus Savegame, Content-API (liest JSON-Repository)
3. **Dialog- & Audio-Engine** — Speech-Bubbles mit Positionierung,
   Audio-Service, synchronisierte Wiedergabe
4. **Minispiel-System & Nutzerverwaltung** — `ngComponentOutlet`-Loader,
   die drei Starttypen, Login/Profile/Savegame-API/Achievements/Statistiken
5. *(außerhalb MVP-Scope)* Admin-Dashboard, Asset-Uploader,
   Validierungs-Engine, KI-Grafik-Pipeline, Marketplace, Mehrspieler

Nach Meilenstein 4 ist der MVP spielbar — mit Content, der von Hand ins Repo
geschrieben wurde.

## Offene Fragen

- 🟡 Exakte Koordinaten-Zuordnung Map → Node (x/y) ist noch nicht final
  spezifiziert — wird mit Meilenstein 2 nachgezogen
  (`data/_authoring/ASSET_REQUIREMENTS.md`, Abschnitt 4)
- 🟡 Der komplette Content-Schema-Stand in `data/_authoring/` ist noch nicht
  gegen eine laufende Engine verifiziert (Meilenstein 4 steht aus) — als 🟡
  markiert, bis das passiert ist
- Kein festgelegtes Datum für "Spiel muss laufen" — falls es eins gibt
  (Schuljahr, Geburtstag eines Kindes o.ä.), bitte nachtragen

## Quelle

Destilliert aus `docs/archive/2026-07/EduQuest_Engine_MVP_Konzept.md`
(vollständiges Ursprungskonzept, wortgetreu archiviert).
