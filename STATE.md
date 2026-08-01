# STATE

**Aktiver Plan:** `docs/planning/2026-07-31_core-architecture/`
**Phase:** 3/3 — MySQL-Schema (Code fertig inkl. Auto-Migrate, Deploy läuft)
**Nächster Schritt:** Backend erneut deployen (`deploy.cmd backend`), dann
`GET https://questoria.info/api/health` aufrufen — löst `AutoMigrator`
automatisch aus und legt die 7 Tabellen an. Danach AK 1-4 aus der Plan-README
gegenprüfen und die Smoke-Checkliste abarbeiten (Plan ist damit fertig, dann
archivieren).

**Stand Phase 2:** erledigt und live. <https://questoria.info/api/health>
antwortet, die Datenbank ist erreichbar, der Programmcode liegt außerhalb des
ausgelieferten Bereichs. Hochladen per Doppelklick auf `deploy.cmd`.

**Korrektur:** PHP/Composer liegen unter `C:\Users\sasch\develop\.tools\`
(`php.cmd`/`composer.cmd`), nicht im Suchpfad des Benutzers und nicht unter
`C:\Tools\...` wie eine ältere Notiz im Plan behauptete.
