# STATE

**Aktiver Plan:** `docs/planning/2026-07-31_core-architecture/`
**Phase:** 3/3 — MySQL-Schema (pending)
**Nächster Schritt:** Klären, wie das Schema ohne Kommandozeilenzugang auf den
Server kommt — Fernzugriff auf MySQL prüfen (dann läuft der Runner von hier aus)
oder einen tokengeschützten Endpoint bauen. Das Muster dafür steht bereits in
`api-bridge/diag.php`. Danach die 6 Tabellen nach `phase-3-mysql-schema.md`.

**Stand Phase 2:** erledigt und live. <https://questoria.info/api/health>
antwortet, die Datenbank ist erreichbar, der Programmcode liegt außerhalb des
ausgelieferten Bereichs. Hochladen per Doppelklick auf `deploy.cmd`.
