# Normalize EOLs to CRLF across the project and remove BOM/NBSP
$ErrorActionPreference = 'Stop'

$root = "c:\Users\hlche\.cursor\bible100_new"
$backupDir = Join-Path $root "tools\backup_eol_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$patterns = @('*.html','*.css','*.js','*.json','*.txt','*.md','*.py')
$files = @()
foreach ($p in $patterns) { $files += Get-ChildItem -Path $root -Filter $p -Recurse -File }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$processed = 0
foreach ($f in $files) {
  try {
    # backup
    $rel = $f.FullName.Substring($root.Length).TrimStart('\')
    $targetBackupPath = Join-Path $backupDir $rel
    $targetBackupDir = Split-Path $targetBackupPath -Parent
    if (-not (Test-Path $targetBackupDir)) { New-Item -ItemType Directory -Force -Path $targetBackupDir | Out-Null }
    Copy-Item -Path $f.FullName -Destination $targetBackupPath -Force

    # read as string (UTF8)
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)

    # remove leading BOM if any
    if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
      $content = $content.Substring(1)
    }

    # replace NBSP with normal spaces
    $content = $content -replace ([char]0x00A0), ' '

    # normalize EOLs: unify to LF first, then to CRLF
    $content = $content -replace "`r`n", "`n"
    $content = $content -replace "`r", "`n"
    $content = $content -replace "`n", "`r`n"

    # write back with UTF8 (no BOM)
    [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
    $processed++
  } catch {
    Write-Warning "Failed to process: $($f.FullName). Error: $($_.Exception.Message)"
  }
}

Write-Host "Normalized EOL + removed BOM/NBSP for $processed files. Backup at: $backupDir"