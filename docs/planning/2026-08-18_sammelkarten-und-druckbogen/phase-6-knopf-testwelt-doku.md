# Phase 6 — Karten-Knopf, Testwelt, Doku

Der Weg in die Halle aus jedem Screen, genug Testkarten, um alles zu sehen,
und die Doku auf Stand.

## Kontext (vorher lesen)

- `docs/design/HANDOFF.md` Abschnitt „0. HUD" → Absatz „Karten-Button (neu)"
- `frontend/src/app/ui/hud/hud.ts|html|scss` — dort steht schon der Kommentar,
  wo der Knopf einhängt
- `data/themes/dev_fixture/cards.json`, `data/themes/dev_fixture/episodes/`
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
6. Die Testwelt `dev_fixture` hat mindestens **11 Karten in drei `set`-Gruppen**,
   mit gemischten Seltenheiten und `hint`-Texten — genug für zwei Druckblätter,
   drei Gruppen und einen sichtbaren Unterschied zwischen den Filtern.
   Mindestens zwei davon werden über `reward`-Events der Testepisoden vergeben.
7. Fehlende Kartenbilder brechen nichts: die Halle zeigt die Bildfläche mit
   Platzhalter, der Bogen eine leere weiße Zelle mit Schnittmarken.

## Checkliste

### Kopfleiste

- [ ] `ui/hud/`: Karten-Knopf nach Design, Zähler aus `CardService` +
      `WorldConfig.cards`, aktive Welt aus `GameStateService`. Den
      Platzhalter-Kommentar am Ende von `hud.html` entfernen.
- [ ] Erklärung am Knopf (`title`/`aria-label`): „Deine Sammelkarten dieser Welt".

### Testwelt

- [ ] `data/themes/dev_fixture/cards.json` auf ≥ 11 Karten erweitern
      (drei `set`-Gruppen, alle drei Seltenheiten, je ein `hint`).
- [ ] In den Testepisoden ein zweites `reward`-Event mit einer weiteren
      `card_id` ergänzen, damit „zwei Karten besessen" spielbar entsteht.
- [ ] 🟡 **Sascha-Aufgabe (kein Code):** mindestens ein echtes Kartenbild
      `karte_<id>.png` in 630 × 880 px nach `data/themes/dev_fixture/cards/`
      legen — ohne ein echtes Bild lässt sich der Maßstab (Smoke-Punkt 1) nicht
      messen. Prompt-Vorlage: `data/_authoring/image-prompts/CARDS.md`.

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
