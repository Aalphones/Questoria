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

- [ ] Lokal durchspielen, Lernstufe für Lernstufe. Jede Auffälligkeit sofort
      notieren, nicht am Ende aus dem Gedächtnis.
- [ ] Kleine Content-Fehler (Tippfehler, falsche Koordinate, vertauschtes Bild)
      direkt beheben.
- [ ] Engine-Fehler unterscheiden: Ist es ein Fehler *dieser Welt* oder einer
      *der Engine*? Nur Engine-Fehler werden Code-Änderungen, und nur die
      kleinen; alles Größere wird ein Eintrag, kein Umbau mitten im Content-Plan.
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
- [ ] `deploy.cmd content`, dann dieselbe Runde auf dem Server.
- [ ] Auf dem Gerät des Kindes einmal durchklicken.

## Doku

- [ ] `docs/PROJECT.md` → Offene Fragen: was diese Welt beantwortet hat
      (taugt das Schema für echten Content? reicht der Vorlesemodus für ein
      nicht lesendes Kind?) als geklärt markieren, mit Datum.
- [ ] `docs/glossary.md`: Begriffe, die beim Content-Bau neu entstanden sind.
- [ ] `STATE.md` auf den nächsten Plan zeigen lassen
      (Meilenstein 5, `docs/planning/2026-08-18_sammelkarten-und-druckbogen/`).
- [ ] Plan nach `docs/archive/2026-08/` verschieben, Bottom-Sektionen der
      README füllen.

## Report-Back
