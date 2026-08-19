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

- [ ] Feld für Weltverbindungen in `data/main_hub.json` und im Schema
      (Abschnitt 1) ergänzen, Muster wie `routes` bei den Ortskarten
- [ ] `main-hub` auf `ui/map-canvas/` mit Routen verdrahten
- [ ] Hintergrund der Planetenkarte auf die Bühnenhöhe bringen (Kartenfläche
      bleibt 16:9, siehe [phase-3-karten.md](phase-3-karten.md) — dieselbe
      Entscheidung gilt hier)
- [ ] Panels als überlagernde Flächen prüfen: verdecken sie Knoten, wandern sie,
      nicht die Knoten
- [ ] Waagerechtes Rollen: **die Kartenfläche rollt als Ganzes**, Bild und
      Knoten liegen darin. Kein getrenntes Verschieben des Hintergrunds
- [ ] Die zwei echten Welten am Bildschirm ansehen, dann testweise mit einer
      erfundenen dritten und vierten Welt gegenprüfen
- [ ] `docs/design/README.md`: Abweichungen festhalten
- [ ] `docs/code-map.md` nachziehen, falls sich Zuständigkeiten verschieben

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
