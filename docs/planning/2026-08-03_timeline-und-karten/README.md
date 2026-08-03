# Plan: Timeline & Karten (Meilenstein 2)

Deckt Meilenstein 2 aus [docs/PROJECT.md](../../PROJECT.md) ab: Router-Struktur
Timeline/Map/Location, Etappen- und Ortskarte mit Prozent-Koordinaten,
Fortschrittsanzeige, Content-Schnittstelle im Backend, die das JSON-Repository
liest.

Am Ende ist die Welt begehbar: Planetenkarte → Lernstufe → Etappenkarte →
Ortskarte → Ort. Der Ort selbst ist ein Platzhalter — Dialog und Minispiel
kommen mit Meilenstein 3 und 4.

## Overview

| Phase | Thema | Rating | Status |
|---|---|---|---|
| 1 | [Content-Schnittstelle im Backend](phase-1-content-api.md) | heikel | pending |
| 2 | [Testwelt im Repo + Frontend liest über die Schnittstelle](phase-2-testwelt-und-anbindung.md) | standard | pending |
| 3 | [Kartenfläche: Knoten, Routen, Bildplatzhalter](phase-3-kartenflaeche.md) | heikel | pending |
| 4 | [Fortschritts-Speicher + Freischaltregeln](phase-4-fortschritt.md) | standard | pending |
| 5 | [Router-Struktur + Kopfleiste](phase-5-routing-und-kopfleiste.md) | standard | pending |
| 6 | [Etappenkarte](phase-6-etappenkarte.md) | standard | pending |
| 7 | [Ortskarte + Ort-Platzhalter](phase-7-ortskarte.md) | standard | pending |
| 8 | [Planetenkarte: Main-Hub auf das Design ziehen](phase-8-planetenkarte.md) | standard | pending |

Reihenfolge ist bindend: 3 liefert das Bauteil für 6, 7 und 8; 4 liefert die
Zustände, die 6, 7 und 8 anzeigen; 5 liefert die Routen, in die 6–8 hängen.

## Entschieden vor dem Bauen

Drei Weichen wurden am 03.08.2026 gestellt (Sascha):

1. **Fortschritt liegt lokal im Browser.** Login und Savegame-API kommen erst
   mit Meilenstein 4. Der Fortschritts-Dienst wird so geschnitten, dass dort nur
   die Datenquelle getauscht wird, nicht die Screens (→ ADR-005, Phase 4).
2. **Der Main-Hub wird mitgezogen** (Phase 8) — er nutzt dieselbe Kartenfläche
   wie Etappen- und Ortskarte, statt als Kachelliste aus Meilenstein 1 stehen
   zu bleiben.
3. **Es gibt einen lokalen PHP-Server zum Entwickeln** (Phase 1), damit
   Content- und Koordinatenänderungen sofort im Browser sichtbar sind und nicht
   erst nach einem Hochladen.

## Kontrakt (Backend ↔ Frontend, gilt ab Phase 1)

### Content-Schnittstelle (JSON)

| Aufruf | Antwort |
|---|---|
| `GET /api/content/themes` | Inhalt von `data/main_hub.json` |
| `GET /api/content/themes/{themeId}` | Inhalt von `data/themes/{themeId}/world_config.json` |
| `GET /api/content/themes/{themeId}/episodes/{episodeId}` | Inhalt von `data/themes/{themeId}/episodes/{episodeId}.json` |

- Erfolg: `200` mit dem JSON-Inhalt **unverändert** — die Schnittstelle formt
  nichts um, sie liefert aus. Verbindlich bleibt
  [JSON_SCHEMA_REFERENCE.md](../../../data/_authoring/JSON_SCHEMA_REFERENCE.md).
- Unbekannte Welt/Episode oder eine ID, die nicht auf `^[a-z0-9_]{1,64}$`
  passt: `404` mit `{"error":"Not Found"}` (bestehendes `JsonResponse::error`).
- Kein Schreibzugriff. Content ist über die Schnittstelle read-only
  (`AGENTS.md`, Critical Rule 1).

### Bilder und Töne (statisch, ohne PHP)

`GET /content/themes/{themeId}/{ordner}/{datei}` — vom Webserver direkt
ausgeliefert, nicht durch die Schnittstelle geschleust. Der Hintergrund der
Planetenkarte liegt unter `/content/hub/{datei}`.

