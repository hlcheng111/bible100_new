# Run TOC + Global tools automated tests
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bibleRoot = Split-Path -Parent $scriptDir
Set-Location $bibleRoot

$v5Result = 0
python "$scriptDir\test_index_v5_shell.py"
$v5Result = $LASTEXITCODE
if ($v5Result -ne 0) {
    Write-Host "index_v5 shell static test failed (exit $v5Result)." -ForegroundColor Red
    exit 1
}

$tocResult = 0
$gtResult = 0
& "$scriptDir\run-toc-test.ps1"
$tocResult = $LASTEXITCODE
& "$scriptDir\run-global-tools-test.ps1"
$gtResult = $LASTEXITCODE

if ($tocResult -ne 0 -or $gtResult -ne 0) {
    Write-Host "Some tests failed (TOC: $tocResult, Global tools: $gtResult)." -ForegroundColor Red
    exit 1
}
Write-Host "All automated tests passed (index_v5 + TOC + global tools)." -ForegroundColor Green
exit 0
