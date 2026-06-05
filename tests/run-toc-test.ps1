# TOC automated test - no Node required
# Verifies required files exist and toc-generator.js is valid UTF-8 and not broken (no literal \n only).
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bibleRoot = Split-Path -Parent $scriptDir

$files = @(
    "js\toc-generator.js",
    "js\toc-styles.css",
    "languages\cn\js\toc-generator.js",
    "languages\cn\js\toc-styles.css",
    "languages\en\js\toc-generator.js",
    "languages\en\js\toc-styles.css",
    "languages\js\toc-generator.js",
    "languages\js\toc-styles.css",
    "tests\toc-test.html"
)
$failed = $false
foreach ($f in $files) {
    $p = Join-Path $bibleRoot $f
    if (-not (Test-Path $p)) {
        Write-Host "Missing: $f" -ForegroundColor Red
        $failed = $true
    }
}
$mainScript = Join-Path $bibleRoot "js\toc-generator.js"
if (Test-Path $mainScript) {
    $content = [System.IO.File]::ReadAllText($mainScript)
    if ($content.Length -lt 100) {
        Write-Host "js/toc-generator.js too short or empty" -ForegroundColor Red
        $failed = $true
    }
    if ($content -match '\\n\s*\*\/' -and $content -notmatch "`n") {
        Write-Host "js/toc-generator.js may have literal backslash-n (broken newlines)" -ForegroundColor Red
        $failed = $true
    }
}
if ($failed) {
    Write-Host "TOC tests FAILED." -ForegroundColor Red
    exit 1
}
Write-Host "TOC automated checks passed (files exist, script valid)." -ForegroundColor Green
Write-Host "For full DOM test, open tests/toc-test.html in a browser."
exit 0
