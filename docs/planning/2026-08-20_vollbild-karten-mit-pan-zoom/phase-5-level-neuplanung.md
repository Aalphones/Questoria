# Phase 5 — Level-Neuplanung Alabastia

**Rating:** standard (Content-Autorenarbeit, kein Angular-Code — aber der
größte Arbeitsblock im ganzen Plan, siehe Aufwands-Hinweis unten)

## Kontext (lesen, bevor du anfängst)

- `data/themes/pokemon_lesen/world_config.json` (Drive-Junction, siehe
  `STATE.md` → „Merkposten zur Maschine") — **zuerst lesen**, bevor
  irgendetwas umbenannt wird. Diese Phasen-Datei nennt die **neuen** IDs/
  Namen, kennt aber die **aktuellen** nicht mit Sicherheit (die Datei liegt
  außerhalb des Zugriffs beim Planen) — bestehende IDs für Labor/Wiese/Wald
  beim Umsetzen aus der echten Datei übernehmen, nicht die hier
  vorgeschlagenen neu erfinden, wo ein bestehendes Gegenstück existiert.
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 1+2 — wird in dieser
  Phase aktualisiert (neues `tiles[]`-Schema aus Phase 1).
- Recherche-Grundlage (Chat vom 20.08.2026, Quellen dort verlinkt):
  PokéWiki-Ortsnamen (Alabastia, Vertania City, Vertania-Wald, Marmoria City),
  StrategyWiki-Walkthroughs zu Pallet Town/Route 1/Viridian City/Route 2/
  Viridian Forest/Pewter City.
- `frontend/src/app/models/content.types.ts` — Stand nach Phase 1
  (`MapTileDef`, `tile_id`-Felder).

## Einordnung: zwei Kartenebenen, nur eine wird hier neu bestückt

`arc_overview` (Timeline) bleibt vorerst bei **einer** Kachel mit dem
einzigen bestehenden Stage-Marker „Route 1 · Alabastia" — weitere Arcs
(Marmoria City etc.) sind ein späterer Ausbau, nicht Teil dieser Phase.
**Diese Phase bestückt die Ortskarte** (`world.maps[]`-Eintrag für „Route 1 ·
Alabastia") mit vier Kacheln und vierzehn Stationen statt der heutigen drei.

## Neues Kachel-/Stationen-Layout

| Kachel-Id | Position | Enthält (Stationen) |
|---|---|---|
| `alabastia` | `{row: 0, col: 0}` (Start) | Zuhause · Rivalen-Haus · Prof. Eichs Labor |
| `route_1` | `{row: 0, col: 1}` | Die Wiese am Weg · Markt-Verkäufer (gibt ein Heiltrank-Item) · Wildgras-Begegnung |
| `vertania_city` | `{row: 0, col: 2}` | Pokémon-Center · Pokémon-Markt · Arena (sichtbar, erzählerisch „Arenaleiter nicht da" — wie im Original) · ein Wohnhaus |
| `vertania_wald` | `{row: -1, col: 2}` | Waldeingang · Käfersammler-Trainer · Gegenstand zum Finden · Waldausgang |

**Bewusster Knick bei `vertania_wald`** (Zeile statt Spalte 3): Der Wald
umgibt Vertania City geografisch und ist ihre einzige Verbindung weiter
nordwärts (Quelle: PokéWiki „Vertania-Wald"), keine gerade Fortsetzung von
Route 1. Nebeneffekt: testet die Bounding-Box-Klemmung aus Phase 2 an einem
echten L-förmigen Layout (siehe README → Konfidenz-Ausweis).

**Freischalt-Reihenfolge** = Array-Reihenfolge in der Tabelle oben
(`alabastia` → `route_1` → `vertania_city` → `vertania_wald`), passend zur
`derivedUnlockedTileIds()`-Logik aus Phase 3.

## Stationen im Detail

| Station | Kachel | Neu/Bestehend | Node-Typ |
|---|---|---|---|
| Zuhause | `alabastia` | neu | Episode |
| Rivalen-Haus | `alabastia` | neu | Episode |
| Prof. Eichs Labor | `alabastia` | **bestehend** (ID aus echter Datei übernehmen) | Episode |
| Die Wiese am Weg | `route_1` | **bestehend** | Episode |
| Markt-Verkäufer (Heiltrank) | `route_1` | neu | Episode |
| Wildgras-Begegnung | `route_1` | neu | Episode |
| Pokémon-Center | `vertania_city` | neu | Episode |
| Pokémon-Markt | `vertania_city` | neu | Episode |
| Arena (verschlossen) | `vertania_city` | neu | Episode oder reiner Hinweis-Knoten ohne Episode — Entscheidung: **reiner Hinweis-Knoten**, kein `episode_ref`, zeigt nur „Der Arenaleiter ist gerade nicht da" beim Antippen (kein Lerninhalt nötig, erzählerischer Haken für später) |
| Wohnhaus | `vertania_city` | neu | Episode |
| Waldeingang | `vertania_wald` | **bestehend** (bisheriges „Vertania-Wald") | Episode |
| Käfersammler-Trainer | `vertania_wald` | neu | Episode |
| Gegenstand zum Finden | `vertania_wald` | neu | Episode |
| Waldausgang | `vertania_wald` | neu | Episode |

**Ergibt 11 neue Episoden** (14 Stationen minus 3 bestehende minus 1
Hinweis-Knoten ohne Episode) — der Arena-Hinweis-Knoten ist bewusst die
einzige Ausnahme, damit nicht jede einzelne Station zwingend eine volle
Leseepisode braucht (Auflockerung, kein Etikettenschwindel).

## 🟡 Aufwands-Hinweis (keine Kleinigkeit)

Elf neue Episoden sind **echte Content-Arbeit** — jede braucht Dialog/
Aufgaben-Events nach dem bestehenden Schema (Schema-Referenz Abschnitt 5),
keine Schablonenware. Diese Phase legt **Struktur und Platzierung** fest
(Tabellen oben), **nicht** die fertigen Episodeninhalte — die entstehen beim
Umsetzen, episodenweise, nach demselben Muster wie die drei bestehenden.
Realistisch mehrere Sitzungen, nicht eine.

## Umsetzung

1. Echte `world_config.json` lesen, bestehende IDs für Labor/Wiese/Wald
   notieren.
2. `world_config.json`: `maps[]`-Eintrag der „Route 1 · Alabastia"-Karte auf
   das neue Schema umstellen — `file: string` → `tiles: MapTileDef[]`
   (vier Einträge aus der Tabelle oben, `background`-Dateiname je Kachel
   nach der Namenskonvention aus Phase 6), `nodes[]` auf vierzehn Einträge
   erweitern, jeder mit `tile_id`, `x`/`y` (kachelrelativ, Platzierung frei
   nach Landmarken-Logik — nicht mehrere Stationen exakt übereinander),
   `episode_ref` (für die 13 Episoden-Stationen) bzw. ohne `episode_ref` für
   den Arena-Hinweis-Knoten.
3. `arc_overview.tiles`: eine Kachel für die bestehende Stage „Route 1 ·
   Alabastia" (Dateiname/Position frei, kleine Übersichtskachel).
4. Für jede der 11 neuen Stationen: neue Episode unter `episodes/<id>.json`
   anlegen (Struktur wie die drei bestehenden Episoden — Dialog-Events,
   ggf. eine Aufgabe, siehe Schema-Referenz Abschnitt 5).
5. `illustration`/`illustration_label` je Station setzen (Dateiname, siehe
   Phase 6) — jede der 14 Stationen bekommt ein eigenes PNG-Sprite statt
   eines reinen Punkts (das war der ursprüngliche Anstoß: „echte PNGs für
   die Elemente").
6. `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 1+2 aktualisieren:
   `background: string` → `tiles: MapTileDef[]` in allen drei betroffenen
   Strukturen (`main_hub.json`, `arc_overview`, `MapEntry`), neues
   `tile_id`-Feld bei `ArcStage`/`MapNode`/`InstalledTheme` dokumentieren,
   `x`/`y`-Erklärung auf „Prozent der Kachel" ändern.

## Akzeptanzkriterien

1. `world_config.json` valide gegen das neue Schema (keine Restfelder aus
   dem alten `background`/`file`-Muster).
2. Alle 14 Stationen sind über die App erreichbar, jede mit eigenem
   PNG-Sprite (Platzhalter reicht für diese Phase — echte Kunst ist
   Phase 6).
3. Die drei bestehenden Episoden (Labor/Wiese/Wald) funktionieren
   unverändert unter ihren (ggf. umbenannten) Knoten weiter.
4. Elf neue Episoden sind spielbar, folgen demselben Schema wie die
   bestehenden.
5. Der Arena-Knoten zeigt seinen Hinweistext, ohne eine Episode zu starten.
6. `JSON_SCHEMA_REFERENCE.md` ist aktualisiert und beschreibt exakt das
   Schema, das der Content tatsächlich nutzt.

## Report-Back

*(nach Umsetzung ausfüllen)*
