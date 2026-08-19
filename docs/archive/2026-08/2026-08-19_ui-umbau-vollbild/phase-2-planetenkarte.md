# Phase 2 — Planetenkarte vollflächig mit Pfaden

**Rating:** standard (das Design beschreibt Geometrie und Aussehen bereits
vollständig)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-buehne.md](phase-1-buehne.md) — muss fertig sein
- `docs/design/HANDOFF.md`, Abschnitt „2. Planetenkarte / Hub" — **verbindlich**,
  inklusive der Routen-Geometrie (SVG-Ebene, `viewBox="0 0 1600 900"`,
  quadratischer Bézier mit Bauch `min(110, Länge × 0.18)` senkrecht zur
  Verbindung, Strichstärke 7, Strichmuster `16 22`, runde Enden,
  `vector-effect: non-scaling-stroke`)
- `frontend/src/app/features/main-hub/` — der heutige Screen
- `frontend/src/app/ui/map-canvas/` — die gemeinsame Kartenfläche; **sie kann
  Routen bereits** (`map-canvas.ts`, `routePaths`) und benutzt dieselbe
  Bauch-Formel wie das Design
- `data/main_hub.json` — die installierten Welten mit ihren Koordinaten
- `data/_authoring/JSON_SCHEMA_REFERENCE.md`, Abschnitt 1

## Die gute Nachricht vorweg

Die Routenebene ist **nicht neu zu bauen**. `ui/map-canvas/` zeichnet Routen
bereits nach genau der Formel aus dem HANDOFF und wird von der Etappen- und der
Ortskarte benutzt. Der Planetenkarte fehlen nur die Routen-Daten und die
Verdrahtung — die Kartenfläche kann es längst.

## Abnahmekriterien

1. Der Hintergrund der Planetenkarte füllt die Bühne unter der Kopfleiste.
2. Zwischen den Welten liegen Wege, gezeichnet von `ui/map-canvas/` mit den
   Werten aus dem HANDOFF. Ein Weg zu einer noch gesperrten Welt ist neutral
   eingefärbt.
3. Die Wege kommen aus dem Content, nicht aus dem Code: `data/main_hub.json`
   bekommt ein Feld für Verbindungen, so wie `world_config.json` es für die
   Ortskarten schon hat. Fehlt das Feld, gibt es eben keine Wege — kein Fehler.
4. Die Weltknoten sitzen weiterhin auf denselben Stellen des Kartenbildes wie
   vorher. Prozentwerte bleiben Prozentwerte des **Bildes**.
5. Info-Panel oben links und Erfolge-Panel oben rechts liegen über der Karte,
   ohne die Knoten zu verdecken.
6. Mehr Welten als Platz: die Karte rollt waagerecht, und der Hintergrund rollt
   **mit** — Knoten und Bild bleiben deckungsgleich. Es gibt keinen Zustand, in
   dem ein Knoten neben seiner Insel steht.

## Checkliste

- [x] Feld für Weltverbindungen in `data/main_hub.json` und im Schema
      (Abschnitt 1) ergänzen, Muster wie `routes` bei den Ortskarten —
      **war bereits vorhanden** (`hub_map.routes`, leeres Array, Schema
      Abschnitt 1 dokumentiert es schon), keine Änderung nötig.
- [x] `main-hub` auf `ui/map-canvas/` mit Routen verdrahten — **war bereits
      verdrahtet** (`main-hub.html:19`, `[routes]="hub.data.hub_map.routes"`).
- [x] Hintergrund der Planetenkarte auf die Bühnenhöhe bringen (Kartenfläche
      bleibt 16:9, siehe [phase-3-karten.md](phase-3-karten.md) — dieselbe
      Entscheidung gilt hier) — **umgesetzt anders als Phase 3's Einpassen:**
      die Höhe kommt von der Bühne (`block-size: 100%`), die Breite folgt dem
      16:9-Verhältnis (`inline-size: auto` + `aspect-ratio` aus `map-canvas`)
      und wächst frei — kein Einpassen/Beschneiden nötig, weil AK 6 explizit
      waagerechtes Rollen statt Schrumpfen verlangt.
- [x] Panels als überlagernde Flächen prüfen: verdecken sie Knoten, wandern sie,
      nicht die Knoten — unverändert `position: absolute` relativ zum
      `map-canvas`-Host, der weiterhin die ganze Kartenfläche ist.
