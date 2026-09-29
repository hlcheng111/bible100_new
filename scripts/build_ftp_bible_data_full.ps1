# Combined FTP pack: bible DB parts + parallel JSON (InfinityFree <=10MB per file)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_bible_data_full.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Mirror = "C:\Users\hlche\.cursor\bible100_new_2"
$outbox = Join-Path $Mirror "_ftp_outbox"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packRoot = Join-Path $outbox "bible_data_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_BIBLE_DATA_$stamp.zip"

if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }

& (Join-Path $PSScriptRoot "split_bible_db_for_cloud.ps1") | Out-Null
& (Join-Path $PSScriptRoot "ensure_bible_clean_ascii_aliases.ps1") | Out-Null

$dbDest = Join-Path $htdocs "bible_app\app\assets\bible"
$cleanDest = Join-Path $htdocs "data\bibles\clean"
$shellJsDest = Join-Path $htdocs "bible_app\shell\js"
$bsJsDest = Join-Path $htdocs "bible_study\js"
New-Item -ItemType Directory -Path $dbDest, $cleanDest, $shellJsDest, $bsJsDest -Force | Out-Null

$dbSrc = Join-Path $Root "bible_app\app\assets\bible"
Copy-Item (Join-Path $dbSrc "bible_reader.db.manifest.json") $dbDest -Force
Get-ChildItem $dbSrc -Filter "bible_reader.db.part*" | ForEach-Object { Copy-Item $_.FullName $dbDest -Force }

$cleanSrc = Join-Path $Root "data\bibles\clean"
$asciiOnly = @{
  "faith_cuv.json" = 10165862
  "kjv.json"       = 9852491
  "vi1934.json"    = 6490358
  "niv.json"       = 6050262
  "id_ayt.json"    = 5960189
  "cuv.json"       = 5909038
  "cuv_rev.json"   = 5691028
}
foreach ($alias in $asciiOnly.Keys) {
  $want = [long]$asciiOnly[$alias]
  $src = Get-ChildItem $cleanSrc -Filter "*.json" -File | Where-Object { $_.Length -eq $want } | Select-Object -First 1
  if (-not $src) { throw "Missing clean JSON source for $alias ($want bytes)" }
  $bytes = [System.IO.File]::ReadAllBytes($src.FullName)
  [System.IO.File]::WriteAllBytes((Join-Path $cleanDest $alias), $bytes)
}

Copy-Item (Join-Path $Root "bible_study\js\bible_version_registry.js") $bsJsDest -Force
Copy-Item (Join-Path $Root "bible_app\shell\js\bible_reader_core.js") $shellJsDest -Force

$guide = @(
  "Bible100 bible data pack for InfinityFree (max 10MB per file)",
  "",
  "Unzip to htdocs/ root (keep htdocs/ folder).",
  "",
  "Expected paths:",
  "  htdocs/bible_app/app/assets/bible/bible_reader.db.manifest.json",
  "  htdocs/bible_app/app/assets/bible/bible_reader.db.part001 .. part005",
  "  htdocs/data/bibles/clean/kjv.json, niv.json, faith_cuv.json, ...",
  "  htdocs/bible_study/js/bible_version_registry.js",
  "",
  "FileZilla: set max concurrent transfers = 1",
  "",
  "After upload, verify remote folder is NOT empty:",
  "  /htdocs/bible_app/app/assets/bible/ (6 files)",
  "  /htdocs/data/bibles/clean/ (7 ascii json files, kjv ~9.4MB)",
  "",
  "Browser test (Ctrl+F5):",
  "  https://bible100.lovestoblog.com/bible_app/shell/pages/bible66.html?book=43&chapter=20",
  "  https://bible100.lovestoblog.com/bible_study/parallel_mode_v3.html",
  "  https://bible100.lovestoblog.com/bible_study/reader.html",
  "",
  "Do NOT upload single 41MB bible_reader.db (host deletes it)."
)
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines((Join-Path $packRoot "UPLOAD_GUIDE_CN.txt"), $guide, $utf8)

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packRoot, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$dbN = (Get-ChildItem $dbDest -Filter "bible_reader.db.part*").Count
$jsonN = (Get-ChildItem $cleanDest -Filter "*.json").Count
$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 1)
Write-Host "ZIP: $zipFile ($mb MB)"
Write-Host "  DB parts: $dbN + manifest"
Write-Host "  clean JSON: $jsonN files"
