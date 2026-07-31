# JSON Schema Reference — Questoria Engine Content

Verbindliche Struktur für alle Content-Dateien. Jede Abweichung ist ein Bug,
keine Variante. Ein LLM, das Content generiert, MUSS diese Schemas exakt
einhalten — keine zusätzlichen Felder, keine fehlenden Pflichtfelder, keine
umbenannten Keys.

🟡 = Vorschlag, noch nicht gegen die laufende Engine verifiziert (Meilenstein 4 steht aus).

Das visuelle Zielbild zu diesen Daten steht in [docs/design/](../../docs/design/) —
der Prototyp dort nutzt eine flachere Beispielstruktur, verbindlich ist diese Datei.

---

## Dateien pro Welt — Überblick

| Datei | Inhalt |
|---|---|
| `assets/main_hub.json` | Alle installierten Welten + Planetenkarte |
| `/data/themes/<theme_id>/world_config.json` | Lernstufen, Etappenkarte, Ortskarten mit Nodes |
| `/data/themes/<theme_id>/cards.json` | Kartenformat + alle Sammelkarten der Welt |
| `/data/themes/<theme_id>/episodes/<episode_id>.json` | Level-Node: Hintergrund, Dialog, Minispiel-Referenz, Belohnungskarte |
| `/data/themes/<theme_id>/minigames/<minigame_id>.json` | Minispiel-Payload, eine Variante pro Lernstufe |

---

## 1. `main_hub.json`

Liegt unter `assets/main_hub.json`. Genau eine Datei, listet alle installierten
Welten und beschreibt die Planetenkarte, auf der sie angeordnet sind.

```json
{
  "hub_map": {
    "background": "string — Dateiname unter assets/hub/, 16:9",
    "routes": [["string — theme id", "string — theme id"]]
  },
  "installed_themes": [
    {
      "id": "string — eindeutig, snake_case, identisch zu theme_id in world_config.json",
      "title": "string — Anzeigename",
      "cover": "string — relativer Pfad zu /data/themes/<id>/cover.webp",
      "config_path": "string — relativer Pfad zu world_config.json",
      "x": "number 0–100 — horizontale Position auf der Planetenkarte, in % der Kartenbreite",
      "y": "number 0–100 — vertikale Position, in % der Kartenhöhe",
      "size": "number 0–100 — Durchmesser des Weltknotens, in % der Kartenbreite"
    }
  ]
}
```

`routes` zeichnet gestrichelte Verbindungslinien zwischen zwei Welten. Beide
Enden müssen `installed_themes[].id` sein. Leeres Array = keine Linien.

**Warum Prozent und keine Pixel:** Die Kartenbilder sind 16:9 und werden je nach
Gerät unterschiedlich groß dargestellt. Prozentwerte beziehen sich auf das
Kartenbild selbst — ein Knoten sitzt damit auf jedem Bildschirm auf demselben
Punkt der Illustration. Das gilt auch für `size`: eine Pixelgröße würde auf dem
Handy im Verhältnis zur Karte riesig wirken und Knoten überlappen lassen.

---

## 2. `world_config.json`

Liegt unter `/data/themes/<theme_id>/world_config.json`. Eine Datei pro Welt.
Enthält die Lernstufen und **zwei Kartenebenen**: die Etappenkarte (Übersicht
über alle Story-Arcs) und pro Arc eine Ortskarte mit den begehbaren Nodes.

