<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database\Connection;
use PDO;

final class StatisticsRepository
{
    private const SELECT_COLUMNS =
        'theme_id, events_completed, correct_answers, wrong_answers, playtime_minutes, updated_at';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function allForProfile(int $profileId): array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS . ' FROM statistics WHERE profile_id = :profile_id ORDER BY theme_id',
        );
        $statement->execute(['profile_id' => $profileId]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Addiert die vier Zuwaechse zum bestehenden Stand — ausser `runId` ist
     * derselbe, der zuletzt schon verbucht wurde: dann kommt dieselbe Antwort
     * ungeaendert zurueck (Plan-README, Kontrakt Statistiken, das 🟡).
     *
     * Kein Schreibschutz gegen echte Gleichzeitigkeit (kein `FOR UPDATE`):
     * an einem Profil spielt genau ein Kind auf einem Geraet, zwei Anfragen
     * fuer dieselbe Welt zur selben Millisekunde sind praktisch ausgeschlossen.
     */
    public function addDeltas(
        int $profileId,
        string $themeId,
        string $runId,
        int $eventsCompleted,
        int $correctAnswers,
        int $wrongAnswers,
        int $playtimeMinutes,
    ): array {
        $existing = $this->findForProfile($profileId, $themeId);

        if ($existing !== null && $existing['last_run_id'] === $runId) {
            return $existing;
        }

        $statement = Connection::pdo()->prepare(
            'INSERT INTO statistics'
            . ' (profile_id, theme_id, events_completed, correct_answers, wrong_answers, playtime_minutes, last_run_id)'
            . ' VALUES (:profile_id, :theme_id, :events_completed, :correct_answers, :wrong_answers, :playtime_minutes, :run_id)'
            . ' ON DUPLICATE KEY UPDATE'
            . ' events_completed = events_completed + VALUES(events_completed),'
            . ' correct_answers = correct_answers + VALUES(correct_answers),'
            . ' wrong_answers = wrong_answers + VALUES(wrong_answers),'
            . ' playtime_minutes = playtime_minutes + VALUES(playtime_minutes),'
            . ' last_run_id = VALUES(last_run_id)',
        );
        $statement->execute([
            'profile_id' => $profileId,
            'theme_id' => $themeId,
            'events_completed' => $eventsCompleted,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'playtime_minutes' => $playtimeMinutes,
            'run_id' => $runId,
        ]);

        return $this->findForProfile($profileId, $themeId) ?? [
            'theme_id' => $themeId,
            'events_completed' => $eventsCompleted,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'playtime_minutes' => $playtimeMinutes,
            'updated_at' => null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findForProfile(int $profileId, string $themeId): ?array
    {
        $statement = Connection::pdo()->prepare(
            'SELECT ' . self::SELECT_COLUMNS . ', last_run_id'
            . ' FROM statistics WHERE profile_id = :profile_id AND theme_id = :theme_id LIMIT 1',
        );
        $statement->execute(['profile_id' => $profileId, 'theme_id' => $themeId]);

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row === false ? null : $row;
    }
}
