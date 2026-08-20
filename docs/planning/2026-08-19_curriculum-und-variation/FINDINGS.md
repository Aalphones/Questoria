# Findings — Curriculum & Variation

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Abgearbeitete Zeilen abhaken, nicht löschen.

- [x] → Phase 3: Der umgebaute Bauprompt ordnet jedem Lernziel zuerst einen gebauten Aufgabentyp zu und markiert Mathe-Lernziele ohne passenden Typ explizit als „OHNE PASSENDEN TYP: <id>" statt eine Aufgabe zu erzwingen — bis Phase 3 `count`/`order`/`fill`/`sequence`/`path` baut, wird jede Mathe-Welt aus diesem Prompt fast nur solche Markierungen erzeugen. Das ist gewollt, kein Bug im Prompt.
  → Eingearbeitet: Der Prompt bekommt die Typ-Tabelle als Ganzes eingefügt und kennt `sorting` und `number_line` damit ohne Änderung. Die Markierungen werden seltener, verschwinden aber nicht — `ordering`, `fill_gap` und `pattern` fehlen weiterhin.

- [ ] → Phase 4: `sorting` variiert am billigsten über `show_count` (Vorrat), nicht über `pool` — mehr Gegenstände hinterlegen ist eine Zeile, eine zweite Pool-Fassung ist eine ganze Aufgabe. Beim Aufbohren der Pokémon-Welt zuerst diesen Weg nehmen.
- [ ] → Phase 4: `number_line` variiert über `generated` mit `"target": "{ziel}"` — eine Vorlage erzeugt beliebig viele Fassungen. Für Aufgaben, deren Frage nicht bloß die Zielzahl nennt (Vorgänger, Nachfolger, Mitte), braucht es weiterhin `pool`, weil `generated` keine abgeleiteten Werte kann.
