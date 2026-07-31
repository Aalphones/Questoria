# Sammelkarten

Ziel: `.png`, **630×880 px** (63×88 mm bei 300 dpi). Sammelkarten sind fertige
Bilddateien, die außerhalb des Spiels entstehen und mit dem Content-Paket
ausgeliefert werden — das Spiel schaltet frei, zeigt an und druckt, es
generiert nichts.

**Nie in 630×880 generieren.** Das liegt unter dem Minimum der lokalen Modelle.
Generieren in **1024×1440**, dann verkleinern — Details in
[MODEL_SETTINGS.md](MODEL_SETTINGS.md).

Eine Karte entsteht in zwei Teilen: dem **Rahmen** (einmal pro Welt, wiederholt
verwendet) und dem **Kartenmotiv** (pro Karte).

---

# Teil 1 — Der Rahmen

## Master-Prompt für ein Sprachmodell

Der folgende Text geht an Claude/ChatGPT/Gemini. Er liefert Designbeschreibung,
Farbpalette, Schriftvorschlag und den fertigen Bildprompt.

```
Du bist Art Director für Sammelkarten und Fantasy-Illustration.

Ich gebe dir nur ein Thema oder ein paar Stichworte, zum Beispiel
"Piraten und offene See", "Slytherin", "Steampunk" oder
"japanische Mythologie".

=== ANALYSE (nicht ausgeben) ===
Erschließe zuerst die visuelle Sprache des Themas: Farbpalette, Materialien,
Muster, Ornamente, Architektur, Kultur, Natur, Lichtstimmung, typische Formen,
Wiedererkennungsmerkmale.

Nutze das ausschließlich als Inspiration. Verwende keine geschützten Figuren,
Logos, Wappen oder Schriftzüge — der Rahmen muss eigenständig sein.

=== ZIELMODELL ===
Der Bildprompt wird gebaut für: {ZIELMODELL: "FLUX.2 klein" | "Krea 2 Turbo"
| "GPT Image 2"}

Formatregeln nach Zielmodell:
- FLUX.2 klein / Krea 2 Turbo: EIN zusammenhängender Prosa-Absatz, ganze
  Sätze, 60-200 Wörter, Reihenfolge Subjekt -> Szene -> Stil -> Licht ->
  Material. Keine Komma-Tag-Listen, keine Gewichtungs-Syntax wie (wort:1.3),
  keine Qualitätsfüllwörter wie "masterpiece" oder "8k".
- GPT Image 2: gegliederte Abschnitte mit Zeilenumbrüchen, Reihenfolge
  Scene -> Subject -> Details -> Constraints.

In BEIDEN Fällen gilt: KEIN Negativ-Prompt. Es gibt keins. Alles Unerwünschte
wird positiv formuliert — statt "keine Schrift" schreibst du "alle Zierfelder
und Kartuschen sind leere, glatte Flächen".

=== VORGABEN FÜR DEN RAHMEN ===
- Dekorativer Sammelkartenrahmen, hochwertig, stilistisch am Thema
- Symmetrisch, viele feine Ornamente, edle Materialien
- Die Mitte bleibt eine große, vollständig freie Bildfläche für das Motiv
- Der Rahmen füllt die Kanten des Bildes bis zum Rand aus
- Alle Verzierungen sind Bestandteil des Rahmens und ragen nicht frei in den
  Hintergrund
- Kartuschen und Zierfelder bleiben leere, glatte Flächen ohne Schrift
- Keine Figuren, keine Wappen, keine Logos

=== HINTERGRUND (für sauberes Freistellen) ===
Hinter und innerhalb des Rahmens liegt eine vollkommen gleichmäßige, satte
Chroma-Grün-Fläche in #00FF00, ein einziger Farbwert von Kante zu Kante, glatt
und matt. Der Rahmen hat scharfe, saubere Kanten gegen diese Fläche.
Beschreibe das positiv und ausdrücklich als "one single flat value", damit
weder Verläufe noch Schatten noch Leuchteffekte entstehen.
Grün darf ausschließlich im Hintergrund vorkommen, nicht im Rahmen selbst.

=== FORMAT ===
Seitenverhältnis 63:88 (hochkant). Generiert wird in 1024x1440, später
verkleinert auf 630x880.

=== AUSGABE (genau diese vier Blöcke, in dieser Reihenfolge) ===
1. Designbeschreibung: Grundstil, Materialien, Ornamente, Farbwelt, Stimmung,
   besondere Details — wenige Absätze
2. Farbpalette als Hex-Werte: Primär, Sekundär, Akzent, Textfarbe hell,
   Textfarbe dunkel
3. Schriftart(en): frei verfügbar, mit kurzer Begründung
4. Der fertige Bildprompt im Format des Zielmodells, in einem Codeblock,
   direkt kopierbar
```

