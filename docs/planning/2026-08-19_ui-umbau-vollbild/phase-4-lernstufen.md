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

- [ ] `difficulty_levels[].image` und `.image_label` in
      `models/content.types.ts` und in der Schema-Referenz (Abschnitt 2)
- [ ] Neue Asset-Kategorie `levels/` in `ASSET_REQUIREMENTS.md`: Hochformat wie
      Sprites, aber kleiner — **Maß in dieser Phase festlegen und dort
      eintragen**, Vorschlag 512×768 PNG mit Alpha
- [ ] `format_assets.py`: Zielmaß für `levels/` ergänzen
- [ ] `difficulty-picker` um die Bildfläche erweitern — additiv, die vorhandene
      Karte bleibt, das Bild kommt darüber
- [ ] Drei Bilder für `pokemon_lesen` erzeugen (Skill `flux2-bilder`, Figuren
      mit Ankerbild wo möglich), freistellen, formatieren, ansehen
- [ ] `world_config.json` der Pokémon-Welt um die sechs neuen Felder ergänzen
- [ ] Am Bildschirm ansehen — und einmal mit absichtlich falschem Dateinamen,
      damit AK 3 wirklich geprüft ist
- [ ] `docs/design/README.md`: Abweichung vom HANDOFF festhalten (Bilder statt
      reiner Farbkarten)
- [ ] `LLM_WORLD_BUILDER_PROMPT.md`: neue Welten dürfen die Felder erzeugen
- [ ] **ADR-018** schreiben: Lernstufen-Bilder im Content statt im Code —
      warum optional, warum die Punkte bleiben

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
