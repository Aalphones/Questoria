<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\RequestBody;
use App\Repositories\AchievementRepository;
use App\Repositories\ProfileRepository;
use App\Validators\AchievementValidator;

/**
 * Verwaltet nur, WER WELCHEN Schlüssel WANN bekam — welche Erfolge es gibt und
 * wann sie erfüllt sind, weiß dieses Backend nicht (ADR-010, Plan-README
 * Kontrakt "Erfolge und Statistiken"). Die Auswertung macht das Frontend.
 */
final class AchievementController
{
    private readonly ProfileRepository $profiles;

    private readonly AchievementRepository $achievements;

    public function __construct(private readonly array $authenticatedUser)
    {
        $this->profiles = new ProfileRepository();
        $this->achievements = new AchievementRepository();
    }

    public function index(string $profileId): array
    {
        $id = $this->requireOwnProfile((int) $profileId);

        return ['achievements' => array_map($this->mapAchievement(...), $this->achievements->allForProfile($id))];
    }

    public function unlock(string $profileId): never
    {
        $id = $this->requireOwnProfile((int) $profileId);
        $achievement = (new AchievementValidator())->validateUnlock(RequestBody::json());

        $row = $this->achievements->unlock($id, $achievement['theme_id'], $achievement['achievement_key']);

        JsonResponse::send(201, ['achievement' => $this->mapAchievement($row)]);
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
    private function mapAchievement(array $row): array
    {
        return [
            'theme_id' => (string) $row['theme_id'],
            'achievement_key' => (string) $row['achievement_key'],
            'unlocked_at' => $row['unlocked_at'] === null ? null : (string) $row['unlocked_at'],
        ];
    }
}
