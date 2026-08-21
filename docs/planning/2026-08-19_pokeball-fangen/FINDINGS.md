# Findings — Pokéball werfen

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Abgearbeitete Zeilen abhaken, nicht löschen.

- [ ] → Phase 3: Die Trefferbreite misst den **Ziel-Kasten**, nicht das Motiv
      darin. Ein Sprite mit viel Transparenz im Rahmen macht das Spiel spürbar
      großzügiger als eines, das den Rahmen füllt — bei der Auswahl der
      `targets` also möglichst gleich formatige Sprites nehmen, sonst fängt sich
      das eine Pokémon leichter als das andere.
- [ ] → Phase 3: `speed` wird direkt zum Token-Namen
      (`--duration-pokemon-walk-<speed>`). Ein neuer Wert im Content braucht
      also ein neues Token in `_tokens.scss` — er fällt sonst still auf die
      Voreinstellung von 8 s zurück, ohne Fehlermeldung.
