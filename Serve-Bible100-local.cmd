@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo 用本機 HTTP 提供整個 bible100_new（含 index_v5 內嵌 iframe／church_planning/dist）
echo After start, open: http://127.0.0.1:8080/index_v5.html
echo (index_v5.htm also redirects to .html)
echo Press Ctrl+C to stop.
echo.
npx --yes serve . -l 8080
