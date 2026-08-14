# Bildantworten für den Vorlesemodus

Ziel: `.png` mit Alphakanal, quadratisch, **mindestens 512×512 px**, Dateiname
`antwort_<slug>.png` in `snake_case` ohne Umlaute.

Für Kinder, die noch nicht lesen, steht über jeder Antwortmöglichkeit im
`multiple_choice`-Event ein Bild. Es ist keine Dekoration, sondern **die
einzige Information, die das Kind vergleichen kann** — der Antworttext wird
vorgelesen, aber nebeneinanderlegen lassen sich nur die Bilder. Ein
mehrdeutiges Bild macht die Aufgabe zum Ratespiel, und das Kind lernt, dass
Raten funktioniert.

Der Dateiname steht als `image` in der Event-Datei und wird **nicht** aus dem
Antworttext berechnet. Wer ihn berechnet, verliert das Bild bei jeder
Textkorrektur.

**Generieren in 1024×1024, dann verkleinern.** 512 px liegt unter dem Minimum
der lokalen Modelle — direkt in Zielgröße erzeugt sieht man das.

Empfohlenes Modell: **Krea 2 Turbo**. Diese Bilder brauchen weder Referenzbilder
noch Text, dafür viele Stück in Serie. Einstellungen:
[MODEL_SETTINGS.md](MODEL_SETTINGS.md).

---

## Die Regel, an der alles hängt

Die Anforderung gilt dem **Satz**, nicht dem einzelnen Bild. Vier hübsche
Illustrationen, die alle nach „Landschaft mit Himmel" aussehen, sind vier
falsche Bilder.

| Frage | Gut | Unbrauchbar |
|---|---|---|
| „Wohin zeigt der Kompass?" | eine Kompassnadel, die klar nach oben zeigt | eine Landkarte mit einem winzigen N am Rand |
| „Welches Tier lebt im Meer?" | ein Fisch, formatfüllend, seitlich | eine Meeresszene, in der irgendwo ein Fisch schwimmt |
| „Welche Form hat ein Rad?" | ein einzelner Kreis, kräftig | ein Fahrrad in Seitenansicht |

Daraus folgt: **ein Motiv, formatfüllend, ruhiger Hintergrund.** Alles, was zur
Antwort nicht gehört, gehört nicht ins Bild.

Der Test, der über die Datei entscheidet: Ein Kind, das den Text nicht lesen
kann, muss die Antwort **allein am Bild** erkennen. Im Zweifel das simplere
Bild nehmen — ein schönes, mehrdeutiges Bild ist in diesem Event schlicht
eine falsche Antwort.

---

## Vorlage — lokale Modelle (ein Absatz)

```
A single {ANSWER_SUBJECT} shown on its own, centred and filling most of the
square frame. {SHAPE_HINT}. The shape reads clearly at a glance: bold
silhouette, strong contrast against a plain flat background in
{BACKDROP_COLOUR}, which is one single even value from edge to edge.
{ART_STYLE}, with simplified shapes and strong outlines. Even soft lighting
with no dramatic shadows, so the object stays easy to recognise. The object is
shown complete, with a comfortable margin on all four sides. Every surface is
smooth and free of writing, numbers or markings.
```

**`{BACKDROP_COLOUR}`:** eine Farbe wählen, die **nicht** im Motiv vorkommt —
sonst frisst das Freistellen Löcher hinein.

**Ausgefülltes Beispiel (Antwort „Norden"):**

```
A single ornate compass needle shown on its own, centred and filling most of
the square frame, pointing straight upwards. The red-tipped northern half
points unmistakably towards the top edge, forged from blued steel on a warm
brass pivot. The shape reads clearly at a glance: bold silhouette, strong
contrast against a plain flat background in soft cream, which is one single
even value from edge to edge. Anime-inspired painterly illustration with soft
cel-shading, clean confident linework, and a warm saturated colour palette,
with simplified shapes and strong outlines. Even soft lighting with no dramatic
shadows, so the object stays easy to recognise. The object is shown complete,
with a comfortable margin on all four sides. Every surface is smooth and free
of writing, numbers or markings.
```

## Vorlage — GPT Image (gegliedert)

```
Background:  Plain flat {BACKDROP_COLOUR}, one even value, no gradient.
Subject:     A single {ANSWER_SUBJECT}, centred, filling most of the frame.
             {SHAPE_HINT}
Style:       {ART_STYLE}. Bold readable silhouette, high contrast.
Light:       Even and soft, no dramatic shadows.
Composition: Square. Object complete with a margin on all four sides.
Constraints: One object only. All surfaces blank, no writing or numbers.
             Nothing else in the image.
```

Der `{ART_STYLE}`-Anker ist derselbe wie für den Rest der Welt
([README.md](README.md)) — die Antwortbilder stehen mitten im Spiel und dürfen
nicht wie Fremdkörper aussehen.

---

## `{SHAPE_HINT}` — der Satz, der über Brauchbarkeit entscheidet

Kein Beiwerk. Er sagt dem Modell, **woran man die Antwort erkennt** — und genau
daran scheitern generische Prompts:

| Antwort | Schwacher Prompt | `{SHAPE_HINT}` |
|---|---|---|
| Norden | „a compass" | „The red-tipped needle points straight up, unmistakably vertical." |
| Dreieck | „a triangle" | „An equilateral triangle resting on its flat base, all three corners clearly visible." |
| Sturm | „bad weather" | „Heavy dark clouds with a single bright lightning bolt striking downward through them." |

---

## Konsistenz über einen Antwortsatz

Alle Bilder **einer Frage** müssen wie ein Satz aussehen — sonst wirkt eine
Antwort schon durch den Stil richtiger als die anderen:

- Gleicher Stilsatz, gleiche Backdrop-Farbe, gleicher Ausschnitt.
- **Gleicher Detailgrad. Die richtige Antwort darf nicht die schönste sein** —
  Kinder erkennen dieses Muster schneller als jeden Lerninhalt.
- Alle Bilder eines Satzes in einem Rutsch generieren, nicht über Tage verteilt.

## Nach der Generierung

1. Freistellen — die Bilder liegen später auf farbigen Antwort-Buttons, ein
   weißer Kasten drumherum fällt sofort auf:
   ```bash
   rembg i antwort_raw.png antwort_norden.png
   ```
2. Quadratisch beschneiden und auf mindestens 512×512 px bringen.
3. **Das Set nebeneinanderlegen.** Erst im Vergleich zeigt sich, ob zwei
   Antworten dasselbe Bild geworden sind.

## Abnahme

- Ein Kind, das den Text nicht lesen kann, erkennt die Antwort allein am Bild.
- Die Bilder einer Frage sind nebeneinander eindeutig unterscheidbar.
- Keine Schrift, keine Zahlen, kein Wasserzeichen — auch nicht klein im Motiv.
- Echter Alphakanal, keine weiße Restfläche an den Rändern.
- Dateiname identisch zum `image`-Feld in der Event-Datei.
