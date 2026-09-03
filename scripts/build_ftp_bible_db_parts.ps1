# ZIP bible DB parts for InfinityFree (each part <10MB)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_bible_db_parts.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$srcDir = Join-Path $Root "bible_app\app\assets\bible"
$Mirror = "C:\Users\hlche\.cursor\bible100_new_2"
$outbox = Join-Path $Mirror "_ftp_outbox"
$stamp = Get-Date -Format "yyyyMMdd_HHmm"
$packRoot = Join-Path $outbox "bible_db_$stamp"
$htdocs = Join-Path $packRoot "htdocs\bible_app\app\assets\bible"
$zipFile = Join-Path $outbox "FTP_BIBLE_DB_$stamp.zip"

$manifest = Join-Path $srcDir "bible_reader.db.manifest.json"
if (-not (Test-Path $manifest)) {
  & (Join-Path $PSScriptRoot "split_bible_db_for_cloud.ps1")
}

New-Item -ItemType Directory -Path $htdocs -Force | Out-Null
Copy-Item (Join-Path $srcDir "bible_reader.db.manifest.json") $htdocs -Force
Get-ChildItem $srcDir -Filter "bible_reader.db.part*" | ForEach-Object {
  Copy-Item $_.FullName $htdocs -Force
}

$readme = @(
  "Bible100 DB parts for InfinityFree (10MB limit per file)",
  "Unzip to htdocs/ root.",
  "Target: htdocs/bible_app/app/assets/bible/",
  "Files: manifest.json + part001..part00N",
  "Verify: https://bible100.lovestoblog.com/bible_app/shell/pages/bible66.html?book=43&chapter=20"
)
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines((Join-Path $packRoot "README.txt"), $readme, $utf8)

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packRoot, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$n = (Get-ChildItem $htdocs -Filter "bible_reader.db.part*").Count
$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 1)
Write-Host "ZIP: $zipFile ($mb MB, $n parts + manifest)"
