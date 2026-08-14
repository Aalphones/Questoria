<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\ApiException;

final class ContentService
{
    private const ID_PATTERN = '/^[a-z0-9_]{1,64}$/';

    public function themes(): array
    {
        return $this->readJson($this->rootPath() . '/main_hub.json');
    }

    public function world(string $themeId): array
    {
        $this->assertValidId($themeId);

        return $this->readJson($this->themePath($themeId) . '/world_config.json');
    }

    public function episode(string $themeId, string $episodeId): array
    {
        $this->assertValidId($themeId);
        $this->assertValidId($episodeId);

        return $this->readJson($this->themePath($themeId) . '/episodes/' . $episodeId . '.json');
    }

    private function rootPath(): string
    {
        return $_ENV['CONTENT_PATH'] ?? ($_SERVER['DOCUMENT_ROOT'] . '/content');
    }

    private function themePath(string $themeId): string
    {
        $root = $this->rootPath();
        $realRoot = realpath($root);
        $path = $root . '/themes/' . $themeId;
        $realPath = realpath($path);

        // Die ID-Pruefung allein reicht formal schon aus, um ../ & Co.
        // auszuschliessen - der zweite Riegel steht, weil eine spaetere
        // Aufweichung des Musters (z.B. Punkte fuer Versionsnummern) sonst
        // still ein Verzeichnis-Traversal-Loch aufreisst.
        if ($realRoot === false || $realPath === false || !str_starts_with($realPath, $realRoot . DIRECTORY_SEPARATOR)) {
            // Trennzeichen bewusst mitgeprueft: ohne das wuerde ein Nachbarordner
            // wie "data-oeffentlich" faelschlich als "innerhalb von data"
            // durchgehen, weil er als String mit "data" beginnt.
            throw new ApiException(404, 'Not Found');
        }

        return $realPath;
    }

    private function assertValidId(string $id): void
    {
        if (preg_match(self::ID_PATTERN, $id) !== 1) {
            // Eine erfundene ID verhaelt sich wie ein nicht existierender Ort
            // (404), nicht wie ein Formularfehler (400).
            throw new ApiException(404, 'Not Found');
        }
    }

    private function readJson(string $path): array
    {
        if (!is_file($path)) {
            throw new ApiException(404, 'Not Found');
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new ApiException(404, 'Not Found');
        }

        $decoded = json_decode($contents, true);

        if (!is_array($decoded)) {
            throw new ApiException(404, 'Not Found');
        }

        return $decoded;
    }
}
