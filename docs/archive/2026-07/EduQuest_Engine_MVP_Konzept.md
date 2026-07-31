# EduQuest Engine — MVP-Konzept
## Story-basierte Lernplattform: Game Engine + Nutzerverwaltung

**Scope dieses Dokuments:** Nur das, was für einen lauffähigen MVP nötig ist.
Kein Admin-Dashboard, kein No-Code-Editor, keine Asset-Pipeline. Content wird
am Anfang ausschließlich über das Git-Repository gepflegt — von Hand geschriebene
JSON-Dateien, eingecheckt wie Code.

**Technologische Basis:** Angular (SPA) · PHP REST API · MySQL + JSON-Repository

---

## 1. Was der MVP liefert — und was nicht

### Im Scope

- Game-Player (Main-Hub → Timeline → Map → Location → Dialog/Minispiel)
- Dynamisches Minispiel-System (`ngComponentOutlet`)
- Dialog- und Audiosystem
- Lernstufen-Filterung (datengetrieben, keine Hardcodierung)
- Nutzerverwaltung: Accounts, Spielerprofile, Login
- Spielstände: Speichern, Laden, Fortschritt, Achievements, Statistiken
- Content-Repository als statische JSON-Dateien im Git-Repo

### Explizit nicht im Scope (spätere Phase)

- Admin-Dashboard / No-Code-Editor
- Dynamic Level Creator, Multi-Map-Manager, Dialog-Sequenzer (UI)
- Asset-Uploader, Validierungs-Engine als UI-Tool
- KI-Grafik-Pipeline-Tooling

Neue Welten, Episoden, Dialoge und Minispiele entstehen im MVP als JSON-Dateien,
die per Commit/Pull Request ins Repo wandern. Das ist langsamer als ein Editor —
aber ein Editor für ein Content-Format, das noch niemand benutzt hat, ist
verschwendete Arbeit. Erst die Engine zum Laufen bringen, dann das Werkzeug.

---

## 2. Architektur

```text
┌─────────────────────────────┐
│ Angular Frontend             │
│ - Game Player                │
│ - Story Engine                │
│ - Minispiel Engine (dynamisch) │
└───────────────┬───────────────┘
                │ REST API
                ▼
┌─────────────────────────────┐
│ PHP Backend                   │
│ - Authentication              │
│ - User & Profile Management   │
│ - Savegame Service             │
│ - Content Service (liest JSON)│
└───────┬───────────────────────┘
        │
        ├──────────────┐
        ▼              ▼
┌──────────────┐ ┌────────────────┐
│ MySQL         │ │ JSON Repository │
│ (Nutzerdaten) │ │ (Content, Git)  │
└──────────────┘ └────────────────┘
```

**Prinzip:** Content-Daten (Welten, Episoden, Dialoge, Minispiele) sind statische,
versionierte JSON-Dateien im Repo. Betriebsdaten (Accounts, Profile, Spielstände,
Statistiken) leben in MySQL. Die Trennung bleibt — nur der Editor dafür fehlt
noch. Sith-Code mit drei Wahrheitsquellen baut man sich nicht extra rein.

**Hosting:** Shared-Hosting-kompatibel — PHP 8.2+, MySQL/MariaDB, Apache/Nginx,
HTTPS. Keine Docker/Kubernetes/Cloud-Abhängigkeit im MVP.

---

## 3. Game-Flow

```text
GLOBALER MAIN-HUB
└── Themenwelt (aus installed_themes geladen)
    └── Timeline (Episoden, horizontal scrollbar)
        └── Map-Auswahl (Location-Karte)
            └── Location (Node)
                ├── Dialog-Event
                └── Minispiel-Event
```

### 3.1 Main-Hub
Liest `assets/main_hub.json`, zeigt installierte Themenwelten, verwaltet
aktives Spielerprofil und Lernstufe über einen zentralen `GameStateService`.

### 3.2 Timeline
Episodenstruktur pro Themenwelt, Fortschrittsmarkierung aus dem Savegame.

### 3.3 Location
Interaktive Karte mit klickbaren Nodes (Dialog- oder Minispiel-Trigger).

---

## 4. Lernstufen-Modell

Keine fest kodierten Klassenstufen in der Engine. Jede Welt definiert ihre
eigenen Stufen in `world_config.json`:

```json
"difficulty_levels": [
  { "id": "matrose", "label": "Matrose (Leicht)" },
  { "id": "navigator", "label": "Navigator (Mittel)" },
  { "id": "kapitaen", "label": "Kapitän (Schwer)" }
]
```

Die Engine filtert zur Laufzeit Inhalte nach gewählter Stufe. Story und
Charaktere bleiben für alle gleich, nur die Aufgaben skalieren.

