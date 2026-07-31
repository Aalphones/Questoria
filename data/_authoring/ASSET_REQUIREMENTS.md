# Asset Requirements

Jede Welt braucht drei Asset-Typen: Hintergründe, Charakter-Sprites, Audio.
Ohne diese Vorgaben generiert dir jedes Bildmodell eine andere Auflösung pro
Bild — und die Engine positioniert Sprites auf zwei festen Plätzen, also
reißt jede Abweichung im Seitenverhältnis die Komposition auseinander.

---

## Ordnerstruktur pro Welt

```text
/data/themes/<theme_id>/
├── world_config.json
├── cover.webp
├── maps/
│   └── map_<map_id>.webp          ← pro Story-Arc eine Datei
├── backgrounds/
│   └── <scene_name>.webp
├── sprites/
│   └── <character_id>/
│       └── <character_id>_<emotion>.png
├── audio/
│   └── voices/
│       └── <character_id>_<episode_id>_<line_nr>.mp3
├── episodes/                       ← Dialoge sind Teil dieser Dateien
└── minigames/
```

Kein eigener `dialogues/`-Ordner — Dialoge stecken in der Episodendatei,
sonst nirgends. Kein eigener `characters/`-Stammdatenordner — Sprite,
Anzeigename und Text werden direkt pro Dialogzeile angegeben, eine
zentrale Charakterdatei wäre eine zweite Wahrheitsquelle ohne Mehrwert.

---

## 1. Hintergründe

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.webp` |
| Seitenverhältnis | 16:9 |
| Auflösung | 1920×1080 (Minimum 1280×720) |
| Inhalt | Szenerie OHNE Charaktere — die kommen als separate Sprites obendrauf |
| Stil | konsistent pro Welt, ein Look durchziehen |

Bosskampf-/Dramatik-Varianten desselben Hintergrunds (z. B. „verdorben")
werden als eigene Datei gespeichert, gleicher Präfix:
`hafendamm.webp` → `hafendamm_corrupted.webp`.

---

## 2. Charakter-Sprites

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.png` mit Alpha-Kanal (echte Transparenz) |
| Seitenverhältnis | Hochformat, ca. 2:3 (z. B. 1024×1536) |
| Anker-Punkt | Charakter mittig im Frame, Füße nahe Bildunterkante |
| Bühnenplätze | genau zwei feste Positionen: `left`, `right` — keine freie Koordinatenwahl |
| Emotionsset (MVP) | `neutral`, `happy`, `worried`, `angry` |

Die zwei festen Bühnenplätze sind eine Engine-Vorgabe, keine Asset-Vorgabe —
das Sprite selbst wird unabhängig von links/rechts erstellt, die Engine
spiegelt/platziert es passend zum gewählten Platz.

Ein Charakter ohne alle vier Emotionsdateien bleibt bei der falschen
Dialogzeile stumm oder bricht — nicht optional.

---

## 3. Audio

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.mp3` (bevorzugt) oder `.wav` |
| Bitrate | mind. 128 kbps mp3, 44.1 kHz |
| Dateiname | `<character_id>_<episode_id>_<laufende_nummer>.mp3` |
| Pflicht? | optional pro Dialogzeile — fehlt `audio_path`, läuft die Zeile stumm |

---

## 4. Map-Grafiken

| Eigenschaft | Vorgabe |
|---|---|
| Format | `.webp` |
| Seitenverhältnis | 16:9, gleiche Auflösung wie Hintergründe |
| Inhalt | begehbare Übersichtskarte mit erkennbaren Landmarken für Node-Platzierung |

**Eine Welt hat von Anfang an mehrere Maps** — eine pro Story-Arc, nicht
nachträglich angeflanscht. Bei One Piece zum Beispiel: `map_east_blue.webp`,
`map_alabasta.webp`, `map_skypiea.webp`, jede mit eigenen Episoden-Nodes.

🟡 Exakte Koordinaten-Zuordnung (Map → Node → x/y) ist noch nicht final
spezifiziert — wird mit Phase 2 der Engine nachgezogen, diese Datei dann
entsprechend aktualisieren.

---

## Naming-Konventionen — Zusammenfassung

- Alles `snake_case`, keine Leerzeichen, keine Umlaute, keine Großbuchstaben
- IDs (`theme_id`, `episode_id`, `character_id`, `minigame_id`) sind
  dateinamenkompatibel und werden 1:1 als Dateiname oder Ordnername verwendet
- Keine Versionsnummern im Dateinamen — Versionierung übernimmt Git
