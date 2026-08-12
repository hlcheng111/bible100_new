# 從本機舊站 C:\bible100_new 還原 hymn/ _LEGACY 詩歌庫（缺檔時執行）
# 用法（PowerShell）：.\scripts\restore_hymn_legacy_from_c_drive.ps1
$ErrorActionPreference = "Stop"
$Source = "C:\bible100_new\hymn_management\hymn"
$Dest   = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "hymn_management\hymn"
if (-not (Test-Path $Source)) {
  Write-Error "找不到來源：$Source （請確認舊 bible100_new 路徑）"
}
if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }

$ExcludeDirs = @("_vti_cnf", "node_modules")
$ExcludeExt  = @(".zip", ".pdf", ".mht", ".mid")

function Copy-TreeFiltered($Sub) {
  $src = Join-Path $Source $Sub
  $dst = Join-Path $Dest $Sub
  if (-not (Test-Path $src)) {
    Write-Host "SKIP (no source): $Sub"
    return
  }
  Get-ChildItem -LiteralPath $src -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length).TrimStart("\")
    foreach ($bad in $ExcludeDirs) { if ($rel -match [regex]::Escape($bad)) { return } }
    foreach ($ext in $ExcludeExt) { if ($_.Extension -ieq $ext) { return } }
    $target = Join-Path $dst $rel
    $dir = Split-Path -LiteralPath $target -Parent
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    if (-not (Test-Path -LiteralPath $target)) {
      Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    }
  }
  Write-Host "OK: $Sub"
}

# 1) 主控台與瀏覽殼
$RootFiles = @(
  "hymn_main_index.html", "default.htm",
  "hymn_sidebar_browse.html", "hymn_content_browse.html",
  "hymn_sidebar_dashboard.html", "hymn_content_dashboard.html"
)
foreach ($f in $RootFiles) {
  $s = Join-Path $Source $f
  if (Test-Path $s) {
    Copy-Item -LiteralPath $s -Destination (Join-Path $Dest $f) -Force
    Write-Host "OK file: $f"
  }
}

# 2) 5 本詩集 JS（側欄 browse 依賴）
Copy-TreeFiltered "hymn_5hymnals_management\js"

# 3) 全庫索引與詩歌正文目錄（體積大，只補缺檔）
$Dirs = @(
  "index_hymn_web", "index_hymnal", "hymn_00", "hymn_22", "hymn_23",
  "hymn_chi", "hymn_world", "hymn_hymnal_index", "hymn_most", "hymn_pwc",
  "image_hymn", "image_author", "js", "scripts"
)
foreach ($d in $Dirs) { Copy-TreeFiltered $d }

Write-Host ""
Write-Host "完成。主入口：hymn_management/hymn/index.html"
Write-Host "或總站：教會 A > 4. 詩歌管理 > 詩歌庫"
