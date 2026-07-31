# Bildantworten für den Vorlesemodus

Ein Bild pro Antwortmöglichkeit im Multiple-Choice-Minispiel. Für Kinder, die
noch nicht lesen können, ist das die **einzige** Information — Eindeutigkeit
schlägt Schönheit, jedes Mal.

Ziel: `.png` mit Alphakanal, quadratisch, mindestens 512×512 px.

Empfohlenes Modell: **Krea 2 Turbo** für Alltagsmotive, **GPT Image** wenn eine
Bildantwort ausnahmsweise ein Wort oder ein Symbol enthalten muss.
Einstellungen: [MODEL_SETTINGS.md](MODEL_SETTINGS.md).

---

## Der Test, der über die Datei entscheidet

Ein Kind, das den Text nicht lesen kann, muss die Antwort **allein am Bild**
erkennen.

- „Norden" als Kompassnadel, die nach oben zeigt → gut.
- „Norden" als Landkarte mit einem winzigen N in der Ecke → unbrauchbar.

Im Zweifel das simplere Bild nehmen. Ein hübsches, mehrdeutiges Bild ist in
diesem Minispiel schlicht eine falsche Antwort.

---

## Vorlage — lokale Modelle (ein Absatz)

```
A single {ANSWER_SUBJECT}, drawn as one clear, instantly recognisable object
centred in the frame and filling most of it. {SHAPE_HINT}. {ART_STYLE}, with
bold simplified shapes, strong outlines and high contrast between the object
and its surroundings. Even, soft frontal light with no dramatic shadows. The
object stands alone against a completely flat, uniform {BACKDROP_COLOUR}
backdrop that fills every pixel behind it, with crisp clean silhouette edges.
Square composition, child-friendly, crisp and sharply rendered. Every surface
of the object is smooth and free of writing, numbers or markings.
```

**Ausgefülltes Beispiel (Antwort „Norden"):**

```
A single brass compass needle, drawn as one clear, instantly recognisable
object centred in the frame and filling most of it. The red-tipped end points
straight up towards the top edge of the image, unmistakably vertical. Anime-
inspired painterly illustration with soft cel-shading, clean confident
linework, and a warm saturated colour palette, with bold simplified shapes,
strong outlines and high contrast between the object and its surroundings.
Even, soft frontal light with no dramatic shadows. The object stands alone
against a completely flat, uniform mid grey backdrop that fills every pixel
behind it, with crisp clean silhouette edges. Square composition, child-
friendly, crisp and sharply rendered. Every surface of the object is smooth
and free of writing, numbers or markings.
```

## Vorlage — GPT Image (gegliedert)

```
Scene:       Flat uniform {BACKDROP_COLOUR} backdrop, nothing else.
Subject:     A single {ANSWER_SUBJECT}, centred, filling most of the frame.
             {SHAPE_HINT}
Style:       {ART_STYLE}, bold simplified shapes, strong outlines, high contrast.
Light:       Even soft frontal light, no dramatic shadows.
Composition: Square. Object centred with a small margin on all sides.
Constraints: Exactly one object. No text, numbers or labels anywhere. Nothing in
             the background. Crisp silhouette edges for later cut-out.
```

---

## Der Satz, der über Brauchbarkeit entscheidet

`{SHAPE_HINT}` ist kein Beiwerk. Er sagt dem Modell, **woran man die Antwort
erkennt** — und genau daran scheitern generische Prompts:

| Antwort | Schwacher Prompt | `{SHAPE_HINT}` |
|---|---|---|
| Norden | „a compass" | „The red-tipped needle points straight up, unmistakably vertical." |
| Dreieck | „a triangle" | „An equilateral triangle resting on its flat base, all three corners clearly visible." |
| Sturm | „bad weather" | „Heavy dark clouds with a single bright lightning bolt striking downward through them." |

---

## Konsistenz über einen Antwortsatz

Alle Bilder **einer Frage** müssen wie ein Satz aussehen — sonst wirkt eine
Antwort schon durch den Stil richtiger als die anderen. Praktisch heißt das:

- Gleicher Stilsatz, gleiche Backdrop-Farbe, gleicher Ausschnitt.
- Gleicher Detailgrad. Die richtige Antwort darf **nicht** die schönste sein —
  Kinder erkennen dieses Muster schneller als jeden Lerninhalt.
- Alle Bilder eines Satzes in einem Rutsch generieren, nicht über Tage verteilt.

## Nachbearbeitung

```bash
rembg i antwort_raw.png antwort_norden.png
```

Danach quadratisch auf mindestens 512×512 exportieren und gegen den Lesetest
oben prüfen — am besten an einem Kind, nicht am eigenen Wunschdenken.
