# LLM World Builder Prompt

Copy-Paste-Vorlage für Claude, ChatGPT, Gemini & Co. Zweck: aus einer kurzen
Themenbeschreibung eine vollständige, schema-konforme Content-Welt generieren.

Funktioniert nur zusammen mit `JSON_SCHEMA_REFERENCE.md` — beides im selben
Prompt einfügen, sonst rät das Modell und erfindet Felder.

---

## Prompt-Vorlage

```
Du erstellst Content für eine story-basierte Spiel-Engine. Halte dich EXAKT
an das folgende JSON-Schema. Erfinde keine zusätzlichen Felder, lasse keine
Pflichtfelder weg, ändere keine Feldnamen. Verwende NUR die Eventtypen aus
der Tabelle in Abschnitt 5.0 — keine vorgemerkten und keine erfundenen Typen.

Grundprinzip: Eine Episode ist eine Eventliste. Dialog ist ein Event wie
jedes andere. Die Erzählung folgt dem Muster Dialog → Handlung → Konsequenz
→ Dialog, nicht Dialog → Quiz → Ende.

**Denkreihenfolge — verbindlich, nicht nur für die Eingabefelder:** Zuerst
welche Fähigkeiten geübt werden (Lernziele), dann welcher Aufgabentyp dazu
passt (Abschnitt 5.0 des Schemas), erst danach welche Geschichte das trägt.
Eine Welt, die mit der Story anfängt und Lernziele nachträglich draufsetzt,
erfüllt diesen Auftrag nicht — auch wenn am Ende dieselben Felder gefüllt
sind.

**Vier Ebenen variieren unterschiedlich — verbindlich:**
- Story, Dialog, Figuren: **gar nicht.** Jede Textvariante kostet eine
  Sprachaufnahme, sonst ist die Zeile stumm. Dialog-Events bekommen keinen
  `pool`.
- Deutsch-Aufgaben (Reime, Anlaute, Silben): **Pool** — mehrere
  handgeschriebene Fassungen.
- Mathe-Aufgaben: **Generator** — Vorlage plus Zahlenraum.
- Anzeigereihenfolge, Bildauswahl: **Mischung**, macht die Engine selbst.

=== SCHEMA ===
[Hier den kompletten Inhalt von JSON_SCHEMA_REFERENCE.md einfügen]
=== ENDE SCHEMA ===

=== AUFGABE ===
Lernziele: {Liste von Lernziel-IDs aus dem Katalog, eine pro geplanter
  Aufgabe, z. B. "he_gs1_deu_silben_erkennen, he_gs1_mat_formen" — leer
  lassen nur, wenn die Welt bewusst ohne Curriculum-Bezug entsteht. Katalog:
  docs/knowledge/lerninhalte-hessen-klasse-1.md}
Aufgabentypen-Zuordnung: {Bevor die Story entsteht: ordne JEDEM Lernziel oben
  einen Aufgabentyp aus der Typ-Tabelle des Schemas zu (nur gebaute Typen,
  Abschnitt 5.0). Passt zu einem Lernziel kein gebauter Typ, nenne es unten
  in der Ausgabe als "OHNE PASSENDEN TYP: <lernziel_id>" statt eine Aufgabe
  zu erzwingen, die nicht zur Fähigkeit passt.}
Lernstufen: {z. B. "matrose, navigator, kapitaen"}
Thema der Welt: {THEMA, z. B. "One Piece - Die hohe See des Wissens"}
Lerninhalt: {FACH, z. B. "Geometrie und Erdkunde"}
Story-Arcs / Karten: {z. B. "East Blue, Alabasta, Skypiea" — jeder Arc wird
  eine eigene Map mit eigenen Episoden}
Cast: {z. B. "Shanks, Luffy (Kind), Nami, Ace" — Beschreibung reicht, keine
  separate Stammdatendatei nötig}
Ton/Stil: {z. B. "abenteuerlich, leicht augenzwinkernd"}
Zielalter: {z. B. "6-10 Jahre, auch Kinder die noch nicht lesen"}
Episoden pro Arc: {z. B. 3}
Bildstil: {optional — wenn leer, schlage einen vor; siehe Vorgabe unten}

Erzeuge folgende Dateien vollständig:
1. world_config.json — mit ALLEN genannten Maps in maps[], je Map die
   nodes[] mit Prozent-Koordinaten (x/y zwischen 0 und 100), plus
   arc_overview mit einem stages[]-Eintrag pro Arc. Dazu achievements[]:
   mindestens ein Erfolg pro Arc (Bedingungstypen und Felder siehe Abschnitt 2
   des Schemas) — einer davon episodes_completed mit count 1, damit gleich zu
   Beginn etwas zu erreichen ist, der Rest zunehmend anspruchsvoll
   (stars_total, episode_perfect, stage_completed).
   PFLICHT: das Feld art_style — ein englischer Satz von 15 bis 35 Wörtern, der
   den verbindlichen Bildstil der Welt festlegt. Beschreibend formuliert
   (Linienführung, Schattierung, Farbigkeit, Formensprache), ohne Marken- oder
   Künstlernamen, ohne Motiv und ohne Kameraeinstellung. Dieser Satz wird
   später wörtlich in jeden Bild-Prompt kopiert; ohne ihn bekommt die Welt
   vierzig verschiedene Handschriften. Ist oben kein Bildstil vorgegeben,
   schlage einen vor, der zum Thema und zum Zielalter passt.
   Jeder Eintrag in difficulty_levels[] trägt neben id und label auch
   description (EIN Satz nach dem Muster "Leicht — kurze Aufgaben, viele
   Hinweise."), image ("stufe_<id>.png") und image_label (ein Satz, der das
   Bild beschreibt — er wird vorgelesen und steht als Ersatztext da, wenn die
   Datei fehlt). Die Reihenfolge im Array IST die Schwierigkeit: leicht zuerst.
2. cards.json — card_format unverändert übernehmen, plus eine Sammelkarte
   pro Episode und zusätzlich 1-2 seltene Karten pro Arc. Jede Karte:
   id, name, set (= "Etappe N · <Arc-Name>"), rarity, asset, flavor, hint.
   Der hint sagt in EINEM kindgerechten Satz, wie man die Karte bekommt.
3. Pro Episode: episodes/<arc_id>_<episode_nr>.json — background, korrektes
   active_map_id, passendes node_id und eine events[]-Liste in genau dieser
   Reihenfolge:
     a) ein dialog-Event, das die Szene aufbaut (mind. 3 Zeilen, abwechselnd
        position left/right, pro Zeile sprite + name + text + text_simple)
     b) ein Aufgaben-Event, referenziert über config.ref
     c) ein dialog-Event, das die Konsequenz erzählt (mind. 1 Zeile) —
        die Figuren reagieren auf das, was gerade passiert ist
     d) ein reward-Event mit einer card_id aus cards.json
4. Pro Episode genau ein events/<event_id>.json mit EINER Variante pro
   übergebener Lernstufe — Inhalt muss sich nach Schwierigkeit
   unterscheiden, nicht nur im Wortlaut. (Eine Lernstufen-Variante kann
   zusätzlich `pool` oder `generated` tragen, damit sich Wiederholungen
   nicht identisch anfühlen — Schema Abschnitt „pool und generated". Dieser
   Durchlauf erzeugt weiterhin nur die einzelne Aufgabe; Pools nachträglich
   zu befüllen ist eine eigene Content-Runde, kein Pflichtteil hier.)

   **Variationsbudget pro Aufgabe:** Nenne unter der Ausgabe jeder
   Event-Datei, mit welchem Budget sie später aufgefüllt werden soll —
   Richtwert **3 Fassungen** für Nebenaufgaben, **5 oder mehr** für
   Kernaufgaben einer Episode (die Aufgabe, auf die die Konsequenz-Zeile
   reagiert), oder bei einer rechenbaren Aufgabe den vorgesehenen
   Zahlenraum statt einer Fassungszahl. Das Budget ist eine Ansage an die
   nächste Content-Runde, kein Feld im JSON — dieser Durchlauf befüllt
   `pool`/`generated` nicht selbst.

   🟡 **Wiederverwendbar ist die Spezifikation, nicht die fertige
   Aufgabe.** „Zwei Mengen, 1–10 Elemente, Franchise variabel" trägt jede
   Welt. „Welche Schatzkiste enthält mehr Münzen" trägt nur diese. Wer beim
   Befüllen des Pools die Franchise-Bindung weglässt, weil die Vorlage
   generisch war, unterläuft genau die Entscheidung aus der README dieses
   Plans.

   Bei multiple_choice hat jede
   Option ein image (antwort_<slug>.png). Bei word_match trägt jedes Paar
   ein word und ein image (antwort_<slug>.png), 3-4 Paare pro Variante,
   kein Wort und kein Bild doppelt — und das gesuchte Wort steht NIE in
   der Frage, sonst liest das Kind es dort ab. Die leichteste Lernstufe
   bekommt zusätzlich question_simple. Die Datei trägt event_id, type,
   learning_objectives und variants — sonst nichts.
   learning_objectives: genau eine ID aus der oben übergebenen Lernziel-Liste,
   und zwar die, die diese Aufgabe tatsächlich prüft. Erfinde KEINE IDs. Wurde
   oben keine Liste übergeben, lasse das Feld weg und schreibe stattdessen
   unter die Datei eine Zeile "OHNE LERNZIEL: <event_id>", damit die Lücke
   sichtbar bleibt.

Regeln für text_simple und question_simple:
- kurze Hauptsätze, keine Nebensatz-Ketten, keine Fremdwörter
- inhaltlich dasselbe wie die Langfassung, nur einfacher — nichts weglassen,
  was zum Verständnis der Aufgabe nötig ist
- maximal etwa 12 Wörter pro Satz

=== AUSGABEFORMAT ===
Gib jede Datei einzeln aus, in dieser Form:

--- FILE: <relativer_pfad> ---
<reines JSON, kein Markdown-Codeblock, keine Kommentare>
--- END FILE ---

Keine Erklärungen zwischen den Dateien. Keine zusammenfassende Antwort danach.
=== ENDE AUFGABE ===
```

