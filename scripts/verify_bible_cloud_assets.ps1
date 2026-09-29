# Verify bible_reader.db + clean JSON before/after FTP
# Usage: powershell -ExecutionPolicy Bypass -File scripts\verify_bible_cloud_assets.ps1

param(
  [string]$Root = "",
  [string]$CloudUrl = "https://bible100.lovestoblog.com"
)

$ErrorActionPreference = "Stop"
$Root = if ($Root) { (Resolve-Path $Root).Path } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }
$MinDb = 10MB

& (Join-Path $PSScriptRoot "ensure_bible_clean_ascii_aliases.ps1") | Out-Null

$dbDir = Join-Path $Root "bible_app\app\assets\bible"
$db = Join-Path $dbDir "bible_reader.db"
$manifest = Join-Path $dbDir "bible_reader.db.manifest.json"
$clean = Join-Path $Root "data\bibles\clean"

Write-Host "=== Bible cloud assets (local) ===" -ForegroundColor Cyan
if (Test-Path $db) {
  $sz = (Get-Item $db).Length
  $mb = [math]::Round($sz / 1MB, 1)
  if ($sz -ge $MinDb) { Write-Host "OK bible_reader.db ${mb} MB (local only; cloud uses parts)" -ForegroundColor Green }
  else { Write-Host "FAIL bible_reader.db only ${mb} MB" -ForegroundColor Red }
} else {
  Write-Host "FAIL missing bible_reader.db" -ForegroundColor Red
}

if (Test-Path $manifest) {
  $parts = @(Get-ChildItem $dbDir -Filter "bible_reader.db.part*" -File)
  if ($parts.Count -ge 1) {
    Write-Host "OK cloud split: manifest + $($parts.Count) parts" -ForegroundColor Green
  } else {
    Write-Host "WARN manifest exists but no parts - run split_bible_db_for_cloud.ps1" -ForegroundColor Yellow
  }
} else {
  Write-Host "WARN no manifest - run split_bible_db_for_cloud.ps1" -ForegroundColor Yellow
}

if (Test-Path $clean) {
  $jsons = Get-ChildItem $clean -Filter *.json -File
  $n = $jsons.Count
  $kjv = $jsons | Where-Object { $_.Name -match '^(KJV|kjv)\.json$' } | Select-Object -First 1
  if ($kjv -and $kjv.Length -ge 5MB) {
    Write-Host "OK data/bibles/clean: $n json (kjv ~$([math]::Round($kjv.Length/1MB,1)) MB)" -ForegroundColor Green
  } else {
    Write-Host "WARN data/bibles/clean: $n json but KJV missing/small" -ForegroundColor Yellow
  }
} else {
  Write-Host "FAIL missing data/bibles/clean" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Cloud probe (script may get challenge page; verify in browser) ===" -ForegroundColor Cyan
$probePaths = @(
  "/bible_app/app/assets/bible/bible_reader.db.manifest.json",
  "/bible_app/app/assets/bible/bible_reader.db.part001",
  "/data/bibles/clean/kjv.json",
  "/data/bibles/clean/niv.json"
)
foreach ($p in $probePaths) {
  $url = "$CloudUrl$p"
  try {
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method = "HEAD"
    $req.UserAgent = "Mozilla/5.0 Bible100Verify"
    $req.Timeout = 20000
    $resp = $req.GetResponse()
    $len = $resp.ContentLength
    $resp.Close()
    if ($len -ge 100000) {
      Write-Host "OK $p ($len bytes)" -ForegroundColor Green
    } elseif ($len -gt 0 -and $len -lt 5000) {
      Write-Host "?? $p only $len bytes - open in browser to confirm" -ForegroundColor Yellow
    } else {
      Write-Host "?? $p Content-Length $len" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "FAIL $p - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Build upload ZIP:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\build_ftp_bible_data_full.ps1"
Write-Host ""
Write-Host "FileZilla: upload FTP_BIBLE_DATA_*.zip contents to htdocs/. Concurrency = 1." -ForegroundColor DarkGray
