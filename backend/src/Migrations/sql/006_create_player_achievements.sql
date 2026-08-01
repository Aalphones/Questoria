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
