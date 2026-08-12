@echo off
chcp 65001 >nul
title 聖經跑道 · 手機同網預覽
cd /d "%~dp0"

echo.
echo ========================================
echo   先建置 PWA，再開給手機同 Wi-Fi 用
echo ========================================
echo.
echo 步驟：建置完成後會顯示 Network 網址
echo 用手機連同一 Wi-Fi，瀏覽器打開那個 http://192...
echo ========================================
echo.

call npm run build:pwa
if errorlevel 1 (
  echo 建置失敗。若提示 Node 版本，請改用 Node 20+。
  pause
  exit /b 1
)

echo.
echo 正在啟動預覽（不要關視窗）...
call npx vite preview --host --port 4173
pause
