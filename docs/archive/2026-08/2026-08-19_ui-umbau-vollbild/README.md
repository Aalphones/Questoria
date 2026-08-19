# UI-Umbau — Vollbild, Karten, Erfolgsmoment

**Status:** abgeschlossen und archiviert am 19.08.2026. Alle fünf Phasen
umgesetzt, am Bildschirm abgenommen, drei Abnahmebefunde behoben.

**Vorgezogen:** Der Plan sollte nach Phase 3 der ersten echten Welt starten.
Phase 3 hängt am langsamen Server und ist nicht abgeschlossen — der UI-Umbau
braucht ihn nicht, also läuft er vorher. Was aus Phase 3 noch offen ist, steht
weiterhin in `STATE.md`.

## Warum

Die erste echte Spielrunde am 19.08.2026 hat zwei Engine-Bugs gefunden (beide
gefixt) und sechs Layout-Befunde, die alle dieselbe Wurzel haben. Gesammelt in
[FINDINGS.md des Weltplans](../2026-08-18_erste-echte-welt/FINDINGS.md), Abschnitt
„Aus Phase 3":

1. Planetenkarte füllt den Bildschirm nicht, kein Pfad zwischen den Welten, kein
   waagerechtes Rollen bei mehr Welten.
2. Ortskarte wird angezeigt, aber mit sichtbarem Rollbalken statt Vollbild.
3. Lernstufen-Auswahl ist fast leer — nur Text-Chips, keine Bilder.
4. Bildsuche sitzt zu klein; „Weiter" und „Richtig" liegen erst nach dem Rollen
   im Bild.
5. „Ort geschafft" — Text auf dem Hintergrundbild kaum lesbar, das Konfetti
   liegt über dem Text statt dahinter, zu wenig Feier für einen Erfolgsmoment.
6. Übergreifend: alle Spiel-Screens sollen echtes Vollbild ohne Rollbalken sein.

## Die gemeinsame Ursache — belegt, nicht vermutet

**Es gibt im ganzen Frontend keine Höhenangabe für die Bühne.**
`frontend/src/app/app.html` enthält ausschließlich `<router-outlet />`,
`app.scss` ist leer, und `styles.scss` gibt `body` weder Höhe noch Rollverhalten.
Jeder Screen wächst deshalb mit seinem Inhalt, und der Browser rollt die ganze
Seite. Kein Screen ist „kaputt" — es hat schlicht nie eine Bühne gegeben, auf
der sie stehen könnten.

Das erklärt Befund 1, 2, 4 und 6 in einem Satz und ist der Grund, warum Phase 1
allein steht: **wer vorher an einzelnen Screens dreht, flickt Symptome an einer
Kette, deren oberstes Glied fehlt.**

## Das Design ist die Vorlage, nicht die Erfindung

`docs/design/HANDOFF.md` ist als hochauflösendes Zielbild **verbindlich**. Drei
der Befunde sind deshalb keine Design-Fragen, sondern Abweichungen von einer
bereits getroffenen Entscheidung:

- Planetenkarte: „**Vollflächiger** Hintergrund-Slot" plus SVG-Routenebene mit
  quadratischen Bézierkurven zwischen den Knoten — beides beschrieben, keins
  gebaut.
- Ortskarte und Etappenkarte: Kartenmechanik samt Knoten, Routen und
  Kompassrose ist beschrieben und gebaut, nur nicht im Vollbild.
- Erfolgsmoment: Konfetti als zehn absolut gesetzte Rauten hinter dem Inhalt,
  Statistiken als Karten — beschrieben, aber ohne Kontrastfläche umgesetzt.

Zwei Befunde gehen über das Design hinaus und brauchen eine echte Entscheidung:

- **Lernstufen mit Bild** (Befund 3) steht nicht im Design — dort sind es drei
  Farbkarten mit Punkten. Der Wunsch ist ausdrücklich: Grafiken pro Stufe,
  Schwierigkeit soll aus dem Bild hervorgehen, **generisch über alle Welten**,
  nicht Pokémon-hartkodiert. → Phase 4, mit Schema-Änderung und ADR.
- **Bildsuche** (Befund 4) hat gar keinen Prototyp-Screen — der Eventtyp ist
  jünger als das Design. → Phase 5, freihändig aus vorhandenen Tokens.

