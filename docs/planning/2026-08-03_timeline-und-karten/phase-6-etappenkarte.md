# Phase 6 — Etappenkarte

**Rating:** standard

Die Seekarte der Story-Etappen: welche Etappe ist geschafft, welche ist dran,
welche noch verschlossen.

## Kontext — vorher lesen

- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „4. Etappenkarte"
  — verbindlich, inklusive Legende und Panel
- Phase 3 → `qst-map-canvas`, `qst-map-point`, `qst-image-slot`, die neuen Tokens
- Phase 4 → `stageStates()`, `stageStars()`, `worldProgress()`, `ProgressService`
- Phase 5 → Routen, `qst-hud`, `qst-content-error`
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 2 → `arc_overview`
- [docs/conventions/css.md](../../conventions/css.md) → Critical Rule 3
  (Laufzeitwerte aus dem Content nur über gebundene Custom Properties)

## Akzeptanzkriterien

Prüfbare Struktur (nicht „nach Prototyp"):

1. Kartenfläche im Seitenverhältnis 16:9 mit Seekarten-Optik: Moos-Fläche plus
   Gitternetz aus wiederholten Linien — **kein** Hintergrundbild.
2. Pro Etappe eine organische Inselform (Form aus `shape`, Breite aus `size` in
   Prozent der Kartenbreite, Höhe = Breite × `aspect`), gefüllt nach Zustand:
   geschafft moosgrün, aktuell terrakotta-hell, verschlossen neutral. Umriss
   und Schatten nach Design.
3. In jeder Insel ein runder Chip mit der Etappennummer; darunter eine Pille mit
   dem Etappennamen und drei Rauten als Sterne (gefüllt = erreicht).
4. Gestrichelte Routen zwischen den Etappen aus `arc_overview.routes`; Routen zu
   einer verschlossenen Etappe sind neutral eingefärbt.
5. Panel oben links: Kennzeichen „{Welt} · {Fach}", Überschrift aus
   `arc_overview.title`, ein Hinweissatz, was zu tun ist.
6. Legende unten rechts mit den drei Zuständen — „Jetzt dran", „Geschafft",
   „Verschlossen".
7. Klick/Enter auf eine geschaffte oder aktuelle Etappe öffnet die Ortskarte
   dieser Etappe. Eine verschlossene Etappe ist kein Knopf und zeigt sichtbar
   „Verschlossen".
8. „Fortschritt zurücksetzen" fragt in einem Dialog nach und setzt danach genau
   diese Welt auf Anfang.

## Checkliste

- [ ] `ng generate component features/timeline --skip-tests`
- [ ] Eingaben aus der Route (Komponenten-Bindung aus Phase 5):
      `themeId = input.required<string>()`, `world = input.required<WorldConfig | null>()`.
      Ist `world` `null` → `qst-content-error` mit
      „Diese Welt konnte nicht geladen werden."
- [ ] Zustände als `computed()` über `stageStates()` und den `ProgressService` —
      **keine Rechnerei im Template** (Konvention).
- [ ] Aufbau: `qst-hud` (Zurück → Lernstufen-Auswahl, Stufen-Schild, Fortschritt
      aus `worldProgress()`), darunter die Kartenfläche.
- [ ] Kartenfläche: `<qst-map-canvas [background]="null" [points]="…" [routes]="…"
      [dimmedPointIds]="…">`, Knoten-IDs sind die `map_id` der Etappen.
      Seekarten-Optik über eine eigene Hülle im Stylesheet dieser Komponente
      (`--color-map-chart-bg` + `repeating-linear-gradient` mit
      `--color-map-chart-line`), nicht in `map-canvas`.
- [ ] Pro Etappe ein `<qst-map-point [x] [y] [size]>` mit der Insel darin.
      Form und Seitenverhältnis als gebundene Custom Properties
      (`--stage-shape` aus `shape`, `--stage-aspect` aus `aspect`), im
      Stylesheet dann `border-radius: var(--stage-shape)` und
      `block-size: calc(var(--map-point-size) * var(--stage-aspect))`.
- [ ] Zustandsfarben über `[class.timeline__stage--done]` usw. — nie über
      `ngClass`, nie über Inline-Stile.
- [ ] Aktuelle Etappe bewegt sich sanft (`eqBob`, Dauer aus
      `--duration-ambient`); verschlossene sind gedimmt.
- [ ] „Fortschritt zurücksetzen": Knopf im Panel, natives `<dialog>` mit klarer
      Frage („Alles in dieser Welt auf Anfang setzen? Geschaffte Orte und
      Sterne gehen verloren.") und zwei Knöpfen. Bestätigen ruft
      `ProgressService.resetTheme(themeId)`.
      **Das ist die Erklärungs-Affordance für eine Aktion, die man nicht
      rückgängig machen kann** — kein stiller Sofort-Reset.
- [ ] Tastatur: Etappen sind in Content-Reihenfolge erreichbar, sichtbarer
      Fokusrahmen, Enter öffnet.

### Doku

- [ ] `docs/code-map.md`: `features/timeline/` von Soll auf Ist ziehen.
- [ ] `docs/glossary.md`: **Etappenkarte** aufnehmen, falls noch offen.

## Report-Back
