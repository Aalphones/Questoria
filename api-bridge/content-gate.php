<?php

declare(strict_types=1);

// Bruecke im ausgelieferten Bereich, Gegenstueck zu index.php: Der Programmcode
// liegt eine Ebene darueber, ausserhalb dessen, was der Webserver herausgibt.
// Diese Datei landet auf dem Server unter public/api/content-gate.php und ist
// das Ziel der Umschreibe-Regel in public/content/.htaccess.
require __DIR__ . '/../../backend/public/content-gate.php';
