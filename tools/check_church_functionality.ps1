# Deep check Church Ministry pages functionality

$existingFiles = @(
    'modules/worship/worship-team-management.html',
    'modules/worship/song-library.html',
    'modules/education/education-management.html',
    'modules/education/sunday-school.html',
    'modules/education/training-programs.html',
    'modules/fellowship/index.html',
    'modules/fellowship/small-groups.html',
    'modules/fellowship/visitation-ministry.html',
    'modules/tech/ai-assistant.html',
    'modules/tech/smart-recommendation.html',
    'modules/administration/financial-management.html',
    'modules/equipment/equipment-management.html',
    'modules/library/library-management.html',
    'modules/research/member-statistics.html',
    'modules/research/ministry-performance.html',
    'modules/research/growth-trends.html',
    'modules/development/development-plan.html',
    'modules/development/discipleship-training.html',
    'modules/development/leadership-development.html',
    'modules/development/spiritual-growth.html',
    'modules/expansion/church-planting.html',
    'modules/expansion/branch-management.html',
    'modules/expansion/mission-expansion.html',
    'modules/expansion/cross-cultural.html',
    'modules/innovation/innovation-projects.html',
    'modules/innovation/technology-integration.html',
    'modules/innovation/new-media.html',
    'modules/innovation/youth-innovation.html'
)

Write-Host "================================================"
Write-Host "Checking functionality of existing pages..."
Write-Host "================================================"
Write-Host ""

$hasFunction = @()
$hasAlert = @()
$unclear = @()

foreach ($file in $existingFiles) {
    $fullPath = "church_ministry/$file"
    $content = Get-Content $fullPath -Raw
    
    $lines = (Get-Content $fullPath | Measure-Object -Line).Lines
    
    # Check for alert with "下一版本"
    $hasAlertPattern = $content -match "alert\([^)]*下一版本"
    
    # Check for LocalStorage
    $hasLocalStorage = $content -match "localStorage"
    
    # Check for real functions (not just alert)
    $hasSaveFunction = $content -match "function\s+save[^(]*\([^)]*\)\s*\{"
    $hasDeleteFunction = $content -match "function\s+delete[^(]*\([^)]*\)\s*\{"
    
    $status = ""
    if ($hasAlertPattern) {
        $status = "SHELL (has alert)"
        $hasAlert += $file
    } elseif ($hasLocalStorage -and ($hasSaveFunction -or $hasDeleteFunction)) {
        $status = "COMPLETE (has functions)"
        $hasFunction += $file
    } elseif ($lines -lt 150) {
        $status = "UNCLEAR (small file)"
        $unclear += $file
    } else {
        $status = "LIKELY COMPLETE"
        $hasFunction += $file
    }
    
    Write-Host "$($file.PadRight(55)) : $lines lines - $status"
}

Write-Host ""
Write-Host "================================================"
Write-Host "SUMMARY"
Write-Host "================================================"
Write-Host "COMPLETE (has functions): $($hasFunction.Count)"
Write-Host "SHELL (has alert): $($hasAlert.Count)"
Write-Host "UNCLEAR (needs check): $($unclear.Count)"
Write-Host "================================================"

