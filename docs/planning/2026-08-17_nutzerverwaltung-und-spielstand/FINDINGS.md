# Findings — Nutzerverwaltung & Spielstand

Erkenntnisse aus der Umsetzung, die eine spätere Phase oder einen späteren
Meilenstein betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, ein bis drei Zeilen>
- [ ] → Meilenstein N: <Erkenntnis>
```

Abgehakt wird, sobald die Ziel-Phase die Erkenntnis aufgenommen hat.

## Offen

- [ ] → Meilenstein 5: Kartenbesitz braucht eine eigene Ablage. Der
  Spielstand-Zustand (Phase 5) hat dafür bewusst **kein** Feld — beim Bau der
  Sammelkarten entscheiden, ob `state.cards` dazukommt oder eine eigene
  Tabelle. `EpisodeRun.pendingCardId` aus Meilenstein 3 ist der Haken.
- [ ] → Meilenstein 6: Die PHP-Weiche vor den Content-Dateien (Phase 2) liegt
  genau dort, wo der Offline-Cache ansetzen wird. Beim Bau prüfen, ob sie
  Caching-Köpfe setzen muss, damit der Browser Bilder nicht bei jedem Aufruf
  neu zieht.
