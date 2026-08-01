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
