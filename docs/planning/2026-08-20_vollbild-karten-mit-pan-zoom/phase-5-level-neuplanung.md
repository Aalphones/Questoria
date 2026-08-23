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

## Aufgaben aufs Pokémon-Universum umstellen

Dazugekommen am 23.08.2026 (Sascha): *„Die Aufgaben in der Pokémonwelt sind mir
zu generisch (Ball, Boot, etc.)."* Betrifft **nicht nur** die neuen Episoden,
sondern die zehn bestehenden Aufgabendateien unter
`data/themes/pokemon_lesen/events/` gleich mit.

**Was heute generisch ist** — Bestandsaufnahme, damit beim Umsetzen nichts
übersehen wird:

| Datei | Typ | Wortmaterial heute |
|---|---|---|
| `reim_1.json` | `multiple_choice` | Haus/Maus, Ball, Igel, Ofen, Katze, Laus, Blume, Auto, Nase, Vase, Boot |
| `reim_2.json` | `multiple_choice` | Hose/Rose, Dose, Auto, Katze, Ball, Igel, Ofen, Nase, Vase, Boot |
| `wortpaare_1.json` | `word_match` | Ball, Maus, Igel, Hase, Katze, Mond, Auto, Boot, Ofen |
| `wortpaare_2.json` | `word_match` | Katze, Auto, Mond, Ball, Baum, Boot, Hase, Igel, Vase |
| `sortieren_anlaute.json` | `sorting` | Ball, Baum, Blume, Boot / Maus, Mais, Milch, Mond |
| `silben_klatschen.json` | `multiple_choice` | teils schon thematisch (Bisasam, Pikachu, Rattfratz), teils nicht (Ball, Gras, Wiese) |
| `anlaut_b_suche.json` | `image_search` | Ball, Blatt, Beere — im Suchbild, geht schon in Ordnung |
| `anlaut_m_suche.json` | `image_search` | Mütze, Malstift, Muschel — passt nicht zum Labor |
| `wald_suche.json` | `image_search` | Sonne, Stein, Specht — passt zum Wald, bleibt |
| `zahlenstrahl_wald.json` | `number_line` | reine Zahlen, thematisch neutral, bleibt |

**Die Regel, nach der ersetzt wird:** Das Wortmaterial kommt aus dem
Pokémon-Universum — Pokémon-Namen, Gegenstände (Pokéball, Trank, Beere, Angel,
Kescher, Fahrrad), Orte (Arena, Center, Wald, Höhle, Route) und Figuren
(Trainer, Käfersammler, Professor). Für `image_search` gilt dasselbe für die
gesuchten Objekte **im Suchbild**, nicht nur für den Fragetext.

🔴 **Grenze, die nicht verhandelbar ist:** `reim_*` und `sortieren_anlaute` sind
über den **Klang** gebunden, nicht über das Thema. Ein Reimpaar braucht einen
echten Reim, ein Anlaut-Korb braucht Wörter mit genau diesem Anlaut. Wo sich
beides nicht vereinbaren lässt, gewinnt **das Lernziel**, nicht das Thema — dann
steht dort ein neutrales Wort. Ein Reimpaar, das sich nicht reimt, ist keine
Themenanpassung, sondern eine kaputte Aufgabe. Beim Umsetzen die Fälle, in denen
das Thema nachgeben musste, im Report-Back aufzählen.

Brauchbare Ansatzpunkte, an denen Klang und Thema zusammengehen (nicht
erschöpfend, beim Umsetzen erweitern): Anlaut B → Bisasam, Ball (Pokéball),
Beere, Baum, Blatt · Anlaut M → Mauzi, Menki, Machollo, Mond · Reim → Ball/Fall,
Stein/Bein, Beere/Schere, Maus/Haus (Rattfratz ist eine Maus, das Motiv trägt).

**Silben zählen: Pokébälle statt Sterne.** `silben_klatschen.json` verweist
heute auf `antwort_ziffer_1..4.png` — drei weiße Sterne auf weißem Grund, auf
dem hellen Antwortfeld kaum zu sehen. Die Verweise wechseln auf
`antwort_pokeball_1..4.png`; die Bilder erzeugt Phase 7. Die Beschriftungen
`"1".."4"` bleiben — das Bild zeigt die Menge, der Text nennt die Zahl.

**Bilddateien:** Jedes neue Wort braucht ein `antwort_<slug>.png`. Diese Phase
legt die **Wortliste** fest und trägt die Dateinamen ein; erzeugt werden die
Bilder in Phase 7. Bis dahin fehlen die Dateien — die Welt ist in diesem
Zwischenzustand nicht abnahmefähig, und das ist in Ordnung, solange Phase 7
direkt folgt.

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
6. Die zehn bestehenden Aufgabendateien unter `events/` auf das
   Pokémon-Wortmaterial umstellen (Tabelle und Regel oben), die Verweise in
   `silben_klatschen.json` von `antwort_ziffer_*` auf `antwort_pokeball_*`
   wechseln. Die Aufgaben der elf neuen Episoden folgen derselben Regel von
   Anfang an.
7. Die vollständige Liste der gebrauchten `antwort_<slug>.png` zusammenstellen
   und ins Report-Back schreiben — sie ist die Bestellliste für Phase 7.
8. `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 1+2 aktualisieren:
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
7. Keine Aufgabe nennt mehr ein Wort ohne Bezug zum Pokémon-Universum — außer
   dort, wo Reim oder Anlaut es erzwingen; diese Fälle sind im Report-Back
   einzeln aufgezählt und begründet.
8. Jedes Reimpaar reimt sich tatsächlich, jeder Anlaut-Korb enthält nur Wörter
   mit diesem Anlaut. Laut vorlesen, nicht nur ansehen.
9. `silben_klatschen.json` verweist auf `antwort_pokeball_1..4.png`, nirgends
   steht mehr `antwort_ziffer_`.
10. Die Bestellliste der gebrauchten Bildantworten steht im Report-Back.

## Report-Back

*(nach Umsetzung ausfüllen)*
