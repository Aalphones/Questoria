# Phase 5 — Panels und schmale Karten

**Status:** complete

**Rating:** standard — zwei fast gleiche Panels werden ein Bauteil, ein dritter
Screen bekommt es dazu.

**Setzt voraus:** Phase 4 (der Legenden-Dialog ersetzt die Legende der
Etappenkarte).

## Kontext — was gelesen werden muss

| Datei | Warum |
|---|---|
| `frontend/src/app/features/timeline/timeline.html` (Zeile 47–72) + `.scss` | das bestehende Panel samt Ausklapper |
| `frontend/src/app/features/main-hub/main-hub.html` (Zeile 31–58) + `.scss` | dasselbe Panel, zweite Kopie |
| `frontend/src/app/features/map/map.html` + `.scss` | die Ortskarte, die noch keins hat |
| `frontend/src/app/services/progress.rules.ts` | `worldProgress`, `stageStars` — Zahlen fürs Panel |
| `frontend/src/styles/_breakpoints.scss` | `$map-narrow` |
| `docs/design/HANDOFF.md` → Screens `hub`, `timeline`, `map` | verbindliches Aussehen |
| `docs/conventions/css.md` · `docs/conventions/angular.md` | BEM, Zweck-Tokens, Signals |

## Der Befund

Drei Kartenscreens, drei verschiedene Antworten auf dieselbe Frage „wo bin ich
und was mache ich hier":

- **Planetenkarte:** Panel mit Ausklapper, Titel, Hinweis, „Weiterspielen".
- **Etappenkarte:** dasselbe Panel, eigenständig nachgebaut (Klassenpräfix
  `timeline__` statt `main-hub__`, sonst Zeile für Zeile identisch), dazu eine
  eigene Legende als `<ul>`.
- **Ortskarte:** gar nichts. Nur die HUD oben und eine Kompassrose als Deko.

Das Konzept setzt an dieselbe Stelle ein Panel „AKTUELLES ZIEL" mit Titel,
Zwischenstand und Fortschrittsbalken — auf allen Ebenen dasselbe. Das ist die
Informationshierarchie, die hier fehlt.

**Chesterton's Fence:** Der Ausklapper (`--open`, Burger-Knopf) existiert,
weil das offene Panel auf schmalen Karten die Knoten verdeckt. Diese Funktion
bleibt vollständig erhalten und wandert mit ins gemeinsame Bauteil.

**Screen-Eigentümerschaft:** Dieser Plan übernimmt die Struktur des
Karten-Panels für alle drei Screens. Wer später etwas an einem Kartenpanel
anbaut, baut an `ui/map-panel/`, nicht an einem der Screens.

## Entscheidungen

**E1 — Neues gemeinsames Bauteil `ui/map-panel/`.**
Nach dem Namensschema des Projekts (`ui/<x>/<x>.ts`, Selektor `qst-map-panel`),
wie `ui/task-card/` und `ui/map-canvas/`.

Eingänge:

| Eingang | Typ | Beispiel Ortskarte |
|---|---|---|
| `tag` | `string` | `Pokémon · Sachkunde` |
| `title` | `string` | `Alabastia` |
| `hint` | `string` | `Tippe auf einen Ort, um dorthin zu gehen.` |
| `progressDone` | `number \| null` | `2` |
| `progressTotal` | `number \| null` | `6` |

Inhalt-Projektion (`<ng-content>`) für die Aktion darunter — „Weiterspielen"
auf der Planetenkarte, „Fortschritt zurücksetzen" auf der Etappenkarte, nichts
auf der Ortskarte. Der Ausklapper und sein Aufklappzustand stecken im Bauteil,
nicht in den Screens.

Ist `progressTotal` `null`, wird kein Balken gezeichnet — kein leerer Balken,
der nach kaputt aussieht.

**E2 — Der Fortschrittsbalken zeigt Zahlen, nicht nur Länge.**
Über dem Balken steht `2 von 6 Orten erkundet` als Text. Ein Balken ohne
Bezugsgröße ist ein Rechteck: man sieht, dass er halb voll ist, und weiß nicht,
halb von was. Der Balken bekommt zusätzlich `role="progressbar"` mit
`aria-valuenow` / `aria-valuemin` / `aria-valuemax`.

**E3 — Auf schmalen Karten wird das Panel eine Leiste unten, kein Ausklapper
oben.** Unter `$map-narrow` (42rem Kartenbreite):

- Das Panel sitzt am unteren Rand über die volle Breite, eingeklappt sichtbar
  als **eine** Zeile: Titel links, Zwischenstand rechts, Antippen klappt auf.
- Aufgeklappt nimmt es höchstens 40 % der Kartenhöhe ein und rollt innen
  (`overflow: auto`, nie `hidden` — abgeschnittener Text ist kein Layout).
- `padding-block-end: env(safe-area-inset-bottom)` für Geräte mit
  Bedienbalken, wie im Konzept.

Das ist näher am Konzept (dort ein Bottom Sheet) und besser als der heutige
Ausklapper oben links, der auf einem Handy quer über den ersten Ort fällt.

**E4 — Die Legende der Etappenkarte fliegt raus.** `timeline__legend` wird
ersatzlos entfernt; die Erklärung steht ab Phase 4 im Legenden-Dialog der
Kartenfläche, für alle drei Ebenen gleich. Eine dauerhaft sichtbare Legende auf
genau einem von drei Screens ist keine Erklärung, sondern eine Ungleichheit.

