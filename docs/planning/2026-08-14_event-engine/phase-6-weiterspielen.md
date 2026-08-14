# Phase 6 — Weiterspielen nach Abbruch

**Rating:** standard

Ein Kind schließt den Tab mitten in der Episode. Beim nächsten Betreten fragt
der Screen, ob es weitergehen soll — statt kommentarlos wieder beim ersten
Dialog anzufangen.

## Kontext — vorher lesen

- [README.md](README.md), „Entschieden vor dem Bauen" Punkt 3
- Phase 2 → `EpisodeRun` (`eventIndex`, `scoredCount`, `correctFirstTryCount`,
  `startAt()`, `restart()`)
- Phase 5 → Abschluss-Pfad im Episoden-Screen (dort wird der gemerkte Lauf
  gelöscht)
- `frontend/src/app/services/progress.service.ts` — Muster für Ablage im
  Browser-Speicher inklusive kaputter Einträge
- `frontend/src/app/features/timeline/` — dort steht bereits ein
  Bestätigungsdialog („Fortschritt zurücksetzen"); sein Aufbau und seine
  Tokens sind die Vorlage, damit nicht zwei verschiedene Dialoge entstehen

## Akzeptanzkriterien

1. **Genau ein angefangener Lauf wird gemerkt**, nicht einer pro Episode.
   Ablage im Browser-Speicher unter `questoria.run.v1`:
   `{ themeId, episodeId, eventIndex, scoredCount, correctFirstTryCount }`.
   Eine neue Episode überschreibt den Eintrag.
2. Der Eintrag wird nach jedem abgeschlossenen Event geschrieben, nicht erst
   beim Verlassen — ein geschlossener Tab meldet sich nicht ab.
3. Beim Betreten einer Episode mit passendem Eintrag (`themeId` + `episodeId`
   stimmen, `eventIndex` liegt zwischen dem ersten und dem letzten Event)
   erscheint ein Dialog mit zwei Knöpfen: **„Weiterspielen"** (primär) und
   **„Von vorn anfangen"**. Die Frage ist in Kindersprache und wird im
   Vorlesemodus vorgelesen.
4. „Weiterspielen" setzt den Lauf über `startAt()` auf den gemerkten Stand —
   inklusive der bisherigen Trefferzahlen, damit die Sterne stimmen.
   „Von vorn anfangen" löscht den Eintrag und startet bei Event 0.
5. Ohne passenden Eintrag erscheint **kein** Dialog — der Normalfall bleibt
   ein Tipp auf den Ort und los.
6. Der Eintrag wird gelöscht, sobald die Episode durchgespielt ist (vor dem
   Ergebnis-Screen) oder „Von vorn anfangen" gewählt wurde.
7. Ein beschädigter oder veralteter Eintrag (Episode gibt es nicht mehr,
   `eventIndex` liegt außerhalb der Eventliste) wird still verworfen und die
   Episode startet normal. Kein Fehlerbild, kein Hängenbleiben.
8. **Kein Verfallsdatum.** Ein Lauf von gestern ist so gültig wie einer von
   vor zehn Minuten — eine Zeitschwelle würde eine Regel erfinden, die
   niemand gefordert hat.
9. Der Dialog ist mit Tastatur bedienbar, hat einen Fokusfang und schließt
   nicht durch Klick daneben (beide Antworten sind Entscheidungen, keine hat
   den Rang eines „Abbrechen").

## Checkliste

- [ ] `models/game-state.types.ts`: `StoredRun`-Typ ergänzen (Felder aus AK 1,
      alle `readonly`).
- [ ] `services/run-store.service.ts` anlegen (`@Service()`): `load()`,
      `save(run)`, `clear()`. Kaputter Eintrag → `clear()` + `console.warn`,
      Muster aus `ProgressService`.
- [ ] `EpisodeRun`: nach jedem `finish()` speichern; `startAt()` setzt alle
      drei Zähler auf einmal (kein halb gesetzter Zustand).
- [ ] `episode.ts`: Nach dem Laden der Episode prüfen, ob ein passender
      Eintrag existiert; nur dann den Dialog zeigen und das erste Event bis zur
      Entscheidung **nicht** einsetzen.
- [ ] Dialog als eigene kleine Komponente unter `features/episode/resume-prompt/`
      (nicht in `episode.html` einbetten — der Screen ist ohnehin die
      komplexeste Datei des Features).
- [ ] Beim Abschluss der Episode (Phase-5-Pfad) `clear()` aufrufen, bevor der
      Ergebnis-Screen erscheint.
- [ ] `docs/code-map.md`: `services/run-store.service.ts` und
      `features/episode/resume-prompt/` aufnehmen.
- [ ] `docs/glossary.md`: Eintrag **Fortschritt** um die Abgrenzung ergänzen —
      Fortschritt = geschaffte Orte, angefangener Lauf = die eine
      unterbrochene Episode.

## Report-Back

*(beim Umsetzen füllen)*
