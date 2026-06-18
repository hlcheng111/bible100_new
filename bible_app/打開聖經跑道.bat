@echo off
chcp 65001 >nul
title 聖經跑道 · 一鍵開啟
cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════
echo   聖經跑道 · 正在自動準備（無需其他操作）
echo  ═══════════════════════════════════════
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\ensure_bible_db.ps1"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

set "REPO_ROOT=%~dp0.."
set "ENTRY_URL=http://127.0.0.1:3000/bible_app/"
set "PROBE_URL=http://127.0.0.1:3000/bible_app/shell/js/probe.js"
set "SERVE_RETRY=0"

:startserve
cd /d "%REPO_ROOT%"
echo [啟動] 本機服務中（首次可能需下載元件，請稍候 10～30 秒）…
start "聖經跑道伺服器" /min cmd /c "cd /d "%REPO_ROOT%" && npx --yes serve . -l 3000"

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
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\open_shell_browser.ps1" -Url "%ENTRY_URL%"

echo.
echo  已開啟：%ENTRY_URL%
echo  請只雙擊「聖經跑道一鍵開啟.vbs」進入；勿手改網址。
echo  關閉「聖經跑道伺服器」視窗可停止服務。
echo.
exit /b 0
