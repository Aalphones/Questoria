# ADR-014: Zuordnen ist ein eigener Eventtyp, kein Bildfeld im Quiz

**Status:** entschieden · 18.08.2026

## Kontext

Die Engine kann Wissen abfragen, aber nicht Lesen üben. Ein Quiz
(`multiple_choice`) zeigt eine Frage und vier Antworten und will genau eine
Antwort — das ist **ein** Lesevorgang pro Aufgabe. Sobald über den Antworten
Motivbilder stehen (Vorlesemodus, Abschnitt 5.3), ist es keiner mehr: Das Bild
verrät die Antwort, ohne dass ein Wort gelesen wurde.

Der Auslöser kam aus der ersten echten Welt: Sechs von acht Aufgaben der
Pokémon-Welt waren Hörübungen — in einer Welt, die „Lesen lernen" heißt
(`docs/planning/2026-08-18_erste-echte-welt/FINDINGS.md`).

Gebraucht wird eine Aufgabe, bei der mehrere geschriebene Wörter gelesen werden
müssen und **niemand** sie vorlesen kann.

## Optionen

1. **Ein Bildfeld im Quiz** — `multiple_choice` bekommt einen Modus, in dem das
   Bild die Frage ist und die vier Antworten Wörter sind. Kein neuer Typ, keine
   neue Komponente.
2. **Mehrere Quiz-Aufgaben hintereinander** — pro Bild ein eigenes Event mit
   vier Wörtern zur Auswahl. Braucht überhaupt nichts Neues.
3. **Ein eigener Eventtyp `word_match`** — drei bis vier Bilder und ebenso viele
   Wortkarten in einer Aufgabe, das Kind legt zusammen, was zusammengehört.

## Entscheidung

Option 3.

Option 1 scheitert an der Bewertung, nicht an der Optik: Ein Quiz hat genau
einen `correct_index` und einen Stern, der am ersten Tipp hängt. Eine
Zuordnungs-Aufgabe hat mehrere richtige Paare und braucht eine Regel darüber,
wie sich die Teilversuche zu einem Stern verrechnen. Wer das in
`multiple_choice` einbaut, verbiegt dessen Kontrakt für alle bestehenden Welten.

Option 2 funktioniert, ist aber dieselbe Übung in schlechter: Vier Wörter zur
Auswahl heißen, dass drei davon nur Ablenkung sind — gelesen wird im Zweifel
nur, bis das passende gefunden ist. Bei der Zuordnung ist **jedes** Wort ein
Wort, das gebraucht wird: vier Bilder, vier Wörter, vier Lesevorgänge.

Bewertet wird die ganze Aufgabe, nicht das einzelne Paar: `correctFirstTry` ist
nur dann `true`, wenn jedes Paar beim ersten Versuch saß. Das ist eine
Design-Entscheidung, keine Einstellung — „drei von vier Paaren zählen auch"
wäre eine andere Aufgabe, und ein anteiliger Stern wäre in der Sternenformel
ein Sonderfall, den kein anderer Typ hat.

Bedient wird mit zwei Tipps (erst ein Bild, dann eine Wortkarte oder
umgekehrt), **nicht** mit Ziehen: Drag & Drop ist für Sechsjährige auf einem
Tablet motorisch anspruchsvoll und kollidiert mit dem Scrollen der Seite.

## Konsequenzen

- Ein neuer Typ heißt wie immer: ein Ordner unter `features/events/`, drei
  Zeilen in `event-type-map.ts`, ein Abschnitt im Schema (5.6). **Kein
  Backend-Code** — die Datei lädt derselbe Aufruf wie jede ausgelagerte Aufgabe
  ([ADR-007](007-ausgelagerte-events-ueber-die-schnittstelle.md)).
- Die Wörter werden **nie** vorgelesen. Die Frage schon — das macht die
  Aufgaben-Hülle von allein —, die Wortkarten nicht. Das ist der ganze Sinn der
  Aufgabe und die einzige Stelle, an der `word_match` vom Vorlesemodus abweicht.
- Die Bilder einer Zuordnungs-Aufgabe dürfen kein Wort im Bild tragen, sonst
  löst sich die Aufgabe von selbst. Das steht als Regel bei den Bildvorgaben.
- `multiple_choice` bleibt unverändert. Bestehende Welten merken von dieser
  Entscheidung nichts.
