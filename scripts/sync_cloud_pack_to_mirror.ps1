# Sync bible100_new (canonical) -> bible100_new_2 (FTP mirror)
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\sync_cloud_pack_to_mirror.ps1
# Lists: config/cloud_pack_4p8_include.txt · config/cloud_pack_4p8_exclude.txt

param(
  [string]$Source = "",
  [string]$Dest = "C:\Users\hlche\.cursor\bible100_new_2",
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$Root = if ($Source) { (Resolve-Path $Source).Path } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }

if (-not (Test-Path (Join-Path $Root "index_v5.html"))) {
  throw "Source root missing index_v5.html: $Root"
}

$includeFile = Join-Path $Root "config\cloud_pack_4p8_include.txt"
if (-not (Test-Path $includeFile)) { throw "Missing $includeFile" }

function Read-ListFile([string]$path) {
  Get-Content $path -Encoding UTF8 |
    Where-Object { $_ -and -not ($_.TrimStart().StartsWith("#")) } |
    ForEach-Object { $_.Trim().TrimEnd("/").TrimEnd("\") }
}

function Invoke-RoboMirror([string]$srcPath, [string]$destPath) {
  $xd = @(".git", ".cursor", "node_modules", "backups", "archive", "_archive", "dist")
  $xf = @("*.db", "*.mp4", "*.zip", "*.mht", "*.pdf")
  $args = @(
    "`"$srcPath`"", "`"$destPath`"",
    "/E", "/MT:4", "/R:1", "/W:1",
    "/MIR", "/NFL", "/NDL", "/NJH", "/NJS"
  )
  foreach ($d in $xd) { $args += "/XD"; $args += $d }
  $args += "/XF"
  foreach ($f in $xf) { $args += $f }
  $argLine = ($args -join " ")
  cmd.exe /c "robocopy $argLine"
  $rc = $LASTEXITCODE
  if ($rc -ge 8) {
    cmd.exe /c "robocopy `"$srcPath`" `"$destPath`" /E /MT:1 /R:1 /W:1 /MIR /NFL /NDL /NJH /NJS"
    $rc = $LASTEXITCODE
  }
  return $rc
}

$includes = Read-ListFile $includeFile

if (-not $WhatIf) {
  if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
} else {
  Write-Host "[WhatIf] Would sync -> $Dest" -ForegroundColor Yellow
}

$copied = 0
$missing = @()

foreach ($rel in $includes) {
  $srcPath = Join-Path $Root $rel
  if (-not (Test-Path $srcPath)) {
    $missing += $rel
    Write-Host "SKIP (missing in source): $rel" -ForegroundColor DarkYellow
    continue
  }
  $destPath = Join-Path $Dest $rel
  if ($WhatIf) {
    Write-Host "Would copy: $rel"
    $copied++
    continue
  }
  if (Test-Path $srcPath -PathType Leaf) {
    $destDir = Split-Path $destPath -Parent
    if ($destDir -and -not (Test-Path $destDir)) {
      New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
    $copied++
    Write-Host "OK file: $rel"
    continue
  }
  $destParent = Split-Path $destPath -Parent
  if ($destParent -and -not (Test-Path $destParent)) {
    New-Item -ItemType Directory -Path $destParent -Force | Out-Null
  }
  $rc = Invoke-RoboMirror $srcPath $destPath
  if ($rc -ge 8) { throw "Robocopy failed for $rel (exit $rc)" }
  $copied++
  Write-Host "OK dir:  $rel"
}

if (-not $WhatIf) {
  $viRoot = Join-Path $Dest "languages\vi"
  if (Test-Path $viRoot) {
    Get-ChildItem $viRoot -Recurse -Directory -Filter "*.files" -ErrorAction SilentlyContinue |
      ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
  }
  foreach ($bad in @("data\cj", "data\orig")) {
    $p = Join-Path $Dest $bad
    if (Test-Path $p) { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }
  }
  foreach ($stale in @(
    "qna\qna_index_4layer.htm",
    "qna\qna_index_4layer_cloud.htm",
    "smart_ministry\ai_smart_ministry_overview.html"
  )) {
    $p = Join-Path $Dest $stale
    if (Test-Path $p) {
      Remove-Item $p -Force -ErrorAction SilentlyContinue
      Write-Host "Removed stale: $stale" -ForegroundColor Yellow
    }
  }
}

$gitHash = "unknown"
try {
  Push-Location $Root
  $h = git rev-parse --short HEAD 2>$null
  if ($h) { $gitHash = $h.Trim() }
} finally { Pop-Location }

$manifest = @{
  synced_at_utc = (Get-Date).ToUniversalTime().ToString("o")
  source_root   = $Root
  dest_root     = $Dest
  git_commit    = $gitHash
  include_count = $includes.Count
  copied_items  = $copied
  missing_in_source = $missing
  policy        = "CLOUD_PACK_4P8_FULL_V1"
  ftp_target    = "bible100.lovestoblog.com/htdocs"
}

if (-not $WhatIf) {
  $manifestPath = Join-Path $Dest ".cloud_mirror_sync.json"
  $json = $manifest | ConvertTo-Json -Depth 5
  [System.IO.File]::WriteAllText($manifestPath, $json, [System.Text.UTF8Encoding]::new($false))
}

Write-Host ""
Write-Host "=== Cloud mirror sync complete ===" -ForegroundColor Green
Write-Host "Source: $Root"
Write-Host "Dest:   $Dest"
Write-Host "Items:  $copied / $($includes.Count)"
if ($missing.Count) {
  Write-Host "Missing in source ($($missing.Count)):" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  - $_" }
}
Write-Host "Next: FileZilla upload bible100_new_2 to htdocs"
Write-Host "Verify: https://bible100.lovestoblog.com/index_v5.html"
