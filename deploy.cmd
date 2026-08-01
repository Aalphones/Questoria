@echo off
rem ==========================================================================
rem  Questoria - hochladen per Doppelklick.
rem    deploy.cmd            Backend und Frontend
rem    deploy.cmd backend    nur das Backend
rem    deploy.cmd frontend   nur das Frontend
rem ==========================================================================
setlocal
chcp 65001 >nul
title Questoria Deploy
cd /d "%~dp0"

set "TARGET=%~1"
if not defined TARGET set "TARGET=all"

if /i "%TARGET%"=="all" goto :targetOk
if /i "%TARGET%"=="backend" goto :targetOk
if /i "%TARGET%"=="frontend" goto :targetOk
echo [FEHLER] Unbekanntes Ziel "%TARGET%".
echo          Erlaubt sind: backend, frontend, oder gar keine Angabe.
goto :fail

:targetOk
if exist "deploy.env" goto :configFound
echo [FEHLER] Die Datei deploy.env fehlt.
echo          Kopiere deploy.env.example nach deploy.env und trage deine
echo          Zugangsdaten ein.
goto :fail

:configFound
rem Einlesen bewusst ohne "delayed expansion": die wuerde ein Ausrufezeichen
rem im Passwort verschlucken. Ab dem setlocal darunter ist sie an, damit
rem Werte mit & ^| < > beim Schreiben nicht als Befehle gelesen werden.
for /f "usebackq eol=# tokens=1,* delims==" %%A in ("deploy.env") do set "%%A=%%B"

setlocal enabledelayedexpansion

if not defined FRONTEND_DIST set "FRONTEND_DIST=frontend\dist\frontend\browser"
if not defined APP_ENV set "APP_ENV=production"
if not defined DB_PORT set "DB_PORT=3306"

set "MISSING="
call :needValue WINSCP_PATH
call :needValue SFTP_PROTOCOL
call :needValue SFTP_HOST
call :needValue SFTP_USER
call :needValue SFTP_PASSWORD
call :needValue REMOTE_API_PATH
call :needValue REMOTE_APP_PATH
call :needValue DB_HOST
call :needValue DB_NAME
call :needValue DB_USER
call :needValue JWT_SECRET
call :needValue CORS_ORIGINS
if defined MISSING goto :fail

if exist "!WINSCP_PATH!" goto :winscpFound
echo [FEHLER] WinSCP wurde nicht gefunden:
echo          !WINSCP_PATH!
echo          Gebraucht wird WinSCP.com, nicht WinSCP.exe.
goto :fail

:winscpFound
if /i not "!SFTP_PROTOCOL!"=="sftp" goto :protocolOk
if defined SFTP_HOSTKEY goto :protocolOk
echo [FEHLER] SFTP_HOSTKEY fehlt in deploy.env.
echo          WinSCP einmal von Hand starten, verbinden, den angezeigten
echo          Fingerabdruck in deploy.env eintragen.
goto :fail

:protocolOk
set "DO_BACKEND="
set "DO_FRONTEND="
if /i "!TARGET!"=="all" set "DO_BACKEND=1"
if /i "!TARGET!"=="all" set "DO_FRONTEND=1"
if /i "!TARGET!"=="backend" set "DO_BACKEND=1"
if /i "!TARGET!"=="frontend" set "DO_FRONTEND=1"

if not defined DO_BACKEND goto :backendReady

echo [1/5] backend\.env schreiben ...
> "backend\.env" echo APP_ENV=!APP_ENV!
>>"backend\.env" echo DB_HOST=!DB_HOST!
>>"backend\.env" echo DB_PORT=!DB_PORT!
>>"backend\.env" echo DB_NAME=!DB_NAME!
>>"backend\.env" echo DB_USER=!DB_USER!
>>"backend\.env" echo DB_PASS=!DB_PASS!
>>"backend\.env" echo JWT_SECRET=!JWT_SECRET!
>>"backend\.env" echo CORS_ORIGINS=!CORS_ORIGINS!

where composer >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] composer wurde nicht gefunden.
    echo          Erwartet wird C:\Tools\composer\composer.bat im Suchpfad.
    echo          Nach einer frischen Installation hilft: Fenster schliessen
    echo          und neu oeffnen - der Suchpfad wird erst dann neu gelesen.
    goto :fail
)

