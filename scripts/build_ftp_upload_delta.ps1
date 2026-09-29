# File-level FTP delta: ZIP with only changed files (paths preserved)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_upload_delta.ps1

param(
  [string]$Mirror = "C:\Users\hlche\.cursor\bible100_new_2",
  [switch]$SkipZip,
  [int]$KeepOutbox = 5
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "ftp_zip_common.ps1")
$Mirror = (Resolve-Path $Mirror).Path

function Get-FileManifest([string]$root) {
  $map = @{}
  Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length).TrimStart("\", "/").Replace("\", "/")
    if ($rel -match "^(_ftp_outbox/|\.cloud_mirror)") { return }
    $map[$rel] = @{
      size  = $_.Length
      mtime = $_.LastWriteTimeUtc.Ticks
    }
  }
  return $map
}

function Save-ManifestTsv([string]$path, $map) {
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($k in ($map.Keys | Sort-Object)) {
    $m = $map[$k]
    $lines.Add("$k|$($m.size)|$($m.mtime)")
  }
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($path, $lines, $utf8)
}

function Load-ManifestTsv([string]$path) {
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content $path -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }
    $p = $line.Split("|", 3)
    if ($p.Count -lt 3) { return }
    $map[$p[0]] = @{ size = [int64]$p[1]; mtime = [int64]$p[2] }
  }
  return $map
}

function Test-FileEntryDiff($a, $b) {
  if (-not $a -or -not $b) { return $true }
  return ([int64]$a.size -ne [int64]$b.size) -or ([int64]$a.mtime -ne [int64]$b.mtime)
}

$stamp = Get-Date -Format "yyyyMMdd_HHmm"
$manifestPath = Join-Path $Mirror ".cloud_mirror_file_manifest.tsv"
$legacyFolderManifest = Join-Path $Mirror ".cloud_mirror_folder_manifest.json"
$outbox = Join-Path $Mirror "_ftp_outbox"
$packRoot = Join-Path $outbox "delta_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_$stamp.zip"
$hintFile = Join-Path $outbox "FTP_$stamp.txt"

Write-Host "Scanning mirror files..." -ForegroundColor DarkCyan
$current = Get-FileManifest $Mirror
$prev = Load-ManifestTsv $manifestPath
$isFirst = $prev.Count -eq 0
$syncMeta = Join-Path $Mirror ".cloud_mirror_sync.json"
$baselineSeed = $isFirst -and ((Test-Path $syncMeta) -or (Test-Path $legacyFolderManifest))

$changed = New-Object System.Collections.Generic.List[string]
$deleted = New-Object System.Collections.Generic.List[string]

if ($baselineSeed) {
  Write-Host "Baseline: recording file fingerprints. No ZIP this run." -ForegroundColor Cyan
} elseif ($isFirst) {
  foreach ($k in $current.Keys) { [void]$changed.Add($k) }
} else {
  foreach ($k in $current.Keys) {
    if (Test-FileEntryDiff $current[$k] $prev[$k]) { [void]$changed.Add($k) }
  }
  foreach ($k in $prev.Keys) {
    if (-not $current.ContainsKey($k)) { [void]$deleted.Add($k) }
  }
}

$totalBytes = [int64]0
foreach ($rel in $changed) {
  $totalBytes += [int64]$current[$rel].size
}
$mb = [math]::Round($totalBytes / 1MB, 2)

$gitHash = "unknown"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
try {
  Push-Location $repo
  $h = git rev-parse --short HEAD 2>$null
  if ($h) { $gitHash = $h.Trim() }
} finally { Pop-Location }

New-Item -ItemType Directory -Path $outbox -Force | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding $false

if (-not $baselineSeed -and ($changed.Count -gt 0 -or $deleted.Count -gt 0)) {
  if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }
  New-Item -ItemType Directory -Path $htdocs -Force | Out-Null

  foreach ($rel in ($changed | Sort-Object)) {
    $src = Join-Path $Mirror ($rel.Replace("/", "\"))
    if (-not (Test-Path -LiteralPath $src)) { continue }
    $dst = Join-Path $htdocs ($rel.Replace("/", "\"))
    $dstDir = Split-Path $dst -Parent
    if ($dstDir -and -not (Test-Path $dstDir)) {
      New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $src -Destination $dst -Force
  }

  $pathLines = New-Object System.Collections.Generic.List[string]
  [void]$pathLines.Add("# Path list (reference) -> upload ALL inside htdocs/ to remote htdocs/")
  [void]$pathLines.Add("# stamp: $stamp | git: $gitHash | files: $($changed.Count) | ~${mb} MB")
  [void]$pathLines.Add("")
  foreach ($rel in ($changed | Sort-Object)) { [void]$pathLines.Add($rel) }
  [System.IO.File]::WriteAllLines((Join-Path $packRoot "PATHS.txt"), $pathLines, $utf8)

  if ($deleted.Count -gt 0) {
    $delLines = @("# Delete on remote htdocs/") + @($deleted | Sort-Object)
    [System.IO.File]::WriteAllLines((Join-Path $packRoot "PATHS_DELETE.txt"), $delLines, $utf8)
  }

  $readme = @(
    "Bible100 FTP delta $stamp",
    "Unzip -> open htdocs/ -> upload ALL inside to remote htdocs/",
    "Verify: https://bible100.lovestoblog.com/index_v5.html?v=$stamp"
  )

  if (-not $SkipZip -and $changed.Count -gt 0) {
    New-FtpZipPack -PackRoot $packRoot -ZipFile $zipFile -ReadmeLines $readme
  }
}

Save-ManifestTsv $manifestPath $current

$hint = @(
  "FTP $stamp",
  "ZIP: $zipFile",
  "Unzip to htdocs/ root (paths inside match site).",
  "Files changed: $($changed.Count) (~${mb} MB)"
)
if ($baselineSeed) {
  $hint = @(
    "FTP $stamp - BASELINE (no ZIP)",
    "File fingerprints saved. Cloud already uploaded = skip.",
    "After next code change + sync, look for FTP_yyyyMMdd_HHmm.zip here."
  )
} elseif ($changed.Count -eq 0 -and $deleted.Count -eq 0) {
  $hint = @("FTP $stamp - NO CHANGES", "Nothing to upload.")
}
[System.IO.File]::WriteAllLines($hintFile, $hint, $utf8)

Get-ChildItem $outbox -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^(FTP_|ftp_delta_|FTP_UPLOAD_|delta_)' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip ($KeepOutbox * 2) |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== FTP pack $stamp ===" -ForegroundColor Green
if (Test-Path $zipFile) {
  $zipMb = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
  Write-Host "ZIP:   $zipFile ($zipMb MB)"
}
Write-Host "Hint:  $hintFile"
Write-Host "Files: $($changed.Count) changed, $($deleted.Count) deleted, ~${mb} MB"
