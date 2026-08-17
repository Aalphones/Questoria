# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 7/7 — Testwelt, Authoring-Toolkit, Doku (complete) — **alle Phasen fertig**

**Nächster Schritt:** Sascha macht die Smoke-Checkliste aus der Plan-README
(Abschnitt „Smoke-Checkliste", 7 Punkte, die ersten drei 🔴 sind die
Wackelstellen). Danach: Plan archivieren (`docs/planning/2026-08-14_event-engine/`
→ `docs/archive/2026-08/`) und STATE.md auf „kein aktiver Plan" setzen.

**Zuletzt abgeschlossen:** Phase 7 — die Testwelt `dev_fixture` spielt jetzt
alle fünf Eventtypen in einer Episode durch (`test_leuchtturm`: Dialog → Quiz →
Texteingabe → Bildsuche → Belohnung), neue `cards.json` mit einer Karte. Die
Schema-Referenz bekommt den Bewertungssatz (Weiterraten, erster Versuch zählt)
und den Lernstufen-Checklistenpunkt; ein stale gewordener 🟡-Verifikationshinweis
ist korrigiert. `docs/design/README.md` und `docs/PROJECT.md` sind auf den
gebauten Stand gezogen (vier neue bewusste Abweichungen, Schema-Verifikation
als erledigt markiert). `code-map.md`, `glossary.md`, `AGENTS.md` waren schon
aktuell aus früheren Phasen — nur gegengelesen. Build, Frontend-Lint und
Backend-Lint laufen grün.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
