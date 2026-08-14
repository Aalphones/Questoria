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
- [x] Phase 1: **ADR-Nummernkollision.** Der Plan reservierte ADR-004 für die
  Content-Auslieferung und ADR-005 für Phase 4 (Fortschritt lokal im
  Browser) — inzwischen ist ADR-004 durch den Architekturschnitt vom
  14.08.2026 belegt (`004-event-engine.md`). Die neue Content-ADR heißt jetzt
  [ADR-005](../../decisions/005-content-auslieferung-ab-meilenstein-2.md),
  Phase 4 rutscht auf ADR-006 — README, FINDINGS (unten) und
  `phase-4-fortschritt.md` sind angepasst.
- [x] Phase 1: `frontend/proxy.conf.json` zeigte auf `https://questoria.info`,
  zeigt jetzt auf `http://localhost:8000` (`backend\serve.cmd`). Rückweg gegen
  den echten Server: beide Ziele in der Datei wieder auf
  `https://questoria.info` setzen, `secure: true`.
- [ ] → Phase 7: Das temporäre Prüfbild `features/map-demo/` samt Route
  `map-demo` in `app.routes.ts` wird mit der Ortskarte gelöscht — sie zeigt
  dasselbe an echten Daten. Auch die Zeile in `docs/code-map.md` entfernen.
- [ ] → Phase 6/7/8: Die Größe eines Knotens kommt bei `qst-map-point` als
  Custom Property `--map-point-size` an den projizierten Inhalt (Einheit `cqw`).
  Ein Knoten setzt seine Breite also auf `var(--map-point-size)`, nicht auf
  einen eigenen Wert. Ohne `size`-Eingabe ist die Property nicht gesetzt — dann
  braucht der Knoten eine eigene Größe aus einem Token
  (`--size-map-point`, `--size-map-point-current`, `--size-map-chip`).
- [ ] → Meilenstein 4: `ProgressService` liest und schreibt den Browser-Speicher.
  Beim Umstieg auf die Savegame-Schnittstelle wird genau diese Datei getauscht;
  `progress.rules.ts` und alle Screens bleiben unberührt (ADR-006).
