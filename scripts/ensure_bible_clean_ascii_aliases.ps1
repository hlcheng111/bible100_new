# Create ASCII alias copies in data/bibles/clean/ (cloud FTP friendly)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\ensure_bible_clean_ascii_aliases.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$clean = Join-Path $Root "data\bibles\clean"
if (-not (Test-Path $clean)) { throw "Missing $clean" }

# Byte-size fingerprints for canonical clean JSON (stable across locales)
$sizeMap = @{
  "faith_cuv.json" = 10165862
  "kjv.json"       = 9852491
  "vi1934.json"    = 6490358
  "niv.json"       = 6050262
  "id_ayt.json"    = 5960189
  "cuv.json"       = 5909038
  "cuv_rev.json"   = 5691028
}

$jsons = @(Get-ChildItem $clean -Filter "*.json" -File)

foreach ($alias in $sizeMap.Keys) {
  $want = [long]$sizeMap[$alias]
  $dest = Join-Path $clean $alias
  $src = $jsons | Where-Object { $_.Length -eq $want -and $_.Name -ne $alias } | Select-Object -First 1
  if (-not $src) {
    if ((Test-Path $dest) -and ((Get-Item $dest).Length -eq $want)) {
      Write-Host "OK alias $alias (already present)"
    } else {
      Write-Host "SKIP $alias (no source with $want bytes)" -ForegroundColor Yellow
    }
    continue
  }
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -eq $want)) {
    Write-Host "OK alias $alias"
    continue
  }
  Copy-Item $src.FullName $dest -Force
  Write-Host "OK alias $alias <- $($src.Name)"
}
