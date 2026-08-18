# Phase 2 — Kartenvergabe im Spielfluss

Das `reward`-Event vergibt die Karte wirklich, und das Ergebnis feiert sie.

## Kontext (vorher lesen)

- `frontend/src/app/features/events/reward/reward.ts` und `reward.types.ts` —
  merkt bisher nur `card_id` in `EpisodeRun.pendingCardId`
- `frontend/src/app/features/episode/episode-run.ts` — Laufzustand
- `frontend/src/app/features/episode/episode.ts` — wo der Lauf endet und das
  Ergebnis entsteht (Muster: dort werden auch Erfolge vergeben)
- `frontend/src/app/features/result/result.ts|html|scss` — Ergebnis-Screen
- `docs/design/HANDOFF.md` Abschnitt „9a. Kartenvergabe im Spielfluss" —
  verbindliches Aussehen des Banners
- Ergebnis von Phase 1: `services/card.service.ts`
- `frontend/src/app/ui/image-slot/` — Bildfläche mit Platzhalter

## Abnahmekriterien

1. Endet eine Episode mit gemerkter `card_id`, ist die Karte danach im
   Spielstand freigeschaltet — an derselben Stelle, an der auch Erfolge und
   Statistiken weggeschrieben werden, nicht in der `reward`-Komponente selbst.
2. Das Ergebnis zeigt das Banner nur, wenn die Karte **in diesem Lauf neu**
   dazukam. Beim Wiederholen derselben Episode erscheint kein Banner.
3. Struktur des Banners nach Design (prüfbare Punkte): waagerechte Karte,
   3 px Rahmen in `--color-accent-500`; links das Kartenbild mit
   Seitenverhältnis 63/88, 112 px breit; rechts Seltenheits-Tag
   „Neue Sammelkarte · <Seltenheit>" in Großbuchstaben, Name als Überschrift,
   Spruch darunter (höchstens 34 Zeichen Breite), Knopf „In die Trophäenhalle".
4. Der Knopf führt auf die Halle der aktuellen Welt.
5. Die Seltenheitsfarben kommen aus der Tabelle in HANDOFF.md Abschnitt
   „Seltenheitsstufen" und stehen als Zweck-Tokens in `styles/_tokens.scss`
   (`--color-rarity-haeufig-bg` usw.) — keine Hex-Werte in der Komponente.
6. Fehlt das Kartenbild, zeigt die Bildfläche den Platzhalter, das Banner
   bleibt heil.
7. Vorlesemodus: Name und Spruch werden im Modus „Bilder & Vorlesen"
   mitgesprochen, wenn das Ergebnis vorgelesen wird.

## Checkliste

- [ ] `styles/_tokens.scss`: Zweck-Tokens für die drei Seltenheitsstufen
      (Hintergrund, Text, Statuspunkt) plus die Werte für „verschlossen"
      aus der Design-Tabelle.
- [ ] In `features/episode/episode.ts` beim Lauf-Ende: liegt eine
      `pendingCardId` vor, `CardService.unlock(themeId, cardId)` rufen und den
      Rückgabewert (neu ja/nein) zusammen mit der Karten-ID an das Ergebnis
      weitergeben — auf demselben Weg wie die neu freigeschalteten Erfolge.
- [ ] `features/events/reward/reward.ts`: Kommentar zum Meilenstein 5
      berichtigen; die Komponente merkt weiterhin nur, sie vergibt nicht selbst
      (der Lauf kann abgebrochen werden, bevor er endet).
- [ ] `features/result/`: neues Banner. Kartendaten über `WorldConfig.cards`
      (aus dem Resolver) nach ID auflösen; Bildadresse über
      `ContentService.assetUrl(themeId, 'cards', card.asset)`.
- [ ] Banner nur rendern, wenn die Karte in diesem Lauf neu war (AK 2).
- [ ] Knopf „In die Trophäenhalle" → `['/theme', themeId, 'cards']`
      (die Route entsteht in Phase 3; bis dahin zeigt sie ins Leere — deshalb
      diese Zeile **zusammen mit Phase 3 abnehmen**, nicht davor).
- [ ] Vorlese-Text des Ergebnisses um Kartenname und Spruch ergänzen.

## Doku

- [ ] `docs/code-map.md`: bei `features/result/` „noch kein Karten-Banner"
      streichen, bei `features/events/reward/` die Einschränkung „vergibt noch
      keine Sammelkarte" ersetzen.

## Report-Back
