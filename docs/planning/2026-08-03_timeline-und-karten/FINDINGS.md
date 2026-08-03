# Findings — Timeline & Karten

Erkenntnisse während der Umsetzung, die eine spätere Phase oder einen späteren
Meilenstein betreffen. Format:

- [ ] → Phase N: <Erkenntnis>

---

- [ ] → Phase 3/7: Der Prototyp streut Deko-Inseln über die Ortskarte
  (`islands[]`), das Content-Schema kennt sie nicht. Dieser Plan verzichtet
  bewusst darauf. Wirken die Karten in der Umsetzung zu leer, gehört das Feld
  erst in `JSON_SCHEMA_REFERENCE.md` und dann in den Code — nicht umgekehrt.
- [ ] → Meilenstein 3: Die Abstands- und Schriftgrößen-Tokens stehen in
  krummen Pixelwerten (4.4px, 15px …) und ignorieren damit die
  Schriftgrößen-Einstellung des Browsers. Übernommen aus dem Plan zu
  Meilenstein 1; für eine Lern-App eine echte Einschränkung. Umstellung auf
  `rem` ändert nur `_tokens.scss`, keine Komponente.
- [ ] → Meilenstein 4: `ProgressService` liest und schreibt den Browser-Speicher.
  Beim Umstieg auf die Savegame-Schnittstelle wird genau diese Datei getauscht;
  `progress.rules.ts` und alle Screens bleiben unberührt (ADR-005).
