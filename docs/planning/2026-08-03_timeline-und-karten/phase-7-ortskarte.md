# Phase 7 — Ortskarte + Ort-Platzhalter

**Rating:** standard

Die Karte einer Etappe mit ihren begehbaren Orten — und der Ort selbst als
ehrlicher Platzhalter, an dem Meilenstein 3 die Event Engine übernimmt.

## Kontext — vorher lesen

- [docs/design/HANDOFF.md](../../design/HANDOFF.md) Abschnitt „5. Ortskarte"
- Phase 3 → `qst-map-canvas`, `qst-map-point`, `qst-image-slot`
- Phase 4 → `nodeStates()`, `ProgressService.completeEpisode()`
- Phase 5 → Routen (`theme/:themeId/map/:mapId`,
  `theme/:themeId/location/:episodeId`), `qst-hud`, `qst-content-error`
- Phase 2 → `ContentService.getEpisode()`, `assetUrl()`, Episoden-Typen
- [data/_authoring/JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md)
  Abschnitt 2 (`maps`) und 4 (Episode)

## Akzeptanzkriterien — Ortskarte

1. Kartenfläche 16:9 mit dem Kartenbild aus `maps[].file`, aufgelöst über
   `assetUrl(themeId, 'maps', file)`. Fehlt die Datei, steht dort der
   beschriftete Platzhalter.
2. Jeder Ort sitzt als runder Punkt auf seiner Prozent-Position: aktuell größer
   und pulsierend, geschafft und verschlossen kleiner; Farben nach Zustand,
   weißer Ring nach Design. Punktgrößen haben eine Untergrenze für den Finger
   und wachsen darüber mit der Kartenbreite.
3. Unter jedem Punkt eine weiße Pille mit dem Ortsnamen.
4. Gestrichelte Routen aus `maps[].routes` zwischen den Punkten; Routen zu
   verschlossenen Orten neutral.
5. Kompassrose unten links (weißer Kreis, N/O/S/W, Nadel) — reine Deko, aus
   CSS-Formen, kein Bild.
6. Klick/Enter auf einen geschafften oder aktuellen Ort öffnet den Ort.
   Verschlossene Orte sind keine Knöpfe.
7. Kopfleiste: Zurück führt auf die Etappenkarte.

## Akzeptanzkriterien — Ort (Platzhalter)

