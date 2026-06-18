# Package bible_app shell for static upload (FTP / Netlify / lovestoblog).
# Output: bible_app/dist_deploy/  (upload entire folder contents to .../bible_app/)
param(
  [string]$OutDir = ""
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BibleApp = Split-Path -Parent $Root
if (-not $OutDir) { $OutDir = Join-Path $BibleApp "dist_deploy" }

$Db = Join-Path $BibleApp "app\assets\bible\bible_reader.db"
if (-not (Test-Path $Db)) {
  Write-Host "[錯誤] 缺少 bible_reader.db，請先執行 ensure_bible_db.ps1" -ForegroundColor Red
  exit 1
}
if ((Get-Item $Db).Length -lt 10MB) {
  Write-Host "[錯誤] bible_reader.db 過小（示範庫不可上云）" -ForegroundColor Red
  exit 1
}

if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Copy-Item -Force (Join-Path $BibleApp "index.html") $OutDir
Copy-Item -Force (Join-Path $BibleApp "serve.json") $OutDir
Copy-Item -Recurse -Force (Join-Path $BibleApp "shell") (Join-Path $OutDir "shell")
New-Item -ItemType Directory -Force -Path (Join-Path $OutDir "app\assets\bible") | Out-Null
Copy-Item -Force $Db (Join-Path $OutDir "app\assets\bible\bible_reader.db")

$readme = @"
# 上傳說明
將本資料夾「內部所有檔案」上傳到主機的 bible_app/ 目錄。
對外網址：https://你的網域/bible_app/
勿單獨上傳 shell/ 而漏 index.html 與 app/assets/bible/bible_reader.db
"@
Set-Content -Path (Join-Path $OutDir "UPLOAD_README.txt") -Value $readme -Encoding UTF8

Write-Host "[OK] dist_deploy ready:" $OutDir -ForegroundColor Green
Write-Host "     Upload to: https://bible100.xxx/bible_app/" -ForegroundColor Cyan
