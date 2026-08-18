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

- [ ] → **Entscheidung Sascha, betrifft Phase 3:** Eine Multiple-Choice-Aufgabe
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

- [ ] → **Doku-Fehler, jetzt melden:** Das Schema (Abschnitt 4) verspricht,
  dass eine Episode einem ausgelagerten Event Auftritts-Felder mitgeben darf —
  Beispiel `"background": "sturmsee.webp"`. Die Episode-Ansicht liest den
  Hintergrund aber ausschließlich aus `episode.background`
  (`frontend/src/app/features/episode/episode.ts`, `backgroundUrl`); ein
  `background` im Event-`config` wird zwar sauber durchgereicht
  (`resolve-event-config.ts`), aber von niemandem angezeigt. Entweder die
  Engine nachziehen oder das Beispiel aus dem Schema streichen. *(Nur
  `background` geprüft, `music` nicht.)*

- [x] → **Phase 2:** *Geschlossen durch den `word_match`-Plan
  ([2026-08-18_wort-bild-paare.md](../2026-08-18_wort-bild-paare.md)).* Statt
  des Behelfs mit einer neutralen Wortkarten-Grafik gibt es jetzt einen
  eigenen Eventtyp: Bilder und Wortkarten stehen getrennt, das Kind ordnet zu.
  Die beiden Wortkarten-Aufgaben (`wortkarte_1`/`_2`) sind durch
  `wortpaare_1`/`_2` ersetzt, `antwort_wortkarte.png` entfällt.

- [ ] → **Phase 2:** `ASSET_REQUIREMENTS.md` verlangt für jede Figur alle vier
  Gefühlsbilder (`neutral`, `happy`, `worried`, `angry`) und nennt das „nicht
  optional". Bestellt sind nur die acht tatsächlich benutzten — 16 Sprites für
  eine Welt mit vier Figuren, von denen zwei nur „Pika" sagen, ist Aufwand ohne
  Gegenwert. Wenn die Vorgabe so gemeint ist, gehört sie entschärft; wenn nicht,
  fehlen acht Dateien.

- [x] → **Phase 2:** Die Welt braucht **52 Bilddateien**, nicht die im Plan
  geschätzten „rund 25" — Liste in [bestellliste.md](bestellliste.md). Treiber
  sind die Antwortbilder (25), weil jede Aufgabe drei Lernstufen mit je vier
  Bildantworten hat, und die Zuordnungs-Aufgabe (`word_match`) pro Wort ein
  eigenes Bild statt der einen Wortkarten-Grafik braucht. *(Zahl war zunächst
  47, gestiegen durch den `word_match`-Umbau — sechs neue Wortbilder,
  `antwort_wortkarte.png` entfällt.)*

- [ ] → **Phase 3:** Alle Kartenkoordinaten (drei Orte, eine Etappe, die
  Weltkugel auf der Planetenkarte) sind geraten — die Kartenbilder gibt es noch
  nicht. Nach Phase 2 einmal im Spiel öffnen und die Punkte auf die echten
  Landmarken schieben. Dasselbe gilt für die Suchziel-Koordinaten der drei
  Bildsuchen.
