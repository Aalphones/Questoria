<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Http\JsonResponse;
use App\Http\RequestBody;
use App\Repositories\ProfileRepository;
use App\Validators\ProfileValidator;

final class ProfileController
{
    private readonly ProfileRepository $profiles;

    public function __construct(private readonly array $authenticatedUser)
    {
        $this->profiles = new ProfileRepository();
    }

    public function index(): array
    {
        return ['profiles' => array_map($this->mapProfile(...), $this->profiles->allForUser($this->userId()))];
    }

    public function create(): array
    {
        $account = (new ProfileValidator())->validateCreate(RequestBody::json());
        $profile = $this->profiles->create($this->userId(), $account['display_name'], $account['avatar']);

        return ['profile' => $this->mapProfile($profile)];
    }

    public function update(string $profileId): array
    {
        $id = (int) $profileId;
        $fields = (new ProfileValidator())->validateUpdate(RequestBody::json());

        // Wirft 404 vor dem Schreiben — sonst waere ein Update auf ein fremdes
        // oder nicht existierendes Profil ein stiller no-op statt eines Fehlers.
        $this->requireOwnProfile($id);
        $this->profiles->update($id, $this->userId(), $fields);

        $profile = $this->profiles->findForUser($id, $this->userId());

        if ($profile === null) {
            throw new ApiException(404, 'Profil nicht gefunden');
        }

        return ['profile' => $this->mapProfile($profile)];
    }

    public function delete(string $profileId): never
    {
        $id = (int) $profileId;

        $this->requireOwnProfile($id);
        $this->profiles->delete($id, $this->userId());

        JsonResponse::noContent();
    }

    private function requireOwnProfile(int $profileId): void
    {
        if ($this->profiles->findForUser($profileId, $this->userId()) === null) {
            // Bewusst 404, nicht 403 — ein fremdes Profil soll sich nicht
            // einmal als existierend verraten (Plan-README, Kontrakt Profile).
            throw new ApiException(404, 'Profil nicht gefunden');
        }
    }

    private function userId(): int
    {
        return (int) $this->authenticatedUser['id'];
    }

    /**
     * @param array<string, mixed> $row
     * @return array{id: int, display_name: string, avatar: string|null, selected_theme: string|null, selected_level: string|null}
     */
    private function mapProfile(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'display_name' => (string) $row['display_name'],
            'avatar' => $row['avatar'] === null ? null : (string) $row['avatar'],
            'selected_theme' => $row['selected_theme'] === null ? null : (string) $row['selected_theme'],
            'selected_level' => $row['selected_level'] === null ? null : (string) $row['selected_level'],
        ];
    }
}
