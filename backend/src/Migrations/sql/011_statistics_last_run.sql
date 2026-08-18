-- Schutz gegen Doppelzaehlung (Plan-README, Kontrakt Statistiken, das 🟡):
-- Zuwaechse werden addiert statt gesetzt, und Addieren ist nicht wiederholbar.
-- Diese Spalte merkt sich pro Profil und Welt die zuletzt verbuchte
-- Lauf-Kennung — kommt derselbe Lauf ein zweites Mal (Puffer nach totem
-- Server), wird nichts noch einmal addiert.
--
-- Warum eine eigene Migration statt einer Korrektur in 007: der Runner
-- ueberspringt bereits angewendete Dateien, eine Aenderung an 007 wuerde auf
-- einer laufenden Datenbank also nichts bewirken und Doku und Server
-- auseinanderlaufen lassen.
ALTER TABLE statistics
  ADD COLUMN last_run_id VARCHAR(64) NULL AFTER playtime_minutes;
