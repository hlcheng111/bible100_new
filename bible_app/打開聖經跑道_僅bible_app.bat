@echo off
chcp 65001 >nul
title 聖經跑道 · 緊急回滾（僅 bible_app serve）
cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════
echo   聖經跑道 · 舊版 serve（僅 bible_app 資料夾）
echo   AI 補給站可能無法連線；跑道本體優先
echo  ═══════════════════════════════════════
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\ensure_bible_db.ps1"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

set "SHELL_URL=http://127.0.0.1:3000/shell/index.html"
set "PROBE_URL=http://127.0.0.1:3000/shell/js/probe.js"
set "SERVE_RETRY=0"

:startserve
echo [啟動] 本機服務中（根目錄 = bible_app）…
start "聖經跑道伺服器" /min cmd /c "cd /d "%~dp0" && npx --yes serve . -l 3000"

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\wait_server_probe.ps1" -ProbeUrl "%PROBE_URL%" -MaxAttempts 25 -SleepSeconds 2
if %ERRORLEVEL%==0 goto ready

if "%SERVE_RETRY%"=="0" (
  echo [重試] 服務未就緒，正在自動重啟一次…
  set "SERVE_RETRY=1"
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
  ping -n 3 127.0.0.1 >nul
  goto startserve
)

echo [提示] 服務啟動較慢，仍嘗試開啟瀏覽器…

:ready
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\open_shell_browser.ps1" -Url "%SHELL_URL%"

echo.
echo  已開啟：%SHELL_URL%
echo  關閉「聖經跑道伺服器」視窗可停止服務。
echo.
exit /b 0
