# Compare bible100_new (source) vs bible100_new_2 (FTP mirror)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\audit_cloud_mirror.ps1

param(
  [string]$Source = "",
  [string]$Dest = "C:\Users\hlche\.cursor\bible100_new_2"
)

$ErrorActionPreference = "Stop"
$Root = if ($Source) { (Resolve-Path $Source).Path } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }

$critical = @(
  "index.html",
  "index_v5.html",
  "js/config-embedded.js",
  "js/index_v5_shell.js",
  "js/hub_chrome_i18n_pack.js",
  "config/modes.json",
  "config/modules.json",
  "church_ministry/sidebar_church_layout_v1.html",
  "church_ministry/_landing/gateway.html",
  "school_management/_landing/home.html",
  "school_management/manage/academic_integrated.html",
  "ai_tools/_landing/home.html",
  "ai_tools/sidebar_lab.html",
  "ai_tools/dashboard.html",
  "bible_study/_landing/home.html",
  "languages/_landing/home.html",
  "languages/vi/OT/chapters/chapter1.html",
  "languages/id/OT/chapters/chapter1.html",
  "languages/vi/NT/chapters/chapter1.html",
  "languages/id/NT/chapters/chapter1.html",
  "languages/landP_kh.html",
  "languages/index_kh.html",
  "languages/landP_lo.html",
  "languages/index_lo.html",
  "hymn_management/index.html",
  "hymn_management/hymn/.htaccess",
  "qna/index.html"
)

$mirrorOnly = @(".cloud_mirror_sync.json")

$staleCloudOnly = @(
  "qna/qna_index_4layer.htm",
  "qna/qna_index_4layer_cloud.htm",
  "smart_ministry/ai_smart_ministry_overview.html",
  "hymn_management/temp_hymn.html",
  "hymn_management/temp_hymn_cloud.html"
)

function File-Sig([string]$path) {
  if (-not (Test-Path $path)) { return $null }
  $i = Get-Item -LiteralPath $path
  return @{ size = $i.Length; mtime = $i.LastWriteTimeUtc.Ticks }
}

Write-Host "=== Cloud mirror audit ===" -ForegroundColor Cyan
Write-Host "Source: $Root"
Write-Host "Dest:   $Dest"
Write-Host ""

$fail = 0
$warn = 0

Write-Host "-- Critical parity (size + mtime) --"
foreach ($rel in $critical) {
  $s = Join-Path $Root $rel
  $d = Join-Path $Dest $rel
  $ss = File-Sig $s
  $ds = File-Sig $d
  if (-not $ss) {
    Write-Host "MISSING SOURCE: $rel" -ForegroundColor Red
    $fail++
    continue
  }
  if (-not $ds) {
    Write-Host "MISSING MIRROR: $rel" -ForegroundColor Red
    $fail++
    continue
  }
  if ($ss.size -ne $ds.size) {
    Write-Host "SIZE MISMATCH: $rel ($($ss.size) vs $($ds.size))" -ForegroundColor Red
    $fail++
  } elseif ($ss.mtime -gt $ds.mtime) {
    Write-Host "STALE MIRROR: $rel (source newer)" -ForegroundColor Yellow
    $warn++
  } else {
    Write-Host "OK: $rel"
  }
}

Write-Host ""
Write-Host "-- Stale cloud-only files (should be absent in mirror) --"
foreach ($rel in $staleCloudOnly) {
  $d = Join-Path $Dest $rel
  if (Test-Path $d) {
    Write-Host "STALE IN MIRROR (remove): $rel" -ForegroundColor Yellow
    $warn++
  } else {
    Write-Host "OK absent: $rel"
  }
}

Write-Host ""
Write-Host "-- Mirror manifest --"
foreach ($rel in $mirrorOnly) {
  $d = Join-Path $Dest $rel
  if (-not (Test-Path $d)) {
    Write-Host "MISSING MIRROR: $rel" -ForegroundColor Red
    $fail++
  } else {
    Write-Host "OK: $rel"
  }
}

Write-Host ""
if (Test-Path (Join-Path $Dest ".cloud_mirror_sync.json")) {
  Get-Content (Join-Path $Dest ".cloud_mirror_sync.json") -Raw | Write-Host
}

Write-Host ""
if ($fail -gt 0) {
  Write-Host "FAIL: $fail critical issue(s), $warn warning(s). Run sync_cloud_pack_to_mirror.ps1" -ForegroundColor Red
  exit 1
}
Write-Host "PASS: mirror aligned ($warn warning(s))." -ForegroundColor Green
exit 0
