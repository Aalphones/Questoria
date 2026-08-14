# Glossar — Questoria

Ein Begriff, eine Bedeutung. Neu abgeklärte Fachbegriffe hier ergänzen, sobald
sie im Code, in Docs oder Tickets auftauchen.

| Begriff | Bedeutung |
|---|---|
| Themenwelt / Theme | Eine komplette Fandom-Lernwelt (z.B. "one_piece_sachkunde"), definiert durch `world_config.json`. Enthält Lernstufen, Maps, Episoden, Events. |
| Lernstufe / Difficulty Level | Datengetriebene Schwierigkeitsstufe innerhalb einer Welt (z.B. "matrose"/"navigator"/"kapitaen"). Story bleibt gleich, nur die Event-Varianten skalieren. |
| Arc / Map | Ein Story-Arc einer Welt, dargestellt als eigene begehbare Karte. Eine Welt hat standardmäßig mehrere Arcs/Maps. |
| Etappe | Ein Story-Arc, dargestellt als Insel auf der Etappenkarte (`arc_overview.stages[]`). Eine Etappe entspricht genau einer Map/einem Arc. |
| Episode | Ein Abenteuer an einem Ort: Hintergrund plus eine **Eventliste**, die die Engine der Reihe nach abspielt. Alles in einer JSON-Datei, kein separates Dialog-System. |
| Event / Gameplay-Event | Ein Baustein der Erzählung, den die Engine als eigene Angular-Komponente kennt (`type`). Dialog, Rätsel, Erkundung, Kampf und Belohnung sind gleichrangig — es gibt keinen Sonderweg für Dialoge und kein Synonym „Minispiel/Rätsel/Puzzle". |
| Event Engine | Der eine Ablaufmechanismus im Frontend: spielt eine Eventliste ab, wählt pro Event die Komponente, sammelt das Ergebnis ein. Es gibt genau einen. |
| Event Loader | Die Stelle, die einen Eventtyp über `ngComponentOutlet` auf seine Komponente abbildet. Kein `@switch` im Ablauf-Gerüst. |
| Eventtyp (`type`) | Der Schlüssel, unter dem ein Event seine Komponente findet (`dialog`, `multiple_choice`, ...). Geschlossene Wertemenge, gepflegt in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0 — ein Typ steht dort erst, wenn seine Komponente existiert. |
| Event-Konfiguration | Die Daten, mit denen ein Event bespielt wird (`config`). Leichte Events tragen sie inline in der Episode, Events mit Lernstufen-Varianten in einer eigenen Datei unter `events/`, referenziert über `config.ref`. |
| Node | Ein klickbarer Punkt auf einer Map, der eine Episode startet. |
| Ort | Anzeigename für einen Node auf der Ortskarte — der Punkt, an dem die Episode spielt. |
| Bühnenplatz (`left`/`right`) | Die zwei einzigen festen Positionen für Dialog-Sprites. Keine freien x/y-Koordinaten. |
| Content-Repository | Die statischen, versionierten JSON-Dateien unter `data/themes/` — Content lebt im Git-Repo, nicht in der Datenbank. |
| Testwelt | Die schema-vollständige Entwicklerwelt `dev_fixture` unter `data/themes/dev_fixture/` — dient dem Testen von Karten, Routing und Fortschritt, ohne auf echten (Fandom-)Content zu warten. |
| Authoring-Toolkit | Die Schema-Referenz + LLM-Prompts + Asset-Vorgaben unter `data/_authoring/`, mit denen Content von Hand/per LLM erzeugt wird. |
| Savegame | Datenbank-Eintrag, der nur Content-IDs referenziert (aktive Episode, aktiver Node, abgeschlossene Events, besessene Sammelkarten) — nie Content selbst. |
| Spielerprofil | Ein Profil innerhalb eines Accounts (ein Account kann mehrere Kinder/Profile haben). |
| Etappenkarte | Die Übersichtskarte einer Welt: alle Story-Arcs als Inseln, mit Sternen pro Etappe. Eine pro Welt. |
| Ortskarte | Die begehbare Karte eines einzelnen Arcs mit den Nodes, die Episoden starten. Eine pro Arc. |
| Sammelkarte | Ein fertiges Kartenbild (63 × 88 mm, 630 × 880 px), das ein `reward`-Event freischaltet. Die Engine erzeugt keine Karten, sie liefert sie aus. |
| Trophäenhalle | Der Bildschirm, auf dem ein Kind seine Sammelkarten sieht — gruppiert nach Set, mit Filter, Detailansicht und Druckauswahl. |
| Set | Gruppierungsschlüssel der Sammelkarten innerhalb einer Welt (z.B. "Etappe 2 · East Blue"). Bestimmt, wie die Trophäenhalle sortiert. |
| Seltenheit / Rarity | Wertstufe einer Sammelkarte: `haeufig`, `selten`, `legendaer`. Geschlossene Wertemenge, steuert nur die Farbgebung. |
| Druckbogen | Die druckbare DIN-A4-Seite mit 3×3 ausgewählten Sammelkarten in Originalgröße, optional mit Schnittmarken. |
| Vorlesemodus | Der Modus "Bilder & Vorlesen" für Kinder, die noch nicht lesen: kurze Textfassung, Bildantworten im Quiz, automatische Sprachausgabe. Gegenstück: "Selbst lesen". |
| Design-Token | Ein benannter Gestaltungswert (Farbe, Abstand, Radius, Schatten) aus `docs/design/`. Einzige Quelle für das Aussehen — keine Hardcodes in Komponenten. |
| Fortschritt | Der gespeicherte Stand, welche Episoden ein Kind abgeschlossen hat — bis Meilenstein 4 im Browser-Speicher (`ProgressService`), danach über die Savegame-Schnittstelle (ADR-006). |
| Sterne | Bewertung einer geschafften Episode (0–3), Teil von `EpisodeProgress`. Bis die Event Engine (Meilenstein 3) echte Sterne vergibt, liefert der Ort-Platzhalter pauschal 3. |
| Etappen-Zustand | `geschafft`/`aktuell`/`gesperrt` (`ProgressState`) — Ergebnis der reinen Freischaltregeln in `progress.rules.ts`, gilt gleichermaßen für Orte und Etappen. |

## Abgelöste Begriffe

Seit dem Architekturschnitt am 14.08.2026 ([ADR-004](decisions/004-event-engine.md))
nicht mehr verwenden — weder im Code noch in Docs, Commits oder Tickets:

| Alt | Neu |
|---|---|
| Minispiel | Gameplay-Event, kurz Event |
| Minispiel-System / Minigame Engine | Event Engine |
| Minigame Component | Event-Komponente |
| Minigame Loader | Event Loader |
| `game_type` | `type` (Feld im Event) |
| `minigame_id` | `event_id` |
| `minigame_event` / `minigame_ref` | Eintrag in `events[]` mit `config.ref` |
| `dialogue_sequence` | `dialog`-Event mit `config.lines` |
| `reward_card_id` (Episodenfeld) | `reward`-Event mit `config.card_id` |
| Ordner `minigames/` | Ordner `events/` |
| Spalte `minigames_completed` | Spalte `events_completed` (Migration 008) |

Ausnahme: `docs/archive/` beschreibt bewusst den alten Stand und wird nicht
nachgezogen.
