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
