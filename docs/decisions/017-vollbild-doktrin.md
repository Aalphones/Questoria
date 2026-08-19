# ADR-017: Die Seite rollt nie — jeder Screen ist Vollbild

**Status:** entschieden · 19.08.2026

## Kontext

Die erste echte Spielrunde brachte sechs Layout-Befunde: Karten füllen den
Bildschirm nicht, ein Rollbalken am Fensterrand, Knöpfe, die erst nach dem
Rollen sichtbar werden. Alle sechs haben dieselbe Wurzel.

Im Frontend gab es **nirgends eine Höhenangabe für die Bühne**: `app.html`
enthielt ausschließlich `<router-outlet />`, `app.scss` war leer, und
`styles.scss` gab weder `html` noch `body` eine Höhe. Jeder Screen wuchs also
mit seinem Inhalt, und der Browser rollte die ganze Seite. Kein Screen war
kaputt — es gab schlicht keine Bühne, auf der sie hätten stehen können.

Zwei Screens hatten sich in Eigenregie beholfen (Anmeldung und Profilauswahl mit
`min-block-size: 100vh`), ein dritter mit `70vh` als Mindesthöhe. Drei
verschiedene Antworten auf dieselbe fehlende Vorgabe.

Für ein Kind auf einem Tablet ist das kein Schönheitsfehler: Wer den
„Weiter"-Knopf erst durch Wischen findet, findet ihn nicht.

## Optionen

1. **Pro Screen `100vh` setzen** — jeder Screen sorgt für seine eigene Höhe.
   Kein zentraler Umbau, die vorhandene Praxis wird nur vereinheitlicht.
2. **Eine Bühne, Screens erben** — die App-Hülle bekommt die einzige
   Bildschirmhöhe der Anwendung, jeder Screen füllt sie mit `100%`.
3. **Die Kopfleiste in die App-Hülle ziehen** — die Hülle wird ein Grid
   `auto 1fr`, oben die zentrale Kopfleiste, darunter der Screen.

## Entscheidung

Option 2, mit der Kopfleiste dort, wo sie war.

Option 1 ist der heutige Zustand mit besserer Laune. Er bleibt falsch, weil
`vh` auf einem Tablet mit ein- und ausfahrender Browserleiste die Höhe eines
Fensters meint, das es in dem Moment nicht gibt — und weil sich niemand darauf
verlassen kann, dass ein neuer Screen daran denkt.

Option 3 wäre auf Dauer die aufgeräumtere Form, verlangt aber, dass Rückweg,
Welttitel, Lernstufe und Fortschritt aus der Route rekonstruiert werden. Die
Kopfleiste nimmt diese vier Angaben heute vom Screen entgegen, und
[hud.ts](../../frontend/src/app/ui/hud/hud.ts) begründet das ausdrücklich: jeder
Screen kennt seinen eigenen Rückweg. Diesen Umbau ausgerechnet in der Änderung
mitzunehmen, die jeden Screen gleichzeitig betrifft, tauscht ein Risiko gegen
zwei. Er bleibt möglich, wenn ein Grund dazukommt.

**Die Regeln:**

- **Genau eine Stelle im Frontend kennt eine Bildschirmhöhe:** das Token
  `--size-stage-block` in `_tokens.scss`. Ein `100vh` oder `100dvh` in einem
  Screen-Stylesheet ist ab sofort ein Fehler.
- **`dvh`, nicht `vh`** — aus dem Tablet-Grund oben.
- **Die App-Hülle** ist `block-size: var(--size-stage-block)` mit
  `overflow: clip`. Die Seite selbst rollt nie mehr.
- **Screens mit Kopfleiste** sind selbst ein Grid `auto minmax(0, 1fr)`:
  Kopfleiste in natürlicher Höhe, Spielfläche über den gesamten Rest.
- **Genau eine Fläche pro Screen darf rollen**, und nur, wenn der Screen es
  will. `overflow: auto`, **niemals `hidden`** — `hidden` schluckt Inhalt still.
- **`clip` ist erlaubt, wo nichts zu rollen ist**, sondern nur Schmuck über den
  Rand ragt (die Deko-Wellen auf Anmeldung und Profilauswahl). Es unterbindet
  auch das versehentliche Rollen per Tastatur, das `hidden` durchlässt.
- **`minmax(0, 1fr)` statt `1fr`** überall dort, wo eine Fläche rollen können
  soll. Ein blankes `1fr` hat eine Mindesthöhe aus seinem Inhalt und drückt die
  Zeile auf, statt zu rollen — der Fehler sieht dann wieder aus wie vorher.

## Konsequenzen

- `--size-stage-min-block: 70vh` entfällt. Der Ort-Screen bekommt seine Höhe
  jetzt von der Bühne.
- Die Kopfleiste braucht `position: sticky` nicht mehr — sie ist eine Grid-Zeile
  und steht von allein still. Ihr `z-index` bleibt: Grid-Elemente stapeln auch
  ohne `position`, und das Profilmenü muss über dem Inhalt liegen.
- **Kein Test prüft das.** Layout wird von keiner Testumgebung gerechnet, „Build
  grün" heißt hier gar nichts. Die Abnahme ist der Blick in den Browser und aufs
  Tablet, Screen für Screen.
- Fällt `overflow: clip` bei einem alten Browser auf die Nase, ist `hidden` der
  Rückfallwert — an der Hülle, wo nichts zu verschlucken ist.
