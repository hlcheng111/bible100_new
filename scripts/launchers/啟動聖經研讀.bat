@echo off
chcp 65001 >nul
title 聖經研讀 - 啟動本地伺服器
cd /d "%~dp0"

echo.
echo ============================================
echo   聖經研讀 Bible Study - 本地伺服器
echo ============================================
echo.
echo 正在啟動 HTTP 伺服器...
echo.
echo 瀏覽器將自動開啟：http://127.0.0.1:8080/bible_study/
echo 關閉此視窗即停止伺服器。
echo ============================================
echo.

:: 延遲 2 秒後自動開瀏覽器（伺服器會在背景啟動）
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:8080/bible_study/?frame=comprehensive_exegesis_reader.html"

:: 啟動 Python 伺服器（佔用此視窗，關閉即停止）
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 Python，請先安裝 Python 3
    echo 下載：https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
