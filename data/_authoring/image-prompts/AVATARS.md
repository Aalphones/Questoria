# Profil-Avatare

Ziel: `.png` mit Alphakanal oder deckendem Hintergrund, quadratisch,
**512×512 px**, Dateiname `avatar_<slug>.png` in `snake_case` ohne Umlaute.
Ablage: `data/avatars/` (eigene Drive-Junction, **nicht** unter
`data/themes/<theme_id>/` — die Auswahl gilt für jedes Profil, unabhängig von
der gewählten Welt). Format-Vorgabe: [ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md)
Abschnitt 7.

Die sechs mitgelieferten Avatare sind reine Platzhalter — ein Farbkreis mit
Kopf-Silhouette, kein Motiv. Dieses Dokument ist der Master-Prompt, um sie
durch echte Brustporträts zu ersetzen und mit neuen Welten/Lernstufen um
weitere Charaktere zu erweitern, alle im selben Stil.

**Empfohlenes Modell: ChatGPT / GPT Image** — genau dafür gebaut (siehe unten,
🟡 aber die Fandom-Falle beachten). Einstellungen und Grundregeln:
[MODEL_SETTINGS.md](MODEL_SETTINGS.md), [README.md](README.md).

---

## Der Stilanker — wörtlich in jeden Prompt kopieren

Damit Avatare nicht wie ein Fremdkörper neben dem Rest des Spiels wirken,
tragen sie **denselben Stilsatz** wie Sprites, Karten und Hintergründe:

```
{ART_STYLE} = "anime-inspired painterly illustration with soft cel-shading,
clean confident linework, and a warm saturated colour palette"
```

Dazu eine avatar-eigene Zusatzregel, die den Kreis-Zuschnitt der Oberfläche
mitdenkt: Das Bild wird von der Engine per CSS quadratisch zum Kreis
beschnitten (`object-fit: cover`), **kein serverseitiger Kreis-Cutout nötig** —
wichtig ist nur, dass Gesicht und Schultern mittig sitzen und nichts
Entscheidendes in den vier Ecken hängt, die der Kreis wegschneidet.

## Master-Prompt — GPT Image (gegliedert)

```
Scene:       Plain flat {BACKDROP_COLOUR} background, one even value, no
             gradient, no scenery.
Subject:     Head-and-shoulders portrait of {CHARACTER_DESCRIPTION}, facing
             the viewer directly, centred in the frame.
Expression:  {EXPRESSION_SENTENCE}
Style:       {ART_STYLE}.
Light:       Even, soft frontal light, no strong cast shadows.
Composition: Square 1:1. Face and shoulders centred, with even margin on all
             sides — the four corners are cropped away later, so keep
             important detail away from them.
Constraints: One character only. Nothing else in the scene. No text, no
             watermark, no signature.
```

