# Phase 6 — Kartenbilder neu erzeugen

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

- [ ] `MAPS.md` vollständig lesen — besonders „Hochskalieren", „Der
      Detail-Prompt — und die Falle darin", „Nähte: mitteln ist immer falsch",
      „Was das kostet".
- [ ] `mcp__comfy__server_info` — läuft die lokale ComfyUI?
- [ ] Zwischenordner `data/_authoring/map-canvases/2026-08-31_neuerzeugung/`
      anlegen (E5).
- [ ] Pro Leinwand: Entwurf mit Krea 2 Turbo nach der Kachelkarten-Vorlage aus
      MAPS.md, `{REGION_NAME}` und `{TERRAIN_DESCRIPTION}` aus dem Content
      (Kachel- und Knotennamen in `world_config.json`).
- [ ] Prompt-Kontrolle: `text_outputs` der Antwort lesen, bevor das Bild
      angesehen wird — der Prompt gehört in Knoten 19, nicht ins
      `CLIPTextEncode`-Widget.
- [ ] Leinwand bauen: Remacri ×4, dann `slice_map.py` mit leerer Kachelliste
      auf Zielgröße.
- [ ] `refine_map_tiles.py` mit `--steps 8 --denoise 0.48` und dem passenden
      Prompt (E1, E3) über alle Kacheln der Leinwand.
- [ ] `match_map_colour.py` gegen die Remacri-Leinwand.
- [ ] `slice_map.py` schneidet die Ausliefer-Kacheln heraus; Reihenfolge bei
      Vertania prüfen (senkrecht!).
- [ ] `format_assets.py` bzw. der dort beschriebene Weg nach `.webp`.
- [ ] Alle sechs Sascha vorlegen, nebeneinander mit den alten. Freigabe
      abwarten.
- [ ] Nach Freigabe: an den Zielort kopieren
      (`data/themes/pokemon/maps/`, `data/hub/`).
- [ ] `data/_authoring/image-prompts/MAPS.md`: falls beim Lauf eine neue Falle
      auftaucht, dort dokumentieren — die Datei ist die Single Source für den
      Ablauf.
- [ ] `STATE.md`: die 🟡-Zeile zur Bildmaschine auf den neuen Stand ziehen.

## Report-Back
