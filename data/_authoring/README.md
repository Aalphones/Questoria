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
| `image-prompts/` | Bild-Prompt-Werkstatt: Modellwahl und Einstellungen plus Vorlagen für Hintergründe, Sprites, Karten, Sammelkarten und Bildantworten |
| `voice-tools/` | Sprach-Werkstatt: Skripte, die aus den Dialogtexten lokal Sprachdateien erzeugen |

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
- **Kartenpunkte werden in Prozent positioniert, nie in Pixeln.** Die
  Koordinaten beziehen sich auf das Kartenbild, nicht auf den Bildschirm —
  nur so sitzt ein Punkt auf jedem Gerät auf derselben Landmarke.
- **Fortschritt gehört nie ins Content.** Was ein Kind geschafft, gesammelt
  oder eingestellt hat, liegt im Spielstand. Content ist für alle gleich.
- **Sammelkarten sind fertige Bilder.** Die Engine erzeugt keine Karten, sie
  zeigt und druckt sie. Kartenrahmen und Motive entstehen vorher als PNG.
- **Jeder vorgelesene Text hat eine eigene Fassung.** `text_simple` ist kein
  Duplikat von `text`, sondern die kindgerechte Kurzform.

## Pflegepflicht — nicht verhandelbar

Jede Engine-Änderung, die das Content-Format betrifft, ist erst fertig, wenn
das ganze Toolkit mitgezogen wurde — vor allem ein neuer `game_type` in
der Tabelle aus `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.

**Definition of Done bei Schema-Änderungen:**

1. `JSON_SCHEMA_REFERENCE.md` aktualisieren — Feld dokumentieren, Beispiel anpassen
2. `LLM_WORLD_BUILDER_PROMPT.md` aktualisieren — neue Regel/Constraint aufnehmen
3. `ASSET_REQUIREMENTS.md` aktualisieren, falls neue Asset-Typen nötig sind
4. `image-prompts/` aktualisieren, falls neue Bildtypen nötig sind — neue
   Vorlage anlegen und in `image-prompts/README.md` eintragen
5. `voice-tools/` aktualisieren, falls sich die Dialogfelder, die Herkunft der
   `character_id` oder die Audio-Benennung ändern — die Skripte lesen das
   Episodenformat direkt und brechen still, wenn es sich unter ihnen wegdreht
6. `docs/design/README.md` prüfen, falls die Änderung das Zielbild betrifft
7. Gleicher Pull Request wie die Engine-Änderung. Kein „mach ich später".

Wird das nicht eingehalten, generieren LLMs gegen ein Schema von letzter
Woche — und du debuggst Montagmorgen ein Minispiel, das nie geladen hätte
werden können. Selbst verschuldet, vermeidbar, unnötig.

## Status-Markierung

Inhalte in diesem Toolkit, die noch nicht gegen die echte Engine verifiziert
wurden (weil Phase 4 noch nicht fertig ist), sind mit 🟡 markiert.
