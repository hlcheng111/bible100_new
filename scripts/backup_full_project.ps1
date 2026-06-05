# Bible100 Full Project Backup (target under 4.5GB)
# Excludes: backups/, node_modules/, __pycache__/
# Output: bible100_new_backup_YYYYMMDD_HHmmss.zip

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ZipName = "bible100_new_backup_$Timestamp.zip"
$ZipPath = Join-Path $ProjectRoot $ZipName

Write-Host "=== Bible100 Full Project Backup ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot"
Write-Host "Output: $ZipName"

$TempDir = Join-Path $env:TEMP "bible100_backup_$Timestamp"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    Write-Host ""
    Write-Host "Copying files (excluding backups, node_modules, __pycache__)..."
    
    $robocopyArgs = @($ProjectRoot, $TempDir, "/E", "/XD", "backups", "node_modules", "__pycache__", ".git", "/XF", "*.pyc", "*.log", "/NFL", "/NDL", "/NJH", "/NJS")
    $result = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow
    
    if ($result.ExitCode -ge 8) {
        Write-Host "Robocopy exit code: $($result.ExitCode)" -ForegroundColor Yellow
    }
    
    $preSize = (Get-ChildItem $TempDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
    Write-Host "Size to compress: $([math]::Round($preSize, 2)) GB"
    
    Write-Host ""
    Write-Host "Compressing (may take several minutes)..."
    
    $7zPath = "C:\Program Files\7-Zip\7z.exe"
    if (Test-Path $7zPath) {
        & $7zPath a -tzip $ZipPath "$TempDir\*" -r
    } else {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($TempDir, $ZipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
    }
    
    $zipSize = (Get-Item $ZipPath).Length / 1GB
    Write-Host ""
    Write-Host "Backup complete: $ZipPath" -ForegroundColor Green
    Write-Host "Compressed size: $([math]::Round($zipSize, 2)) GB"
    
    if ($zipSize -gt 4.5) {
        Write-Host "Note: Exceeds 4.5GB. Consider excluding languages/ or data/." -ForegroundColor Yellow
    }
    
} finally {
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}
