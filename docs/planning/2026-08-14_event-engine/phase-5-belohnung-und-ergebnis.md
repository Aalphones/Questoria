# Phase 5 — `reward` + Ergebnis-Screen + echte Sterne

**Rating:** standard

Das Ende einer Episode: der letzte Eventtyp, die Bewertung nach der Formel aus
dem README und der Ergebnis-Screen, der den temporären Abschluss aus Phase 2
ablöst.

## Kontext — vorher lesen

- [README.md](README.md), „Entschieden vor dem Bauen" Punkt 2 (Sternenformel)
  und „Bewusste Auslassungen" (was `reward` in diesem Meilenstein **nicht** tut)
- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „8. Ergebnis
  (`result`)" — Konfetti, Sterne, Statistik-Karten, CTAs. Der Abschnitt „9a.
  Kartenvergabe" gehört zu Meilenstein 5 und wird hier **nicht** gebaut.
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 5.2 (`reward`)
- [docs/PROJECT.md](../../PROJECT.md) → Meilensteine 3 und 5 (dort steht
  ausdrücklich: in Meilenstein 3 vergibt `reward` nur Sterne)
- Phase 2 → `EpisodeRun`, der temporäre Abschluss in `episode.ts` (AK 8)
- `frontend/src/app/services/progress.service.ts` (`completeEpisode`,
  verschlechtert nie), `frontend/src/app/services/progress.rules.ts`
- `frontend/src/styles/_motion.scss` (`eqPop`, `eqBob`)

## Akzeptanzkriterien

### `reward`

1. Kurzer Belohnungs-Moment nach Design-Tonfall: Karte mit `eqPop`, große
   Überschrift „Geschafft!", ein Satz in Kindersprache, primärer Knopf
   „Weiter".
2. Der Screen sagt ehrlich, was es gibt: Sterne. **Keine Sammelkarte, kein
   Kartenbild, keine Attrappe eines Kartenrahmens** — Karten kommen mit
   Meilenstein 5, und ein Bilderrahmen ohne Bild ist für ein Kind schlimmer als
   keiner.
3. Die `card_id` aus der Konfiguration wird gelesen und in `EpisodeRun`
   hinterlegt (`pendingCardId`), damit Meilenstein 5 nur noch die Vergabe
   anhängt. Fehlt sie, ist das kein Fehler — dann gibt es eben nur Sterne.
4. Gemeldet wird `finish({ kind: 'story' })`; das Event geht nicht in die
   Bewertung ein.

### Bewertung

5. `starsForRun(scoredCount, correctFirstTryCount)` in
   `features/episode/star-rules.ts` als reine Funktion: alle beim ersten
   Versuch richtig → 3; mindestens die Hälfte → 2; darunter → 1;
   `scoredCount === 0` → 3.
6. Nach dem letzten Event schreibt der Episoden-Screen
   `completeEpisode(themeId, episodeId, starsForRun(...))`. Ein schlechterer
   zweiter Durchlauf verschlechtert das Ergebnis nicht (bestehendes Verhalten
   von `ProgressService`).
7. Der temporäre Abschluss aus Phase 2 (pauschal 3 Sterne, sofortige
   Navigation) ist restlos ersetzt — auch der Kommentar dazu.

### Ergebnis-Screen

8. `features/result/` ist eine Komponente, die der Episoden-Screen nach dem
   letzten Event anzeigt — **keine eigene Route.** Ein Ergebnis ohne
   vorangegangenen Lauf gibt es nicht, also gibt es dafür auch keine Adresse.
9. Inhalt nach Design: Konfetti-Dekor, drei Sterne (gefüllt nach Bewertung,
   `eqPop` gestaffelt), Überschrift „Ort geschafft!", Vorlese-Knopf für den
   Hinweistext.
10. Zwei Statistik-Karten mit echten Zahlen aus dem Lauf: „Richtige Antworten"
    `<beim ersten Versuch richtig> / <bewertete Aufgaben>` und „Dialogzeilen
    gehört" (Summe der Zeilen aller `dialog`-Events der Episode). Die dritte
    Karte des Designs („Neue Wörter gelernt") entfällt — dafür gibt es keine
    Datenquelle, und eine erfundene Zahl ist schlechter als eine Karte
    weniger.
11. Keine Erfolgs-Pille, kein Karten-Banner (Meilenstein 4 bzw. 5).
12. CTAs: „Zurück zur Karte" (primär, führt auf die Ortskarte der Episode) und
    „Zur Karte der Etappen" (sekundär). Nach der Rückkehr sieht der Ort
    geschafft aus, die Sterne stehen an ihm und der nächste Ort ist offen.
13. Der Ergebnis-Screen liest den Lauf, er rechnet nicht selbst: Sterne und
    Zahlen kommen als Eingaben herein.

## Checkliste

- [ ] `models/content.types.ts`: `RewardConfig { card_id: string }`.
- [ ] `ng generate component features/events/reward --skip-tests`, Zeile
      `reward` in `EVENT_COMPONENTS`.
- [ ] `EpisodeRun`: `pendingCardId` als Signal ergänzen, gesetzt vom
      `reward`-Event. Kommentar, dass Meilenstein 5 hier die Kartenvergabe
      anhängt.
- [ ] `features/episode/star-rules.ts` mit `starsForRun()` — reine Funktion,
      kein Signal, kein Zugriff auf Dienste.
- [ ] `ng generate component features/result --skip-tests`. Eingaben: `stars`,
      `correctFirstTry`, `scoredTotal`, `dialogLines`, `mapLink`,
      `timelineLink`.
- [ ] `episode.ts`: Nach dem letzten Event Fortschritt schreiben und den
      Ergebnis-Screen zeigen, statt sofort zu navigieren. Die Kopfleiste bleibt
      sichtbar.
- [ ] Dialogzeilen-Summe im Episoden-Screen als `computed()` über die
      Eventliste (`events` mit `type === 'dialog'`, Länge von `config.lines`).
      Das ist die einzige Stelle, an der das Gerüst einen Eventtyp beim Namen
      nennt — Kommentar dazu: es ist eine Statistik über den Content, keine
      Ablaufsteuerung, und sie fällt weg, sobald Meilenstein 4 echte
      Statistiken führt.
- [ ] Sterne-Animation und Konfetti mit `prefers-reduced-motion`-Zweig.
- [ ] `docs/code-map.md`: `features/events/reward/`, `features/result/`,
      `star-rules.ts` aufnehmen.
- [ ] `docs/glossary.md`: Eintrag **Sterne** auf die neue Formel ziehen (der
      Satz „liefert der Ort-Platzhalter pauschal 3" ist dann falsch).

## Report-Back

*(beim Umsetzen füllen)*
