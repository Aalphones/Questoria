# Karten

Ziel: 1920×1080 `.webp`, 16:9, gleiche Auflösung wie Hintergründe. Ablage:
`data/themes/<theme_id>/maps/map_<map_id>.webp`.

Empfohlenes Modell: **Krea 2 Turbo**. Einstellungen:
[MODEL_SETTINGS.md](MODEL_SETTINGS.md).

**Beschriftung macht immer die Engine, nie das Bild.** Die Knotenpunkte
(Etappen, Orte) werden als UI-Elemente über die Karte gelegt, mitsamt Namen und
Zustand. Eine gemalte Beschriftung steht später doppelt und schief im Bild.

---

## Drei Kartensorten

| Sorte | Was sie zeigt | Wo sie auftaucht |
|---|---|---|
| **Planetenkarte** (`hub_map`) | Die Themenwelten als Orte auf einer Übersicht | Weltenauswahl nach dem Login |
| **Weltenkarte** (`arc_map`) | Die Region einer Welt, darauf ihre Gebiete | Gebietsauswahl innerhalb einer Welt |
| **Gebietskarte** (`location_map`) | Die Schauplätze eines Gebiets | Episodenauswahl innerhalb eines Gebiets |

Alle drei sind **Kachelkarten**: 1024×1024-Felder in einem offenen
`{row, col}`-Raster, die einzeln freigeschaltet werden. Erzeugt wird nie eine
Kachel für sich, sondern immer die zusammenhängende Fläche als **eine** Leinwand,
die anschließend zerschnitten wird — sonst passen die Ränder nicht zusammen.

Dazu kommt pro Etappe eine **kleine Etappen-Illustration** (`ep_01.webp` …),
die auf der Etappenkarte als organisch beschnittene Inselform erscheint —
Vorlage weiter unten.

**Knotenpunkte werden in Prozent positioniert**, nicht in Pixeln. Beim Zeichnen
heißt das: Landmarken deutlich sichtbar und **nicht zu nah am Bildrand**, sonst
liegt der Punkt später halb außerhalb.

---

## Vorlage — Kachelkarten, echte Draufsicht (Standard seit 26.08.2026)

**Das ist die Vorlage für alle drei Kartensorten.** Sie ist an drei Läufen
erprobt; die beiden Vorlagen weiter unten sind damit überholt (siehe dortigen
Hinweis).

**Zwei Regeln, die nicht verhandelbar sind:**

1. **Keine Bauwerke auf der Karte.** Häuser, Ortschaften, Brücken, Zäune, Türme
   — nichts davon wird eingemalt. Orte sind eigene freigestellte Sprites, die
   obendrauf liegen. Grund: dieselbe Kachel muss zeigen können, dass ein Ort
   verschlossen ist, und später, dass er offen ist. Ein eingebackenes Gebäude
   kann das nicht.
2. **Echte Draufsicht, keine Perspektive.** Kacheln müssen denselben Maßstab
   haben, sonst passt Norden nicht zu Süden — egal wie sauber die Naht ist. Der
   Hebel dafür sind die **Bäume**: solange das Modell sie mit Stamm von der
   Seite malt, entsteht automatisch ein Horizont. Zweiter Hebel sind
   **Felswände** — eine Klippe in Seitenansicht verrät eine Blickrichtung und
   liest sich am Bildrand als „hier endet die Welt".

```
A top-down orthographic map of {REGION_NAME}, seen from directly overhead at a
perfect 90 degree angle, like a video game overworld map or a tabletop battle
map. Flat map projection: no horizon, no sky, no vanishing point, no
perspective, no tilt, no foreground objects. Every part of the image is drawn at
exactly the same scale from edge to edge.

Hand-painted anime storybook style: clean confident linework, flat cel-shaded
colour, warm saturated greens and sandy tans, soft even shading.

Terrain only, all of it seen from straight above: {TERRAIN_DESCRIPTION —
meadows as flat fields of colour, forest as clusters of round tree canopies
viewed from directly above with no trunks and no sides visible, winding dirt
paths as flat ribbons, water as flat blue shapes, low rocks as small shapes seen
from above, higher ground shown only as a change of colour with a soft outlined
edge}.

No vertical surfaces are visible anywhere: no cliff faces, no rock walls, no
mountain flanks, no slopes receding into the distance. Elevation is expressed
purely as outlined edges and colour steps seen from above, never as a wall.

The terrain continues right up to all four edges of the image and is cut off
flatly by the frame. There is no drop-off, no void and no edge of the world at
the image border.

No buildings, no houses, no towns, no villages, no bridges, no fences, no walls,
no people and no animals anywhere. Uninhabited landscape only.

Even flat daylight, no long cast shadows, uniform lighting and uniform detail
density across the whole square frame. No border, no frame, no legend, no
compass rose, no text and no labels.
```

