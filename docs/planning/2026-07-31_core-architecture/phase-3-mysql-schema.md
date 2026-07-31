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

- [ ] `backend/src/Migrations/sql/001_create_schema_migrations.sql`:
      ```sql
      CREATE TABLE schema_migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      ```
- [ ] `backend/src/Migrations/sql/002_create_users.sql`:
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
- [ ] `backend/src/Migrations/sql/003_create_player_profiles.sql`:
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
- [ ] `backend/src/Migrations/sql/004_create_savegames.sql`:
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
- [ ] `backend/src/Migrations/sql/005_create_achievements.sql`:
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
- [ ] `backend/src/Migrations/sql/006_create_player_achievements.sql`:
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
- [ ] `backend/src/Migrations/sql/007_create_statistics.sql`:
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
- [ ] `backend/bin/migrate.php`:
      - Lädt `.env` (wie `public/index.php`), holt `Connection::pdo()`
      - Legt `schema_migrations` an, falls sie noch nicht existiert (Migration 001 läuft immer zuerst, per Existenz-Check statt Registry-Eintrag)
      - Liest `src/Migrations/sql/*.sql` sortiert nach Dateiname
      - Pro Datei: `SELECT 1 FROM schema_migrations WHERE migration = ?` — existiert der Eintrag, skip; sonst `PDO::exec()` des SQL-Inhalts in einer Transaktion, dann `INSERT INTO schema_migrations (migration) VALUES (?)`
      - Gibt pro Datei eine Zeile auf STDOUT aus (`applied: 002_create_users.sql` bzw. `skip (already applied): ...`)

## Doc-Updates

- [ ] `docs/PROJECT.md` Abschnitt „Nutzerverwaltung & Persistenz" — Verweis auf die jetzt verbindlichen DDLs ergänzen (ein Satz + Pfad auf `backend/src/Migrations/sql/`), Spalten-Typen müssen nicht dupliziert werden

## Report-Back
*(leer, wird beim Umsetzen befüllt)*
