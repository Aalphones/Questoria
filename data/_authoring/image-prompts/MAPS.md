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
| **Etappenkarte** (`arc_map`) | Die Story-Arcs einer Welt als Route | Etappenauswahl innerhalb einer Welt |
| **Ortskarte** (`location_map`) | Die Schauplätze eines Arcs | Episodenauswahl innerhalb eines Arcs |

Dazu kommt pro Etappe eine **kleine Etappen-Illustration** (`ep_01.webp` …),
die auf der Etappenkarte als organisch beschnittene Inselform erscheint —
Vorlage weiter unten.

**Knotenpunkte werden in Prozent positioniert**, nicht in Pixeln. Beim Zeichnen
heißt das: Landmarken deutlich sichtbar und **nicht zu nah am Bildrand**, sonst
liegt der Punkt später halb außerhalb.

---

## Vorlage — lokale Modelle (ein Absatz)

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