```json
{
  "theme_id": "string — identisch zur id in main_hub.json",
  "title": "string — Anzeigename der Welt",
  "subject": "string — Lernfach, z. B. Sachkunde",

  "difficulty_levels": [
    { "id": "string — snake_case, z. B. matrose", "label": "string — Anzeigename, z. B. Matrose (Leicht)" }
  ],

  "arc_overview": {
    "title": "string — Überschrift der Etappenkarte, z. B. Die Reise der Windmühlen-Crew",
    "background": "string — Dateiname unter maps/, 16:9",
    "stages": [
      {
        "map_id": "string — muss eine maps[].id sein",
        "name": "string — Anzeigename der Etappe",
        "x": "number 0–100 (%)",
        "y": "number 0–100 (%)",
        "size": "number 0–100 — Breite der Etappeninsel in % der Kartenbreite",
        "aspect": "number — Höhe/Breite der Insel, z. B. 0.72",
        "shape": "string — CSS border-radius-Wert für die Inselform, z. B. 46% 56% 40% 60%",
        "illustration": "string — Dateiname unter maps/, z. B. ep_02.webp"
      }
    ],
    "routes": [["string — map_id", "string — map_id"]]
  },

  "maps": [
    {
      "id": "string — snake_case",
      "name": "string — Anzeigename",
      "file": "string — Dateiname unter maps/",
      "nodes": [
        {
          "id": "string — eindeutig innerhalb der Map",
          "name": "string — Anzeigename am Kartenpunkt",
          "x": "number 0–100 (%)",
          "y": "number 0–100 (%)",
          "episode_ref": "string — episode_id, die dieser Punkt startet"
        }
      ],
      "routes": [["string — node id", "string — node id"]]
    }
  ]
}
```

**Mehrere Karten sind der Normalfall, keine Ausnahme.** Eine Themenwelt
bildet typischerweise mehrere Story-Arcs ab, jeder Arc = eine eigene Map.
Beispiel One Piece:

```json
{
  "theme_id": "one_piece_sachkunde",
  "title": "Piratenwelt",
  "subject": "Sachkunde",
  "difficulty_levels": [
    { "id": "matrose", "label": "Matrose (Leicht)" },
    { "id": "navigator", "label": "Navigator (Mittel)" },
    { "id": "kapitaen", "label": "Kapitän (Schwer)" }
  ],
  "arc_overview": {
    "title": "Die Reise der Windmühlen-Crew",
    "background": "map_ostmeer_uebersicht.webp",
    "stages": [
      { "map_id": "east_blue", "name": "Die Karte von East Blue", "x": 30, "y": 46, "size": 12, "aspect": 0.72, "shape": "46% 56% 40% 60%", "illustration": "ep_02.webp" },
      { "map_id": "alabasta", "name": "Königreich Alabasta", "x": 62, "y": 28, "size": 10, "aspect": 0.69, "shape": "44% 58% 42% 60%", "illustration": "ep_04.webp" }
    ],
    "routes": [["east_blue", "alabasta"]]
  },
  "maps": [
    {
      "id": "east_blue",
      "name": "East Blue",
      "file": "map_east_blue.webp",
      "nodes": [
        { "id": "dorf", "name": "Windmühlen-Dorf", "x": 23, "y": 64, "episode_ref": "arc_01_foosha" },
        { "id": "hafen", "name": "Alter Hafen", "x": 50, "y": 30, "episode_ref": "arc_01_hafen" }
      ],
      "routes": [["dorf", "hafen"]]
    }
  ]
}
```

Episoden referenzieren ihre Map über `active_map_id` und ihren Punkt über
`node_id` (siehe Abschnitt 4). Eine Welt mit nur einer Map ist erlaubt, aber
kein Designziel — neuer Arc heißt: neuer `maps[]`-Eintrag, neuer
`arc_overview.stages[]`-Eintrag, neue Episoden, fertig.

**Regeln:**
- `difficulty_levels` braucht mindestens einen Eintrag.
- Jede `id` in `difficulty_levels` muss in jedem Minispiel der Welt als
  Variante existieren (siehe Abschnitt 5).
- Jede `stages[].map_id` muss eine `maps[].id` sein.
- Jede `nodes[].episode_ref` muss eine existierende Episodendatei treffen.
- `routes` verbindet nur Punkte derselben Ebene — Etappen mit Etappen, Nodes
  mit Nodes derselben Map.

---

## 3. `cards.json` — Sammelkarten

Liegt unter `/data/themes/<theme_id>/cards.json`. Eine Datei pro Welt.

Sammelkarten sind **fertige Bilddateien**, die außerhalb des Spiels erzeugt und
mit dem Content ausgeliefert werden. Die Engine erzeugt keine Karten — sie
schaltet frei, zeigt an, lässt auswählen und druckt. Kinder gewinnen Karten
durch abgeschlossene Minispiele und können sie auf DIN A4 ausdrucken.

