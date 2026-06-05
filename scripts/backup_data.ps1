# Bible100 資料備份腳本
# 備份 data/ 目錄（.db、.json 及重要設定）到 backup_data_YYYYMMDD_HHMMSS
# 使用方式：在專案根目錄執行 .\scripts\backup_data.ps1 或 雙擊 run_backup_data.bat

$ErrorActionPreference = "Stop"
# 腳本在 bible100_new/scripts/ 下，專案根目錄 = 上一層
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DataPath = Join-Path $ProjectRoot "data"
$BackupRoot = Join-Path $ProjectRoot "backups"

if (-not (Test-Path $DataPath)) {
    Write-Host "Error: data path not found: $DataPath"
    exit 1
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFolder = Join-Path $BackupRoot "data_$Timestamp"

New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
Write-Host "Backing up data/ to $BackupFolder ..."

$err = $null
Copy-Item -Path $DataPath -Destination $BackupFolder -Recurse -Force -ErrorVariable err
if ($err) {
    Write-Host "Backup failed: $err"
    exit 1
}
$Count = (Get-ChildItem -Path $BackupFolder -Recurse -File).Count
Write-Host ('Done. Copied ' + $Count + ' files.')
