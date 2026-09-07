# Karten-Überarbeitung — Nebel, Orientierung, Bilder

**Angelegt:** 31.08.2026 · **Status:** wartet auf Freigabe

Alle drei Kartenebenen (Planetenkarte, Etappenkarte, Ortskarte) bekommen die
Struktur aus dem Karten-Konzept vom 31.08.2026, umgesetzt in der bestehenden
Pergament-Farbwelt. Dazu werden die Kartenbilder der Pokémon-Welt und die
Planetenkarte neu erzeugt.

## Woher der Auftrag kommt

Sascha hat ein extern erstelltes Karten-Konzept mitgebracht
(`C:\Users\sasch\Downloads\questoria-map-ui-prototype\questoria-map-prototype`,
HTML/CSS/JS, nicht im Repo). Sein Urteil: Sternen- und Weltenkarten sind
technisch und grafisch schlecht.

**Was daran geprüft zutrifft** (Belege in den Phasen):

- Der Nebel gesperrter Kacheln ist eine Volltonfläche pro 1024er-Kachel —
  ein Schachbrett aus beigen Klötzen, keine Atmosphäre.
- Herauszoomen ist unmöglich: `MIN_ZOOM = 1` bei gleichzeitiger
  Cover-Skalierung heißt, die Karte füllt die Fläche immer randlos und
  schneidet ab. Die ganze Welt ist nie zu sehen.
- Marker kennen nur „geschafft / aktuell / gesperrt". Die Stufe „entdeckt,
  aber noch nicht erkundet" fehlt, damit fehlt die Neugier-Stufe.
- Keine Orientierungshilfe: keine Minikarte, keine Legende auf der Ortskarte.
- Die Kartenbilder selbst sind vor der Überarbeitung des Bild-Ablaufs vom
  26.08.2026 entstanden.

**Was nicht zutrifft:** Die Kartenmechanik in `map-canvas.ts` ist in Ordnung —
Zeigerereignisse, Zwei-Finger-Zoom, Zoom um den Cursor, Klemmung, die
Unterscheidung Tipp/Ziehen. Das Konzept kann davon weniger und empfiehlt in
seiner eigenen README ausdrücklich, die vorhandene Grundlage weiterzuverwenden.
Sie bleibt.

**Was aus dem Konzept nicht übernommen wird** (bewusst, nicht vergessen):

- Die dunkel-kosmische Farbwelt (`#060a15`, Blau/Gold). Questoria ist
  verbindlich Pergament (`docs/design/README.md`). Entschieden am 31.08.2026.
- Die untere Navigationsleiste mit „Missionen / Logbuch / Markt / Profil" —
  diese Bereiche existieren nicht.
- Der Zweier-Umschalter „Galaxy / Planet". Questoria hat drei Kartenebenen als
  echte Routen, keinen Schalter.
- Die Prozent-Koordinaten und die feste 3072er-Weltfläche des Konzepts. Das
  Kachelsystem des Bestands ist stärker.

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Kartenausschnitt und Zoom-Boden](phase-1-kartenausschnitt-und-zoom.md) | heikel | **complete** |
| 2 | [Nebel als eigene Schicht](phase-2-nebel-als-schicht.md) | heikel | **complete** |
| 3 | [Drei Marker-Zustände](phase-3-marker-zustaende.md) | standard | pending |
| 4 | [Orientierung: Minikarte und Legende](phase-4-orientierung.md) | standard | pending |
| 5 | [Panels und schmale Karten](phase-5-panels-und-schmale-karten.md) | standard | pending |
| 6 | [Kartenbilder neu erzeugen](phase-6-kartenbilder.md) | standard | pending |

Phase 1 und 2 hängen zusammen (beide fassen die Flächenberechnung an) und
werden in dieser Reihenfolge umgesetzt. Phase 3–5 sind danach unabhängig
voneinander. Phase 6 braucht keine der anderen und kann jederzeit laufen.

## Kontrakt — was die Kartenfläche nach außen anbietet

`qst-map-canvas` ist das gemeinsame Bauteil von drei Screens. Nach diesem Plan
hat es diese Eingänge (neue **fett**):

