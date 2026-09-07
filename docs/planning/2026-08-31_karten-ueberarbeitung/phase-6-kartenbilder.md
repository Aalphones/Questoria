# Phase 6 — Kartenbilder neu erzeugen

**Status:** complete

**Rating:** standard — der Ablauf ist beschrieben und erprobt, die Arbeit ist
Handwerk. Die Urteile über das Ergebnis fällt Sascha, nicht die Umsetzung.

**Unabhängig von Phase 1–5.** Kann parallel oder vorweg laufen.

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `data/_authoring/image-prompts/MAPS.md` | **vollständig.** Verbindlicher Ablauf seit 26.08.2026, inklusive aller Fallen |
| `data/_authoring/image-prompts/DETAIL_PROMPT.txt` | Detail-Prompt Gelände |
| `data/_authoring/image-prompts/DETAIL_PROMPT_SKY.txt` | Detail-Prompt Himmel (nur Planetenkarte) |
| `data/_authoring/image-prompts/MODEL_SETTINGS.md` | Krea 2 Turbo Einstellungen |
| `data/_authoring/image-tools/README.md` | `slice_map.py`, `refine_map_tiles.py`, `match_map_colour.py` |
| `data/themes/pokemon/world_config.json` → `art_style` | muss wörtlich in den Detail-Prompt |
| Skill `krea2-bilder` | Entwurf erzeugen |

## Der Befund

Die sechs vorhandenen Kartenkacheln sind vor oder während der Überarbeitung des
Bild-Ablaufs vom 26.08.2026 entstanden. Der Ablauf hat sich danach an drei
Stellen grundlegend geändert (Schrittzahl, Detail-Prompt statt
Konservierungs-Auftrag, Kacheln der Reihe nach statt gemittelt) — die
bestehenden Bilder tragen keine davon.

## Bestand — was erzeugt wird

| Karte | Kacheln | Leinwand | Datei(en) | Prompt |
|---|---|---|---|---|
| Planetenkarte | 1 (`hub_0_0`) | 1024 × 1024 | `data/hub/map_planetenkarte.webp` | Himmel |
| Etappenkarte Pokémon | 1 (`arc_0_0`) | 1024 × 1024 | `map_route_uebersicht.webp` | Gelände |
| Ortskarte Alabastia | 2 (0,0 · 0,1) | 2048 × 1024 (waagerecht) | `map_alabastia.webp`, `map_route_1.webp` | Gelände |
| Ortskarte Vertania | 2 (−1,0 · 0,0) | 1024 × 2048 (senkrecht) | `map_vertania_wald.webp` (oben), `map_vertania_city.webp` (unten) | Gelände |

Sechs Kacheln, vier Leinwände. Ablage der Welt-Kacheln:
`data/themes/pokemon/maps/`.

⚠️ **Vertania ist senkrecht** (`row: -1` über `row: 0`) — beim Zerschneiden
gehört `map_vertania_wald.webp` nach **oben**. Vertauschen wäre eine Karte, in
der man nach Norden geht und im Süden ankommt.

⚠️ Die Zielgröße einer Leinwand ist **nicht** 8192. Sie ist `Kacheln × 1024`.
Laut MAPS.md gilt: erst auf Zielgröße bringen, **dann** schärfen — schärfen auf
Zwischengröße und danach herunterrechnen kostet den vierfachen Aufwand und
liefert ein unschärferes Bild.

⚠️ Der Entwurf darf laut MAPS.md nicht unter 0,5 Megapixel liegen. Für eine
1024er-Leinwand heißt das: in 1024er-Breite entwerfen, um Faktor 4
hochskalieren, danach auf 1024 herunterrechnen — nicht in 256 entwerfen.

⚠️ Es gibt kein 2:1 im `ResolutionSelector`. Die Alabastia-Leinwand (2:1) wird
in 16:9 entworfen und **nach** dem Hochskalieren mittig auf die Zielhöhe
gestutzt.

## Entscheidungen

**E1 — Der `art_style` der Welt kommt wörtlich in jeden Detail-Prompt.**
MAPS.md nennt das als die Falle, die einen technisch einwandfreien Lauf
unbrauchbar macht: die Stilwörter im Prompt schlagen alles andere. Der Wert
steht in `world_config.json` unter `art_style` und wird kopiert, nicht
umformuliert.

