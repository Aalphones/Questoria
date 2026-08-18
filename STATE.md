# STATE

**Kein aktiver Plan aus „Wort-Bild-Paare"** — archiviert am 18.08.2026:
[docs/archive/2026-08/2026-08-18_wort-bild-paare.md](docs/archive/2026-08/2026-08-18_wort-bild-paare.md).
Beide Phasen fertig, Prüfskript meldet 0 strukturelle Verstöße über
`pokemon_lesen`. Ungeprüft bleibt die Sichtprüfung am Bildschirm — es fehlen
noch alle Bilder.

**Nächster Schritt:**
[docs/planning/2026-08-18_erste-echte-welt/README.md](docs/planning/2026-08-18_erste-echte-welt/README.md)
Phase 2 (Bilder) — 52 Dateien nach
[bestellliste.md](docs/planning/2026-08-18_erste-echte-welt/bestellliste.md)
erzeugen und einsortieren (🟡 Sascha-Aufgabe an der Bildmaschine, danach
Namen gegen den Content abgleichen). Danach Phase 3 (Durchspielen).

**Danach in dieser Reihenfolge:**

1. Erste echte Welt Phase 3 (Durchspielen) — echte Runde am Bildschirm,
   gefundene Lücken protokollieren, Doku und Deploy.
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
