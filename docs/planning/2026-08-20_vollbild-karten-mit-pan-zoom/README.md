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
bestehende Content der Welt `pokemon` (bis 23.08.2026 `pokemon_lesen`, seither
auf Sachkunde/Mathe erweitert statt reiner Lese-Welt) wird im Zuge dessen entlang der
echten Kanto-Geografie (Alabastia → Route 1 → Vertania City → Vertania-Wald)
neu geplant und um neue Stationen verdichtet.

## Übersicht

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Kachel-Fundament](phase-1-kachel-fundament.md) | standard | complete |
| 2 | [Pan- und Zoom-Interaktion](phase-2-pan-und-zoom.md) | heikel | complete |
| 3 | [Fortschritts-Freischaltung und Savegame](phase-3-fortschritts-freischaltung.md) | heikel | complete |
| 4 | [Automatischer Fokus](phase-4-auto-fokus.md) | standard | complete |
| 5 | [Level-Neuplanung Alabastia](phase-5-level-neuplanung.md) | standard | complete |
| 6 | [Assets erzeugen](phase-6-assets-erzeugen.md) | standard | pending |
| 7 | [Figuren- und Aufgabenbilder neu](phase-7-figuren-und-aufgabenbilder.md) | standard | pending |
| 8 | [Vertonung, vollständig statt nur Dialog](phase-8-vertonung.md) | heikel | pending |

**Nachtrag 23.08.2026 (Sascha):** Vier Wünsche sind dazugekommen und in
Phase 5–7 eingearbeitet — Figurenbilder neu (und der rembg-Fehler, der Bisasam
die Augen ausgestanzt hat, im Werkzeug abgestellt), Aufgaben aufs
Pokémon-Universum umgestellt statt Ball/Boot/Vase, Silben zählen mit Pokébällen
statt Sternen, und das Kartenverfahren (ChatGPT-Entwurf + Tiled Upscale) wird zu
Beginn von Phase 6 gemeinsam entschieden. Phase 7 ist neu und wurde von Phase 6
abgetrennt, weil Kartenkacheln und Figurenbilder außer dem Zeitpunkt nichts
gemeinsam haben.

## Drei Kartenebenen (festgelegt 26.08.2026, Sascha)

Die Karten sind nicht drei gleichrangige Screens, sondern **drei Zoomstufen
derselben Welt**. Jede Ebene ist eine eigene Kachelkarte mit eigener
Freischaltung; man steigt von oben nach unten hinein.

| Ebene | Screen | Leinwand | Anfangs aufgedeckt | Was darauf liegt |
|---|---|---|---|---|
| **Planetenkarte** | `MainHub` | 8192×8192 (8×8 Kacheln) | nur `{0,0}` | der Planet Pokémon; später weitere Planeten = weitere Welten |
| **Weltenkarte** | `Timeline` (`arc_overview`) | 8192×8192 (8×8 Kacheln) | nur `{0,0}` | die Kanto-Region; auf der ersten Kachel zwei Orte: **Alabastia** und **Vertania City** |
| **Gebietskarte** | `MapScreen` (`world.maps[]`) | je 2×1 Kacheln (2048×1024) | siehe Phase 3 | die Episoden eines Gebiets |

**Zwei Gebietskarten**, nicht eine (Korrektur vom 26.08.2026 — bis dahin sah
der Plan eine einzige Ortskarte mit vier Kacheln vor):

| Gebietskarte | Kacheln | Stationen |
|---|---|---|
| Alabastia | `alabastia` `{0,0}`, `route_1` `{0,1}` | 6 |
| Vertania | `vertania_city` `{0,0}`, `vertania_wald` `{-1,0}` | 8 |

Die **Kacheln selbst und die Verteilung der vierzehn Stationen darauf bleiben
unverändert** gegenüber der ursprünglichen Phase-5-Planung — es wird
umgruppiert, nicht neu verteilt. Der Knick des Waldes über Vertania City bleibt
erhalten (jetzt `{-1,0}` statt `{-1,2}`) und bleibt damit der Testfall für die
Pan-Klemmung aus dem Konfidenz-Ausweis unten.

**Die 8192er-Leinwände werden vollständig erzeugt, aber nur die tatsächlich
benutzten Kacheln als Datei ausgeliefert.** Die große Leinwand ist das, was die
Nahtlosigkeit für jede spätere Aufdeckung garantiert; 126 schwarze Dateien
auszuliefern, die nach AK 3 ohnehin nie geladen werden, wäre Ballast. Die
Leinwände bleiben als Quellartefakt unter `data/_authoring/` liegen.