---

## 5. Dialog- und Audiosystem

Dialoge sind kein eigenständiges System mit eigenem Datenformat — sie sind
Teil der Episodendatei (siehe Kapitel 7). Es gibt keinen separaten
Dialog-Ordner und keine Dialog-Referenzierung über IDs.

- Die Bühne kennt genau **zwei feste Plätze**: `left` und `right`. Keine
  freien X/Y-Koordinaten, keine Wahl der Sprechblasen-Ausrichtung — beides
  ergibt sich automatisch aus dem gewählten Platz.
- Pro Dialogzeile wird nur konfiguriert, was sich tatsächlich ändert:
  **Sprite, Name, Text** — plus optional eine Audiodatei.
- Charakter-Sprites sind transparente PNGs, Emotionen werden über den
  Dateinamen der Sprite-Referenz gewählt (kein separates Emotions-System,
  keine zentrale Charakterdatei).

Zwei sprechende Figuren reichen für so gut wie jede Lernsituation. Eine
dritte Figur „betritt" die Szene, indem eine Dialogzeile denselben Platz mit
neuem Sprite/Namen belegt. Gruppenszenen mit drei oder mehr gleichzeitigen
Sprechern sind im MVP bewusst nicht vorgesehen — das wäre Komplexität auf
Vorrat für einen Fall, der noch nicht aufgetreten ist.

---

## 6. Minispiel-System

Minispiele sind eigenständige Angular-Komponenten, dynamisch geladen über
`*ngComponentOutlet`. Episoden referenzieren nur einen `game_type`-String —
die Engine kennt die Zuordnung zur Komponente, der Content-Autor nicht mehr.

„Minispiel" ist kein Codewort für Quizfrage. Es ist jeder spielbare
Baustein, den die Engine als Komponente kennt — Multiple Choice ist der
Anfang eines wachsenden Repertoires, nicht das Konzept dahinter. Memory,
Drag & Drop, Schieberätsel, Escape-Room-Mechaniken: alles spätere
Erweiterungen desselben Musters.

### MVP-Starttypen

| Komponente | Zweck |
|---|---|
| `MultipleChoiceComponent` | Klassische Auswahlaufgaben |
| `TextInputComponent` | Freitext, Zahlen, Rechenaufgaben |
| `ImageSearchComponent` | Such-/Klickaufgaben auf Bildern |

Neue Spieltypen lassen sich später ergänzen, ohne bestehende Episoden
anzufassen — das ist der ganze Witz an `ngComponentOutlet`.

---

## 7. Content-Repository (Git-basiert)

```text
/data/themes
├── miraculous/
│   ├── world_config.json
│   ├── maps/
│   ├── episodes/        ← Dialoge sind Teil dieser Dateien
│   └── minigames/
└── one_piece/
    ├── world_config.json
    ├── maps/
    ├── episodes/
    └── minigames/
```

Kein separater Dialog-Ordner — Dialoge stecken in der Episodendatei, sonst
nirgends. „Puzzle" gibt es als Begriff hier nicht mehr, der Ordner heißt
`minigames/`, weil das Repertoire mehr ist als Rätsel.

Neue Welten entstehen im MVP so:

1. Ordner unter `/data/themes/<theme_id>/` anlegen
2. `world_config.json` schreiben (Lernstufen, **alle** Maps/Arcs der Welt)
3. Episoden-JSONs schreiben (Hintergrund, Dialog, Minispiel-Referenz)
4. Eintrag in `assets/main_hub.json` ergänzen
5. Commit, Push, fertig

Keine Validierungs-UI im MVP — kaputte Referenzen fallen beim Testen auf,
nicht beim Speichern. Schmerzhafter als ein Editor, aber ehrlich genug für
einen MVP mit einer Handvoll Welten.

### Authoring-Toolkit

Damit „von Hand JSON schreiben" nicht heißt „jedes Mal das Schema neu raten",
liegt unter `/data/_authoring/` ein eigenes Toolkit für LLM-gestützte
Content-Erstellung: verbindliche JSON-Schemas, ein Copy-Paste-Prompt für
Claude/ChatGPT/Gemini, Asset-Vorgaben und eine Flux-Prompt-Bibliothek für
Hintergründe und Sprites. Details siehe `/data/_authoring/README.md` —
dieses Toolkit wird bei jeder Schema-Änderung verbindlich mitgepflegt.

### Beispiel: `world_config.json` — mehrere Arcs als Maps

Eine Welt hat von Anfang an mehrere Maps vorgesehen, nicht nachträglich
angeflanscht. Bei One Piece bildet jeder Story-Arc eine eigene Map:

