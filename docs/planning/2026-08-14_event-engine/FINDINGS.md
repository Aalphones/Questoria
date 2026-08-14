# Findings — Event Engine

Erkenntnisse während der Umsetzung, die eine spätere Phase oder einen späteren
Meilenstein betreffen. Format:

- [ ] → Phase N: <Erkenntnis>

---

- [x] → Phase 2: Ob eine per `ngComponentOutlet` eingesetzte Komponente den
  `EpisodeRun`-Dienst des Episoden-Screens sieht, ist erst im Browser
  entschieden. Rückfallweg steht in der Phase (`ngComponentOutletInjector`).
  Der gewählte Weg gehört ins Report-Back — Phase 3–5 bauen darauf.
  **Erledigt:** `inject(EpisodeRun)` genügt, kein eigener Injektor — Beleg im
  Report-Back von Phase 2.
- [ ] → Phase 3: Eine Event-Komponente bekommt ihre Konfiguration als
  `input.required<TConfig>()` und wird vom Gerüst mit `config: event.config`
  (Typ `unknown`) bespielt — die Prüfung, ob die Konfiguration zum Typ passt,
  findet also nirgends statt. Beim Auflösen von `config.ref` in Phase 3 ist das
  die Stelle, an der eine kaputte Datei sonst als leeres Quiz durchrutscht
  statt in den Fehlerpfad zu laufen.
- [ ] → Phase 5: `EpisodeRun.pendingCardId` ist der Haken, an den Meilenstein 5
  die echte Kartenvergabe hängt. In Meilenstein 3 wird die ID nur gemerkt,
  nicht verwendet.
- [ ] → Meilenstein 4: `RunStoreService` (Phase 6) legt den angefangenen Lauf
  im Browser-Speicher ab. Beim Umstieg auf die Savegame-Schnittstelle wird
  genau diese Datei getauscht — derselbe Schnitt wie bei `ProgressService`
  ([ADR-006](../../decisions/006-fortschritt-vor-der-nutzerverwaltung.md)).
- [ ] → Meilenstein 4: Der Ergebnis-Screen zeigt zwei Statistiken aus dem
  laufenden Spiel. Sobald es echte Statistiken und Erfolge in der Datenbank
  gibt, kommen Erfolgs-Pille und dritte Karte („Neue Wörter gelernt") dazu —
  bis dahin fehlen die Daten, nicht die Lust.
- [ ] → Meilenstein 5: Der Ergebnis-Screen hat keinen Platzhalter für das
  Karten-Banner aus dem Design (Abschnitt 9a). Es wird dort angebaut, wo heute
  die Statistik-Karten enden.
- [ ] Offen bis zur Sichtprüfung: Ob die Browser-Stimme für Vorlesen reicht
  oder pro Dialogzeile Aufnahmen nötig sind (offene Frage aus
  [PROJECT.md](../../PROJECT.md)). Das Schema trägt beides, die Engine auch —
  entschieden wird am echten Gerät, nicht am Schreibtisch.
