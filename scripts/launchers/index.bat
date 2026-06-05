@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: 雙擊即啟動：HTTP 伺服器 + 開啟瀏覽器（Chrome/Edge/Opera/Firefox 皆可）
start "Bible100 伺服器" cmd /k "echo 伺服器運行中，關閉此視窗即可停止。 & echo. & python -m http.server 8080"

timeout /t 2 /nobreak >nul

start "" "http://127.0.0.1:8080/languages/vi/NT/chapters/index.html"