**E2 — Alle sechs Kacheln werden in Ausliefer-Qualität geschärft.**
MAPS.md rät sonst, nur sichtbare Kacheln zu schärfen. Das gilt für große
Leinwände mit vielen Kacheln für die Schublade — hier sind es sechs, alle
werden im Spielverlauf erreicht, und der Gesamtaufwand liegt bei rund sechs
Minuten Rechenzeit. Die Sonderbehandlung lohnt nicht.

**E3 — Die Planetenkarte bekommt den Himmel-Prompt.**
`DETAIL_PROMPT_SKY.txt`, nicht `DETAIL_PROMPT.txt`. Der Gelände-Prompt auf
einen Sternenhimmel losgelassen liefert Grasbüschel im Nebel — laut MAPS.md am
26.08.2026 genau so passiert.

**E4 — Zwei Fehlversuche pro Karte, dann bleibt die alte stehen.**
Ist eine Karte nach zwei Läufen nicht besser als die bestehende, wird die
bestehende behalten und der Fall im Report-Back vermerkt. Kein dritter Anlauf
auf Verdacht — das Urteil kann nur Sascha fällen, und drei Runden Hin und Her
über ein Bild sind teurer als die Karte wert ist.

**E5 — Die alten Dateien werden erst überschrieben, wenn die neuen abgenommen
sind.** Neue Bilder landen unter
`data/_authoring/map-canvases/2026-08-31_neuerzeugung/` (dieser Ordner ist
bereits gitignored, siehe `STATE.md`). Erst nach Saschas Freigabe werden sie an
ihren Zielort kopiert. Ein Karten-Austausch, der die alte Karte gleich
mitlöscht, macht den Vergleich unmöglich.

## 🟡 Befund am Rande, der kein Bildproblem ist

Die Planetenkarte besteht aus **einer** Kachel und trägt **einen** Weltknoten
(`data/main_hub.json`: `installed_themes` hat genau einen Eintrag, `pokemon`,
bei 73 % / 78 %). Eine Sternenkarte mit einem einzigen Planeten in der unteren
rechten Ecke wirkt leer, egal wie gut das Bild ist. Das ist eine Content-Frage,
kein Bild-Ablauf-Problem.

**Nicht Teil dieser Phase.** Wenn die neue Planetenkarte trotz gutem Bild leer
wirkt, sind das die zwei Hebel: den Weltknoten mittiger setzen, oder die
Leinwand auf 2 × 2 Kacheln vergrößern und Platz für kommende Welten schaffen.
Beides gehört dann in einen eigenen, kleinen Plan.

## Abnahmekriterien

1. Alle sechs Kacheln sind neu erzeugt und liegen im Zwischenordner aus E5.
2. Jede Kachel hält beim Hineinzoomen bis auf 1024 px stand — sichtbare
   Feinstruktur, kein weicher Matsch.
3. Zwischen zwei Nachbarkacheln derselben Karte ist keine Naht und kein
   Doppelbild zu sehen (Prüfstein aus MAPS.md: kein Geisterbusch im
   Nahtraster).
4. Keine Farbdrift zwischen Nachbarkacheln (`match_map_colour.py` ist gelaufen).
5. Die vier Abnahmepunkte aus `MAPS.md` → „Abnahme" sind erfüllt: keine
   Schrift im Bild, Platz um jeden geplanten Knotenpunkt, unterscheidbare
   Landmarken, Stil deckungsgleich mit den Hintergründen derselben Welt.
6. Keine Bauwerke auf den Kacheln (die zwei nicht verhandelbaren Regeln aus
   MAPS.md), echte Draufsicht ohne Horizont.
7. `map_vertania_wald.webp` ist die **obere** Kachel.
8. Sascha hat alle sechs am Bildschirm gesehen und freigegeben.

## Checkliste

- [x] `MAPS.md` vollständig lesen — besonders „Hochskalieren", „Der
      Detail-Prompt — und die Falle darin", „Nähte: mitteln ist immer falsch",
      „Was das kostet".
