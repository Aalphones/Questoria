# Erkundbare Kachel-Karten mit Fortschritts-Freischaltung

**Ausgangslage:** Alle drei Kartenscreens (`MainHub`, `Timeline`, `MapScreen`) teilen
sich `ui/map-canvas/`. Die Fläche war fest auf 16:9 eingepasst, lag gerahmt in
ihrem Screen und zeigte Ränder/Passepartout. Aus „Ränder weg" ist im Lauf der
Planung ein größeres Feature geworden: die Karte besteht jetzt aus einzelnen
1024×1024-Kacheln, die **einzeln durchs Spiel freigeschaltet** werden — man
startet auf einer Kachel, spielt sie durch, die nächste deckt sich auf. Nicht
freigeschaltete Kacheln sind bewusst schwarz, Pan/Zoom funktioniert nur
innerhalb der aufgedeckten Fläche. Die Kachelliste ist **offen erweiterbar** —
neue Kacheln lassen sich später einfach an bestehende ransetzen, kein fixes
Raster.

Zusätzlich: Karteneinträge (Etappen, Orte, installierte Welten) werden als
echte PNG-Sprites auf den Kacheln platziert statt als bloße Punkte, und der
bestehende Content der Welt `pokemon_lesen` wird im Zuge dessen entlang der
echten Kanto-Geografie (Alabastia → Route 1 → Vertania City → Vertania-Wald)
neu geplant und um neue Stationen verdichtet.

## Übersicht

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Kachel-Fundament](phase-1-kachel-fundament.md) | standard | pending |
| 2 | [Pan- und Zoom-Interaktion](phase-2-pan-und-zoom.md) | heikel | pending |
| 3 | [Fortschritts-Freischaltung und Savegame](phase-3-fortschritts-freischaltung.md) | heikel | pending |
| 4 | [Automatischer Fokus](phase-4-auto-fokus.md) | standard | pending |
| 5 | [Level-Neuplanung Alabastia](phase-5-level-neuplanung.md) | standard | pending |
| 6 | [Assets erzeugen](phase-6-assets-erzeugen.md) | standard | pending |

## Kontrakt — `MapCanvas` (`ui/map-canvas/map-canvas.ts`)

Betrifft `features/main-hub`, `features/timeline`, `features/map` gleichzeitig
— Contract-First gilt. Backend-Seite (Phase 3): `backend/src/Validators/SavegameValidator.php`,
`backend/src/Repositories/SavegameRepository.php`.

**Kachel-Datenmodell (Content, ab Phase 1) — ersetzt `background: string`:**
Jede Karte (`HubMap`, `ArcOverview`, `MapEntry`) bekommt statt eines einzelnen
Hintergrund-Dateinamens ein Feld `tiles: TileDef[]`, `TileDef = { id: string,
row: number, col: number, background: string }`. `row`/`col` sind
**vorzeichenlose ganze Zahlen ohne Obergrenze** — die Karte ist ein offenes
Koordinatensystem, kein festes Raster; neue Kacheln kommen einfach mit neuen
`row`/`col`-Werten dazu. Jede Kachel ist genau **eine** Bilddatei (1024×1024),
keine Slicing-Pipeline mehr nötig.

**Punkte referenzieren eine Kachel (ab Phase 1):** `MapCanvasPoint` bekommt ein
Feld `tileId: string` — `x`/`y` sind ab jetzt Prozent **innerhalb dieser
Kachel** (0–100), nicht mehr der ganzen Welt. Verschiebt sich eine Kachel
später im Raster, bleiben die Punktpositionen relativ zu ihr unverändert
gültig.

**Neue Inputs an `MapCanvas`:**
- `unlockedTileIds: input<readonly string[]>([])` — welche `TileDef.id` gerade
  freigeschaltet sind. `MapCanvas` selbst weiß nichts über Fortschritt/
  Savegame — reine Anzeige- und Klemmungs-Logik, die Berechnung sitzt in den
  Screens (Phase 3).
- `focusPointId: input<string | null>(null)` — wie zuvor geplant, zentriert
  beim Laden (Phase 4).

**Projection-Kontrakt (unverändert aus der ersten Fassung):** `<qst-map-point>`
landet in der verschiebbaren Ebene, alles andere (Panel, Legende, Erfolge,
Kompass) in der festen Overlay-Ebene — `<ng-content select="qst-map-point" />`
vs. `<ng-content />`.

**CSS-Host-Kontrakt:** `:host` füllt seinen Elternrahmen vollständig
(`inline-size: 100%; block-size: 100%`), `overflow: clip` (ADR-017).

