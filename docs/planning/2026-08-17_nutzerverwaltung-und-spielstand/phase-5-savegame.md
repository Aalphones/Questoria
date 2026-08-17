# Phase 5 — Spielstand-Schnittstelle

Die Schnittstelle selbst plus der Dienst im Frontend, der sie mit einem Puffer
umgibt. Diese Phase ändert noch **kein** Verhalten im Spiel — sie legt den
Unterbau, auf den Phase 6 umschaltet.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Spielstand, Form von `Zustand`)
- `backend/src/Migrations/sql/004_create_savegames.sql`
- Phase 1 → Controller-Muster mit angemeldetem Benutzer
- Phase 4 → `ProfileRepository::findForUser` (dieselbe Zugehörigkeitsprüfung)
- `frontend/src/app/services/progress.service.ts` und `run-store.service.ts` —
  die beiden Dienste, die Phase 6 auf diesen hier umhängt
- `frontend/src/app/models/game-state.types.ts` — `ProgressStore`, `StoredRun`
- [ADR-006](../../decisions/006-fortschritt-vor-der-nutzerverwaltung.md)

## Die Puffer-Regeln (Vorgabe, nicht Ermessen)

1. **Jede Änderung geht zuerst in den Browser-Speicher, dann zum Server.** Das
   Spiel wartet nie auf eine Antwort.
2. Schlägt das Senden fehl, bleibt der Eintrag als **offen** markiert. Offene
   Einträge werden erneut gesendet: beim Start der Anwendung, bei der nächsten
   Änderung und nach jedem geglückten anderen Aufruf.
3. **Beim Laden gewinnt der Server — außer es gibt offene Einträge für diese
   Welt.** Dann gewinnt der lokale Stand und wird sofort hochgeschoben.
   🟡 Genau hier steckt der teuerste Denkfehler dieses Meilensteins: Wer immer
   den Server gewinnen lässt, löscht mit dem ersten Neuladen den Fortschritt,
   den ein Kind bei totem Netz erspielt hat.
4. Ein Zustand wird immer **vollständig** gesendet, nie als Teiländerung. Das
   Backend führt nichts zusammen.
5. Der lokale Spiegel hängt an der Profil-ID. Ein Profilwechsel liest den
   Spiegel des anderen Profils, er vermischt nichts.

## Abnahmekriterien

1. `PUT` und `GET` verhalten sich wie im Kontrakt, inklusive `404` für ein
   fremdes Profil.
2. Ein zweiter `PUT` für dieselbe Welt überschreibt den Eintrag, er legt keinen
   zweiten an (die Tabelle hat den passenden eindeutigen Schlüssel).
3. Bei abgeschaltetem Backend nimmt `SavegameService.save()` Änderungen
   widerspruchslos an; nach dem Hochfahren erscheinen sie ohne Zutun auf dem
   Server.
4. Nach Regel 3 oben: lokaler Stand mit offenem Eintrag überlebt ein Neuladen
   mit laufendem Server.
5. Ein Spielstand ohne je gestartete Episode ist möglich (`episode_id` und
   `node_id` leer) — die Lernstufenwahl allein legt schon einen an.
6. Der PHP-Linter und `npm run lint` laufen grün.

## Checkliste

- [ ] `backend/src/Migrations/sql/009_savegames_nullable_position.sql`:
      `episode_id` und `node_id` auf `NULL` erlauben. Kommentarkopf wie in
      Migration 008 (warum eigene Datei statt Korrektur in 004).
- [ ] `backend/src/Repositories/SavegameRepository.php`: `allForProfile`,
      `upsert` (`INSERT … ON DUPLICATE KEY UPDATE`). `game_state_json` als
      JSON-Text rein und raus — das Backend liest den Inhalt nicht.
- [ ] `backend/src/Validators/SavegameValidator.php`: `state` muss ein Objekt
      mit `version: 1` sein; unbekannte Version → `422`. Größe deckeln
      (z.B. 256 KB), damit ein kaputter Client die Tabelle nicht sprengt.
- [ ] `backend/src/Controllers/SavegameController.php`, Routen registrieren.
- [ ] `frontend/src/app/models/savegame.types.ts`: `SavegameState`
      (`version`, `progress`, `run`, `settings`), `Savegame`. `ProgressStore`
      und `StoredRun` aus `game-state.types.ts` wiederverwenden statt neu zu
      erfinden.
- [ ] `frontend/src/app/services/savegame.service.ts` nach den Puffer-Regeln:
      `loadAll(profileId)`, `stateFor(themeId)`, `save(themeId, state, position)`,
      `flushPending()`. Lokaler Spiegel unter `questoria.savegame.v1`, Aufbau
      `{ [profileId]: { [themeId]: { state, episodeId, nodeId, pending: boolean } } }`.
      Ein beschädigter Eintrag wird verworfen statt geworfen — Muster:
      `run-store.service.ts`.
- [ ] `flushPending()` beim Start der Anwendung einmal aufrufen (in der
      Profilauswahl, nachdem das Profil feststeht).

## Doku-Updates

- [ ] `docs/decisions/009-spielstand-aufteilung.md` anlegen: Kontext (Schema
      liegt seit Meilenstein 1, Offline-Fähigkeit ist Meilenstein 6), Optionen
      (alles in einen JSON-Block / alles in eigene Spalten / gemischt),
      Entscheidung (Fortschritt, angefangener Lauf und Einstellungen im
      JSON-Block; Erfolge und Statistiken in eigenen Tabellen, weil sie
      summiert und zeitgestempelt sind), Konsequenzen (das Backend kann den
      Spielstand nicht auswerten — gewollt; Versionsfeld für spätere
      Formatwechsel; die Puffer-Regeln oben sind Teil dieser Entscheidung).
- [ ] `docs/code-map.md`: `services/savegame.service.ts`,
      `Repositories/SavegameRepository.php`, `Controllers/SavegameController.php`
      in den Ist-Stand.

## Report-Back
