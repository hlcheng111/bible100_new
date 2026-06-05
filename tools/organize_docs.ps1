# ============================================
# 📚 文档整理脚本
# ============================================
# 功能: 将根目录的 .md 文档移动到 docs/reports/
# ============================================

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "   📚 文档整理工具" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# 确保目标文件夹存在
if (-not (Test-Path "docs\reports")) {
    Write-Host "创建 docs\reports\ 文件夹..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "docs\reports" -Force | Out-Null
}

# 获取根目录的所有 .md 文件（排除 rule.md）
$mdFiles = Get-ChildItem -Filter "*.md" -File | Where-Object { $_.Name -ne "rule.md" -and $_.Name -ne "README.md" }

Write-Host "找到 $($mdFiles.Count) 个文档文件" -ForegroundColor Cyan
Write-Host ""

if ($mdFiles.Count -eq 0) {
    Write-Host "没有需要移动的文件" -ForegroundColor Green
    exit 0
}

Write-Host "将要移动的文件:" -ForegroundColor Yellow
$mdFiles | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

$confirm = Read-Host "是否继续? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "开始移动文件..." -ForegroundColor Green

$moved = 0
$failed = 0

foreach ($file in $mdFiles) {
    try {
        Move-Item -Path $file.FullName -Destination "docs\reports\" -Force
        Write-Host "  ✓ $($file.Name)" -ForegroundColor Green
        $moved++
    } catch {
        Write-Host "  ✗ $($file.Name) - 失败" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ 整理完成!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "成功移动: $moved 个文件" -ForegroundColor Cyan
Write-Host "失败: $failed 个文件" -ForegroundColor Cyan
Write-Host "目标位置: docs\reports\" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