### Die Vorlage nicht um eigene Verbote erweitern

Krea 2 fährt ohne Führung (Stärke 1.0) und hat deshalb **keinen** Negativ-Zweig —
jedes Wort im Prompt ist eine Bestellung, auch das hinter einem „no". Die
Verbotszeilen in der Vorlage oben sind erprobt und bleiben so stehen; **eigene
zusätzliche Verbotssätze holen dagegen genau das ins Bild, was sie fernhalten
sollen.**

Belegt am 26.08.2026 an der Gebietskarte Alabastia: Lauf 1 hatte eine
hölzerne Uferbefestigung am Strand. Der Nachbesserungsversuch — ein Satz
„no retaining walls, no wooden planks, no boardwalks, no piers, no seawalls" —
hat die Bretterwand in Lauf 3 quer durchs ganze Bild und um den Teich herum
gezogen. Erst als der Satz durch eine **positive** Beschreibung ersetzt wurde
(„every single edge soft, organic and grown rather than made"; „the grass thins
gradually into a pale strip of loose sand"), war das Holz weg.

Merksatz: **eine unerwünschte Sache wird beschrieben, nicht verboten** — was an
ihrer Stelle stehen soll.

### Wie klein darf der Entwurf sein

Die Viertel-Regel unten stößt bei kleinen Karten an eine Untergrenze. Eine
Gebietskarte aus 2×1 Kacheln ergäbe nach ihr einen Entwurf von 512×288, also
0,14 Megapixel — dort erfindet das Modell Strukturen, um die Fläche zu füllen,
und setzt harte Farbkanten mitten ins Bild. **Unter etwa 0,5 Megapixeln
(1024×576) nicht entwerfen.** Ist die Zielleinwand kleiner als das Vierfache
davon, lieber in 1024er-Breite entwerfen, um Faktor 4 hochskalieren und das
Ergebnis am Ende auf die Zielgröße herunterrechnen — herunterrechnen nach dem
Nachschärfen kostet keine Schärfe, ein zu kleiner Entwurf kostet die
Komposition.

### Hochskalieren — der Detailgrad hängt an drei Reglern

Eine Kachelkarte muss beim Hineinzoomen bis auf Kachel-Nativgröße standhalten.
Rein hochskalieren reicht dafür nicht: das vergrößert nur, was da ist, und
liefert Matsch. Das Detail muss **erzeugt** werden, und zwar von FLUX.2, das
jede Kachel neu zeichnet.

**Der gespeicherte Ablauf `Upscale Map` tut das viel zu zaghaft**, aus drei
Gründen — alle drei am 26.08.2026 durchgemessen:

| Regler | Gespeicherter Stand | Was daran falsch ist |
|---|---|---|
| **Schritte** | `2` | Zwei Schritte reichen zum Nachziehen von Kanten und für sonst nichts. **Der mit Abstand größte Hebel.** |
| **Kachel-Prompt** | ein Konservierungs-Auftrag | Steht wörtlich drin: *„Do not introduce … artificial micro-detail … Do not add detail merely to make an area appear busy."* Wir verbieten dem Modell genau das, wofür wir es aufrufen. |
| **Rauschen** (`denoise`) | `0.5` | An sich brauchbar — aber der Regler liegt **im Knotenpaket** und erreicht über comfy-cli den Auftrag gar nicht. Ein Lauf mit geändertem Wert liefert wortwörtlich dieselbe Datei zurück. |

**Deshalb wird der Auftrag nicht über comfy-cli geschickt, sondern selbst
gebaut.** ComfyUI gibt unter `GET /history/<prompt_id>` den fertig
umgewandelten Auftrag zurück; darin lassen sich alle Werte direkt setzen und
das Ganze per `POST /prompt` wieder einreichen. Damit ist die tote
Paket-Verdrahtung umgangen.

#### Die Kette

1. **Leinwand bauen: Remacri ×4**, ohne Kacheln. Vier Knoten, direkt an die
   Schnittstelle: `LoadImage` → `UpscaleModelLoader`
   (`4x_foolhardy_Remacri.pth`) → `ImageUpscaleWithModel` → `SaveImage`.
   Dauert Sekunden, ist nahtlos und farbtreu, aber weich. Diese Datei wird
   **zweimal** gebraucht: als Gerüst und später als Farbvorlage.
2. **Detail erzeugen.** Zwei Wege, je nach Fall:
   - **Ganze Leinwand:** den Auftrag von `Upscale Map` aus der Historie holen,
     `Flux2Scheduler.steps` auf **8**, `ImageAddNoise.strength` auf **0.48**
     und den positiven Text auf einen **Detail-Prompt** setzen (siehe unten),
     dann einreichen.
   - **Nur ein Ausschnitt, oder wenn die Überblendung garantiert sein muss:**
     `refine_map_tiles.py`. Es schneidet überlappende Kacheln (halbe
     Kachelbreite Versatz), schickt jede einzeln durch FLUX.2 und setzt sie mit
     Kosinus-Fenster zusammen — eine harte Kante kann dabei nicht entstehen.
     ```bat
     data\_authoring\image-tools\.venv\Scripts\python.exe ^
       data\_authoring\image-tools\refine_map_tiles.py leinwand.png detail.png ^
       --prompt-file detail_prompt.txt --steps 8 --denoise 0.48 --region 0,0,2048,2048
     ```
3. **Farbe zurückholen: `match_map_colour.py`.** Bei 0.48 Rauschen erfindet
   FLUX.2 nicht nur Struktur, sondern auch Palette — eine Kachel wird heller,
   die nächste gelber. Das Werkzeug nimmt die **groben** Töne aus der Leinwand
   von Schritt 1 und lässt die **feine** Zeichnung aus Schritt 2 stehen. Damit
   ist Farbdrift strukturell erledigt, weil die Farbe gar nicht mehr aus den
   Kacheln kommt.
   ```bat
   .venv\Scripts\python.exe match_map_colour.py detail.png leinwand.png fertig.png
   ```
4. **`slice_map.py`** bringt die Leinwand auf Zielgröße und schneidet die
   Ausliefer-Kacheln heraus.

#### Der Detail-Prompt — und die Falle darin

⚠️ **Die Stilwörter im Prompt schlagen alles andere.** Ein Testlauf mit
„ink-and-watercolour language", „soft watercolour washes" und „gentle paper
grain" hat eine technisch großartige **Aquarellkarte** geliefert — mit dem
`art_style` der Welt hatte sie nichts mehr zu tun. Das Modell gehorcht aufs
Wort; der Fehler saß im Auftrag.

Deshalb: **den `art_style` der Welt wörtlich in den Detail-Prompt schreiben**
und die Materialbeschreibungen in derselben Sprache halten. Für die
Pokémon-Welt also flache Zellenschattierung in zwei Tönen, satte Farben,
klare kräftige Umrisse — und ausdrücklich *kein* Aquarell, *kein* Papierkorn.
Der erprobte Text steht als Datei neben den Werkzeugen.

Aufbau, der sich bewährt hat: erst **Stil festnageln**, dann **Komposition
einfrieren** („nothing moves, nothing new appears"), dann **Material für
Material** sagen, welche kleine Struktur dazukommt (Grashalme als schnelle
dunkle Striche über flachem Grün, Blattklumpen mit eigenem Umriss, Kiesel als
einfache Konturformen, Wasserkräusel als saubere Bögen), zuletzt **gleichmäßige
Detaildichte** und **Fortsetzung über alle vier Ränder** verlangen.

#### Nähte

Bei acht Schritten füllt die neue Zeichnung die Kachelränder so dicht zu, dass
im Nahtraster **kein Treffer mehr messbar** ist — die Stoßkante des
ComfyUI-Zusammensetzers geht in der Textur unter. `heal_map_seams.py` bleibt
als Rückfallebene für Läufe mit wenigen Schritten; bei `refine_map_tiles.py`
wird es gar nicht erst gebraucht.

#### Was das kostet, und wo man spart

Acht Schritte statt zwei sind der vierfache Rechenaufwand. Eine kleine
Gebietskarte (4096×2304) braucht damit rund eine Viertelstunde, eine volle
8192×8192-Leinwand **rund vier Stunden**.

**Bei den großen Karten wird deshalb nur nachgeschärft, was ausgeliefert wird.**
Von einer 8×8-Leinwand ist am Anfang genau eine Kachel sichtbar; die anderen
63 in Ausliefer-Qualität zu zeichnen ist Rechenzeit für die Schublade. Die
Leinwand bleibt dort Remacri-glatt, `refine_map_tiles.py --region` schärft die
sichtbare Kachel plus einen Kachelring Rand. Wird später eine Kachel
freigeschaltet, wird ihr Bereich nachgeschärft — der Anschluss bleibt nahtlos,
weil alles aus derselben Leinwand kommt.

### Handgriffe im Ablauf `Upscale Map`

Drei Dinge vor jedem Lauf, sonst läuft er falsch durch:

- **Upscale-Modell wählen.** `UpscaleModelLoader` (Knoten 978) kommt leer aus
  dem gespeicherten Stand. Wert: `4x_foolhardy_Remacri.pth`.
- **`GetImageSize` (Knoten 937) muss am hochskalierten Bild hängen**, also am
  Ausgang von `ImageUpscaleWithModel` (977) — im gespeicherten Stand hängt es
  am Eingangsbild, und die Kacheln werden dann auf die *Eingangs*größe
  zusammengesetzt. Kontrolle: das Ergebnis muss viermal so breit sein wie der
  Entwurf.
- **Eingangsbild hochladen** nach `POST /upload/image`, dann den Dateinamen in
  `LoadImage` (974) setzen.

Knoten 970 steht auf Bypass — der Prompt dort läuft nicht mit und muss nicht
gepflegt werden.

### Es gibt kein 2:1

Der `ResolutionSelector` kennt nur 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9 und 21:9.
Eine Leinwand aus 2×1 Kacheln ist aber exakt 2:1. Weg: in 16:9 entwerfen und
**nach** dem Hochskalieren mittig auf die Zielhöhe stutzen. Das Gelände läuft
laut Vorlage ohnehin flach bis an alle vier Ränder, der Schnitt kostet nichts.

### Bedienung (Workflow `Krea2 Txt2Img`)

Zwei Fallen, die stumm das Falsche tun:

- **Der Prompt gehört in Knoten 19** (`30/19.value`), **nicht** in das
  `CLIPTextEncode`-Widget `30/6.text` — letzteres ist tot. Setzt man das
  falsche, läuft klaglos der zuletzt dort stehende Prompt durch.
  **Kontrolle:** die Antwort des Laufs enthält unter `text_outputs` den
  tatsächlich benutzten Text — dort nachlesen, bevor man das Bild ansieht.
- **Die Größe kommt aus `ResolutionSelector`** (Knoten 49), nicht aus dem
  Latent-Knoten. Seine „Megapixel" rechnen in Einheiten von **1024²**: für
  2048×2048 ist der Wert **4.0** (4.19 ergibt 2096).

### Größen

Entwurf immer in **einem Viertel der Zielkantenlänge** erzeugen, dann **einmal**
mit `Upscale Map` um Faktor 4 hochskalieren — 2048×2048 für eine
8192er-Leinwand. Krea 2 Turbo ist bis 2k trainiert und hält eine
2048er-Komposition zusammen; größer erzeugen und danach verkleinern wirft genau
die Schärfe weg, für die der Umweg gebaut wurde.

---

## Vorlage — lokale Modelle (ein Absatz)

> ⚠️ **Überholt seit 26.08.2026.** Diese Vorlage ist auf 16:9 geschrieben, lässt
> Perspektive zu und beschreibt ausdrücklich Bauwerke als Landmarken („a windmill
> village", „a walled naval town") — beides ist für Kachelkarten nicht mehr
> zulässig. Sie bleibt hier stehen, weil sie den Stil-Wortschatz gut zeigt und
> die bestehenden Karten damit entstanden sind. **Für neue Karten die
> Kachelkarten-Vorlage oben nehmen.**

```
A stylised top-down map illustration of {REGION_NAME}, drawn as a hand-painted
game map. {LANDMARK_DESCRIPTION}. {TERRAIN_DESCRIPTION}. {ART_STYLE}. Even,
warm illumination across the whole map with no single harsh light source, so
every region reads equally clearly. 16:9, crisp and sharply rendered terrain
detail, vibrant but harmonious colours. Every landmark sits in its own open
space with calm surroundings, so that markers and labels can be placed on top
later. All banners, cartouches and sign surfaces are blank and unlettered.
```

**Ausgefülltes Beispiel (Etappenkarte, One-Piece-Welt):**

```
A stylised top-down map illustration of the East Blue sea, drawn as a
hand-painted game map. A scattering of small green islands runs from the lower
left to the upper right — a windmill village on the first, a walled naval town
on the second, a rocky pirate cove on the third — connected by a dotted sailing
route across the open water. Deep blue sea with hand-drawn wave lines, pale
sandbanks along the coasts and a scattering of reefs. Anime-inspired painterly
illustration with soft cel-shading, clean confident linework, and a warm
saturated colour palette. Even, warm illumination across the whole map with no
single harsh light source, so every region reads equally clearly. 16:9, crisp
and sharply rendered terrain detail, vibrant but harmonious colours. Every
island sits in its own open space with calm surrounding water, so that markers
and labels can be placed on top later. All banners, cartouches and sign
surfaces are blank and unlettered.
```

## Vorlage — GPT Image (gegliedert)

> ⚠️ **Überholt seit 26.08.2026**, aus denselben Gründen wie die Vorlage
> darüber. Für neue Karten die Kachelkarten-Vorlage nehmen.

```
Scene:       Stylised top-down hand-painted game map of {REGION_NAME}.
             Landmarks: {LANDMARK_DESCRIPTION}.
             Terrain: {TERRAIN_DESCRIPTION}.
Style:       {ART_STYLE}, illustrated game map aesthetic.
Light:       Even warm illumination across the whole map, no single harsh source.
Composition: 16:9, full-bleed, top-down.
Constraints: No text, no labels, no compass lettering, no UI elements. Each
             landmark sits in open space with calm surroundings so markers can
             be added later. All banners and cartouches stay blank.
```

Größe: **2048×1152**, dann auf 1920×1080 verkleinern.

⚠️ Bei GPT Image ist das `Constraints`-Feld hier besonders wichtig — das Modell
ist gut im Schriftsatz und malt bei Karten von sich aus gern Ortsnamen hinein.

---

## Etappen-Illustrationen

Kleine Einzelbilder (`ep_01.webp`, `ep_02.webp` …), die auf der Etappenkarte
als organische Inselformen beschnitten dargestellt werden. **Der Beschnitt
frisst die Ecken** — also mittig anlegen und nichts Wichtiges an den Rand.

```
A small illustrated vignette of {STAGE_SUBJECT}, composed as a compact island
of scenery floating on its own, with the subject centred and all important
detail well inside the middle of the image. {STAGE_DETAIL}. {ART_STYLE}. Warm
even light across the whole vignette. The outer edges fade into plain open
ground and empty sky, so the image can be cropped into an irregular organic
shape without losing anything. Crisp and sharply rendered, no writing anywhere.
```

Für GPT Image dieselben Angaben gegliedert, mit `Constraints: important detail
stays in the centre, edges are expendable, no text anywhere.`

---

## Abnahme

- Keine Schrift im Bild, auch keine dekorative auf Bändern oder Kompassrosen.
- Jeder geplante Knotenpunkt hat ringsum Platz, ohne wichtige Details zu
  verdecken.
- Landmarken sind auf einen Blick unterscheidbar — Kinder navigieren über die
  Silhouette, nicht über den Namen.
- Stil deckungsgleich mit Hintergründen derselben Welt.
