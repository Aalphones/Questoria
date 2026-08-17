@echo off
rem ==========================================================================
rem  Lokaler Entwicklungs-Server fuer das Backend.
rem  Beantwortet /api/... aus backend/public/index.php und /content/... aus
rem  backend/public/content-gate.php - derselben Weiche wie auf dem Server, also
rem  auch lokal nur mit gueltigem Sitzungs-Cookie (siehe dev-router.php).
rem  Nur fuer die Entwicklung, nie deployen.
rem ==========================================================================
cd /d "%~dp0.."

echo Questoria-Backend auf http://localhost:8000 - Strg+C zum Beenden.
C:\Users\sasch\develop\.tools\php.cmd -S localhost:8000 -t backend/public backend/dev-router.php
