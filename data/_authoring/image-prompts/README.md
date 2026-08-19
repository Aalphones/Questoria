# Bild-Prompt-Werkstatt

Alle Prompt-Vorlagen für Questoria-Grafik an einer Stelle. Platzhalter in
`{GROSSBUCHSTABEN}` ersetzen, Rest wörtlich übernehmen.

| Datei | Wofür |
|---|---|
| [GENERATING.md](GENERATING.md) | **Bedienung:** wie aus einem Prompt eine Datei wird — lokale ComfyUI-Anbindung, Arbeitsabläufe, bekannte Fallen |
| [MODEL_SETTINGS.md](MODEL_SETTINGS.md) | Welches Modell, welche Einstellungen, welche Auflösung, welche Lizenz |
| [BACKGROUNDS.md](BACKGROUNDS.md) | Szenen-Hintergründe + Stimmungs-Varianten |
| [SPRITES.md](SPRITES.md) | Charakter-Sprites inkl. Emotionsset |
| [MAPS.md](MAPS.md) | Planetenkarte, Etappenkarte, Ortskarte |
| [CARDS.md](CARDS.md) | Sammelkarten — Rahmen und Kartenmotiv |
| [ANSWER_IMAGES.md](ANSWER_IMAGES.md) | Bildantworten für den Vorlesemodus |
| [AVATARS.md](AVATARS.md) | Profil-Avatare — welt-unabhängige Bildauswahl bei der Profilanlage |

Wo die Dateien landen und in welchem Format: [ASSET_REQUIREMENTS.md](../ASSET_REQUIREMENTS.md).

---

## Die wichtigste Änderung gegenüber der alten Flux-Library

**Negativ-Prompts wirken bei unseren lokalen Modellen nicht.** Beide fahren
ohne Guidance (CFG 1.0). Ohne Guidance gibt es keinen zweiten, unbedingten
Durchlauf, gegen den das Modell wegsteuern könnte — die Negativ-Eingabe wird
schlicht nicht verrechnet. Ein `no people, no characters` im Negativfeld ist
eine Notiz an niemanden.

Alles, was früher im Negativ-Prompt stand, steht in diesen Vorlagen jetzt
**positiv formuliert im Hauptprompt**:

| Früher (wirkungslos) | Jetzt |
|---|---|
| `no people, no characters` | „the dock lies deserted, its planks bare" |
| `blurry, low quality` | „crisp, sharply rendered detail throughout" |
| `text, watermark, signage` | „all sign boards and banners are blank surfaces" |
| `cropped, cut off limbs` | „the entire figure fits inside the frame with a margin above the head and below the feet" |

---

## Grundregeln — für alle drei Modelle

Keines der drei hängt noch an CLIP. Die lokalen Modelle nutzen ein echtes
Sprachmodell als Text-Encoder (Qwen3-8B bzw. Qwen3-VL-4B), GPT Image ist
selbst eins. Folge überall: **Man schreibt Sätze, keine Tag-Listen.**

1. **Sätze statt Stichwortwolke.** Kein `harbor, sunset, boats, 8k, masterpiece`.
2. **Material statt Oberbegriff.** „verwittertes Eichenholz mit ausgewaschener
   Maserung" schlägt „Holz" deutlich.
3. **Licht wie ein Fotograf beschreiben:** Quelle, Richtung, Charakter,
   Farbtemperatur.
