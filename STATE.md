# STATE

**Aktiver Plan:**
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md)

**Phase:** 8/8 — Planetenkarte: Main-Hub auf das Design ziehen (complete)

**Nächster Schritt:** Plan-Ende. Sascha geht die Smoke-Checkliste aus der
[README](docs/planning/2026-08-03_timeline-und-karten/README.md) durch (Punkte 1
und 2 sind bereits erledigt, siehe Konfidenz-Ausweis). Danach den Plan-Ordner
nach `docs/archive/2026-08/` verschieben, die Bottom-Sektionen der README füllen
und diese Datei auf den nächsten Plan zeigen lassen.

**Smoke-Runde (14.08.2026, Sascha):** Ort abschließen + Speichern ✅,
Fokusrahmen ✅. Offen aus Punkt 3: auf schmalen Fenstern lag das Info-Panel
über den Knoten — nachgebessert mit zwei Breakpoints (`frontend/src/styles/_breakpoints.scss`),
Panel klappt unterhalb der Kartenschwelle zu. Noch nicht nachgeprüft: wie das
Ergebnis auf ~360 px wirklich aussieht.

**Phase 8 ist fertig.** Der Einstieg ist keine Kachelliste mehr, sondern die
Planetenkarte: Welten als runde Knoten auf der gemeinsamen Kartenfläche, Pille
mit Name und Status („Offen · Etappe N" / „Noch nicht gestartet" / „Alle
Etappen geschafft"), Info-Panel oben links mit „Weiterspielen" in die zuletzt
gespielte Welt. Build und Lint grün, kein Browser-Durchlauf (private-Profil).
Abweichungen und Zusätze stehen im Report-Back von
[phase-8-planetenkarte.md](docs/planning/2026-08-03_timeline-und-karten/phase-8-planetenkarte.md).

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`).