```json
{
  "card_format": {
    "width_mm": 63,
    "height_mm": 88,
    "canvas": [630, 880],
    "dpi": 300,
    "sheet": "A4",
    "grid": [3, 3]
  },
  "cards": [
    {
      "id": "string — eindeutig innerhalb der Welt, snake_case",
      "name": "string — Kartenname",
      "set": "string — Gruppierungsschlüssel, z. B. Etappe 2 · East Blue",
      "rarity": "enum: haeufig | selten | legendaer",
      "asset": "string — Dateiname unter cards/, z. B. karte_kompassrose.png",
      "flavor": "string — kurzer Spruch auf der Kartenrückseite/im Detail",
      "hint": "string — steht auf der verschlossenen Karte: wie komme ich da ran?"
    }
  ]
}
```

**Regeln:**
- `card_format` ist pro Welt identisch zu lassen, solange kein zweites
  Kartenformat existiert. 63 × 88 mm bei 300 dpi = 630 × 880 px — das ist die
  Standard-Sammelkartengröße, für die es Hüllen und Sortierkästen gibt.
- `rarity` ist eine **geschlossene Wertemenge**. Neue Stufen zuerst hier
  eintragen, dann im Code — sonst rendert die Engine einen Farbcode, den sie
  nicht kennt.
- Die Halle gruppiert Karten nach `set`, in der Reihenfolge des ersten
  Auftretens im Array. `set` ist freier Text, aber **innerhalb einer Welt
  konsistent schreiben** — jede Abweichung erzeugt eine neue Gruppe.
- `hint` ist Pflicht für jede Karte, die nicht sofort verfügbar ist. Fehlt er,
  zeigt die verschlossene Karte nur einen Standardsatz und das Kind weiß nicht,
  wo es suchen soll.
- Jede Karte, die eine Episode als `reward_card_id` nennt, muss hier existieren.

**Nicht in dieser Datei:** ob ein Kind eine Karte besitzt und wann es sie
bekommen hat. Das ist Fortschritt, kein Content — siehe Abschnitt 7.

---

## 4. Episoden-Datei (Level-Node)

Liegt unter `/data/themes/<theme_id>/episodes/<episode_id>.json`. Eine
Episode ist ein vollständiger Level-Node: Hintergrund, Dialog, Minispiel —
alles in einer Datei. **Kein separater Dialogordner, keine separate
Dialog-Referenzierung.** Dialoge sind Teil der Episode, sonst nichts.

