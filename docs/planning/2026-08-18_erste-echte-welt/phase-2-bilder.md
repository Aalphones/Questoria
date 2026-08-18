# Phase 2 — Bilder

Rund 25 Dateien. Die Bestellliste steht aus Phase 1, die Prompt-Werkstatt steht
im Repo. Das ist Handarbeit an der Bildmaschine — meine Aufgabe hier ist,
dass die Liste stimmt, die Prompts fertig sind und nichts am falschen Ort landet.

## Kontext (vorher lesen)

- `data/_authoring/ASSET_REQUIREMENTS.md` — Maße, Formate, Ordner, Dateinamen
- `data/_authoring/image-prompts/README.md` — wie die Werkstatt gedacht ist
- `data/_authoring/image-prompts/MODEL_SETTINGS.md` — Modellwahl und Einstellungen
- `data/_authoring/image-prompts/` → `BACKGROUNDS.md`, `SPRITES.md`, `MAPS.md`,
  `CARDS.md`, `ANSWER_IMAGES.md`
- Die Bestellliste aus Phase 1

## Abnahmekriterien

1. Jeder Dateiname, den die JSON-Dateien nennen, existiert — geprüft nicht nach
   Gefühl, sondern indem die Namen aus dem Content gegen den Ordnerinhalt
   abgeglichen werden.
2. Sammelkarten liegen als **630 × 880 px** vor, randlos bis zur Kante. Das ist
   das Maß, an dem später der Druck hängt (63 mm bei 300 dpi).
3. Antwortbilder sind eindeutig erkennbar, auch klein und auch für ein Kind,
   das nicht liest — ein Bild, das man erklären muss, ist als Antwort unbrauchbar.
4. Die Ortskarte trägt drei erkennbare Landmarken an den Stellen, an denen die
   Punkte sitzen; die Prozent-Koordinaten aus Phase 1 werden am fertigen Bild
   nachgezogen, nicht umgekehrt.
5. Kein Bild überschreitet die Größenvorgaben aus `ASSET_REQUIREMENTS.md` —
   die Welt lädt sonst auf einem Tablet spürbar langsam.
6. Alles liegt unter `data/themes/pokemon_lesen/` in den vorgesehenen Ordnern.

## Ungefähre Menge

| Ordner | Was | Stück |
|---|---|---|
| `maps/` | Ortskarte Route 1, Etappenkarten-Hintergrund | 2 |
| `backgrounds/` | Szenenhintergründe der drei Episoden | 3 |
| `sprites/` | Professor Eich, Bisasam, Pikachu, Rattfratz — je 1–2 Ausdrücke | 6 |
| `answers/` | Antwortbilder der Aufgaben (Dinge, Ziffern 1–4, Wort-Bild-Paare) | 25 |
| `cards/` | sechs Sammelkarten | 6 |
| `achievements/` | Erfolgs-Symbole | 3 |

Die Weltkachel für die Planetenkarte kommt dazu (`data/hub/` bzw. wie in
`main_hub.json` benannt).

## Checkliste

- [ ] Bestellliste aus Phase 1 in eine Arbeitsliste umbauen: Datei, Ordner,
      Maß, welche Prompt-Vorlage.
- [ ] Prompts je Gruppe aus den Vorlagen zusammenstellen, mit einheitlicher
      Stilangabe für die ganze Welt — ein Stilbruch zwischen Sprite und
      Hintergrund fällt sofort auf.
- [ ] 🟡 **Sascha-Aufgabe:** Bilder erzeugen. Reihenfolge nach Nutzen:
      erst die drei Sprites und die Ortskarte (ohne sie ist nichts spielbar),
      dann Antwortbilder, zuletzt Sammelkarten und Erfolgs-Symbole.
- [ ] Dateien einsortieren und Namen gegen den Content abgleichen.
- [ ] Fehlt am Ende etwas, das nicht rechtzeitig entsteht: den Platzhalter
      stehen lassen und in `FINDINGS.md` notieren — kein stilles Umbenennen im
      Content, damit die Lücke sichtbar bleibt.

## Report-Back
