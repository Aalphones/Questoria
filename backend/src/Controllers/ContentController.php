<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\ContentService;

final class ContentController
{
    public function themes(): array
    {
        return (new ContentService())->themes();
    }

    public function world(string $themeId): array
    {
        return (new ContentService())->world($themeId);
    }

    public function episode(string $themeId, string $episodeId): array
    {
        return (new ContentService())->episode($themeId, $episodeId);
    }
}
