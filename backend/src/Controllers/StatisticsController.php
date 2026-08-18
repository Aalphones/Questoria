<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\RequestBody;
use App\Repositories\ProfileRepository;
use App\Repositories\StatisticsRepository;
use App\Validators\StatisticsValidator;

/**
 * Vier Zahlen pro Welt und Profil, die ueber alle Laeufe hinweg wachsen. Das
 * Frontend zaehlt einen Lauf zu Ende, dieses Backend addiert nur noch
 * (Plan-README, Kontrakt "Erfolge und Statistiken").
 */
final class StatisticsController
{
    private readonly ProfileRepository $profiles;

    private readonly StatisticsRepository $statistics;

    public function __construct(private readonly array $authenticatedUser)
    {
        $this->profiles = new ProfileRepository();
        $this->statistics = new StatisticsRepository();
    }

    public function index(string $profileId): array
    {
        $id = $this->requireOwnProfile((int) $profileId);

        return ['statistics' => array_map($this->mapStatistics(...), $this->statistics->allForProfile($id))];
    }

    public function addDeltas(string $profileId, string $themeId): array
    {
        $id = $this->requireOwnProfile((int) $profileId);
        $delta = (new StatisticsValidator())->validateAdd(RequestBody::json());

        $row = $this->statistics->addDeltas(
            $id,
            $themeId,
            $delta['run_id'],
            $delta['events_completed'],
            $delta['correct_answers'],
            $delta['wrong_answers'],
            $delta['playtime_minutes'],
        );

        return ['statistics' => $this->mapStatistics($row)];
    }

    private function requireOwnProfile(int $profileId): int
    {
        if ($this->profiles->findForUser($profileId, (int) $this->authenticatedUser['id']) === null) {
            // Bewusst 404, nicht 403 — ein fremdes Profil soll sich nicht
            // einmal als existierend verraten (Plan-README, Kontrakt Profile).
            throw new ApiException(404, 'Profil nicht gefunden');
        }

        return $profileId;
    }

    /**
     * @param array<string, mixed> $row
     */
    private function mapStatistics(array $row): array
    {
        return [
            'theme_id' => (string) $row['theme_id'],
            'events_completed' => (int) $row['events_completed'],
            'correct_answers' => (int) $row['correct_answers'],
            'wrong_answers' => (int) $row['wrong_answers'],
            'playtime_minutes' => (int) $row['playtime_minutes'],
            'updated_at' => $row['updated_at'] === null ? null : (string) $row['updated_at'],
        ];
    }
}
