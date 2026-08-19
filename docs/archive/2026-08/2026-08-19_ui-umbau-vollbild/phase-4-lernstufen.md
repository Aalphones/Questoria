# Phase 4 — Lernstufen mit Bild

**Rating:** heikel (geht über das Design hinaus und ändert das Content-Schema)

## Kontext — was der Bearbeiter lesen muss

- [README.md](README.md), Abschnitt „Das Design ist die Vorlage"
- `docs/design/HANDOFF.md`, Abschnitt „3. Schwierigkeit (`level`)" — das
  bisherige Zielbild: drei Farbkarten mit Punkten, **ohne** Bilder
- `frontend/src/app/features/main-hub/level-select/`,
  `frontend/src/app/features/main-hub/difficulty-picker/`
- `data/themes/pokemon_lesen/world_config.json` → `difficulty_levels`
- `data/_authoring/JSON_SCHEMA_REFERENCE.md`, Abschnitt 2
- `data/_authoring/ASSET_REQUIREMENTS.md`
- `data/_authoring/image-prompts/` — Vorlagen für die Bilderzeugung

## Was gebaut wird

Der Wunsch aus der Spielrunde: die Lernstufen-Auswahl ist fast leer, nur
Text-Chips. Pro Stufe soll ein Bild stehen, und die Schwierigkeit soll aus dem
Bild hervorgehen — im Pokémon-Thema etwa eine Figur je Stufe.

**Und das muss generisch über alle Welten funktionieren.** Kein `if (themeId ===
'pokemon')`, keine feste Figurenliste in der Engine. Die Engine zeigt ein Bild,
wenn die Welt eines nennt.

## Die Schema-Entscheidung

`difficulty_levels[]` bekommt zwei optionale Felder:

```json
{
  "id": "jungtrainer",
  "label": "Jungtrainer",
  "description": "Leicht — kurze Aufgaben, viele Hinweise.",
  "image": "stufe_jungtrainer.png",
  "image_label": "Ein junger Trainer mit Käscher"
}
```

- `image` — Dateiname unter dem neuen Ordner `levels/` der Welt.
- `image_label` — Beschreibung für Screenreader und für die Bildfläche, wenn die
  Datei fehlt. **Pflicht, sobald `image` gesetzt ist.**
- **Beide optional.** Eine Welt ohne Bilder zeigt weiterhin die Farbkarten aus
  dem Design. Das ist kein Notbehelf, sondern der gültige Zustand für jede alte
  Welt.

Die Punkte (ein, zwei, drei) aus dem Design **bleiben** — die Schwierigkeit darf
nicht allein am Bild hängen. Ein Kind, das die Figuren nicht kennt, muss die
Reihenfolge trotzdem sehen; und Farbe allein trägt einen Zustand nie.

## Abnahmekriterien

1. Nennt eine Lernstufe ein Bild, zeigt die Karte es groß und darüber weiterhin
   Name, Punkte und Beschreibung.
2. Nennt sie keins, sieht der Screen aus wie heute — kein Loch, kein
   Platzhalterrahmen im Normalfall.
3. Fehlt die Datei, obwohl sie genannt ist, erscheint die beschriftete
   Bildfläche (`ui/image-slot/`) mit `image_label`.
4. Die Reihenfolge der Schwierigkeit ist ohne Bildkenntnis erkennbar: Punkte und
   Beschreibung tragen sie weiterhin allein.
5. Drei Bilder für `pokemon_lesen` liegen unter
   `data/themes/pokemon_lesen/levels/`, im Bildstil der Welt.
6. Kein Welt- oder Figurenname steht im Engine-Code.

## Checkliste

- [x] `difficulty_levels[].image` und `.image_label` in
      `models/content.types.ts` und in der Schema-Referenz (Abschnitt 2) —
      dazu `description`, das es entgegen der Planannahme noch nicht gab
- [x] Neue Asset-Kategorie `levels/` in `ASSET_REQUIREMENTS.md`: Abschnitt 9,
      **512 × 768 PNG mit Alpha** (Vorschlag übernommen), Ordnerbaum ergänzt
- [x] `format_assets.py`: Zielmaß für `levels/` ergänzt (`AssetKind.LEVEL`)
- [x] `difficulty-picker` auf Karten umgebaut — Bildfläche additiv, aber die
      Karte selbst musste erst entstehen (siehe Report-Back)
- [x] Drei Bilder für `pokemon_lesen` erzeugt — **Krea 2 statt FLUX.2**, Grund
      im Report-Back; freigestellt, formatiert, angesehen