```json
{
  "episode_id": "string — eindeutig innerhalb der Welt, snake_case",
  "active_map_id": "string — muss eine maps[].id aus world_config.json sein",
  "node_id": "string — muss eine nodes[].id dieser Map sein",
  "background": "string — Dateiname unter backgrounds/, z. B. hafendamm.webp",
  "reward_card_id": "string (optional) — cards[].id, die beim Abschluss freigeschaltet wird",

  "dialogue_sequence": [
    {
      "position": "enum: left | right",
      "sprite": "string — Dateiname unter sprites/<character>/",
      "name": "string — Anzeigename über der Sprechblase",
      "text": "string — Dialogzeile für Kinder, die selbst lesen",
      "text_simple": "string (optional) — kurze Fassung für den Vorlesemodus, siehe Abschnitt 6",
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
Kurzfassung und Audio). Das war's. Will dieselbe Figur zweimal hintereinander
sprechen, wiederholt man Sprite und Name einfach — das ist gewollte Redundanz,
kein Bug, weil sie das Schema simpel hält.

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
- `node_id` muss auf der Map liegen, die `active_map_id` nennt — sonst zeigt
  die Karte einen Punkt, der ins Leere führt.
- `reward_card_id` darf mehrfach im Content vorkommen, aber die Vergabe ist
  idempotent: eine bereits besessene Karte wird nicht doppelt vergeben.

---

## 5. Minispiel-Datei

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
| `MultipleChoiceGame` | `MultipleChoiceComponent` | 5.1 |
| `TextInputGame` | `TextInputComponent` | 5.2 |
| `ImageSearchGame` | `ImageSearchComponent` | 5.3 |

Diese Tabelle ist der einzige Ort, an dem `game_type` ↔ Komponente verbindlich
zugeordnet wird. **Neue Spieltypen werden hier ergänzt, sobald die
zugehörige Engine-Komponente existiert** — nicht früher, sonst referenzieren
LLM-generierte Welten Spiele, die es nicht gibt.

### 5.1 Payload: `MultipleChoiceGame`

```json
{
  "question": "string",
  "question_simple": "string (optional) — kurze Fassung für den Vorlesemodus",
  "options": [
    {
      "label": "string — Antworttext",
      "image": "string (optional) — Dateiname unter answers/, z. B. antwort_norden.png"
    }
  ],
  "correct_index": "integer — 0-basiert, Index in options"
}
```

Genau vier Optionen (2×2-Raster im Design). Im Vorlesemodus wird über jeder
Antwort das Bild aus `image` angezeigt und die Antworten sind mit Ziffern 1–4
markiert; im Lesemodus entfällt das Bild und es sind Buchstaben A–D.

**`image` ist ein echter Dateiname, kein abgeleiteter.** Wer den Bildnamen aus
dem Antworttext berechnet, verliert das Bild bei jeder Textkorrektur.

### 5.2 Payload: `TextInputGame`

```json
{
  "question": "string",
  "question_simple": "string (optional) — kurze Fassung für den Vorlesemodus",
  "input_type": "enum: text | number",
  "accepted_answers": ["string", "string"],
  "case_sensitive": "boolean — default false"
}
```

🟡 Freitexteingabe passt schlecht zu Kindern, die noch nicht schreiben. Für den
Vorlesemodus eine der anderen beiden Spielarten wählen, oder `input_type:
number` verwenden.

### 5.3 Payload: `ImageSearchGame`

```json
{
  "image": "string — Dateiname unter backgrounds/ oder eigenem images/-Ordner",
  "question": "string",
  "question_simple": "string (optional) — kurze Fassung für den Vorlesemodus",
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
      "question": "In welche Richtung zeigt die Nadel vom Kompass immer?",
      "question_simple": "Wohin zeigt der Kompass?",
      "options": [
        { "label": "Norden", "image": "antwort_norden.png" },
        { "label": "Süden", "image": "antwort_sueden.png" },
        { "label": "Osten", "image": "antwort_osten.png" },
        { "label": "Westen", "image": "antwort_westen.png" }
      ],
      "correct_index": 0
    },
    "navigator": {
      "question": "Welcher Kompass funktioniert auf der Grand Line nicht zuverlässig?",
      "options": [
        { "label": "Log Pose" },
        { "label": "Standardkompass" },
        { "label": "Eternal Pose" },
        { "label": "Sternennavigation" }
      ],
      "correct_index": 1
    },
    "kapitaen": {
      "question": "Was bestimmt die Route eines Log Pose primär?",
      "options": [
        { "label": "Magnetfeld der nächsten Insel" },
        { "label": "Windrichtung" },
        { "label": "Sonnenstand" },
        { "label": "Strömung" }
      ],
      "correct_index": 0
    }
  }
}
```

---

## 6. Vorlesemodus — zwei Textfassungen

Questoria ist auch für Kinder gedacht, die noch nicht lesen können. Dafür gibt
es zwei Modi, die das Kind (oder ein Elternteil) jederzeit umschalten kann:

| Modus | Text | Antworten | Vorlesen |
|---|---|---|---|
| **Bilder & Vorlesen** (Standard) | `text_simple` / `question_simple`, Rückfall auf `text` / `question` | Bild über jeder Antwort, Ziffern 1–4 | automatisch beim Öffnen |
| **Selbst lesen** | `text` / `question` | nur Text, Buchstaben A–D | nur auf Knopfdruck |

**Was das für Autoren heißt:**

- `text_simple` ist **kein Übersetzungsduplikat**, sondern die vorgelesene
  Fassung: kürzere Sätze, weniger Nebensätze, keine Schachtelungen. Eine Zeile
  aus zwei Hauptsätzen ist gut, ein Satz mit drei Kommas ist es nicht.
- Fehlt `text_simple`, liest die Engine `text` vor. Das ist erlaubt und für
  kurze Zeilen richtig — es ist kein Fehler, aber auch keine Ausrede für
  Schachtelsätze.
- `image` bei Multiple-Choice-Antworten ist im Vorlesemodus **die einzige
  Information, die ein nicht-lesendes Kind bekommt.** Fehlt es, sieht das Kind
  eine leere Fläche mit einer Ziffer und rät.
- Vorproduzierte Sprachaufnahmen (`audio_path`) gehen immer vor der
  automatischen Sprachausgabe. Fehlt die Datei, spricht das Gerät selbst.

---

## 7. Was NICHT ins Content gehört

Content ist für alle Kinder identisch und liegt schreibgeschützt im Git-Repo.
Alles, was sich pro Kind unterscheidet, gehört in den Spielstand in der
Datenbank — nie in eine JSON-Datei:

| Gehört in den Spielstand | Nicht ins Content, weil |
|---|---|
| ob ein Node/eine Etappe offen, aktuell oder erledigt ist | unterscheidet sich pro Kind |
| Sterne pro Etappe | Ergebnis, kein Inhalt |
| welche Karten ein Kind besitzt und wann es sie bekam | Besitz, kein Inhalt |
| gewählte Lernstufe, Vorlese-/Lesemodus, Ton an/aus | Einstellung, kein Inhalt |
| Statistiken und Erfolge | Ergebnis, kein Inhalt |

Der Beispiel-Content des Design-Prototyps führt `status`, `stars` und `earned`
mit — das ist Prototyp-Pragmatik, damit die Screens ohne Datenbank etwas
anzeigen. Ins echte Content-Repo gehören diese Felder nicht.

---

## 8. Vollständiges Episoden-Beispiel

```json
{
  "episode_id": "arc_01_foosha",
  "active_map_id": "east_blue",
  "node_id": "dorf",
  "background": "hafendamm.webp",
  "reward_card_id": "kompassrose",
  "dialogue_sequence": [
    {
      "position": "left",
      "sprite": "shanks_neutral.png",
      "name": "Shanks",
      "text": "Hey Luffy, du bist noch viel zu jung, um allein auf die See hinauszufahren!",
      "text_simple": "Luffy, du bist noch zu klein für das Meer!",
      "audio_path": "audio/voices/shanks_arc_01_001.mp3"
    },
    {
      "position": "right",
      "sprite": "luffy_wuetend.png",
      "name": "Luffy",
      "text": "Bin ich nicht! Ich werde der König der Piraten!",
      "text_simple": "Bin ich nicht! Ich werde König der Piraten!"
    }
  ],
  "minigame_event": {
    "minigame_ref": "minigame_001"
  }
}
```

---

## 9. Checkliste vor dem Commit

- [ ] Jede `id` aus `difficulty_levels` hat eine Variante in jedem referenzierten Minispiel
- [ ] Jede referenzierte Datei (`background`, `sprite`, `audio_path`, `image`, `asset`, `illustration`) liegt tatsächlich im Ordner
- [ ] `episode_id`, `minigame_id`, `cards[].id` sind jeweils eindeutig innerhalb der Welt
- [ ] `active_map_id` existiert in `world_config.json → maps`, und `node_id` existiert auf genau dieser Map
- [ ] Jede `nodes[].episode_ref` und jede `stages[].map_id` trifft ein existierendes Ziel
- [ ] Jede `reward_card_id` existiert in `cards.json`
- [ ] `rarity` ist einer der drei erlaubten Werte — keine erfundenen Stufen
- [ ] `set`-Schreibweise innerhalb der Welt konsistent (sonst zerfällt die Trophäenhalle in Extra-Gruppen)
- [ ] Multiple-Choice-Antworten haben `image`, wenn die Welt den Vorlesemodus unterstützt
- [ ] Kein `status`, `stars` oder `earned` im Content — das ist Spielstand (Abschnitt 7)
- [ ] `game_type` steht in der Tabelle aus Abschnitt 5 — keine erfundenen Spieltypen
- [ ] Alle Koordinaten sind Prozentwerte zwischen 0 und 100, keine Pixel
- [ ] JSON ist valide (kein Trailing Comma, korrekte Anführungszeichen) — im Zweifel durch `jq .` jagen
