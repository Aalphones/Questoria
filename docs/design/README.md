# Design — Questoria

Visuelle und interaktive Vorlage für die gesamte Spieloberfläche. Erstellt am
31.07.2026 mit Claude Design, wortgetreu übernommen in
[HANDOFF.md](HANDOFF.md), lauffähiger Prototyp unter [prototype/](prototype/).

## Was hier verbindlich ist — und was nicht

| Teil | Status |
|---|---|
| Farben, Typografie, Abstände, Radien, Schatten — Quelle: [prototype/ds/styles.css](prototype/ds/styles.css), Überblick in HANDOFF.md → „Design Tokens" | **Verbindlich.** Diese Datei ist die einzige Wahrheit für Token-Werte; das Frontend übernimmt sie 1:1 als CSS-Custom-Properties. Pixelnah umsetzen, aber als Angular-Komponenten — nicht das Prototyp-HTML kopieren. |
| Screen-Aufbau, Zustände, Copy, Animationen (HANDOFF.md) | **Verbindlich** als Zielbild. |
| Druckbogen-Geometrie (mm-Raster, `@page`-Regeln) | **Verbindlich, 1:1.** Wer hier px statt mm rechnet, druckt Karten, die nicht in die Hüllen passen. |
| `prototype/index.html`, `support.js`, `image-slot.js` | **Nur Referenz.** Eigene Template-Runtime des Prototyps — wird nicht nachgebaut, existiert nur, damit der Prototyp lokal läuft. |
| `prototype/data/world_piraten.json` | **Nur Referenz.** Beispiel-Content in einer eigenen, flachen Struktur — nicht das Content-Schema. Verbindlich ist [JSON_SCHEMA_REFERENCE.md](../../data/_authoring/JSON_SCHEMA_REFERENCE.md). |
| Alle Bildflächen | Platzhalter mit erwartetem Dateinamen. Reale Assets nach [ASSET_REQUIREMENTS.md](../../data/_authoring/ASSET_REQUIREMENTS.md). |

## Screens → Frontend-Features

Der Prototyp führt zehn Screens als eine Zustandsmaschine. Im Angular-Frontend
werden daraus Routen/Features (siehe [code-map.md](../code-map.md)):

| Screen im Prototyp | Feature | Inhalt |
|---|---|---|
| *(kein Prototyp-Screen)* | `features/auth/` | Echter Anmeldebildschirm (E-Mail/Passwort) — kommt vor der Profilauswahl, freihändig gebaut aus vorhandenen Tokens, siehe Abweichung 9 |
| `login` | `features/profile/` | Profilauswahl, 3 Demo-Profile + „Neues Profil" — der Prototyp-Name ist irreführend: das ist die Profilwahl, **nicht** die Anmeldung (siehe Abweichung 9) |
| `hub` | `features/main-hub/` | Planetenkarte mit den installierten Themenwelten |
| `level` | `features/main-hub/level-select/` | Lernstufen-Auswahl (Matrose/Navigator/Kapitän) — eigener Screen unter derselben Feature-Wurzel |
| `timeline` | `features/timeline/` | Etappenkarte der Story-Arcs, Sterne pro Etappe |
| `map` | `features/map/` | Ortskarte eines Arcs, Nodes + Routen + Kompassrose |
| `dialog` | `features/events/dialog/` | Visual-Novel-Layout, zwei Bühnenplätze `left`/`right` — ein Eventtyp wie jeder andere |
| `minigame` | `features/events/multiple-choice/` | Multiple Choice im Prototyp, weitere Eventtypen folgen |
| `result` | `features/result/` | Sterne, Statistiken, Erfolg, Banner für die neue Sammelkarte |
| `cards` | `features/cards/` | Trophäenhalle: Gruppen, Filter, Kartendetail, Druckauswahl |
| `print` | `features/cards/print/` | A4-Druckbogen, 3×3-Raster, Schnittmarken |

Die globale Kopfleiste (HUD) ist auf allen Screens außer `login` sichtbar →
`ui/hud/`.

## Bewusste Abweichungen vom Prototyp

Der Prototyp ist Design-Vorlage, keine Architekturvorlage. Diese Stellen
weichen in der Umsetzung ab — jeweils mit Grund:

0. ✅ **Der Prototyp kannte noch keine Eventliste.** Er hat feste Screens
   `dialog` und `minigame` und eine fest verdrahtete Abfolge dazwischen.
   Produktiv ist eine Episode eine Eventliste, die die Event Engine abspielt
   ([ADR-004](../decisions/004-event-engine.md)) — das Aussehen der beiden
   Screens bleibt gültig, ihre Rolle als Sonderweg nicht. Auch die Vokabeln im
   Prototyp-Code (`minigame`, `game_type`) sind alter Stand und werden nicht
   nachgezogen; verbindlich ist [glossary.md](../glossary.md). **Gebaut:** fünf
   Eventtypen laufen über denselben Ablaufmechanismus, die Testwelt
   `dev_fixture` spielt alle fünf in einer Episode durch.
