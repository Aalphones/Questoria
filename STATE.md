# STATE

**Aktiver Plan:**
[Event Engine, Meilenstein 3](docs/planning/2026-08-14_event-engine/README.md),
7 Phasen, freigegeben am 14.08.2026

**Phase:** 5/7 — `reward` + Ergebnis-Screen + echte Sterne (complete)

**Nächster Schritt:** Neue Session, `/clear` durchführen, dann `/implement` für
Phase 6 (Weiterspielen nach Abbruch) — Rating „standard", also `sonnet`.

**Zuletzt abgeschlossen:** Phase 5 der Event Engine — der Platzhalter-Abschluss
(pauschal 3 Sterne, sofortige Navigation) ist raus. `star-rules.ts` berechnet
die echte Sternenformel als reine Funktion; `episode.ts` schreibt sie einmalig
per `effect()`, sobald die Eventliste durch ist. Neuer Eventtyp `reward`:
Belohnungs-Karte mit `eqPop`, merkt `card_id` in `EpisodeRun.pendingCardId`
für Meilenstein 5 (optional, fehlende ID ist kein Fehler). Neuer
Ergebnis-Screen `features/result/` — keine eigene Route, wird vom
Episoden-Screen nach dem letzten Event gezeigt: Sterne, Konfetti (rein per
CSS, kein JS-Zufall), zwei Statistik-Karten aus dem Lauf, CTAs zurück zur
Ortskarte bzw. zur Etappenkarte. `prefers-reduced-motion` läuft über die
bestehenden globalen Dauer-Tokens mit, kein eigener Zweig nötig. Build und
Frontend-Lint grün, Backend-Lint unverändert grün (kein Backend-Code berührt).
Noch nicht am echten Gerät/Browser durchgespielt — das passiert im Smoke-Test
am Plan-Ende.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers. Ad-hoc-Testserver
in diesem Projekt nie auf Port 8000 oder 4200 starten — Sascha nutzt beide
selbst parallel (`backend\serve.cmd` / `npm start`). Für den PHP-Linter müssen
die Entwicklungs-Abhängigkeiten installiert sein (`composer install` ohne
`--no-dev`); `deploy.cmd` installiert vor dem Hochladen ohnehin selbst neu.
