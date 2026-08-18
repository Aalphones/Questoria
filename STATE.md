# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_wort-bild-paare.md](docs/planning/2026-08-18_wort-bild-paare.md)
— die neue Aufgabenform, bei der das Kind Bilder und geschriebene Wörter
zusammenlegt. Freigegeben am 18.08.2026, zwei Phasen.

**Phase:** 2 von 2 (Die Welt umbauen) — noch nicht begonnen. Rating
**standard**: Content und Doku, keine offenen Entscheidungen.

**Nächster Schritt:** Phase 2 abarbeiten — die Checkliste im Plan ist die
Reihenfolge. Einstieg: `data/themes/pokemon_lesen/events/wortkarte_1.json` und
`wortkarte_2.json` durch `wortpaare_1.json` / `wortpaare_2.json` ersetzen (drei
Lernstufen je Datei), danach `ep_route_1_wiese.json`, dann Bestellliste und
Welt-Plan nachziehen. **Ein Punkt aus Phase 2 ist schon erledigt**: die
Bildregel in `ASSET_REQUIREMENTS.md` Abschnitt 8 (Pflegepflicht des
Authoring-Toolkits, musste in den Schema-Commit).

**Phase 1 ist fertig.** Der Eventtyp `word_match` steht: Schema-Abschnitt 5.6,
[ADR-014](docs/decisions/014-zuordnen-als-eigener-eventtyp.md), Komponente
`frontend/src/app/features/events/word-match/`, registriert in
`event-type-map.ts` (Komponente, bewertet, Prüfung), Testwelt-Aufgabe
`probe_word_match` in der Leuchtturm-Episode. Build und Lint sind grün.
**Angesehen hat die Aufgabe noch niemand** — die Smoke-Checkliste am Plan-Ende
ist die erste Sichtprüfung, ihre drei 🔴-Punkte zuerst.

**Alle Design-Entscheidungen stehen im Plan** (Sektion „Entschieden, bevor
gebaut wird", neun Punkte). **Nicht neu aufrollen.**

**Danach in dieser Reihenfolge:**

1. [docs/planning/2026-08-18_erste-echte-welt/](docs/planning/2026-08-18_erste-echte-welt/README.md)
   Phase 2 (Bilder) und Phase 3 (Durchspielen). Phase 1 ist fertig: alle
   JSON-Dateien der Welt liegen unter `data/themes/pokemon_lesen/`, die Welt
   steht auf der Planetenkarte, Schema-Checkliste maschinell geprüft
   (0 Verstöße).
2. Meilenstein 5 — Sammelkarten & Druckbogen, sechs Phasen, freigegeben am
   18.08.2026:
   [docs/planning/2026-08-18_sammelkarten-und-druckbogen/](docs/planning/2026-08-18_sammelkarten-und-druckbogen/README.md).

**Offen aus Meilenstein 4:** Die Smoke-Checkliste der archivierten README
([docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md](docs/archive/2026-08/2026-08-17_nutzerverwaltung-und-spielstand/README.md))
ist noch nicht abgearbeitet — sieben Punkte, die drei ersten mit 🔴.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
Der Content unter `data/themes/` liegt außerhalb von Git (Drive-Verknüpfung) —
Weltdateien und die Testwelt-Aufgabe tauchen in keinem Commit auf.
