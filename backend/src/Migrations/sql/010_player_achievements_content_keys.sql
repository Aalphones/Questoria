-- Erfolge sind seit Meilenstein 4, Phase 7 Content, nicht Datenbank (ADR-010):
-- der Katalog (Titel, Bild, Bedingung) steht in world_config.json. Eine
-- Tabelle achievements waere sonst eine zweite Wahrheitsquelle, und jede neue
-- Welt braeuchte einen Datenbank-Import, bevor ihre Erfolge existieren.
--
-- Warum eine eigene Migration statt einer Korrektur in 005/006: der Runner
-- ueberspringt bereits angewendete Dateien, eine Aenderung an 005/006 wuerde
-- auf einer laufenden Datenbank also nichts bewirken und Doku und Server
-- auseinanderlaufen lassen.
--
-- player_achievements zuerst neu aufbauen (haengt per Fremdschluessel an
-- achievements), erst danach kann achievements selbst weg.
DROP TABLE player_achievements;

CREATE TABLE player_achievements (
  profile_id INT UNSIGNED NOT NULL,
  theme_id VARCHAR(100) NOT NULL,
  achievement_key VARCHAR(100) NOT NULL,
  unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id, theme_id, achievement_key),
  CONSTRAINT fk_player_achievements_profile
    FOREIGN KEY (profile_id) REFERENCES player_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE achievements;
