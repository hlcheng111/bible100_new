# Small ZIP: root entry (index.html + .htaccess + index_v5 shell JS)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_root_entry.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Mirror = "C:\Users\hlche\.cursor\bible100_new_2"
$outbox = Join-Path $Mirror "_ftp_outbox"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packRoot = Join-Path $outbox "root_entry_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_ROOT_$stamp.zip"

$files = @(
  ".htaccess",
  "index.html",
  "index_v5.html",
  "config/build_version.js",
  "js/config-embedded.js",
  "js/index_v5_shell.js",
  "js/hub_chrome_i18n_pack.js",
  "js/shell_nav.js",
  "js/b100_nav_ssot.js",
  "js/shell_contract.js",
  "js/sidebar_behavior.js"
)

if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }
New-Item -ItemType Directory -Path $htdocs -Force | Out-Null

foreach ($rel in $files) {
  $src = Join-Path $Root $rel
  if (-not (Test-Path $src)) { Write-Host "SKIP missing $rel" -ForegroundColor Yellow; continue }
  $dst = Join-Path $htdocs ($rel.Replace("/", "\"))
  $dir = Split-Path $dst -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Copy-Item $src $dst -Force
}

$readme = @(
  "Bible100 root entry pack",
  "Unzip to htdocs/ root.",
  "Upload: .htaccess, index.html, index_v5.html, js/*, config/build_version.js",
  "Test: https://bible100.lovestoblog.com/ -> index_v5.html",
  "Then Ctrl+F5 on index_v5 (no manual ?v= needed if build_version updated)."
)
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines((Join-Path $packRoot "UPLOAD_GUIDE.txt"), $readme, $utf8)

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packRoot, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host "ZIP: $zipFile ($mb MB)"
