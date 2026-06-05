@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo 尚未建置：請先在此資料夾執行 npm run build
  echo No dist\index.html — run npm run build first.
  pause
  exit /b 1
)
echo.
echo 以本機 HTTP 開啟（Chrome 不支援直接雙擊 file:/// 的 ES module）
echo Opening http://127.0.0.1:4174 — close this window to stop the server.
echo (Use npm run preview:open for port 4173.)
echo.
call npm run preview:open4174
