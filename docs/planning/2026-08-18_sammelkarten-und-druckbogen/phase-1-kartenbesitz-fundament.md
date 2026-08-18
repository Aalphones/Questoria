# Phase 1 — Kartenbesitz-Fundament

Die Karten kommen aus dem Content ins Frontend, und der Spielstand lernt, wer
welche Karte wann bekommen hat. Sichtbar wird davon noch nichts.

## Kontext (vorher lesen)

- [../../decisions/009-spielstand-aufteilung.md](../../decisions/009-spielstand-aufteilung.md) — warum was wo im Spielstand liegt
- [../../decisions/007-ausgelagerte-events-ueber-die-schnittstelle.md](../../decisions/007-ausgelagerte-events-ueber-die-schnittstelle.md) — Muster für Content über die Schnittstelle
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 3 — verbindliches Schema von `cards.json`
- `backend/src/Services/ContentService.php`, `backend/src/Controllers/ContentController.php`
- `backend/src/Validators/SavegameValidator.php`
- `frontend/src/app/models/content.types.ts`, `frontend/src/app/models/savegame.types.ts`
- `frontend/src/app/services/savegame.service.ts`, `frontend/src/app/services/achievement.service.ts` (Muster für einen Dienst mit Puffer)
- `frontend/src/app/services/content.service.ts`
- Konventionen: `docs/conventions/php.md`, `docs/conventions/typescript.md`, `docs/conventions/angular.md`

## Abnahmekriterien

1. `GET /api/content/themes/{themeId}` liefert `cards` und `card_format` genau
   in der Form aus dem Kontrakt der README. Fehlt `cards.json`, kommt
   `cards: []` und `card_format: null` — kein Fehler, keine Ausnahme.
2. `WorldConfig` im Frontend trägt beide Felder typisiert; `rarity` ist eine
   geschlossene Union (`'haeufig' | 'selten' | 'legendaer'`).
3. Ein neu geschriebener Spielstand hat `version: 2` und ein `cards`-Objekt.
   Ein vom Server geladener Stand der Version 1 wird beim Laden auf Version 2
   gehoben (leeres `cards`), ohne dass der Fortschritt verloren geht.
4. Der Server nimmt einen Stand der Version 2 an und lehnt Version 1 mit `422`
   ab (der Schutz aus ADR-009 bleibt scharf, er zeigt nur eine Stufe weiter).
5. `CardService.unlock(themeId, cardId)` ist idempotent: ein zweiter Aufruf
   ändert weder Datum noch Anzahl.
6. Zwei ADRs liegen geschrieben vor.

## Checkliste

### Backend

- [ ] `ContentService::world()` liest zusätzlich `cards.json` aus dem
      Welt-Ordner und hängt `cards` (Array) und `card_format` (Objekt oder
      `null`) an die Antwort. Fehlende Datei → `[]` / `null`, gleiche
      Pfadprüfung wie bisher (`assertValidId`, `themePath`).
- [ ] `SavegameValidator::SUPPORTED_STATE_VERSION` von `1` auf `2`.

### Frontend — Typen

- [ ] `models/content.types.ts`: `CardRarity`, `CollectibleCard`
      (`id`, `name`, `set`, `rarity`, `asset`, `flavor`, `hint`), `CardFormat`
      (`width_mm`, `height_mm`, `canvas`, `dpi`, `sheet`, `grid`); `WorldConfig`
      um `cards: readonly CollectibleCard[]` und `card_format: CardFormat | null`
      erweitern.
- [ ] `models/savegame.types.ts`: `SavegameState.version` auf `2`, neues Feld
      `readonly cards: Readonly<Record<string, string>>` (Karten-ID → `YYYY-MM-DD`),
      `EMPTY_SAVEGAME_STATE` um `cards: {}` ergänzen.

### Frontend — Aufstieg auf Version 2

- [ ] In `savegame.service.ts` beim Übernehmen einer Server-Antwort jeden Stand
      durch eine neue reine Funktion `upgradeSavegameState(state: unknown): SavegameState`
      schicken (neue Datei `services/savegame.upgrade.ts`): Version 2 →
      unverändert; Version 1 → dieselben Felder plus `cards: {}` und
      `version: 2`; alles andere → `EMPTY_SAVEGAME_STATE`.
- [ ] Denselben Aufstieg auf den gepufferten Browser-Stand anwenden
      (`readMirror()`), sonst hängt ein alter Puffer in Version 1 fest.

### Frontend — Kartendienst

- [ ] Neu `services/card.service.ts` (`CardService`), Muster: liest wie
      `ProgressService` aus `SavegameService`, schreibt über denselben
      Puffer-Weg — **kein eigener Speicher, kein eigener Endpunkt**.
      - `ownedCards(themeId: string): Readonly<Record<string, string>>` — ID → Datum
      - `isOwned(themeId: string, cardId: string): boolean`
      - `unlock(themeId: string, cardId: string): boolean` — schreibt Datum
        `new Date().toISOString().slice(0, 10)`, gibt `false` zurück, wenn die
        Karte schon da war (idempotent, AK 5)
      - `ownedCount(themeId: string): number`
- [ ] Reine Regeln, die keinen Dienst brauchen (Gruppieren nach `set`, Zählen,
      Filtern), in `services/card.rules.ts` — analog `progress.rules.ts` /
      `achievement.rules.ts`:
      - `groupCardsBySet(cards, ownedIds)` → Gruppen in Reihenfolge des ersten
        Auftretens, je mit Name, Karten und Anzahl
      - `filterCards(cards, ownedIds, filter: 'alle' | 'freigespielt' | 'offen')`

### Doku

- [ ] `docs/decisions/011-karten-im-welt-aufruf.md` — Kontext (Karten hängen an
      jeder Welt, der Zähler in der Kopfleiste braucht sie auf jedem Screen),
      Optionen (eigener Endpunkt wie bei ausgelagerten Events / Anhängen an den
      Welt-Aufruf / Kartenliste nach `world_config.json` verschieben),
      Entscheidung (Anhängen), Konsequenzen (Critical Rule 8 bleibt gewahrt,
      `cards.json` bleibt eigene Datei fürs Authoring, Welt-Antwort wächst um
      wenige Kilobyte).
- [ ] `docs/decisions/012-kartenbesitz-im-spielstand.md` — Kontext (ADR-009 hat
      die Frage offengelassen), Optionen (eigene Tabelle `player_cards` wie bei
      Erfolgen / Feld im Spielstand-Block), Entscheidung (Feld im Block,
      Version 2), Konsequenzen: fährt auf dem bestehenden Puffer mit, kein
      neuer Endpunkt, keine Migration — Preis: der Besitz wird beim Speichern
      als Ganzes ersetzt, ein zweites Gerät am selben Profil gleichzeitig kann
      Karten überschreiben (bewusst hingenommen, Ein-Kind-Betrieb).
- [ ] `docs/code-map.md`: `services/card.service.ts` und `services/card.rules.ts`
      in der Service-Zeile ergänzen.

## Report-Back
