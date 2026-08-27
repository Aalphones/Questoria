# Phase 8 — Vertonung, vollständig statt nur Dialog

**Rating:** heikel (Schema-Erweiterung + Verdrahtung durch fünf
Aufgaben-Komponenten + Erweiterung des Vertonungs-Werkzeugs um einen neuen
Lesepfad — keine reine Content-Phase wie 5–7)

**Nachträglich angehängt am 23.08.2026 (Sascha):** Diese Phase gehört
thematisch nicht zu „Vollbild-Karten mit Pan/Zoom" — sie hängt hier, weil sie
im selben Zug entstand, als Phase 5 die `pokemon`-Welt neu bestückt hat und
dabei auffiel, dass Fragen und Ansagen bislang **nie** eine Aufnahme hatten.

## Auftrag

*„Achte darauf, dass auch wirklich alles inklusive der Fragen vertont wird.
Ich möchte kein Vorlesen-Dreck vom Browser haben. Auch die Fragen und
Antworten, wenn nötig — weil nur Wörter sollen vorgelesen werden [nicht
gelesen]. Bei Fragen und Antworten auch mit passendem Button zum nochmal
abspielen, wenn man auf Bilder & Vorlesen unterwegs ist."*

## Kontext (lesen, bevor du anfängst)

- `frontend/src/app/services/narration.service.ts` — `speak(text, audioUrl?)`:
  spielt eine Aufnahme, sonst `speechSynthesis` (**das** ist der „Vorlesen-
  Dreck vom Browser").
- `frontend/src/app/ui/task-card/task-card.ts` + `read-aloud-button/` — der
  Wiederhol-Knopf und das Verdrahtungsziel `questionAudioUrl` **existieren
  bereits als Komponenten-API**, sind aber an **keiner** der sechs Stellen
  angebunden, die sie nutzen (belegt per Grep, 23.08.2026).
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 5 (Eventtypen) +
  Abschnitt 6 (Vorlesemodus) — wird in dieser Phase ergänzt.
- `.claude/skills/vertonung/SKILL.md` + `data/_authoring/voice-tools/voice_lines.py`
  — die Fünf-Schritte-Anleitung und der `ANNOUNCEMENT_EVENT_FIELDS`-
  Erweiterungspunkt, den diese Phase als Vorbild nutzt.
- `data/themes/pokemon/events/*.json` — die zehn Aufgabendateien aus Phase 5,
  Ziel-Content für den ersten echten Lauf.

## Befund: der Umfang ist größer als „ein paar mp3s nachziehen"

Vier unabhängige Lücken, alle vor Sascha nicht sichtbar, weil sie sich erst
beim Nachverfolgen von `narration.speak(...)` zeigen:

1. **Fragen haben nirgends ein Audiofeld.** Weder `multiple_choice` noch
   `word_match`, `sorting`, `number_line`, `image_search` kennen im Schema
   ein `question_audio_path` — es gibt nichts, das man befüllen könnte.
2. **Die Verdrahtung fehlt sogar dort, wo das Zielfeld schon existiert.**
   `task-card.questionAudioUrl` und `read-aloud-button` sind fertige,
   wiederverwendbare Komponenten — aber keine der sechs `*.html`-Dateien der
   Aufgaben-Typen bindet sie. Jede Frage läuft heute **immer** über
   `speechSynthesis`, in jeder Welt, nicht nur in `pokemon`.
3. **Das Vertonungs-Werkzeug liest nur Episodendateien.** `question`/
   `question_simple` stehen aber in den **ausgelagerten** `events/*.json`
   (Abschnitt 4 der Schema-Referenz, „Inline oder ausgelagert") — die liest
   `voice_lines.py` heute gar nicht. Der `ANNOUNCEMENT_EVENT_FIELDS`-
   Mechanismus ist der richtige Vorbild-Ansatz, deckt aber nur Felder
   *innerhalb* einer Episodendatei ab, keine referenzierten Dateien.
4. **Zwei motorunabhängige Ansagen sind fest im Code verdrahtet** und laufen
   in **jeder** Welt immer über `speechSynthesis`, nie über eine Aufnahme:
   `resume-prompt.ts` („Du warst hier schon mittendrin! …") und `reward.ts`
   („Du hast alles geschafft — super gemacht!"). Das sind keine Content-Texte,
   sondern feste Engine-Strings — eine einzige Aufnahme pro Satz reicht für
   immer.

## 🔴 Offene Entscheidung: `generated`-Varianten lassen sich nicht vorab vertonen

`zahlenstrahl_wald.jungtrainer` und `.trainer` nutzen `generated` (Vorlage
`"Auf welchem Feld steht die {ziel}?"` + Zufallsbereich für `{ziel}`, siehe
Schema Abschnitt 5.8) — der Frage-Text entsteht erst **zur Laufzeit**. Eine
feste Aufnahme kann das nicht abdecken, ohne die Vorlage aufzugeben.

| Weg | Vorgehen | Dafür | Dagegen |
|---|---|---|---|
| **A — `generated` durch `pool` ersetzen (empfohlen)** | Die betroffenen Varianten bekommen feste Frage-Sätze wie die anderen Aufgabentypen (Zahlbereich bleibt über mehrere Pool-Einträge abgedeckt) | Passt zum „kein Vorlesen-Dreck"-Anspruch ohne Ausnahme, keine Zusatztechnik | Weniger Zufallsvielfalt bei dieser einen Aufgabe |
| **B — Ausnahme dokumentieren, `speechSynthesis` bleibt hier erlaubt** | `generated`-Fragen bleiben, wie sie sind | Kein Umbau nötig, seltener Fall | Widerspricht dem expliziten Auftrag „auch die Fragen" ohne Ausnahme |
| **C — Text in feste + gesprochene Zahl zerlegen, zur Laufzeit zusammensetzen** | Zwei Audiofragmente, per Player hintereinander abgespielt | Behält `generated` vollständig | Neuer Player-Mechanismus für eine einzige Aufgabe — Aufwand passt nicht zum Nutzen |

**Empfehlung: A.** Wird am Anfang der Umsetzung entschieden, bevor Schema
oder Werkzeug angefasst werden — wie beim Kartenverfahren in Phase 6.

## Klarstellung: was „Antworten vorlesen" **nicht** heißt

Multiple-Choice-Antworten zeigen im Vorlesemodus **Bild + Ziffer statt Text**
(`multiple-choice.ts`, `showAnswerImages`) — das Bild ersetzt den Lesetext,
es gibt nichts zu sprechen. Bei `word_match` ist „die Wörter werden nie
vorgelesen" eine **bewusste** Lernziel-Entscheidung (Schema Abschnitt 5.6,
Reim/Wort-Erkennung wäre sonst sinnlos) — die bleibt unangetastet. Sortier-
Körbe und -Gegenstände zeigen Bild oder Text, werden aber heute an keiner
Stelle einzeln gesprochen, und diese Phase ändert daran nichts. „Auch die
Antworten" heißt in der Praxis: **die Frage selbst** ist überall abgedeckt,
nicht dass jedes einzelne Wort eine eigene Aufnahme bekommt — wenn das nicht
gemeint war, bitte vor dem Start korrigieren.

## Kontrakt

**Schema-Erweiterung (`JSON_SCHEMA_REFERENCE.md` Abschnitt 5, jeder
ausgelagerte Eventtyp):** Jede Variante, die ein `question`-Feld trägt,
bekommt zusätzlich optional `question_audio_path` — bei `pool`-Varianten auf
**jedem Pool-Eintrag** (jeder hat einen eigenen Fragetext), sonst auf der
Variante selbst. `generated`-Varianten tragen das Feld nicht (Weg A macht sie
zu `pool`-Varianten).

**Frontend-Verdrahtung (sechs Stellen):** `multiple-choice.html`,
`word-match.html`, `sorting.html`, `number-line.html`, `image-search.html`
binden `[questionAudioUrl]` an `qst-task-card` — Muster identisch mit dem
bereits bestehenden Umgang mit `questionText`, nur ein zusätzliches Feld aus
`config` gelesen. `resume-prompt.ts`/`reward.ts` bekommen je einen festen,
world-unabhängigen `audioUrl`-Konstante statt `speak(TEXT)` ohne zweites
Argument.

**Werkzeug-Erweiterung (`voice_lines.py`):** neue Funktion analog
`iter_announcement_lines`, die pro Welt alle `events/*.json` liest, pro
Variante/Pool-Eintrag den Frage-Text zieht (`question_simple` bevorzugt,
Fallback `question` — Konvention aus `--text simple|full` bereits vorhanden),
erzeugt und `question_audio_path` zurückschreibt. Sprecher: **`erzaehler`**
durchgehend (Fragen hängen an keiner Bühnenfigur, Konvention aus den
`pokemon_catch`-Ansagen übernehmen).

## Umsetzung

1. 🔴-Entscheidung oben klären (A/B/C).
2. Bei Weg A: `zahlenstrahl_wald.json` `jungtrainer`/`trainer` von `generated`
   auf `pool` umstellen (3er-Pool je Stufe, wie `arenaleiter` es bereits vorlebt).
3. `content.types.ts`: `question_audio_path` an den passenden Config-Typen
   ergänzen (`MultipleChoiceConfig`, `WordMatchConfig`, `SortingConfig`,
   `NumberLineConfig`, `ImageSearchConfig` bzw. deren Pool-Item-Typen).
4. `resolve-event-config.ts` reicht das Feld unverändert durch (kein
   Sonderfall nötig, wenn es einfach ein weiteres optionales String-Feld ist).
5. Sechs Komponenten verdrahten (siehe Kontrakt) + jeweiliges `.html`.
6. `voice_lines.py`: `events/*.json`-Leser bauen, Sprecher `erzaehler`, Ziel-
   Ordner analog `audio/voices/`, Rückschreibe-Pfad `question_audio_path`.
7. `resume-prompt.ts`/`reward.ts`: zwei einmalige Aufnahmen erzeugen
   (unabhängig vom Welt-Loop, landen z. B. unter `data/audio/engine/` — kein
   Welt-Ordner, weil world-unabhängig), `audioUrl`-Konstante im Code setzen.
8. Sechs neue Figuren aus Phase 5 in `voices.json` besetzen (`mama`, `blau`,
   `verkaeufer`, `schwester`, `nachbar`, `kaefersammler`) + Stimmprobe hören
   (Schritt 3 der `vertonung`-Anleitung), bevor der große Lauf startet.
9. Trockenlauf über `pokemon`, dann episodenweise vertonen (Dialogzeilen +
   Ansagen, wie gehabt) und die neue Fragen-Vertonung separat fahren.
10. Stichprobe anhören (mind. drei Fragen, zwei neue Figuren, beide neuen
    Engine-Ansagen) — Eigennamen (Pokémon-Namen!) besonders prüfen.
11. `JSON_SCHEMA_REFERENCE.md` Abschnitt 5 + 6 und `vertonung/SKILL.md`
    nachziehen (neue Feld-Dokumentation, neuer Werkzeug-Schritt).

## Akzeptanzkriterien

1. Jede Frage aller fünf Aufgabentypen hat im Vorlesemodus einen
   Wiederhol-Knopf, der eine echte Aufnahme abspielt — kein Rückfall auf
   `speechSynthesis` bei vollständig vertontem Content.
2. Die beiden Engine-Ansagen (Fortsetzen-Dialog, Erfolgs-Nachricht) spielen
   in jeder Welt eine feste Aufnahme statt der Geräte-Stimme.
3. `pokemon` ist vollständig vertont: alle Dialogzeilen (bestehend + neu aus
   Phase 5), alle Fragen aller zehn Aufgabendateien, beide `pokemon_catch`-
   Ansagen.
4. Kein `generated`-Frage-Text ohne Audio übrig — entweder durch Weg A gelöst
   oder die gewählte Alternative sauber im Content/Doku sichtbar.
5. `voice_lines.py --theme pokemon --dry-run` zeigt jetzt auch die
   Fragen-Zeilen mit Sprecher `[erzaehler]`, nicht nur Dialogzeilen.
6. Build + Lint grün, `JSON_SCHEMA_REFERENCE.md` und `vertonung/SKILL.md`
   beschreiben den tatsächlichen Stand.

## Konfidenz-Ausweis

Am unsichersten: ob `question_audio_path` auf **Pool-Item-Ebene** technisch
sauber durch `resolve-event-config.ts` durchgereicht wird, oder ob die
Auflösung von `ref` + Lernstufe + Zufallsziehung aus dem Pool das Feld
unterwegs verliert (die Funktion wurde nie für ein zusätzliches Audiofeld
gebaut). **Check:** Vor der Komponenten-Verdrahtung eine einzelne Aufgabe mit
Test-Dateiname durchspielen und im Debugger/Log prüfen, dass
`question_audio_path` am Ende bei der Komponente ankommt.

## Report-Back

**Phase abgeschlossen am 27.08.2026.** Code, Werkzeug, Doku und alle Aufnahmen
sind fertig; offen ist allein die Abnahme am Bildschirm und am Ohr.

**Die Läufe:** 97 Fragen erzeugt (0 Fehlschläge, Rückverweis in allen zwölf
Aufgaben-Dateien), danach 31 Dialogzeilen der sechs neuen Figuren (0
Fehlschläge, 10 Episodendateien nachgezogen). `pokemon` steht bei 145 Aufnahmen.
Gegengeprüft: **jeder** `audio_path`, `intro_audio_path` und
`question_audio_path` im Content zeigt auf eine tatsächlich vorhandene Datei —
kein toter Verweis.

**Commit:** `6e49dc6`

### Akzeptanzkriterien — Stand

| AK | Stand | Beleg |
|---|---|---|
| 1 — jede Frage mit Wiederhol-Knopf und echter Aufnahme | **am Code erfüllt, am Bildschirm ungeprüft** | alle sechs `*.html` binden `[questionAudioUrl]`, alle sechs `*.ts` haben das `computed` |
| 2 — beide Engine-Ansagen mit fester Aufnahme | **erfüllt** | `data/audio/engine/erzaehler_resume_prompt.mp3` und `…_reward_done.mp3` liegen, beide Komponenten verdrahtet |
| 3 — `pokemon` vollständig vertont | **erfüllt** | 145 Aufnahmen unter `audio/voices/`, 0 Fehlschläge, jeder Verweis im Content zeigt auf eine vorhandene Datei |
| 4 — kein `generated`-Fragetext ohne Audio | **erfüllt** | `"generated"` kommt in `data/themes/` nirgends mehr vor (gegen den ganzen Ordner geprüft) |
| 5 — Trockenlauf zeigt Fragen-Zeilen | **erfüllt** | `--dry-run` listet 97 Fragen als Sprecher `Frage`, plus 47 Dialoge und 1 Ansage |
| 6 — Build + Lint grün, Doku beschreibt den Stand | **erfüllt** | `ng build` und `ng lint` sauber; Schema-Referenz 5+6, `ASSET_REQUIREMENTS.md` 3, `vertonung`-Skill und `code-map.md` nachgezogen |

Offen bleibt allein die Abnahme am Bildschirm und am Ohr — beides steht in der
Prüf-Checkliste am Ende der Plan-README.

### Die drei Entscheidungen am Anfang (Sascha, 27.08.2026)

- **`generated` → Weg A.** `zahlenstrahl_wald.jungtrainer`/`.trainer` sind jetzt
  `pool`-Varianten mit je drei festen Fragen. Damit trägt keine Aufgabe der
  Anwendung mehr einen zur Laufzeit gebauten Fragetext — geprüft, `"generated"`
  kommt in `data/themes/` nirgends mehr vor. AK 4 erfüllt.
- **AK 12 gelockert** (Vier-Emotionen-Widerspruch aus Phase 7): `ASSET_REQUIREMENTS.md`
  § 2 gewinnt, das AK ist in der README umformuliert. Keine Bildarbeit nötig.
- **Umfang bestätigt:** vertont wird die *Frage*, nicht jedes Antwortwort.

### 🟡 Der Plan zählte fünf Aufgabentypen — es sind sechs

`text_input` trägt eine `question`, hat eine eigene Komponente und steht in
`SCORED_EVENT_TYPES`. Mit fünf wäre AK 1 („kein Rückfall auf `speechSynthesis`")
schlicht falsch gewesen. Er ist überall mitgezogen — Schema, Typ, Komponente,
Werkzeug.

### Konfidenz-Check: am Code beantwortet, nicht im Debugger

Der Plan wollte eine Aufgabe mit Test-Dateinamen durchspielen, um zu sehen, ob
`question_audio_path` die Pool-Auflösung überlebt. Der Blick in
`resolve-event-config.ts` beantwortet das billiger und sicherer: `resolveSlot()`
gibt einen Pool-Eintrag als `{ id, ...config }` weiter und `resolveTemplateDeep()`
läuft über *jedes* Feld. Es gibt keine Feldliste, die ein zusätzliches optionales
Feld verlieren könnte — das Durchreichen ist generisch.

### Was gebaut wurde

- **Schema:** `question_audio_path` an allen sechs Frage-Configs
  (`content.types.ts`), dokumentiert in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5
  (einmal zentral statt sechsmal) und Abschnitt 6 (Tabelle „wo überall eine
  Aufnahme hingehört" plus die bewussten Nicht-Fälle).
- **Frontend, sechs Aufgabentypen:** jede Komponente hat ein
  `questionAudioUrl`-`computed`, jedes Template bindet es an `qst-task-card`.
  Die Pfad-Falle („der Wert trägt den Unterpfad schon, `assetUrl()` würde ihn
  verdoppeln") steht **einmal** in der neuen geteilten Funktion
  `features/events/question-audio.ts` statt sechsmal als Kommentar.
- **Frontend, zwei Engine-Ansagen:** `resume-prompt.ts` und `reward.ts` bekommen
  ihre Aufnahme über die neue `ContentService.engineAudioUrl()`; der
  Wiederhol-Knopf im `reward` spielt sie ebenfalls.
- **Werkzeug:** `voice_lines.py` liest jetzt zusätzlich `events/*.json`
  (`iter_question_lines`, `QUESTION_EVENT_TYPES`), schreibt `question_audio_path`
  zurück (`audio_targets_of` als Weiche je Dateisorte) und zeigt Fragen im
  Trockenlauf als Sprecher „Frage". Neu daneben: `generate_engine_lines.py` für
  die zwei weltunabhängigen Sätze.
- **Besetzung:** die sechs neuen Figuren aus Phase 5 (`mama`, `schwester`,
  `blau`, `verkaeufer`, `nachbar`, `kaefersammler`) stehen in `voices.json`.

### Zwei eigene Entscheidungen unterwegs

- **`_default` von Julian auf Jakob umgestellt.** Das war ein offener 🟡-Punkt aus
  einem früheren Plan: `_default` klang wie Professor Eich, jede vergessene Figur
  hätte unbemerkt wie er geklungen. Jetzt, wo ohnehin sechs Figuren dazukamen,
  war der Moment dafür. Begründung steht als Kommentar in `voices.json`.
- **`data/audio/engine/` liegt im Repo**, anders als `data/themes/` und
  `data/avatars/`. Zwei mp3s à ~50 KB, weltunabhängig, gehören zur Engine wie
  jedes andere ausgelieferte Asset. `deploy.cmd content` nimmt sie mit
  (`_authoring/` ist der einzige ausgesparte Ordner).

### 🔴 Was noch aussteht — Abnahme

✅ Stimmproben abgenommen (Sascha, 27.08.2026), beide Läufe durch.

**Stichprobe anhören** (Plan-Schritt 10) — Prüfstein sind die Eigennamen,
deutsche Modelle raten bei sowas:

| Datei (unter `data/themes/pokemon/audio/voices/`) | Worauf hören |
|---|---|
| `erzaehler_frage_zahlenstrahl_wald_001.mp3` | „Raupy" — frisch erfundener Fragetext, nie zuvor vertont |
| `erzaehler_frage_zahlenstrahl_wald_002.mp3` | „Hornliu" — dito |
| `erzaehler_frage_silben_klatschen_001.mp3` | „Pokéball" — das Akut-e ist der klassische Stolperer |
| `mama_ep_alabastia_zuhause_001.mp3` | neue Stimme Marie im echten Satz |
| `blau_ep_alabastia_rivale_001.mp3` | neue Stimme Elias, Rivalen-Ton |
| `data/audio/engine/erzaehler_resume_prompt.mp3` | Engine-Ansage, lange Frage mit zwei Alternativen |
| `data/audio/engine/erzaehler_reward_done.mp3` | Engine-Ansage, kurzer Jubelsatz |

Klingt ein Eigenname falsch: Wort lautschriftlich in den Content-Text schreiben
(`Pokeball` statt `Pokéball`) und einmal mit `--force` über die Welt laufen.

**Am Bildschirm prüfen:** eine Aufgabe im Vorlesemodus öffnen und den
Wiederhol-Knopf drücken — spielt eine Aufnahme, nicht die Gerätestimme. Und
eine Episode abbrechen, neu betreten: der Fortsetzen-Dialog muss jetzt gesprochen
werden statt vorgelesen.

### 🟡 Eine Falle, die beim Bauen aufgefallen ist

Die laufende Nummer einer Frage zählt **Position** in der Event-Datei, über alle
Lernstufen und Pool-Einträge hinweg. Wird später ein Pool-Eintrag **in der Mitte**
eingefügt, verschieben sich alle folgenden Nummern, und jeder Rückverweis zeigt
dann auf die Aufnahme der Nachbarfrage. Steht als Warnung im `vertonung`-Skill;
Gegenmittel ist ein `--force`-Lauf über die betroffene Welt.

### Follow-ups (nichts davon blockiert)

- **`VoiceLine.episode_file`/`.episode_id` heißen jetzt irreführend** — bei einer
  Frage tragen sie die Event-Datei und die `event_id`. Ein Kommentar sagt das;
  sauber wäre `source_file`/`source_id`, das berührt aber beide Generatoren und
  gehörte nicht in diese Phase.
- **Der Fortsetzen-Dialog hat keinen Wiederhol-Knopf.** Ein Kind, das die Frage
  nicht versteht, kann sie nicht noch einmal hören. Ein `qst-read-aloud-button`
  wäre eine Zeile — AK 2 verlangt ihn nicht, deshalb nicht ungefragt gebaut.
