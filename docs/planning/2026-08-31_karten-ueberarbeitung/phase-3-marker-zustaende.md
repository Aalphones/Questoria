# Phase 3 — Drei Marker-Zustände statt zwei

**Rating:** standard — die Freischaltregeln bleiben unangetastet, es kommt eine
rein darstellende Ableitung dazu.

**Unabhängig von Phase 1 und 2** — kann davor, dazwischen oder danach laufen.

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `frontend/src/app/services/progress.rules.ts` | `nodeStates`, `stageStates`; hier kommt eine Funktion dazu |
| `frontend/src/app/models/game-state.types.ts` | `ProgressState` (Zeile 13) — bleibt unverändert |
| `frontend/src/app/features/map/map.ts` + `.html` + `.scss` | Ortskarte, `stateOf`, `isReachable` |
| `frontend/src/app/features/timeline/timeline.ts` + `.html` + `.scss` | Etappenkarte, gleiche Muster |
| `frontend/src/styles/_tokens.scss` | `--color-progress-*` und `--size-map-point*` |
| `docs/conventions/css.md` · `docs/conventions/angular.md` | BEM, Zweck-Tokens, Signals |

## Der Befund

`ProgressState` kennt genau drei Werte: `done`, `current`, `locked`. Die Karten
zeigen davon zwei Bilder: erreichbar (voll) und gesperrt (graustufig, halb
durchsichtig, aber **mit Namen**, `map.scss` → `&--locked`).

Zwei Folgen davon:

- Ein Kind sieht sofort alle Namen aller Orte, auch der weit entfernten. Es
  gibt nichts zu entdecken.
- Zwischen „noch drei Orte weit weg" und „der Ort direkt als nächstes" ist
  optisch kein Unterschied. Der Sog fehlt.

## Entscheidungen

**E1 — Die Freischaltregeln werden nicht angefasst.** `ProgressState` bleibt
dreiwertig, `nodeStates` und `stageStates` bleiben Zeichen für Zeichen wie sie
sind. Sie entscheiden, was **spielbar** ist. Was **sichtbar** ist, ist eine
zweite, unabhängige Frage — und wird auch als zweite Funktion gebaut.

Grund: `ProgressState` wird außerhalb der Karten benutzt (Ergebnis-Screen,
Erfolge, HUD-Fortschritt). Ein vierter Wert würde dort überall einen neuen Fall
aufmachen, den niemand braucht.

**E2 — Neue reine Funktion `nodeRevealStates` in `progress.rules.ts`.**

```ts
export type RevealState = 'revealed' | 'hinted' | 'unknown';

export function nodeRevealStates(
  orderedIds: readonly string[],
  states: ReadonlyMap<string, ProgressState>,
): Map<string, RevealState>
```

Regel, in der Reihenfolge der Knoten:

- `done` oder `current` → `revealed`
- der **erste** `locked` nach dem letzten `revealed` → `hinted`
- jeder weitere `locked` → `unknown`

Die Reihenfolge ist die aus dem Content (`map.nodes` bzw.
`arc_overview.stages`) — dieselbe, auf der `nodeStates` schon läuft. Damit gibt
es genau einen `hinted`-Knoten pro Karte.

**E3 — Vier Darstellungen, jede an Form erkennbar, nicht nur an Farbe.**

| Zustand | Bild | Name | Bedienbar |
|---|---|---|---|
| erkundet (`revealed` + `done`) | volles Sprite, Häkchen-Plakette in `--color-progress-done-strong` | ja | ja |
| aktuell (`revealed` + `current`) | volles Sprite, größer (`--size-map-point-current`), pulsierender Ring | ja | ja |
| entdeckt (`hinted`) | Sprite mit halber Sättigung, gestrichelter Ring in `--color-progress-current-strong` | ja | nein |
| unbekannt (`unknown`) | **kein Sprite** — eine Scheibe in `--color-map-fog-deep` mit einem Fragezeichen | nein | nein |

Der Wechsel bei `unknown` ist der Kern: bisher wird das echte Ortsbild
graustufig gezeigt und der Name danebengeschrieben. Ab jetzt ist dort nichts
als eine Scheibe mit Fragezeichen. Das Bild ist die Belohnung fürs Näherkommen.

**E4 — `unknown` ist für Hilfstechnik unsichtbar.** Der Knoten bekommt
`aria-hidden="true"` und ist kein `<button>`/`<a>` — er hat keinen Inhalt, den
man vorlesen könnte. `hinted` bleibt vorlesbar und trägt den Namen plus den
Zusatz „noch verschlossen" als sichtbaren Text (nicht nur als `title`).