```json
{
  "theme_id": "one_piece_sachkunde",
  "difficulty_levels": [
    { "id": "matrose", "label": "Matrose (Leicht)" }
  ],
  "maps": [
    { "id": "east_blue", "name": "East Blue", "file": "map_east_blue.webp" },
    { "id": "alabasta", "name": "Königreich Alabasta", "file": "map_alabasta.webp" },
    { "id": "skypiea", "name": "Skypiea", "file": "map_skypiea.webp" }
  ]
}
```

### Beispiel: `episode_01.json`

Kein `scene_setup`-Wrapper, keine X/Y-Koordinaten. Pro Dialogzeile nur
Sprite, Name, Text, Position (`left`/`right`):

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

## 8. Nutzerverwaltung & Persistenz (MySQL)

### Tabellen im MVP

**users** — Accounts
```sql
id, username, email, password_hash, role, created_at, last_login
```

**player_profiles** — ein Account kann mehrere Profile haben
```sql
id, user_id, display_name, avatar, selected_theme, selected_level, created_at
```

**savegames** — Fortschritt, referenziert nur Content-IDs
```sql
id, profile_id, theme_id, episode_id, node_id, game_state_json, updated_at
```

**achievements** / **player_achievements** — Erfolge definieren und freischalten
```sql
achievements: id, theme_id, achievement_key, title, description, icon
player_achievements: profile_id, achievement_id, unlocked_at
```

**statistics** — Lernfortschritt
```sql
id, profile_id, theme_id, minigames_completed, correct_answers,
wrong_answers, playtime_minutes, updated_at
```

Die Datenbank speichert ausschließlich Referenzen, nie Content selbst:

```json
{
  "profileId": 17,
  "themeId": "one_piece",
  "currentEpisode": "arc_01",
  "currentNode": "windmuehlen_dorf",
  "completedMinigames": ["minigame_001", "minigame_002"]
}
```

### Rollen im MVP

Nur zwei Rollen, keine Editor-Rolle (die braucht erst eine Editor-UI):

- **Spieler** — spielen, speichern, Erfolge freischalten
- **Lehrer/Elternteil** — Profile anlegen, Fortschritt einsehen

Administrator-Rechte existieren rein technisch (Datenbank), aber ohne
zugehörige Oberfläche im MVP.

---

## 9. REST-API (MVP-Umfang)

### Content API — liest nur JSON, kein Schreibzugriff
```http
GET /api/themes
GET /api/theme/{id}
GET /api/episode/{id}
GET /api/dialogue/{id}
```

### User API
```http
POST /api/login
POST /api/logout
GET  /api/profile
POST /api/profile
```

### Savegame API
```http
POST /api/savegame
GET  /api/savegame/{profileId}
```

Keine Admin-API im MVP — Content-Schreibzugriff existiert nicht, weil es
keine Oberfläche dafür gibt. Wer Content ändern will, committet.

---

## 10. Umsetzungsfahrplan

### Phase 1 — Core Architecture
- Angular-Projekt aufsetzen
- `GameStateService` (aktive Welt, Profil, Lernstufe)
- Main-Hub, dynamische Lernstufen-Filterung
- PHP-Backend-Grundgerüst, MySQL-Schema

### Phase 2 — Timeline & Map
- Router-Struktur für Timeline/Map/Location
- Fortschrittsanzeige aus Savegame
- Content-API (liest JSON-Repository)

### Phase 3 — Dialog- & Audio-Engine
- Speech-Bubbles mit Positionierung
- Audio-Service, synchronisierte Wiedergabe

### Phase 4 — Minispiel-System & Nutzerverwaltung
- `ngComponentOutlet`-Loader
- `MultipleChoiceComponent`, `TextInputComponent`, `ImageSearchComponent`
- Login, Profile, Savegame-API, Achievements, Statistiken

Nach Phase 4 ist der MVP spielbar — mit Content, der von Hand ins Repo
geschrieben wurde. Das Admin-Dashboard ist Phase 5 und kommt erst, wenn klar
ist, welches Content-Format sich in der Praxis bewährt hat.

---

## 11. Spätere Erweiterung (außerhalb MVP-Scope)

- Admin-Dashboard (Dynamic Level Creator, Multi-Map-Manager, Dialog-Sequenzer)
- Asset-Uploader mit automatischer Ablage
- Validierungs-Engine als UI
- KI-gestützte Grafik-Pipeline
- Marketplace für Lernwelten
- Mehrspieler-Funktionen

Diese Punkte bleiben architektonisch vorgesehen (REST-API-Trennung macht das
möglich), werden im MVP aber bewusst nicht gebaut.
