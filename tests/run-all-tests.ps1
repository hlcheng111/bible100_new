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

$configSyncResult = 0
python "$scriptDir\test_config_embedded_sync.py"
$configSyncResult = $LASTEXITCODE
if ($configSyncResult -ne 0) {
    Write-Host "config-embedded sync test failed (exit $configSyncResult). Run: node scripts/generate_config_embedded.js" -ForegroundColor Red
    exit 1
}

$liveToolsResult = 0
python "$scriptDir\test_all_live_tools_smoke.py"
$liveToolsResult = $LASTEXITCODE
if ($liveToolsResult -ne 0) {
    Write-Host "18 live tools smoke failed (exit $liveToolsResult). Run: python tests/test_all_live_tools_smoke.py" -ForegroundColor Red
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
Write-Host "All automated tests passed (index_v5 + 18 live tools smoke + TOC + global tools)." -ForegroundColor Green
exit 0
