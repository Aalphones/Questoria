@echo off
rem ==========================================================================
rem  Lokaler Entwicklungs-Server fuer das Backend.
rem  Beantwortet /api/... aus backend/public/index.php und /content/... direkt
rem  aus data/ (siehe dev-router.php). Nur fuer die Entwicklung, nie deployen.
rem ==========================================================================
cd /d "%~dp0.."

echo Questoria-Backend auf http://localhost:8000 - Strg+C zum Beenden.
C:\Users\sasch\develop\.tools\php.cmd -S localhost:8000 -t backend/public backend/dev-router.php
