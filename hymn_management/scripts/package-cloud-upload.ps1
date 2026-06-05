# Cloud-minimal zip for hymn_management (extract to web root).
# Run: powershell -ExecutionPolicy Bypass -File scripts/package-cloud-upload.ps1
# From: hymn_management directory.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "../..")
$hymn = Join-Path $root "hymn_management"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out = Join-Path $hymn "dist/hymn_cloud_$stamp"
$zip = Join-Path $hymn "dist/hymn_cloud_upload_$stamp.zip"

Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path @(
  (Join-Path $out "css"),
  (Join-Path $out "js"),
  (Join-Path $out "hymn_management/data"),
  (Join-Path $out "hymn_management/js"),
  (Join-Path $out "hymn_management/assets/scores")
) -Force | Out-Null

Copy-Item (Join-Path $root "index.html") $out -Force
Copy-Item (Join-Path $root "css/sidebar_shared.css") (Join-Path $out "css") -Force
$outjs = Join-Path $out "js"
Copy-Item (Join-Path $root "js/sidebar_behavior.js"), (Join-Path $root "js/module_navigation.js") $outjs -Force

$destHymn = Join-Path $out "hymn_management"
Get-ChildItem $hymn -File -Filter "*.html" | Where-Object { $_.Name -ne "temp_hymn.html" } | ForEach-Object {
  Copy-Item $_.FullName $destHymn -Force
}
$cloudTemp = Join-Path $hymn "temp_hymn_cloud.html"
if (-not (Test-Path $cloudTemp)) {
  Write-Error "Missing temp_hymn_cloud.html. Run: node scripts/build-temp-cloud.js"
}
Copy-Item $cloudTemp (Join-Path $destHymn "temp_hymn.html") -Force

Copy-Item (Join-Path $hymn "data/*") (Join-Path $destHymn "data") -Force
Get-ChildItem (Join-Path $hymn "js") -File -Filter "*.js" | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $destHymn "js") -Force
}
$ph = Join-Path $hymn "assets/scores/placeholder.svg"
if (Test-Path $ph) { Copy-Item $ph (Join-Path $destHymn "assets/scores") -Force }

$readmePath = Join-Path $out "PACKAGE_README.txt"
"Cloud-minimal upload bundle - extract to web root" | Out-File -FilePath $readmePath -Encoding utf8
"Built: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-File -FilePath $readmePath -Encoding utf8 -Append
"" | Out-File -FilePath $readmePath -Encoding utf8 -Append
"temp_hymn.html is the cloud build (from temp_hymn_cloud.html)" | Out-File -FilePath $readmePath -Encoding utf8 -Append
"hymn_management/hymn/ large hymnal HTML not included" | Out-File -FilePath $readmePath -Encoding utf8 -Append

Get-ChildItem -LiteralPath $hymn -File -Filter "*.md" | ForEach-Object { Copy-Item $_.FullName $out -Force }

if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $out "*") -DestinationPath $zip -Force
$mb = [math]::Round((Get-Item $zip).Length / 1MB, 2)
Write-Host "OK: $zip ($mb MB)"
