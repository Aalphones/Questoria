# Phase 3 — Einbau in die Pokémon-Welt

**Rating:** mechanisch (JSON und Doku auf einer fertigen Mechanik)

## Kontext — was der Bearbeiter lesen muss

- [phase-2-wurfmechanik.md](phase-2-wurfmechanik.md) — muss fertig und am
  Bildschirm gesehen sein
- [README.md](README.md) — der Kontrakt der Konfiguration
- `data/themes/pokemon_lesen/episodes/ep_route_1_wiese.json` — die Episode, die
  den Wurf bekommt
- `data/themes/pokemon_lesen/sprites/` — verfügbare Ziele
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 8 (vollständiges
  Episoden-Beispiel)

## Wohin das Spiel kommt

**`ep_route_1_wiese` als letztes Event.** Diese Episode ist die einzige der drei
ohne Belohnungsmoment am Ende — sie hört nach der letzten Wortpaar-Aufgabe
einfach auf. Der Wurf schließt sie ab, ohne einer anderen Episode ihren
Kartenmoment wegzunehmen.

Ziele: Pikachu und Rattfratz. Bisasam bleibt draußen — es ist der Begleiter,
kein Fang. Professor Eich ist ein Mensch.

Erst nach einer echten Runde am Bildschirm wird entschieden, ob die anderen
beiden Episoden ebenfalls einen bekommen. Ein Spiel, das dreimal in Folge
auftaucht, ist keine Belohnung mehr, sondern eine Station.

## Abnahmekriterien

1. `ep_route_1_wiese` endet mit dem Wurf, und die Episode lässt sich vollständig
   durchspielen.
2. Die Sternenzahl der Episode ist dieselbe wie vorher — nachprüfbar, indem
   dieselbe Episode vor und nach dem Einbau mit denselben Antworten gespielt
   wird.
3. Der Ansagetext ist in beiden Lesemodi verständlich (kurze Fassung im
   Vorlesemodus).
4. Der Wurf funktioniert auf dem Gerät des Kindes, nicht nur im
   Entwicklungsbrowser.
5. Nach `deploy.cmd content` läuft er auch auf dem Server.

## Checkliste

- [ ] `pokemon_catch`-Event ans Ende von `ep_route_1_wiese.json` setzen
- [ ] Ansagetext schreiben, kurze Fassung für den Vorlesemodus dazu
- [ ] Runde am Bildschirm: Treffer, Fehlwurf, garantierter Fang, Weiterlauf zur
      Ergebnisseite
- [ ] Runde auf dem Gerät des Kindes
- [ ] `deploy.cmd content` und eine Runde auf dem Server
- [ ] Entscheiden und im Report-Back festhalten, ob die anderen beiden Episoden
      folgen
- [ ] [docs/knowledge/spielmechaniken-katalog.md](../../knowledge/spielmechaniken-katalog.md):
      Zeile „Pokémon fangen" auf ✅ gebaut setzen
- [ ] `STATE.md` fortschreiben

## Risiken

🟡 **Die Episode wird länger.** Sie hat bereits fünf Events; der Wurf ist der
sechste. Wenn die Runde am Bildschirm zeigt, dass die Aufmerksamkeit vorher
endet, gehört der Wurf an eine andere Stelle — das ist ein Befund für
FINDINGS.md, keine Niederlage.

## Report-Back
