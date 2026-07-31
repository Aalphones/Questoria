# Hintergründe

Ziel: 1920×1080 `.webp`, 16:9, **ohne Charaktere** — die kommen als Sprites
obendrauf. Ablage: `data/themes/<theme_id>/backgrounds/<scene_name>.webp`.

Empfohlenes Modell: **Krea 2 Turbo** (trifft 1920×1080 direkt).
Einstellungen: [MODEL_SETTINGS.md](MODEL_SETTINGS.md).

---

## Vorlage — lokale Modelle (ein Absatz)

```
A deserted {SCENE_SUBJECT} {SCENE_ACTION_OR_STATE}. In the foreground,
{FOREGROUND_DETAIL}; in the middle ground, {MIDGROUND_DETAIL}; in the
background, {BACKGROUND_DETAIL}. {LIGHT_DESCRIPTION}. {ART_STYLE}. Wide
cinematic framing at eye level, 16:9, crisp and sharply rendered detail
throughout, painted background art for a video game. The lower left and lower
right thirds of the frame stay visually calm and uncluttered so that
foreground figures can be placed there later. Any sign boards, banners or
posters in the scene are blank, unlettered surfaces.
```

Die letzten zwei Sätze sind **nicht optional**. Sie ersetzen den alten
Negativ-Prompt und halten die Bühnenplätze frei.

**Ausgefülltes Beispiel:**

```
A deserted harbour dock stretches from the lower left toward a windmill
village on the far shore. In the foreground, weathered oak planks with
washed-out grain and coiled hemp mooring ropes lie bare; in the middle ground,
three empty fishing boats with patched sails rock against the pier; in the
background, red-roofed houses and a slowly turning windmill sit against low
green hills. Late afternoon sun comes from the left at a low angle, warm and
orange around 3200 K, raking across the wood and casting long soft shadows.
Anime-inspired painterly illustration with soft cel-shading, clean confident
linework, and a warm saturated colour palette. Wide cinematic framing at eye
level, 16:9, crisp and sharply rendered detail throughout, painted background
art for a video game. The lower left and lower right thirds of the frame stay
visually calm and uncluttered so that foreground figures can be placed there
later. Any sign boards, banners or posters in the scene are blank, unlettered
surfaces.
```

## Vorlage — GPT Image (gegliedert)

```
Scene:       A deserted {SCENE_SUBJECT}. Foreground: {FOREGROUND_DETAIL}.
             Middle ground: {MIDGROUND_DETAIL}. Background: {BACKGROUND_DETAIL}.
Style:       {ART_STYLE}
Light:       {LIGHT_DESCRIPTION}
Composition: Wide cinematic framing, eye level, 16:9.
Constraints: No people or animals anywhere in the scene. Keep the lower left
             and lower right thirds calm and uncluttered for figures added
             later. All sign boards and banners are blank surfaces.
```

Größe: **2048×1152**, dann auf 1920×1080 verkleinern.

---

## Stimmungs-Varianten desselben Ortes

Gleicher Ort, gleiche Komposition, andere Stimmung — als **eigene Datei** mit
gleichem Präfix: `hafendamm.webp` → `hafendamm_corrupted.webp`.

Lokal denselben Seed halten und nur den Stimmungsteil austauschen. Bei GPT
Image das erste Bild als Referenz mitgeben und ansagen: *„same location, same
camera angle and composition as Image 1, only the mood changes."*

| Variante | Austauschsatz |
|---|---|
| `corrupted` | „A sickly violet cast lies over the scene, thin ominous fog drifts between cracked, splintered surfaces, and the light has gone cold and hard." |
| `night` | „Deep blue moonlight from high above replaces the sun, with warm lantern pools scattered across the ground and long crisp shadows." |
| `festive` | „Golden hour light floods the scene, paper lanterns and bunting hang in strings, and the colours are pushed warm and celebratory." |
| `storm` | „Heavy grey-green storm clouds press down, rain streaks slant from the left, and cold flat light flattens the colours." |

---

## Aus einem Referenzbild arbeiten

Wenn ein Screenshot oder ein Fanart als Vorlage dient und die Figuren raus
sollen, gibt es zwei brauchbare Wege — beide besser als der alte
Inpainting-Umweg:

1. **GPT Image mit Bearbeitungsanweisung.** Bild hochladen, dazu:
   *„Remove every person from this image and continue the background behind
   them plausibly. Keep the camera angle, the architecture, the lighting and
   the colour grading exactly as they are."* Der zweite Satz ist der wichtige —
   ohne ihn driftet das ganze Bild.
2. **FLUX.2 klein mit Referenzbild** (maximal 3 Stück), dazu der normale
   Absatz-Prompt oben. Das Referenzbild liefert Ort und Stil, der Prompt die
   leere Bühne.

🟡 **Img2Img mit Teil-Denoising ist ungeklärt.** Die alte Library nannte
Denoising-Stärken aus der FLUX.1-Zeit (0.3–0.4 für den Stil-Nachpass). Für
FLUX.2 klein und Krea 2 Turbo sind diese Werte nicht überprüft — beide sind auf
sehr wenige Steps destilliert. Wer es probiert: tastend anfangen und den Wert,
der funktioniert, hier eintragen.

---

## Abnahme — bevor die Datei ins Repo wandert

- Keine Figuren, keine Tiere, keine Schrift im Bild.
- Untere Bilddrittel links und rechts ruhig genug für ein Sprite davor.
- Stil deckungsgleich mit den anderen Hintergründen derselben Welt.
- 1920×1080, `.webp`, Dateiname `snake_case` ohne Umlaute.
