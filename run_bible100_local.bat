@echo off
chcp 65001 >nul
title Bible100 local server
cd /d "%~dp0"

echo.
echo  Bible100 local server (port 3000)
echo  Opening: http://127.0.0.1:3000/index_v5.html
echo  Close this window to stop.
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

start "Bible100 server" /min cmd /c "cd /d "%~dp0" && npx --yes serve . -l 3000"

ping -n 6 127.0.0.1 >nul
start "" "http://127.0.0.1:3000/index_v5.html"

exit /b 0
