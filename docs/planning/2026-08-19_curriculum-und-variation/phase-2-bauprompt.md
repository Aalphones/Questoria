# Phase 2 — Welt-Bauprompt vom Lernziel her

**Rating:** standard (Textarbeit an einer Vorlage, aber die Reihenfolge der
Denkschritte ist die eigentliche Entscheidung)

## Kontext — was der Bearbeiter lesen muss

- `data/_authoring/LLM_WORLD_BUILDER_PROMPT.md` — die Vorlage, die umgebaut wird
- [docs/knowledge/lerninhalte-hessen-klasse-1.md](../../knowledge/lerninhalte-hessen-klasse-1.md)
  — der Katalog, aus dem die Lernziel-IDs kommen
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0.1
  (`learning_objectives`)
- [README.md](README.md) — der Kontrakt, weil der Bauprompt ab hier auch Pools
  erzeugen soll

## Abnahmekriterien

1. Der Bauprompt beginnt bei der **Lernziel-Liste**: erst welche Fähigkeiten
   geübt werden, dann welche Aufgabentypen dazu passen, dann welche Geschichte
   das trägt. Nicht umgekehrt.
2. Er verlangt pro Aufgabe ein `learning_objectives`-Feld mit IDs aus dem
   Katalog — erfundene IDs sind ausdrücklich verboten, fehlende werden im
   Katalog nachgetragen.
3. Er verlangt pro Aufgabe ein **Variationsbudget**: wie viele Fassungen der
   Pool bekommt (Richtwert 3 für Nebenaufgaben, 5+ für Kernaufgaben), oder
   welchen Zahlenraum der Generator bekommt.
4. Er nennt die vier Ebenen aus der Kontrakt-Sektion und die Regel, dass Story
   und Dialog **nicht** variieren.
5. Eine mit dem neuen Prompt erzeugte Probe-Welt (nur JSON, keine Bilder) lässt
   sich gegen die Schema-Referenz prüfen und deckt mindestens fünf Lernziele des
   Katalogs nachweisbar ab.

## Checkliste

- [x] Aufbau des Bauprompts umdrehen: Lernziele → Aufgabentypen → Geschichte →
      Figuren → Episoden → Assets
- [x] Abschnitt „Variationsbudget" mit den Richtwerten aus AK 3 ergänzen
- [x] Warnhinweis aufnehmen: wiederverwendbar ist die **Spezifikation** („zwei
      Mengen, 1–10 Elemente"), nicht die fertige Aufgabe — die Bindung an Story
      und Figuren ist das Produkt
- [x] Entscheiden und im Prompt festhalten, ob der Lernziel-Katalog
      maschinenlesbar wird (`data/curriculum/*.json`) oder Markdown bleibt.
      **Der Katalog gehört ins Git**, nicht nach `data/themes/` — der Ordner
      liegt auf Drive, außerhalb der Versionsgeschichte
- [x] Abdeckung sichtbar machen: kurzer Abschnitt, wie man einer Welt ansieht,
      welche Lernziele sie deckt und welche fehlen
- [x] Probe-Welt erzeugen und gegen die Schema-Referenz prüfen (AK 5), danach
      wegwerfen — sie ist Prüfmittel, kein Content
- [x] `data/_authoring/README.md`: Pflegepflicht-Runde

## Report-Back

- **Denkreihenfolge & Vier-Ebenen-Regel** stehen jetzt als eigener Block vor
  dem Schema-Platzhalter im Prompt — nicht nur als Feldreihenfolge, sondern
  als ausformulierte Regel, die auch ein Modell trifft, das die Felder in
  falscher Reihenfolge liest.
- **Aufgabentypen-Zuordnung** ist ein neues Eingabefeld zwischen Lernzielen
  und Story: das Modell muss jedem Lernziel vor der Story einen gebauten Typ
  zuordnen oder es explizit als „OHNE PASSENDEN TYP" auslisten. Für Phase 3:
  siehe FINDINGS.md — bei Mathe-Lernzielen wird das aktuell fast immer die
  Markierung sein, das ist der Punkt.
- **Katalog-Entscheidung:** bleibt Markdown. `docs/knowledge/…md` ist bereits
  Git-versioniert, eine `data/curriculum/*.json`-Zweitschrift hätte keinen
  Abnehmer im Code (geprüft: nichts parst den Katalog maschinell).
  Begründung steht jetzt in den Nutzungshinweisen des Prompts.
- **Probe-Welt:** 5 ausgelagerte Event-Dateien (multiple_choice ×3 inkl.
  eines `pool`-Beispiels, word_match, image_search) über drei Lernstufen
  gebaut und gegen Abschnitt 5 der Schema-Referenz geprüft — genau vier
  Optionen bei multiple_choice, eindeutige Pool-IDs, eindeutige word_match-
  Paare, Targets in 0–100 %, genau ein `learning_objectives`-Eintrag pro
  Event. Deckt fünf verschiedene, im Katalog vorhandene Lernziel-IDs ab
  (AK 5 erfüllt). Danach gelöscht, nicht committet.
- **Pflegepflicht-Runde:** durchgegangen — Schema, Assets, Bild-Prompts und
  Vertonungs-Skripte sind von dieser Phase nicht betroffen, weil sich kein
  JSON-Feld und kein Eventtyp geändert hat, nur der Autoren-Prompt selbst.
  Keine weiteren Dateien nötig.

## Risiken

🟡 **Ein Prompt, der beim Lernziel beginnt, erzeugt leicht Arbeitsblätter mit
Kostüm.** Die Geschichte darf nicht zur Verzierung verkommen. Gegenmittel im
Prompt: die Aufgabe muss im Wortlaut auf Figuren und Ort der Episode Bezug
nehmen, sonst gilt sie als nicht bestanden.

## Report-Back
