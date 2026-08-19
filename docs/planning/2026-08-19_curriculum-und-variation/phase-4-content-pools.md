# Phase 4 — Variation im Content der Pokémon-Welt

**Rating:** mechanisch (reine JSON-Arbeit auf einem fertigen Kontrakt)

## Kontext — was der Bearbeiter lesen muss

- [README.md](README.md) — Kontrakt-Sektion, Aufbau von `pool`
- [phase-1-variationssystem.md](phase-1-variationssystem.md) — muss fertig sein
- `data/themes/pokemon_lesen/events/` — die acht vorhandenen Aufgaben
- `data/themes/pokemon_lesen/answers/` — die 25 vorhandenen Antwortbilder;
  **daraus** werden die neuen Fassungen gebaut
- `data/_authoring/JSON_SCHEMA_REFERENCE.md`, Abschnitt zu `pool`

## Abnahmekriterien

1. Jede der acht Aufgaben hat pro Lernstufe mindestens **drei** Fassungen im
   Pool.
2. Keine der neuen Fassungen braucht ein neues Bild — alle greifen auf den
   Bestand in `answers/` zu. Reicht der Bestand für eine Aufgabe nicht, bekommt
   sie eine Zeile in einer Nachbestell-Liste statt eines Notbehelfs.
3. Die Aufgabenstellung nimmt in jeder Fassung Bezug auf Figuren oder Ort der
   Episode — keine kontextlosen Übungssätze.
4. Zwei Durchläufe hintereinander zeigen in mindestens sechs der acht Aufgaben
   eine andere Fassung.
5. Die Ablenker sind plausibel: falsche Antworten bilden typische Denkfehler ab
   (Reim fast passend, Anlaut verwechselt), keine offensichtlich absurden.

## Checkliste

- [ ] Bestandsaufnahme: welche Wörter und Bilder liegen in `answers/` —
      als kurze Liste, bevor irgendetwas geschrieben wird
- [ ] Reim-Aufgaben (`reim_1`, `reim_2`): je drei Fassungen pro Lernstufe
- [ ] Anlaut-Aufgaben (`anlaut_b_suche`, `anlaut_m_suche`): dito
- [ ] Silben-Aufgabe (`silben_klatschen`): dito
- [ ] Wortpaare (`wortpaare_1`, `wortpaare_2`): andere Paarmengen aus dem
      Bestand
- [ ] Waldsuche (`wald_suche`): andere Zielobjekte
- [ ] Nachbestell-Liste für Bilder, die für eine vierte Fassung fehlen würden
      (nur Liste, kein Auftrag)
- [ ] Eine Runde am Bildschirm: dieselbe Episode zweimal spielen und die
      Abwechslung mit eigenen Augen sehen — nicht im JSON nachzählen

## Risiken

🟡 **Drei Fassungen sind bei einer Aufgabe pro Episode wenig.** Wer die Welt oft
spielt, hat sie in einer Woche durch. Die ehrliche Antwort ist, dass die
Poolgröße dann ein Nachbestell-Thema für Bilder wird — nicht, dass die Fassungen
dünner werden.

## Report-Back
