-- Nachzug zum Architekturschnitt vom 14.08.2026 (docs/decisions/004-event-engine.md):
-- "Minispiel" heisst jetzt Gameplay-Event. Die Spalte zaehlt abgeschlossene Events.
--
-- Warum eine eigene Migration statt einer Korrektur in 007: der Runner ueberspringt
-- bereits angewendete Dateien, eine Aenderung an 007 wuerde auf einer laufenden
-- Datenbank also nichts bewirken und Doku und Server auseinanderlaufen lassen.
--
-- CHANGE statt RENAME COLUMN, weil RENAME COLUMN erst ab MySQL 8.0 / MariaDB 10.5.2
-- existiert und die Serverversion nicht festgeschrieben ist. Die Spaltendefinition
-- muss dabei wiederholt werden — sie ist identisch zu 007.
ALTER TABLE statistics
  CHANGE minigames_completed events_completed INT UNSIGNED NOT NULL DEFAULT 0;
