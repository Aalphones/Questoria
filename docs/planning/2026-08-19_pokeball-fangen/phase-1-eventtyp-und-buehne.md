# Phase 1 — Eventtyp und Bühne

**Rating:** standard (ein bekanntes Muster ein weiteres Mal; die Entscheidungen
sind in der README bereits gefallen)

## Kontext — was der Bearbeiter lesen muss

- [README.md](README.md), besonders „Entschieden vor dem Bauen" und der Kontrakt
- `frontend/src/app/features/episode/event-type-map.ts` — die vier Stellen, an
  denen ein Eventtyp registriert wird
- `frontend/src/app/features/events/reward/` — nächstes Vorbild: inline
  konfiguriert, meldet `kind: 'story'`, spricht seinen Text über die
  Gerätestimme
- `frontend/src/app/features/events/dialog/dialog.ts` — wie ein Sprite-Pfad
  relativ zu `sprites/` aufgelöst wird
- `frontend/src/app/ui/image-slot/` — der beschriftete Platzhalter für fehlende
  Bilder
- `frontend/src/app/models/content.types.ts` — `EVENT_TYPES`
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitte 5.0 und 5.2
- `data/_authoring/ASSET_REQUIREMENTS.md` — Ordnerstruktur pro Welt
- `data/_authoring/image-prompts/GENERATING.md` — Bilderzeugung und
  Freistellung; **für Gegenstände `--model u2net`**, nicht `isnet-anime`

## Abnahmekriterien

1. `pokemon_catch` steht in `EVENT_TYPES`, in `EVENT_COMPONENTS`, in
   `EVENT_CONFIG_GUARDS` und in der Typ-Tabelle der Schema-Referenz — **nicht**
   in `SCORED_EVENT_TYPES`.
2. Die Komponente `features/events/pokemon-catch/` zeigt Bühne, ein gezogenes
   Ziel-Sprite, den Ball und den Ansagetext und lässt sich über einen Knopf
   abschließen (`kind: 'story'`). Ohne Wurfmechanik — die kommt in Phase 2.
3. Die Prüffunktion lehnt eine Konfiguration ohne mindestens ein Ziel ab, sodass
   kaputter Content im Fehlerpfad des Gerüsts landet und nicht als leere Bühne.
4. Fehlt die Ball-Datei, steht dort der beschriftete Platzhalter statt eines
   Lochs.
5. Beide Ballbilder existieren: `props/pokeball.png` (Taste dunkel) und
   `props/pokeball_blink.png` (Taste rot leuchtend), je 512×512, echte
   Transparenz, im Bildstil der Welt (`art_style` aus `world_config.json`
   wörtlich im Prompt).
6. Die beiden Bilder sind **deckungsgleich**: übereinandergelegt bewegt sich
   nichts außer der Taste. Geprüft, indem beide im selben Rahmen überblendet
   angesehen werden — nicht durch Vergleich der Dateimaße.

## Checkliste

- [ ] `features/events/pokemon-catch/` anlegen: `pokemon-catch.ts`, `.html`,
      `.scss`, `.types.ts` mit `isPokemonCatchConfig`
- [ ] `PokemonCatchConfig` in `models/content.types.ts` (Felder aus dem Kontrakt
      der README), `pokemon_catch` in `EVENT_TYPES`
- [ ] Registrierung in `event-type-map.ts` (Komponente + Prüffunktion; **nicht**
      in `SCORED_EVENT_TYPES`)
- [ ] Ziel-Auswahl über die vorhandene Mischung
      (`features/events/shuffled-indexes.ts`) — kein eigener Zufallsgenerator
- [ ] Bühne bauen: Ziel-Sprite mittig, Ball unten, Ansagetext oben; im
      Vorlesemodus wird der Ansagetext gesprochen (Muster aus `reward.ts`)
- [ ] Neue Asset-Kategorie `props/` in `ASSET_REQUIREMENTS.md` dokumentieren:
      512×512 PNG mit Alpha, für Spielgegenstände (Ball, später Netz, Lasso)
- [ ] `data/_authoring/image-tools/format_assets.py`: Zielmaß für `props/`
      ergänzen (freigestellt einpassen, nicht beschneiden)
- [ ] Pokéball mit dunkler Taste erzeugen (Skill `krea2-bilder`), freistellen
      mit `--model u2net`, formatieren, am Kontaktbogen ansehen
- [ ] Zweite Fassung mit leuchtender Taste erzeugen — **Skill `flux2-bilder`
      mit dem ersten Bild als Ankerbild**, Auftrag: nur die Taste leuchtet rot,
      sonst identisch. Nicht frei neu erzeugen, sonst sind es zwei
      verschiedene Bälle
- [ ] Beide Fassungen überblendet ansehen (AK 6) — sitzt der Ball nicht exakt
      deckungsgleich, zweite Fassung neu ziehen statt nachbessern
- [ ] Schema-Referenz: Abschnitt 5.7 `pokemon_catch` mit Beispiel, Typ-Tabelle
      ergänzen
- [ ] `docs/code-map.md`: Zeile unter Event-Komponenten
- [ ] `data/_authoring/README.md`: Pflegepflicht-Runde
- [ ] **ADR-015** schreiben: eigener Eventtyp statt `franchise_game` mit
      `game_id` — Kontext, verworfene Option, Konsequenz für weitere
      Franchise-Spiele

## Risiken

🟡 **Die Nummer ADR-015 ist die nächste freie** (001–010 und 014 liegen auf der
Platte, 011–013 sind vom Sammelkarten-Plan reserviert). Vor dem Anlegen noch
einmal gegen `docs/decisions/` und die geparkten Pläne prüfen — wird der
Sammelkarten-Plan vorher umgesetzt, ändert sich nichts, aber ein dritter Plan
könnte dazwischenkommen.

🟡 **`props/` ist eine neue Kategorie im Content-Ordner.** Der Auslieferungsweg
braucht dafür nichts (`assetUrl` nimmt den Ordnernamen frei entgegen,
`deploy.cmd content` spiegelt `data/` komplett) — aber die Werkzeuge zum
Formatieren leiten das Zielmaß aus dem Pfad ab und kennen den Ordner noch nicht.

## Report-Back