- [x] Waagerechtes Rollen: **die Kartenfläche rollt als Ganzes**, Bild und
      Knoten liegen darin. Kein getrenntes Verschieben des Hintergrunds —
      `.main-hub` (Elternfläche) trägt `overflow-x: auto`, `.main-hub__canvas`
      selbst hat keinen eigenen Scroll-Container, Hintergrundbild und Knoten
      sind Kinder derselben Fläche.
- [ ] Die zwei echten Welten am Bildschirm ansehen, dann testweise mit einer
      erfundenen dritten und vierten Welt gegenprüfen — **nicht gemacht,
      nur eine Welt ist installiert.** Am Bildschirm ansehen ist ohnehin
      Sache des Users (Smoke-Checkliste am Plan-Ende), Vier-Welten-Probe geht
      nur mit erfundenen Testdaten in `data/main_hub.json` — offen für den
      Smoke-Test.
- [x] `docs/design/README.md`: Abweichungen festhalten — Punkt 12 ergänzt.
- [x] `docs/code-map.md` nachziehen, falls sich Zuständigkeiten verschieben —
      keine Verschiebung, nur CSS in bestehenden Dateien geändert.

## Risiken

🟡 **Die Koordinaten in `data/main_hub.json` sind geraten.** In STATE.md steht
der Verdacht, dass die Pokémon-Kachel bei `x:63, y:36` im offenen Himmel hängt.
Sobald die Karte vollflächig ist, sieht man das sofort — **erst dann** die
Koordinaten korrigieren, nicht vorher raten. Das gilt genauso für die drei
Ortspunkte und die Etappe aus Phase 1 des Weltplans.

🟡 **Waagerechtes Rollen und Vollbild widersprechen sich halb.** Eine Karte, die
breiter als der Bildschirm ist, hat notwendigerweise einen Rollbereich. Der
Kontrakt aus Phase 1 erlaubt genau das: **eine** rollende Fläche pro Screen. Die
Seite rollt trotzdem nicht.

## Report-Back

**Status: complete, Abnahme am Bildschirm offen.**

Weniger zu bauen als gedacht: Content-Feld, Schema-Text und die Verdrahtung
zwischen `main-hub` und `map-canvas` gab es schon — vermutlich aus der Arbeit
an Etappen-/Ortskarte, die dasselbe Muster benutzen. Gebaut wurde nur die
Größenlogik: `.main-hub__canvas` füllt jetzt die volle Bühnenhöhe
(`block-size: 100%`) und lässt die Breite frei aus dem 16:9-Verhältnis von
`map-canvas` folgen (`inline-size: auto`), statt wie vorher die Fensterbreite
vorzugeben. Wird die Karte dadurch breiter als der Bildschirm, rollt die
Elternfläche (`.main-hub`, jetzt `overflow-x: auto`) waagerecht als Ganzes —
Bild, Routen und Knoten sind Kinder derselben Fläche und bleiben deckungsgleich.
Die transitorischen Phase-1-Reste (`overflow: auto`, `max-inline-size: 90rem`,
`padding`) sind raus.

Build und Lint sind grün — sagt bei Layout nichts, siehe Phase 1.

🟡 **Wackligste Stelle:** Auto-Sizing von Block-Elementen aus `aspect-ratio`
(`inline-size: auto` + definite `block-size` + `aspect-ratio` vom Kind-Host)
ist moderner CSS-Sizing-Algorithmus, keine Angular-Eigenheit — sollte in jedem
aktuellen Browser funktionieren, aber am Bildschirm noch nicht gesehen.

🟡 **Nur eine Welt installiert.** Das waagerechte Rollen und der
Route-Rendering-Pfad (mehrere Welten mit Verbindungen) sind nur mit
erfundenen Testdaten in `data/main_hub.json` prüfbar — nicht Teil dieser
Phase, aber Punkt für die Smoke-Checkliste.

**Prüfliste für den Bildschirm:**
1. Planetenkarte füllt die Fläche unter der Kopfleiste, kein Rollbalken am
   Fensterrand, nur ggf. innerhalb der Karte waagerecht (AK 1, 6).
2. Info-Panel oben links und Erfolge-Panel oben rechts liegen über der Karte,
   verdecken den Weltknoten nicht (AK 5).
3. Fenster schmal machen (Handy-Breite) und wieder normal — Karte bleibt
   bedienbar, Panel klappt wie gehabt zusammen.
4. Temporär eine zweite/dritte erfundene Welt mit Koordinaten und einer
   `routes`-Verbindung in `data/main_hub.json` eintragen: Weg wird gezeichnet,
   bei genug Welten rollt die Karte waagerecht, Bild bleibt unter den Knoten.
