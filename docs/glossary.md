# Glossar — Questoria

Ein Begriff, eine Bedeutung. Neu abgeklärte Fachbegriffe hier ergänzen, sobald
sie im Code, in Docs oder Tickets auftauchen.

| Begriff | Bedeutung |
|---|---|
| Themenwelt / Theme | Eine komplette Fandom-Lernwelt (z.B. "one_piece_sachkunde"), definiert durch `world_config.json`. Enthält Lernstufen, Maps, Episoden, Minispiele. |
| Lernstufe / Difficulty Level | Datengetriebene Schwierigkeitsstufe innerhalb einer Welt (z.B. "matrose"/"navigator"/"kapitaen"). Story bleibt gleich, nur die Minispiel-Varianten skalieren. |
| Arc / Map | Ein Story-Arc einer Welt, dargestellt als eigene begehbare Karte. Eine Welt hat standardmäßig mehrere Arcs/Maps. |
| Episode | Ein vollständiger Level-Node: Hintergrund, Dialog-Sequenz, Minispiel-Referenz — alles in einer JSON-Datei. Kein separates Dialog-System. |
| Node | Ein klickbarer Punkt auf einer Map, der zu einer Episode (Dialog/Minispiel) führt. |
| Minispiel | Jeder spielbare Baustein, den die Engine als eigene Angular-Komponente kennt (`game_type`). Kein Synonym für "Rätsel/Puzzle" — das Repertoire ist offen. |
| Bühnenplatz (`left`/`right`) | Die zwei einzigen festen Positionen für Dialog-Sprites. Keine freien x/y-Koordinaten. |
| Content-Repository | Die statischen, versionierten JSON-Dateien unter `data/themes/` — Content lebt im Git-Repo, nicht in der Datenbank. |
| Authoring-Toolkit | Die Schema-Referenz + LLM-Prompts + Asset-Vorgaben unter `data/_authoring/`, mit denen Content von Hand/per LLM erzeugt wird. |
| Savegame | Datenbank-Eintrag, der nur Content-IDs referenziert (aktive Episode, aktiver Node, abgeschlossene Minispiele, besessene Sammelkarten) — nie Content selbst. |
| Spielerprofil | Ein Profil innerhalb eines Accounts (ein Account kann mehrere Kinder/Profile haben). |
| Etappenkarte | Die Übersichtskarte einer Welt: alle Story-Arcs als Inseln, mit Sternen pro Etappe. Eine pro Welt. |
| Ortskarte | Die begehbare Karte eines einzelnen Arcs mit den Nodes, die Episoden starten. Eine pro Arc. |
| Sammelkarte | Ein fertiges Kartenbild (63 × 88 mm, 630 × 880 px), das als Belohnung für ein gelöstes Minispiel freigeschaltet wird. Die Engine erzeugt keine Karten, sie liefert sie aus. |
| Trophäenhalle | Der Bildschirm, auf dem ein Kind seine Sammelkarten sieht — gruppiert nach Set, mit Filter, Detailansicht und Druckauswahl. |
| Set | Gruppierungsschlüssel der Sammelkarten innerhalb einer Welt (z.B. "Etappe 2 · East Blue"). Bestimmt, wie die Trophäenhalle sortiert. |
| Seltenheit / Rarity | Wertstufe einer Sammelkarte: `haeufig`, `selten`, `legendaer`. Geschlossene Wertemenge, steuert nur die Farbgebung. |
| Druckbogen | Die druckbare DIN-A4-Seite mit 3×3 ausgewählten Sammelkarten in Originalgröße, optional mit Schnittmarken. |
| Vorlesemodus | Der Modus "Bilder & Vorlesen" für Kinder, die noch nicht lesen: kurze Textfassung, Bildantworten im Quiz, automatische Sprachausgabe. Gegenstück: "Selbst lesen". |
| Design-Token | Ein benannter Gestaltungswert (Farbe, Abstand, Radius, Schatten) aus `docs/design/`. Einzige Quelle für das Aussehen — keine Hardcodes in Komponenten. |
