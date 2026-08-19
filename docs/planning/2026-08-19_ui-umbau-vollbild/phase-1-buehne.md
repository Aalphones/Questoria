# Phase 1 — Die Bühne: echtes Vollbild

**Rating:** heikel (eine Änderung, die jeden Screen der App gleichzeitig
betrifft)

## Kontext — was der Bearbeiter lesen muss

- [README.md](README.md), besonders die Kontrakt-Sektion
- `frontend/src/app/app.html`, `app.scss`, `frontend/src/styles.scss` — der
  heutige Zustand: keine Höhenangabe, nirgends
- `frontend/src/app/ui/hud/hud.scss` — die Kopfleiste, heute `position: sticky`
- `frontend/src/styles/_tokens.scss` — hier entsteht das neue Bühnen-Token
- `docs/design/HANDOFF.md`, Abschnitt „0. HUD" — die Kopfleiste ist im Design
  „sticky oben" auf allen Screens außer der Profilauswahl
- `docs/conventions/` sowie die CSS-Doktrin: semantische Klassen, Zweck-Tokens,
  keine Utility-Klassen, `@layer`-Reihenfolge statt Spezifitätsgewicht

## Pflicht vor dem ersten Edit

**Die Höhen-, Überlauf- und Positionskette einmal vollständig aufschreiben** —
von `html`/`body` über die App-Hülle und die Kopfleiste bis in einen konkreten
Screen (nimm `features/map/`, der hat den sichtbaren Rollbalken). Jede Ebene
bekommt entweder den gefundenen Wert oder ausdrücklich „nichts gesetzt". Die
Liste steht im Report-Back, bevor die erste Zeile CSS geändert wird.

Grund: schichtweises Probieren findet genau die Ursache nicht, die eine Ebene
höher sitzt — und hier fehlt die oberste Ebene komplett. Ohne die Liste wird
aus einer Ursache eine Reihe plausibler Einzelfixes, von denen keiner wirkt.

## Abnahmekriterien

1. `html` und `body` haben `block-size: 100%`, die App-Hülle `block-size:
   100dvh` und `overflow: clip` — die Seite selbst rollt nie mehr.
2. Die App-Hülle ist ein Grid mit den Zeilen `auto 1fr`: Kopfleiste oben in
   natürlicher Höhe, Spielfläche darunter über den gesamten Rest.
3. Ein neues Zweck-Token `--size-stage-block` (oder gleichwertig) hält die Höhe
   der Spielfläche, sodass Screens sie benutzen können, ohne selbst zu rechnen.
4. Die Kopfleiste braucht `position: sticky` nicht mehr — sie ist eine
   Grid-Zeile. Der alte Wert wird entfernt, nicht überschrieben.
5. Jeder bestehende Screen läuft weiter: Anmeldung, Profilauswahl,
   Planetenkarte, Lernstufen, Etappenkarte, Ortskarte, alle sechs Eventtypen,
   Ergebnis. Keiner zeigt abgeschnittenen Inhalt.
6. Wo Inhalt nicht in die Fläche passt, rollt **die Fläche** (`overflow: auto`),
   nicht die Seite — und niemals `overflow: hidden`, das Inhalt still
   verschluckt.
7. Auf dem Tablet des Kindes ist quer **und** hoch kein Rollbalken am
   Fensterrand sichtbar.

## Checkliste

- [ ] Kette aufschreiben (siehe „Pflicht vor dem ersten Edit")
- [ ] `styles.scss`: `html, body { block-size: 100%; }` in `@layer base`
- [ ] App-Hülle bauen: `app.html` bekommt ein `<main>` als Bühne um den
      `<router-outlet />`, `app.scss` das Grid `auto 1fr` mit `100dvh`
- [ ] Die Kopfleiste wandert in die App-Hülle, statt von jedem Screen einzeln
      eingebunden zu werden — **prüfen**, welche Screens sie heute selbst
      einbinden (`ui/hud/` in den Templates suchen) und dort entfernen. Auf
      `login` und `profiles` bleibt sie unsichtbar
- [ ] Zweck-Token für die Bühnenhöhe in `_tokens.scss`
- [ ] `hud.scss`: `position: sticky` entfernen
- [ ] Alle Screens einmal im Browser durchklicken (AK 5) — Liste im Report-Back,
      welcher Screen wie reagiert hat
- [ ] Screens, die nach dem Umbau überlaufen, bekommen **eine** rollende Fläche
      mit `overflow: auto` — kein `hidden`
- [ ] `docs/design/README.md`: neue Zeile unter „Bewusste Abweichungen" zur
      Bühne, falls die Umsetzung vom HANDOFF abweicht
- [ ] `docs/code-map.md`: Zeile zur App-Hülle
- [ ] **ADR-017** schreiben: Vollbild-Doktrin — `100dvh` statt `100vh`, Grid
      `auto 1fr`, genau eine rollende Fläche pro Screen, kein `100vh` in
      Screen-Stylesheets

## Risiken

🔴 **Das ist die eine Änderung, die alles gleichzeitig kaputtmachen kann.** Sie
wird deshalb **additiv** gebaut, wo es geht: die Bühne kommt neu dazu, bestehende
Screen-Regeln werden nicht ersetzt, solange sie nicht nachweislich stören. Wo
doch etwas weichen muss (das `sticky` der Kopfleiste), steht es einzeln in der
Checkliste.

🟡 **Kein Test kann das prüfen.** Layout wird nicht von einer Testumgebung
gerechnet. „Build grün" heißt hier gar nichts — die Abnahme ist der Blick in den
Browser und aufs Tablet, Screen für Screen.

🟡 **`overflow: clip` statt `hidden` an der Hülle** ist Absicht: `clip`
unterbindet auch das versehentliche Rollen per Tastatur oder Fokussprung, das
`hidden` durchlässt. Fällt bei einem alten Browser auf die Nase, ist `hidden`
der Rückfallwert.

## Report-Back
