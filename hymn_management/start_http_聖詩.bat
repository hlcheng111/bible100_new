@echo off
chcp 65001 >nul
cd /d "%~dp0.."

set PORT=8080
echo ============================================
echo   聖詩管理系統 - 本地 HTTP 伺服器
echo   根目錄: %cd%
echo.
echo   主頁:   http://127.0.0.1:%PORT%/hymn_management/
echo   模範頁: http://127.0.0.1:%PORT%/hymn_management/hymn_template.html
echo.
echo   若 404，試: http://127.0.0.1:%PORT%/bible100_new/hymn_management/
echo ============================================
echo.

if not exist "hymn_management\data\source-hymns.json" (
  echo [提示] 若詩歌為空，請先執行: cd C:/hymn/scripts ^&^& node extract-full.js --sample 20
  echo.
)

python --version >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 找不到 Python，請安裝 Python 或改用: npx serve
    pause
    exit /b 1
)

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:%PORT%/hymn_management/"
python -m http.server %PORT%
pause
