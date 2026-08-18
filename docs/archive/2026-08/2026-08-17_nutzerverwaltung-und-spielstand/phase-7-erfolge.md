# Phase 7 — Erfolge

Ein Erfolg ist zur Hälfte Inhalt („Erster Landgang", ein Bild, eine Bedingung)
und zur Hälfte Ergebnis (wer ihn wann bekam). Die erste Hälfte ist Content, die
zweite Spielstand — und die Auswertung dazwischen macht das Frontend, wie jede
andere Spielregel auch.

## Kontext (vorher lesen)

- [README.md](README.md) → „Kontrakt" (Erfolge)
- `AGENTS.md` → Critical Rules 2, 4 und 8
- `data/_authoring/JSON_SCHEMA_REFERENCE.md` → Abschnitt 2 (`world_config.json`)
  und Abschnitt 7 („Was NICHT ins Content gehört")
- `data/_authoring/ASSET_REQUIREMENTS.md` — Bildvorgaben, Ordnerstruktur
- `docs/design/HANDOFF.md` → „2. Planetenkarte" (Erfolge-Panel oben rechts) und
  „8. Ergebnis" (Erfolgs-Pille)
- `frontend/src/app/services/progress.rules.ts` — **das Vorbild**: reine
  Funktionen ohne Kenntnis der Datenquelle
- `frontend/src/app/features/result/` — wo die Pille erscheint
- `backend/src/Migrations/sql/005_create_achievements.sql` und `006_*.sql`

## Die Entscheidung dahinter

Die Tabelle `achievements` wollte den Katalog in der Datenbank halten. Damit
gäbe es eine zweite Wahrheitsquelle neben dem Content-Repository, und jede neue
Welt bräuchte einen Datenbank-Import, bevor ihre Erfolge existieren — genau das,
was [ADR-005](../../decisions/005-content-auslieferung-ab-meilenstein-2.md) für
Content bereits ausgeschlossen hat. Deshalb: Katalog ins `world_config.json`,
Tabelle weg, `player_achievements` verweist direkt auf den Schlüssel aus dem
Content.

**Verworfene Alternative:** Katalog beim Deploy in die Tabelle spiegeln. Hätte
serverseitige Auswertung ermöglicht (die niemand braucht) und kostet dafür einen
Importschritt, der irgendwann vergessen wird.

## Content-Format (neu in `world_config.json`)

```json
"achievements": [
  {
    "key": "erster_landgang",
    "title": "Erster Landgang",
    "description": "Du hast deinen ersten Ort geschafft.",
    "icon": "erster_landgang.png",
    "condition": { "type": "episodes_completed", "count": 1 }
  }
]
```

Bedingungstypen — **geschlossene Wertemenge**, dieselbe Disziplin wie bei den
Eventtypen (Critical Rule 2). Mehr wird in diesem Meilenstein nicht gebaut:

| `type` | Felder | Erfüllt, wenn |
|---|---|---|
| `episodes_completed` | `count` | so viele Episoden der Welt geschafft sind |
| `stars_total` | `count` | die Sterne der Welt zusammen den Wert erreichen |
| `episode_perfect` | `episode_id` | diese Episode mit 3 Sternen geschafft ist |
| `stage_completed` | `stage_id` | alle Episoden dieser Etappe geschafft sind |

Bilder liegen unter `data/themes/<theme_id>/achievements/<icon>`, 128 × 128 px,
PNG mit Transparenz.

## Abnahmekriterien

1. Wird eine Bedingung erfüllt, erscheint der Erfolg am Ende der Episode als
   Pille im Ergebnis-Screen: 54px Raute in `--color-accent-500`, Kicker „Neuer
   Erfolg", darunter der Titel.
2. Werden in einem Lauf mehrere Erfolge fällig, erscheinen alle untereinander —
   keiner verschwindet.
3. Ein bereits erreichter Erfolg erscheint beim nächsten Durchlauf **nicht**
   erneut als neu.
4. Das Erfolge-Panel oben rechts auf der Planetenkarte zeigt alle Erfolge der
   Welten: erreichte farbig, offene ausgegraut (`opacity .85`, Neutral-Farben),
   16px Rauten-Icons — Struktur nach Mockup.
5. Ein offener Erfolg verrät seinen Titel, aber die Bedingung steht als
   dezenter Hinweistext daneben — ein Kind soll wissen, was zu tun ist, nicht
   raten.
6. Das Backend kennt keine Erfolgsregel: in `backend/src/` steht nirgends ein
   Bedingungstyp aus der Tabelle oben.
7. Fällt der Server aus, während ein Erfolg fällig wird, erscheint er trotzdem
   und wird nachgereicht (Puffer aus Phase 5).

## Checkliste

- [x] `backend/src/Migrations/sql/010_player_achievements_content_keys.sql`:
      `player_achievements` neu aufbauen mit
      (`profile_id`, `theme_id`, `achievement_key`, `unlocked_at`),
      Primärschlüssel über die ersten drei, Fremdschlüssel auf `player_profiles`.
      Danach `DROP TABLE achievements`. Kommentarkopf mit Begründung wie in
      Migration 008.
- [x] `backend/src/Repositories/AchievementRepository.php`: `allForProfile`,
      `unlock` (mit `INSERT IGNORE`, damit ein doppelter Aufruf kein Fehler ist).
- [x] `backend/src/Controllers/AchievementController.php`, Routen registrieren.
- [x] `frontend/src/app/models/content.types.ts`: `Achievement` und
      `AchievementCondition` als unterscheidbare Vereinigung über `type`.
- [x] `frontend/src/app/services/achievement.rules.ts`: **reine Funktionen**,
      `evaluate(achievements, worldConfig, progress): string[]` gibt die
      Schlüssel aller erfüllten Erfolge zurück. Kein Dienst-Zugriff, kein
      Signal — Vorbild `progress.rules.ts`.
- [x] `frontend/src/app/services/achievement.service.ts`: erreichte Erfolge als
      Signal, `ensureLoaded(profileId)`, `unlock(themeId, key)`. Schreibt über
      denselben Puffer-Weg wie der Spielstand.
- [x] Auswertung am Ende einer Episode anstoßen, nachdem der Fortschritt
      geschrieben ist — die neu hinzugekommenen Schlüssel wandern an den
      Ergebnis-Screen.
- [x] `features/result/`: Erfolgs-Pille nach Mockup.
- [x] `features/main-hub/`: Erfolge-Panel oben rechts nach Mockup.
- [x] Testwelt `data/themes/dev_fixture/world_config.json` um zwei Erfolge
      erweitern (einer sofort erreichbar, einer nicht) plus die zwei Bilder
      unter `achievements/`.

## Doku-Updates

- [x] `docs/decisions/010-erfolge-im-content.md` anlegen (Kontext, Optionen,
      Entscheidung, Konsequenzen — Kurzfassung des Abschnitts oben).
- [x] `data/_authoring/JSON_SCHEMA_REFERENCE.md`: `achievements[]` in Abschnitt 2
      aufnehmen, Bedingungstypen als geschlossene Tabelle. In Abschnitt 7 die
      Zeile „Story-Merker, Inventar, Statistiken und Erfolge" präzisieren:
      **erreichte** Erfolge gehören in den Spielstand, ihre Beschreibung ist
      Content.
- [x] `data/_authoring/ASSET_REQUIREMENTS.md`: Ordner `achievements/` mit
      Bildmaß aufnehmen.
- [x] `data/_authoring/LLM_WORLD_BUILDER_PROMPT.md`: Erfolge in den Prompt
      aufnehmen — sonst erzeugt der nächste Weltbau-Lauf Welten ohne Erfolge
      (Pflegepflicht aus `data/_authoring/README.md`).
- [x] `docs/glossary.md`: Eintrag „Erfolg" mit der Trennung Definition/Erreichen.
- [x] `docs/code-map.md`: neue Dateien in den Ist-Stand, Content-Tabelle um den
      Ordner `achievements/`.

## Report-Back

**Umgesetzt wie geplant**, mit zwei benannten Abweichungen:

- Die Checkliste nannte die Methode `refresh(profileId)` — übernommen wurde
  stattdessen `ensureLoaded(profileId)`, derselbe Name wie in
  `SavegameService` (Phase 5/6). Gleiche Aufgabe (einmal je Sitzung laden,
  danach zwischengespeichert), nur konsistent zum bereits etablierten Namen.
- Das Erfolge-Panel auf der Planetenkarte lädt `world_config.json` für **alle**
  installierten Welten, nicht nur für gestartete (anders als `startedWorlds`,
  das für die Status-Pille bewusst nur gestartete Welten lädt). AK 4 verlangt
  „alle Erfolge der Welten" — ein noch nicht gestartetes Erfolgsziel muss
  also sichtbar sein. Bei wenigen installierten Welten ist das unkritisch;
  bei sehr vielen Welten lohnt sich ein Blick auf die Ladezeit.

Icons der Testwelt (`erster_ausflug.png`, `kapitaen_testriff.png`) sind
generierte Platzhalter-Rauten (Node-Skript, keine echte Bildgenerierung) —
für die Testwelt ausreichend, kein Vorbild für echten Content.

`ng build`/`ng lint` und `composer run lint` sind grün (Details im
Plan-README, AK 10).

**Wackligste Stelle:** `evaluateAchievements()` in `episode.ts` liest
`progressService.store()` direkt nach `progressService.completeEpisode(...)` —
das funktioniert nur, weil beide auf demselben synchronen Signal-Update
(`SavegameService.save()`) hängen. Ein Mock-freier End-to-End-Test gegen den
Server fehlt (lokal keine DB-Verbindung, siehe STATE.md) — ungeprüft bleibt,
ob eine neu freigeschaltete Pille bei totem Server tatsächlich nach dem
Neustart nachgereicht wird (Smoke-Punkt 7 im Plan-README).
