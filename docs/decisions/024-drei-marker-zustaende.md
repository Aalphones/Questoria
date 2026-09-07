# ADR-024 — Sichtbar ist nicht dasselbe wie spielbar

**Datum:** 07.09.2026 · **Status:** angenommen

## Kontext

`ProgressState` (`done` / `current` / `locked`) entscheidet, was ein Kind
spielen darf. Die Karten haben diesen Zustand bisher direkt gezeichnet: zwei
Bilder, erreichbar oder gesperrt — gesperrt zeigte das echte Ortsbild
graustufig, aber **mit Namen**. Damit sah ein Kind sofort alle Orte der
ganzen Karte, egal wie weit weg. Zwischen „gleich dran" und „noch drei Orte
entfernt" gab es keinen optischen Unterschied — kein Sog, nichts zu
entdecken.

## Betrachtete Optionen

1. **`ProgressState` um einen vierten Wert erweitern** (z. B. `'next'`).
   Kürzer im Code der Karten, aber `ProgressState` wird außerhalb der Karten
   verwendet (Ergebnis-Screen, Erfolge, HUD-Fortschritt) — dort bekäme jeder
   Konsument einen Fall dazu, den er nur durchreicht, ohne ihn zu brauchen.
2. **Eine zweite, unabhängige Ableitung nur für die Darstellung.** Gewählt.

## Entscheidung

`ProgressState` bleibt exakt wie es ist — dreiwertig, unverändert in
`nodeStates`/`stageStates`. Es beantwortet ausschließlich „ist das spielbar".

Eine neue reine Funktion `nodeRevealStates` in `progress.rules.ts` beantwortet
die zweite, unabhängige Frage „ist das sichtbar":

```ts
export type RevealState = 'revealed' | 'hinted' | 'unknown';
```

In der Content-Reihenfolge der Knoten (dieselbe, auf der `nodeStates` schon
läuft): `done`/`current` → `revealed`; der erste `locked` nach dem letzten
sichtbaren → `hinted`; jeder weitere `locked` → `unknown`. Damit gibt es genau
einen `hinted`-Knoten pro Karte — den Köder direkt hinter dem Horizont.

Vier Darstellungen auf Ortskarte und Etappenkarte, jede an Form erkennbar,
nicht nur an Farbe:

| Zustand | Bild |
|---|---|
| erkundet (`revealed` + `done`) | volles Sprite, Häkchen-Plakette |
| aktuell (`revealed` + `current`) | volles Sprite, größer, pulsierender Ring |
| entdeckt (`hinted`) | Sprite/Form mit halber Sättigung, gestrichelter Ring, Name + „noch verschlossen" sichtbar |
| unbekannt (`unknown`) | kein Sprite — eine Scheibe mit Fragezeichen, kein Name |

Der `unknown`-Knoten ist für Hilfstechnik unsichtbar (`aria-hidden`, kein
`<button>`/`<a>`) — er hat nichts, was man vorlesen könnte. Der `hinted`-Knoten
bleibt ein echtes, per Tab erreichbares `<button>` ohne Klick-Wirkung: „noch
verschlossen" wird angesagt, Auslösen tut nichts.

Die Planetenkarte (`main-hub`) bleibt außen vor — Welten sind dort nie
gesperrt, ein Nebel-Zustand wäre eine erfundene Sperre.

## Konsequenzen

- `map.ts`/`timeline.ts` bekommen je ein `revealStateMap` (computed über
  `nodeRevealStates`) und eine `revealOf`-Methode; die alte
  „erreichbar/gesperrt"-Verzweigung im Template entfällt, weil `revealed`
  jetzt immer `done`/`current` bedeutet (`isReachable` ist damit in beiden
  Screens ungenutzt und wurde entfernt).
- Zwei neue Zweck-Tokens (`--size-map-badge`, `--ring-map-hinted`), weil
  Plakette und gestrichelter Ring auf beiden Karten gebraucht werden.
- Kein anderer Konsument von `ProgressState` (Ergebnis-Screen, Erfolge, HUD)
  ändert sich — die Trennung hält genau an der Stelle, für die sie gedacht war.
