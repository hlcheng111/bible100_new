# Fix CDN Links - Correct version
# Fix issues with auto_replace_cdn.ps1

Write-Host "=== 修正 CDN 链接 ===" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path ".." -Recurse -Include "*.html" -File

$replacements = @(
    @{
        Old = '<script src="assets/css/tailwind.min.css"></script>'
        New = '<link rel="stylesheet" href="assets/css/tailwind.min.css">'
    }
    @{
        Old = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        New = 'assets/css/fontawesome.min.css'
    }
    @{
        Old = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        New = 'assets/css/fontawesome.min.css'
    }
)

$totalFiles = $files.Count
$modifiedFiles = 0

Write-Host "找到 $totalFiles 个 HTML 文件" -ForegroundColor Green
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
        Write-Host "✓ 已修正: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host "修正文件数: $modifiedFiles" -ForegroundColor Cyan
Write-Host ""