Dateien, die direkt im Welt-Ordner liegen (das Cover), erreicht man ohne
Unterordner: `GET /content/themes/{themeId}/{datei}`.

Das Frontend baut diese Adressen ausschließlich über `ContentService` zusammen
(`assetUrl` · `themeAssetUrl` · `hubAssetUrl`) — nirgends von Hand.

### Zwei Schema-Änderungen an `main_hub.json`

Beide werden in Phase 2 im Authoring-Toolkit nachgezogen:

- **`config_path` entfällt.** Es existierte, damit das Frontend die Datei direkt
  laden konnte; die Schnittstelle adressiert jetzt über die Welt-ID.
- **`cover` ist ein Dateiname**, kein Pfad (`cover.webp`) — wie jedes andere
  Asset-Feld im Schema, aufgelöst über `assetUrl()`.

### Fortschritts-Schnittstelle (Phase 4)

```ts
type ProgressState = 'done' | 'current' | 'locked';

interface EpisodeProgress {
  readonly stars: number;        // 0–3
  readonly completedAt: string;  // ISO-Zeitstempel
}
```

`ProgressService` (Signal-basiert, Ablage im Browser-Speicher):
`isEpisodeCompleted(themeId, episodeId)` · `starsFor(themeId, episodeId)` ·
`completeEpisode(themeId, episodeId, stars)` · `resetTheme(themeId)`.

Die Freischaltregeln sind reine Funktionen in `services/progress.rules.ts` —
sie bekommen Welt-Konfiguration + Fortschritt und geben Zustände zurück. Kein
Screen rechnet selbst.

### Routen (Phase 5)

| Pfad | Screen |
|---|---|
| `` (leer) | Planetenkarte |
| `theme/:themeId/level` | Lernstufen-Auswahl |
| `theme/:themeId/timeline` | Etappenkarte |
| `theme/:themeId/map/:mapId` | Ortskarte |
| `theme/:themeId/location/:episodeId` | Ort (Platzhalter) |

Alles unter `theme/:themeId/` lädt die Welt-Konfiguration über einen Resolver
und ist tieflink-fähig; ohne gewählte Lernstufe leitet ein Guard auf
`theme/:themeId/level` um.

## Finale Akzeptanzkriterien (gesamter Plan)

1. `cd backend && composer lint` läuft grün. Der lokale Server
   (`backend\serve.cmd`) beantwortet die drei Content-Aufrufe mit dem
   JSON-Inhalt aus `data/`, und einen erfundenen Welt-Namen mit `404`.
2. `cd frontend && npm run build` läuft grün, `npm start` zeigt: Planetenkarte
   mit den Welten aus `data/main_hub.json` → Lernstufe wählen → Etappenkarte mit
   Etappen an ihren Prozent-Positionen → Ortskarte mit Orten und Routen → Ort.
3. „Ort geschafft" auf dem Ort-Platzhalter färbt den Ort auf der Ortskarte
   geschafft, schaltet den nächsten Ort frei, füllt die Fortschrittsleiste in
   der Kopfleiste — und übersteht ein Neuladen der Seite.
4. Beide Karten sitzen auf jedem Fenstermaß richtig: Knoten liegen auf
   demselben Punkt der Illustration, Routen treffen die Knoten, nichts
   überlappt (Fenster von 360 px bis Vollbild ziehen).
5. Nach einem `deploy.cmd` (Backend + Frontend + Content) ist die Welt auf
   questoria.info begehbar, und ein zweiter Frontend-Deploy löscht den
   hochgeladenen Content **nicht**.
6. `docs/code-map.md`, `AGENTS.md`, `docs/glossary.md`,
   `data/_authoring/JSON_SCHEMA_REFERENCE.md` und ADR-001 (als abgelöst
   markiert) sind auf dem Stand des Gebauten.

## Smoke-Checkliste (macht Sascha am Plan-Ende)

Oben steht, wo ich am unsichersten bin — dort zuerst schauen.

1. 🔴 **Content-Ordner überlebt einen Frontend-Deploy.** `deploy.cmd frontend`
   zweimal laufen lassen, danach eine Kartenseite auf questoria.info öffnen:
   Bilder und JSON noch da? (Der Abgleich löscht im Webbereich alles, was nicht
   im Build vorkommt — die Ausnahmeliste muss `content/` enthalten.)
