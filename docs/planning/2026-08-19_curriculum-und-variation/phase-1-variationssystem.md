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

- [ ] `services/variation.ts` anlegen (Funktionen aus AK 1, jede mit
      Kurzkommentar zum Zweck, nicht zur Mechanik)
- [ ] Startwert-Erzeugung: kleine Streuwertfunktion über
      `profileId + episodeId + attempt`, im selben Modul
- [ ] `shuffled-indexes.ts` auflösen — Aufrufer auf `shuffle` aus
      `variation.ts` umstellen, Datei löschen
- [ ] `word-match.ts` und `multiple-choice.ts` auf die geseedete Mischung
      umstellen (Startwert aus dem Lauf, nicht aus der Komponente)
- [ ] Startwert in `run-store.service.ts` und im Spielstand-Schema mitführen
      (zusammen mit den zuletzt benutzten Fassungs-IDs)
- [ ] `resolve-event-config.ts` um die Fassungsauswahl erweitern
- [ ] Typen in `models/content.types.ts`: `pool`, `generated`, Bedingungen
- [ ] Prüffunktionen der betroffenen Eventtypen (`*.types.ts`) so erweitern,
      dass eine Variante mit Pool ebenfalls als gültig durchgeht
- [ ] **ADR-016** schreiben: warum die Auswahl im Ablauf-Gerüst sitzt und nicht
      in den Komponenten, und warum `variants` die Lernstufe bleibt
- [ ] Schema-Referenz: neuer Abschnitt zu `pool`/`generated` samt Beispiel,
      Verweis in der Varianten-Regel
- [ ] `docs/code-map.md`: Zeile für `services/variation.ts`
- [ ] `data/_authoring/README.md`: Pflegepflicht-Runde

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
