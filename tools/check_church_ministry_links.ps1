# Check all Church Ministry sidebar links

$sidebarContent = Get-Content church_ministry/sidebar.html -Raw
$links = [regex]::Matches($sidebarContent, 'href="([^"]+\.html)"') | ForEach-Object { $_.Groups[1].Value }

$results = @()
$missing = @()
$existing = @()

foreach ($link in $links | Select-Object -Unique) {
    # Skip absolute URLs
    if ($link -match '^http' -or $link -match '^\.\./' -or $link -eq '#') {
        continue
    }
    
    $fullPath = "church_ministry/$link"
    $exists = Test-Path $fullPath
    
    if ($exists) {
        $existing += $link
    } else {
        $missing += $link
    }
}

Write-Host "============================================"
Write-Host "Church Ministry Sidebar Links Analysis"
Write-Host "============================================"
Write-Host ""
Write-Host "EXISTING FILES: $($existing.Count)"
Write-Host "--------------------------------------------"
$existing | ForEach-Object { Write-Host "  EXISTS: $_" }
Write-Host ""
Write-Host "MISSING FILES: $($missing.Count)"
Write-Host "--------------------------------------------"
$missing | ForEach-Object { Write-Host "  MISSING: $_" }
Write-Host ""
Write-Host "============================================"
Write-Host "Summary: $($existing.Count) exist, $($missing.Count) missing"
Write-Host "============================================"