**E5 — Die untere Navigationsleiste aus dem Konzept wird nicht gebaut.**
„Missionen", „Logbuch", „Markt", „Profil" — diese Bereiche gibt es in Questoria
nicht. Navigation läuft über die HUD (`ui/hud/`), die auf allen Spiel-Screens
schon eingebunden ist.

**Alternative, die verworfen wurde:** Panel je Screen lassen und nur die Optik
angleichen. Billiger im Diff, aber die dritte Kopie beim nächsten Kartenscreen
ist dann schon eingeplant — und die zwei bestehenden sind bereits auseinander
gedriftet (die Etappenkarte hat eine Legende, die Planetenkarte nicht).

## Abnahmekriterien

1. Alle drei Kartenebenen zeigen dasselbe Panel: Tag, Titel, Hinweissatz,
   darunter Zwischenstand als Text und Balken.
2. Auf der Ortskarte steht der Zwischenstand der Karte (`x von y Orten
   erkundet`), auf der Etappenkarte der der Welt, auf der Planetenkarte keiner
   (kein Balken, kein leerer Platz).
3. Der Balken hat `role="progressbar"` mit korrekten `aria-value*`.
4. Breite Karte: Panel offen links unten, verdeckt keinen Knoten der
   Beispielkarten.
5. Fenster auf 380 px Breite: Panel ist eine Zeile am unteren Rand,
   aufklappbar, verdeckt eingeklappt nichts außer dem untersten Kartenstreifen.
6. Aufgeklappt auf schmaler Karte lässt sich der Inhalt rollen, es wird nichts
   abgeschnitten.
7. `timeline__legend` existiert nicht mehr, die Erklärung ist über den
   Legenden-Knopf erreichbar.
8. Der Ausklapp-Knopf ist mindestens 44 px hoch und trägt `aria-expanded`.
9. Kein Screen hat mehr eigenes Panel-CSS außer Positionierung.

## Checkliste

- [x] `ui/map-panel/` anlegen: `map-panel.ts`, `.html`, `.scss` (E1). Vorlage
      für Struktur und Klassennamen: `ui/task-card/`.
- [x] Aufklappzustand als `signal<boolean>` im Bauteil, Vorgabe: auf breiter
      Karte offen, auf schmaler zu. Die Unterscheidung macht CSS, nicht
      TypeScript — der Zustand steuert nur das Ausklappen, die Sichtbarkeit
      des Ausklapp-Knopfes hängt am Container-Query.
- [x] `map-panel.scss`: breite Karte = Kasten links unten; Container-Query
      unter `$map-narrow` = Leiste unten (E3). **Der Container-Query-Block
      wird ergänzt, die bestehende Regel nicht ersetzt** — der breite Fall soll
      sich nicht ändern.
- [x] `timeline.html` / `.scss`: Panel durch `<qst-map-panel>` ersetzt,
      „Fortschritt zurücksetzen" als projizierter Inhalt. Panel-CSS entfernt.
- [x] `timeline.html` / `.scss`: `timeline__legend` und ihr CSS entfernt (E4).
- [x] `main-hub.html` / `.scss`: dasselbe, „Weiterspielen" als projizierter
      Inhalt. Das Erfolge-Panel bleibt, wie es ist — es ist kein Kartenpanel.
- [x] `map.html` / `.ts` / `.scss`: `<qst-map-panel>` neu eingehängt.
      Zwischenstand aus `nodeStateMap()` gezählt (`done`-Knoten mit
      `episode_ref` / alle Knoten mit `episode_ref`, neuer `mapProgress`).
- [x] `docs/code-map.md`: `ui/map-panel/` in die Tabelle „Gemeinsame UI"
      aufgenommen; die Zeilen zu Main-Hub, Timeline und Map entsprechend
      gekürzt/ergänzt.
- [x] `docs/design/README.md` → „Bewusste Abweichungen vom Prototyp": Punkt 15
      ergänzt.
- [x] `npm run lint`, `npm run build` im Frontend — beide grün (Build nur mit
      vorbestehenden Budget-Warnungen, keine Fehler; `timeline.scss` lag schon
      vorher 3,14 kB über dem 4-kB-Budget und ist durch diese Phase auf 512 B
      Überschreitung gesunken, `map.scss` liegt wie vorher hauchdünn drüber).

## Abweichung vom Plan

**Kompassrose der Ortskarte verschoben.** Das Panel sitzt jetzt laut AK4 unten
links — genau dort, wo bisher die reine Deko-Kompassrose lag (`map.scss`). Die
Kompassrose ist nach oben links gewandert (dort war seit dem Wechsel des
Panels von oben nach unten wieder Platz); im Plan nicht erwähnt, weil die
Kollision erst beim Zusammenbau auffiel.

## Report-Back

Phase 5 ist umgesetzt: `ui/map-panel/` ersetzt die drei auseinandergedrifteten
Panel-Kopien (zwei fast gleiche, eine fehlende) durch ein Bauteil mit
Fortschrittsbalken (`role="progressbar"`) und einem für alle drei Ebenen
gleichen Ausklapp-/Bottom-Sheet-Verhalten unter 42rem Kartenbreite. Die
Etappenkarten-Legende ist ersatzlos weg — die Erklärung läuft seit Phase 4 über
den Legenden-Dialog der Kartenfläche. `npm run lint` und `npm run build` sind
grün (Budget-Warnungen vorbestehend, siehe Checkliste).

Am Bildschirm noch nicht geprüft — steht in der Plan-README unter „Smoke-Checkliste"
Punkte 5–7.
