# Phase 3: MySQL-Schema

Rating: **standard**

## Kontext (vorher lesen)

- [docs/PROJECT.md](../../PROJECT.md) Abschnitt 8 (Nutzerverwaltung & Persistenz) — Ursprungs-Tabellenliste
- `backend/src/Database/Connection.php` (aus Phase 2) — PDO-Zugriff, den der Migrations-Runner nutzt

## Designentscheidungen (bereits getroffen, hier nur umsetzen)

- Migrationen sind **rohes SQL**, kein Framework-Migrationstool (passt zum
  Rest des Backends — kein zusätzliches Abhängigkeits-Gewicht für 6 Tabellen)
- **Roll-forward-only** — keine Down-Migrationen. Für ein Solo-Projekt in
  Phase 1 ist Rollback-Tooling Aufwand ohne Gegenwert; falls später nötig,
  eigener ADR.
- Engine `InnoDB`, Charset `utf8mb4`/`utf8mb4_unicode_ci` durchgängig (Emoji/Umlaute in Freitext-Feldern wie `display_name`, `title`)
- `users.role` als `ENUM('elternteil','spieler')` — geschlossene Wertemenge passend zur Vorgabe "nur zwei Rollen" (`docs/PROJECT.md` Abschnitt 8)

## Akzeptanzkriterien

1. `php backend/bin/migrate.php` gegen eine leere, existierende MySQL-Datenbank (Zugangsdaten aus `.env`) legt alle 7 Tabellen (6 Fach-Tabellen + `schema_migrations`) fehlerfrei an.
2. Zweiter Lauf von `php backend/bin/migrate.php` überspringt bereits angewendete Migrationen (idempotent, keine Fehler, keine Doppel-Ausführung).
3. Alle Foreign Keys sind aktiv (`SHOW CREATE TABLE` zeigt `CONSTRAINT ... FOREIGN KEY` für jede in den DDLs unten benannte Beziehung).

## Implementation

