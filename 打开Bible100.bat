@echo off
chcp 65001 >nul
title Bible100 · 总站
cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════
echo   Bible100 总站 · 正在打开（四语经库可用）
echo  ═══════════════════════════════════════
echo.

if exist "bible_app\scripts\ensure_bible_db.ps1" (
  powershell -ExecutionPolicy Bypass -File "bible_app\scripts\ensure_bible_db.ps1"
)

set "PORT=8080"
set "PROBE=http://127.0.0.1:%PORT%/js/site_http_probe.js"
set "ENTRY=http://127.0.0.1:%PORT%/index_v5.html?v=20260813http"

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start_site_http.ps1" -Port %PORT%

powershell -ExecutionPolicy Bypass -File "%~dp0bible_app\scripts\wait_server_probe.ps1" -ProbeUrl "%PROBE%" -MaxAttempts 25 -SleepSeconds 2
if %ERRORLEVEL% neq 0 (
  echo [提示] 服务启动较慢，仍尝试打开浏览器…
)

if exist "%~dp0bible_app\scripts\open_shell_browser.ps1" (
  powershell -ExecutionPolicy Bypass -File "%~dp0bible_app\scripts\open_shell_browser.ps1" -Url "%ENTRY%"
) else (
  start "" "%ENTRY%"
)

echo.
echo  已打开：%ENTRY%
echo  关闭最小化的 serve 窗口可停止本机服务。
echo.
exit /b 0
