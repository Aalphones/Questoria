# Findings — Erste echte Welt

Was der erste echte Content über Engine und Schema verrät. Format:

```
- [ ] → Phase N: <Erkenntnis, ein Satz>
```

Erkenntnisse, die über diesen Plan hinausgehen, bekommen stattdessen eine
Einordnung: *jetzt geschlossen* / *Meilenstein 5* / *später, eigener Plan*.
Abgearbeitete Zeilen abhaken, nicht löschen.

---

## Aus Phase 1 (Weltgerüst)

- [x] → **jetzt geschlossen, überholt durch `word_match` (20.08.2026):** Die
  beschriebene Notlösung ist gar nicht im Content gelandet — der eigene
  Eventtyp `word_match` (Bilder und Wortkarten getrennt, das Kind ordnet zu)
  löst genau diese Aufgabe, und `wortpaare_1`/`_2` nutzen ihn. Die Plan-Regel
  „das zu lesende Wort steht nie in der Frage" ist damit **nicht verletzt**;
  ein Feld `question_image` in der Multiple-Choice-Form braucht diese Welt
  nicht. Der Befund über die Aufgabenform selbst bleibt richtig und steht
  unten als Follow-up für [Curriculum & Variation](../../../planning/2026-08-19_curriculum-und-variation/README.md),
  falls eine spätere Welt ein Bild in der Frage braucht. Ursprünglicher
  Wortlaut zur Nachvollziehbarkeit:
  **Entscheidung Sascha, betrifft Phase 3:** Eine Multiple-Choice-Aufgabe
  kann **kein Bild in der Frage** zeigen — die Aufgabenform kennt nur Frage,
  vier Antworten (je mit Bild) und die richtige Nummer
  (`frontend/src/app/models/content.types.ts`, `MultipleChoiceConfig`). Die im
  Plan beschriebene Wort-Bild-Zuordnung („das Bild steht in der Frage, die vier
  Antworten sind geschriebene Wörter") ist so **nicht baubar**. Gebaut ist
  stattdessen: das Zielwort wird in der Frage **gesprochen** („Auf einer Karte
  steht Ball. Welche Karte ist es?"), die vier Antworten sind geschriebene
  Wörter. Gelesen werden muss weiterhin — das gesprochene Wort verrät die
  Schreibweise nicht. Es verletzt aber den Wortlaut der Plan-Regel „das zu
  lesende Wort steht nie in der Frage". Alternative wäre ein neues Feld
  `question_image` in der Aufgabenform plus Anpassung der Komponente.

- [x] → **jetzt geschlossen, Doku korrigiert (19.08.2026):** Das Schema
  (Abschnitt 4) versprach, dass eine Episode einem ausgelagerten Event
  Auftritts-Felder mitgeben darf — Beispiel `"background": "sturmsee.webp"`,
  `"music": "battle.mp3"`. Beide waren tot: `episode.ts` (`backgroundUrl`)
  liest den Hintergrund ausschließlich aus `episode.background`, ein
  `music`-Feld liest im ganzen Frontend niemand (geprüft, kein Treffer). Kein
  Content dieser Welt nutzte die Felder. Statt die Engine für ein
  Content-Plan-Nebenbei nachzuziehen: Beispiel aus dem Schema gestrichen, die
  Regel "Hintergrund kommt nur aus dem Episode-Feld, kein Pro-Event-Override"
  jetzt explizit benannt.

- [x] → **Phase 2:** *Geschlossen durch den `word_match`-Plan
  ([2026-08-18_wort-bild-paare.md](../2026-08-18_wort-bild-paare.md)).* Statt
  des Behelfs mit einer neutralen Wortkarten-Grafik gibt es jetzt einen
  eigenen Eventtyp: Bilder und Wortkarten stehen getrennt, das Kind ordnet zu.
  Die beiden Wortkarten-Aufgaben (`wortkarte_1`/`_2`) sind durch
  `wortpaare_1`/`_2` ersetzt, `antwort_wortkarte.png` entfällt.

- [x] → **jetzt geschlossen, Vorgabe entschärft (20.08.2026):**
  `ASSET_REQUIREMENTS.md` verlangte für jede Figur alle vier Gefühlsbilder
  (`neutral`, `happy`, `worried`, `angry`) und nannte das „nicht optional".
  Bestellt sind nur die acht tatsächlich benutzten — und die Welt ist damit
  vollständig durchgespielt. Die Vorgabe war schlicht falsch formuliert:
  Pflicht ist jedes Sprite, **das eine Dialogzeile nennt**, nicht jedes
  denkbare Gefühl pro Figur. Abschnitt 2 von `ASSET_REQUIREMENTS.md` sagt das
  jetzt so.

- [x] → **Phase 2:** Die Welt braucht **52 Bilddateien**, nicht die im Plan
  geschätzten „rund 25" — Liste in [bestellliste.md](bestellliste.md). Treiber
  sind die Antwortbilder (25), weil jede Aufgabe drei Lernstufen mit je vier
  Bildantworten hat, und die Zuordnungs-Aufgabe (`word_match`) pro Wort ein
  eigenes Bild statt der einen Wortkarten-Grafik braucht. *(Zahl war zunächst
  47, gestiegen durch den `word_match`-Umbau — sechs neue Wortbilder,
  `antwort_wortkarte.png` entfällt.)*

- [x] → **Phase 3, erledigt (19./20.08.2026):** Alle Kartenkoordinaten (drei
  Orte, eine Etappe, die Weltkugel auf der Planetenkarte) waren geraten. Am
  fertigen Bild geprüft: Route-1-Punkte und Etappen-Position treffen ihre
  Landmarke, die Planetenkarten-Kachel lag im leeren Himmel und ist auf
  `x: 73, y: 78` korrigiert (eigener Eintrag unten). Die Suchziel-Koordinaten
  der drei Bildsuchen sind am 20.08.2026 im Spiel bestätigt — jedes Ziel ist
  triggerbar.

## Aus Phase 3 (echte Runde, 19.08.2026)

- [x] → **jetzt geschlossen, Engine-Bug:** Vertonung spielte bei keiner Zeile
  ab. Ursache: `dialog.ts` (`audioUrl`) hängte den Ordner `audio/voices`
  **zusätzlich** vor einen `audio_path`, der ihn schon enthält
  (`"audio/voices/prof_eich_….mp3"`) — Ergebnis war ein doppelter, nicht
  existierender Pfad, stiller Fallback auf `speechSynthesis`. Fix: `dialog.ts`
  nutzt jetzt `themeAssetUrl()` (kein zweiter Ordner-Parameter) statt
  `assetUrl()`. **Am Bildschirm bestätigt (19.08.2026): Vertonung spielt ab.**

- [x] → **jetzt geschlossen, Entscheidung Sascha: Bild verdrahten.** Die
  Etappenkarte (`Timeline`, `frontend/src/app/features/timeline/timeline.html:11`)
  übergab der `MapCanvas` hart `[background]="null"`, obwohl der Content
  `arc_overview.background: "map_route_uebersicht.webp"` liefert — sichtbar
  im Spiel als leeres grünes Karo-Raster statt der Übersichtskarte. Fix:
  `Timeline` liest jetzt `arc_overview.background` genau wie `MapScreen` es
  für die Ortskarte schon tut (`content.assetUrl(themeId, 'maps', …)`), der
  irreführende „ist Absicht"-Kommentar in `map-canvas.ts` ist korrigiert. **Am
  Bildschirm bestätigt (19.08.2026): Übersichtskarte wird angezeigt.** Das `episode.background`-Finding aus
  Phase 1 bleibt offen — anderer Screen, andere Baustelle.

- [x] → **aufgeplant am 19.08.2026, umgesetzt und abgenommen am selben Tag:**
  [docs/archive/2026-08/2026-08-19_ui-umbau-vollbild/](../2026-08-19_ui-umbau-vollbild/README.md),
  fünf Phasen. Alle sechs Punkte unten sind dort aufgenommen; die gemeinsame
  Ursache ist belegt — es gibt im Frontend keine einzige Höhenangabe für die
  Bühne, deshalb rollt der Browser die ganze Seite. Sammelnotiz aus der ersten
  echten Spielrunde, alles Layout/Vollbild/Design, keine Content-Fehler dieser
  Welt:
  - Planetenkarte (`main-hub`) füllt nicht den Bildschirm; kein Pfad
    zwischen den Welten; kein horizontales Scrollen bei mehr Welten, ohne
    dass sich der Hintergrund mitverschiebt.
  - Route-1-Kartenbild (Ortskarte) wird korrekt angezeigt, aber mit
    sichtbarem Scrollbalken statt echtem Vollbild.
  - Lernstufen-Auswahl (`level`-Screen) ist fast leer, nur Text-Chips — Wunsch:
    Grafiken pro Stufe (z. B. je Figur wie Ash/Misty/Rocko im Pokémon-Theme),
    Schwierigkeit soll optisch aus dem Bild hervorgehen. Das ist generisch zu
    lösen (funktioniert über alle Themes), nicht Pokémon-hartkodiert — braucht
    also auch ein Content-Konzept, nicht nur Engine-Arbeit.
  - Bildsuche-Event: soll präsenter/vollflächig sitzen, „Weiter"-Button und
    „Richtig"-Text sollen ohne Scrollen im Bild liegen.
  - „Ort geschafft"-Screen: Text ist auf dem Hintergrundbild kaum lesbar
    (keine Kontrastfläche), das Konfetti-/Glitzer-Overlay legt sich über den
    Text statt dahinter, insgesamt zu wenig Feier für einen Erfolgsmoment.
  - Übergreifend: alle Spiel-Screens sollen echtes Vollbild ohne
    Scrollbalken sein — vermutlich eine gemeinsame Ursache (Viewport-Höhe im
    App-Shell), lohnt sich als eine Grundlagen-Aufgabe statt Screen für
    Screen zu flicken.
  
  Cross-cutting, viele Dateien, kein Fall für einen Ad-hoc-Fix mitten im
  Content-Plan — braucht einen eigenen `mode-planning`-Durchlauf.

- [x] → **jetzt geschlossen, Koordinaten-Fehler bestätigt und behoben.** Die
  Planetenkarten-Koordinate der Pokémon-Kachel (`data/main_hub.json`,
  `x: 63, y: 36`) lag im leeren Wolkenhimmel zwischen den Inseln —
  bildgenau geprüft, kein Objektzuschnitt hätte das gerettet. Neue
  Koordinate `x: 73, y: 78` trifft die Insel unten rechts auf
  `map_planetenkarte.webp`. **Nebenbefund erledigt sich von selbst:**
  `dev_fixture` (`x: 32, y: 54`) traf ebenfalls keine Insel — die Testwelt
  ist am 19.08.2026 auf Sascha-Wunsch komplett entfernt (Ordner, Hub-Eintrag,
  Doku-Verweise; der Sammelkarten-Plan testet künftig an `pokemon_lesen`
  statt an `dev_fixture`).
  Die drei Route-1-Koordinaten (Labor 20/62, Wiese 50/38, Wald 79/58) und
  die Etappen-Position auf der Übersichtskarte (44/50) wurden am Bild
  geprüft und treffen alle plausibel ihre Landmarke — keine Korrektur
  nötig.
