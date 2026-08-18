# STATE

**Aktiver Plan:** [docs/planning/2026-08-18_wort-bild-paare.md](docs/planning/2026-08-18_wort-bild-paare.md)
— eine neue Aufgabenform, bei der das Kind Bilder und geschriebene Wörter
zusammenlegt. Freigegeben am 18.08.2026, zwei Phasen.

**Phase:** 1 von 2 (Der Eventtyp) — noch nicht begonnen. Rating **heikel**:
neues Bedienkonzept, neue Bewertungsregel, der Kontrakt entsteht hier.

**Nächster Schritt:** Phase 1 abarbeiten — die Checkliste im Plan ist die
Reihenfolge. Der Einstieg ist `docs/decisions/014-zuordnen-als-eigener-eventtyp.md`
(Nummer 014 ist frei, 011–013 sind vom Sammelkarten-Plan reserviert), danach
Schema-Abschnitt 5.6, dann der Code.

**Alle Design-Entscheidungen stehen im Plan** (Sektion „Entschieden, bevor
gebaut wird", neun Punkte) — inklusive der Antwort auf die Design-Frage:
freihändig innerhalb der bestehenden Aufgaben-Hülle `ui/task-card/`, kein
eigener Screen. **Nicht neu aufrollen.**

**Warum dieser Plan die Welt überholt hat:** Die Pokémon-Welt steht bei Phase 2
(die 47 Bilder) und wartet bewusst. Ihre Episode 2 wird auf die neue
Aufgabenform umgebaut, und das ändert die Bestellliste — erst der Eventtyp,
dann der Umbau (Phase 2 dieses Plans), dann die Bilder. Andersherum würde ein
Teil der Bilder zweimal gemalt.

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
Weltdateien tauchen in keinem Commit auf.
