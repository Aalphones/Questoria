<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\ApiException;

/**
 * Liefert eine Datei aus dem Content-Verzeichnis aus — Bilder, Toene, Videos.
 *
 * Die gesamte Auslieferung liegt bewusst hier und nicht im Einstiegspunkt: Auf
 * dem Server geht der Weg ueber public/content-gate.php, beim lokalen
 * Entwickeln ueber dev-router.php. Zwei Kopien derselben Pfadpruefung waeren
 * genau die Art von Doppelung, bei der eine der beiden irgendwann still
 * schwaecher wird als die andere.
 */
final class ContentFileService
{
    // Zuordnung nach Endung statt ueber mime_content_type(): die Erkennung nach
    // Dateiinhalt braucht die Erweiterung "fileinfo", die auf geteiltem Hosting
    // nicht garantiert ist, und antwortet fuer .svg/.json regelmaessig mit
    // text/plain — der Browser zeigt ein solches Bild dann nicht an.
    private const MIME_TYPES = [
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'avif' => 'image/avif',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'mp3' => 'audio/mpeg',
        'ogg' => 'audio/ogg',
        'wav' => 'audio/wav',
        'm4a' => 'audio/mp4',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'vtt' => 'text/vtt',
        'json' => 'application/json',
        'woff2' => 'font/woff2',
        'woff' => 'font/woff',
        'ttf' => 'font/ttf',
        'txt' => 'text/plain',
    ];

    private const CACHE_SECONDS = 3600;

    public function serve(string $relativePath): never
    {
        $filePath = $this->resolve($relativePath);
        $lastModified = filemtime($filePath) ?: time();

        header('Content-Type: ' . $this->mimeType($filePath));
        // "private": Das Bild haengt an einer Sitzung und darf niemals in einem
        // gemeinsam genutzten Zwischenspeicher landen, aus dem es ein
        // Unangemeldeter bekaeme. Der Browser-Cache des angemeldeten Geraets
        // ist genau das, was die Weiche schnell genug macht.
        header('Cache-Control: private, max-age=' . self::CACHE_SECONDS);
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');

        if ($this->clientHasCurrentVersion($lastModified)) {
            http_response_code(304);

            exit;
        }

        header('Content-Length: ' . (string) filesize($filePath));
        readfile($filePath);

        exit;
    }

    /**
     * Prueft den angefragten Pfad und gibt den echten Pfad auf der Platte
     * zurueck. Wirft, bevor irgendein Byte gelesen wird.
     */
    private function resolve(string $relativePath): string
    {
        $segments = $this->segments($relativePath);
        $contentRoot = $this->rootPath();

        // Anker ist der oberste Ordner des angefragten Pfades, nicht die
        // Content-Wurzel: lokal ist "data/themes" eine NTFS-Junction auf Google
        // Drive (siehe AGENTS.md), und realpath() loest sie auf ihr echtes Ziel
        // (H:\...) auf. Ein Anker auf der Wurzel wuerde jede echte Weltdatei
        // faelschlich als Ausbruchsversuch werten. Dieselbe Ueberlegung wie in
        // ContentService::themePath().
        $anchor = count($segments) === 1
            ? realpath($contentRoot)
            : realpath($contentRoot . '/' . $segments[0]);

        $realPath = realpath($contentRoot . '/' . implode('/', $segments));

        if ($anchor === false || $realPath === false || !is_file($realPath)) {
            throw new ApiException(404, 'Not Found');
        }

        // Trennzeichen mitgeprueft: ohne das ginge ein Nachbarordner wie
        // "themes-oeffentlich" als "innerhalb von themes" durch, weil er als
        // Zeichenkette mit "themes" beginnt.
        if (!str_starts_with($realPath, rtrim($anchor, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR)) {
            throw new ApiException(403, 'Kein Zugriff');
        }

        return $realPath;
    }

    /**
     * @return list<string>
     */
    private function segments(string $relativePath): array
    {
        // Erster und schaerfster Riegel: Der Pfad wird in seine Teile zerlegt
        // und jeder Teil einzeln geprueft. Damit ist ein "..", ein absoluter
        // Pfad oder ein eingeschmuggeltes Nullbyte schon ausgeschlossen, bevor
        // das Dateisystem ueberhaupt gefragt wird. Die realpath()-Pruefung
        // darunter ist der zweite Riegel, kein Ersatz.
        $segments = array_values(array_filter(explode('/', str_replace('\\', '/', $relativePath))));

        if ($segments === []) {
            throw new ApiException(404, 'Not Found');
        }

        foreach ($segments as $segment) {
            if (preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]*$/', $segment) !== 1 || str_contains($segment, '..')) {
                // Faengt in einem Zug: "..", ".htaccess", ".env", Nullbytes und
                // jedes andere Zeichen, das in einem Dateinamen dieses Projekts
                // nichts zu suchen hat.
                throw new ApiException(403, 'Kein Zugriff');
            }
        }

        if ($segments[0] === '_authoring') {
            // Das Authoring-Werkzeug wandert nicht auf den Server, liegt lokal
            // aber unter demselben Ordner. Ueber die Weiche gehoert es nie
            // heraus — auch nicht an einen angemeldeten Betrachter.
            throw new ApiException(403, 'Kein Zugriff');
        }

        return $segments;
    }

    private function clientHasCurrentVersion(int $lastModified): bool
    {
        $sentHeader = $_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '';

        if (!is_string($sentHeader) || $sentHeader === '') {
            return false;
        }

        $knownVersion = strtotime($sentHeader);

        return $knownVersion !== false && $knownVersion >= $lastModified;
    }

    private function mimeType(string $filePath): string
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return self::MIME_TYPES[$extension] ?? 'application/octet-stream';
    }

    private function rootPath(): string
    {
        return $_ENV['CONTENT_PATH'] ?? ($_SERVER['DOCUMENT_ROOT'] . '/content');
    }
}
