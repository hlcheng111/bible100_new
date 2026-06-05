# Auto CDN Replacement Script
# Automatically replace CDN links with local paths

Write-Host "=== CDN Auto Replacement ===" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path ".." -Recurse -Include "*.html" -File

$replacements = @(
    @{
        Old = 'https://cdn.tailwindcss.com'
        New = 'assets/css/tailwind.min.css'
    },
    @{
        Old = 'https://cdn.jsdelivr.net/npm/chart.js'
        New = 'assets/js/chart.min.js'
    },
    @{
        Old = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        New = 'assets/css/fontawesome.min.css'
    }
)

$totalFiles = $files.Count
$modifiedFiles = 0

Write-Host "Found $totalFiles HTML files" -ForegroundColor Green
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match [regex]::Escape($replacement.Old)) {
            $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $modifiedFiles++
        Write-Host "Modified: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Green
Write-Host "Modified: $modifiedFiles files" -ForegroundColor Cyan
Write-Host ""


















