# Ensure bible_reader.db exists for USB / offline use (no user-facing Python steps).
$ErrorActionPreference = 'SilentlyContinue'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DbDir = Join-Path $Root 'app\assets\bible'
$DbPath = Join-Path $DbDir 'bible_reader.db'
$BakPath = Join-Path $DbDir 'bible_reader_full.bak'
$MinBytes = 10MB

function Test-DbOk($path) {
    if (-not (Test-Path $path)) { return $false }
    return (Get-Item $path).Length -ge $MinBytes
}

if (Test-DbOk $DbPath) {
    Write-Host '[OK] bible_reader.db ready' -ForegroundColor Green
    $py = Get-Command python -ErrorAction SilentlyContinue
    if ($py) {
        & python (Join-Path $Root 'scripts\check_bible_db_versions.py') 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host '[提示] 經庫缺越/印版本時，請執行 import_helloao_to_db.py' -ForegroundColor DarkYellow
        }
    }
    exit 0
}

New-Item -ItemType Directory -Force -Path $DbDir | Out-Null

if (Test-DbOk $BakPath) {
    Write-Host '[修復] 正在還原離線經庫備份…' -ForegroundColor Yellow
    Copy-Item -Force $BakPath $DbPath
    if (Test-DbOk $DbPath) { exit 0 }
}

$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) {
    Write-Host '[修復] 正在建立經庫（首次需數分鐘，請稍候）…' -ForegroundColor Yellow
    Push-Location $Root
    & python scripts\fetch_helloao_bible.py 2>$null
    & python scripts\json_to_sqlite.py 2>$null
    & python scripts\import_helloao_to_db.py 2>$null
    Pop-Location
    if (Test-DbOk $DbPath) { exit 0 }
}

Write-Host '[提示] 經庫尚未就緒：示範模式仍可用；完整 66 卷請聯繫同工放入 bible_reader_full.bak' -ForegroundColor DarkYellow
exit 0
