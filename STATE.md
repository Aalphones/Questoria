# STATE

**Aktiver Plan:** keiner in Umsetzung — geparkt liegt
[Timeline & Karten (Meilenstein 2)](docs/planning/2026-08-03_timeline-und-karten/README.md),
freigegeben am 03.08.2026, acht Phasen, noch keine begonnen.

**Nächster Schritt:** `/implement` starten, beginnend mit Phase 1
(Content-Schnittstelle im Backend). Deren erste Aufgabe ist eine Prüfung am
Server — die Serverauskunft `api-bridge/diag.php` braucht das Token aus
`deploy.env`.

Meilenstein 1 (Core Architecture) ist fertig und archiviert:
`docs/archive/2026-08/2026-07-31_core-architecture/`.

**Architekturschnitt am 14.08.2026:** Questoria ist eine Story-Engine, deren
Gameplay komplett über Events läuft — eine Episode ist eine Eventliste, Dialog
ist ein Eventtyp wie jeder andere. Die Doku ist durchgehend darauf umgestellt
(Begründung: `docs/decisions/004-event-engine.md`, abgelöste Begriffe:
`docs/glossary.md`). Für den laufenden Plan ändert sich nur das Content-Format
der Testwelt in Phase 2; Karten, Routing und Fortschritt bleiben unverändert.

**Merkposten:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers.
