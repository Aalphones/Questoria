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

=== SCHEMA ===
[Hier den kompletten Inhalt von JSON_SCHEMA_REFERENCE.md einfügen]
=== ENDE SCHEMA ===

=== AUFGABE ===
Thema der Welt: {THEMA, z. B. "One Piece - Die hohe See des Wissens"}
Lerninhalt: {FACH, z. B. "Geometrie und Erdkunde"}
Lernstufen: {z. B. "matrose, navigator, kapitaen"}
Story-Arcs / Karten: {z. B. "East Blue, Alabasta, Skypiea" — jeder Arc wird
  eine eigene Map mit eigenen Episoden}
Episoden pro Arc: {z. B. 3}
Cast: {z. B. "Shanks, Luffy (Kind), Nami, Ace" — Beschreibung reicht, keine
  separate Stammdatendatei nötig}
Ton/Stil: {z. B. "abenteuerlich, leicht augenzwinkernd"}
Zielalter: {z. B. "6-10 Jahre, auch Kinder die noch nicht lesen"}

Erzeuge folgende Dateien vollständig:
1. world_config.json — mit ALLEN genannten Maps in maps[], je Map die
   nodes[] mit Prozent-Koordinaten (x/y zwischen 0 und 100), plus
   arc_overview mit einem stages[]-Eintrag pro Arc. Dazu achievements[]:
   mindestens ein Erfolg pro Arc (Bedingungstypen und Felder siehe Abschnitt 2
   des Schemas) — einer davon episodes_completed mit count 1, damit gleich zu
   Beginn etwas zu erreichen ist, der Rest zunehmend anspruchsvoll
   (stars_total, episode_perfect, stage_completed)
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
   unterscheiden, nicht nur im Wortlaut. Bei multiple_choice hat jede
   Option ein image (antwort_<slug>.png), und die leichteste Lernstufe
   bekommt zusätzlich question_simple. Die Datei trägt event_id, type und
   variants — sonst nichts.

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
  (`karte_<id>.png`) und Bildantworten (`antwort_<slug>.png`).
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
