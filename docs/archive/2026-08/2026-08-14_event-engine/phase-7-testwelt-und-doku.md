# Phase 7 — Testwelt, Authoring-Toolkit, Doku

**Rating:** mechanisch

Aufräumen, wenn alle fünf Eventtypen wirklich existieren: die Testwelt spielt
jeden davon durch, das Authoring-Toolkit beschreibt den gebauten Stand, und die
Doku sagt nichts mehr, was gestern galt.

## Kontext — vorher lesen

- [data/_authoring/README.md](../../../data/_authoring/README.md) → „Pflegepflicht"
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 5.0 (Typ-Tabelle) und 9 (Checkliste vor dem Commit)
- `data/themes/dev_fixture/` — die Testwelt: `world_config.json`
  (Lernstufen `einfach` / `schwer`), fünf Episoden, ein ausgelagertes Event
- [docs/PROJECT.md](../../PROJECT.md) → „Offene Fragen"
- [docs/design/README.md](../../design/README.md) → Screen-Tabelle und
  „Bewusste Abweichungen vom Prototyp"

## Akzeptanzkriterien

1. **Die Testwelt spielt jeden der fünf Eventtypen durch.** Mindestens eine
   Episode enthält alle fünf in einer sinnvollen Reihenfolge (Dialog →
   Aufgaben → Belohnung); jedes ausgelagerte Event hat eine Variante für
   **beide** Lernstufen (`einfach`, `schwer`).
2. `data/themes/dev_fixture/cards.json` existiert mit mindestens einer Karte,
   auf die das `reward`-Event zeigt — die Referenz ist echt, auch wenn die
   Kartenvergabe erst Meilenstein 5 baut.
