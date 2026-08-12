@echo off
cd /d "%~dp0"
echo Starting hymn-data-server on http://127.0.0.1:8765
node scripts\hymn-data-server.js
pause
