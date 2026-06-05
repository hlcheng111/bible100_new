@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: 啟動 HTTP 伺服器（新視窗）並開啟瀏覽器
start "Bible100 伺服器" cmd /k "echo 伺服器運行中，關閉此視窗即可停止。 & echo. & python -m http.server 8080"

:: 等待伺服器啟動
timeout /t 2 /nobreak >nul

:: 用預設瀏覽器開啟 vi NT 目錄（Chrome / Edge / Opera / Firefox 皆可）
start "" "http://127.0.0.1:8080/languages/vi/NT/chapters/index.html"
