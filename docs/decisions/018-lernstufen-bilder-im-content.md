# ADR-018: Lernstufen-Bilder stehen im Content, nicht im Code

**Status:** entschieden · 19.08.2026

## Kontext

Die Lernstufen-Auswahl war der leerste Screen des Spiels: drei Textpillen auf
weißem Grund, sonst nichts. Aus der ersten echten Spielrunde kam der Wunsch,
jede Stufe mit einem Bild zu zeigen — im Pokémon-Thema etwa eine Figur je Stufe,
damit die Schwierigkeit auch ohne Lesen erkennbar ist.

Der Screen wich ohnehin vom Design ab. `docs/design/HANDOFF.md`, Abschnitt 3,
beschreibt drei Farbkarten mit Punkten und einem Beschreibungssatz je Stufe;
gebaut waren Pillen mit dem Stufennamen. `DifficultyLevel` trug entsprechend nur
`id` und `label` — weder Beschreibung noch Bild hatten im Schema einen Platz.

Die harte Randbedingung: **Questoria ist eine Plattform für beliebige
Fandom-Welten.** Eine Lösung, die Pokémon-Figuren kennt, ist keine Lösung.

## Optionen

1. **Feste Bilder in der Engine** — die Engine bringt drei Stufengrafiken mit
   und zeigt sie überall. Keine Content-Arbeit pro Welt, aber jede Welt trägt
   dann fremde Bilder, und Pokémon-Figuren in einer Piratenwelt sind schlimmer
   als gar kein Bild.
2. **Bild aus dem Stufen-Namen ableiten** — Dateiname aus `id` geslugt,
   `levels/<id>.png`. Kein neues Schemafeld, aber jede Umbenennung einer Stufe
   bricht ein Bild. Dieselbe Falle steckt schon in Abweichung 3 der
   Design-README (Antwortbilder werden benannt, nicht geraten).
3. **Bild im Content benannt, optional** — `difficulty_levels[]` bekommt
   `image` und `image_label`, beide optional. Die Engine zeigt ein Bild, wenn
   die Welt eines nennt.

## Entscheidung

Option 3, zusammen mit dem nachgeholten Kartendesign.

`difficulty_levels[]` trägt ab jetzt drei optionale Felder:

| Feld | Bedeutung |
|---|---|
| `description` | Ein Satz, was die Stufe für das Kind bedeutet |
| `image` | Dateiname unter `levels/` der Welt |
| `image_label` | Beschreibung des Bildes — Pflicht, sobald `image` steht |

Dazu wurde die Stufenauswahl auf die Karten aus dem Design umgebaut: farbige
Karte je Stufe, Punkte, Beschreibungstext — und darüber die optionale
Bildfläche.

## Begründung

**Optional ist der Kern, nicht der Notausgang.** Eine Welt ohne Stufenbilder
zeigt die Farbkarten aus dem Design und sieht damit vollständig aus. Wäre das
Feld Pflicht, könnte keine bestehende Welt ohne Bildbestellung weiterlaufen —
und jede schnelle Testwelt bräuchte drei Grafiken, bevor sie startet.

**Die Punkte bleiben, und sie tragen die Reihenfolge allein.** Ob ein Kind einen
Arenaleiter als schwerer erkennt als einen Jungtrainer, weiß niemand — das ist
nicht prüfbar. Deshalb hängt die Schwierigkeit an den Punkten (ein, zwei, drei)
und am Beschreibungssatz, nie am Bild und nie allein an der Farbe. Das Bild macht
die Wahl schöner, nicht verständlicher.

**`image_label` ist Pflicht, sobald `image` steht.** Es hat zwei Aufgaben in
einer: Es beschreibt das Bild für die Sprachausgabe, und es steht in der
Bildfläche, wenn die Datei fehlt. Ein Bild ohne Beschriftung wäre in beiden
Fällen ein stummes Loch.

**Kein Welt- oder Figurenname im Engine-Code.** Die Engine kennt nur den Ordner
`levels/` und den Dateinamen aus dem Content. Farbstufe und Punktzahl leitet sie
aus der **Position** in `difficulty_levels[]` ab, nicht aus der `id` — eine Welt
mit anderen Stufennamen oder einer anderen Stufenzahl läuft ohne Codeänderung.

## Folgen

- **Drei Bilder pro Welt sind eine dauerhafte Zusatzbestellung.** Sie gehören ab
  jetzt in die Bestellliste jeder neuen Welt, sonst sieht deren Stufenauswahl
  schlechter aus als die der Pokémon-Welt. Format: 512 × 768 PNG mit Alpha,
  siehe `data/_authoring/ASSET_REQUIREMENTS.md`.
- Der Screen weicht bewusst vom HANDOFF ab (Bilder über den Farbkarten) —
  festgehalten in `docs/design/README.md` unter „Bewusste Abweichungen".
- Welten mit mehr als drei Stufen bekommen ab der vierten eine neutrale
  Kartenfläche. Die Punkte zählen weiter korrekt hoch.