**ADR-Referenzen:** [ADR-017](../../decisions/017-vollbild-doktrin.md)
(Vollbild-Doktrin), neu **ADR-019** (Pan/Zoom ohne externe Bibliothek,
Phase 2), neu **ADR-020** (Freischaltung als persistierter statt abgeleiteter
Zustand, Phase 3).

## Finale Akzeptanzkriterien (Gesamtplan)

1. Alle drei Kartenscreens füllen den Bildschirm randlos, ohne Passepartout.
2. Man kann per Drag/Touch/Mausrad/Pinch ziehen und zoomen — aber nur
   innerhalb der freigeschalteten Kacheln. Jenseits davon ist Schluss, nicht
   nur vernebelt.
3. Nicht freigeschaltete Kacheln sind schwarz/leer, laden **keine**
   Bilddatei (kein Netzwerk-Request), bis sie freigeschaltet sind.
4. Schließt man alle spielbaren Punkte einer Kachel ab, schaltet sich die
   nächste Kachel in der Sequenz frei — inklusive ihrer echten PNG-Elemente.
5. Panel, Legende, Erfolge, Kompass bleiben beim Ziehen/Zoomen fest am
   Bildschirmrand.
6. Beim Öffnen zentriert sich die Ansicht animiert auf die aktuelle Station.
7. `pokemon_lesen` zeigt die neu geplante Alabastia-Route (4 Kacheln,
   ~13–15 Stationen) mit echten PNG-Sprites statt Punkten.
8. Freischalt-Zustand übersteht einen Tab-Neustart (Savegame, Phase 3).
9. MainHub hat **keinen** Fortschritts-Gatekeeper — installierte Welten sind
   sofort sichtbar, sobald sie existieren (kein Warten auf Freischaltung).
10. Alle Kartenpunkte bleiben per Tab erreichbar, Zoom-Steuerung ist
    tastaturbedienbar, `prefers-reduced-motion` wird respektiert.

## 🟡 Risiken & Annahmen

- **Vier Design-Iterationen bis zu diesem Stand** (Chronologie: Fortschritts-
  Bruchteil mit Ring-Radius → Widerspruch, muss ins Savegame → Civilization-
  Analogie war nur Bildsprache, kein Scouting-Mechanismus → finale Fassung:
  linear, durchspielen schaltet die nächste Kachel frei). Diese README hält
  nur die **finale** Fassung — frühere Zwischenstände existieren nicht mehr
  in den Phasen-Dateien.
- **Backend ist jetzt Teil des Plans:** `SavegameValidator.php` und
  `SavegameRepository.php` brauchen ein neues Feld für freigeschaltete
  Kacheln — reines Angular-Wissen aus der ersten Planungsrunde reicht nicht
  mehr, Phase 3 braucht PHP-Kenntnis des Umsetzers.
- **Content-Aufwand ist real, nicht kosmetisch:** ~10–12 neue Stationen
  brauchen je eine neue Leseepisode plus ein PNG-Sprite — das ist die
  aufwendigste Einzelphase (Phase 5+6 zusammen), nicht Fleißarbeit nebenbei.
- **Abgeleitet vs. persistiert bewusst zugunsten „persistiert" entschieden**
  (Sascha, 20.08.2026) — technisch wäre der lineare Freischalt-Zustand aus
  dem bestehenden Fortschritt herleitbar; persistiert erlaubt spätere
  Sonderfälle (Hinweis-Kauf, manuelles Freischalten) und macht „diese Kachel
  ist gerade neu aufgetaucht" trivial erkennbar. Näher begründet in ADR-020.

## Konfidenz-Ausweis

Am unsichersten: Ob die Pan-Klemmung auf eine **exakte** (nicht
Bounding-Box-angenäherte) freigeschaltete Fläche bei einer **linearen**
Kachelfolge überhaupt einen Unterschied macht — bei linearer Sequenz sind
alle freigeschalteten Kacheln ohnehin zusammenhängend in Erkundungsreihenfolge,
eine Bounding-Box über eine Linie von Kacheln kann aber bei geknickten
Sequenzen (Kachel liegt nicht stur nebeneinander, sondern macht einen Knick)
mehr Fläche freigeben als tatsächlich freigeschaltet ist. **Check:** In
Phase 2, sobald die Alabastia-Route (Phase 5) mit einem Knick im Layout
vorliegt (z. B. Vertania City nicht stur östlich von Route 1, sondern
versetzt), am Bildschirm prüfen, ob sich in die Ecke zwischen zwei
Kacheln pannen lässt, obwohl dort keine dritte Kachel liegt.

## Summary

*(nach Abschluss ausfüllen)*

## Files touched

*(nach Abschluss ausfüllen)*

## Commits

*(nach Abschluss ausfüllen)*

## Deviations from plan

*(nach Abschluss ausfüllen)*

## Follow-ups

*(nach Abschluss ausfüllen)*