Jede Abweichung wird in `docs/design/README.md` unter „Bewusste Abweichungen"
schriftlich festgehalten. Nicht gemerkt, geschrieben.

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Die Bühne — echtes Vollbild](phase-1-buehne.md) | heikel | complete, abgenommen (Nachbesserung nötig, siehe unten) |
| 2 | [Planetenkarte vollflächig mit Pfaden](phase-2-planetenkarte.md) | standard | complete, abgenommen (Nachbesserung nötig, siehe unten) |
| 3 | [Etappen- und Ortskarte im Vollbild](phase-3-karten.md) | standard | complete, abgenommen |
| 4 | [Lernstufen mit Bild](phase-4-lernstufen.md) | heikel | complete, abgenommen |
| 5 | [Aufgabenfläche und Erfolgsmoment](phase-5-aufgabe-und-erfolg.md) | standard | complete, abgenommen (Nachbesserung nötig, siehe unten) |

Phase 1 ist Voraussetzung für 2, 3 und 5. Phase 4 hängt an nichts und könnte
auch vorgezogen werden — sie steht hinten, weil sie als einzige Content-Arbeit
(Bilder) nach sich zieht.

## Kontrakt — die Bühne

Festgelegt **vor** Phase 1, damit die folgenden Phasen sich darauf verlassen
können:

- **Die Seite rollt nie.** Genau eine Fläche pro Screen darf rollen, und zwar
  nur, wenn der Screen es ausdrücklich will (Trophäenhalle, Druckbogen).
- **Höhe der Bühne:** `100dvh`, nicht `100vh` — auf einem Tablet mit
  ein- und ausfahrender Browserleiste ist `vh` schlicht falsch.
- **Aufteilung:** Kopfleiste oben in ihrer natürlichen Höhe, darunter die
  Spielfläche über den gesamten Rest. Als Grid-Zeilen `auto minmax(0, 1fr)`,
  nicht über nachgerechnete Abstände. **Dieses Grid liegt im Screen, nicht in
  der Hülle** (Entscheidung Phase 1, [ADR-017](../../decisions/017-vollbild-doktrin.md)):
  die Hülle gibt nur die Höhe, jeder Screen teilt sie selbst auf und bindet
  seine Kopfleiste weiterhin selbst ein. `minmax(0, 1fr)` statt `1fr`, weil ein
  blankes `1fr` eine Mindesthöhe aus seinem Inhalt hat und die Zeile aufdrückt,
  statt zu rollen.
- **Die Kopfleiste bleibt sichtbar** und wird nicht Teil des rollenden Bereichs.
- **Kein Screen setzt eigene Bildschirmhöhen.** Wer Höhe braucht, bekommt sie
  von der Bühne. Ein `100vh` in einem Screen-Stylesheet ist ab Phase 1 ein
  Fehler.

## Finale Abnahmekriterien

1. Auf keinem Spiel-Screen erscheint ein Rollbalken am Fensterrand — geprüft im
   Browser und auf dem Tablet des Kindes, quer und hoch.
2. Planeten-, Etappen- und Ortskarte füllen die Fläche unter der Kopfleiste; die
   Punkte sitzen weiterhin auf denselben Stellen des Kartenbildes wie vorher.
3. Die Planetenkarte zeigt Wege zwischen den Welten.
4. Die Lernstufen-Auswahl zeigt pro Stufe ein Bild aus dem Welt-Ordner, und eine
   Welt ohne solche Bilder sieht weiterhin ordentlich aus.
5. Bei der Bildsuche liegen Aufgabe, Bild, „Weiter" und Rückmeldung ohne Rollen
   im Bild.
6. Auf „Ort geschafft" ist jeder Text auf einer Fläche mit ausreichendem
   Kontrast lesbar, und das Konfetti liegt dahinter.
7. Jede neue Bewegung hat ihren `prefers-reduced-motion`-Zweig.
8. Alle Änderungen sind im Browser angesehen worden, Screen für Screen gegen
   `docs/design/HANDOFF.md`.

## Summary

Die App hat jetzt eine Bühne: `100dvh` hoch, die Seite selbst rollt nie mehr,
jeder Screen erbt die Höhe und teilt sie mit einem eigenen Grid auf (Kopfleiste
oben, Spielfläche über den Rest). Darauf aufgesetzt: Planeten-, Etappen- und
Ortskarte füllen die Fläche unter der Kopfleiste, die Lernstufen-Auswahl zeigt
drei Karten mit Bild aus dem Content statt drei Textpillen, die Bildsuche nutzt
die volle Höhe, und der „Ort geschafft"-Screen stellt seinen Text auf eine
Kontrastfläche mit dem Konfetti dahinter.

**Die Abnahme am Bildschirm war der eigentliche Wendepunkt.** Sie hat gezeigt,
dass die Bühne aus Phase 1 nie funktioniert hat — und damit, dass vier Phasen
lang auf einem Fundament gebaut wurde, das nur im Build grün aussah. Details in
FINDINGS.md, Abschnitt „Aus der Abnahme am Bildschirm".

## Files touched

