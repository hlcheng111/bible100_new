# ========================================
# 回退脚本 - 恢复所有修改
# Church Ministry Module - Rollback Script
# ========================================

Write-Host "====================================" -ForegroundColor Red
Write-Host "  回退脚本 - 恢复所有修改" -ForegroundColor Red
Write-Host "  Church Ministry Module" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red
Write-Host ""

# 设置错误处理
$ErrorActionPreference = "Continue"

# 获取church_ministry目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$churchMinistryPath = Split-Path -Parent $scriptPath

Write-Host "📁 工作目录: $churchMinistryPath" -ForegroundColor Gray
Write-Host ""

# ========================================
# 查找备份文件
# ========================================
Write-Host "🔍 查找备份文件..." -ForegroundColor Yellow

$backupFiles = Get-ChildItem -Path $churchMinistryPath -Filter "*.backup" -Recurse | 
    Where-Object { $_.FullName -notlike "*\assets\*" }

if ($backupFiles.Count -eq 0) {
    Write-Host "❌ 没有找到备份文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "   - 还没有运行替换脚本" -ForegroundColor Gray
    Write-Host "   - 备份文件已被删除" -ForegroundColor Gray
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host "   找到 $($backupFiles.Count) 个备份文件" -ForegroundColor White
Write-Host ""

# ========================================
# 显示备份文件列表
# ========================================
Write-Host "📋 备份文件列表:" -ForegroundColor Cyan
$backupFiles | Select-Object -First 10 | ForEach-Object {
    $relativePath = $_.FullName.Replace($churchMinistryPath + "\", "")
    Write-Host "   $relativePath" -ForegroundColor Gray
}
if ($backupFiles.Count -gt 10) {
    Write-Host "   ... 还有 $($backupFiles.Count - 10) 个文件" -ForegroundColor Gray
}
Write-Host ""

# ========================================
# 确认回退
# ========================================
Write-Host "⚠️  警告：这将恢复所有文件到修改前的状态" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "确定要回退吗? [YES/NO]"

if ($confirm -ne "YES") {
    Write-Host "已取消回退操作" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

# ========================================
# 执行回退
# ========================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "开始回退..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($backupFile in $backupFiles) {
    $originalFile = $backupFile.FullName.Replace(".backup", "")
    $relativePath = $originalFile.Replace($churchMinistryPath + "\", "")
    
    Write-Host "📄 恢复: $relativePath" -ForegroundColor White
    
    try {
        # 恢复备份
        Copy-Item -Path $backupFile.FullName -Destination $originalFile -Force
        
        # 删除备份文件
        Remove-Item -Path $backupFile.FullName -Force
        
        Write-Host "   ✅ 已恢复" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "   ❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

# ========================================
# 完成报告
# ========================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "回退完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 恢复统计:" -ForegroundColor Cyan
Write-Host "   成功: $successCount 个文件" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   失败: $failCount 个文件" -ForegroundColor Red
}
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✅ 所有文件已恢复到修改前的状态" -ForegroundColor Green
    Write-Host "   HTML 文件已恢复为使用 CDN 链接" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 提示：assets 文件夹中的本地资源仍然保留" -ForegroundColor Yellow
    Write-Host "   如需完全清理，请手动删除 assets 文件夹" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