**Abweichung von der ursprünglichen Formulierung:** `backend/bin/migrate.php`
existiert wie geplant, ist aber gegen die Live-Datenbank **nicht ausführbar** —
ein lokaler Verbindungstest gegen den entfernten MySQL-Host lief nach 5s in
einen Timeout (Strato lässt keinen Fernzugriff zu), und eine Kommandozeile auf
dem Server gibt es nicht (siehe `knowledge/topics/strato-shared-hosting.md`,
Zeile „einen Migrations-Runner als CLI-Skript planen"). Tatsächlicher Weg: ein
tokengeschützter Endpoint `POST /api/migrate` (`MigrateController`), der
denselben `MigrationRunner` aufruft — gleiches Muster wie `api-bridge/diag.php`,
gleicher Weg wie beim Schwesterprojekt CardMaker. `bin/migrate.php` bleibt als
CLI-Hülle für einen möglichen späteren lokalen Test erhalten.

- [x] `backend/src/Migrations/sql/001_create_schema_migrations.sql`:
      ```sql
      CREATE TABLE schema_migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/002_create_users.sql`:
      ```sql
      CREATE TABLE users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('elternteil','spieler') NOT NULL DEFAULT 'elternteil',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/003_create_player_profiles.sql`:
      ```sql
      CREATE TABLE player_profiles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        display_name VARCHAR(50) NOT NULL,
        avatar VARCHAR(255) NULL,
        selected_theme VARCHAR(100) NULL,
        selected_level VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_player_profiles_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/004_create_savegames.sql`:
      ```sql
      CREATE TABLE savegames (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        profile_id INT UNSIGNED NOT NULL,
        theme_id VARCHAR(100) NOT NULL,
        episode_id VARCHAR(100) NOT NULL,
        node_id VARCHAR(100) NOT NULL,
        game_state_json JSON NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_savegames_profile
          FOREIGN KEY (profile_id) REFERENCES player_profiles(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_profile_theme (profile_id, theme_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/005_create_achievements.sql`:
      ```sql
      CREATE TABLE achievements (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        theme_id VARCHAR(100) NOT NULL,
        achievement_key VARCHAR(100) NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NULL,
        icon VARCHAR(255) NULL,
        UNIQUE KEY uniq_theme_key (theme_id, achievement_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/006_create_player_achievements.sql`:
      ```sql
      CREATE TABLE player_achievements (
        profile_id INT UNSIGNED NOT NULL,
        achievement_id INT UNSIGNED NOT NULL,
        unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (profile_id, achievement_id),
        CONSTRAINT fk_player_achievements_profile
          FOREIGN KEY (profile_id) REFERENCES player_profiles(id) ON DELETE CASCADE,
        CONSTRAINT fk_player_achievements_achievement
          FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/src/Migrations/sql/007_create_statistics.sql`:
      ```sql
      CREATE TABLE statistics (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        profile_id INT UNSIGNED NOT NULL,
        theme_id VARCHAR(100) NOT NULL,
        minigames_completed INT UNSIGNED NOT NULL DEFAULT 0,
        correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
        wrong_answers INT UNSIGNED NOT NULL DEFAULT 0,
        playtime_minutes INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_statistics_profile
          FOREIGN KEY (profile_id) REFERENCES player_profiles(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_profile_theme_stats (profile_id, theme_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [x] `backend/bin/migrate.php` + `backend/src/Migrations/MigrationRunner.php` (Logik in eine wiederverwendbare Klasse gezogen, damit sowohl die CLI-Hülle als auch `MigrateController` denselben Runner nutzen):
      - Lädt `.env` (wie `public/index.php`), holt `Connection::pdo()`
      - Legt `schema_migrations` an, falls sie noch nicht existiert (Migration 001 läuft immer zuerst, per Existenz-Check statt Registry-Eintrag)
      - Liest `src/Migrations/sql/*.sql` sortiert nach Dateiname
      - Pro Datei: `SELECT 1 FROM schema_migrations WHERE migration = ?` — existiert der Eintrag, skip; sonst `PDO::exec()` des SQL-Inhalts in einer Transaktion, dann `INSERT INTO schema_migrations (migration) VALUES (?)`
      - Gibt pro Datei eine Zeile auf STDOUT aus (`applied: 002_create_users.sql` bzw. `skip (already applied): ...`)
- [x] `backend/src/Controllers/MigrateController.php` + Route `POST /api/migrate` in `backend/public/index.php`: prüft `X-Migrate-Token` gegen `MIGRATE_TOKEN` (gleiches Muster wie `diag.php`, bei falschem/fehlendem Token `404` statt `401`), ruft dann `MigrationRunner` auf und gibt die Ergebnisliste als JSON zurück. `MIGRATE_TOKEN` durch `backend/.env(.example)`, `deploy.env(.example)` und `deploy.cmd` gezogen (eigenständiger Wert, nicht `DIAG_TOKEN` wiederverwendet).
- [x] **Nachtrag (Nutzerwunsch, noch am selben Tag):** `backend/src/Migrations/AutoMigrator.php` — prüft bei jedem echten (gematchten) Request in `public/index.php`, ob eine SQL-Datei noch aussteht (`MigrationRunner::hasPending()`, billiger Zeilen-Zählvergleich statt vollem Lauf), und holt das über `MySQL GET_LOCK`/`RELEASE_LOCK` gegen Doppellauf ab. Ein Fehlschlag wird geloggt, reißt aber nicht den Request mit. Not-Aus über `AUTO_MIGRATE=false` in `.env` (durch die ganze Kette gezogen: `backend/.env(.example)`, `deploy.env(.example)`, `deploy.cmd`). `POST /api/migrate` bleibt zusätzlich als manuelles Debug-Werkzeug bestehen — mit `AutoMigrator` aktiv meldet es in der Regel nur noch „skip (already applied)".

## Doc-Updates

- [x] `docs/PROJECT.md` — Verweis auf die jetzt verbindlichen DDLs ergänzt bei Meilenstein 4 („Minispiel-System & Nutzerverwaltung"); der Plan nannte „Abschnitt 8", das gibt es in der aktuellen `PROJECT.md`-Gliederung nicht (vermutlich ein Verweis auf eine ältere Fassung) — inhaltlich nächstliegender Ort gewählt.
- [x] `docs/code-map.md` — `Migrations/`- und `Controllers/MigrateController.php`-Zeile im Ist-Stand ergänzt.

## Report-Back

- Migrations-Weg per Rückfrage geklärt (Entscheidungsblock vor der Umsetzung):
  tokengeschützter Endpoint statt CLI, siehe Abweichung oben. Beleg: lokaler
  PDO-Verbindungsversuch gegen die entfernte MySQL lief nach 5s in einen
  Timeout — Fernzugriff ist blockiert.
- `composer lint` grün (10 Dateien, `bin/` in `.php-cs-fixer.php`-Finder ergänzt,
  da neu). `php -l` auf allen neuen/geänderten Dateien fehlerfrei.
- Lokaler Smoke-Test (`php -S localhost:8123 -t public`): `GET /api/health`
  antwortet weiterhin `200` (mit `db_connected:false`, erwartbar ohne
  Fernzugriff). `POST /api/migrate` ohne bzw. mit falschem Token antwortet
  `404` mit demselben Rumpf wie ein echter unbekannter Pfad — das Token-Gate
  greift, bevor überhaupt eine DB-Verbindung versucht wird (schnelle Antwort,
  kein 21s-Timeout wie bei `/api/health`).
- **Nachtrag:** Nutzerwunsch war, ganz ohne manuellen Endpoint-Aufruf
  auszukommen — `AutoMigrator` löst die Migration jetzt automatisch bei jedem
  echten API-Aufruf aus (Details siehe Implementation oben).
- **Beim lokalen Testen des Auto-Migrate-Pfads einen echten Bug gefunden:**
  `Connection.php` setzte keinen Verbindungs-Timeout. Ein gescheiterter
  MySQL-Verbindungsversuch hängt dadurch am OS-TCP-Timeout (~21s auf dieser
  Maschine). Weil jetzt zwei Stellen pro Request eine eigene Verbindung
  versuchen können (`AutoMigrator` und der jeweilige Controller), riss ein
  zweiter gescheiterter Versuch PHPs `max_execution_time` (30s) — ein Fatal
  Error, den kein `try/catch` fängt (erst als echter `500` beim lokalen
  Smoke-Test aufgefallen, nicht beim Code-Review). Fix: `PDO::ATTR_TIMEOUT
  => 5` in `Connection::pdo()`. Nach dem Fix: `GET /api/health` gegen eine
  unerreichbare DB antwortet in ~10s mit `200`/`db_connected:false` statt
  nach ~42s mit `500`.
- Migrationslauf gegen die Live-Datenbank: Deploy erfolgt, `AutoMigrator`
  läuft jetzt bei jedem echten Request automatisch mit. Ergebnis wird nach dem
  ersten Live-Request nachgetragen.
