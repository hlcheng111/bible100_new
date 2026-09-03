# 在 bible100_new 專案根目錄啟動 HTTP 伺服器，供對照模式 v2 等頁面載入 data/*.json
# 使用方式：在專案根目錄執行  .\tools\start_http_bible100.ps1  或  .\tools\start_http_bible100.ps1 -Port 3000

Param(
  [int]$Port = 8080
)

# 專案根目錄 = 本腳本所在目錄的上一層（bible100_new）
$root = Join-Path $PSScriptRoot ".."
$root = [System.IO.Path]::GetFullPath($root)
if (-not (Test-Path $root)) {
  Write-Host "錯誤：找不到專案根目錄 $root"
  exit 1
}

# 確認 bible_study 與 parallel_mode_v2.html 存在
$v2Path = Join-Path $root "bible_study\parallel_mode_v2.html"
if (-not (Test-Path $v2Path)) {
  Write-Host "警告：找不到 bible_study\parallel_mode_v2.html，請確認在 bible100_new 專案根目錄執行本腳本。"
}

# 若 8080 已被別的目錄佔用，會出現「File not found / 404」——先清掉舊程序
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($opid in $existing) {
  if (-not $opid) { continue }
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$opid" -ErrorAction SilentlyContinue
  if ($proc -and $proc.CommandLine -match 'http\.server') {
    Write-Host "關閉舊的 http.server (PID $opid)…"
    Stop-Process -Id $opid -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Milliseconds 400

Write-Host "============================================"
Write-Host "  Bible100 本地 HTTP 伺服器"
Write-Host "  根目錄: $root"
Write-Host "  （根目錄已是 bible100_new，網址不要再加 /bible100_new/）"
Write-Host ""
Write-Host "  總站（請用這個）:"
Write-Host "  http://127.0.0.1:$Port/index_v5.html"
Write-Host "  http://127.0.0.1:$Port/"
Write-Host ""
Write-Host "  教會行政 landing（layout_v1）:"
Write-Host "  http://127.0.0.1:$Port/church_ministry/dashboard_church_layout_v1.html"
Write-Host ""
Write-Host "  教會選路 gateway:"
Write-Host "  http://127.0.0.1:$Port/church_ministry/_landing/gateway.html"
Write-Host ""
Write-Host "  若仍 404：代表伺服器不是從上面「根目錄」啟動。"
Write-Host "============================================"
Write-Host ""

Push-Location $root
try {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    python -m http.server $Port --bind 127.0.0.1
  } else {
    Write-Host "未找到 python，請安裝 Python 或改用: npx serve"
    exit 1
  }
} finally {
  Pop-Location
}
