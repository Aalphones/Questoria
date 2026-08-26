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
- [ ] → Phase 6: Der Nachschärf-Prompt in `Upscale.json` ist auf Fotografie
  geschrieben („raw photograph, full-frame camera, natural sensor grain"). Für
  gezeichnete Karten muss er auf Illustration umgestellt werden, sonst zieht
  die Kachel-Stufe die Karte Richtung Foto. Eine erprobte Fassung liegt in der
  Probe-Datei des Phase-6-Report-Backs.
- [ ] → Phase 6: Knoten 970 in `Upscale.json` steht auf Bypass (`mode: 4`) —
  der dortige Prompt läuft nicht mit und muss nicht gepflegt werden. Die
  Zielgröße beim Zusammensetzen ist verdrahtet (`GetImageSize` auf die
  SeedVR2-Ausgabe), nicht getippt.
