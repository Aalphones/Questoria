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

- [x] `features/events/pokemon-catch/` anlegen: `pokemon-catch.ts`, `.html`,
      `.scss`, `.types.ts` mit `isPokemonCatchConfig`
- [x] `PokemonCatchConfig` in `models/content.types.ts` (Felder aus dem Kontrakt
      der README), `pokemon_catch` in `EVENT_TYPES`
- [x] Registrierung in `event-type-map.ts` (Komponente + Prüffunktion; **nicht**
      in `SCORED_EVENT_TYPES`)
- [x] Ziel-Auswahl über die vorhandene Mischung — `features/events/shuffled-indexes.ts`
      existiert nicht mehr, die Mischung lebt inzwischen in
      `services/variation.ts` (`seededRandom` + `shuffle`, Startwert aus
      `run.eventSeed()`), genau das Muster, das auch `multiple-choice.ts`
      nutzt. Kein eigener Zufallsgenerator.
- [x] Bühne bauen: Ziel-Sprite mittig, Ball unten, Ansagetext oben; im
      Vorlesemodus wird der Ansagetext gesprochen (Muster aus `reward.ts`)
- [x] Neue Asset-Kategorie `props/` in `ASSET_REQUIREMENTS.md` dokumentieren:
      512×512 PNG mit Alpha, für Spielgegenstände (Ball, später Netz, Lasso)
- [x] `data/_authoring/image-tools/format_assets.py`: Zielmaß für `props/`
      ergänzen (freigestellt einpassen, nicht beschneiden)
- [x] Pokéball mit dunkler Taste erzeugen (Skill `krea2-bilder`), freistellen
      mit `--model u2net`, formatieren, am Kontaktbogen ansehen
- [x] Zweite Fassung mit leuchtender Taste erzeugen — **Skill `flux2-bilder`
      mit dem ersten Bild als Ankerbild**, Auftrag: nur die Taste leuchtet rot,
      sonst identisch. Nicht frei neu erzeugen, sonst sind es zwei
      verschiedene Bälle
- [x] Beide Fassungen überblendet ansehen (AK 6) — sitzt der Ball nicht exakt
      deckungsgleich, zweite Fassung neu ziehen statt nachbessern
- [x] Schema-Referenz: Abschnitt **5.9** `pokemon_catch` mit Beispiel (5.7 war
      inzwischen an `sorting` vergeben, 5.8 an `number_line`), Typ-Tabelle
      ergänzt
- [x] `docs/code-map.md`: Zeile unter Event-Komponenten
- [x] `data/_authoring/README.md`: Pflegepflicht-Runde — Schema (1) und
      Asset-Vorgaben (3) geändert; `LLM_WORLD_BUILDER_PROMPT.md` (2),
      `voice-tools/` (5) und `docs/design/README.md` (6) bewusst
      unverändert, siehe Deviations
- [x] **ADR-015** schreiben: eigener Eventtyp statt `franchise_game` mit
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

**Erledigt (21.08.2026):** Eventtyp `pokemon_catch` registriert (Typen-Union,
`EVENT_COMPONENTS`, `EVENT_CONFIG_GUARDS`, **nicht** in `SCORED_EVENT_TYPES`).
Komponente `features/events/pokemon-catch/` zeigt Ansagetext, gezogenes
Ziel-Sprite und ruhenden Ball, schließt über einen „Weiter"-Knopf mit
`kind: 'story'` ab — die Wurfmechanik selbst ist Phase 2. Beide Ballbilder
erzeugt (Krea 2 + `u2net`-Freistellung für die dunkle Fassung, FLUX.2 mit der
dunklen Fassung als Anker für die leuchtende), überblendet geprüft: identischer
Umriss, nur die Taste unterscheidet sich.

**Fundstelle für die nächste Session, die hier generiert:** Die in den
Skills `krea2-bilder`/`flux2-bilder` dokumentierten Eingabe-/Installationspfade
(`F:\Comfy-Desktop\...`) stimmen auf dieser Maschine nicht mehr — die
tatsächlich laufende Instanz ist die portable Installation unter
`B:\ComfyUI_windows_portable\ComfyUI\`. Referenzbilder für FLUX.2 gehören
dort in `input\`, sonst meldet der Server `not in N known options`, obwohl
die Datei sichtbar irgendwo liegt. Skills sind dazu noch nicht korrigiert
(außerhalb dieser Phase, keine Content-Frage).

## Deviations from plan

- **`shuffled-indexes.ts` existiert nicht** — die vom Plan referenzierte Datei
  ist offenbar im Zuge des Variationssystems (Meilenstein „Curriculum und
  Variation") zu `services/variation.ts` geworden. Verwendet wurde exakt das
  dort lebende Muster (`seededRandom` + `shuffle`, Startwert aus
  `run.eventSeed()`) — kein eigener Zufallsgenerator, nur der aktuelle Name.
- **Schema-Abschnitt 5.9 statt 5.7** — 5.7 und 5.8 sind seit dem
  Curriculum-Plan an `sorting` und `number_line` vergeben. `pokemon_catch`
  hängt als 5.9 dahinter, inhaltlich unverändert zum Plan.
- **`LLM_WORLD_BUILDER_PROMPT.md` bewusst nicht geändert:** Das Dokument
  generiert den Standard-Episodenablauf (Dialog → Aufgabe → Dialog → Reward)
  für automatisch erzeugte Welten. `pokemon_catch` ist kein Bestandteil dieser
  Erzeugungsschleife — README Punkt 6 legt fest, dass er inline und ohne
  Lernstufen-Varianten von Hand platziert wird, nicht vom Generator erzeugt.
  Die Typ-Tabelle (die der Builder-Prompt ohnehin komplett einliest) trägt den
  Typ bereits, ein zusätzlicher Struktursatz hätte nichts zu tun.
- **`voice-tools/` und `docs/design/README.md` bewusst nicht angefasst:**
  Kein Audio an diesem Eventtyp (README Punkt 6, `intro` ohne Sprachaufnahme)
  und kein Bezug zum dort beschriebenen Zielbild.
- **Bildmaschinen-Pfade:** Zwei Skill-Dokumente (`krea2-bilder`,
  `flux2-bilder`) nennen für Referenzbilder einen Eingabeordner unter
  `F:\Comfy-Desktop\...`, der auf dieser Maschine nicht mehr der tatsächlich
  laufenden ComfyUI-Instanz entspricht (`B:\ComfyUI_windows_portable\...`).
  Umgangen, nicht behoben — außerhalb des Auftrags dieser Phase.