## Gebäude gehören nicht in die Karte (festgelegt 26.08.2026, Sascha)

Karten zeigen **nur Gelände**: Wiese, Wald, Wege, Wasser, Küste, Fels. Häuser,
Ortschaften, Türme, Brücken und sonstige Bauwerke werden **nie** in die
Kartenleinwand hineingemalt, sondern liegen als eigene, freigestellte Sprites
obendrauf.

Der Grund ist nicht Ästhetik, sondern Mechanik: dieselbe Kachel muss zeigen
können, dass ein Ort noch verschlossen ist, und später, dass er offen ist. Ein
eingebackenes Gebäude kann das nicht — es ist immer da, in immer demselben
Zustand, und lässt sich nicht verschieben, wenn ein Ort umzieht. Damit ist auch
der offene Punkt „Kartenverfahren" aus Phase 6 entschieden: **Weg C**.

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
7. `pokemon` zeigt die neu geplante Alabastia-Route auf **zwei Gebietskarten**
   (Alabastia + Route 1 / Vertania City + Vertania-Wald, zusammen 4 Kacheln,
   14 Stationen) mit echten PNG-Sprites statt Punkten.
8. Freischalt-Zustand übersteht einen Tab-Neustart (Savegame, Phase 3).
9. MainHub hat **keinen** Fortschritts-Gatekeeper — installierte Welten sind
   sofort sichtbar, sobald sie existieren (kein Warten auf Freischaltung).
10. Alle Kartenpunkte bleiben per Tab erreichbar, Zoom-Steuerung ist
    tastaturbedienbar, `prefers-reduced-motion` wird respektiert.
11. Kein Figurenbild hat Löcher an Augen, Zähnen oder Glanzlichtern, und das
    Freistell-Werkzeug kann sie gar nicht mehr erzeugen (Phase 7).
12. Alle vier Figuren liegen in vier Emotionen vor statt in zwei.
13. Die Aufgaben der Welt nennen Wörter aus dem Pokémon-Universum; wo Reim oder
    Anlaut das verhindern, ist die Ausnahme benannt und begründet.
14. Silben werden mit Pokébällen gezählt, nicht mit Sternen — und die Anzahl ist
    am Gerät des Kindes auf einen Blick abzählbar.
15. Im Vorlesemodus läuft jede Frage und jede Engine-Ansage über eine echte
    Aufnahme, nirgends mehr über die Sprachausgabe des Geräts (Phase 8).
16. Auf keiner Kartenleinwand ist ein Gebäude eingemalt — jedes Bauwerk, das
    man sieht, ist ein eigenes Sprite und lässt sich einzeln austauschen,
    verschieben oder ausblenden.
17. Planetenkarte und Weltenkarte liegen als vollständige 8192×8192-Leinwand
    vor, sodass eine später aufgedeckte Kachel ohne neue Bildarbeit nahtlos
    an ihre Nachbarn anschließt.

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
- **Lernziel schlägt Thema** (23.08.2026): Reim- und Anlaut-Aufgaben sind über
  den Klang gebunden. Wo sich Pokémon-Wortmaterial und Lautvorgabe nicht
  vereinbaren lassen, bleibt ein neutrales Wort stehen. Ein Reimpaar, das sich
  nicht reimt, wäre keine Themenanpassung, sondern eine kaputte Aufgabe.
- **Der Bildbestand wächst hinter dem Content her:** Phase 5 trägt Dateinamen
  ein, die es erst nach Phase 7 gibt. Zwischen den beiden Phasen ist
  `pokemon` nicht abnahmefähig — nicht deployen, bis Phase 7 durch ist.
  Das legt sich auf den bestehenden Nicht-Deployen-Vorbehalt aus Phase 1 (altes
  `world_config.json`-Schema) oben drauf.
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
mehr Fläche freigeben als tatsächlich freigeschaltet ist. **Check:** Auf der
**Gebietskarte Vertania** liegt der Wald über der City (`{-1,0}` statt
`{0,1}`) — sobald Phase 6 die Bilder liefert, am Bildschirm prüfen, ob sich in
die leere Ecke neben dem Wald pannen lässt, obwohl dort keine Kachel liegt.

🟡 **Seit der Umgruppierung auf zwei Gebietskarten ist dieser Check schwächer
geworden**: bei nur zwei Kacheln pro Karte ist das umschließende Rechteck
2×2 Felder groß, es gibt also genau **ein** leeres Feld zu prüfen statt
mehrerer. Der Fehler, um den es geht, wird dadurch nicht kleiner, nur seltener
sichtbar — bei der nächsten Gebietskarte mit drei oder mehr Kacheln noch einmal
hinsehen.

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
