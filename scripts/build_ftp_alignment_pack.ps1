# One-shot: ZIP alignment pack from config/ftp_cloud_align_pack.txt
# ZIP layout: README + PATHS at root; site files under htdocs/
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build_ftp_alignment_pack.ps1

param(
  [string]$Source = "",
  [string]$Mirror = "C:\Users\hlche\.cursor\bible100_new_2",
  [string]$ListFile = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "ftp_zip_common.ps1")

$Root = if ($Source) { (Resolve-Path $Source).Path } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }
$Mirror = (Resolve-Path $Mirror).Path
$listPath = if ($ListFile) { $ListFile } else { Join-Path $Root "config\ftp_cloud_align_pack.txt" }

$cloudDeletes = @(
  "smart_ministry/ai_smart_ministry_overview.html",
  "qna/qna_index_4layer.htm",
  "qna/qna_index_4layer_cloud.htm"
)

function Read-PackList([string]$path) {
  Get-Content $path -Encoding UTF8 |
    Where-Object { $_ -and -not ($_.TrimStart().StartsWith("#")) } |
    ForEach-Object { $_.Trim().TrimEnd("/").TrimEnd("\") }
}

function Copy-PackEntry([string]$rel, [string]$srcRoot, [string]$dstRoot) {
  $src = Join-Path $srcRoot $rel
  if (-not (Test-Path $src)) {
    Write-Host "SKIP missing: $rel" -ForegroundColor DarkYellow
    return @()
  }
  $dst = Join-Path $dstRoot $rel
  $copied = New-Object System.Collections.Generic.List[string]
  if (Test-Path $src -PathType Leaf) {
    $dir = Split-Path $dst -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    [void]$copied.Add($rel.Replace("\", "/"))
    return $copied
  }
  Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {
    $r = $_.FullName.Substring($srcRoot.Length).TrimStart("\", "/").Replace("\", "/")
    $d = Join-Path $dstRoot ($r.Replace("/", "\"))
    $dDir = Split-Path $d -Parent
    if ($dDir -and -not (Test-Path $dDir)) { New-Item -ItemType Directory -Path $dDir -Force | Out-Null }
    Copy-Item -LiteralPath $_.FullName -Destination $d -Force
    [void]$copied.Add($r)
  }
  return $copied
}

$stamp = Get-Date -Format "yyyyMMdd_HHmm"
$outbox = Join-Path $Mirror "_ftp_outbox"
$packRoot = Join-Path $outbox "align_$stamp"
$htdocs = Join-Path $packRoot "htdocs"
$zipFile = Join-Path $outbox "FTP_ALIGN_$stamp.zip"
$hintFile = Join-Path $outbox "FTP_ALIGN_$stamp.txt"

if (-not (Test-Path $listPath)) { throw "Missing list: $listPath" }
$entries = Read-PackList $listPath

New-Item -ItemType Directory -Path $outbox -Force | Out-Null
if (Test-Path $packRoot) { Remove-Item $packRoot -Recurse -Force }
New-Item -ItemType Directory -Path $htdocs -Force | Out-Null

$allPaths = New-Object System.Collections.Generic.List[string]
foreach ($rel in $entries) {
  $from = $Mirror
  if (-not (Test-Path (Join-Path $Mirror $rel))) { $from = $Root }
  $got = Copy-PackEntry $rel $from $htdocs
  foreach ($g in $got) { [void]$allPaths.Add($g) }
}

$utf8 = New-Object System.Text.UTF8Encoding $false
$pathLines = @(
  "# Path list (reference only - do NOT upload line by line)",
  "# Unzip ZIP, upload everything inside htdocs/ to remote htdocs/",
  "# stamp: $stamp | files: $($allPaths.Count)",
  ""
) + ($allPaths | Sort-Object -Unique)
[System.IO.File]::WriteAllLines((Join-Path $packRoot "PATHS.txt"), $pathLines, $utf8)

$delLines = @("# Delete these old files on remote htdocs/ if they still exist") + $cloudDeletes
[System.IO.File]::WriteAllLines((Join-Path $packRoot "PATHS_DELETE.txt"), $delLines, $utf8)

$readme = @(
  "Bible100 ALIGN pack $stamp",
  "Unzip -> open htdocs/ -> upload ALL inside to remote htdocs/",
  "Do NOT upload line-by-line from PATHS.txt.",
  "Verify: https://bible100.lovestoblog.com/index_v5.html?v=$stamp"
)
New-FtpZipPack -PackRoot $packRoot -ZipFile $zipFile -ReadmeLines $readme

$zipMb = [math]::Round((Get-Item $zipFile).Length / 1MB, 1)
$hint = @(
  "FTP ALIGN $stamp",
  "ZIP: $zipFile ($zipMb MB)",
  "Unzip -> open htdocs/ -> drag ALL to FileZilla remote htdocs/",
  "Files in htdocs/: $($allPaths.Count)",
  "PATHS.txt is a checklist only, not an upload list"
)
[System.IO.File]::WriteAllLines($hintFile, $hint, $utf8)

Write-Host ""
Write-Host "=== ALIGN pack $stamp ===" -ForegroundColor Green
Write-Host "ZIP: $zipFile ($zipMb MB, $($allPaths.Count) files in htdocs/)"
Write-Host "Hint: $hintFile"