1. **Content bleibt gesplittet.** Der Prototyp packt Welt, Etappen, Orte und
   Karten in eine Datei. Das Projekt bleibt bei `main_hub.json` /
   `world_config.json` / Episoden / Event-Konfigurationen. Das Kartenformat und
   die Kartenliste hängen an `world_config.json`, die Node-Geometrie an der
   jeweiligen Map.
2. **Node-Positionen liegen bei der Map, nicht bei der Episode.** Die Karte
   kennt ihre Punkte (Prozent-Koordinaten relativ zum Kartenbild), die Episode
   verweist nur über `node_id` darauf. Geometrie zum Bild, Inhalt zur Episode.
3. **Antwortbilder werden benannt, nicht geraten.** Der Prototyp leitet den
   Dateinamen eines Bildantwort-Slots aus dem Antworttext ab. Produktiv steht
   der Dateiname im Content — sonst bricht jede Textkorrektur ein Bild.
4. **Kartenvergabe ist ein eigenes Event.** Im Prototyp ist die gewonnene Karte
   fest verdrahtet; produktiv steht am Ende der Eventliste ein `reward`-Event
   mit der Karten-ID in seiner Konfiguration.
5. **„Weiter" statt „Minispiel starten".** Der Prototyp beschriftet den
   Übergang vom Dialog zur Aufgabe mit dem Namen der Spielart. Produktiv
   heißt der Knopf schlicht „Weiter" — die Aufgabe folgt ohnehin als
   nächstes Event, ein Eventname im Knopf würde eine Kategorie betonen, die
   für das Kind keine Rolle spielt.
6. **Weiterraten statt Sperre.** Der Prototyp sperrt eine Aufgabe nach dem
   ersten falschen Klick endgültig. Produktiv bleibt sie offen — falsche
   Antworten werden ausgegraut, das Kind darf weiterprobieren, bis die
   richtige gefunden ist. Für die Sterne zählt trotzdem nur der erste
   Versuch (Entschieden-vor-dem-Bauen, Punkt 1 im Plan).
7. ✅ **Die dritte Statistik-Karte heißt anders als im Prototyp.** Der
   Prototyp zeigt „Neue Wörter gelernt" — diese Zahl gibt es in keiner Spalte
   und hätte erfunden werden müssen. **Gebaut** (Plan Phase 8): die dritte
   Kachel zeigt „Aufgaben geschafft", die über alle Läufe gewachsene Zahl
   dieser Welt aus der Statistik-Tabelle.
8. **Kein Mockup für `text_input` und `image_search`.** Der Prototyp bildet
   nur `dialog` und `minigame` (Multiple Choice) visuell ab. Beide neuen
   Aufgaben-Typen übernehmen die gemeinsame Aufgaben-Hülle (`ui/task-card/`)
   und folgen deren Bildsprache, ohne eigene Prototyp-Vorlage.
9. **Kein Mockup für den Account-Login.** Der Prototyp-Screen `login` ist die
   Profilauswahl (`features/profile/`, Phase 4), nicht die neue
   E-Mail/Passwort-Anmeldung davor. `features/auth/login.ts` baut freihändig,
   aber ausschließlich aus vorhandenen Tokens: gleiche Deko wie die
   Profilauswahl (Kreis, Wolken-Pillen, Wellen-Halbkreise), Kicker + H1
   „Questoria", eine Karte mit E-Mail-/Passwort-Feld. Struktur im Detail:
   [phase-3-anmeldebildschirm.md](../planning/2026-08-17_nutzerverwaltung-und-spielstand/phase-3-anmeldebildschirm.md).

## Offene Punkte

- ✅ **Node-Größen sind im Prototyp px-Werte** (`size: 200`, `width: 132`),
  während die Positionen in Prozent stehen. Auf kleinen Viewports rücken die
  Knoten dadurch zusammen und überlappen. **Gelöst:** `qst-map-point` gibt die
  Größe als Container-Einheit (`cqw`, Anteil der Kartenbreite) an seine Kinder
  weiter — die Knoten schrumpfen mit der Karte statt zu überlappen.
- ✅ **Der Prototyp verzerrt die Routen-Kurven** (`preserveAspectRatio="none"`).
  **Gelöst:** `qst-map-canvas` hat ein festes Seitenverhältnis 16:9, deshalb
  braucht die Routenebene keine Verzerrung mehr (Standard-`preserveAspectRatio`)
  und Kurven treffen die Knoten auf jeder Fensterbreite.

## Prototyp starten

```bash
npx serve docs/design/prototype
```

Dann `index.html` öffnen. Direkt per `file://` schlägt das Laden des
Beispiel-Contents fehl; der Prototyp fällt dann auf eine eingebettete Kopie
zurück und sieht identisch aus.

## Nicht Teil dieses Designs

Das ursprünglich mitgelieferte Konzept eines Sammelkarten-**Generators**
(Template-Editor, Layer, Auto-Shrink, PDF-Export) gehört zu einem anderen
Projekt und wurde bewusst nicht ins Repo übernommen. Questoria erzeugt keine
Karten — es zeigt fertige Kartenbilder, schaltet sie frei und druckt sie.
