Param(
  [int]$Port = 8080
)

$root = Resolve-Path "$PSScriptRoot\..\portable_build"
if (-not (Test-Path $root)) {
  Write-Error "找不到 portable_build，請先執行 tools/make_portable.ps1"
  exit 1
}

Write-Host "啟動本地HTTP伺服器: http://127.0.0.1:$Port/"
Write-Host "根目錄: $root"
Push-Location $root
try {
  python -m http.server $Port | Out-Host
} finally {
  Pop-Location
}

