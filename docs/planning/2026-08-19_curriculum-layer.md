# Curriculum Layer — Lernziele vor Fandom

**Status:** geparkt. Startet **nach Meilenstein 5** (Sammelkarten & Druckbogen).
Freigegeben am 19.08.2026.

## Warum

Der Lernziel-Katalog liegt seit dem 19.08.2026 unter
[docs/knowledge/lerninhalte-hessen-klasse-1.md](../knowledge/lerninhalte-hessen-klasse-1.md),
und die acht Aufgaben von `pokemon_lesen` zeigen über `learning_objectives`
darauf. Damit ist die **erste** Welt fachlich anschlussfähig — die nächste ist
es nicht automatisch. Zwei Dinge fehlen dafür, beide zu groß für ein
Nebenbei.

## Phase A — Der Welt-Bauprompt startet am falschen Ende

`LLM_WORLD_BUILDER_PROMPT.md` beginnt beim Franchise und erfindet die Aufgaben
dazu. Der Katalog fordert umgekehrt: Lernziel zuerst, Welt als Kostüm. Das Feld
`Lernziele:` ist inzwischen in der Eingabe vorgesehen, aber der Aufbau des
Prompts ist noch Story-getrieben.

- Prompt umbauen: Lernziel-Liste ist Ausgangspunkt, Episodenstruktur folgt
  daraus — nicht andersherum.
- Entscheiden, ob der Katalog maschinenlesbar wird (`data/curriculum/*.json`)
  oder Markdown bleibt. Der Katalog gehört ins **Git**, nicht nach
  `data/themes/` — der Ordner liegt auf Drive, außerhalb der Versionsgeschichte.
- Abdeckung sichtbar machen: welche Lernziele deckt eine Welt ab, welche fehlen.

⚠️ **Nicht in die Falle laufen**, Aufgaben zu generischen Schablonen zu machen,
die pro Welt nur umlackiert werden. Wiederverwendbar ist die *Spezifikation*
(„zwei Mengen, 1–10 Elemente"), nicht die Aufgabe. Die Bindung an Story und
Figuren ist das Produkt, nicht der Overhead.

## Phase B — Ohne neue Eventtypen keine Mathematik

Gebaut sind vier prüfbare Typen (`multiple_choice`, `text_input`,
`image_search`, `word_match`). Der Katalog braucht für Klasse-1-Mathe
`count`, `order`, `fill`, `sequence` und `path` — keiner davon existiert.

- Priorisieren: welche zwei Typen decken am meisten Lernziele ab?
- Pro Typ: Angular-Komponente, Eintrag in der Typ-Tabelle (Schema 5.0),
  Runde durch die Pflegepflicht in `data/_authoring/README.md`.
- Erst danach ist eine Mathe-Welt Content-Arbeit statt Engine-Arbeit.

## Reihenfolge

A vor B. Der Prompt-Umbau ist billig und zeigt sofort, welche Eventtypen
wirklich fehlen — das ist die Eingabe für die Priorisierung in B.
