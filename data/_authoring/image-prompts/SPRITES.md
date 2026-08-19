# Charakter-Sprites

Ziel: `.png` mit echtem Alphakanal, ca. 1024×1536 (2:3 hoch), pro Charakter
**alle vier Emotionen** `neutral`, `happy`, `worried`, `angry`. Ablage:
`data/themes/<theme_id>/sprites/<character_id>/<character_id>_<emotion>.png`.

Ein Charakter ohne alle vier Dateien bleibt bei der falschen Dialogzeile stumm
oder bricht. Nicht optional.

Empfohlenes Modell: **FLUX.2 klein 9B** — als einziges nimmt es bis zu drei
Referenzbilder, und genau das ist der verlässliche Weg zu einem konsistenten
Emotionsset. Einstellungen: [MODEL_SETTINGS.md](MODEL_SETTINGS.md).

🟡 GPT Image lehnt geschützte Figuren unvorhersehbar ab. Für Fandom-Charaktere
also lokal arbeiten.

---

## Vorlage — lokale Modelle (ein Absatz)

```
A full-body character illustration of {CHARACTER_NAME}, {CHARACTER_DESCRIPTION},
standing upright and facing the viewer in a relaxed, neutral pose with both
arms visible. {EMOTION_SENTENCE} {ART_STYLE}. The entire figure fits inside the
frame from the top of the head to the soles of the shoes, with a clear margin
of empty space above and below. Even, soft studio lighting from the front with
no strong cast shadows. The character stands alone against a completely flat,
uniform {BACKDROP_COLOUR} backdrop that fills every pixel behind them, with
crisp clean edges around the silhouette. Vertical 2:3 framing, crisp and
sharply rendered detail, especially in the hands and the face.
```

**`{BACKDROP_COLOUR}`:** eine Farbe wählen, die **nicht** in der Kleidung der
Figur vorkommt — sonst frisst das Freistellen Löcher in den Charakter.
`mid grey` ist der sichere Standard, `pure chroma green` nur bei Figuren ohne
Grünanteil.

**Ausgefülltes Beispiel (Emotion `worried`):**

```
A full-body character illustration of a young boy pirate in a straw hat, a red
open vest over a bare chest, blue knee-length shorts and sandals, standing
upright and facing the viewer in a relaxed, neutral pose with both arms
visible. His brow is furrowed, his mouth pressed into a tight line and his
shoulders drawn up — he looks worried. Anime-inspired painterly illustration
with soft cel-shading, clean confident linework, and a warm saturated colour
palette. The entire figure fits inside the frame from the top of the hat to the
soles of the sandals, with a clear margin of empty space above and below. Even,
soft studio lighting from the front with no strong cast shadows. The character
stands alone against a completely flat, uniform mid grey backdrop that fills
every pixel behind them, with crisp clean edges around the silhouette. Vertical
2:3 framing, crisp and sharply rendered detail, especially in the hands and the
face.
```

## Vorlage — GPT Image (gegliedert)

```
Scene:       Plain studio backdrop, one single flat {BACKDROP_COLOUR} filling
             the whole background.
Subject:     Full-body illustration of {CHARACTER_NAME} — {CHARACTER_DESCRIPTION}.
             Standing upright, facing the viewer, relaxed neutral pose, both
             arms visible.
Expression:  {EMOTION_SENTENCE}
Style:       {ART_STYLE}
Light:       Even soft frontal studio light, no strong cast shadows.
Composition: Vertical 2:3. Whole figure inside the frame, margin above the head
             and below the feet.
Constraints: One character only. Nothing else in the scene. Crisp silhouette
             edges for later cut-out.
```

---

## Das Emotionsset konsistent bekommen

**Nur der Ausdruckssatz wird getauscht. Alles andere bleibt wörtlich gleich** —
jede Umformulierung an anderer Stelle verändert auch das Gesicht.

| Emotion | Ausdruckssatz |
|---|---|
| `neutral` | „Their expression is calm and even, mouth relaxed, shoulders loose." |
| `happy` | „They are beaming — a wide open smile, bright lively eyes, chin lifted and shoulders back." |
| `worried` | „Their brow is furrowed, the mouth pressed into a tight line and the shoulders drawn up — they look worried." |
| `angry` | „Their teeth are gritted, the brows drawn low over a hard glare, and both fists are clenched at their sides." |

Drei Wege zur Konsistenz, in dieser Reihenfolge:

1. **Referenzbild (belastbar) — und zwar mit Index benannt, auch lokal.** Das
   erste gelungene Sprite als Referenzbild in die drei weiteren Läufe geben.
   FLUX.2 klein nimmt bis zu 3 Referenzbilder. 🟡 **Korrektur:** Diese Seite
   verlangte den Index-Bezug bisher nur für GPT Image — falsch. Black Forest
   Labs' eigener FLUX.2-Prompting-Guide verlangt dieselbe explizite Zuordnung
   auch bei lokaler Multi-Reference-Konditionierung: „clearly describe the
   role of each [reference]: subject from image 1, style from image 2,
   background from image 3." Fehlt der Satz, konkurriert die volle
   Text-Neubeschreibung der Figur mit dem Referenzbild, statt sich ihm
   unterzuordnen — genau das Symptom, wenn das Ergebnis trotz korrekt
   verdrahteter Konditionierung nicht nach der Referenz aussieht. Bei
   **beiden** Modellen also wörtlich in den Prompt: *„Image 1: the character
   reference — keep face, hair, outfit and proportions identical to Image 1,
   change only the expression."* Quelle: [BFL FLUX.2 Prompting Guide](https://docs.bfl.ml/guides/prompting_guide_flux2).
2. **Seed festhalten (plausibel, ungemessen).** Lokal denselben Seed über alle
   vier Läufe verwenden. Hilft, ersetzt aber das Referenzbild nicht.
3. **Vier Läufe direkt hintereinander**, ohne zwischendurch am Stilsatz zu
   drehen.

---

## Nachbearbeitung — Pflichtschritt

Keins der drei Modelle liefert einen verlässlichen Alphakanal. GPT Image gibt
sogar ausdrücklich deckende Bilder aus und empfiehlt selbst das nachgelagerte
Freistellen.

```bash
rembg i sprite_raw.png sprite_freigestellt.png
```

Danach prüfen:

- Kein Rest des Hintergrunds am Silhouettenrand, besonders zwischen Haarsträhnen.
- Keine Löcher in Kleidung, die zufällig die Backdrop-Farbe hatte.
- Zuschnitt und Anker: Figur mittig, **Füße nahe der Bildunterkante** — die
  Vorgabe steht in [ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md).
- Alle vier Emotionen identisch zugeschnitten, sonst springt die Figur beim
  Emotionswechsel im Dialog.

Das Sprite wird **unabhängig von links/rechts** erstellt. Die Engine platziert
und spiegelt es passend zum Bühnenplatz.
