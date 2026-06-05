Param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\.."),
  [string]$Archive = (Join-Path (Resolve-Path "$PSScriptRoot\..") 'archive')
)

Write-Host "Start in-place cleanup: $Root"
New-Item -ItemType Directory -Force -Path $Archive | Out-Null
$destTests = Join-Path $Archive 'tests'; New-Item -ItemType Directory -Force -Path $destTests | Out-Null
$destDebug = Join-Path $Archive 'debug'; New-Item -ItemType Directory -Force -Path $destDebug | Out-Null
$destDup   = Join-Path $Archive 'duplicates'; New-Item -ItemType Directory -Force -Path $destDup | Out-Null

$moved = @{tests=0; debug=0; dup=0; folders=0}

function Get-Candidates([string]$pattern){
  Get-ChildItem -Path $Root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "\\archive(\\|$)" -and $_.FullName -notmatch "\\portable_build(\\|$)" } |
    Where-Object { $_.Name -like $pattern }
}

function Move-List($items, $targetDir){
  foreach($f in $items){
    $rel = $f.FullName.Substring($Root.Length) -replace '^[\\/]+',''
    $destPath = Join-Path $targetDir $rel
    New-Item -ItemType Directory -Force -Path (Split-Path $destPath) | Out-Null
    try {
      Move-Item -Force $f.FullName $destPath -ErrorAction Stop
    } catch {
      Write-Host ("[SKIP] {0}" -f $f.FullName)
    }
  }
}

Write-Host '[1/4] Archive test/diagnose files'
$list = @()
$list += Get-Candidates '*test*.html'
$list += Get-Candidates '*test*.js'
Move-List $list $destTests
$moved.tests = (Get-ChildItem $destTests -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host '[2/4] Archive debug files'
$list = @()
$list += Get-Candidates 'debug*.html'
$list += Get-Candidates '*debug*.html'
$list += Get-Candidates 'debug*.js'
Move-List $list $destDebug
$moved.debug = (Get-ChildItem $destDebug -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host '[3/4] Archive duplicate (- 複製) files (keep root "index - 複製.html")'
$list = Get-Candidates '* - 複製.html' | Where-Object { $_.FullName -ne (Join-Path $Root 'index - 複製.html') }
Move-List $list $destDup
$moved.dup = (Get-ChildItem $destDup -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Host '[4/4] Archive folder temp_backup_check'
$tempBackup = Join-Path $Root 'temp_backup_check'
if (Test-Path $tempBackup) {
  $dest = Join-Path $Archive 'temp_backup_check'
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  Move-Item -Force $tempBackup $dest
  $moved.folders++
}

# Additional: archive dev scripts (*.py) except under portable_build/archive
Write-Host '[extra] Archive developer scripts (*.py)'
$pyList = Get-ChildItem -Path $Root -Recurse -File -Include *.py -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\archive(\\|$)" -and $_.FullName -notmatch "\\portable_build(\\|$)" }
$destPy = Join-Path $Archive 'dev_scripts'
New-Item -ItemType Directory -Force -Path $destPy | Out-Null
Move-List $pyList $destPy

# Additional: archive reports (report*.json/md, *report*.json/md) outside data/
Write-Host '[extra] Archive reports (*report*.json|md)'
$repList = Get-ChildItem -Path $Root -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\archive(\\|$)" -and $_.FullName -notmatch "\\portable_build(\\|$)" -and $_.FullName -notmatch "\\data(\\|$)" } |
  Where-Object { $_.Name -match '(?i)report.*\.(json|md)$' -or $_.Name -match '(?i).*report.*\.(json|md)$' }
$destRep = Join-Path $Archive 'reports'
New-Item -ItemType Directory -Force -Path $destRep | Out-Null
Move-List $repList $destRep

$report = @()
$report += "tests archived: $($moved.tests)"
$report += "debug archived: $($moved.debug)"
$report += "duplicates archived: $($moved.dup)"
$report += "folders archived: $($moved.folders)"
$report += "py archived: $((Get-ChildItem $destPy -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count)"
$report += "reports archived: $((Get-ChildItem $destRep -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count)"
$reportText = ($report -join "`r`n")
Set-Content -Path (Join-Path $Archive 'CLEAN_REPORT.txt') -Value $reportText -Encoding UTF8
Write-Host ("Done. Report: {0}" -f (Join-Path $Archive 'CLEAN_REPORT.txt'))