- [x] `world_config.json` der Pokémon-Welt um die neun neuen Felder ergänzt
      (drei Stufen × `description`, `image`, `image_label`)
- [ ] Am Bildschirm ansehen — und einmal mit absichtlich falschem Dateinamen,
      damit AK 3 wirklich geprüft ist
- [x] `docs/design/README.md`: Abweichung 14 festgehalten
- [x] `LLM_WORLD_BUILDER_PROMPT.md`: neue Welten erzeugen die Felder mit, und
      die drei Bilder stehen als Bestellposten drin
- [x] **ADR-018** geschrieben: Lernstufen-Bilder im Content statt im Code

## Risiken

🟡 **Drei Bilder pro Welt sind eine dauerhafte Zusatzbestellung.** Jede künftige
Welt braucht sie, sonst sieht ihre Lernstufen-Auswahl schlechter aus als die der
Pokémon-Welt. Das ist der Preis der Entscheidung und gehört in die Bestellliste
jeder neuen Welt.

🟡 **„Schwierigkeit soll aus dem Bild hervorgehen" ist nicht prüfbar.** Ob ein
Kind Ash als leichter erkennt als Rocko, weiß niemand. Deshalb bleibt die
Reihenfolge an den Punkten festgemacht (AK 4) — das Bild macht die Wahl schöner,
nicht verständlicher.

## Report-Back

**Status:** complete (Abnahme am Bildschirm offen) · 19.08.2026

### Die Planannahme, die nicht stimmte

Der Plan sagt „additiv, die vorhandene Karte bleibt" und die AK 1 und 4
verlangen „Name, **Punkte und Beschreibung** weiterhin". Es gab weder Karte noch
Punkte noch Beschreibung: `difficulty-picker` rendete drei Textpillen mit
`level.label`, und `DifficultyLevel` trug genau zwei Felder. Das Kartendesign aus
`HANDOFF.md` Abschnitt 3 war nie gebaut worden.

Damit widersprachen sich AK 2 („sieht aus wie heute") und AK 1/4. **Sascha hat
zugunsten von AK 1/4 entschieden:** die Design-Karte wird nachgezogen, AK 2 fällt
in ihrem Wortlaut. Was von AK 2 bleibt und erfüllt ist: Eine Stufe ohne Bild
zeigt kein Loch und keinen Platzhalterrahmen, nur die Karte ohne Bildfläche.

Gebaut ist damit: farbige Karte je Stufe (drei Zweck-Token-Stufen, ab der
vierten neutral), Punkte aus der Position im Array, Beschreibungssatz,
darüber die optionale Bildfläche.

### Krea 2 statt FLUX.2

Der Plan nennt `flux2-bilder` mit Ankerbild. **FLUX.2 kann in dieser
Installation gar nichts ohne Referenzbild erzeugen** (`Flux2 Txt2Img` ist im Kern
ein Bearbeitungs-Paket, der Server lehnt den Auftrag ohne Bild ab) — und für drei
brandneue Trainerfiguren gibt es keinen Anker. Ein fremdes Sprite als Referenz
hätte deren Aussehen in die Figuren gezogen. Also `Krea2 Txt2Img`, das ohne
Vorlage arbeitet; Konsistenzbedarf besteht nicht, weil jede Figur genau einmal
vorkommt. `art_style` der Welt wurde wörtlich übernommen und geprüft.

### Neu im Code

- `qst-image-slot` hat einen `fit`-Eingang bekommen (`cover` bleibt Standard,
  `contain` für freigestellte Motive). Ohne ihn hätte die Kartengrafik ihre
  Ränder verloren.
- Neue Zweck-Tokens für die drei Farbstufen, die Kartenbreite, die Bildhöhe und
  die Punktgröße — die rohe Palette bleibt für Komponenten unsichtbar.

### Unsicherste Stelle

`difficulty-picker.scss:110` — die Punkte färben sich über
`color-mix(in srgb, currentcolor 22%, transparent)` aus der Textfarbe der Karte.
Auf der dritten Stufe steht heller Text auf kräftigem Orange; ob der ausgeschaltete
Punkt dort noch als „leer" lesbar ist statt als schmutziger Fleck, entscheidet das
Auge. Klärender Check: Stufenauswahl öffnen und die dritte Karte ansehen — die
letzte Reihe muss klar drei volle Punkte zeigen, die erste klar zwei leere.
