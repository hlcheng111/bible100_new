# ========================================
# CDN 链接替换脚本 (安全版本)
# Church Ministry Module - CDN Link Replacer
# ========================================

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  CDN 链接替换脚本 (安全版)" -ForegroundColor Cyan
Write-Host "  Church Ministry Module" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 设置错误处理
$ErrorActionPreference = "Stop"

# 获取church_ministry目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$churchMinistryPath = Split-Path -Parent $scriptPath

Write-Host "📁 工作目录: $churchMinistryPath" -ForegroundColor Gray
Write-Host ""

# ========================================
# 安全检查
# ========================================
Write-Host "🔍 安全检查..." -ForegroundColor Yellow

# 检查资源文件是否存在
$chartJsPath = Join-Path $scriptPath "js\chart.min.js"
$tailwindPath = Join-Path $scriptPath "css\tailwind.min.css"
$fontAwesomePath = Join-Path $scriptPath "css\fontawesome.min.css"

$missingFiles = @()
if (-not (Test-Path $chartJsPath)) { $missingFiles += "chart.min.js" }
if (-not (Test-Path $tailwindPath)) { $missingFiles += "tailwind.min.css" }
if (-not (Test-Path $fontAwesomePath)) { $missingFiles += "fontawesome.min.css" }

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 错误: 以下资源文件不存在:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "请先运行下载脚本: .\DOWNLOAD_ASSETS.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ 资源文件检查通过" -ForegroundColor Green
Write-Host ""

# ========================================
# 查找使用CDN的文件
# ========================================
Write-Host "🔍 扫描使用 CDN 的文件..." -ForegroundColor Yellow

$htmlFiles = Get-ChildItem -Path $churchMinistryPath -Filter "*.html" -Recurse | 
    Where-Object { $_.FullName -notlike "*\assets\*" -and $_.FullName -notlike "*\archive\*" }

$cdnFiles = @()
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match "cdn\.tailwindcss\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com") {
        $cdnFiles += $file
    }
}

Write-Host "   找到 $($cdnFiles.Count) 个使用 CDN 的文件" -ForegroundColor White
Write-Host ""

