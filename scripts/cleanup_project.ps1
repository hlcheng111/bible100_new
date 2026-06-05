# Bible100 專案清理腳本
# 移除：__pycache__、*.pyc、*.log、.DS_Store 等冗餘檔
# 使用方式：在專案根目錄執行 .\scripts\cleanup_project.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Bible100 專案清理 ===" -ForegroundColor Cyan
Write-Host "專案路徑: $ProjectRoot"

$removed = 0

# 1. 移除 __pycache__
$pycache = Get-ChildItem $ProjectRoot -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
foreach ($d in $pycache) {
    Remove-Item $d.FullName -Recurse -Force
    Write-Host "  已移除: $($d.FullName)"
    $removed++
}

# 2. 移除 *.pyc
$pyc = Get-ChildItem $ProjectRoot -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
foreach ($f in $pyc) {
    Remove-Item $f.FullName -Force
    Write-Host "  已移除: $($f.FullName)"
    $removed++
}

# 3. 移除 *.log（根目錄及常見位置）
$logs = Get-ChildItem $ProjectRoot -Recurse -Filter "*.log" -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 10MB }
foreach ($f in $logs) {
    Remove-Item $f.FullName -Force
    Write-Host "  已移除: $($f.FullName)"
    $removed++
}

# 4. 移除 .DS_Store
$ds = Get-ChildItem $ProjectRoot -Recurse -Filter ".DS_Store" -Force -ErrorAction SilentlyContinue
foreach ($f in $ds) {
    Remove-Item $f.FullName -Force
    Write-Host "  已移除: $($f.FullName)"
    $removed++
}

# 5. 移除 Thumbs.db
$thumbs = Get-ChildItem $ProjectRoot -Recurse -Filter "Thumbs.db" -Force -ErrorAction SilentlyContinue
foreach ($f in $thumbs) {
    Remove-Item $f.FullName -Force
    Write-Host "  已移除: $($f.FullName)"
    $removed++
}

Write-Host "`n清理完成，共移除 $removed 項。" -ForegroundColor Green
Write-Host "（backups/ 保留，如需精簡請手動處理）"