4. **Szene in Ebenen:** Vorder-, Mittel-, Hintergrund getrennt beschreiben.
5. **Räumliche Beziehungen benennen** („links im Vordergrund kniend"), statt
   sie dem Modell zu überlassen.
6. **Attribute beim Subjekt gruppieren** — alles zu einer Figur in einem Zug,
   nicht über den Text verstreut.
7. **Qualitäts-Füllwörter weglassen.** `masterpiece`, `8k`, `award winning`
   bringen bei satztrainierten Modellen nichts.
8. **Keine Negativ-Prompts** (siehe oben). Bei GPT Image gibt es das Feld gar
   nicht erst.
9. **Nichts dazuerfinden.** Kleidung, Requisiten, Farben, die nicht gefordert
   sind, verschieben das Ergebnis. Bei detaillierten Prompts polieren statt
   aufblähen.
10. **Text im Bild:** exakte Wortfolge in `"Anführungszeichen"`, dazu
    Schriftcharakter, Farbe und Platzierung. Für Questoria fast immer
    irrelevant — Beschriftung macht die Engine, nicht das Bild.

## Wo sich die Modelle unterscheiden — die Falle

**Die Prompt-Form ist nicht dieselbe.** Wer einen Prompt 1:1 vom lokalen
Modell zu ChatGPT kopiert, arbeitet gegen die Empfehlung des Herstellers.

| | FLUX.2 klein · Krea 2 | GPT Image 2 |
|---|---|---|
| Form | **ein zusammenhängender Prosa-Absatz** | **gegliederte Abschnitte** mit Zeilenumbrüchen |
| Reihenfolge | Subjekt → Handlung → Szene → Stil → Licht → Kamera | Szene → Subjekt → Details → Constraints |
| Länge | 60–200 Wörter, unter ~40 verschenkt | kein Limit; klein anfangen, in Einzelschritten nachschärfen |
| Iteration | neuer Lauf, Seed oder Referenzbild | Dialog, pro Runde **genau eine** Änderung |

Deshalb steht in jeder Rezept-Datei **beides**: die Absatz-Fassung für lokal,
die gegliederte Fassung für GPT Image. Der Inhalt ist identisch, nur die Form
unterscheidet sich.

**Zwei weitere Regeln nur für lokal:**

- **Gewichtungs-Syntax `(wort:1.3)` nicht verwenden.** Bei Krea 2 färbt sie auf
  die gesamte Konditionierung ab und zerlegt ab ~1.2 das Bild. Betonung
  entsteht durch Satzstellung und Detailtiefe, nicht durch Klammern.
- **Das Wort „enhance" meiden** — erzeugt bei FLUX.2 Upscaling-Artefakte.

**Nicht übertragbar:** Steps, CFG und Auflösungsbänder. Die stehen pro Modell
in [MODEL_SETTINGS.md](MODEL_SETTINGS.md) und sind keine Geschmacksfrage — eine
falsche Step-Zahl zerstört das Bild, statt es zu verbessern. Ebenso wenig
übertragbar: Tag-Prompts für SDXL/Illustrious/Pony. Andere Architektur, andere
Regeln, nicht aus alten Anime-Prompt-Sammlungen kopieren.

🟡 Die Vorlagen sind auf Englisch geschrieben. Alle drei Modelle sind
multilingual, deutsche Prompts funktionieren also grundsätzlich — ob mit
gleicher Qualität, ist nicht geprüft.

---

## Konsistenz-Anker pro Welt

Damit nicht jede Generierung einen neuen Stil erfindet, wird pro Welt EINMAL
ein Stilsatz festgelegt und in **jeden** Prompt derselben Welt wörtlich
kopiert:

```
{ART_STYLE} = "anime-inspired painterly illustration with soft cel-shading,
clean confident linework, and a warm saturated colour palette"
```

Der Anker gehört als Zeile in die `world_config.json`-Notizen der Welt, damit
er nicht in irgendeinem Chatverlauf verloren geht. Abweichungen im Artstyle
zwischen Episoden sind kein kreativer Mut, sondern ein Continuity-Fehler, den
Kinder sofort sehen.

---

## Bühnenplätze freihalten — die Regel, die keiner auf dem Schirm hat

Die Engine setzt Charakter-Sprites auf **zwei feste Plätze, `left` und
`right`**, unten im Bild. Ein Hintergrund mit einem prächtigen Detail genau
dort ist verschenkt — die Figur steht davor.

Deshalb steht in jedem Hintergrund- und Kartenprompt ein Satz wie:

> *„The lower left and lower right thirds of the frame stay visually calm and
> uncluttered — open ground, water or plain wall — so that foreground figures
> can be placed there later."*

Das ist kein Stil-Wunsch, sondern eine Engine-Vorgabe.

---

## Rechtliches — einmal lesen, dann wissen

🟡 **Zwei Fallstricke, die sich widersprechen könnten:**

1. **FLUX.2 klein 9B steht unter einer Nicht-kommerziell-Lizenz.** Für ein
   privates Solo-Projekt unkritisch. Sollte Questoria je Geld verdienen, sind
   alle damit erzeugten Assets ein Problem — dann rechtzeitig auf Krea 2
   umstellen und neu generieren, nicht nachträglich diskutieren.
2. **Fandom-Figuren sind geschützt.** Sprites von Luffy oder Ladybug sind für
   den privaten Gebrauch eine Sache, für eine veröffentlichte Plattform eine
   andere. [CARDS.md](CARDS.md) verlangt bewusst eigenständige Motive statt
   Originalfiguren. Diese Trennlinie ist noch nicht projektweit entschieden.