## Nach der Generierung

1. Grünfläche freistellen (Farbbereich/Zauberstab oder `rembg`).
2. Ränder auf Grünsaum prüfen — Chroma-Grün blutet gern in helle Ornamente.
   Fällt das auf, im nächsten Lauf auf **Chroma-Magenta (#FF00FF)** wechseln;
   bei goldenen und hölzernen Rahmen ist der Saum dort geringer.
3. Auf 630×880 verkleinern.
4. Freie Mittelfläche gegen das Kartenmotiv prüfen: Passt der Ausschnitt?

---

# Teil 2 — Das Kartenmotiv

Das Motiv sitzt später in der freien Mitte des Rahmens. Es wird **eigenständig
gestaltet**, nicht als Abbild einer geschützten Figur — der Rahmen ist
generisch, das Motiv muss es auch sein, sonst ist die Karte nicht druckbar.

## Vorlage — lokale Modelle (ein Absatz)

```
A single {SUBJECT} rendered as a collectible card illustration, centred in the
frame and filling most of it. {SUBJECT_DETAIL}. {BACKGROUND_TREATMENT}.
{ART_STYLE}. {LIGHT_DESCRIPTION}. Vertical framing, crisp and sharply rendered
detail, rich saturated colour. The composition leaves a calm margin on all four
sides so the illustration can be inset into a decorative frame. Every surface
in the image is free of writing and markings.
```

**Ausgefülltes Beispiel:**

```
A single ornate brass compass rose rendered as a collectible card
illustration, centred in the frame and filling most of it. Its needle is
forged from blued steel, the housing from warm brass with fine engraved
rays and a chipped enamel inlay in deep sea blue. Behind it, a soft radial
glow fades from pale gold at the centre into deep indigo at the corners,
with faint drifting motes of light. Anime-inspired painterly illustration
with soft cel-shading, clean confident linework, and a warm saturated colour
palette. Warm directional light from the upper left picks out the engraved
edges, with a cool rim light along the right side. Vertical framing, crisp
and sharply rendered detail, rich saturated colour. The composition leaves a
calm margin on all four sides so the illustration can be inset into a
decorative frame. Every surface in the image is free of writing and markings.
```

## Vorlage — GPT Image (gegliedert)

```
Scene:       {BACKGROUND_TREATMENT}
Subject:     A single {SUBJECT}, centred, filling most of the frame.
             {SUBJECT_DETAIL}
Style:       {ART_STYLE}, collectible card illustration.
Light:       {LIGHT_DESCRIPTION}
Composition: Vertical 63:88. Calm margin on all four sides for a frame inset.
Constraints: One subject only. No text, no signatures, no watermarks, no logos.
```

Größe: **1024×1440**, dann auf 630×880 verkleinern.

---

## Abnahme

- Motiv sitzt mittig und bleibt nach dem Einsetzen in den Rahmen vollständig
  sichtbar.
- Keine Schrift, keine Signatur, kein Wasserzeichen.
- Seltenheitsstufe erkennbar am Aufwand des Motivs, nicht an einem Aufdruck —
  die Stufe zeigt die App.
- 630×880 `.png`, Dateiname `snake_case` wie im `cards[]`-Eintrag der Welt.
