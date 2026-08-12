@echo off
cd /d "%~dp0app"
echo Building static web to dist\ ...
call npm run web:build
if errorlevel 1 exit /b 1
echo.
echo Open in browser: http://localhost:3000
echo Press Ctrl+C to stop.
call npm run web:serve
