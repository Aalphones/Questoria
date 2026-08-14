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
        // Anker ist "themes/", nicht die Content-Wurzel: lokal ist "data/themes"
        // eine NTFS-Junction auf Google Drive (siehe AGENTS.md), und realpath()
        // loest Junctions auf ihr tatsaechliches Ziel (H:\...) auf - ein Anker
        // auf der Content-Wurzel wuerde jede echte Welt faelschlich als
        // Traversal werten, weil das aufgeloeste Ziel nicht mehr mit dem Pfad
        // von "data" beginnt. "themes/" wird bei jedem Aufruf frisch aufgeloest
        // und traegt die Junction-Aufloesung damit selbst mit.
        $themesRoot = $this->rootPath() . '/themes';
        $realThemesRoot = realpath($themesRoot);
        $path = $themesRoot . '/' . $themeId;
        $realPath = realpath($path);

        // Die ID-Pruefung allein reicht formal schon aus, um ../ & Co.
        // auszuschliessen - der zweite Riegel steht, weil eine spaetere
        // Aufweichung des Musters (z.B. Punkte fuer Versionsnummern) sonst
        // still ein Verzeichnis-Traversal-Loch aufreisst.
        if ($realThemesRoot === false || $realPath === false || !str_starts_with($realPath, $realThemesRoot . DIRECTORY_SEPARATOR)) {
            // Trennzeichen bewusst mitgeprueft: ohne das wuerde ein Nachbarordner
            // wie "themes-oeffentlich" faelschlich als "innerhalb von themes"
            // durchgehen, weil er als String mit "themes" beginnt.
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
