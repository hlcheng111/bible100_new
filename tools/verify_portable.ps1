Param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..\portable_build")
)

if (-not (Test-Path $Root)) { Write-Error "未找到便攜包: $Root"; exit 1 }

$ok = $true

function MustExist($rel){
  $p = Join-Path $Root $rel
  if (Test-Path $p) { Write-Host "[OK] $rel" -ForegroundColor Green }
  else { Write-Host "[MISS] $rel" -ForegroundColor Red; $script:ok = $false }
}

Write-Host "檢查必要文件..."
MustExist 'index.html'
MustExist 'bible_reading'
MustExist 'bible_study'
MustExist 'languages'
MustExist 'data/bibles'

Write-Host "抽查重要頁面是否存在..."
@(
  'bible_reading/auto_test.html',
  'bible_reading/final_test.html',
  'bible_study/commentaries/reader.html'
) | ForEach-Object { MustExist $_ }

if ($ok) { Write-Host "驗證通過，可拷貝至手機/平板" -ForegroundColor Green; exit 0 }
else { Write-Host "驗證未通過，請補齊缺失文件" -ForegroundColor Yellow; exit 2 }

