# Split bible_reader.db into <=9MB parts for InfinityFree (10MB file limit)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\split_bible_db_for_cloud.ps1

param(
  [string]$Source = "",
  [int]$ChunkMB = 9
)

$ErrorActionPreference = "Stop"
$Root = if ($Source) { (Resolve-Path $Source).Path } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }
$db = Join-Path $Root "bible_app\app\assets\bible\bible_reader.db"
$outDir = Join-Path $Root "bible_app\app\assets\bible"
$chunkSize = $ChunkMB * 1MB

if (-not (Test-Path $db)) { throw "Missing: $db" }
$dbSize = (Get-Item $db).Length
if ($dbSize -lt 10MB) { Write-Host "DB already small enough for single upload"; exit 0 }

Get-ChildItem $outDir -Filter "bible_reader.db.part*" -ErrorAction SilentlyContinue | Remove-Item -Force
$manifest = @{
  version = 1
  original = "bible_reader.db"
  totalBytes = $dbSize
  chunkBytes = $chunkSize
  parts = @()
}

$stream = [System.IO.File]::OpenRead($db)
$buf = New-Object byte[] $chunkSize
$partNum = 0
try {
  while ($true) {
    $read = $stream.Read($buf, 0, $chunkSize)
    if ($read -le 0) { break }
    $partNum++
    $name = "bible_reader.db.part{0:D3}" -f $partNum
    $partPath = Join-Path $outDir $name
    $fs = [System.IO.File]::Create($partPath)
    try {
      if ($read -eq $chunkSize) { $fs.Write($buf, 0, $read) }
      else {
        $slice = New-Object byte[] $read
        [Array]::Copy($buf, $slice, $read)
        $fs.Write($slice, 0, $read)
      }
    } finally { $fs.Close() }
    $manifest.parts += $name
    Write-Host "Wrote $name ($read bytes)"
  }
} finally { $stream.Close() }

$manifestPath = Join-Path $outDir "bible_reader.db.manifest.json"
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Compress), $utf8)

Write-Host ""
Write-Host "=== Split complete ===" -ForegroundColor Green
Write-Host "Parts: $($manifest.parts.Count) | total $dbSize bytes"
Write-Host "Manifest: $manifestPath"
Write-Host "Upload ALL part* + manifest.json to cloud (each part < ${ChunkMB}MB)"
