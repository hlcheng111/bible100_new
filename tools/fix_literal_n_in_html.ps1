# Convert literal backslash-n sequences to real newlines in HTML files only
# Safety: process files that contain many literal "\\n" (likely single-line HTML exports)
$ErrorActionPreference = 'Stop'

$root = "c:\Users\hlche\.cursor\bible100_new"
$backupDir = Join-Path $root "tools\backup_html_newlines_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Collect html files except backups
$files = Get-ChildItem -Path $root -Recurse -File -Filter "*.html" |
  Where-Object { $_.FullName -notmatch "\\tools\\backup_" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$processed = 0

foreach ($f in $files) {
  try {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)

    $literalCount = ([regex]::Matches($content, "\\n")).Count
    $hasCRLF = $content.Contains("`r`n")

    # Candidate: many literal \n present (>= 10)
    if ($literalCount -ge 10) {
      # backup
      $rel = $f.FullName.Substring($root.Length).TrimStart('\')
      $targetBackupPath = Join-Path $backupDir $rel
      $targetBackupDir = Split-Path $targetBackupPath -Parent
      if (-not (Test-Path $targetBackupDir)) { New-Item -ItemType Directory -Force -Path $targetBackupDir | Out-Null }
      Copy-Item -Path $f.FullName -Destination $targetBackupPath -Force

      # convert literal \n to real LF, normalize, then LF -> CRLF
      $content = $content -replace "\\n", "`n"
      $content = $content -replace "`r`n", "`n"
      $content = $content -replace "`r", "`n"
      $content = $content -replace "`n", "`r`n"

      [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
      $processed++
    }
  } catch {
    Write-Warning "Failed to process: $($f.FullName). Error: $($_.Exception.Message)"
  }
}

Write-Host "Converted literal \\n to real newlines for $processed HTML files. Backup at: $backupDir"
