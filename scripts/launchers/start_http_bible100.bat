@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8080
echo ============================================
echo   Bible100 Start
echo   http://127.0.0.1:%PORT%/
echo   Opening browser in 2 seconds...
echo ============================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        echo [Error] Python not found. Install Python first.
        pause
        exit /b 1
    )
    set PYCMD=py
) else (
    set PYCMD=python
)

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:%PORT%/index.html"

%PYCMD% -m http.server %PORT%

echo.
pause
