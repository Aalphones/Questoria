# JSON Schema Reference — Questoria Engine Content

Verbindliche Struktur für alle Content-Dateien. Jede Abweichung ist ein Bug,
keine Variante. Ein LLM, das Content generiert, MUSS diese Schemas exakt
einhalten — keine zusätzlichen Felder, keine fehlenden Pflichtfelder, keine
umbenannten Keys.

🟡 = Vorschlag, noch nicht gegen die laufende Engine verifiziert (Phase 4 steht aus).

---

## 1. `main_hub.json`

Liegt unter `assets/main_hub.json`. Genau eine Datei, listet alle installierten
Welten.

```json
{
  "installed_themes": [
    {
      "id": "string — eindeutig, snake_case, identisch zu theme_id in world_config.json",
      "title": "string — Anzeigename",
      "cover": "string — relativer Pfad zu /data/themes/<id>/cover.webp",
      "config_path": "string — relativer Pfad zu world_config.json"
    }
  ]
}
```

---

## 2. `world_config.json`

Liegt unter `/data/themes/<theme_id>/world_config.json`. Eine Datei pro Welt.

```json
{
  "theme_id": "string — identisch zur id in main_hub.json",
  "difficulty_levels": [
    { "id": "string — snake_case, z. B. matrose", "label": "string — Anzeigename, z. B. Matrose (Leicht)" }
  ],
  "maps": [
    { "id": "string — snake_case", "name": "string — Anzeigename", "file": "string — Dateiname unter maps/" }
  ]
}
```

**Mehrere Karten sind der Normalfall, keine Ausnahme.** Eine Themenwelt
bildet typischerweise mehrere Story-Arcs ab, jeder Arc = eine eigene Map.
Beispiel One Piece:

```json
{
  "theme_id": "one_piece_sachkunde",
  "difficulty_levels": [
    { "id": "matrose", "label": "Matrose (Leicht)" },
    { "id": "navigator", "label": "Navigator (Mittel)" },
    { "id": "kapitaen", "label": "Kapitän (Schwer)" }
  ],
  "maps": [
    { "id": "east_blue", "name": "East Blue", "file": "map_east_blue.webp" },
    { "id": "alabasta", "name": "Königreich Alabasta", "file": "map_alabasta.webp" },
    { "id": "skypiea", "name": "Skypiea", "file": "map_skypiea.webp" }
  ]
}
```

Episoden referenzieren ihre Map über `active_map_id` (siehe Abschnitt 3).
Eine Welt mit nur einer Map ist erlaubt, aber kein Designziel — neue Arcs
heißt: neuer `maps[]`-Eintrag, neue Episoden, fertig. Keine Restrukturierung
nötig.

**Regeln:**
- `difficulty_levels` braucht mindestens einen Eintrag.
- Jede `id` in `difficulty_levels` muss in jedem Minispiel der Welt als
  Variante existieren (siehe Abschnitt 4).

---

## 3. Episoden-Datei (Level-Node)

Liegt unter `/data/themes/<theme_id>/episodes/<episode_id>.json`. Eine
Episode ist ein vollständiger Level-Node: Hintergrund, Dialog, Minispiel —
alles in einer Datei. **Kein separater Dialogordner, keine separate
Dialog-Referenzierung.** Dialoge sind Teil der Episode, sonst nichts.

```json
{
  "episode_id": "string — eindeutig innerhalb der Welt, snake_case",
  "active_map_id": "string — muss eine maps[].id aus world_config.json sein",
  "node_id": "string — eindeutig innerhalb der Map, Ziel-Node auf der Karte",
  "background": "string — Dateiname unter backgrounds/, z. B. hafendamm.webp",

  "dialogue_sequence": [
    {
      "position": "enum: left | right",
      "sprite": "string — Dateiname unter sprites/<character>/",
      "name": "string — Anzeigename über der Sprechblase",
      "text": "string — Dialogzeile",
      "audio_path": "string (optional) — relativer Pfad unter audio/voices/"
    }
  ],

  "minigame_event": {
    "minigame_ref": "string — Dateiname (ohne .json) unter minigames/"
  }
}
```

### Feste Positionen statt Koordinaten

Die Bühne kennt genau zwei Plätze: `left` und `right`. Jede Sprechblase
hängt fest an ihrem Platz — links unten für `left`, rechts unten für
`right`. Es gibt **keine** x/y-Koordinaten, **keine** `bubble_position`-Wahl
und **keine** separate Charakterliste mehr zu pflegen.

Pro Dialogzeile wird nur konfiguriert: **Sprite, Name, Text** (plus optional
Audio). Das war's. Will dieselbe Figur zweimal hintereinander sprechen,
wiederholt man Sprite und Name einfach — das ist gewollte Redundanz, kein
Bug, weil sie das Schema simpel hält.

Zwei Figuren auf der Bühne: eine auf `left`, eine auf `right`. Eine dritte
Figur „betritt" die Szene, indem eine folgende Dialogzeile denselben Platz
mit anderem Sprite/Name belegt — die vorherige Figur „verlässt" die Bühne
damit implizit.

🟡 Mehr als zwei gleichzeitige Sprecher (z. B. Gruppenszenen) sind im MVP
nicht vorgesehen. Falls nötig: hier nachtragen, sobald ein echter Bedarf
auftaucht — nicht vorab spekulativ bauen.

