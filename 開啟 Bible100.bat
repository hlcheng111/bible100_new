@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 以瀏覽器開啟本機 index（無需 localhost）...
start "" "%~dp0index.html"
exit /b 0
