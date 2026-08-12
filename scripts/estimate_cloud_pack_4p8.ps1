# Estimate Bible100 cloud pack ≤4.8GB (include − exclude patterns)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\estimate_cloud_pack_4p8.ps1
# Optional: -Dest D:\bible100_cloud_4p8  (only reports; does not copy unless -Copy)

param(
  [string]$Dest = "",
  [switch]$Copy
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $Root "index_v5.html"))) {
  throw "Cannot find repo root (index_v5.html) from $PSScriptRoot"
}

function Get-DirBytes([string]$rel) {
  $p = Join-Path $Root $rel
  if (-not (Test-Path $p)) { return 0 }
  $sum = (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
  if ($null -eq $sum) { return 0 }
  return [int64]$sum
}

function FmtMB([int64]$b) { return [math]::Round($b / 1MB, 1) }

Write-Host "Root: $Root"
Write-Host "=== INCLUDE (raw) ==="

$parts = [ordered]@{
  "js+css+config+help+nav" = (Get-DirBytes "js") + (Get-DirBytes "css") + (Get-DirBytes "config") + (Get-DirBytes "help") + (Get-DirBytes "nav_hub")
  "bible_study"            = Get-DirBytes "bible_study"
  "church_ministry"        = Get-DirBytes "church_ministry"
  "church_planning"        = Get-DirBytes "church_planning"
  "ai_tools"               = Get-DirBytes "ai_tools"
  "school_management"      = Get-DirBytes "school_management"
  "smart_ministry"         = Get-DirBytes "smart_ministry"
  "qna"                    = Get-DirBytes "qna"
  "hymn_management"        = Get-DirBytes "hymn_management"
  "languages/images"       = Get-DirBytes "languages\images"
  "languages/media"        = Get-DirBytes "languages\media"
  "languages/cn"           = Get-DirBytes "languages\cn"
  "languages/en"           = Get-DirBytes "languages\en"
  "languages/id"           = Get-DirBytes "languages\id"
  "languages/ch+ad"        = (Get-DirBytes "languages\ch") + (Get-DirBytes "languages\ad")
  "data/bibles/clean"      = Get-DirBytes "data\bibles\clean"
  "data/commentaries"      = Get-DirBytes "data\commentaries"
}

$viAll = Get-DirBytes "languages\vi"
$viFiles = [int64]0
Get-ChildItem (Join-Path $Root "languages\vi") -Recurse -Directory -Filter "*.files" -ErrorAction SilentlyContinue | ForEach-Object {
  $viFiles += (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
}
$viNtStub = Get-DirBytes "languages\vi\media\images\image_NT"
$viLean = [math]::Max(0, $viAll - $viFiles - $viNtStub)
$parts["languages/vi (lean, no *.files)"] = $viLean

$rawTotal = [int64]0
foreach ($k in $parts.Keys) {
  $b = [int64]$parts[$k]
  $rawTotal += $b
  Write-Host ("{0,10:N1} MB  {1}" -f (FmtMB $b), $k)
}

Write-Host ""
Write-Host "=== EXCLUDE savings (reference) ==="
$excl = [ordered]@{
  "data/cj (incl 综合解读.db)" = Get-DirBytes "data\cj"
  "data/orig"                  = Get-DirBytes "data\orig"
  "vi *.files"                 = $viFiles
  "vi image_NT stubs"          = $viNtStub
}
foreach ($k in $excl.Keys) {
  Write-Host ("{0,10:N1} MB  {1}" -f (FmtMB ([int64]$excl[$k])), $k)
}

Write-Host ""
Write-Host ("PACK skeleton ≈ {0:N1} MB ({1:N2} GB)" -f (FmtMB $rawTotal), ($rawTotal / 1GB))
$limit = 4.8 * 1GB
$head = $limit - $rawTotal
Write-Host ("Limit 4.8 GB; headroom ≈ {0:N1} MB" -f (FmtMB ([int64]$head)))
if ($rawTotal -gt $limit) {
  Write-Host "FAIL: skeleton already exceeds 4.8GB — trim hymn or media." -ForegroundColor Red
  exit 1
} else {
  Write-Host "OK: skeleton under 4.8GB. Fill headroom per CLOUD_PACK_4P8_FULL_V1.md §3 only." -ForegroundColor Green
}

Write-Host ""
Write-Host "综合解读.db: EXCLUDED from this pack (see doc §0)."
Write-Host "Offline full registry rebuild: NOT in this pack (separate wave)."

if ($Copy -and $Dest) {
  Write-Host "Copy mode not implemented in v1 — sync manually using include/exclude lists." -ForegroundColor Yellow
}
