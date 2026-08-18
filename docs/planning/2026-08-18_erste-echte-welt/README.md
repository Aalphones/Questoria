# Erste echte Welt — Pokémon, Lesen lernen

Die erste Welt, die kein Testgerüst ist: eine Etappe, drei Episoden, echte
Bilder, echte Sammelkarten. Zweck ist doppelt — spielbarer Content **und** der
erste ehrliche Härtetest für Engine und Schema an Material, das nicht für die
Engine erfunden wurde.

**Profil:** private (lean) · **Format:** Ordner-Plan, 3 Phasen

## Die Eckdaten (entschieden, nicht mehr offen)

| Feld | Wert |
|---|---|
| `theme_id` | `pokemon_lesen` |
| Weltname | Pokémon — Die Buchstaben-Route |
| Lerninhalt | Deutsch, Leseanfang: Anlaute, Silben, Reime, Wort-Bild-Zuordnung |
| Zielalter | 6–7 Jahre, liest noch nicht |
| Lernstufen | `jungtrainer` · `trainer` · `arenaleiter` |
| Etappe | Route 1 · Alabastia (eine Ortskarte) |
| Episoden | 3 |
| Sammelkarten | 6, verteilt auf zwei Gruppen |
| Cast | Professor Eich, Bisasam (Begleiter des Kindes), Pikachu, ein frecher Rattfratz |
| Ton | freundlich, neugierig, kleine Späße — kein Kampf, keine Bedrohung |

## Die eine Regel, an der diese Welt hängt

**Das zu lesende Wort steht immer bei den Antworten, nie in der Frage.**

Der Vorlesemodus liest die Frage automatisch vor (`ui/task-card/`), die
Antworten nicht (`features/events/multiple-choice/`). Ein Wort in der Frage
wäre also vorgelesen — und damit die Leseaufgabe erledigt, bevor das Kind
hinsieht. Fragen bleiben deshalb generisch und sprechbar („Welches Wort passt
zum Bild?"), das Lesematerial sitzt in den Antworten oder auf den Suchzielen.

Zweite Regel derselben Sorte: **keine Texteingabe in dieser Welt.** Ein
Sechsjähriger sucht Buchstaben auf einer Tastatur, statt zu lesen — der
Eventtyp bleibt ungenutzt, nicht weil er kaputt wäre, sondern weil er hier
das Falsche misst.

## Phasen

| # | Phase | Inhalt | Rating | Status |
|---|---|---|---|---|
| 1 | [Weltgerüst und Aufgaben](phase-1-weltgeruest.md) | `world_config.json`, `cards.json`, 3 Episoden, ausgelagerte Aufgaben je Lernstufe | standard | **complete** |
| 2 | [Bilder](phase-2-bilder.md) | 52 Bilddateien nach den Prompt-Vorlagen erzeugen und einsortieren ([bestellliste.md](bestellliste.md)) | mechanisch | pending |
| 3 | [Durchspielen und Nachziehen](phase-3-durchspielen.md) | Echte Runde am Bildschirm, gefundene Lücken protokollieren, Doku und Deploy | standard | pending |

## Wo dieser Content liegt

`data/themes/` ist eine Verknüpfung auf die Drive-Ablage und liegt **außerhalb
von Git** (`AGENTS.md` → Content-Repository). Der Content dieser Welt taucht in
keinem Commit auf; gesichert wird er über Drive, auf den Server kommt er mit
`deploy.cmd content`. Commits entstehen in diesem Plan nur für Doku und
etwaige Engine-Nachbesserungen.

## Finale Abnahmekriterien

1. Die Welt erscheint auf der Planetenkarte und lässt sich bis zum Ergebnis
   der dritten Episode durchspielen, ohne dass ein Bild oder ein Ton fehlt.
2. Alle drei Lernstufen sind spielbar und unterscheiden sich in den Aufgaben,
   nicht in der Geschichte.
3. Kein Ladefehler, keine leere Bildfläche, keine Aufgabe ohne Frage.
4. Der Vorlesemodus verrät keine Antwort — geprüft an jeder Aufgabe
   (die Regel oben).
5. Sechs Sammelkarten stehen in `cards.json`, zwei davon werden über
   `reward`-Events vergeben; die Kartenbilder liegen als 630 × 880 px vor.
   *(Sichtbar werden sie erst mit Meilenstein 5 — der Content ist trotzdem
   jetzt vollständig, sonst wird die Welt zweimal angefasst.)*
6. Die Schema-Checkliste aus `data/_authoring/JSON_SCHEMA_REFERENCE.md`
   Abschnitt 9 ist abgehakt.
7. Jede Engine- oder Schema-Lücke, die beim Bauen auffiel, steht in `FINDINGS.md`
   — auch die, die wir nicht sofort schließen.

## Smoke-Checkliste (Sascha, am Ende)

1. 🔴 **Eine Runde als Kind spielen**, im Modus „Bilder & Vorlesen", ohne zu
   helfen. Kommt ein Sechsjähriger allein durch die erste Episode?
2. 🔴 **Verrät der Vorleser etwas?** Bei jeder Aufgabe zuhören, bevor man
   hinsieht — wird die Lösung mitgesprochen, ist die Aufgabe falsch geschnitten.
3. 🔴 **Lernstufe wechseln** und dieselbe Episode nochmal anfangen: andere
   Aufgaben, gleiche Geschichte.
4. Alle drei Episoden bis zum Ergebnis, Sterne plausibel.
5. Auf dem Gerät, auf dem das Kind wirklich spielt (Tablet?), einmal
   durchklicken — Bildgrößen und Tippflächen.
6. `deploy.cmd content` und dieselbe Runde auf `questoria.info`.

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
