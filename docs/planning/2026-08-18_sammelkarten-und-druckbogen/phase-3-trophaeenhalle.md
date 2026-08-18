# Phase 3 — Trophäenhalle

Der Screen, auf dem ein Kind seine Sammlung ansieht.

## Kontext (vorher lesen)

- `docs/design/HANDOFF.md` Abschnitt „9b. Trophäenhalle (`cards`)" —
  **verbindliches** Zielbild, Maße und Texte 1:1
- `docs/design/prototype/index.html` (nur Referenz für das Aussehen)
- `frontend/src/app/app.routes.ts` — Muster der bestehenden Welt-Routen
- `frontend/src/app/features/main-hub/` — Muster für einen Screen mit Kopfleiste
  und Panel; `features/main-hub/main-hub.html` zeigt, wie `qst-hud` eingebunden wird
- `frontend/src/app/ui/image-slot/`, `frontend/src/app/ui/read-aloud-button/`
- Ergebnis von Phase 1: `services/card.service.ts`, `services/card.rules.ts`
- Konventionen: `docs/conventions/angular.md`, `docs/conventions/css.md`

## Abnahmekriterien

1. Route `theme/:themeId/cards` mit `authGuard`, `profileChosenGuard` und
   `worldConfigResolver` — **ohne** `difficultyChosenGuard`: die Sammlung hängt
   nicht an der Lernstufe.
2. Kopfbereich zweispaltig und umbrechend: links Kicker „Trophäenhalle · <Weltname>",
   Überschrift „Deine Sammelkarten", Vorlese-Knopf mit modusabhängigem
   Hinweistext (Texte wörtlich aus HANDOFF 9b); rechts die Fortschrittskarte
   mit großer Besitz-Zahl, „von N Karten", Fortschrittsbalken und Fußnote.
3. Drei Filter-Pillen „Alle Karten" / „Freigespielt" / „Noch offen", die aktive
   in `--color-accent-500` auf Weiß. Filterzustand lebt im Screen (flüchtig).
4. Gruppen nach `set` in Reihenfolge des ersten Auftretens, je mit Name,
   Zähler („3 Karten" / „1 Karte") und Trennlinie über die Restbreite.
5. Kartenkachel 184 px breit, Seitenverhältnis 63/88, 3 px Rahmen:
   besessen `--color-neutral-100`, verschlossen `--color-neutral-300`.
   Besessen zeigt das Kartenbild, verschlossen das diagonale Streifenmuster mit
   Schloss-Piktogramm und dem `hint` (Ersatztext „Spiele weiter, um sie zu
   finden", wenn keiner da ist). Statuspunkt oben links in der Seltenheitsfarbe.
6. Unter der Kachel Name und Seltenheits-Label; verschlossene Karten tragen
   „Noch verschlossen" in `--color-neutral-600`.
7. Klick auf eine **besessene** Karte öffnet den Detail-Dialog, verschlossene
   Karten sind keine Schaltfläche (kein Zeiger-Cursor, kein Tastaturfokus).
8. Detail-Dialog nach HANDOFF: Overlay, Klick daneben schließt, links das Bild
   (höchstens 268 px), rechts Seltenheits-Tag, Name, Spruch und der Metablock
   mit „Fundort", „Erhalten" (Datum aus dem Spielstand) und
   „Druckformat: 63 × 88 mm · 300 dpi". Als `<dialog>`-Element, nicht als `div`.
9. Bedienbar ohne Erklärung: Filter tragen `title`/`aria-label` in ganzen
   Sätzen (Muster: `hud.html`, `levelExplanation`), Tastaturbedienung für
   Kacheln und Dialog funktioniert, alle Schaltflächen mindestens 46 px hoch.
10. Leerer Fall: hat die Welt keine Karten (`cards: []`), zeigt der Screen einen
    Satz statt einer leeren Fläche („Diese Welt hat noch keine Sammelkarten.").

## Checkliste

- [ ] `app.routes.ts`: Route `theme/:themeId/cards` → `features/cards/cards.ts`
      (Klasse `CardsHall`), gleiche Struktur wie die bestehenden Welt-Routen.
- [ ] `features/cards/cards.ts|html|scss` — Screen mit `qst-hud`, Kopfbereich,
      Fortschrittskarte, Filtern, Gruppen. Karten aus dem Resolver
      (`WorldConfig.cards`), Besitz aus `CardService`, Gruppieren/Filtern über
      `card.rules.ts` — **keine Logik im Template**.
- [ ] `features/cards/card-tile/` — eine Kachel (Eingaben: Karte, besessen ja/nein,
      Bildadresse). Die Druck-Checkbox kommt erst in Phase 4 dazu; hier keine
      Attrappe bauen.
- [ ] `features/cards/card-detail/` — der Detail-Dialog als `<dialog>`.
- [ ] Blockname je Komponente nach BEM (`cards-hall__…`, `card-tile__…`,
      `card-detail__…`), alle Werte aus Zweck-Tokens, Seltenheitsfarben aus den
      in Phase 2 angelegten Tokens.
- [ ] Bewegung (`eqPop` für den Dialog, Hover-Anhebung) mit
      `prefers-reduced-motion`-Zweig — sonst ist die Animation nicht fertig.
- [ ] Vorlese-Text des Screens an `NarrationService` hängen, Muster wie auf den
      anderen Screens.

## Doku

- [ ] `docs/code-map.md`: Routen-Tabelle um `theme/:themeId/cards` ergänzen,
      Ist-Stand-Absatz um `features/cards/` erweitern.

## Report-Back
