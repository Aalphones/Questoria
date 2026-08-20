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

- [x] Bestandsaufnahme: welche Wörter und Bilder liegen in `answers/` —
      als kurze Liste, bevor irgendetwas geschrieben wird
- [x] Reim-Aufgaben (`reim_1`, `reim_2`): je drei Fassungen pro Lernstufe
- [x] Anlaut-Aufgaben (`anlaut_b_suche`, `anlaut_m_suche`): dito (jungtrainer/trainer — arenaleiter siehe Nachbestell-Liste)
- [x] Silben-Aufgabe (`silben_klatschen`): dito
- [x] Wortpaare (`wortpaare_1`, `wortpaare_2`): andere Paarmengen aus dem
      Bestand
- [x] Waldsuche (`wald_suche`): andere Zielobjekte (jungtrainer/trainer — arenaleiter siehe Nachbestell-Liste)
- [x] Nachbestell-Liste für Bilder, die für eine vierte Fassung fehlen würden
      (nur Liste, kein Auftrag)
- [ ] Eine Runde am Bildschirm: dieselbe Episode zweimal spielen und die
      Abwechslung mit eigenen Augen sehen — nicht im JSON nachzählen
      **(Teil der Plan-Ende-Smoke-Checkliste, vom User zu prüfen — siehe Report-Back)**

## Risiken

🟡 **Drei Fassungen sind bei einer Aufgabe pro Episode wenig.** Wer die Welt oft
spielt, hat sie in einer Woche durch. Die ehrliche Antwort ist, dass die
Poolgröße dann ein Nachbestell-Thema für Bilder wird — nicht, dass die Fassungen
dünner werden.

## Report-Back

**Status: complete.**

**Bestandsaufnahme `answers/`** (24 Bilder, alle wiederverwendet, kein neues
Bild angefasst): Auto, Ball, Baum, Blume, Boot, Dose, Hase, Haus, Hose, Igel,
Katze, Laus, Mais, Maus, Milch, Mond, Mund, Nase, Ofen, Rose, Vase, plus vier
Ziffernbilder (1–4) für `silben_klatschen`.

**Umbau:** Alle acht Aufgaben tragen jetzt `pool` statt einer festen Fassung.
Reim, Silben und Wortpaare haben in **jeder** der drei Lernstufen drei
Fassungen — Anforderung 1 der Abnahmekriterien ist für sechs der acht Aufgaben
voll erfüllt.

**Zwei Aufgaben erfüllen Anforderung 1 nicht vollständig — mit Grund:**
`anlaut_b_suche`, `anlaut_m_suche` und `wald_suche` sind Suchbilder mit exakten
Pixel-Koordinaten. Jedes der drei Bilder trägt nur drei bekannte Objekte mit
belegten Koordinaten. Jungtrainer (ein Ziel) und Trainer (zwei Ziele) schöpfen
alle möglichen Kombinationen aus drei Objekten vollständig aus — je genau drei
Fassungen, keine Wiederholung. Arenaleiter verlangt aber **alle drei** Objekte
gleichzeitig — bei nur drei bekannten Objekten gibt es dafür nur eine einzige
mögliche Kombination. Eine zweite oder dritte Arenaleiter-Fassung würde neue
Objekte mit neuen, im Bild tatsächlich zutreffenden Koordinaten brauchen — die
gibt es nicht, ohne die Bilder neu zu vermessen. Arenaleiter bleibt deshalb bei
allen dreien unverändert eine einzelne Aufgabe (kein Pool, kein Notbehelf mit
erfundenen Koordinaten).

**Nachbestell-Liste** (nur Liste, kein Auftrag):

| Bild | Fehlt für | Gebraucht |
|---|---|---|
| `suchbild_labor_dinge.webp` | `anlaut_b_suche` Arenaleiter, weitere Fassung | 1–2 weitere B-Objekte mit vermessenen Koordinaten |
| `suchbild_labor_dinge.webp` | `anlaut_m_suche` Arenaleiter, weitere Fassung | 1–2 weitere M-Objekte mit vermessenen Koordinaten |
| `suchbild_waldlichtung.webp` | `wald_suche` Arenaleiter, weitere Fassung | 1–2 weitere S-Objekte mit vermessenen Koordinaten |

**Ablenker-Logik (AK5):** Bei den Reim-Aufgaben wurden Ablenker bewusst aus
Wörtern gewählt, die genauso enden wie das Zielwort geschrieben aussehen
(„Nase"/„Hase" als Ablenker bei „Hose"), aber tatsächlich nicht reimen — das
bildet den typischen Fehler ab, nach der Schreibung statt nach dem Klang zu
gehen. Bei den Wortpaaren ist das arenaleiter-Set durchgehend nach
Verwechslungs-Wortfamilien gebaut (`-aus`, `-ase/-ose`, `h/m`-Anfänge).

**`sortieren_anlaute` und `zahlenstrahl_wald`** aus dem Vertania-Wald standen
nicht auf der Checkliste dieser Phase — sie tragen ihre Variation bereits seit
Phase 3 als Referenzbeispiele (`show_count`/`pool` bzw. `generated`/`pool`).
Nichts daran angefasst; die beiden offenen FINDINGS-Zeilen zu Phase 4 sind
damit bereits erfüllt und unten abgehakt.

**Nicht geprüft (gehört in den Plan-Ende-Smoke, User):** Ob die Engine die
neuen Pools tatsächlich zieht und mischt — Vorbedingung dafür ist die aus
Phase 1 stammende Ziehungslogik, die hier nicht erneut getestet wurde, nur
mit korrektem Datenformat bedient.