2. 🔴 **Der Server findet seinen Content-Ordner.** `/api/content/themes` auf
   questoria.info aufrufen: kommt die Welt-Liste oder ein `404`? Der Pfad
   selbst ist vorab geprüft (siehe Konfidenz-Ausweis) — hier geht es nur noch
   darum, ob der Content auch tatsächlich oben angekommen ist.
3. 🔴 **Karten auf kleinem Fenster.** Browserfenster auf ~360 px Breite ziehen:
   Knoten dürfen nicht überlappen, Routen nicht neben den Knoten enden.
4. Fortschritt: einen Ort abschließen, Seite neu laden — Zustand hält.
   „Fortschritt zurücksetzen" auf der Etappenkarte setzt sauber auf Anfang.
5. Tieflink: `…/theme/dev_fixture/map/test_insel` direkt in die Adresszeile —
   landet auf der Lernstufen-Auswahl (weil keine Stufe gewählt ist), danach auf
   der Karte.
6. Tastatur: mit Tab durch Etappen- und Ortskarte, sichtbarer Fokusrahmen,
   Enter öffnet den Knoten.

## Konfidenz-Ausweis

- ✅ **Wo der Content-Ordner auf dem Server liegt — geprüft am 03.08.2026.**
  Die Serverauskunft meldet
  `document_root = /home/strato/http/premium/rid/72/15/54287215/htdocs/questoria/public`,
  und `deploy.cmd` lädt das Frontend nach `/public/` — beides derselbe Ordner.
  Der abgeleitete Pfad `DOCUMENT_ROOT/content` stimmt also, `open_basedir` ist
  leer (keine Lesesperre). `CONTENT_PATH` bleibt als Not-Ausgang im Code, wird
  aber im Betrieb nicht gebraucht. Server läuft auf PHP 8.5.7.
- 🟡 **Der Frontend-Abgleich löscht im Webbereich alles Fremde.** Die
  Ausnahmeliste in [deploy.cmd:173](../../../deploy.cmd) kennt bisher nur den
  Brücken-Ordner. **Check:** nach der Erweiterung zweimal `deploy.cmd frontend`
  fahren und nachsehen, ob `content/` noch steht.
- 🟡 **Kartengrößen in Container-Einheiten sind ungetestet.** Der Prototyp
  rechnet Knotengrößen in Pixeln, dieser Plan in `cqw` (Anteil der
  Kartenbreite) — das ist die Korrektur eines bekannten Prototyp-Fehlers, aber
  noch nie an echten Koordinaten gesehen. **Check:** Fenster von 360 px bis
  Vollbild ziehen, Knotenabstände beobachten (Smoke-Punkt 3).

## Bewusste Auslassungen

Steht hier, damit es nicht als Lücke gelesen wird:

- **Keine Deko-Inseln auf der Ortskarte.** Der Prototyp hat sie, das
  Content-Schema kennt sie nicht. Statt ein Feld zu erfinden, liefert das
  Kartenbild die Optik. Vermerkt in [FINDINGS.md](FINDINGS.md).
- **Kein Vorlese-Knopf, kein Modus-Umschalter, kein Ton-Knopf** in der
  Kopfleiste — die gehören zur Sprachausgabe (Meilenstein 3). Die Kopfleiste
  wird so gebaut, dass sie dort eingehängt werden, nicht umgebaut.
- **Kein Karten-Knopf, keine Erfolge-Liste** — Meilenstein 5 bzw. 4.
- **Keine Profilauswahl.** Die Kopfleiste zeigt „Gast", bis Meilenstein 4 die
  Profile bringt.
- **Kein Sperrmodell für Welten** auf der Planetenkarte: alle installierten
  Welten sind offen. Das Schema kennt keinen Sperrzustand, und einer wird hier
  nicht erfunden.

## Summary

*(beim Archivieren füllen)*

## Files touched

*(beim Archivieren füllen)*

## Commits

*(beim Archivieren füllen)*

## Deviations from plan

*(beim Archivieren füllen)*

## Follow-ups

*(beim Archivieren füllen)*