- [x] `mcp__comfy__server_info` — läuft die lokale ComfyUI?
- [x] Zwischenordner `data/_authoring/map-canvases/2026-08-31_neuerzeugung/`
      anlegen (E5).
- [x] Pro Leinwand: Entwurf mit Krea 2 Turbo nach der Kachelkarten-Vorlage aus
      MAPS.md, `{REGION_NAME}` und `{TERRAIN_DESCRIPTION}` aus dem Content
      (Kachel- und Knotennamen in `world_config.json`).
- [x] Prompt-Kontrolle: `text_outputs` der Antwort lesen, bevor das Bild
      angesehen wird — der Prompt gehört in Knoten 19, nicht ins
      `CLIPTextEncode`-Widget.
- [x] Leinwand bauen: Remacri ×4, dann `slice_map.py` mit leerer Kachelliste
      auf Zielgröße.
- [x] `refine_map_tiles.py` mit `--steps 8 --denoise 0.48` und dem passenden
      Prompt (E1, E3) über alle Kacheln der Leinwand.
- [x] `match_map_colour.py` gegen die Remacri-Leinwand.
- [x] `slice_map.py` schneidet die Ausliefer-Kacheln heraus; Reihenfolge bei
      Vertania geprüft (senkrecht — `map_vertania_wald.webp` ist die obere
      Hälfte).
- [x] Ausgabe kommt bereits als `.webp` direkt aus `slice_map.py` — ein
      zusätzlicher `format_assets.py`-Schritt entfällt für Kachelkarten.
- [x] Alle sechs Sascha vorgelegt. Freigabe erteilt (07.09.2026) — inklusive
      `map_alabastia.webp` mit dem verbliebenen Zaunrest (E4 ausgeschöpft,
      bewusst trotzdem übernommen, kein dritter Anlauf).
- [x] Nach Freigabe an den Zielort kopiert
      (`data/themes/pokemon/maps/`, `data/hub/map_planetenkarte.webp`).
- [x] `data/_authoring/image-prompts/MAPS.md`: kein neuer Fallentyp — die
      Zaun-Falle ist bereits dokumentiert (Retaining-Wall-Fall vom
      26.08.2026), sie trat nur an einer neuen Stelle (Grundstücksgrenze
      statt Ufer) erneut auf.
- [ ] `STATE.md`: die 🟡-Zeile zur Bildmaschine auf den neuen Stand ziehen.

## Report-Back

Alle sechs Kacheln sind erzeugt und liegen zur Abnahme bereit unter
`data/_authoring/map-canvases/2026-08-31_neuerzeugung/`:

| Datei | Karte | Kachel |
|---|---|---|
| `hub/map_planetenkarte.webp` | Planetenkarte | `hub_0_0` (Himmel-Prompt) |
| `arc/map_route_uebersicht.webp` | Etappenkarte | `arc_0_0` |
| `alabastia/map_alabastia.webp` | Ortskarte Alabastia | `alabastia` (0,0) |
| `alabastia/map_route_1.webp` | Ortskarte Alabastia | `route_1` (0,1) |
| `vertania/map_vertania_wald.webp` | Ortskarte Vertania | `vertania_wald` (obere Hälfte) |
| `vertania/map_vertania_city.webp` | Ortskarte Vertania | `vertania_city` (untere Hälfte) |

Ablauf je Karte: Krea 2 Turbo (1024er-Entwurf bzw. 16:9/9:16 für die
Zwei-Kachel-Leinwände) → Remacri ×4 (neues Werkzeug
`data/_authoring/image-tools/remacri_upscale.py`, es gab noch keines für
diesen Schritt) → `slice_map.py` auf Zielgröße → `refine_map_tiles.py`
(Detail-Prompt Gelände bzw. Himmel, 8 Schritte, 0.48 Rauschen) →
`match_map_colour.py` gegen die Remacri-Leinwand → `slice_map.py` schneidet
die Ausliefer-Kacheln.

