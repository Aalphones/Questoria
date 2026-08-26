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

## Einordnung: drei Kartenebenen (überarbeitet 26.08.2026)

> 🔴 **Diese Sektion ist am 26.08.2026 neu gefasst worden**, nachdem die
> ursprüngliche Fassung nur zwei Ebenen kannte und alle vierzehn Stationen auf
> **eine** Ortskarte legte. Die Kacheln und ihre Stationen sind dieselben
> geblieben — sie sind nur auf **zwei Gebietskarten** aufgeteilt, und die beiden
> Karten darüber wachsen von je einer Kachel auf 8×8. Vollständige Struktur:
> README → „Drei Kartenebenen". Der Content dieser Phase (Episoden, Aufgaben,
> Texte) ist von der Änderung **nicht** betroffen.
>
> **Nachtrag 5b — Umgruppierung, terminiert nach Phase 6** (Sascha, 26.08.2026:
> „Bilder zuerst, Umgruppierung danach"). Die Datei `world_config.json` steht
> noch auf dem alten Stand und muss nachgezogen werden:
>
> | | Ist | Soll |
> |---|---|---|
> | `maps` | **ein** Eintrag (id `route_1`) mit vier Kacheln, 14 Stationen | **zwei** Einträge mit je zwei Kacheln |
> | `arc_overview` | eine Kachel `arc_0_0`, **ein** Stage-Marker | Kachel `{0,0}` einer 8192er Karte, **zwei** Orte |
> | `vertania_wald` | `{row: -1, col: 2}` | `{row: -1, col: 0}` |
> | Planetenkarte | `data/hub/main_hub.json` liegt **nicht** an dem in STATE.md genannten Pfad — vor 5b suchen | Kachel `{0,0}` einer 8192er Karte |
>
> Die 14 Stationen hängen an ihren Kacheln und wandern mit — sie werden nicht
> neu verteilt. Der Kartenname `route_1` sollte bei der Gelegenheit mit, er
> beschreibt seit Phase 5 nicht mehr, was in der Karte liegt.
>
> 🔴 **Bis 5b erledigt ist, ist die zweite Gebietskarte im Spiel nicht
> vorhanden** — die Bilder aus Phase 6 liegen dann auf der Platte, aber nichts
> zeigt sie an. Das ist die bewusst gewählte Reihenfolge, kein Versehen.

- **Planetenkarte** (`MainHub`): 8192×8192, anfangs nur `{0,0}` aufgedeckt,
  darauf der Planet Pokémon. Nicht Teil dieser Phase — Bildarbeit in Phase 6.
- **Weltenkarte** (`arc_overview`, Timeline): 8192×8192 der Kanto-Region,
  anfangs nur `{0,0}` aufgedeckt. Darauf liegen **zwei** Orte statt des
  bisherigen einen Stage-Markers: **Alabastia** und **Vertania City**. Jeder
  führt in seine Gebietskarte.
- **Gebietskarten** (`world.maps[]`): **zwei** Einträge, je zwei Kacheln.

## Neues Kachel-/Stationen-Layout

### Gebietskarte 1 — Alabastia

| Kachel-Id | Position | Enthält (Stationen) |
|---|---|---|
| `alabastia` | `{row: 0, col: 0}` (Start) | Zuhause · Rivalen-Haus · Prof. Eichs Labor |
| `route_1` | `{row: 0, col: 1}` | Die Wiese am Weg · Markt-Verkäufer (gibt ein Heiltrank-Item) · Wildgras-Begegnung |

### Gebietskarte 2 — Vertania

| Kachel-Id | Position | Enthält (Stationen) |
|---|---|---|
| `vertania_city` | `{row: 0, col: 0}` (Start) | Pokémon-Center · Pokémon-Markt · Arena (sichtbar, erzählerisch „Arenaleiter nicht da" — wie im Original) · ein Wohnhaus |
| `vertania_wald` | `{row: -1, col: 0}` | Waldeingang · Käfersammler-Trainer · Gegenstand zum Finden · Waldausgang |

**Bewusster Knick bei `vertania_wald`** (eine Zeile nach oben statt eine Spalte
nach rechts): Der Wald umgibt Vertania City geografisch und ist ihre einzige
Verbindung weiter nordwärts (Quelle: PokéWiki „Vertania-Wald"), keine gerade
Fortsetzung. Nebeneffekt: testet die Bounding-Box-Klemmung aus Phase 2 an einem
Layout mit einem leeren Eckfeld (siehe README → Konfidenz-Ausweis).

**Positionen sind Prozentwerte innerhalb ihrer Kachel** und bleiben deshalb bei
der Umgruppierung unverändert gültig — eine Kachel behält ihre Stationen, egal
in welcher Karte sie hängt. Das ist genau die Eigenschaft, die der Kontrakt aus
Phase 1 zugesagt hat, und sie hat sich hier zum ersten Mal ausgezahlt.

**Freischalt-Reihenfolge** = Array-Reihenfolge **innerhalb jeder Gebietskarte**
(`alabastia` → `route_1`, bzw. `vertania_city` → `vertania_wald`), passend zur
`derivedUnlockedTileIds()`-Logik aus Phase 3.

🟡 **Offen, an Phase 3 zu prüfen:** Wann wird Gebietskarte 2 überhaupt
erreichbar? Bisher lief die Freischaltung innerhalb *einer* Karte durch; jetzt
gibt es zusätzlich den Sprung von Karte zu Karte über die Weltenkarte. Der
naheliegende Weg: Vertania City erscheint auf der Weltenkarte, sobald
`route_1` durchgespielt ist. Belegt ist das nicht — vor der Umsetzung gegen
`derivedUnlockedTileIds()` prüfen.

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

**Umgesetzt am 23.08.2026.**

**Rechenfehler im Plan korrigiert:** 14 Stationen − 3 bestehende − 1 Hinweis-Knoten
ergibt **10**, nicht 11 — der Text „Ergibt 11 neue Episoden" (Zeile 70) war ein
Rechenfehler, die Tabelle selbst listet korrekt 10 neue Episoden-Zeilen. Gebaut
sind zehn.

**Mitten in der Umsetzung erweitert (Sascha):** Die Welt heißt jetzt `pokemon`
statt `pokemon_lesen`, Fach nicht mehr nur Deutsch, sondern „Deutsch,
Mathematik & Sachkunde", abgeglichen gegen `docs/knowledge/lerninhalte-hessen-klasse-1.md`.
Umgesetzt mit dem, was die Engine **heute** kann (nur `multiple_choice`,
`word_match`, `sorting`, `number_line`, `image_search` — die dortige Notiz in
Abschnitt 14.2 stimmt: `count`/`order`/`fill`/`sequence`/`path` fehlen der
Engine, eine „echte" Mathe-Welt mit Rechenaufgaben-Eingabe bräuchte zuerst
Engine-Arbeit). Zwei neue Aufgaben nutzen ausschließlich `multiple_choice`:
`pokemon_wissen_1` (Sachkunde, Lernziel `he_gs1_su_tiere`, Pokémon-Lebensräume/
-Typen) in `ep_vertania_wald_gegenstand`, `pokeball_rechnen` (Mathe, Lernziel
`he_gs1_mat_addition_bis_10`, Zählen/Rechnen 1–4 mit den neuen
Pokéball-Zählbildern) in `ep_vertania_wald_ausgang` — beide vorher reine
Dialog-Stationen ohne Aufgabe. Alle Pokémon-Fakten (Typen von Voltobal,
Elektek, Sichlor, Hornliu, Bisasam, Glumanda) sind gegenrecherchiert
(bisafans.de/PokéWiki), nicht aus dem Gedächtnis behauptet — bei einem
Kinder-Lernprodukt war mir das billige-Beleg-vor-Behauptung-Prinzip hier
wichtiger als Tempo.

**Umbenennung `pokemon_lesen` → `pokemon`:** Ordner umbenannt
(`data/themes/pokemon/`), `theme_id`/`title`/`subject` in `world_config.json`
und `installed_themes[].id`/`title` in `main_hub.json` nachgezogen, `title` der
Etappe „Die Buchstaben-Route" → „Die Alabastia-Route" (war lese-spezifisch),
Erfolgs-Anzeigetexte nachgezogen (Schlüssel `buchstaben_meister`/
`sternenjaeger` bewusst **nicht** umbenannt — Spielstand-Kompatibilität, nur
Anzeigetext). Alle load-bearing Verweise auf den alten Namen in aktiven Docs
nachgezogen (`JSON_SCHEMA_REFERENCE.md`, `ASSET_REQUIREMENTS.md`-Nachbarn,
`voices.json`, `vertonung/SKILL.md`, dieser Plan, der geparkte
Sammelkarten-Plan). **Bewusst nicht angefasst:** archivierte Pläne und datierte
historische Sätze (z. B. „`pokemon_lesen` hatte beim Entfernen 6 Karten") — das
ist ihr korrekter Zeitzeugen-Stand, kein Tippfehler.

**Kontrakt-Lücke gefunden und mit ausgebügelt (nicht im Plan vorgesehen):**
Phase 5 war als „kein Angular-Code" gerated — stimmte nicht ganz. Drei echte
Lücken kamen erst beim Umsetzen zum Vorschein, alle vor dem Content-Bau
gefixt, sonst hätte das Kachel-Sprite-Feature aus AK 7 nirgends gerendert:

1. `MapNode` (content.types.ts) hatte weder `illustration`/`illustration_label`
   noch einen optionalen `episode_ref` — die Ortskarte zeigte bislang einen
   reinen CSS-Kreis, kein PNG. Nachgezogen: `map.ts`/`map.html`/`map.scss`
   rendern jetzt ein echtes Sprite-Bild mit denselben drei Zuständen
   (gesperrt/aktuell/geschafft) statt des Punkts.
2. Ein Hinweis-Knoten ohne `episode_ref` (die Arena) hätte nach der
   bestehenden Fortschritts-Logik **nie** den Zustand „geschafft" erreicht
   (`isCompleted(undefined)` ist immer `false`) — die Kachel `vertania_city`
   wäre nie fertig geworden, `vertania_wald` nie freigeschaltet. Gefixt in
   `progress.rules.ts` und `achievement.rules.ts`: ein Knoten ohne
   `episode_ref` zählt immer als erledigt und fließt nie in Sterne-/
   Fortschritts-Zähler ein.
3. Die Arena selbst zeigt jetzt beim Antippen einen nativen `<dialog>` mit dem
   Hinweistext „Der Arenaleiter ist gerade nicht da." statt einer Episode zu
   starten (AK 5).

Build (`ng build --configuration production`) und Lint auf allen geänderten
Frontend-Dateien sind grün.

**Wortmaterial-Umstellung (Schritt 6):** Alle zehn bestehenden Aufgabendateien
umgestellt. Wo ein Wort **korrekt** (Reim/Anlaut/Ähnlichkeitsverwechslung)
gebunden war und kein sauberes Pokémon-Wort das erfüllt, blieb es stehen — hier
die vollständige Liste, wie AK 7 verlangt:

| Datei | Stehen gebliebene neutrale Wörter | Grund |
|---|---|---|
| `reim_1`, `reim_2` | Haus, Laus, Vase, Nase, Rose, Hose, Dose | Reimfamilien -aus / -ase / -ose ohne passendes Pokémon-Wort. „Maus" bleibt bewusst stehen (Rattfratz-Motiv, so schon im Plan vorgeschlagen) |
| `wortpaare_1`, `wortpaare_2` | dieselben vier Familien | Das sind gezielte Verwechslungs-Sets (Wörter, die sich fast gleich lesen) — Ersatzwörter würden die eigentliche Lese-Übung zerstören |
| `sortieren_anlaute` | Haus, Hase (Anlaut H); Nase/Rose/Vase/Dose vs. Maus/Haus/Laus (Auslaut -se/-us) | Kein belastbares zweites/drittes deutsches Pokémon-H-Wort für Klasse 1 gefunden außer Hornliu + Heiltrank; Auslaut-Aufgabe ist wie bei reim_* rein lautgebunden |
| `anlaut_m_suche` | — (alle drei Ziele jetzt Mondstein/Magnet/Mikroskop) | „Mikroskop" ist kein Pokémon-Wort, aber Labor-Sachkunde-korrekt; die zwei anderen sind echte Pokémon-Items |

**Bilder-Bestellliste für Phase 6/7** (automatisch aus dem Content extrahiert,
Skript lief gegen alle Referenzen):

*Kachel-Hintergründe (1024×1024, Phase 6):* `map_alabastia.webp`,
`map_route_1.webp`, `map_vertania_city.webp`, `map_vertania_wald.webp`
(neue Ortskarten-Kacheln); `map_route_uebersicht.webp` (Etappenkarte,
Dateiname unverändert wiederverwendet).

*Stations-Sprites (512×512 mit Alpha, Phase 6, 14 Stück):*
`sprite_zuhause.png`, `sprite_rivalenhaus.png`, `sprite_labor.png`,
`sprite_wiese.png`, `sprite_markt_verkaeufer.png`, `sprite_wildgras.png`,
`sprite_pokemon_center.png`, `sprite_pokemon_markt.png`, `sprite_arena.png`,
`sprite_wohnhaus.png`, `sprite_waldeingang.png`, `sprite_kaefersammler.png`,
`sprite_gegenstand.png`, `sprite_waldausgang.png`.

*Episoden-Hintergründe (Phase 6, 10 neue, `backgrounds/`):*
`alabastia_zuhause.webp`, `alabastia_rivale.webp`, `route_1_markt.webp`,
`route_1_wildgras.webp`, `vertania_center.webp`, `vertania_markt.webp`,
`vertania_wohnhaus.webp`, `vertania_wald_kaefersammler.webp`,
`vertania_wald_gegenstand.webp`, `vertania_wald_ausgang.webp`.

*Neue Figuren (Phase 7, Sprites `<figur>/<figur>_<emotion>.png`):* `mama`,
`blau` (Rivale), `verkaeufer` (tritt an zwei Stationen auf, eine Figur),
`schwester`, `nachbar`, `kaefersammler` — je nach Dialog reichen `neutral`/
`happy` (Phase-7-Regel: nur die tatsächlich verwendeten Ausdrücke bestellen,
kein Emotionsset auf Vorrat).

*Neue Bildantworten (512×512 mit Alpha, `answers/`, 18 Stück — Skript-Output,
siehe unten):* `antwort_pokeball_1..4.png` (Zählbilder, ersetzen
`antwort_ziffer_*`), `antwort_pokeball_item.png`, `antwort_angel.png`,
`antwort_beere.png`, `antwort_blatt.png`, `antwort_fahrrad.png`,
`antwort_heiltrank.png`, `antwort_hoehle.png`, `antwort_hornliu.png`,
`antwort_kescher.png`, `antwort_machollo.png`, `antwort_mauzi.png`,
`antwort_menki.png`, `antwort_mondstein.png`, `antwort_rattfratz.png`,
`antwort_trank.png`.

*Nicht mehr referenziert, zum Löschen in Phase 7 (Teil D bereits so
vorgesehen):* `antwort_auto.png`, `antwort_ball.png`, `antwort_blume.png`,
`antwort_boot.png`, `antwort_igel.png`, `antwort_katze.png`,
`antwort_milch.png`, `antwort_ofen.png`, `antwort_ziffer_1..4.png`.

**Nachbestellung Vertonung (nicht Teil dieser Phase, für später gemerkt):**
Sechs neue sprechende Figuren brauchen eine Stimme in `voices.json`
(`mama`, `blau`, `verkaeufer`, `schwester`, `nachbar`, `kaefersammler`) —
sonst fallen sie beim nächsten Vertonungslauf auf `_default` (Julian, s.
bestehender Hinweis in `STATE.md`).

**Nicht angefasst — bewusst außerhalb dieser Phase:** Der bestehende
🟡-Hinweis „`data/hub/` ist nicht in `.gitignore`" und der Server-Vorfall vom
19.08. sind unverändert offen, betreffen dieses Phase nicht.

## Prüf-Checkliste für den Smoke-Test (Plan-Ende, nicht diese Phase allein)

Dieser Content ist **erst nach Phase 7 abnahmefähig** — bis dahin fehlen alle
14 Stations-Sprites, alle 4 Kachel-Hintergründe, alle 10 Episoden-Hintergründe
und alle 18 neuen Bildantworten als echte Dateien. Der `ng build` prüft nur,
dass der Code kompiliert — nicht, dass die Bilder existieren.
