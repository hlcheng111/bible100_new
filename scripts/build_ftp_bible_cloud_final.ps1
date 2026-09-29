# ONE-SHOT cloud pack: root entry + bible track + parallel JSON
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_bible_cloud_final.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Mirror = "C:\Users\hlche\.cursor\bible100_new_2"
$outbox = Join-Path $Mirror "_ftp_outbox"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packRoot = Join-Path $outbox "cloud_final_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_CLOUD_FINAL_$stamp.zip"

& (Join-Path $PSScriptRoot "split_bible_db_for_cloud.ps1") | Out-Null
& (Join-Path $PSScriptRoot "ensure_bible_clean_ascii_aliases.ps1") | Out-Null

if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }
New-Item -ItemType Directory -Path $htdocs -Force | Out-Null

function Copy-Rel($rel) {
  $src = Join-Path $Root ($rel.Replace("/", "\"))
  if (-not (Test-Path $src)) { Write-Host "SKIP missing $rel" -ForegroundColor Yellow; return }
  $dst = Join-Path $htdocs ($rel.Replace("/", "\"))
  $dir = Split-Path $dst -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  if (Test-Path $src -PathType Container) {
    Copy-Item $src $dst -Recurse -Force
  } else {
    Copy-Item $src $dst -Force
  }
}

# --- Root / Hub shell ---
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

# --- Bible track (NOT whole bible_app/app Expo tree) ---
Copy-Rel "bible_app/index.html"
Copy-Rel "bible_app/shell"

$dbSrc = Join-Path $Root "bible_app\app\assets\bible"
$dbDest = Join-Path $htdocs "bible_app\app\assets\bible"
New-Item -ItemType Directory -Path $dbDest -Force | Out-Null
Copy-Item (Join-Path $dbSrc "bible_reader.db.manifest.json") $dbDest -Force
Get-ChildItem $dbSrc -Filter "bible_reader.db.part*" | ForEach-Object { Copy-Item $_.FullName $dbDest -Force }

# --- Parallel / reader JSON (ascii names for Linux FTP) ---
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
  if (-not $src) { throw "Missing clean JSON for $alias ($want bytes)" }
  [System.IO.File]::WriteAllBytes((Join-Path $cleanDest $alias), [System.IO.File]::ReadAllBytes($src.FullName))
}

Copy-Rel "bible_study/js/bible_version_registry.js"
Copy-Rel "bible_study/parallel_mode_v3.html"

$guide = @(
  "Bible100 CLOUD FINAL - upload once, then verify",
  "",
  "Unzip to htdocs/ root (merge folders). FileZilla concurrent transfers = 1.",
  "",
  "DO NOT upload whole bible_app/app/ (Expo). This pack has only:",
  "  bible_app/index.html",
  "  bible_app/shell/  (includes vendor/sqljs/)",
  "  bible_app/app/assets/bible/  (manifest + part001..005)",
  "",
  "Also includes:",
  "  .htaccess, index.html, index_v5.html",
  "  data/bibles/clean/*.json (7 files)",
  "  bible_study/parallel_mode_v3.html + bible_version_registry.js",
  "",
  "Verify in browser (Ctrl+F5):",
  "  https://bible100.lovestoblog.com/",
  "  https://bible100.lovestoblog.com/bible_app/shell/index.html",
  "  https://bible100.lovestoblog.com/data/bibles/clean/niv.json",
  "  https://bible100.lovestoblog.com/bible_study/parallel_mode_v3.html",
  "",
  "Local file:// index_v5: shell is PREVIEW only. Full track = run bat -> :3000"
)
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines((Join-Path $packRoot "UPLOAD_GUIDE.txt"), $guide, $utf8)

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packRoot, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 1)
Write-Host ""
Write-Host "=== CLOUD FINAL ZIP ===" -ForegroundColor Green
Write-Host "ZIP: $zipFile ($mb MB)"
Write-Host "Upload once. Do NOT copy entire bible_app/ (skip app/node_modules)."
