# Phase 6 — Assets erzeugen

**Rating:** standard (Bildarbeit, kein Angular-Code)

## Kontext

- Skill `krea2-bilder` (lokal, ComfyUI/`comfy`-MCP) — Standardweg für
  Hintergründe/Karten **und** für die neuen Stations-PNGs (Gebäude/Orte,
  keine Figuren mit Emotionsset — `flux2-bilder` ist für Charakter-Sprites
  gedacht und hier nur einschlägig, falls eine Station ausnahmsweise eine
  wiederkehrende Figur zeigen soll).
- Phase 5 → Kachel-/Stationstabelle — Quelle für Layout und Datei-Liste
  dieser Phase.
- `data/_authoring/ASSET_REQUIREMENTS.md` Abschnitt 4 (Map-Grafiken) — wird
  aktualisiert.
- Sascha stellt den **Tiled-Upscale-Workflow** noch bereit (Chat vom
  20.08.2026) — bis dahin lässt sich die Basis-Generierung schon vorbereiten,
  der finale hochaufgelöste Export der Kachel-Leinwände wartet auf den
  Workflow.

## Ziel dieser Phase

**Nicht** jede Kachel einzeln generieren — unabhängig erzeugte Kacheln haben
keinen Grund, an ihren Rändern zusammenzupassen (andere Bäume, anderer Weg,
andere Beleuchtung genau an der Kante). Stattdessen wird pro **zusammen-
hängend geplantem Kartenausschnitt** („Batch") **eine große, durchgängige
Szene** erzeugt — mit einem Tiled-Upscale-Workflow auf hohe Auflösung
gebracht, damit sie trotzdem scharf bleibt — und danach in die einzelnen
1024×1024-Ausliefer-Kacheln **zerschnitten**. Innerhalb eines Batches sind
die Kachelränder dadurch garantiert nahtlos, weil sie aus **einem** Bild
stammen. Ein späterer Ausbau (z. B. Marmoria City) bekommt seinen eigenen
Batch — nur die eine Naht zwischen zwei Batches ist nicht automatisch
perfekt, das lässt sich mit keinem Ansatz vermeiden, der offen erweiterbar
bleiben soll.

Jede der 14 Alabastia-Stationen bekommt zusätzlich ein eigenes,
freigestelltes PNG-Sprite (unabhängig vom Batch-Hintergrund — ein Gebäude/
eine Figur muss nicht mit ihren Nachbarn nahtlos verschmelzen, sie liegt als
eigene Ebene obendrauf).

## Batches für diese Phase

| Batch | Enthaltene Kacheln | Leinwandgröße (Kachel-Bounding-Box × 1024) |
|---|---|---|
| Planetenkarte | `hub` (1 Kachel) | 1024×1024 — ein Batch mit nur einer Kachel, kein Nahtproblem |
| Alabastia-Übersicht | `arc_overview` (1 Kachel) | 1024×1024 |
| Alabastia-Ortskarte | `alabastia` `{0,0}`, `route_1` `{0,1}`, `vertania_city` `{0,2}`, `vertania_wald` `{-1,2}` | Bounding-Box über alle vier Positionen: Zeilen −1..0, Spalten 0..2 → **3×2 Kachel-Felder = 6144×2048** |

Bei der Alabastia-Ortskarte werden nur **vier** der sechs Felder in der
3×2-Bounding-Box tatsächlich als Ausliefer-Kachel gebraucht — die beiden
unbenutzten Felder (`{-1,0}` und `{-1,1}`) werden in der großen Leinwand
trotzdem mitgemalt (als natürliche Umgebung, z. B. Gebirge/Horizont nördlich
von Alabastia und Route 1, das im Spiel nie als eigene Kachel auftaucht) und
nach dem Zuschneiden verworfen — sie sind reiner Kontext für eine stimmige
Komposition, kein Ausliefer-Asset.

## Auflösungsvorgaben

| Asset | Format | Größe |
|---|---|---|
| Batch-Leinwand (Zwischenschritt) | intern, vor dem Zerschneiden | Bounding-Box in 1024er-Vielfachen, siehe Tabelle oben |
| Ausliefer-Kachel (nach dem Zerschneiden) | `.webp` | exakt 1024×1024 je Kachel |
| Stations-Sprite | `.png` mit Alpha | Freigestelltes Einzelmotiv, Ausgabegröße 512×512 (Erzeugung in Modell-Nativgröße, danach verkleinert — dieselbe Kette wie bei Lernstufen-Bildern, ADR-018) |

## Umsetzung

1. Pro Batch: **einen** Prompt für die gesamte Szene formulieren (welche
   Kacheln/Stationen liegen wo in der Leinwand, welcher Übergang zwischen
   ihnen — z. B. Weg, der von `alabastia` nach `route_1` hinüberläuft, Wald,
   der `vertania_city` nach Norden umschließt), `krea2-bilder`-Skill nutzen,
   mit Tiled-Upscale-Workflow auf die Ziel-Leinwandgröße bringen.
2. Leinwand an den Kachel-Grenzen zerschneiden (`row`/`col` × 1024 als
   Ausschnitt-Offset), nur die tatsächlich gebrauchten Kacheln als Dateien
   speichern, unbenutzte Bounding-Box-Felder verwerfen.
3. Für jede der 14 Stationen: eigenes freigestelltes Sprite,
   `krea2-bilder`-Skill (oder `flux2-bilder` nur bei wiederkehrender Figur).
4. Dateien unter den in Phase 5 vergebenen Namen ablegen
   (`data/hub/`, `data/themes/pokemon_lesen/maps/`).
5. `ASSET_REQUIREMENTS.md` Abschnitt 4 aktualisieren: Batch-Prinzip
   dokumentieren („Kacheln, die aneinandergrenzen, gemeinsam als eine
   Leinwand erzeugen und zerschneiden — nie eine Kachel isoliert generieren,
   wenn sie Nachbarn hat, mit denen ihr Rand zusammenpassen muss").

## Akzeptanzkriterien

1. Alle Ausliefer-Kacheln liegen vor, exakt 1024×1024.
2. Innerhalb der Alabastia-Ortskarte sind die Übergänge zwischen
   benachbarten Kacheln (`alabastia`↔`route_1`, `route_1`↔`vertania_city`,
   `vertania_city`↔`vertania_wald`) nahtlos — Sichtprüfung am Bildschirm bei
   Zoom auf die jeweilige Kachelgrenze, kein sichtbarer Bruch in Weg/
   Vegetation/Licht.
3. Alle 14 Stations-Sprites liegen vor, freigestellt, an der von Phase 5
   vergebenen Datei-Adresse.
4. `ASSET_REQUIREMENTS.md` beschreibt das Batch-Prinzip.
5. `deploy.cmd content` einmal durchgeführt.

## Report-Back

*(nach Umsetzung ausfüllen)*
