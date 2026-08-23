# ADR-020: Freischaltung abgeleitet **und** im Spielstand

**Status:** entschieden · 23.08.2026

## Kontext

Kartenkacheln schalten sich der Reihe nach frei: die erste ist offen, jede
weitere erst, wenn alle Stationen der vorherigen geschafft sind. Diese Regel
ist eine reine Funktion über den Fortschritt — man könnte den Freischalt-Stand
also bei jeder Anzeige neu ausrechnen und nirgends speichern.

## Optionen

1. **Nur ableiten.** Kein neues Feld im Spielstand, keine Wanderung über die
   Leitung, keine Altlast bei bestehenden Spielständen. Dafür gibt es kein
   Gedächtnis: Alles, was nicht aus dem Fortschritt folgt, ist nicht
   darstellbar — ein später gekaufter Hinweis, ein von Hand geöffnetes Gebiet.
   Auch „diese Kachel ist gerade **neu** aufgetaucht" ließe sich nicht sagen,
   ohne den vorherigen Anzeigestand vorzuhalten, den Signale nicht von selbst
   aufbewahren.
2. **Nur speichern.** Der Spielstand ist die Wahrheit, die Regel schreibt ihn
   fort. Ein Fehler beim Fortschreiben friert die Karte dann dauerhaft ein.
3. **Beides, vereinigt.** Abgeleitet wird, was laut Fortschritt offen sein
   sollte; gespeichert wird eine Hochwassermarke, die nur wächst. Angezeigt
   wird die Vereinigung.

## Entscheidung

Option 3. Die Ableitung bleibt die Quelle der Wahrheit, der gespeicherte Teil
ist ein Gedächtnis daneben — er wird mit der Ableitung **vereinigt**, nie durch
sie ersetzt und nie verkleinert.

Im Spielstand steht dafür `revealedTiles`, ein Verzeichnis von
Karten-Geltungsbereich auf Kachel-Ids: `'arc_overview'` für die Etappenkarte,
die `MapEntry.id` für eine Ortskarte. Die Planetenkarte kommt darin nicht vor —
sie hat keine Freischaltung.

## Konsequenzen

- Was einmal sichtbar war, verschwindet nie wieder. Ein Rechenfehler in der
  Ableitung kann Gebiet hinzufügen, aber keines wegnehmen.
- Spätere Sonderfälle (Hinweis-Kauf, manuelles Freischalten) brauchen kein
  neues Konzept — sie schreiben in dieselbe Hochwassermarke.
- „Fortschritt zurücksetzen" muss `revealedTiles` ausdrücklich mit leeren.
  Genau das ist der Preis des Gedächtnisses: Es vergisst nicht von allein.
- Geschrieben wird nur, wenn tatsächlich eine Kachel dazukommt. Ohne diesen
  Vergleich schickte jeder Kartenaufruf einen Spielstand an den Server.
- Das Backend bleibt unberührt: es liest `state` nicht strukturiert, sondern
  reicht ihn als Text durch (ADR-009).
