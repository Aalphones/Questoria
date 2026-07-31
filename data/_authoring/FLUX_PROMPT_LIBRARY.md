# Flux Prompt Library

Vorlagen für lokale Flux-Modelle (Image-to-Image / Inpainting). Platzhalter
in `{GROSSBUCHSTABEN}` ersetzen, Rest so übernehmen. Funktioniert auch mit
anderen Img2Img-Modellen, aber für Flux abgestimmt.

🟡 Diese Prompts sind ein Startpunkt, kein Naturgesetz — pro Welt-Artstyle
nachjustieren und die Anpassungen hier dokumentieren, wenn sie sich bewähren.

---

## 1. Hintergrund clearen (Charaktere entfernen)

Workflow: Referenzbild/Screenshot → Maske über Charaktere legen → Inpainting.

```
Prompt:
{SCENE_DESCRIPTION}, empty background, no people, no characters,
clean environment, {ART_STYLE}, consistent lighting, high detail
background art, 16:9 aspect ratio, seamless

Negative Prompt:
people, characters, humans, figures, text, watermark, logo, blurry,
low quality, deformed, extra limbs, signature
```

**Beispiel ausgefüllt:**
```
Prompt:
harbor dock at sunset with windmill village in the background, wooden
boats, warm orange lighting, empty background, no people, no characters,
clean environment, anime-inspired painterly style, consistent lighting,
high detail background art, 16:9 aspect ratio, seamless

Negative Prompt:
people, characters, humans, figures, text, watermark, logo, blurry,
low quality, deformed, extra limbs, signature
```

### Stilistische Veredelung (zweiter Pass)

Nach dem Clearing einen zweiten Img2Img-Pass mit niedriger Denoising-Strength
(0.3–0.4) für konsistenten Look über alle Hintergründe einer Welt:

```
Prompt:
{ART_STYLE} illustration, vibrant color grading, soft painterly shading,
cohesive art direction matching {THEME_NAME} universe
```

### Bosskampf-/Dramatik-Varianten

Gleicher Hintergrund, gleiche Komposition, anderer Modifier-Block:

```
{BASE_PROMPT}, corrupted atmosphere, dark purple color grading,
ominous fog, cracked surfaces, foreboding mood, dramatic lighting
```

Varianten-Modifier zum Austauschen: `corrupted` · `nighttime, moonlit` ·
`festive, golden hour` · `stormy, dramatic clouds`.

---

## 2. Charakter-Sprite aus Vorlage erstellen

Workflow: Referenzbild (Fanart, Konzeptzeichnung, Foto-Vorlage) → Img2Img mit
mittlerer Denoising-Strength (0.5–0.65, niedriger = näher an Vorlage) →
Hintergrund entfernen (Flux selbst liefert keine Alpha-Kanäle zuverlässig,
danach durch ein Background-Removal-Tool wie `rembg` jagen).

```
Prompt:
full body character portrait of {CHARACTER_NAME}, {CHARACTER_DESCRIPTION},
{EMOTION} expression, standing pose, facing forward, {ART_STYLE},
clean isolated subject, studio lighting, plain background, high detail,
2:3 portrait aspect ratio

Negative Prompt:
cropped, cut off limbs, multiple characters, background scenery, text,
watermark, blurry, low quality, extra fingers, deformed hands
```

**Beispiel ausgefüllt (Emotion: worried):**
```
Prompt:
full body character portrait of Luffy as a child, straw hat, red vest,
short shorts, worried expression, standing pose, facing forward,
anime-inspired painterly style, clean isolated subject, studio lighting,
plain background, high detail, 2:3 portrait aspect ratio

Negative Prompt:
cropped, cut off limbs, multiple characters, background scenery, text,
watermark, blurry, low quality, extra fingers, deformed hands
```

### Emotion-Set in einem Rutsch erzeugen

Für Konsistenz über alle vier Pflicht-Emotionen denselben Seed verwenden,
nur `{EMOTION}` und ggf. Mimik-Zusatz austauschen:

| Emotion | Zusatz-Deskriptor |
|---|---|
| `neutral` | calm, neutral expression, relaxed posture |
| `happy` | wide smile, bright eyes, energetic posture |
| `worried` | furrowed brow, concerned expression, tense posture |
| `angry` | gritted teeth, intense glare, clenched fists |

### Nachbearbeitung (Pflichtschritt)

```bash
# Hintergrund entfernen für echten Alpha-Kanal
rembg i input_sprite.png output_sprite.png
```

Danach manuell prüfen: keine Reste vom Studio-Hintergrund am Rand, Füße nahe
genug an der Bildunterkante (siehe `ASSET_REQUIREMENTS.md`, Anker-Punkt).

---

## 3. Konsistenz-Anker über eine ganze Welt

Damit nicht jede Generierung einen neuen Stil erfindet, pro Welt EINMAL
festlegen und für alle Prompts wiederverwenden:

```
{ART_STYLE} = z. B. "anime-inspired painterly style, soft cel-shading,
warm color palette, clean linework"
```

Diesen Block wörtlich in jeden Hintergrund- und Sprite-Prompt derselben Welt
kopieren. Abweichungen im Artstyle zwischen Episoden sind kein „kreativer
Mut", sondern ein Continuity-Fehler, den die Spieler sofort sehen.

---

## 4. Map-Grafiken

```
Prompt:
top-down stylized map illustration of {REGION_NAME}, {ART_STYLE},
clear landmarks, readable terrain features, vibrant colors,
game map aesthetic, 16:9 aspect ratio

Negative Prompt:
text labels, UI elements, blurry, photorealistic, low detail
```

Text/Labels bewusst im Negative Prompt — Beschriftung der Nodes übernimmt
die Engine, nicht das Bild.
