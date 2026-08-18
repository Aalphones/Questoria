# Phase 4 — Druckauswahl

Karten für den Druck auswählen — in der Kachel, im Detail-Dialog, mit einer
schwebenden Leiste unten.

## Kontext (vorher lesen)

- `docs/design/HANDOFF.md` Abschnitt „9b" → Absätze „Druck-Checkbox",
  „Auswahlleiste" und die Knöpfe des Detail-Dialogs
- Ergebnis von Phase 3: `features/cards/`
- `frontend/src/app/services/game-state.service.ts` — Muster für einen kleinen
  Zustands-Dienst mit Signalen

## Abnahmekriterien

1. Die Auswahl lebt in `services/print-selection.service.ts` als Signal und
   wird **nicht** gespeichert — Neuladen leert sie (bewusst, README AK 7).
   Ein Weltwechsel leert sie ebenfalls.
2. Nur besessene Karten tragen ein Auswahl-Häkchen, oben rechts, 34 × 34 px,
   Rahmen 2,5 px, weißer Halo. Gewählt: gefüllt in `--color-accent-600` mit
   weißem Haken.
3. Ein Klick auf das Häkchen wählt aus, ohne den Detail-Dialog zu öffnen
   (Weitergabe des Klicks stoppen).
4. Die gewählte Kachel bekommt den Rahmen `--color-accent-600`.
5. Die Auswahlleiste erscheint erst ab einer gewählten Karte: fixiert unten
   mittig, Pille, 2 px Rahmen `--color-accent-500`, Inhalt „N Karten gewählt",
   „Auswahl leeren" und „Druckbogen ansehen".
6. Der Detail-Dialog hat einen Hauptknopf, der zwischen „Zum Drucken auswählen"
   und „Aus Druckauswahl entfernen" umschaltet.
7. „Druckbogen ansehen" führt auf `theme/:themeId/cards/print`.
   Die Auswahl fasst höchstens 45 Karten (fünf Blätter) — darüber sagt die
   Leiste in einem Satz, dass Schluss ist, statt eine riesige PDF zu bauen.
8. Die Reihenfolge der Auswahl bleibt erhalten (sie bestimmt später die
   Reihenfolge auf dem Bogen).
9. Erstnutzer-tauglich: das Häkchen trägt ein `aria-label`/`title` in einem
   ganzen Satz („Diese Karte zum Ausdrucken auswählen"), die Leiste sagt in
   Klartext, wie viele Karten gewählt sind.
10. Die Leiste verdeckt am unteren Rand keine Kachel dauerhaft — der Screen hat
    unten genug Polsterung (Design: 140 px).

## Checkliste

- [ ] `services/print-selection.service.ts` (`PrintSelectionService`):
      `selected(): readonly string[]`, `toggle(cardId)`, `clear()`,
      `isSelected(cardId)`, `count()`. Bindung an die aktive Welt über
      `GameStateService.activeThemeId` — beim Wechsel leeren.
- [ ] `features/cards/card-tile/`: Häkchen ergänzen (nur bei Besitz),
      Klick-Weitergabe stoppen, Rahmenzustand „gewählt".
- [ ] `features/cards/card-detail/`: Umschalt-Knopf ergänzen.
- [ ] `features/cards/print-bar/` — die schwebende Auswahlleiste.
- [ ] Knopf **„Alle freigespielten auswählen"** im Kopfbereich der Halle:
      wählt jede besessene Karte der Welt in Anzeigereihenfolge; ist schon alles
      gewählt, heißt er „Auswahl leeren". Deckel aus AK 7 beachten — bei mehr als
      45 besessenen Karten die ersten 45 wählen und das in einem Satz sagen.
- [ ] Route `theme/:themeId/cards/print` in `app.routes.ts` anlegen (Screen
      folgt in Phase 5; bis dahin gilt: die Route erst in Phase 5 abnehmen).

## Doku

- [ ] `docs/code-map.md`: `services/print-selection.service.ts` in der
      Service-Zeile ergänzen.

## Report-Back
