@echo off
title MetaInvest - Encerrar
echo Encerrando MetaInvest...

taskkill /FI "WINDOWTITLE eq MetaInvest - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MetaInvest - Frontend*" /T /F >nul 2>&1

echo MetaInvest encerrado.
timeout /t 2 /nobreak >nul
exit