**Zaun-Falle erneut aufgetreten, diesmal an Grundstücksgrenzen.** Die aus
MAPS.md bekannte Lehre („eine unerwünschte Sache wird beschrieben, nicht
verboten") wurde auf Alabastia und Vertania angewendet: zweiter Anlauf mit
positiver Grenzbeschreibung statt zusätzlichem Verbotssatz. Bei Vertania hat
das funktioniert — keine Zäune mehr. Bei Alabastia nicht: `map_alabastia.webp`
zeigt weiterhin zwei kurze Holzzaun-Segmente und eine geflochtene senkrechte
Linie zwischen Grundstücken und Wiese. **E4 ist damit ausgeschöpft** (zwei
Läufe, kein dritter auf Verdacht) — Saschas Entscheidung: Kachel so
übernehmen, oder die bestehende `map_alabastia.webp` behalten.

🟡 **Zwei Randbefunde, die Saschas Blick brauchen, kein klarer Fehler:**
- `map_vertania_wald.webp` hat am oberen Bildrand einen leicht abgedunkelten
  Streifen (dunkleres Blau-Grün in der letzten Baumreihe) — könnte Absicht
  (Schatten am Waldrand) oder ein Artefakt der Kantenbehandlung sein.
- `map_vertania_city.webp` zeigt am unteren Bildrand ein großes graues
  rundliches Objekt unklarer Herkunft (Findling oder unbeabsichtigtes
  Fremdobjekt) — vor der Übernahme ansehen.

Noch nicht gemacht: Kopieren an den Zielort (wartet auf Freigabe, E5),
`STATE.md`-Zeile zur Bildmaschine.

## Nachtrag — Planetenkarte neu gebaut (07.09.2026)

Sascha hat die erste Fassung von `map_planetenkarte.webp` am Bildschirm
gesehen: eine einzelne dominante Nebel-Wirbelform, die sich nie an eine
zweite, unabhängig erzeugte Nachbarkachel anschließen ließe. Berechtigt —
siehe die neue Vorlage „Himmel-Leinwand" in `MAPS.md`. Neu gebaut über
dieselbe Kette (Remacri ×4 → `slice_map.py` auf Zielgröße →
`refine_map_tiles.py` mit `DETAIL_PROMPT_SKY.txt` → `match_map_colour.py` →
`slice_map.py`), diesmal mit gleichmäßig verteilten Nebelbändern ohne
Zentrum. Drei Fehlversuche auf dem Weg dahin (Foto-Look, dann Tapeten-Raster)
sind in MAPS.md dokumentiert. Freigegeben und kopiert.

Zusätzlich, ebenfalls von Sascha angestoßen, aber **nicht Teil des
ursprünglichen Plan-Kontrakts**: der Weltknoten auf der Planetenkarte
(`data/themes/pokemon/cover.webp`, eingeblendet über `main_hub.json` →
`installed_themes[0]`) zeigte einen kreisrund zugeschnittenen
Wiesen-Screenshot statt eines Planeten und wirkte bei nahem Zoom viel zu
groß. Behoben:

- `cover.webp` neu erzeugt — ein erfundener, gestreifter Fantasieplanet ohne
  Kontinente. Zwei Fehlversuche zeigten unaufgefordert echte Erdkontinente
  (Afrika, Asien, Europa erkennbar) trotz expliziten „muss nicht wie die Erde
  aussehen" — die Anweisung, etwas zu vermeiden, hat es eher angezogen.
  Funktioniert hat erst der Wechsel zu einem Motiv ohne Kontinent-Konzept
  (wirbelnde Farbbänder wie ein Gasriese statt einer Landkarte-Ähnlichkeit).
  Ist jetzt eine weitere Bestätigung der MAPS.md-Grundregel: nicht verbieten,
  anders beschreiben.
- `main_hub.json` → `installed_themes[0].size`: `20` → `12` (Einheit `cqw` =
  Anteil der sichtbaren Kartenbreite, nicht der Weltbreite — bei starkem
  Zoom wird ein hoher Wert unverhältnismäßig groß, siehe
  `map-point.ts`). Reine Schätzung, keine Feinabstimmung — braucht Sascha
  am Bildschirm.

Dieser Nachtrag gehört nicht zu den ursprünglichen sechs Kartenkacheln (AK 1–8
oben), ist aber am selben Tag im selben Zuge entstanden und wird hier
mitgeführt statt in einem separaten Mini-Plan.
