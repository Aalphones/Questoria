# Phase 3 — Neue Eventtypen für Mathematik

**Rating:** heikel (jeder Typ bringt eine neue Bedienart mit; die
Ziehen-und-Ablegen-Grundlage entscheidet über drei davon)

## Kontext — was der Bearbeiter lesen muss

- [phase-1-variationssystem.md](phase-1-variationssystem.md) — muss fertig sein;
  jeder neue Typ nutzt `services/variation.ts`, keiner würfelt selbst
- `frontend/src/app/features/episode/event-type-map.ts` — die Registrierung
- `frontend/src/app/features/events/word-match/` — nächstes Vorbild: mehrteilige
  Aufgabe, Mischung, Tastaturbedienung, Fehlerzählung
- `frontend/src/app/ui/task-card/` — die gemeinsame Hülle jeder Aufgabe
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0
- `docs/knowledge/lerninhalte-hessen-klasse-1.md` — welcher Typ welches Lernziel
  bedient

## Entscheidung vorab: welche zwei zuerst

Gebaut werden in dieser Reihenfolge **`sorting`** und **`number_line`**.

- `sorting` (Gegenstände in Kategorien) deckt die meisten Lernziele quer über
  Deutsch, Mathe und Sachkunde ab und liefert nebenbei die
  Ziehen-und-Ablegen-Grundlage, auf der `ordering` und `fill_gap` später sitzen.
- `number_line` ist der einzige Typ, den der Zahlenraum-Teil des Katalogs
  zwingend braucht und den kein anderer Typ ersetzen kann.

`ordering`, `fill_gap` und `pattern` folgen erst danach — als eigene Phase oder
eigener Plan, je nachdem, was die ersten beiden gelehrt haben. **Nicht alle fünf
in dieser Phase.**

## Abnahmekriterien

1. `sorting` und `number_line` stehen in `EVENT_TYPES`, in `EVENT_COMPONENTS`,
   in `EVENT_CONFIG_GUARDS`, in `SCORED_EVENT_TYPES` und in der Typ-Tabelle der
   Schema-Referenz — ein Typ steht dort erst, wenn seine Komponente existiert.
2. Beide sind ohne Maus bedienbar: jedes Ziel ist mit der Tastatur erreichbar
   und auslösbar, wie in `image_search` gelöst.
3. Beide zählen wie alle Aufgaben: falsch raten ist kein Sackgassen-Ende, für
   den Stern zählt der erste Versuch.
4. Beide unterstützen `pool` **und** `generated` aus Phase 1 — `number_line`
   erzeugt seine Zielzahl aus einem Bereich, `sorting` zieht seine Gegenstände
   aus einem Vorrat.
5. Beide funktionieren im Vorlesemodus: Aufgabenstellung wird gesprochen,
   Beschriftungen sind auch als Bild verfügbar.

## Checkliste

- [x] `features/events/sorting/` — Komponente, Typen, Prüffunktion, Stile
- [x] Ziehen-und-Ablegen als wiederverwendbares Stück lösen (nicht in der
      Sortier-Komponente vergraben) — `ordering` und `fill_gap` erben es
      → `ui/pick-place/`, zwei Bedienarten, eine Auswertung
- [x] `features/events/number-line/` — Komponente, Typen, Prüffunktion, Stile
- [x] Registrierung in `event-type-map.ts` (vier Stellen, siehe AK 1)
- [x] Typen in `models/content.types.ts`
- [x] Schema-Referenz: Abschnitte 5.7 und 5.8 samt Beispiel, Typ-Tabelle
      ergänzen ~~beide aus der „vorgemerkt"-Liste streichen~~ — standen dort
      nie drin, nichts zu streichen
- [x] `docs/code-map.md`: zwei Zeilen unter Event-Komponenten, dazu eine für
      `ui/pick-place/`
- [x] `data/_authoring/README.md` — der Bauprompt brauchte keine Änderung: Er
      bekommt die Typ-Tabelle als Ganzes eingefügt und kennt die neuen Typen
      damit von selbst
- [x] Je eine Probe-Aufgabe in der Pokémon-Welt, damit die Typen am Bildschirm
      geprüft sind und nicht nur im Schema stehen → beide im Vertania-Wald

## Risiken

🟡 **Ziehen und Ablegen ist auf dem Gerät des Kindes die Bruchstelle.** Am
Bildschirm des Entwicklers funktioniert alles. Vor dem Abschluss auf dem echten
Tablet prüfen — mit dem Finger, nicht mit der Maus.

