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
| 2 | [Bilder](phase-2-bilder.md) | 52 Bilddateien nach den Prompt-Vorlagen erzeugen und einsortieren ([bestellliste.md](bestellliste.md)) | mechanisch | **complete** |
| 3 | [Durchspielen und Nachziehen](phase-3-durchspielen.md) | Echte Runde am Bildschirm, gefundene Lücken protokollieren, Doku und Deploy | standard | **complete** |

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

**Abgeschlossen am 20.08.2026.** Questoria hat seine erste echte Welt: Pokémon — Die Buchstaben-Route, drei Orte auf Route 1, spielbar in drei Lernstufen, von der Planetenkarte bis zum Ergebnis. Am Bildschirm abgenommen, auf `questoria.info` deployt, auf dem Gerät des Kindes durchgeklickt.

Gebaut wurden 8 Aufgaben in je 3 Lernstufen, 3 Episoden mit 16 vertonten Dialogzeilen, 6 Sammelkarten, 4 Erfolge — und 52 Bilddateien, alle lokal erzeugt, freigestellt und ins Zielmaß gebracht.

Der eigentliche Ertrag ist aber nicht der Content, sondern was er über die Engine verraten hat. Der Härtetest hat gehalten: Das Schema trägt echten Content ohne Änderung. Vier Lücken kamen heraus und sind alle geschlossen — zwei Engine-Bugs (Vertonung spielte wegen eines doppelten Pfads nie ab, die Etappenkarte zeigte ein leeres Raster statt ihres Kartenbilds), eine tote Schema-Zusage und eine Sprite-Vorgabe, die Arbeit ohne Gegenwert verlangte. Dazu ein Content-Fehler: die Weltkachel lag im leeren Wolkenhimmel.

Zwei Dinge sind unterwegs zu eigenen Plänen gewachsen, statt hier hineingepfuscht zu werden: die Wort-Bild-Zuordnung wurde ein eigener Eventtyp (`word_match`), und das gesammelte Layout-Elend der ersten Spielrunde wurde der [UI-Umbau auf Vollbild](../2026-08-19_ui-umbau-vollbild/README.md) — fünf Phasen, inzwischen ebenfalls abgeschlossen.

## Files touched

Der Content selbst (`data/themes/pokemon_lesen/`, 52 Bilder + 16 mp3 + JSON) liegt außerhalb von Git und taucht in keinem Commit auf. Im Repo geändert:

- **Engine:** `features/dialog/`, `features/timeline/`, `features/events/` (Mischung der Antwort-Reihenfolge in `shuffled-indexes.ts`, neuer Eventtyp `word-match/`), `ui/map-canvas/`
- **Content-Register:** `data/main_hub.json` (Weltkachel-Koordinate), Testwelt `dev_fixture` entfernt
- **Autoren-Doku:** `data/_authoring/` — `JSON_SCHEMA_REFERENCE.md`, `ASSET_REQUIREMENTS.md`, `image-prompts/`, `image-tools/`, `voice-tools/`
- **Projekt-Doku:** `docs/PROJECT.md`, `docs/glossary.md`, `docs/code-map.md`

## Commits

`46b15d4` Weltgerüst, Aufgaben und Karten · `c660a9d` + `b6c0fcd` Wort-Bild-Paare als eigene Aufgabenform · `337e06a` Bildstil als Pflichtfeld, Freistellen und Formatieren als lokale Werkzeuge · `65bdf21` freigestellte Motive einpassen statt beschneiden · `7883aff` Lernziele als eigene Ebene · `8d76fd5` Vertonung als eigener Skill, Welt komplett gesprochen · `a6e439f` Lehrgeld aus 52 erzeugten Bildern · `3e59887` Vertonung spielt ab, Etappenkarte zeigt ihr Kartenbild · `e50f95a` + `67fbed3` gemischte Antwort-Reihenfolge · `8beea68` Weltkachel trifft eine Insel · `58e5dd5` Testwelt entfernt · `e19b9d3` totes Schema-Beispiel gestrichen

## Deviations from plan

- **52 Bilder statt der geschätzten „rund 25".** Treiber: jede Aufgabe hat drei Lernstufen mit je vier Bildantworten. Die Schätzung war um mehr als das Doppelte daneben — deshalb gibt es jetzt die [bestellliste.md](bestellliste.md) als Format, das vor dem ersten Bild zählt statt danach.
- **Ein neuer Eventtyp mitten im Content-Plan.** Die geplante Wort-Bild-Zuordnung war mit der Multiple-Choice-Form nicht baubar (kein Bild in der Frage). Statt eines Behelfs mit neutraler Wortkarten-Grafik wurde `word_match` ein eigener, kleiner Plan.
- **Ein kompletter UI-Umbau als Zwischenspiel.** Die erste Spielrunde förderte sechs Layout-Befunde zutage, alle mit derselben Ursache. Das war kein Fall für einen Ad-hoc-Fix — fünf Phasen, eigener Plan, abgeschlossen am 19.08.2026.
- **Die Testwelt `dev_fixture` ist ersatzlos weg** (Sascha-Wunsch, 19.08.2026). Sie war das Schema-Testbett; die Rolle übernimmt jetzt `pokemon_lesen` selbst.

## Follow-ups

- 🟡 **`data/hub/` ist nicht in `.gitignore`** — im Gegensatz zu `data/themes/` und `data/avatars/` würde die Planetenkarte mit im Repo landen. Zu entscheiden: mitversionieren oder ausnehmen wie die anderen Content-Ordner. (Aufs Deployen hat es keinen Einfluss, `deploy.cmd content` spiegelt `data/` ohnehin komplett.)
- 🟡 **`_default` in `voices.json` steht auf Julian**, derselben Stimme wie Professor Eich. Jede künftig unbesetzte Figur klingt damit unbemerkt wie er. Jakob wäre frei und schon geprobt.
- **Kein Bild in der Frage einer Multiple-Choice-Aufgabe.** Für diese Welt gelöst (`word_match`), aber die Aufgabenform kann es weiterhin nicht. Braucht eine spätere Welt es, wäre das ein Feld `question_image` plus Komponente — Kandidat für [Curriculum & Variation](../../../planning/2026-08-19_curriculum-und-variation/README.md).
- **Der Server-Vorfall vom 19.08.2026 ist nicht aufgeklärt.** Jeder API-Aufruf brauchte 30–40 s, die Verzögerung lag vor PHP; am 20.08.2026 war es von selbst wieder weg. Die Diagnose-Zeilen in `api-bridge/diag.php` liegen für den Wiederholungsfall bereit.
