# ========================================
# CDN 资源本地化下载脚本
# Church Ministry Module - Asset Downloader
# ========================================

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  CDN 资源本地化下载脚本" -ForegroundColor Cyan
Write-Host "  Church Ministry Module" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 设置错误处理
$ErrorActionPreference = "Stop"

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetsPath = $scriptPath

# 创建目录结构
Write-Host "📁 创建目录结构..." -ForegroundColor Yellow
$cssPath = Join-Path $assetsPath "css"
$jsPath = Join-Path $assetsPath "js"
$fontsPath = Join-Path $cssPath "webfonts"

New-Item -ItemType Directory -Force -Path $cssPath | Out-Null
New-Item -ItemType Directory -Force -Path $jsPath | Out-Null
New-Item -ItemType Directory -Force -Path $fontsPath | Out-Null

Write-Host "✅ 目录创建完成" -ForegroundColor Green
Write-Host ""

# 下载文件函数
function Download-File {
    param(
        [string]$url,
        [string]$outputPath,
        [string]$description
    )
    
    Write-Host "📥 下载: $description" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor Gray
    Write-Host "   保存到: $outputPath" -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
        $fileSize = (Get-Item $outputPath).Length / 1KB
        Write-Host "   ✅ 完成 ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "开始下载 CDN 资源..." -ForegroundColor Cyan
Write-Host ""

$downloadResults = @()

# ========================================
# 1. Chart.js
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1/3 Chart.js (图表库)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$chartJsPath = Join-Path $jsPath "chart.min.js"
$result1 = Download-File `
    -url "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js" `
    -outputPath $chartJsPath `
    -description "Chart.js v3.9.1"
$downloadResults += @{Name="Chart.js"; Success=$result1; Path=$chartJsPath}
Write-Host ""

# ========================================
# 2. Tailwind CSS
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "2/3 Tailwind CSS (样式框架)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⚠️  注意: Tailwind CSS Play CDN 无法直接下载" -ForegroundColor Yellow
Write-Host "   建议使用完整版本或保持使用 CDN" -ForegroundColor Yellow
Write-Host ""
Write-Host "   方案A: 下载完整版 Tailwind CSS (推荐)" -ForegroundColor Cyan
$tailwindPath = Join-Path $cssPath "tailwind.min.css"
$result2 = Download-File `
    -url "https://unpkg.com/tailwindcss@3.3.0/dist/tailwind.min.css" `
    -outputPath $tailwindPath `
    -description "Tailwind CSS v3.3.0 (完整版)"
$downloadResults += @{Name="Tailwind CSS"; Success=$result2; Path=$tailwindPath}
Write-Host ""

# ========================================
# 3. Font Awesome
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "3/3 Font Awesome (图标字体)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$fontAwesomePath = Join-Path $cssPath "fontawesome.min.css"
$result3 = Download-File `
    -url "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" `
    -outputPath $fontAwesomePath `
    -description "Font Awesome v6.0.0"
$downloadResults += @{Name="Font Awesome CSS"; Success=$result3; Path=$fontAwesomePath}
Write-Host ""

# 下载 Font Awesome 字体文件
Write-Host "📥 下载 Font Awesome 字体文件..." -ForegroundColor Yellow
$fontFiles = @(
    "fa-brands-400.woff2",
    "fa-brands-400.ttf",
    "fa-regular-400.woff2",
    "fa-regular-400.ttf",
    "fa-solid-900.woff2",
    "fa-solid-900.ttf"
)

foreach ($fontFile in $fontFiles) {
    $fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/$fontFile"
    $fontOutputPath = Join-Path $fontsPath $fontFile
    $resultFont = Download-File `
        -url $fontUrl `
        -outputPath $fontOutputPath `
        -description "Font: $fontFile"
    $downloadResults += @{Name=$fontFile; Success=$resultFont; Path=$fontOutputPath}
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "下载完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 显示结果统计
$successCount = ($downloadResults | Where-Object { $_.Success }).Count
$failCount = ($downloadResults | Where-Object { -not $_.Success }).Count
$totalCount = $downloadResults.Count

Write-Host "📊 下载统计:" -ForegroundColor Cyan
Write-Host "   总计: $totalCount 个文件" -ForegroundColor White
Write-Host "   成功: $successCount 个" -ForegroundColor Green
Write-Host "   失败: $failCount 个" -ForegroundColor Red
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "❌ 失败的文件:" -ForegroundColor Red
    $downloadResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "   - $($_.Name)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "📁 文件保存位置:" -ForegroundColor Cyan
Write-Host "   $assetsPath" -ForegroundColor White
Write-Host ""

Write-Host "✅ 下一步: 运行替换脚本更新 HTML 文件" -ForegroundColor Green
Write-Host "   执行命令: .\REPLACE_CDN_LINKS.ps1" -ForegroundColor Yellow
Write-Host ""

# 创建下载清单文件
$manifestPath = Join-Path $assetsPath "download_manifest.json"
$manifest = @{
    downloadDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    files = $downloadResults | ForEach-Object {
        @{
            name = $_.Name
            success = $_.Success
            path = $_.Path
        }
    }
    statistics = @{
        total = $totalCount
        success = $successCount
        failed = $failCount
    }
}
$manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8

Write-Host "📋 下载清单已保存: download_manifest.json" -ForegroundColor Gray
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

