# Auto fix paste issues: normalize EOL to CRLF, remove BOM/zero-width/NBSP,
# trim trailing spaces, and collapse multiple blank lines.
$ErrorActionPreference = 'Stop'

$root = "c:\Users\hlche\.cursor\bible100_new"
$backupDir = Join-Path $root "tools\backup_pastefix_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
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

    # read as UTF-8 text
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)

    # remove BOM if present
    if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
      $content = $content.Substring(1)
    }

    # strip zero-width characters and NBSP
    $zwChars = @([char]0x200B, [char]0x200C, [char]0x200D, [char]0x2060)
    foreach ($ch in $zwChars) { $content = $content -replace [string]$ch, '' }
    $content = $content -replace ([char]0x00A0), ' '

    # normalize EOL: unify to LF then to CRLF
    $content = $content -replace "\r\n", "\n"
    $content = $content -replace "\r", "\n"

    # trim trailing spaces on each line
    $lines = $content -split "\n"
    $lines = $lines | ForEach-Object { $_ -replace "\s+$", "" }
    $content = [string]::Join("\n", $lines)

    # collapse multiple blank lines to a single blank line
    $content = $content -replace "(\n){3,}", "\n\n"

    # finally convert to CRLF
    $content = $content -replace "\n", "\r\n"

    # write back UTF-8 without BOM
    [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
    $processed++
  } catch {
    Write-Warning "Failed to process: $($f.FullName). Error: $($_.Exception.Message)"
  }
}

Write-Host "Auto paste fix applied to $processed files. Backup at: $backupDir"
