# STATE

**Aktiver Plan:** `docs/planning/2026-07-31_core-architecture/`
**Phase:** 3/3 — MySQL-Schema (pending)
**Nächster Schritt:** Vor dem Bauen klären, wie das Schema ohne
Kommandozeilenzugang auf den Server kommt — erlaubt Strato Fernzugriff auf
MySQL (Runner läuft lokal gegen die entfernte Datenbank) oder braucht es einen
tokengeschützten Endpoint, der ihn dort auslöst? Danach die 6 Tabellen nach
`phase-3-mysql-schema.md`.

**Offen aus Phase 2 (braucht Zutun des Nutzers):** Das Backend ist gebaut und
lokal geprüft, aber noch nie hochgeladen. Dafür fehlen die Strato-Angaben —
Adresse der API, FTP/SFTP-Zugang, Datenbankwerte, eingestellte PHP-Version.
Sobald sie in `deploy.env` stehen (Vorlage: `deploy.env.example`), bringt ein
Doppelklick auf `deploy.cmd` alles hoch.
