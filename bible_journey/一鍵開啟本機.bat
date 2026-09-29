@echo off
chcp 65001 >nul
title 聖經跑道 · 本機開啟
cd /d "%~dp0"

echo.
echo ========================================
echo   聖經跑道 — 一鍵啟動本機預覽
echo ========================================
echo.
echo 請等畫面出現 Local: http://localhost:5173
echo 然後用瀏覽器打開上面的網址。
echo.
echo 不要關閉這個黑色視窗（關掉＝網站關掉）
echo 按 Ctrl+C 可停止。
echo ========================================
echo.

if not exist "package.json" (
  echo [錯誤] 找不到 package.json
  echo 請確認此檔案放在 bible_journey 資料夾內。
  pause
  exit /b 1
)

call npm run dev -- --host
pause