if ($cdnFiles.Count -eq 0) {
    Write-Host "✅ 没有找到使用 CDN 的文件，无需替换" -ForegroundColor Green
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

# ========================================
# 选择替换模式
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "请选择替换模式:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [1] 测试模式 - 只替换 1 个文件 (database_integration.html)" -ForegroundColor Green
Write-Host "  [2] 逐步模式 - 每次替换 1 个文件，需要确认" -ForegroundColor Yellow
Write-Host "  [3] 批量模式 - 一次性替换所有文件 (需二次确认)" -ForegroundColor Red
Write-Host "  [0] 退出" -ForegroundColor Gray
Write-Host ""
$mode = Read-Host "请输入选项 [1/2/3/0]"

if ($mode -eq "0") {
    Write-Host "已取消操作" -ForegroundColor Yellow
    exit 0
}

# ========================================
# 替换函数
# ========================================
function Replace-CDNLinks {
    param(
        [string]$filePath,
        [bool]$createBackup = $true
    )
    
    $fileName = Split-Path $filePath -Leaf
    $relativePath = $filePath.Replace($churchMinistryPath + "\", "")
    
    Write-Host ""
    Write-Host "📝 处理文件: $relativePath" -ForegroundColor Cyan
    
    # 计算相对路径深度
    $depth = ($relativePath -split "\\").Count - 1
    $relativeAssetsPath = "../" * $depth + "assets"
    
    Write-Host "   深度: $depth 层" -ForegroundColor Gray
    Write-Host "   Assets路径: $relativeAssetsPath" -ForegroundColor Gray
    
    # 创建备份
    if ($createBackup) {
        $backupPath = $filePath + ".backup"
        Copy-Item -Path $filePath -Destination $backupPath -Force
        Write-Host "   ✅ 备份创建: $fileName.backup" -ForegroundColor Green
    }
    
    # 读取文件
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # 执行替换
    $replacements = 0
    
    # 1. Chart.js
    if ($content -match "https://cdn\.jsdelivr\.net/npm/chart\.js") {
        $content = $content -replace 'https://cdn\.jsdelivr\.net/npm/chart\.js(@[\d.]+)?(/dist/chart\.min\.js)?', "$relativeAssetsPath/js/chart.min.js"
        $replacements++
        Write-Host "   ✅ Chart.js → 本地" -ForegroundColor Green
    }
    
    # 2. Tailwind CSS
    if ($content -match "https://cdn\.tailwindcss\.com") {
        $content = $content -replace 'https://cdn\.tailwindcss\.com', "$relativeAssetsPath/css/tailwind.min.css"
        $replacements++
        Write-Host "   ✅ Tailwind CSS → 本地" -ForegroundColor Green
    }
    
    # 3. Font Awesome CSS
    if ($content -match "cdnjs\.cloudflare\.com/ajax/libs/font-awesome") {
        $content = $content -replace 'https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[\d.]+/css/all\.min\.css', "$relativeAssetsPath/css/fontawesome.min.css"
        
        # 需要修改 Font Awesome CSS 文件中的字体路径
        $faContent = Get-Content $fontAwesomePath -Raw -Encoding UTF8
        if ($faContent -match '\.\./webfonts/') {
            $faContent = $faContent -replace '\.\./webfonts/', 'webfonts/'
            Set-Content -Path $fontAwesomePath -Value $faContent -Encoding UTF8
        }
        
        $replacements++
        Write-Host "   ✅ Font Awesome → 本地" -ForegroundColor Green
    }
    
    # 保存文件
    if ($replacements -gt 0) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "   ✅ 已保存 ($replacements 处替换)" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "   ⚠️  没有找到需要替换的CDN链接" -ForegroundColor Yellow
        if ($createBackup -and (Test-Path ($filePath + ".backup"))) {
            Remove-Item ($filePath + ".backup")
        }
        return $false
    }
}

# ========================================
# 执行替换
# ========================================
$processedFiles = @()
$successCount = 0

switch ($mode) {
    "1" {
        # 测试模式 - 只替换 database_integration.html
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "测试模式：只替换 database_integration.html" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        
        $testFile = Join-Path $churchMinistryPath "database_integration.html"
        if (Test-Path $testFile) {
            $result = Replace-CDNLinks -filePath $testFile
            if ($result) {
                $successCount++
                $processedFiles += $testFile
            }
        }
        else {
            Write-Host "❌ 找不到测试文件: database_integration.html" -ForegroundColor Red
        }
    }
    
    "2" {
        # 逐步模式
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "逐步模式：每次处理一个文件" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        
        foreach ($file in $cdnFiles) {
            $relativePath = $file.FullName.Replace($churchMinistryPath + "\", "")
            Write-Host ""
            Write-Host "📄 文件: $relativePath" -ForegroundColor White
            $confirm = Read-Host "   处理这个文件? [Y/N/Q(退出)]"
            
            if ($confirm -eq "Q" -or $confirm -eq "q") {
                Write-Host "   用户取消操作" -ForegroundColor Yellow
                break
            }
            
            if ($confirm -eq "Y" -or $confirm -eq "y") {
                $result = Replace-CDNLinks -filePath $file.FullName
                if ($result) {
                    $successCount++
                    $processedFiles += $file.FullName
                }
            }
            else {
                Write-Host "   ⏭️  跳过" -ForegroundColor Gray
            }
        }
    }
    
    "3" {
        # 批量模式
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
        Write-Host "⚠️  警告：批量模式" -ForegroundColor Red
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
        Write-Host ""
        Write-Host "将一次性替换 $($cdnFiles.Count) 个文件" -ForegroundColor Yellow
        Write-Host "所有文件都会创建 .backup 备份" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "确定继续吗? [YES/NO]"
        
        if ($confirm -eq "YES") {
            Write-Host ""
            Write-Host "开始批量替换..." -ForegroundColor Cyan
            
            foreach ($file in $cdnFiles) {
                $result = Replace-CDNLinks -filePath $file.FullName
                if ($result) {
                    $successCount++
                    $processedFiles += $file.FullName
                }
            }
        }
        else {
            Write-Host "已取消批量操作" -ForegroundColor Yellow
            exit 0
        }
    }
}

# ========================================
# 完成报告
# ========================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "替换完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 处理统计:" -ForegroundColor Cyan
Write-Host "   成功替换: $successCount 个文件" -ForegroundColor Green
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✅ 下一步：测试修改后的页面" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   请打开以下文件测试:" -ForegroundColor White
    
    if ($mode -eq "1") {
        Write-Host "   📄 file:///$($testFile.Replace('\', '/'))" -ForegroundColor Cyan
    }
    else {
        $processedFiles | Select-Object -First 3 | ForEach-Object {
            Write-Host "   📄 file:///$($_.Replace('\', '/'))" -ForegroundColor Cyan
        }
        if ($processedFiles.Count -gt 3) {
            Write-Host "   ... 还有 $($processedFiles.Count - 3) 个文件" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "🔄 如果出现问题，回退方法:" -ForegroundColor Yellow
    Write-Host "   所有修改的文件都有 .backup 备份" -ForegroundColor White
    Write-Host "   运行回退脚本: .\ROLLBACK_CHANGES.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