**Ausgefülltes Beispiel** (`{BACKDROP_COLOUR}` = „soft coral orange",
`{CHARACTER_DESCRIPTION}` = „a cheerful young sailor girl with a short bob
haircut in windswept teal, a yellow rain jacket with the collar popped up,
and a scattering of light freckles"):

```
Scene:       Plain flat soft coral orange background, one even value, no
             gradient, no scenery.
Subject:     Head-and-shoulders portrait of a cheerful young sailor girl with
             a short bob haircut in windswept teal, a yellow rain jacket with
             the collar popped up, and a scattering of light freckles, facing
             the viewer directly, centred in the frame.
Expression:  She is beaming — a wide open smile, bright lively eyes, chin
             lifted.
Style:       Anime-inspired painterly illustration with soft cel-shading,
             clean confident linework, and a warm saturated colour palette.
Light:       Even, soft frontal light, no strong cast shadows.
Composition: Square 1:1. Face and shoulders centred, with even margin on all
             sides — the four corners are cropped away later, so keep
             important detail away from them.
Constraints: One character only. Nothing else in the scene. No text, no
             watermark, no signature.
```

## Vorlage — lokale Modelle (ein Absatz)

Für den Fall, dass ein Avatar an einer bestehenden Fandom-Figur hängt (siehe
Falle unten) — dann lokal, nicht über ChatGPT:

```
A head-and-shoulders portrait of {CHARACTER_DESCRIPTION}, facing the viewer
directly, centred in a square frame. {EXPRESSION_SENTENCE} {ART_STYLE}. Face
and shoulders sit centred with an even margin on every side, since the four
corners are cropped away later — keep important detail out of them. Even, soft
frontal lighting with no strong cast shadows. The character stands alone
against a completely flat, uniform {BACKDROP_COLOUR} background that fills
every pixel behind them. Crisp, sharply rendered detail, especially in the
face.
```

---

## `{BACKDROP_COLOUR}` — pro Avatar eine eigene Farbe

Die alten Platzhalter waren allein über ihre Kreisfarbe auseinanderzuhalten —
das bleibt auch mit echten Porträts sinnvoll: **jeder Avatar eine eigene,
klar unterscheidbare Flächenfarbe**, damit die Auswahlkacheln im
Profil-Bildschirm auf den ersten Blick auseinanderfallen, nicht erst am
Gesicht. Farbe **nicht** aus der Kleidung/Haaren der Figur wählen, sonst
verschwimmt die Kontur beim Freistellen.

## `{EXPRESSION_SENTENCE}` — ein fester, kleiner Satz an Ausdrücken reicht

Kein volles Emotionsset wie bei Sprites nötig — ein Avatar zeigt genau einen
Ausdruck, dauerhaft. Empfehlung: **immer ein offener, freundlicher Ausdruck**,
Kinder wählen ihr Profilbild danach, wie sympathisch es wirkt:

| Variante | `{EXPRESSION_SENTENCE}` |
|---|---|
| freundlich-neutral | „Their expression is calm and warm, a soft easy smile, relaxed shoulders." |
| fröhlich | „They are beaming — a wide open smile, bright lively eyes, chin lifted." |
| verschmitzt | „One eyebrow is raised with a playful half-smile, eyes bright with mischief." |
| mutig | „Their chin is lifted, eyes determined, a confident half-smile." |

---

## Die Fandom-Falle — vor dem ersten Prompt lesen

🟡 **ChatGPT lehnt geschützte Charaktere unvorhersehbar ab** (siehe
[MODEL_SETTINGS.md](MODEL_SETTINGS.md) → „Inhaltsfilter"). Soll ein Avatar
erkennbar eine bestehende Fandom-Figur aus einer Questoria-Welt sein (Luffy,
Ladybug, …), ist ChatGPT die falsche Werkbank — dann lokal mit FLUX.2/Krea 2
arbeiten, wie bei [SPRITES.md](SPRITES.md).

Für die welt-unabhängige Avatar-Auswahl ist das ohnehin meist die bessere
Wahl: Ein Kind wählt sein *eigenes* Profilbild, kein Abbild einer Serienfigur.
**„Andere Charaktere im gleichen Stil" heißt hier deshalb in der Regel:
eigenständige, altersgerechte Figuren** — unterschiedliches Alter, Aussehen,
Kleidung, Frisur, Hautfarbe —, nicht eine Parade bekannter Franchise-Gesichter.
[CARDS.md](CARDS.md) trifft dieselbe Entscheidung aus demselben Grund.

---

## Nachbearbeitung

1. **Freistellen, wenn mit Alphakanal gebraucht** — GPT Image liefert
   grundsätzlich deckende Bilder:
   ```bash
   rembg i avatar_raw.png avatar_freigestellt.png
   ```
   Nicht zwingend: Ein deckender, flacher Einfarb-Hintergrund funktioniert in
   der kreisförmigen Anzeige genauso gut wie Transparenz.
2. Quadratisch beschneiden, exakt 512×512 px, Gesicht mittig.
3. **Das Set nebeneinanderlegen** — auf der Auswahlkachel muss jeder Avatar
   auch neben den anderen fünf sofort unterscheidbar sein, nicht nur einzeln
   betrachtet.

## Abnahme

- Gesicht und Schultern zentriert, nichts Wichtiges in den vier Ecken.
- Exakt 512×512 px, keine Schrift, kein Wasserzeichen.
- Eigene, unverwechselbare Hintergrundfarbe je Avatar im Set.
- Stilsatz identisch mit dem Rest der Welt-Illustrationen (kein Fremdkörper).
- Dateiname `avatar_<slug>.png`, Eintrag in `AVAILABLE_AVATARS`
  (`frontend/src/app/models/auth.types.ts`) ergänzt.
