@echo off
chcp 65001 >nul
title 聖經跑道 · 经总站打开
cd /d "%~dp0.."
call "%~dp0..\打开Bible100.bat"
exit /b 0
