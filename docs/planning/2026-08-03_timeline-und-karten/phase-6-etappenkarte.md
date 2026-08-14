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

- [x] ~~`ng generate component features/timeline --skip-tests`~~ — Ordner
      existierte bereits als Phase-5-Platzhalter (siehe FINDINGS.md), direkt
      in `timeline.ts`/`.html`/`.scss` gebaut.
- [x] Eingaben aus der Route (Komponenten-Bindung aus Phase 5):
      `themeId = input.required<string>()`, `world = input.required<WorldConfig | null>()`.
      Ist `world` `null` → `qst-content-error` mit
      „Diese Welt konnte nicht geladen werden."
- [x] Zustände als `computed()` über `stageStates()` und den `ProgressService` —
      **keine Rechnerei im Template** (Konvention).
- [x] Aufbau: `qst-hud` (Zurück → Lernstufen-Auswahl, Stufen-Schild, Fortschritt
      aus `worldProgress()`), darunter die Kartenfläche.
- [x] Kartenfläche: `<qst-map-canvas [background]="null" [points]="…" [routes]="…"
      [dimmedPointIds]="…">`, Knoten-IDs sind die `map_id` der Etappen.
      Seekarten-Optik über eine eigene Hülle im Stylesheet dieser Komponente
      (`--color-map-chart-bg` + `repeating-linear-gradient` mit
      `--color-map-chart-line`), nicht in `map-canvas`.
- [x] Pro Etappe ein `<qst-map-point [x] [y] [size]>` mit der Insel darin.
      Form und Seitenverhältnis als gebundene Custom Properties
      (`--stage-shape` aus `shape`, `--stage-aspect` aus `aspect`), im
      Stylesheet dann `border-radius: var(--stage-shape)` und
      `block-size: calc(var(--map-point-size) * var(--stage-aspect))`.
- [x] Zustandsfarben über `[class.timeline__stage--done]` usw. — nie über
      `ngClass`, nie über Inline-Stile.
- [x] Aktuelle Etappe bewegt sich sanft (`eqBob`, Dauer aus
      `--duration-ambient`); verschlossene sind gedimmt.
- [x] „Fortschritt zurücksetzen": Knopf im Panel, natives `<dialog>` mit klarer
      Frage („Alles in dieser Welt auf Anfang setzen? Geschaffte Orte und
      Sterne gehen verloren.") und zwei Knöpfen. Bestätigen ruft
      `ProgressService.resetTheme(themeId)`.
      **Das ist die Erklärungs-Affordance für eine Aktion, die man nicht
      rückgängig machen kann** — kein stiller Sofort-Reset.
- [x] Tastatur: Etappen sind in Content-Reihenfolge erreichbar (native `<a>`,
      DOM-Reihenfolge = `arc_overview.stages[]`), sichtbarer Fokusrahmen,
      Enter öffnet. Gesperrte Etappen sind ein reines `<div>`, kein Fokusziel.

### Doku

- [x] `docs/code-map.md`: `features/timeline/` von Soll auf Ist ziehen.
- [x] `docs/glossary.md`: **Etappenkarte** stand bereits drin, nichts zu tun.

## Report-Back

**Status:** complete.

Gebaut: `timeline.ts`/`.html`/`.scss` ersetzen den Phase-5-Platzhalter komplett.
Zustände (`done`/`current`/`locked`) kommen unverändert aus
`progress.rules.ts`; die Komponente rechnet nichts selbst nach. Klick/Enter auf
eine erreichbare Etappe navigiert zu `theme/:themeId/map/:mapId` (Route existiert
bereits als Platzhalter aus Phase 5); gesperrte Etappen sind kein Fokusziel und
zeigen „Verschlossen" in der Pille. Reset-Dialog ruft
`ProgressService.resetTheme(themeId)`.

Panel und Legende sind als projizierter Inhalt in `qst-map-canvas` platziert
(dessen Host ist bereits `position: relative` mit fester 16:9-Ratio) — kein
zusätzlicher Positionierungs-Wrapper nötig, weicht aber vom Wortlaut „im
Stylesheet dieser Komponente" nur insofern ab, als die Absolut-Positionierung
den bestehenden `map-canvas`-Host als Bezugsrahmen nutzt statt einen eigenen zu
bauen — spart eine verschachtelte Ebene, ändert nichts am Kontrakt.

`cd frontend && npm run build` und `npm run lint` grün. 🟡 Einziger Fund:
`timeline.scss` reißt das Komponenten-Style-Budget (4 kB) um rund 0,7 kB —
Warnung, kein Fehler (Grenze liegt bei 8 kB), Ursache ist schlicht die Zahl der
Zustände (Insel × 3 Zustände, Panel, Legende, Reset-Dialog) in einer
Komponente. Kein Browser-Durchlauf in dieser Phase (private-Profil) — die
Kartengrößen in `cqw` sind laut Plan-Konfidenz-Ausweis noch ungetestet und
gehören in die Smoke-Checkliste am Plan-Ende (Fenster 360px–Vollbild).
