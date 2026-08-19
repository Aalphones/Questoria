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

- [x] Kette aufschreiben (siehe „Pflicht vor dem ersten Edit") — steht im
      Report-Back
- [x] `styles.scss`: `html, body { block-size: 100%; }` in `@layer base`
- [x] App-Hülle bauen: `app.html` bekommt ein `<main class="stage">` um den
      `<router-outlet />`, `app.scss` die Höhe `100dvh` mit `overflow: clip`
- [x] ~~Die Kopfleiste wandert in die App-Hülle~~ — **verworfen, Entscheidung
      vom 19.08.2026.** Die Kopfleiste nimmt vier Eingaben pro Screen entgegen
      (Rückweg, Welttitel, Lernstufe, Fortschritt), und `hud.ts` begründet
      ausdrücklich, warum: jeder Screen kennt seinen eigenen Rückweg. Der Umzug
      hieße, all das aus der Route zu rekonstruieren — genau in der Änderung,
      die jeden Screen gleichzeitig betrifft. Stattdessen liegt das Grid
      `auto minmax(0, 1fr)` **im Screen**: die Hülle gibt nur die Höhe. Für den
      Nutzer identisch, aber additiv. Festgehalten in ADR-017 und in
      `docs/design/README.md` unter „Bewusste Abweichungen", Punkt 11
- [x] Zweck-Token für die Bühnenhöhe in `_tokens.scss` — `--size-stage-block`;
      `--size-stage-min-block: 70vh` ist dabei entfallen
- [x] `hud.scss`: `position: sticky` entfernen (`z-index: 40` bleibt — Grid-
      Elemente stapeln auch ohne `position`, das Profilmenü braucht es)
- [ ] Alle Screens einmal im Browser durchklicken (AK 5) — **offen, liegt bei
      Sascha.** Prüfliste im Report-Back
- [x] Screens, die nach dem Umbau überlaufen, bekommen **eine** rollende Fläche
      mit `overflow: auto` — kein `hidden`. Anmeldung und Profilauswahl haben
      ihr `overflow: hidden` behalten, aber umgehängt: es hält die Deko-Wellen
      im Rahmen (negative `inset`-Werte), gerollt wird eine Ebene höher am Host
- [x] `docs/design/README.md`: Punkt 11 unter „Bewusste Abweichungen"
- [x] `docs/code-map.md`: Zeile zur App-Hülle
- [x] **ADR-017** geschrieben:
      [017-vollbild-doktrin.md](../../decisions/017-vollbild-doktrin.md)

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

**Status:** Code fertig, Build und Lint grün. **Abnahme am Bildschirm offen** —
sie ist die eigentliche Prüfung und liegt bei Sascha.

### Die Kette vor dem ersten Edit (Ist-Zustand am 19.08.2026)

| Ebene | Höhe | Overflow | Position |
|---|---|---|---|
| `html` | nichts gesetzt | nichts | — |
| `body` (`styles.scss`) | nichts gesetzt | nichts | — |
| `qst-root` / `app.scss` | Datei war leer | — | — |
| `app.html` | nur `<router-outlet />`, kein Element | — | — |
| Kopfleiste (`hud.scss`) | natürlich | — | `sticky`, `z-index: 40` |
| `map`, `timeline`, `main-hub`, `level-select` | `display: block`, keine Höhe | nichts | — |
| deren `.map` / `.timeline` / … | Inhalt + Padding, `max-inline-size: 90rem` | nichts | — |
| `episode` | `min-block-size: var(--size-stage-min-block)` = **70vh** | — | `relative` |
| `login` | **`min-block-size: 100vh`**, doppelt (Host + `.login`) | `hidden` | `relative` |
| `profile` | **`min-block-size: 100vh`**, doppelt | `hidden` | `relative` |

Die Planannahme „keine Höhenangabe, nirgends" stimmt für die Bühne, nicht für
die Screens: **drei** Screens setzten bereits eigene Bildschirmhöhen, in zwei
verschiedenen Werten. Alle drei sind jetzt weg.

### Was gebaut wurde

| Datei | Änderung |
|---|---|
| `styles.scss` | `html, body { block-size: 100% }` — Anfang der Höhenkette |
| `styles/_tokens.scss` | `--size-stage-block: 100dvh` neu, `--size-stage-min-block: 70vh` entfernt |
| `app.html` | `<main class="stage">` um den `<router-outlet />` |
| `app.scss` | Host: `100dvh` + `overflow: clip`; `.stage`: Grid mit `minmax(0, 1fr)` |
| `map.scss`, `timeline.scss`, `level-select.scss`, `episode.scss` | Host wird Grid `auto minmax(0, 1fr)`, `block-size: 100%`; Inhaltsfläche `overflow: auto` |
| `main-hub.scss` | Host wird Grid `minmax(0, 1fr)` (kein HUD), `.main-hub` rollt selbst |
| `login.scss`, `profile.scss` | `100vh` raus; Host wird die rollende Fläche, `.login`/`.profile-picker` behalten `clip` für die Deko |
| `hud.scss` | `position: sticky` entfernt, `z-index` bleibt |

### Chesterton's Fence

Das `overflow: hidden` bei Anmeldung und Profilauswahl war **kein** Versehen: die
Deko-Wellen unten sitzen mit negativen Abständen (`inset-block-end: -6rem`,
`inset-inline-start: -12%`) bewusst über dem Rand. Ohne die Klammer hätte jede
Anmeldeseite waagerecht gerollt. Es ist deshalb nicht gelöscht, sondern
umgehängt: die Deko-Klammer bleibt (als `clip`), das Rollen zieht eine Ebene
höher an den Host, wo nichts zu verschlucken ist.

### Prüfliste für den Bildschirm (AK 5 und 7)

Auf jedem Punkt zählt nur eins: **erscheint rechts oder unten am Fensterrand ein
Rollbalken?** Wenn ja, welcher Screen.

1. Anmeldung — Formular mittig, Wellen unten am Rand abgeschnitten wie vorher
2. Profilauswahl — dito; mit mehreren Profilen prüfen, ob die Kachelreihe rollt
   (soll: die Fläche rollt, nicht die Seite)
3. Planetenkarte — Karte sichtbar, Panel und Erfolge erreichbar
4. Lernstufen-Auswahl — Kopfleiste oben, drei Karten darunter
5. Etappenkarte — Kopfleiste bleibt beim Rollen stehen (sie ist jetzt eine
   Grid-Zeile, kein `sticky` mehr — genau hier würde ein Fehler auffallen)
6. Ortskarte — Punkte sitzen auf denselben Stellen des Kartenbildes wie vorher
7. Ein Ort mit allen Eventtypen — Dialog, Quiz, Zuordnen, Texteingabe,
   Bildsuche, Belohnung; besonders die Bildsuche, die vorher überlief
8. Ergebnis-Screen am Ende des Ortes
9. **Profilmenü in der Kopfleiste öffnen** — es muss über dem Inhalt liegen,
   nicht dahinter. Das ist die wackligste Stelle (siehe unten)
10. Tablet des Kindes, quer **und** hoch

### Unsicherste Stelle

`frontend/src/app/ui/hud/hud.scss:6` — der `z-index: 40` steht jetzt ohne
`position`. Das ist korrekt (Grid-Elemente stapeln auch ohne `position`), aber es
ist die einzige Zeile, deren Wirkung sich still ändern könnte. Klärender Check:
Punkt 9 der Prüfliste — Profilmenü auf der Etappenkarte öffnen. Liegt es hinter
den Etappen, kommt `position: relative` zurück in den Host.
