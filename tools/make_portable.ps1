Param(
    [string]$SourceDir = (Resolve-Path "$PSScriptRoot\.."),
    [string]$OutputDir = (Join-Path (Resolve-Path "$PSScriptRoot\..") "portable_build")
)

Write-Host "[1/5] Prepare output dir: $OutputDir"
if (Test-Path $OutputDir) { Remove-Item -Recurse -Force $OutputDir }
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

function Copy-Tree($src,$dst){
  robocopy $src $dst /E /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
}

Write-Host "[2/5] Copy core files and folders"
Copy-Item (Join-Path $SourceDir 'index.html') -Destination $OutputDir -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $SourceDir 'light_index.html') -Destination $OutputDir -Force -ErrorAction SilentlyContinue
Copy-Tree (Join-Path $SourceDir 'ai_tools') (Join-Path $OutputDir 'ai_tools')
Copy-Tree (Join-Path $SourceDir 'bible_reading') (Join-Path $OutputDir 'bible_reading')
Copy-Tree (Join-Path $SourceDir 'bible_study') (Join-Path $OutputDir 'bible_study')
Copy-Tree (Join-Path $SourceDir 'church_ministry') (Join-Path $OutputDir 'church_ministry')
Copy-Tree (Join-Path $SourceDir 'languages') (Join-Path $OutputDir 'languages')
Copy-Tree (Join-Path $SourceDir 'data') (Join-Path $OutputDir 'data')
Copy-Tree (Join-Path $SourceDir 'js') (Join-Path $OutputDir 'js')

Write-Host "[3/5] Remove redundant folders (no functional impact)"
@('.git','__pycache__','temp_backup_check') | ForEach-Object {
  $p = Join-Path $OutputDir $_
  if (Test-Path $p) { Remove-Item -Recurse -Force $p }
}

Write-Host "[4/5] Check local SQL.js (optional)"
$sqlLocal = Join-Path $OutputDir 'bible_reading\js\libs\sql-wasm.js'
if (-not (Test-Path $sqlLocal)) {
  Write-Host "[WARN] Missing bible_reading/js/libs/sql-wasm.js (OK for JSON-only; required for SQLite)"
}

Write-Host "[5/5] Done"
Write-Host "Portable directory: $OutputDir"
Write-Host "Preview with: tools/start_server.ps1 -> http://127.0.0.1:8080/index.html"