---

## Nutzungshinweise

- **Der Lernziel-Katalog bleibt Markdown, wird nicht maschinenlesbar.**
  Entscheidung vom 20.08.2026: `docs/knowledge/lerninhalte-hessen-klasse-1.md`
  ist bereits jetzt in Git versioniert (im Gegensatz zu `data/themes/`, das
  auf Drive liegt) — die Pflicht „Katalog gehört ins Git" ist damit erfüllt,
  ohne dass eine zweite Datei unter `data/curriculum/*.json` gepflegt werden
  müsste. Nichts im Code parst den Katalog maschinell; eine JSON-Fassung
  wäre eine zweite Quelle ohne Abnehmer. Kommt ein Abnehmer (z. B. ein
  Validierungsskript, das `learning_objectives` gegen den Katalog prüft),
  wird die Entscheidung an der Stelle neu getroffen — nicht vorab.
- **Abdeckung sichtbar machen:** Welche Lernziele eine Welt deckt, steht in
  keiner Extra-Datei — es ist die Menge aller `learning_objectives`-Werte
  über `events/*.json` der Welt. Grep reicht:
  `grep -h -A1 '"learning_objectives"' data/themes/<welt>/episodes/../events/*.json`
  liefert die IDs; Abgleich gegen die oben übergebene Lernziel-Liste zeigt,
  was fehlt oder zusätzlich passiert ist (z. B. durch ein Mischformen-Event
  mit zwei IDs).
