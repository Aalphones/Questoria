# ADR-009: Wie sich ein Spielstand auf die Datenbank verteilt

**Status:** entschieden · 18.08.2026

## Kontext

Das Schema für Spielstände liegt seit Meilenstein 1 bereit
(`backend/src/Migrations/sql/004_create_savegames.sql`): eine Zeile je Profil
und Welt, mit Spalten für Episode, Position und einem JSON-Feld
`game_state_json`. Was genau in dieses Feld gehört — und was daneben in eigene
Tabellen —, war bis hierher offen.

Zwei Dinge geben den Rahmen vor. Erstens rechnet das Frontend das Spiel, nicht
das Backend ([Critical Rule 8](../../AGENTS.md)): Die Schnittstelle speichert
und liefert, sie wertet nichts aus. Zweitens soll ab Meilenstein 6 auch bei
totem Netz weitergespielt werden — was heißt, dass ein Stand als Ganzes
gepuffert und später am Stück nachgereicht wird.

## Optionen

1. **Alles in einen JSON-Block.** Fortschritt, angefangener Lauf,
   Einstellungen, Erfolge und Statistiken in `game_state_json`. Ein Schreiben,
   ein Lesen — aber Erfolge und Statistiken wären dann nur noch als Ganzes zu
   haben, und ein doppelt eingereichter Puffer-Eintrag würde Summen still
   verfälschen.
2. **Alles in eigene Spalten und Tabellen.** Jeder Fortschrittseintrag als
   Zeile. Sauber abfragbar, aber das Backend müsste die Form des Spiels kennen
   — genau das, was Critical Rule 8 verbietet — und jede Regeländerung im
   Frontend zöge eine Migration nach sich.
3. **Gemischt.** Der frei geformte Teil in den JSON-Block, die zählenden und
   zeitgestempelten Teile in eigene Tabellen.

## Entscheidung

Option 3.

**In `game_state_json`** (Version 1): der Fortschritt der Welt, der eine
angefangene Lauf und die Einstellungen. Diese drei ändern sich mit den
Spielregeln, gehören immer zusammen und werden nie einzeln gebraucht.

```json
{ "version": 1, "progress": {}, "run": null, "settings": { "difficultyLevel": null } }
```

**In eigenen Tabellen:** Erfolge und Statistiken. Erfolge tragen einen
Zeitpunkt („seit wann"), Statistiken werden über Läufe hinweg *addiert* — beides
lässt sich in einem Block, der vollständig überschrieben wird, nicht sauber
führen.

**Episode und Position stehen in eigenen Spalten**, obwohl sie auch im Block
Platz hätten: Sie beantworten die Frage „wo war das Kind zuletzt" ohne den
Block zu öffnen. Beide dürfen leer sein — die Wahl der Lernstufe allein legt
schon einen Spielstand an (Migration 009).

## Konsequenzen

- **Das Backend kann einen Spielstand nicht auswerten** — es sieht Text. Das
  ist gewollt und der Preis dafür, dass Spielregeln nur an einer Stelle leben.
  Der einzige Blick hinein prüft das Feld `version`; ein unbekannter Wert wird
  mit `422` abgelehnt, statt still etwas zu speichern, das später niemand mehr
  deuten kann.
- **`PUT` ersetzt den Zustand vollständig.** Das Backend führt nichts zusammen.
  Wer zusammenführt, ist der Puffer im Frontend — und der kennt die Spielregeln.
- **Der Puffer gehört zu dieser Entscheidung.** Jede Änderung geht zuerst in
  den Browser-Speicher, dann zum Server; ein misslungener Versand bleibt als
  offener Eintrag stehen. Beim Laden gewinnt der Server — **außer** für Welten
  mit offenem Eintrag, denn dort steckt der bei totem Netz erspielte
  Fortschritt. Wer das umdreht, löscht ihn beim ersten Neuladen.
- **Ein Formatwechsel braucht keine Migration**, sondern eine neue Version im
  Block plus eine Umschreibung beim Laden im Frontend.
- **Kartenbesitz (Meilenstein 5) hat hier bewusst kein Feld.** Ob `state.cards`
  dazukommt oder eine eigene Tabelle, wird beim Bau der Sammelkarten
  entschieden.
