# Global tools automated test - no Node/browser required
# Verifies required files exist and global-tools.js contains expected symbols.
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bibleRoot = Split-Path -Parent $scriptDir

$files = @(
    "js\global-tools.js",
    "help\global-tools.htm",
    "help\my-saved.html",
    "help\ai-chooser.html",
    "help\translate.html",
    "help\my-participation.html",
    "help\tools-overview.html",
    "help\docs-hub.html",
    "tools\tools-overview-sidebar.html",
    "tests\global-tools-test.html"
)
$failed = $false
foreach ($f in $files) {
    $p = Join-Path $bibleRoot $f
    if (-not (Test-Path $p)) {
        Write-Host "Missing: $f" -ForegroundColor Red
        $failed = $true
    }
}
$scriptPath = Join-Path $bibleRoot "js\global-tools.js"
if (Test-Path $scriptPath) {
    $content = [System.IO.File]::ReadAllText($scriptPath)
    if ($content.Length -lt 200) {
        Write-Host "js/global-tools.js too short" -ForegroundColor Red
        $failed = $true
    }
    if ($content -notmatch 'getCurrentContext') {
        Write-Host "js/global-tools.js missing getCurrentContext" -ForegroundColor Red
        $failed = $true
    }
    if ($content -notmatch 'doTranslate|翻譯') {
        Write-Host "js/global-tools.js missing translate action" -ForegroundColor Red
        $failed = $true
    }
    if ($content -notmatch 'global-tools-bar') {
        Write-Host "js/global-tools.js missing toolbar class" -ForegroundColor Red
        $failed = $true
    }
    if ($content -notmatch 'toolsOverview|openToolsOverview') {
        Write-Host "js/global-tools.js missing toolsOverview action" -ForegroundColor Red
        $failed = $true
    }
}
if ($failed) {
    Write-Host "Global tools tests FAILED." -ForegroundColor Red
    exit 1
}
Write-Host "Global tools automated checks passed." -ForegroundColor Green
Write-Host "For full DOM test, open tests/global-tools-test.html in a browser."
exit 0
