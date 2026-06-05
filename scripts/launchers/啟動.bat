@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   Bible100 一鍵啟動
echo   專案目錄: %CD%
echo ============================================
echo.

:: 確認 Python 可用（先試 python，再試 py）
set PYCMD=python
where python >nul 2>&1 || set PYCMD=py
where %PYCMD% >nul 2>&1
if errorlevel 1 (
    echo 錯誤：找不到 Python。請安裝 Python 或確認已加入 PATH。
    pause
    exit /b 1
)

:: 啟動 HTTP 伺服器（新視窗，強制在專案目錄執行）
start "Bible100 HTTP Server" cmd /k "cd /d "%~dp0" && %PYCMD% -m http.server 8080"

:: 等待伺服器就緒
echo 正在啟動伺服器...
timeout /t 3 /nobreak >nul

:: 開啟瀏覽器
start http://localhost:8080/index.html

echo.
echo 已開啟瀏覽器。
echo 若無法連線，請確認「Bible100 HTTP Server」視窗已開啟且無錯誤。
echo 關閉伺服器請關閉該視窗。
echo.
pause
