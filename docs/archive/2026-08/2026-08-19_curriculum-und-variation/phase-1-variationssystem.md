# Phase 1 — Variationssystem: ein Würfel für alle

**Rating:** heikel (der Kontrakt fällt hier, und alle späteren Aufgabentypen
hängen daran)

## Kontext — was der Bearbeiter lesen muss

- [README.md](README.md), besonders die Kontrakt-Sektion mit `pool` und `generated`
- `frontend/src/app/features/events/shuffled-indexes.ts` — der heutige Anfang:
  eine geteilte Mischung ohne Startwert
- `frontend/src/app/features/episode/resolve-event-config.ts` — hier wird heute
  `config.ref` und die Lernstufen-Variante aufgelöst; die Auswahl der Fassung
  gehört an dieselbe Stelle
- `frontend/src/app/features/episode/episode-run.ts` — Laufzustand einer Episode
- `frontend/src/app/services/run-store.service.ts` — der gespeicherte
  angefangene Lauf; hier wohnt der Startwert
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitte 5.0 bis 5.6 und
  „Varianten-Regel"
- `docs/conventions/` (Angular/TypeScript)

## Abnahmekriterien

1. `frontend/src/app/services/variation.ts` existiert und stellt bereit:
   `seededRandom(seed)`, `shuffle(list, random)`, `selectFromPool(items, random,
   avoidRecent)`, `generateInteger(range, random)`, `resolveTemplate(text,
   values)`, `satisfiesConstraints(values, constraints)`. Reine Funktionen, kein
   Angular-Dienst, kein Zustand — Muster wie `services/progress.rules.ts`.
2. Kein `Math.random()` mehr außerhalb dieser Datei (prüfbar per Suche über
   `frontend/src/`).
3. Ein Lauf trägt einen Startwert. Er entsteht beim Start einer Episode aus
   Profil-ID, Episoden-ID und der Nummer des Versuchs, wird im angefangenen Lauf
   mitgespeichert und beim Wiedereinstieg zurückgeholt.
4. `resolve-event-config.ts` wählt nach der Lernstufe zusätzlich die Fassung:
   liegt `pool` vor, eine Fassung daraus; liegt `generated` vor, eine erzeugte;
   liegt keines von beiden vor, die Variante selbst wie bisher.
5. Die letzten drei benutzten Fassungs-IDs je Aufgabe überleben das Beenden der
   App und werden bei der Auswahl gemieden, solange der Pool größer ist.
6. Die Event-Komponenten sehen davon nichts — sie bekommen weiterhin eine fertig
   aufgelöste Konfiguration.

## Checkliste

- [x] `services/variation.ts` anlegen (Funktionen aus AK 1, jede mit
      Kurzkommentar zum Zweck, nicht zur Mechanik)
- [x] Startwert-Erzeugung: kleine Streuwertfunktion über
      `profileId + episodeId + attempt`, im selben Modul
- [x] `shuffled-indexes.ts` auflösen — Aufrufer auf `shuffle` aus
      `variation.ts` umstellen, Datei löschen
- [x] `word-match.ts` und `multiple-choice.ts` auf die geseedete Mischung
      umstellen (Startwert aus dem Lauf, nicht aus der Komponente)
- [x] Startwert in `run-store.service.ts` und im Spielstand-Schema mitführen
      (zusammen mit den zuletzt benutzten Fassungs-IDs)
- [x] `resolve-event-config.ts` um die Fassungsauswahl erweitern
- [x] Typen in `models/content.types.ts`: `pool`, `generated`, Bedingungen
- [x] Prüffunktionen der betroffenen Eventtypen (`*.types.ts`) so erweitern,
      dass eine Variante mit Pool ebenfalls als gültig durchgeht — geprüft:
      alle vier Guards (`isMultipleChoiceConfig`, `isTextInputConfig`,
      `isImageSearchConfig`, `isWordMatchConfig`) prüfen nur Pflichtfelder,
      keine Zusatzfeld-Ablehnung. Ein Pool-Element (Aufgabe + `id`) läuft nach
      der Auswahl als reine Aufgabe durch dieselbe Prüfung wie bisher — keine
      Änderung nötig.
- [x] **ADR-016** schreiben: warum die Auswahl im Ablauf-Gerüst sitzt und nicht
      in den Komponenten, und warum `variants` die Lernstufe bleibt
- [x] Schema-Referenz: neuer Abschnitt zu `pool`/`generated` samt Beispiel,
      Verweis in der Varianten-Regel
- [x] `docs/code-map.md`: Zeile für `services/variation.ts`
- [x] `data/_authoring/README.md`: Pflegepflicht-Runde — Schema-Referenz und
      Bauprompt aktualisiert; ASSET_REQUIREMENTS/image-prompts/voice-tools/
      design-README nicht betroffen (kein neuer Asset- oder Feldtyp)