Frontend, ausschließlich (kein Backend, kein Content außer den Lernstufen-Bildern
in `data/themes/pokemon_lesen/levels/`):

- **Hülle und Fundament:** `app.html`, `app.scss`, `styles.scss`,
  `styles/_tokens.scss` (Bühnenmaß `--size-stage-block`, `vh` → `dvh` an vier
  Stellen)
- **Screens:** `features/main-hub/` (samt `level-select/`,
  `difficulty-picker/`, `theme-card/`), `features/timeline/`, `features/map/`,
  `features/episode/`, `features/result/`, `features/auth/`,
  `features/profile/`
- **Aufgaben:** `features/events/image-search/`,
  `features/events/multiple-choice/`, `features/events/word-match/`
- **Gemeinsame Bausteine:** `ui/task-card/` (neuer `fill`-Eingang),
  `ui/map-canvas/`, `ui/image-slot/` (neuer `fit`-Eingang), `ui/hud/`
- **Modelle:** `models/content.types.ts` (Lernstufen-Bilder im Schema)

## Commits

| Hash | Was |
|---|---|
| `cddbfd3` | Bühne für echtes Vollbild — die Seite rollt nie mehr (Phase 1) |
| `4e5fc77` | Planetenkarte füllt die Bühne (Phase 2) |
| `b37c7ba` | Etappen- und Ortskarte passen sich im Vollbild ein (Phase 3) |
| `d6a43ea` | Lernstufen als Karten mit Punkten, Text und Bild (Phase 4) |
| `3a79d0e` | Bildsuche füllt die Bühne, Erfolgsmoment lesbar (Phase 5) |
| `05e05f2` | Die Bühne trägt endlich den Screen statt das leere Outlet (Abnahme) |
| `1d59f22` | Bildsuche bekommt ihre Höhe zurück (Abnahme) |

## Deviations from plan

1. **Das waagerechte Rollen der Planetenkarte ist ersatzlos entfallen** (Phase 2,
   AK 6). Es widerspricht der Abnahme-Vorgabe „die Planeten dürfen nicht
   hinauslaufen". Die Karte passt sich jetzt ein wie Etappen- und Ortskarte, der
   frei bleibende Bildschirmrand trägt dieselbe Karte weichgezeichnet als zweite
   Ebene. Festgehalten in `docs/design/README.md` Punkt 12. Folge: Alle Welten
   sind immer gleichzeitig im Bild — was passiert, wenn eines Tages mehr Welten
   darauf stehen, als lesbar nebeneinanderpassen, ist offen.
2. **Das Bühnen-Grid liegt im Screen, nicht in der Hülle** (Entscheidung in
   Phase 1, [ADR-017](../../decisions/017-vollbild-doktrin.md)). Der Plan hatte
   die Aufteilung offen gelassen; die Hülle gibt jetzt nur die Höhe, jeder
   Screen teilt sie selbst auf und bindet seine Kopfleiste weiterhin selbst ein.
3. **Die Lernstufen-Bilder kommen aus dem Content, nicht aus dem Code**
   ([ADR-018](../../decisions/018-lernstufen-bilder-im-content.md)) — mit
   Schema-Änderung, wie in Phase 4 vorgesehen.
4. **`main-hub.scss` liegt 58 Byte über dem 4-kB-Stylesheet-Budget** des Builds.
   Warnung, kein Fehler; Budget bewusst nicht angehoben. Vier weitere
   Stylesheets reißen dasselbe Budget seit Längerem um bis zu 3,8 kB.

## Follow-ups

1. 🟡 **`--size-answer-image: clamp(4rem, 12vh, 8.75rem)`** in `_tokens.scss` ist
   die vierte und letzte `vh`-Stelle im Frontend (Bildgröße der Quiz-Antworten).
   Dieselbe Tablet-Falle wie die drei behobenen: der Wert springt, wenn die
   Browserleiste ein- und ausfährt. Nicht angefasst, weil außerhalb des
   Plan-Umfangs.
2. **Das Stylesheet-Budget passt nicht mehr zum Projekt.** Fünf Dateien liegen
   darüber, eine um fast das Doppelte. Entweder das Budget auf einen ehrlichen
   Wert heben oder die großen Stylesheets aufteilen — die Warnung als
   Dauerzustand macht sie wertlos.
3. **Der Bühnen-Kontrakt hat keinen automatischen Wächter.** „Kein Screen setzt
   eigene Bildschirmhöhen" steht als Regel in ADR-017 und wurde von Hand
   geprüft. Eine Lint-Regel gegen `vh`/`dvh`/`100%`-Höhen außerhalb von
   `_tokens.scss` und `app.scss` würde den nächsten Rückfall fangen.