echo [2/5] Abhaengigkeiten holen (ohne Entwicklungswerkzeuge) ...
call composer install --working-dir=backend --no-dev --optimize-autoloader --no-interaction
if errorlevel 1 (
    echo [FEHLER] composer install ist fehlgeschlagen. Es wird nichts hochgeladen.
    goto :fail
)

:backendReady
if not defined DO_FRONTEND goto :frontendReady
if exist "frontend\package.json" goto :buildFrontend
echo [HINWEIS] Es gibt noch kein Frontend - dieser Teil wird ausgelassen.
set "DO_FRONTEND="
goto :frontendReady

:buildFrontend
where npm >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] npm wurde nicht gefunden. Ohne Node.js kann das Frontend
    echo          nicht gebaut werden.
    goto :fail
)

echo [3/5] Frontend bauen ...
call npm --prefix frontend run build
if errorlevel 1 (
    echo [FEHLER] Der Frontend-Build ist fehlgeschlagen. Es wird nichts hochgeladen.
    goto :fail
)
if exist "!FRONTEND_DIST!" goto :frontendReady
echo [FEHLER] Der gebaute Ordner fehlt:
echo          !FRONTEND_DIST!
echo          Trage in deploy.env unter FRONTEND_DIST den echten Ausgabepfad ein.
goto :fail

:frontendReady
if defined DO_BACKEND goto :writeScript
if defined DO_FRONTEND goto :writeScript
echo [FEHLER] Es bleibt nichts zu tun.
goto :fail

:writeScript
set "WINSCP_SCRIPT=%TEMP%\questoria-deploy-%RANDOM%%RANDOM%.txt"
> "!WINSCP_SCRIPT!" echo option batch abort
>>"!WINSCP_SCRIPT!" echo option confirm off
>>"!WINSCP_SCRIPT!" echo option transfer binary
rem Zugangsdaten bewusst als eigene Schalter, nicht in der Adresse: ein # oder /
rem im Passwort wuerde die Adresse zerschneiden, ein ^| sogar die Skriptzeile.
if /i "!SFTP_PROTOCOL!"=="sftp" goto :openSftp
>>"!WINSCP_SCRIPT!" echo open !SFTP_PROTOCOL!://!SFTP_HOST!/ -username="!SFTP_USER!" -password="!SFTP_PASSWORD!"
goto :openWritten
:openSftp
>>"!WINSCP_SCRIPT!" echo open sftp://!SFTP_HOST!/ -username="!SFTP_USER!" -password="!SFTP_PASSWORD!" -hostkey="!SFTP_HOSTKEY!"
:openWritten

rem logs/ bleibt ausgespart: dort schreibt der Server, ein -delete wuerde die
rem Protokolle bei jedem Lauf loeschen. .env.example gehoert nicht auf den Server.
if defined DO_BACKEND (
    >>"!WINSCP_SCRIPT!" echo synchronize remote -delete -filemask="^|.env.example;logs/;.php-cs-fixer.php" "backend" "!REMOTE_API_PATH!"
)
if defined DO_FRONTEND (
    >>"!WINSCP_SCRIPT!" echo synchronize remote -delete "!FRONTEND_DIST!" "!REMOTE_APP_PATH!"
)
>>"!WINSCP_SCRIPT!" echo close
>>"!WINSCP_SCRIPT!" echo exit

echo [4/5] Verbinden und hochladen ...
"!WINSCP_PATH!" /ini=nul /script="!WINSCP_SCRIPT!"
set "WINSCP_EXIT=!ERRORLEVEL!"
del "!WINSCP_SCRIPT!" >nul 2>&1

if "!WINSCP_EXIT!"=="0" goto :done
echo.
echo [FEHLER] WinSCP hat abgebrochen, Code !WINSCP_EXIT!.
echo          Der Server ist eventuell nur halb aktualisiert.
echo          Meist liegt es am Passwort, am Fingerabdruck oder an einem
echo          falschen Zielpfad in deploy.env.
goto :fail

:done
echo.
echo [5/5] Fertig, alles ist oben.
if defined DO_BACKEND echo          Backend  nach !REMOTE_API_PATH!
if defined DO_FRONTEND echo          Frontend nach !REMOTE_APP_PATH!
echo.
echo          Probe: die Adresse der API mit /api/health aufrufen.
echo          db_connected muss true sein - steht dort false, stimmen die
echo          Datenbankwerte in deploy.env nicht.
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1

:needValue
if not defined %~1 (
    echo [FEHLER] In deploy.env fehlt ein Wert: %~1
    set "MISSING=1"
)
exit /b 0