**Regeln:**
- `dialogue_sequence` wird strikt der Reihe nach abgespielt, keine Branches.
- Jede referenzierte `sprite`-Datei muss tatsächlich existieren.

---

## 4. Minispiel-Datei

Liegt unter `/data/themes/<theme_id>/minigames/<minigame_id>.json`. Ein
Minispiel ist **kein Synonym für Rätsel** — es ist jeder spielbare Baustein,
den die Engine als eigene Angular-Komponente kennt. Das Repertoire wächst:
heute Multiple-Choice, morgen Memory, übermorgen ein Schieberätsel. Neue
Spieltypen brauchen nur einen neuen `game_type`-Wert plus passende
Komponente in der Engine — das Content-JSON-Format drumherum bleibt gleich.

Ein Minispiel hat genau eine Variante pro Lernstufe der Welt — die Engine
lädt zur Laufzeit nur die Variante der aktiven `difficulty_level`.

```json
{
  "minigame_id": "string — identisch zum Dateinamen ohne .json",
  "game_type": "enum, siehe Liste unten — erweiterbar",
  "variants": {
    "<difficulty_level_id>": { "...": "siehe Payload-Schema je nach game_type" }
  }
}
```

`variants` braucht für JEDE `id` aus `world_config.json → difficulty_levels`
einen Eintrag.

### MVP-Starttypen (`game_type`)

| Wert | Komponente | Payload-Schema |
|---|---|---|
| `MultipleChoiceGame` | `MultipleChoiceComponent` | 4.1 |
| `TextInputGame` | `TextInputComponent` | 4.2 |
| `ImageSearchGame` | `ImageSearchComponent` | 4.3 |

Diese Tabelle ist der einzige Ort, an dem `game_type` ↔ Komponente verbindlich
zugeordnet wird. **Neue Spieltypen werden hier ergänzt, sobald die
zugehörige Engine-Komponente existiert** — nicht früher, sonst referenzieren
LLM-generierte Welten Spiele, die es nicht gibt.

### 4.1 Payload: `MultipleChoiceGame`

```json
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correct_index": "integer — 0-basiert, Index in options"
}
```

### 4.2 Payload: `TextInputGame`

```json
{
  "question": "string",
  "input_type": "enum: text | number",
  "accepted_answers": ["string", "string"],
  "case_sensitive": "boolean — default false"
}
```

### 4.3 Payload: `ImageSearchGame`

```json
{
  "image": "string — Dateiname unter backgrounds/ oder eigenem images/-Ordner",
  "question": "string",
  "targets": [
    { "label": "string", "x": "number 0–100 (%)", "y": "number 0–100 (%)", "radius": "number 0–100 (% Toleranzradius)" }
  ],
  "find_all": "boolean — true = alle targets müssen gefunden werden, false = einer reicht"
}
```

**Beispiel — vollständige Minispiel-Datei:**

```json
{
  "minigame_id": "minigame_001",
  "game_type": "MultipleChoiceGame",
  "variants": {
    "matrose": {
      "question": "Wie viele Meere umfasst die Grand Line?",
      "options": ["Eines", "Zwei", "Vier", "Sieben"],
      "correct_index": 0
    },
    "navigator": {
      "question": "Welcher Kompass funktioniert auf der Grand Line nicht zuverlässig?",
      "options": ["Log Pose", "Standardkompass", "Eternal Pose", "Sternennavigation"],
      "correct_index": 1
    },
    "kapitaen": {
      "question": "Was bestimmt die Route eines Log Pose primär?",
      "options": ["Magnetfeld der nächsten Insel", "Windrichtung", "Sonnenstand", "Strömung"],
      "correct_index": 0
    }
  }
}
```

---

## 5. Vollständiges Episoden-Beispiel

```json
{
  "episode_id": "arc_01_foosha",
  "active_map_id": "east_blue",
  "node_id": "windmuehlen_dorf",
  "background": "hafendamm.webp",
  "dialogue_sequence": [
    {
      "position": "left",
      "sprite": "shanks_neutral.png",
      "name": "Shanks",
      "text": "Hey Luffy, du bist noch viel zu jung für die See!",
      "audio_path": "audio/voices/shanks_arc_01_001.mp3"
    },
    {
      "position": "right",
      "sprite": "luffy_wuetend.png",
      "name": "Luffy",
      "text": "Bin ich nicht! Ich werde der König der Piraten!"
    }
  ],
  "minigame_event": {
    "minigame_ref": "minigame_001"
  }
}
```

---

## 6. Checkliste vor dem Commit

- [ ] Jede `id` aus `difficulty_levels` hat eine Variante in jedem referenzierten Minispiel
- [ ] Jede referenzierte Datei (`background`, `sprite`, `audio_path`, `image`) liegt tatsächlich im Ordner
- [ ] `episode_id`, `minigame_id` sind jeweils eindeutig innerhalb der Welt
- [ ] `active_map_id` existiert in `world_config.json → maps`
- [ ] `game_type` steht in der Tabelle aus Abschnitt 4 — keine erfundenen Spieltypen
- [ ] JSON ist valide (kein Trailing Comma, korrekte Anführungszeichen) — im Zweifel durch `jq .` jagen
