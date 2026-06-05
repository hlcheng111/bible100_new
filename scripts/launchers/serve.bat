@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo  HTTP root: %CD%
echo ========================================
echo.
echo 請在瀏覽器「網址列」貼上下面這一行 (http 開頭, 不是 C:\ ) :
echo.
echo    http://127.0.0.1:8000/smart_ministry/index.html
echo.
echo 若用 localhost 連不上, 請改用 127.0.0.1
echo ========================================
echo.
python -m http.server 8000