| Eingang | Typ | Bedeutung |
|---|---|---|
| `tiles` | `readonly MapCanvasTile[]` | alle Kacheln der Karte, freigeschaltet oder nicht |
| `points` | `readonly MapCanvasPoint[]` | Knoten, nur für die Routengeometrie |
| `routes` | `readonly RoutePair[]` | Verbindungen zwischen Knoten |
| `dimmedPointIds` | `readonly string[]` | Knoten, deren Routen neutral gezeichnet werden |
| `unlockedTileIds` | `readonly string[]` | freigeschaltete Kacheln |
| `focusPointId` | `string \| null` | Knoten, auf den einmalig zentriert wird |
| `focusZoom` | `number` | Zoomstufe der Zentrierung |
| **`showMinimap`** | `boolean` (Vorgabe `true`) | Minikarte oben rechts einblenden |

Neuer Ausgang: keiner. Neue exportierte Konstante: `TILE_SIZE` bleibt.

Der Nebel ist **keine** Eigenschaft des Screens. Er entsteht in `map-canvas`
allein aus `tiles` und `unlockedTileIds` — die Screens ändern dafür nichts.

## Finale Abnahmekriterien (das Ganze)

1. Auf allen drei Kartenebenen lässt sich so weit herauszoomen, dass die
   gesamte freigeschaltete Fläche plus Nebelrand vollständig sichtbar ist,
   und so weit hinein, dass eine Kachel ihre native Größe erreicht.
2. Gesperrte Bereiche zeigen keine sichtbaren Kachelkanten mehr. Der Übergang
   von freigeschalteter Fläche zu Nebel ist weich.
3. Knotenpunkte behalten beim Zoomen ihre Bildschirmgröße; das Antippziel
   bleibt in jedem Zoomstand mindestens 44 × 44 px.
4. Jeder Knoten zeigt einen von vier unterscheidbaren Zuständen: unbekannt,
   entdeckt, erkundet, aktuell — jeder mit Form/Symbol, nicht nur Farbe.
5. Oben rechts zeigt eine Minikarte die gesamte Karte und darin ein Rechteck,
   das dem tatsächlich sichtbaren Ausschnitt entspricht und beim Ziehen
   mitläuft.
6. Auf schmalen Karten (< 42rem Kartenbreite) verdeckt kein Panel dauerhaft
   die Karte.
7. Die Kartenbilder der Pokémon-Welt und die Planetenkarte sind mit dem
   Ablauf vom 26.08.2026 neu erzeugt und von Sascha abgenommen.
8. `npm run lint` und `npm run build` im Frontend laufen sauber durch.

## Smoke-Checkliste (Sascha, am Bildschirm)

Reihenfolge bewusst: oben stehen die Stellen, an denen ich unsicher bin.

1. 🟡 **Herauszoomen bis zum Anschlag** auf der Ortskarte Alabastia. Erwartung:
   beide Kacheln plus Nebelrand vollständig im Bild, mittig, keine
   Sprünge beim letzten Rasterschritt. *(Unsicher: die Klemmung muss von
   „Welt füllt Fläche" auf „Welt passt in Fläche" umschalten — genau am
   Umschaltpunkt sitzt der wahrscheinlichste Fehler.)*
2. 🟡 **Nebelkante ansehen** — irgendein gesperrter Bereich. Erwartung: weicher
   Verlauf, keine geraden Kanten im 1024er-Raster. *(Unsicher: die Weichheit
   der Maske ist ein fester Pixelwert, der bei starkem Zoom mitskaliert und
   dann zu weich oder zu hart aussehen kann.)*
3. 🟡 **Beim Zoomen auf einen Ort achten.** Erwartung: das Ortssymbol bleibt
   gleich groß, während die Karte darunter wächst. *(Unsicher: die
   Gegenskalierung sitzt auf jedem Knoten einzeln und kann bei der aktuellen
   `cqw`-Größenrechnung doppelt greifen.)*
4. Zwei Finger auf dem Tablet: Zoomen und Schieben gleichzeitig, dann loslassen
   und einen Ort antippen. Der Ort muss öffnen, nicht die Karte springen.
5. Minikarte: ziehen und zoomen, das Rechteck darin muss passen. Bei voller
   Übersicht füllt es die Minikarte ganz.
6. Einen bisher gesperrten Ort freispielen. Erwartung: der Nebel weicht dort
   zurück, die Nachbarkachel wird sichtbar.
7. Fenster auf Handybreite ziehen: Panel klappt zu, Karte bleibt bedienbar.
8. Systemeinstellung „Bewegung reduzieren" an: keine Animationen mehr, aber
   alles weiterhin bedienbar.
9. Kartenbilder: alle sechs neu erzeugten Bilder ansehen. Prüfstein steht in
   `MAPS.md` → „Abnahme".

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
