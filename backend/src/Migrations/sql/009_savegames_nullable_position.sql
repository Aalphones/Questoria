-- Ein Spielstand entsteht schon, bevor eine Episode angefangen wurde: die
-- Wahl der Lernstufe allein legt einen an (Plan Phase 5, AK 5). Position und
-- Episode sind dann leer, nicht ein leerer String.
--
-- Warum eine eigene Migration statt einer Korrektur in 004: der Runner
-- ueberspringt bereits angewendete Dateien, eine Aenderung an 004 wuerde auf
-- einer laufenden Datenbank also nichts bewirken und Doku und Server
-- auseinanderlaufen lassen.
ALTER TABLE savegames
  MODIFY episode_id VARCHAR(100) NULL,
  MODIFY node_id VARCHAR(100) NULL;