- **Ein Durchlauf = eine Welt, alle Arcs.** Bei vielen Arcs/Episoden lieber
  pro Arc einen eigenen Lauf machen (Iterations-Prompt unten) — lange Outputs
  verlieren Schema-Disziplin.
- **Nach der Generierung: Checkliste aus `JSON_SCHEMA_REFERENCE.md` Abschnitt 9
  manuell durchgehen.** Referenzintegrität über viele Dateien hält kein Modell
  zuverlässig durch.
- **`correct_index` und `accepted_answers` immer selbst gegenlesen.**
- **Die Konsequenz-Zeile gegenlesen.** Der Dialog nach dem Aufgaben-Event ist
  der eigentliche Grund, warum das Kind weiterspielt — er muss die Handlung
  aufgreifen („Der Kompass zeigt nach Norden, also segeln wir dorthin"), nicht
  bloß loben („Super gemacht!"). Modelle schreiben hier reflexhaft Lob.
- **`position`-Werte prüfen:** zwei Figuren im selben Dialog dürfen sich
  abwechseln, aber zwei direkt aufeinanderfolgende Zeilen auf `left` *und*
  `right` gleichzeitig sind kein Fehler — das ist der Normalfall eines
  Wechselgesprächs. Fehler ist es, wenn eine Figur fälschlich die Seite
  wechselt, ohne dass das dramaturgisch Sinn ergibt.
- Sprite-Dateinamen generiert das Modell nur als String — die Bilder selbst
  entstehen über `image-prompts/SPRITES.md`. Namen vorher festlegen und in
  beide Prompts konsistent einspeisen. Das gilt genauso für Kartenbilder
  (`karte_<id>.png`), Bildantworten (`antwort_<slug>.png`) und die drei
  Lernstufen-Bilder (`stufe_<level_id>.png`).
- **Die drei Lernstufen-Bilder gehören in die Bestellliste jeder neuen Welt.**
  Sie sind technisch optional — eine Welt ohne sie läuft — aber ihre
  Stufenauswahl sieht dann schlechter aus als die der Bestandswelten
  ([ADR-018](../../docs/decisions/018-lernstufen-bilder-im-content.md)).
- **Koordinaten immer nachjustieren.** Das Modell kann die Kartenillustration
  nicht sehen und rät die Prozentwerte. Nach der Generierung einmal die Karte
  im Spiel öffnen und die Punkte auf die tatsächlichen Landmarken schieben.
- **`hint` gegenlesen.** Er ist das einzige, was ein Kind vor einer
  verschlossenen Karte sieht — „Alle 3 Fragen im Windmühlen-Dorf lösen" ist
  brauchbar, „Fortschritt erzielen" ist wertlos.
- **`text_simple` laut lesen.** Was beim Vorlesen stolpert, stolpert auch bei
  der Sprachausgabe.

## Iterations-Prompt (weiteren Arc / weitere Episode nachbauen)

```
Hier ist world_config.json der bestehenden Welt:
[world_config.json einfügen]

Hier eine bestehende Episode als Stilreferenz:
[episode_xy.json einfügen]

Hier das Schema zur Kontrolle:
[JSON_SCHEMA_REFERENCE.md, Abschnitt 4 + 5]
Eine Episode ist eine Eventliste. Dialog ist ein Event wie jedes andere.

Erstelle einen neuen Arc "{NEUER_ARC_NAME}" als zusätzlichen Eintrag in
maps[], plus {ANZAHL} neue Episoden mit Lerninhalt {NEUER_INHALT}. Cast und
Ton bleiben konsistent zur Stilreferenz.
```
