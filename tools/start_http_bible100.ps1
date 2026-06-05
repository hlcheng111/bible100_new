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

Write-Host "============================================"
Write-Host "  Bible100 本地 HTTP 伺服器"
Write-Host "  根目錄: $root"
Write-Host "  網址:   http://127.0.0.1:$Port/"
Write-Host ""
Write-Host "  對照模式 v2（請用此網址）:"
Write-Host "  http://127.0.0.1:$Port/bible_study/parallel_mode_v2.html"
Write-Host ""
Write-Host "  若上面打不開，代表可能從別處啟動；若您是從 bible_study 目錄啟動，請改開:"
Write-Host "  http://127.0.0.1:$Port/parallel_mode_v2.html"
Write-Host "============================================"
Write-Host ""

Push-Location $root
try {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    python -m http.server $Port
  } else {
    Write-Host "未找到 python，請安裝 Python 或改用: npx serve"
    exit 1
  }
} finally {
  Pop-Location
}