## Risiken

🟡 **Der Startwert im Spielstand ist eine Schema-Änderung.** Alte Spielstände
haben keinen — die Engine muss einen fehlenden Startwert als „neu ziehen"
behandeln, nicht als Fehler.

🟡 **Wiederholungsschutz und Startwert widersprechen sich halb.** Derselbe
Startwert soll denselben Durchlauf ergeben, die Liste der zuletzt benutzten
Fassungen ändert die Auswahl aber zwischen den Läufen. Auflösung: die
Meidungsliste ist Teil der Eingabe der Auswahl, nicht ein nachträglicher Filter
— sonst ist die Reproduzierbarkeit nur scheinbar gegeben.

## Report-Back

**Status: complete (20.08.2026).**

- `services/variation.ts` (neu): `deriveRunSeed`, `deriveEventSeed`,
  `seededRandom` (mulberry32), `shuffle`, `selectFromPool`, `generateInteger`,
  `resolveTemplate`, `satisfiesConstraints`, `drawConstrainedValues`.
- `resolve-event-config.ts`: löst `pool`/`generated` innerhalb der
  Lernstufen-Variante auf, liefert zusätzlich `usedPoolItemId` fürs Gerüst
  (nicht für die Komponente).
- `episode-run.ts`: trägt `seed` + abgeleiteten `eventSeed` je Position in der
  Eventliste.
- `episode.ts`: zieht bei jedem frischen Start (kein Wiedereinstieg gewählt)
  über `RunStoreService.startSeedFor()` einen neuen Startwert, übernimmt beim
  Wiedereinstieg den gespeicherten (Fallback: frisch ziehen, Risiko 1); merkt
  benutzte Pool-Fassungen über `VariantHistoryService`.
- `run-store.service.ts`: `startSeedFor()` zählt den Versuch im Spielstand
  hoch und leitet daraus den Startwert ab; `isCompleteRun` verlangt keinen
  Startwert (Risiko 1).
- `variant-history.service.ts` (neu, per `ng generate`): letzte drei
  Pool-Fassungs-IDs je `event_id`, in `SavegameState.recentVariants` — überlebt
  App-Neustarts, anders als der angefangene Lauf.
- `word-match.ts`/`multiple-choice.ts`: Mischung über `shuffle(indexes,
  seededRandom(run.eventSeed()))` statt `shuffledIndexes()`;
  `features/events/shuffled-indexes.ts` gelöscht.
- `content.types.ts`: `PoolItem`, `NumberRange`, `ComparisonOperator`,
  `ValueConstraint`, `GeneratedSlot`.
- `game-state.types.ts` (`StoredRun.seed?`), `savegame.types.ts`
  (`SavegameState.attempts`, `.recentVariants`, beide im `EMPTY_SAVEGAME_STATE`).
- Doku: ADR-016, Schema-Referenz-Abschnitt „pool und generated" +
  Varianten-Regel-Verweis, `LLM_WORLD_BUILDER_PROMPT.md`-Hinweis,
  `docs/code-map.md`.
- Backend geprüft (`SavegameController.php`, `SavegameValidator.php`): der
  Zustand ist ein geprüfter Blob (nur `version`, 256-KB-Deckel) — die neuen
  Felder brauchen keine Backend-Änderung, bestätigt ADR-009.
- `ng build` (development), `tsc --noEmit`, `ng lint`: alle drei sauber.

**Bewusst nicht umgesetzt / verschoben:**

- `generated` kennt noch keinen abgeleiteten Wert (z. B. `a+b` als eigene
  Antwort) — nur gezogene Bereichswerte lassen sich in die Vorlage einsetzen.
  Als 🟡 in der Schema-Referenz vermerkt; Phase 3 entscheidet, ob das reicht.
- Kein Content nutzt `pool`/`generated` bisher — das ist Phase 4.

**Manuelle Abnahme (Smoke-Prüfpunkte für die finalen AK, private Profil):**

1. Eine Aufgabe mit `pool` in eine bestehende Event-Datei eintragen (oder
   Test-Event anlegen), Episode zweimal hintereinander spielen — andere
   Fassung, andere Antwortreihenfolge (finale AK 1).
2. Mitten in einer Episode den Tab schließen/neu laden, „Weiterspielen"
   wählen — dieselben Aufgaben in derselben Reihenfolge (finale AK 2).
3. Eine Episode ohne `pool`/`generated` spielen — unverändertes Verhalten
   (finale AK 3).
4. `frontend/src` nach `Math.random(` durchsuchen — kein Treffer außerhalb von
   `variation.ts` (finale AK 4, bereits automatisiert geprüft).
