# Content-Authoring-Toolkit

Dieses Verzeichnis lebt im Repo unter `/data/_authoring/`. Es ist das einzige
Handwerkszeug, das im MVP zur Content-Erstellung existiert — kein Editor,
keine UI. Stattdessen: Schemas, die ein LLM und ein Mensch gleichermaßen
verstehen, plus fertige Prompts für Text- und Bildgenerierung.

## Dateien

| Datei | Zweck |
|---|---|
| `JSON_SCHEMA_REFERENCE.md` | Vollständige, verbindliche Struktur aller Content-JSON-Dateien |
| `LLM_WORLD_BUILDER_PROMPT.md` | Copy-Paste-Prompt für Claude/ChatGPT/Gemini, der eine komplette Welt erzeugt |
| `ASSET_REQUIREMENTS.md` | Welche Dateien (Bilder, Audio) in welchem Format wo liegen müssen |
| `FLUX_PROMPT_LIBRARY.md` | Prompt-Vorlagen für Hintergrund-Clearing und Sprite-Erstellung |

## Designentscheidungen, die hier verbindlich gelten

- **Dialoge gehören in die Episode, nicht in einen eigenen Ordner.** Eine
  Episodendatei ist der vollständige Level-Node: Hintergrund, Dialog,
  Minispiel-Referenz. Eine separate Dialog-Datenebene wäre nur eine zweite
  Quelle, die aus dem Tritt geraten kann.
- **Zwei feste Bühnenplätze (`left`/`right`), keine freien Koordinaten.**
  Pro Dialogzeile wird nur Sprite, Name und Text konfiguriert — Position und
  Sprechblasen-Ausrichtung ergeben sich automatisch aus dem gewählten Platz.
- **„Minispiel", nie „Puzzle" oder „Rätsel".** Das Repertoire an spielbaren
  Bausteinen ist offen für alles, was sich per `ngComponentOutlet` laden
  lässt — Multiple Choice ist der Anfang, nicht das Konzept.
- **Mehrere Karten pro Welt sind Standard, kein Sonderfall.** Eine Welt
  bildet typischerweise mehrere Story-Arcs ab, jede mit eigener Map.

## Pflegepflicht — nicht verhandelbar

Jede Engine-Änderung, die das Content-Format betrifft, ist erst fertig, wenn
diese vier Dateien mitgezogen wurden — vor allem ein neuer `game_type` in
der Tabelle aus `JSON_SCHEMA_REFERENCE.md` Abschnitt 4.

**Definition of Done bei Schema-Änderungen:**

1. `JSON_SCHEMA_REFERENCE.md` aktualisieren — Feld dokumentieren, Beispiel anpassen
2. `LLM_WORLD_BUILDER_PROMPT.md` aktualisieren — neue Regel/Constraint aufnehmen
3. `ASSET_REQUIREMENTS.md` aktualisieren, falls neue Asset-Typen nötig sind
4. `FLUX_PROMPT_LIBRARY.md` aktualisieren, falls neue Bildtypen nötig sind
5. Gleicher Pull Request wie die Engine-Änderung. Kein „mach ich später".

Wird das nicht eingehalten, generieren LLMs gegen ein Schema von letzter
Woche — und du debuggst Montagmorgen ein Minispiel, das nie geladen hätte
werden können. Selbst verschuldet, vermeidbar, unnötig.

## Status-Markierung

Inhalte in diesem Toolkit, die noch nicht gegen die echte Engine verifiziert
wurden (weil Phase 4 noch nicht fertig ist), sind mit 🟡 markiert.
