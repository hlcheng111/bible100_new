# Pre-cleanup backup: data/cj + hymn_management/hymn only
# Usage: .\scripts\backup_pre_cleanup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupRoot = Join-Path $ProjectRoot "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFolder = Join-Path $BackupRoot "pre_cleanup_$Timestamp"

$Targets = @(
    @{ Src = Join-Path $ProjectRoot "data\cj"; Dst = Join-Path $BackupFolder "data_cj" },
    @{ Src = Join-Path $ProjectRoot "hymn_management\hymn"; Dst = Join-Path $BackupFolder "hymn_management_hymn" }
)

New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
Write-Host "Pre-cleanup backup -> $BackupFolder"

foreach ($t in $Targets) {
    if (-not (Test-Path $t.Src)) {
        Write-Host "SKIP (missing): $($t.Src)"
        continue
    }
    Write-Host "Copying $($t.Src) ..."
    New-Item -ItemType Directory -Path $t.Dst -Force | Out-Null
    $robocopy = Start-Process -FilePath "robocopy" -ArgumentList @(
        $t.Src, $t.Dst, "/E", "/COPY:DAT", "/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS"
    ) -Wait -PassThru -NoNewWindow
    if ($robocopy.ExitCode -ge 8) {
        Write-Host "Robocopy failed (exit $($robocopy.ExitCode)): $($t.Src)"
        exit 1
    }
    $n = (Get-ChildItem -Path $t.Dst -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Host "  -> $n files (robocopy exit $($robocopy.ExitCode))"
}

Write-Host "Done: $BackupFolder"
