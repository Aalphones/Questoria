<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\RequestBody;
use App\Repositories\ProfileRepository;
use App\Repositories\SavegameRepository;
use App\Validators\SavegameValidator;

final class SavegameController
{
    private readonly ProfileRepository $profiles;

    private readonly SavegameRepository $savegames;

    public function __construct(private readonly array $authenticatedUser)
    {
        $this->profiles = new ProfileRepository();
        $this->savegames = new SavegameRepository();
    }

    public function index(string $profileId): array
    {
        $id = $this->requireOwnProfile((int) $profileId);

        return ['savegames' => array_map($this->mapSavegame(...), $this->savegames->allForProfile($id))];
    }

    public function upsert(string $profileId, string $themeId): array
    {
        $id = $this->requireOwnProfile((int) $profileId);
        $savegame = (new SavegameValidator())->validateUpsert(RequestBody::json(), RequestBody::raw());

        $row = $this->savegames->upsert(
            $id,
            $themeId,
            $savegame['episode_id'],
            $savegame['node_id'],
            $savegame['state_json'],
        );

        return ['savegame' => $this->mapSavegame($row)];
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
    private function mapSavegame(array $row): array
    {
        return [
            'theme_id' => (string) $row['theme_id'],
            'episode_id' => $row['episode_id'] === null ? null : (string) $row['episode_id'],
            'node_id' => $row['node_id'] === null ? null : (string) $row['node_id'],
            // Als bereits fertiges JSON wieder eingesetzt: das Backend hat den
            // Inhalt nie gelesen und soll ihn auch beim Ausliefern nicht
            // umformen (ADR-009).
            'state' => json_decode((string) $row['game_state_json'], false),
            'updated_at' => $row['updated_at'] === null ? null : (string) $row['updated_at'],
        ];
    }
}
