# Phase 3 — Durchspielen und Nachziehen

Die Welt wird gespielt, nicht angeschaut. Was dabei auffällt, ist der eigentliche
Ertrag dieses Plans.

## Kontext (vorher lesen)

- `backend/serve.cmd` und `frontend/proxy.conf.json` — wie lokal gespielt wird
  (Backend auf 8000, Frontend über `npm start`; beide Ports gehören Sascha,
  nichts anderes daraufsetzen)
- `AGENTS.md` → Content-Repository (Drive-Verknüpfung, `deploy.cmd content`)
- `FINDINGS.md` dieses Plans
- `docs/PROJECT.md` → Offene Fragen

## Abnahmekriterien

1. Alle drei Episoden lassen sich lokal von der Planetenkarte bis zum Ergebnis
   durchspielen, in allen drei Lernstufen.
2. Kein fehlendes Bild, kein fehlender Ton, keine leere Frage, kein Ladefehler.
3. Der Fortschritt kommt an: Sterne auf der Etappenkarte, Statistiken im
   Ergebnis, mindestens ein Erfolg wird vergeben.
4. Der Vorlesemodus verrät bei keiner Aufgabe die Lösung (Smoke-Punkt 2).
5. Jede gefundene Engine- oder Schema-Lücke steht in `FINDINGS.md`, mit einer
   Einordnung: *jetzt geschlossen* / *Meilenstein 5* / *später, eigener Plan*.
6. Die Welt läuft nach `deploy.cmd content` auch auf `questoria.info`.

## Checkliste

- [x] Lokal durchspielen, Lernstufe für Lernstufe. **Abgenommen am 20.08.2026
      (Sascha, am Bildschirm): läuft wie vorgesehen, keine neuen Befunde.**
      Damit sind auch die drei zuvor ungeprüften Punkte bestätigt — die
      gemischte Antwort-Reihenfolge (Beschriftung folgt der Anzeige, ein
      falscher Tipp graut die angetippte Antwort aus), die 16 Sprachaufnahmen
      und die 52 Bilder im echten Layout.
- [x] Kleine Content-Fehler (Tippfehler, falsche Koordinate, vertauschtes Bild)
      direkt beheben. Erledigt: Planetenkarten-Koordinate der Pokémon-Kachel
      (FINDINGS.md); sonst nichts gefunden.
- [x] Engine-Fehler unterscheiden: Ist es ein Fehler *dieser Welt* oder einer
      *der Engine*? Zwei kleine Engine-Fehler direkt behoben (doppelter
      Audio-Pfad, fehlender Kartenhintergrund der Etappenkarte), das große
      Layout-Paket als eigener Plan aufgesetzt und inzwischen abgeschlossen
      ([UI-Umbau Vollbild](../2026-08-19_ui-umbau-vollbild/README.md)).
      Kein Umbau mitten im Content-Plan.
- [x] Schema-Referenz nachziehen, falls beim Bauen ein Feld gefehlt hat oder
      eine Regel unklar war (`data/_authoring/README.md` → Pflegepflicht).
      Erledigt: totes `background`/`music`-Beispiel in Abschnitt 4 gestrichen
      (FINDINGS.md, Phase 1). Zusätzlich statisch geprüft, ohne Server nötig:
      Vorlesemodus-Regel gegen alle 8 Aufgaben + 3 Episoden-Dialoge (kein
      Wort-Leak), alle vier `learning_objectives`-IDs im Katalog, alle
      ID-Querverweise (Maps/Nodes/Episoden/Karten) konsistent.
- [x] `data/main_hub.json` prüfen: Kachel, Beschreibungstext, Lernstufen-Hinweis.
      Koordinate war falsch (Kachel im leeren Himmel), jetzt behoben —
      Details in FINDINGS.md. Titel/Fach/Lernstufen-Labels in
      `world_config.json` sind vollständig und sinnvoll, keine
      Beschreibungs-/Lernstufen-Hinweis-Felder in `main_hub.json` selbst.
- [x] `deploy.cmd content`, dann dieselbe Runde auf dem Server. Deploy am
      20.08.2026 gelaufen (WinSCP: „Nothing to synchronize" — der volle Deploy
      vom 19.08. hatte den Content schon oben), Server-Runde von Sascha
      abgenommen.
- [x] Auf dem Gerät des Kindes einmal durchklicken. Abgenommen am 20.08.2026.

## Doku

- [x] `docs/PROJECT.md` → Offene Fragen: beide Fragen als geklärt eingetragen
      (20.08.2026). Das Schema trägt echten Content ohne Änderung; der
      Vorlesemodus reicht, solange die Content-Regel „das zu lesende Wort steht
      nie in der Frage" eingehalten wird.
- [x] `docs/glossary.md`: zwei neue Begriffe aufgenommen — **Bildstil
      (`art_style`)** und **Bestellliste**.
- [x] `STATE.md` zeigt auf Meilenstein 5,
      `docs/planning/2026-08-18_sammelkarten-und-druckbogen/`, Phase 1.
- [x] Plan nach `docs/archive/2026-08/` verschoben, Bottom-Sektionen der
      README gefüllt, relative Links auf die neue Tiefe korrigiert.

## Report-Back

**Phase abgeschlossen am 20.08.2026.** Die Welt ist durchgespielt und läuft wie
vorgesehen — lokal, auf `questoria.info` und auf dem Gerät des Kindes. Aus der
Runde kamen keine neuen Befunde mehr; die drei Punkte, die zuvor niemand am
Bildschirm gesehen hatte (gemischte Antwort-Reihenfolge, die 16 Sprachaufnahmen,
die 52 Bilder im Layout), sind damit bestätigt.

Zwei Findings, die bis zuletzt offen standen, sind beim Abschließen geschlossen
statt vertagt worden: Das „kein Bild in der Frage"-Problem hatte sich durch den
eigenen Eventtyp `word_match` längst erledigt — es stand nur noch als Karteileiche
drin. Und die Sprite-Vorgabe in `ASSET_REQUIREMENTS.md` war schlicht falsch
formuliert: Pflicht ist jedes Sprite, **das eine Dialogzeile nennt**, nicht jedes
denkbare Gefühl pro Figur. Acht Sprites für vier Figuren haben durch eine
komplette Welt getragen.

Alle sechs Abnahmekriterien erfüllt.
