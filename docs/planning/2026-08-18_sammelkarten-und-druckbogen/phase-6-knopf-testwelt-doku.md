# Phase 6 — Karten-Knopf, Kartenausbau, Doku

Der Weg in die Halle aus jedem Screen, genug Karten in `pokemon_lesen`, um
alles zu sehen, und die Doku auf Stand.

## Kontext (vorher lesen)

- `docs/design/HANDOFF.md` Abschnitt „0. HUD" → Absatz „Karten-Button (neu)"
- `frontend/src/app/ui/hud/hud.ts|html|scss` — dort steht schon der Kommentar,
  wo der Knopf einhängt
- `data/themes/pokemon_lesen/cards.json`, `data/themes/pokemon_lesen/episodes/`
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` Abschnitt 3,
  `data/_authoring/ASSET_REQUIREMENTS.md` Abschnitt 5,
  `data/_authoring/image-prompts/CARDS.md`

## Abnahmekriterien

1. Der Karten-Knopf steht in der Kopfleiste, sobald eine Welt aktiv ist, und
   zeigt zweizeilig „Karten" über dem Zähler „besessen / gesamt".
2. Er holt sich Welt, Besitz und Gesamtzahl **selbst** (wie Modus- und
   Ton-Knopf), er bekommt keine neuen Eingaben von fünf Screens.
3. Auf der Halle ist er hervorgehoben (`--color-accent-300` / `-900` / Rahmen
   `-500`), sonst neutral.
4. Ohne aktive Welt (Planetenkarte, Profilauswahl) erscheint er nicht — kein
   Knopf, der ins Leere führt.
5. „Zurück" aus der Halle führt auf die Planetenkarte, aus dem Bogen in die Halle.
6. `pokemon_lesen` hat mindestens **11 Karten in drei `set`-Gruppen**,
   mit gemischten Seltenheiten und `hint`-Texten — genug für zwei Druckblätter,
   drei Gruppen und einen sichtbaren Unterschied zwischen den Filtern.
   Mindestens zwei davon werden über `reward`-Events der Episoden vergeben.
   *(19.08.2026: die frühere Testwelt `dev_fixture` ist entfernt — dieser Plan
   testet jetzt am echten Content. `pokemon_lesen` hatte beim Entfernen 6
   Karten in zwei Gruppen, die AK oben verlangt einen Ausbau.)*
7. Fehlende Kartenbilder brechen nichts: die Halle zeigt die Bildfläche mit
   Platzhalter, der Bogen eine leere weiße Zelle mit Schnittmarken.

## Checkliste

### Kopfleiste

- [ ] `ui/hud/`: Karten-Knopf nach Design, Zähler aus `CardService` +
      `WorldConfig.cards`, aktive Welt aus `GameStateService`. Den
      Platzhalter-Kommentar am Ende von `hud.html` entfernen.
- [ ] Erklärung am Knopf (`title`/`aria-label`): „Deine Sammelkarten dieser Welt".

### Kartenausbau `pokemon_lesen`

- [ ] `data/themes/pokemon_lesen/cards.json` auf ≥ 11 Karten in drei
      `set`-Gruppen erweitern (alle drei Seltenheiten, je ein `hint`) — 5
      neue Karten zu den bestehenden 6, dritte Set-Gruppe neu.
- [ ] Fehlende Kartenbilder dazu bestellen (`data/_authoring/image-prompts/CARDS.md`,
      630 × 880 px) — die 6 bestehenden Kartenbilder liegen schon vor.
- [ ] In den drei Episoden ein zweites `reward`-Event mit einer weiteren
      `card_id` ergänzen, damit „zwei Karten besessen" spielbar entsteht.

### Doku

- [ ] `AGENTS.md`: Ist-Stand-Sätze, wo Meilenstein 5 als offen beschrieben ist.
- [ ] `docs/PROJECT.md`: Meilenstein 5 als abgeschlossen markieren (Datum),
      offene Fragen prüfen.
- [ ] `docs/code-map.md`: Ist-Stand-Absatz vollständig nachziehen
      (Karten-Feature, Karten-Knopf).
- [ ] `docs/design/README.md`: Abweichung 4 und die Screens `cards`/`print` als
      gebaut abhaken. *(Abweichung 1 und 10 sowie die Zeile zur
      Druckbogen-Geometrie sind am 18.08.2026 beim Planen schon berichtigt.)*
- [ ] `data/_authoring/JSON_SCHEMA_REFERENCE.md`: Abschnitt 3 auf Stand halten
      (Pflegepflicht aus `data/_authoring/README.md`) — insbesondere den
      Hinweis, dass die Karten über den Welt-Aufruf ausgeliefert werden.
- [ ] `docs/glossary.md`: Begriffe „Sammelkarte", „Trophäenhalle",
      „Druckbogen", „Seltenheit" aufnehmen, falls noch nicht drin.
- [ ] `STATE.md`: auf „(kein aktiver Plan)" bzw. den nächsten Plan zeigen.

## Report-Back