**E5 — Die Planetenkarte bleibt außen vor.** Welten auf `main-hub` sind nicht
gesperrt — alles Installierte ist spielbar. Ein Nebel-Zustand dort wäre eine
erfundene Sperre. `main-hub.html` ändert sich in dieser Phase nicht.

**Alternative, die verworfen wurde:** `ProgressState` um `'next'` erweitern.
Kürzer im Code der Karten, aber jeder andere Konsument bekommt einen Fall
dazu, den er nur weiterreichen kann. Ein Aufzählungstyp, den vier von fünf
Nutzern nicht auseinanderhalten wollen, ist der falsche Ort für eine
Darstellungsfrage.

## Abnahmekriterien

1. Auf der Ortskarte Alabastia bei frischem Spielstand: der erste Ort ist
   aktuell (groß, pulsierend), der zweite entdeckt (blass, gestrichelter Ring,
   Name lesbar, nicht antippbar), der dritte und alle weiteren sind
   Fragezeichen-Scheiben ohne Namen.
2. Nach dem Abschließen des ersten Orts rutscht die Kette um eins weiter:
   erster erkundet mit Häkchen, zweiter aktuell, dritter entdeckt.
3. Ein Fragezeichen-Knoten lässt sich weder antippen noch mit Tab erreichen
   und wird vom Vorlesemodus nicht angesagt.
4. Ein entdeckter Knoten ist mit Tab erreichbar, wird als „<Name>, noch
   verschlossen" angesagt und tut beim Auslösen nichts.
5. Die vier Zustände sind in Graustufen unterscheidbar (Prüfung: Screenshot in
   Graustufen umwandeln — Häkchen, Ring, gestrichelter Ring und Fragezeichen
   müssen tragen, nicht die Farbe).
6. Dieselben vier Zustände gelten auf der Etappenkarte.
7. Die Planetenkarte sieht unverändert aus.
8. Kontrast von Text auf Plakette und Beschriftung ≥ 4,5:1.

## Checkliste

- [ ] `progress.rules.ts`: `RevealState` und `nodeRevealStates` ergänzen (E2),
      mit Doc-Kommentar in der Tonlage der Nachbarfunktionen.
- [ ] `map.ts`: `revealStateMap` als `computed` über
      `mapEntry()?.nodes.map(n => n.id)` und `nodeStateMap()`; Methode
      `revealOf(nodeId): RevealState` analog zu `stateOf`.
- [ ] `map.html`: die drei Zweige (`episode_ref` + erreichbar / nicht
      erreichbar / Hinweis-Knoten) auf die vier Darstellungen aus E3 umbauen.
      Der `unknown`-Zweig zeichnet einen `<div>` ohne Bild und ohne Namen.
      Der Hinweis-Knoten (`episode_ref === undefined`) zählt als `revealed` —
      er ist laut `progress.rules.ts` immer `done`.
- [ ] `map.scss`: `&__node-image--locked` (Graustufen) durch
      `&__node-image--hinted` (halbe Sättigung + gestrichelter Ring) ersetzen;
      `&__node-unknown` neu (Scheibe, Fragezeichen, `--color-map-fog-deep`);
      Häkchen-Plakette für `done`.
      **Bestehende Regeln ergänzen, nicht ersetzen**, wo sie weiter tragen —
      der Diff soll überwiegend aus Einfügungen bestehen.
- [ ] `timeline.ts` / `timeline.html` / `timeline.scss`: dieselben vier
      Zustände für Etappen. Die Etappe trägt zusätzlich Sterne — bei `hinted`
      leere Sterne zeigen, bei `unknown` gar keine.
- [ ] `_tokens.scss`: falls für gestrichelten Ring und Plakette Werte doppelt
      auftauchen, je ein Zweck-Token ergänzen (`--ring-map-hinted`,
      `--size-map-badge`). Einmalige Werte bleiben in der Komponente, aber als
      Token-Referenz, nie als roher Wert.
- [ ] Graustufen-Gegenprobe aus AK 5 machen und im Report-Back festhalten.
- [ ] `docs/decisions/024-drei-marker-zustaende.md` schreiben — insbesondere
      die Trennung „spielbar" (ProgressState) von „sichtbar" (RevealState).
- [ ] `docs/code-map.md`: Zeilen „Timeline" und „Map" um den Reveal-Zustand
      ergänzen; die Zeile zu `services/progress.rules.ts` in der Tabelle
      „Zentrale Services" um `nodeRevealStates` erweitern.
- [ ] `npm run lint`, `npm run build` im Frontend.

## Report-Back
