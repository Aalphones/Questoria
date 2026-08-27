# Findings

Format: `- [ ] → Phase N: <Erkenntnis>` — während der Umsetzung ergänzen, beim
Abarbeiten der jeweiligen Phase abhaken.

- [x] → Phase 3: Die Klemmung gegen eine **gesperrte** Kachel konnte in Phase 2
  nicht am Bildschirm geprüft werden — alle drei Screens melden bis Phase 3
  pauschal jede Kachel als freigeschaltet (`unlockedTileIds` = alle Kacheln).
  AK 1 und AK 7 der Phase 2 (Anschlag an der Grenze, wachsender Spielraum ohne
  Springen) gehören deshalb mit in die Abnahme von Phase 3.
- [ ] → Phase 5: Die Klemmung wirkt gegen das **umschließende Rechteck** der
  freigeschalteten Kacheln, nicht deren exakte Fläche. Sobald die Route einen
  Knick hat, am Bildschirm prüfen, ob sich in die leere Ecke schieben lässt
  (Konfidenzausweis der README).
- [x] → Phase 6 / Phase 7 Teil A: Die im Plan festgeschriebene Mechanik des
  Freistell-Fixes trifft den belegten Fehler nicht. Gemessen an
  `bisasam_neutral.png`: das ausgefressene Augenweiß hat **Alpha 9–64**, nicht 0
  — es ist durchscheinend, nicht ausgestanzt. Eine Suche nach „durchsichtigen
  Flächen ohne Randverbindung" sieht dort deshalb Figur und findet null Löcher
  (nachgemessen: der Randfüller erreicht alle 818713 durchsichtigen Pixel,
  auch mit bis zu 13 px Nahtzugabe bleibt die Zahl bei 0). Umgesetzt ist
  stattdessen: eingeschlossene Flächen suchen, die **nicht voll deckend** sind
  (Schwelle Alpha ≥ 200). Findet im ganzen Bisasam genau die zwei echten
  Stellen im linken Auge, sonst nichts.
- [x] → Phase 6: Der Nachschärf-Prompt in `Upscale.json` ist auf Fotografie
  geschrieben („raw photograph, full-frame camera, natural sensor grain"). Für
  gezeichnete Karten muss er auf Illustration umgestellt werden, sonst zieht
  die Kachel-Stufe die Karte Richtung Foto. Eine erprobte Fassung liegt in der
  Probe-Datei des Phase-6-Report-Backs. Erledigt: `DETAIL_PROMPT.txt` /
  `DETAIL_PROMPT_SKY.txt` liegen mit Illustrationsstil vor, alle sechs Kacheln
  sind damit erzeugt.
- [x] → Phase 6: Knoten 970 in `Upscale.json` steht auf Bypass (`mode: 4`) —
  der dortige Prompt läuft nicht mit und muss nicht gepflegt werden. Die
  Zielgröße beim Zusammensetzen ist verdrahtet (`GetImageSize` auf die
  SeedVR2-Ausgabe), nicht getippt. Rein informativ, keine offene Handlung.
- [x] → Phase 6: `Upscale Map` ist erprobt. 3072×2048 (12 Kacheln) in rund vier
  Minuten, Kachelgrenzen bei 1:1-Sichtprüfung nahtlos, Stil bleibt Zeichnung.
  Zwei Dinge waren im gelieferten Stand offen und müssen vor jedem Lauf geprüft
  werden: **kein Upscale-Modell ausgewählt** (`978.model_name` leer) und
  **`GetImageSize` misst das Eingangsbild statt des hochskalierten** (Draht ist
  beim Austausch von SeedVR2 auf den Vorgängerknoten zurückgefallen).
- [ ] → Phase 3: Mit zwei Gebietskarten statt einer gibt es einen neuen
  Übergang, den `derivedUnlockedTileIds()` bisher nicht kennt: den Sprung von
  Gebietskarte 1 auf Gebietskarte 2 über die Weltenkarte. Naheliegend, aber
  unbelegt: Vertania City erscheint auf der Weltenkarte, sobald `route_1` durch
  ist. Vor der Umsetzung gegen den echten Code prüfen.
- [ ] → Phase 7: Sprites laufen über denselben `Krea2 Txt2Img` wie die Karten.
  Dort gilt seit dem 26.08.2026 belegt: **eigene Verbotssätze im Prompt holen
  das Verbotene ins Bild** (Krea 2 hat keinen Negativ-Zweig). Beim Formulieren
  der Sprite-Prompts nicht „no background" schreiben, sondern den gewünschten
  Zustand beschreiben. Details in `image-prompts/MAPS.md`.
- [x] → Phase 7: Weg C bringt zwei zusätzliche Sprites, die vorher niemand
  bestellt hatte — Alabastia und Vertania City als Bauwerk-Sprites auf der
  Weltenkarte. Stehen jetzt in Phase 6, nicht vergessen. Erledigt:
  `sprite_alabastia.png` / `sprite_vertania_city.png` liegen unter
  `data/themes/pokemon/maps/`. Verdrahtung in `world_config.json` folgt erst
  mit Nachtrag 5b, dort einsetzen.