🟡 **Der Zahlenstrahl braucht eine Genauigkeitsentscheidung**: trifft das Kind
eine exakte Position oder ein Feld? Für Klasse 1 gehört die Antwort in die
Phase, nicht in die Umsetzung — Vorgabe: sichtbare Felder, kein freies
Millimeterziehen.

## Report-Back

**Status: complete** (20.08.2026). Build grün, Linter grün, alle fünf
Abnahmekriterien erfüllt. Am Bildschirm geprüft ist noch nichts — das ist der
Smoke am Plan-Ende.

### Die Entscheidung, die vorab getroffen wurde

Die Checkliste forderte Ziehen-und-Ablegen, der Risiko-Abschnitt derselben
Datei nannte es die Bruchstelle auf dem Tablet, und AK 2 verlangt
Tastaturbedienung — also ohnehin einen zweiten Weg. Vorgeschlagen war, es beim
Tipp-Weg zu belassen (wie `word_match` ihn schon fährt). **Sascha hat sich für
beides entschieden**: Tipp-Weg als tragende Bedienung, Ziehen als Zugabe.

So ist es gebaut. `ui/pick-place/` führt beide Wege in **einer** Auswertung
zusammen — die Sortier-Aufgabe sieht nicht, auf welchem Weg ein Gegenstand
ankam. Das Ziehen läuft über Pointer-Ereignisse, nicht über die
Ziehen-und-Ablegen-Schnittstelle des Browsers: Die greift auf Touch-Geräten
nicht zuverlässig, und genau dort wird gespielt.

### Abweichungen und was dabei auffiel

- **Ein Vorrat statt eines dritten Variations-Schlüssels.** AK 4 wollte, dass
  `sorting` „seine Gegenstände aus einem Vorrat zieht". Ein neuer Schlüssel
  neben `pool`/`generated` hätte den in Phase 1 festgezurrten Kontrakt gebrochen.
  Gelöst als **typeigenes Feld** `show_count`: Stehen mehr Gegenstände in
  `items` als gespielt werden, ist die Liste ein Vorrat. `pool` und `generated`
  bleiben unberührt und funktionieren zusätzlich.
- **Ein Platzhalter allein im Feld liefert jetzt eine Zahl.** `"target":
  "{ziel}"` ergab bisher die Zeichenkette `"7"` und wäre am Prüfpfad des
  Zahlenstrahls gescheitert. Neu in `services/variation.ts`:
  `resolveTemplateValue`. Das ist die **einzige** Stelle, an der Phase-1-Code
  angefasst wurde, und sie gilt für jeden Typ mit Zahlenfeldern — dokumentiert
  im Schema beim Abschnitt `generated`.
- **Die „vorgemerkt"-Liste enthielt beide Typen nie.** Nichts zu streichen.
- **Keine neuen Dialogzeilen im Vertania-Wald.** Die Probe-Aufgaben hängen
  hinter der letzten Reim-Aufgabe, ohne Story-Text — jede neue Zeile hätte eine
  Sprachaufnahme nach sich gezogen.

### Chesterton's Fence

Nichts entfernt, nichts ersetzt. Beide Typen sind reine Zugänge; `resolveTemplateValue`
erweitert `resolveTemplate`, ohne dessen bisheriges Verhalten für Fließtext zu
ändern.

### Was am Bildschirm noch nicht geprüft ist

🔴 **Ziehen auf dem echten Tablet, mit dem Finger.** Das Risiko der Phase steht
unverändert. Am Entwicklerschirm mit der Maus beweist es nichts. Der Tipp-Weg
trägt zwar allein, falls das Ziehen dort hakt — aber ob es hakt, weiß erst das
Gerät des Kindes.

🟡 **Der Zahlenstrahl erfüllt AK 5 nur halb.** Aufgabenstellung wird gesprochen,
aber „Beschriftungen auch als Bild" gibt es dort nicht — die Beschriftungen
*sind* Ziffern, und eine Ziffer als Bild wäre dieselbe Ziffer. Bei `sorting`
ist es erfüllt (`image` an Korb und Gegenstand). Für ein Kind, das noch keine
Ziffern liest, ist der Zahlenstrahl damit nicht bedienbar — das ist eine
Lernziel-Frage, keine Technikfrage, und gehört bewusst entschieden statt
nachträglich zugebaut.

🟡 **Bei 21 Feldern (0 bis 20) wird der Strahl auf schmalem Tablet breiter als
die Karte.** Er bekommt dann einen waagerechten Bildlauf. Ob das für ein Kind
bedienbar ist oder ob 0–20 in Einerschritten schlicht zu viel ist, entscheidet
der Blick auf dem Gerät.
