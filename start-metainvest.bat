@echo off
title MetaInvest Launcher
cd /d "%~dp0"

echo ========================================
echo    Iniciando MetaInvest...
echo ========================================
echo.

echo [1/3] Iniciando backend (porta 3001)...
start "MetaInvest - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Iniciando frontend (porta 5173)...
start "MetaInvest - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Abrindo navegador...
start "" "http://localhost:5173"

echo.
echo ========================================
echo    MetaInvest iniciado com sucesso!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Para encerrar, feche as janelas do
echo backend e do frontend.
echo.
timeout /t 5 /nobreak >nul
exit