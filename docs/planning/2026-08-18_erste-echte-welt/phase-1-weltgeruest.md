# Phase 1 — Weltgerüst und Aufgaben

Alle JSON-Dateien der Welt entstehen. Noch ohne Bilder — die Dateinamen werden
hier festgelegt, die Dateien selbst kommen in Phase 2.

## Kontext (vorher lesen)

- `data/_authoring/JSON_SCHEMA_REFERENCE.md` — **verbindlich**, besonders
  Abschnitt 2 (`world_config.json`), 3 (`cards.json`), 4 (Episoden),
  5.0 (erlaubte Eventtypen), 5.1–5.5 (Eventformen), 9 (Schlusscheckliste)
- `data/_authoring/LLM_WORLD_BUILDER_PROMPT.md` — die Copy-Paste-Vorlage, mit
  der das Gerüst erzeugt wird
- `data/_authoring/ASSET_REQUIREMENTS.md` — welcher Dateiname wohin gehört
- `data/themes/dev_fixture/` — die Testwelt als lebendes Beispiel für jede
  Dateiform
- `README.md` dieses Plans — Eckdaten und die Regel „Lesewort nie in die Frage"

## Abnahmekriterien

1. Unter `data/themes/pokemon_lesen/` liegen: `world_config.json`,
   `cards.json`, drei Dateien unter `episodes/`, die ausgelagerten
   Aufgabendateien unter `events/`.
2. `world_config.json` hat drei Lernstufen (`jungtrainer`, `trainer`,
   `arenaleiter`), eine Etappenkarte mit **einer** Etappe und eine Ortskarte
   mit drei Punkten — je Punkt eine Episode, Koordinaten in Prozent.
3. **Jede** ausgelagerte Aufgabendatei hat eine Variante für **alle drei**
   Lernstufen. Story und Figuren bleiben über die Stufen gleich, nur die
   Aufgabe wird schwerer.
4. Kein `text_input` in dieser Welt (README, zweite Regel).
5. Jede Aufgabe hält die Lesewort-Regel ein: die Frage nennt das zu lesende
   Wort nicht, sie beschreibt nur, was zu tun ist. Jede Frage hat zusätzlich
   ein `question_simple` in kurzen Worten.
6. Jede `multiple_choice`-Aufgabe hat genau vier Optionen und bei jeder Option
   einen echten Dateinamen in `image` — im Vorlesemodus wird das Bild gezeigt,
   ohne Bild ist die Aufgabe für ein nicht lesendes Kind unlösbar.
7. `cards.json` hat sechs Karten in zwei Gruppen (`set`), gemischte
   Seltenheiten, je ein `hint` in einem kindgerechten Satz.
8. Zwei der Episoden enden mit einem `reward`-Event, dessen `card_id` in
   `cards.json` existiert.
9. `world_config.json` hat mindestens drei Erfolge, davon einer mit
   `episodes_completed` und `count: 1`, damit gleich zu Beginn etwas gelingt.
10. Die Schlusscheckliste aus Schema-Abschnitt 9 ist Punkt für Punkt abgehakt.

## Die drei Episoden (Inhalt festgelegt)

**1 — `ep_alabastia_start` · „Der erste Buchstabe"**
Professor Eich schickt das Kind mit Bisasam los. Dialog → Anlaut-Aufgabe →
Dialog → Anlaut-Aufgabe → Belohnung (Karte `bisasam_begleiter`).
Aufgabenform: Bildsuche. Gezeigt wird ein Bild mit mehreren Dingen, die Frage
lautet gesprochen „Finde alles, was mit **B** anfängt" — der Buchstabe wird
mitgesprochen, das ist gewollt; gelesen werden muss er nicht.

**2 — `ep_route_1_wiese` · „Wörter im Gras"**
Ein Rattfratz hat Wortkarten verstreut. Dialog → Wort-Bild-Zuordnung →
Silben-Aufgabe → Dialog → Wort-Bild-Zuordnung.
Wort-Bild-Zuordnung: Frage „Welches Wort passt zum Bild?" (gesprochen), das
Bild steht in der Frage, die vier Antworten sind **geschriebene Wörter** — hier
liest das Kind wirklich. Silben-Aufgabe: „Wie oft klatschst du bei diesem
Wort?", vier Antworten mit den Ziffern 1 bis 4 als Bild.

**3 — `ep_vertania_wald` · „Was sich reimt"**
Pikachu taucht auf. Dialog → Reim-Aufgabe → Bildsuche → Dialog → Reim-Aufgabe →
Belohnung (Karte `pikachu_freund`).
Reim-Aufgabe: Frage „Welches Bild reimt sich auf **Haus**?" (das Reimwort wird
gesprochen, die Antworten sind Bilder) — die Umkehrung von Episode 2, damit
Hören und Lesen beide vorkommen.

**Steigerung über die Lernstufen** (gilt für jede Aufgabe):

| Stufe | Was sich ändert |
|---|---|
| `jungtrainer` | Wörter mit zwei bis drei Buchstaben, sehr verschiedene Ablenker (Ball / Igel / Ofen) |
| `trainer` | Wörter mit vier bis fünf Buchstaben, Ablenker mit gleichem Anlaut (Ball / Bein / Baum) |
| `arenaleiter` | längere Wörter, Ablenker unterscheiden sich nur in einem Buchstaben (Maus / Haus / Laus) |

## Checkliste

- [ ] Ordner `data/themes/pokemon_lesen/` samt Unterordnern anlegen
      (`episodes/`, `events/`, `maps/`, `backgrounds/`, `sprites/`, `audio/`,
      `cards/`, `answers/`, `achievements/`).
- [ ] Gerüst über die Prompt-Vorlage erzeugen: `LLM_WORLD_BUILDER_PROMPT.md`
      plus vollständige `JSON_SCHEMA_REFERENCE.md` in einen Prompt, mit den
      Eckdaten aus der Plan-README als Aufgabe. Das Ergebnis ist ein **Entwurf**,
      kein fertiger Content — er wird gegen das Schema geprüft und
      nachgeschärft, nie ungelesen übernommen.
- [ ] `world_config.json` fertigstellen: Lernstufen, Etappenkarte mit einer
      Etappe, Ortskarte mit drei Punkten, Erfolge.
- [ ] Die drei Episodendateien nach der Vorgabe oben schreiben — Dialoge in
      kurzen Sätzen, zwei Bühnenplätze, je Zeile Sprite und Name.
- [ ] Die Aufgabendateien unter `events/` schreiben, alle drei Varianten je Datei.
- [ ] `cards.json` mit sechs Karten und zwei Gruppen.
- [ ] Alle Bild-Dateinamen, die hier vergeben werden, in einer Liste sammeln —
      sie ist die Bestellliste für Phase 2.
- [ ] Welt in `data/main_hub.json` eintragen (Kachel auf der Planetenkarte).
- [ ] Schema-Checkliste Abschnitt 9 abarbeiten: eindeutige IDs, jede `card_id`
      existiert, jede `config.ref` existiert, jede Variante vorhanden, jeder
      Dateiname geschrieben wie in `ASSET_REQUIREMENTS.md`.

## Doku

- [ ] Auffälligkeiten am Schema (fehlendes Feld, unklare Regel, ein Fall den es
      nicht vorsieht) in `FINDINGS.md` festhalten — das ist der eigentliche
      Ertrag dieser Phase neben dem Content.

## Report-Back