3. **Die Typ-Tabelle in `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0 stimmt
   wieder**: alle fünf Typen stehen dort, und zu jedem existiert die
   Komponente. 🟡 Vor diesem Meilenstein stand keine einzige der fünf
   Komponenten — die Tabelle war der Regel voraus, die über ihr steht. Nach
   dieser Phase gilt sie wieder.
4. Das Toolkit sagt Autoren, was die Engine mit ihren Aufgaben macht: falsche
   Antworten dürfen wiederholt werden, für die Sterne zählt der erste Versuch.
   Ein Satz in Abschnitt 5, keine Abhandlung.
5. `LLM_WORLD_BUILDER_PROMPT.md` und `ASSET_REQUIREMENTS.md` passen zum
   gebauten Stand (Eventtypen, `answers/`-Bilder, Sprites, Sprachaufnahmen
   unter `audio/voices/`).
6. `docs/code-map.md`, `docs/glossary.md`, `AGENTS.md`, `docs/design/README.md`
   und `docs/PROJECT.md` beschreiben den Ist-Zustand — kein Satz mehr über
   einen Ort-Platzhalter, pauschale Sterne oder eine noch nicht verifizierte
   Schema-Fassung.

## Checkliste

### Testwelt

- [x] `data/themes/dev_fixture/episodes/test_leuchtturm.json` (oder eine
      passendere Episode) auf die volle Kette erweitern: `dialog` →
      `multiple_choice` → `text_input` → `image_search` → `reward`.
- [x] Ausgelagerte Dateien unter `data/themes/dev_fixture/events/` ergänzen:
      je eine für `text_input` und `image_search`, jeweils mit den Varianten
      `einfach` und `schwer`.
- [x] `data/themes/dev_fixture/cards.json` anlegen (Kartenformat + eine Karte),
      `card_id` im `reward`-Event darauf zeigen lassen.
- [x] Fehlende Bilddateien sind in Ordnung — die Platzhalterflächen sind Teil
      der Prüfung. Keine Attrappen-Dateien anlegen.
- [x] Prüfen, dass die übrigen Episoden weiterhin laden (sie tragen nur
      `dialog` und `multiple_choice`).

### Authoring-Toolkit

- [x] `JSON_SCHEMA_REFERENCE.md` Abschnitt 5.0: Tabelle gegen
      `EVENT_COMPONENTS` und die Ordner unter `features/events/` abgleichen —
      Zeile für Zeile, nicht aus dem Gedächtnis.
- [x] Abschnitt 5: Satz zur Bewertung ergänzen (Weiterraten erlaubt, erster
      Versuch zählt) und der Hinweis, dass die Engine `ref` + Lernstufe
      auflöst.
- [x] Abschnitt 9 (Checkliste vor dem Commit) um den Punkt ergänzen: jede
      ausgelagerte Datei hat eine Variante für **jede** Lernstufe der Welt.
- [x] `LLM_WORLD_BUILDER_PROMPT.md` und `ASSET_REQUIREMENTS.md` durchgehen und
      auf den gebauten Stand ziehen.

### Doku

- [x] `docs/code-map.md`: Ist-Stand-Absätze für Frontend und Backend neu
      schreiben, Routen-Tabelle prüfen.
- [x] `docs/glossary.md`: **Event Engine**, **Event Loader**, **Eventtyp**,
      **Sterne**, **Vorlesemodus**, **Fortschritt** gegen das Gebaute prüfen.
- [x] `AGENTS.md`: Content-Repository-Abschnitt (neuer Aufruf), Doc-Index
      (ADR-007), Critical Rules gegenlesen.
- [x] `docs/design/README.md`: Screen-Tabelle auf die echten Features ziehen
      (`dialog` und `minigame` sind jetzt Eventtypen, nicht Screens),
      Abweichung 0 („Der Prototyp kennt noch keine Eventliste") auf erledigt
      ziehen und die neuen bewussten Abweichungen aufnehmen: „Weiter" statt
      „Minispiel starten", Weiterraten statt Sperre, keine dritte
      Statistik-Karte, kein Mockup für `text_input`/`image_search`.
- [x] `docs/PROJECT.md` → „Offene Fragen": Der 🟡-Punkt „Schema nicht gegen
      eine laufende Engine verifiziert" ist erledigt. Der 🟡-Punkt zur
      Sprachausgabe wird mit dem Ergebnis aus Smoke-Punkt 2 beantwortet —
      Antwort eintragen, nicht den Punkt löschen.

## Report-Back

**Testwelt:** `test_leuchtturm` spielt jetzt alle fünf Eventtypen in der
Reihenfolge Dialog → Quiz → Texteingabe → Bildsuche → Belohnung. Zwei neue
ausgelagerte Dateien (`probe_text_input`, `probe_bildsuche`), je mit
`einfach`/`schwer`. Neue `cards.json` mit einer Karte
(`leuchtturm_karte`), auf die das `reward`-Event zeigt. Die vier übrigen
Episoden bleiben unverändert (nur `dialog` + `multiple_choice`) und laden
weiterhin unter demselben Loader wie zuvor — kein Grund zur Sorge, da der
Event Loader typunabhängig lädt.

**Authoring-Toolkit:** Die Typ-Tabelle in Abschnitt 5.0 stimmte bereits mit
`EVENT_COMPONENTS` überein (aus Phase 4/5 schon nachgezogen) — nur der
🟡-Verifikationshinweis am Dateikopf war stale und wurde entfernt/präzisiert.
Neu: ein Satz zur Bewertungslogik in Abschnitt 5, ein Checklistenpunkt in
Abschnitt 9. `LLM_WORLD_BUILDER_PROMPT.md` und `ASSET_REQUIREMENTS.md` waren
bereits generisch genug (kein Typ-Deckel, `answers/`/`audio/voices/` schon
drin) — keine Änderung nötig.

**Doku:** `code-map.md`, `glossary.md`, `AGENTS.md` waren bereits auf dem
gebauten Stand (offenbar in Phase 5/6 mitgezogen) — nur gegengelesen, keine
Änderung nötig. `docs/design/README.md` bekam Abweichung 0 als erledigt
markiert plus vier neue Abweichungen (5–8). `docs/PROJECT.md` → Offene Fragen:
Schema-Verifikations-Punkt auf erledigt, Sprachausgabe-Punkt bleibt offen
(Antwort kommt mit der Smoke-Prüfung am Plan-Ende).

**Build/Lint:** `npm run build`, `npm run lint` (Frontend) und
`composer lint` (Backend) laufen grün — AK1 erfüllt.

**Unsicherste Stelle:** keine im Code — die Doku-Änderungen sind Text, das
Content-JSON ist strukturell gegen das Schema geprüft (Loader lädt es beim
Smoke-Test). Objektiv am wenigsten selbst geprüft: die neuen
`image_search`-Koordinaten (`x`/`y`/`radius`) für `probe_bildsuche` — sie
sind plausibel gewählt, aber nicht am echten `platzhalter.webp` nachjustiert.
Fällt im Smoke-Punkt 5 auf, falls die Trefferzone daneben liegt.
