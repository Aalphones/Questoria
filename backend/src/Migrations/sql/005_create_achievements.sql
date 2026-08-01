CREATE TABLE achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  theme_id VARCHAR(100) NOT NULL,
  achievement_key VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  icon VARCHAR(255) NULL,
  UNIQUE KEY uniq_theme_key (theme_id, achievement_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