8. Der Screen zeigt den Ortsnamen, den Hintergrund-Platzhalter der Episode und
   einen ehrlichen Satz, was hier später passiert („Hier erzählt dir die
   Geschichte gleich, was los ist — die Dialoge kommen im nächsten Schritt.").
9. Er belegt, dass die Episoden-Schnittstelle trägt: die Anzahl der
   bereitliegenden Events wird angezeigt (aus `events.length`).
10. Ein Knopf „Ort geschafft" schreibt den Fortschritt (3 Sterne) und führt
    zurück auf die Ortskarte, wo der Ort sofort geschafft aussieht und der
    nächste offen ist.
11. Lädt die Episode nicht, steht dort die Meldung aus `qst-content-error`,
    kein leerer Screen.

## Checkliste

### Ortskarte

- [x] ~~`ng generate component features/map --skip-tests`~~ — Ordner existierte
      bereits aus Phase 5 (schlanker Platzhalter), direkt hineingebaut statt
      neu generiert (siehe FINDINGS.md).
- [x] Eingaben aus der Route: `themeId`, `mapId`, `world`. Die Karte wird aus
      `world.maps` per `mapId` gesucht; nicht gefunden → `qst-content-error`.
- [x] Zustände als `computed()` über `nodeStates()` — die Etappe selbst kommt
      aus `stageStates()`, damit ein Tieflink in eine verschlossene Etappe
      nicht plötzlich alle Orte öffnet.
- [x] Punktgrößen: Untergrenze aus `--size-map-point` /
      `--size-map-point-current`. 🟡 **Abweichung:** ohne `max(…, 4cqw)` —
      `MapNode` trägt (anders als `ArcStage`) kein `size`-Feld im Schema, die
      Größe kommt rein aus den Tokens. Wächst also nicht mit der Kartenbreite
      mit, nur die Untergrenze selbst ist gesetzt. Kommentar im Stylesheet, warum
      die Größe existiert: Finger, nicht Optik.
- [x] Aktueller Punkt pulsiert (`eqPulse`, `--duration-pulse`).
- [x] Kompassrose als eigenes kleines Element im Stylesheet dieser Komponente;
      Größe als neues Token `--size-map-compass` in `_tokens.scss`.
- [x] `aria-hidden` auf der Kompassrose — sie trägt keine Information.

### Ort-Platzhalter

- [x] ~~`ng generate component features/location --skip-tests`~~ — Ordner
      existierte bereits aus Phase 5, direkt hineingebaut (siehe FINDINGS.md).
- [x] Eingaben aus der Route: `themeId`, `episodeId`, `world`. Episode über
      `ContentService.getEpisode()` laden, Ladezustände wie im Main-Hub
      (`LoadState`-Muster aus `models/game-state.types.ts`). 🟡 Pflicht-Inputs
      sind zur Feld-Initialisierung noch nicht gesetzt — der Aufruf läuft daher
      reaktiv über `toObservable()` + `switchMap`, nicht direkt im Initialisierer.
- [x] Hintergrund der Episode über `assetUrl(themeId, 'backgrounds', background)`
      in einem `qst-image-slot`.
- [x] „Ort geschafft" ruft `completeEpisode(themeId, episodeId, 3)` und
      navigiert auf `theme/:themeId/map/:activeMapId` (die Karte steht in der
      Episode).
- [x] Sichtbarer Hinweis, dass dies ein Zwischenstand ist — in Kindersprache,
      kein Meilenstein-Jargon, keine Ticket-Nummer.
- [x] Kopfleiste: Zurück führt auf die Ortskarte.

### Doku

- [x] `docs/code-map.md`: `features/map/` auf Ist ziehen, `features/location/`
      neu aufnehmen — mit dem Hinweis, dass die Event Engine (Meilenstein 3)
      diesen Screen übernimmt und die Eventliste der Episode abspielt.
- [x] `docs/glossary.md`: **Ortskarte**, **Ort** geprüft — beide Einträge waren
      bereits korrekt, keine Änderung nötig.

## Bewusste Abweichung vom Design

Der Prototyp streut Deko-Inseln (`islands[]`) über die Ortskarte. Das
Content-Schema kennt kein solches Feld, und ein Feld wird hier nicht erfunden —
die Optik trägt das Kartenbild. Vermerkt in [FINDINGS.md](FINDINGS.md), falls
sich später zeigt, dass die Karten ohne Deko zu leer wirken.

## Report-Back

Ortskarte (`features/map/`) und Ort-Platzhalter (`features/location/`) sind
gebaut, `features/map-demo/` samt Route entfernt. Build und Lint grün, kein
Browser-Durchlauf (private-Profil, User prüft am Plan-Ende).

Die Komponentenklasse der Ortskarte heißt `MapScreen`, nicht `Map` — der Name
`Map` hätte im ganzen File das globale `Map` (den Container-Typ, den die
Komponente selbst für die Zustands-Map braucht) verdeckt. `app.routes.ts`
importiert entsprechend `module.MapScreen`.

🟡 Zwei Abweichungen vom Checklisten-Wortlaut, beide oben an ihrer Stelle
vermerkt: kein mitwachsendes `4cqw` bei den Ortspunkten (Content-Schema kennt
keine `size` pro Node), und der Episode-Ladeaufruf in `location.ts` läuft
reaktiv statt im Feld-Initialisierer (Pflicht-Inputs sind dort noch leer).
