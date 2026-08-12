@echo off
REM Sync bible100_new -> bible100_new_2 + audit + FTP delta list/ZIP
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\sync_cloud_pack_to_mirror.ps1"
if errorlevel 1 exit /b 1
powershell -ExecutionPolicy Bypass -File "scripts\audit_cloud_mirror.ps1"
if errorlevel 1 exit /b 1
powershell -ExecutionPolicy Bypass -File "scripts\build_ftp_upload_delta.ps1"
exit /b %ERRORLEVEL%
