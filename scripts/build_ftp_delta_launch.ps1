# Incremental launch ZIP: root redirect + parallel JSON + bible track JS (htdocs/ inside zip)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_delta_launch.ps1
# FileZilla: unzip -> merge htdocs/ into remote /htdocs/ (NOT into bible100_new_2)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outbox = Join-Path "C:\Users\hlche\.cursor\bible100_new_2" "_ftp_outbox"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packRoot = Join-Path $outbox "delta_launch_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_DELTA_LAUNCH_$stamp.zip"

& (Join-Path $PSScriptRoot "ensure_bible_clean_ascii_aliases.ps1") | Out-Null

if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }
New-Item -ItemType Directory -Path $htdocs -Force | Out-Null

function Copy-Rel($rel) {
  $src = Join-Path $Root ($rel.Replace("/", "\"))
  if (-not (Test-Path $src)) { throw "Missing required file: $rel" }
  $dst = Join-Path $htdocs ($rel.Replace("/", "\"))
  $dir = Split-Path $dst -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  if (Test-Path $src -PathType Container) {
    Copy-Item $src $dst -Recurse -Force
  } else {
    Copy-Item $src $dst -Force
  }
}

# A. Root: / and /?i=1 -> index_v5?v=20260808&i=1
@(
  ".htaccess",
  "index.html",
  "index_v5.html",
  "config/build_version.js",
  "js/config-embedded.js",
  "js/index_v5_shell.js",
  "js/hub_chrome_i18n_pack.js",
  "js/shell_nav.js",
  "js/sidebar_behavior.js",
  "js/b100_bible_track_nav.js"
) | ForEach-Object { Copy-Rel $_ }

# B. Parallel (registry + page + hints)
@(
  "bible_study/parallel_mode_v3.html",
  "bible_study/js/bible_version_registry.js",
  "bible_study/js/dev_http_hint.js",
  "bible_study/js/BibleEngine.js"
) | ForEach-Object { Copy-Rel $_ }

# C. data/bibles/clean (ascii json only)
$cleanDest = Join-Path $htdocs "data\bibles\clean"
New-Item -ItemType Directory -Path $cleanDest -Force | Out-Null
$asciiOnly = @{
  "faith_cuv.json" = 10165862
  "kjv.json"       = 9852491
  "vi1934.json"    = 6490358
  "niv.json"       = 6050262
  "id_ayt.json"    = 5960189
  "cuv.json"       = 5909038
  "cuv_rev.json"   = 5691028
}
$cleanSrc = Join-Path $Root "data\bibles\clean"
foreach ($alias in $asciiOnly.Keys) {
  $want = [long]$asciiOnly[$alias]
  $src = Get-ChildItem $cleanSrc -Filter "*.json" -File | Where-Object { $_.Length -eq $want } | Select-Object -First 1
  if (-not $src) { throw "Missing JSON source for $alias" }
  [System.IO.File]::WriteAllBytes((Join-Path $cleanDest $alias), [System.IO.File]::ReadAllBytes($src.FullName))
}

# D. Bible track shell fixes (skip 41MB db if already on cloud)
@(
  "bible_app/index.html",
  "bible_app/shell/index.html",
  "bible_app/shell/js/bible_reader_core.js",
  "bible_app/shell/js/shell_boot.js",
  "bible_app/shell/vendor/sqljs/sql-wasm.js",
  "bible_app/shell/vendor/sqljs/sql-wasm.wasm"
) | ForEach-Object { Copy-Rel $_ }

$dbSrc = Join-Path $Root "bible_app\app\assets\bible"
$dbDest = Join-Path $htdocs "bible_app\app\assets\bible"
if (-not (Test-Path (Join-Path $dbSrc "bible_reader.db.manifest.json"))) {
  & (Join-Path $PSScriptRoot "split_bible_db_for_cloud.ps1") | Out-Null
}
New-Item -ItemType Directory -Path $dbDest -Force | Out-Null
Copy-Item (Join-Path $dbSrc "bible_reader.db.manifest.json") $dbDest -Force
Get-ChildItem $dbSrc -Filter "bible_reader.db.part*" | ForEach-Object { Copy-Item $_.FullName $dbDest -Force }

$guide = @(
  "Bible100 DELTA LAUNCH (final catch-up)",
  "",
  "DO NOT extract into bible100_new_2.",
  "1. Unzip this file anywhere (Desktop is fine).",
  "2. Open folder: htdocs/",
  "3. In FileZilla: upload ALL folders/files inside htdocs/ into remote /htdocs/",
  "   (merge / overwrite when asked)",
  "4. FileZilla concurrent transfers = 1",
  "",
  "After upload, test in browser (Ctrl+F5):",
  "  https://bible100.lovestoblog.com/",
  "    -> should become index_v5.html?v=20260808&i=1 if you use ?i=1",
  "  https://bible100.lovestoblog.com/data/bibles/clean/niv.json",
  "    -> download about 6 MB",
  "  https://bible100.lovestoblog.com/bible_study/parallel_mode_v3.html",
  "  https://bible100.lovestoblog.com/bible_app/shell/index.html",
  "",
  "DB parts in zip: skip re-upload if remote already has 6 files (~40MB total)."
)
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines((Join-Path $packRoot "UPLOAD_GUIDE.txt"), $guide, $utf8)
[System.IO.File]::WriteAllLines((Join-Path $packRoot "htdocs\PATHS.txt"), @(
  "Upload contents of THIS htdocs folder to InfinityFree /htdocs/",
  ".htaccess",
  "index.html",
  "index_v5.html",
  "data/bibles/clean/*.json",
  "bible_study/parallel_mode_v3.html",
  "bible_app/shell/...",
  "bible_app/app/assets/bible/manifest+parts"
), $utf8)

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packRoot, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 1)
Write-Host ""
Write-Host "ZIP: $zipFile ($mb MB)" -ForegroundColor Green
Write-Host "Unzip -> upload htdocs/* to remote /htdocs/ (NOT bible100_new_2)"
