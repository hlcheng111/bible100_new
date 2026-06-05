# ============================================
# 🎯 data/cj/ 图片优化脚本
# ============================================
# 功能: 批量压缩 data/cj/ 文件夹中的 JPG 图片
# 预计节省: 200-400 MB
# 使用方法: 在项目根目录运行此脚本
# ============================================

param(
    [string]$Quality = "85",  # 压缩质量 (1-100)
    [switch]$Test,            # 测试模式：只处理前10张图片
    [switch]$DryRun           # 演练模式：只显示将要做什么，不实际操作
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   🎯 data/cj/ 图片优化工具" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 检查 data/cj/ 文件夹是否存在
if (-not (Test-Path "data\cj")) {
    Write-Host "❌ 错误: data\cj\ 文件夹不存在！" -ForegroundColor Red
    Write-Host "   请在项目根目录运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 检查备份是否存在
if (-not (Test-Path "data_backup_20251010.zip")) {
    Write-Host "⚠️  警告: 未找到备份文件 data_backup_20251010.zip" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "是否继续? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "操作已取消" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "📊 扫描图片文件..." -ForegroundColor Green
$images = Get-ChildItem "data\cj" -Recurse -Include "*.jpg", "*.jpeg" -File
$totalImages = $images.Count
$originalSize = ($images | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "   找到 $totalImages 张 JPG 图片" -ForegroundColor Cyan
Write-Host "   当前总大小: $([math]::Round($originalSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

if ($Test) {
    Write-Host "🧪 测试模式: 只处理前10张图片" -ForegroundColor Yellow
    $images = $images | Select-Object -First 10
    Write-Host ""
}

if ($DryRun) {
    Write-Host "🔍 演练模式: 只显示操作，不实际执行" -ForegroundColor Yellow
    Write-Host ""
}

# 方案选择
Write-Host "请选择优化方案:" -ForegroundColor Green
Write-Host "  1. 使用 Windows 内置工具 (简单，效果中等)" -ForegroundColor White
Write-Host "  2. 使用 ImageMagick (强大，需要安装)" -ForegroundColor White
Write-Host "  3. 使用 Python + Pillow (推荐，需要Python)" -ForegroundColor White
Write-Host "  4. 手动优化指南" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📝 方案1: Windows内置工具" -ForegroundColor Cyan
        Write-Host "   由于Windows没有内置的JPG压缩工具，建议使用方案2或3" -ForegroundColor Yellow
        Write-Host ""
    }
    
    "2" {
        Write-Host ""
        Write-Host "📝 方案2: ImageMagick" -ForegroundColor Cyan
        Write-Host ""
        
        # 检查 ImageMagick 是否安装
        $magickInstalled = $null -ne (Get-Command "magick" -ErrorAction SilentlyContinue)
        
        if (-not $magickInstalled) {
            Write-Host "❌ ImageMagick 未安装" -ForegroundColor Red
            Write-Host ""
            Write-Host "安装步骤:" -ForegroundColor Yellow
            Write-Host "  1. 访问: https://imagemagick.org/script/download.php#windows" -ForegroundColor White
            Write-Host "  2. 下载并安装 Windows 版本" -ForegroundColor White
            Write-Host "  3. 重新运行此脚本" -ForegroundColor White
            Write-Host ""
            
            $openBrowser = Read-Host "是否打开下载页面? (y/N)"
            if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
                Start-Process "https://imagemagick.org/script/download.php#windows"
            }
            exit 1
        }
        
        Write-Host "✓ ImageMagick 已安装" -ForegroundColor Green
        Write-Host ""
        Write-Host "开始优化..." -ForegroundColor Green
        
        $processed = 0
        $savedSpace = 0
        
        foreach ($img in $images) {
            $processed++
            $originalFileSize = $img.Length / 1MB
            
            Write-Progress -Activity "优化图片" -Status "处理 $processed / $($images.Count)" -PercentComplete (($processed / $images.Count) * 100)
            
            if (-not $DryRun) {
                $tempFile = $img.FullName + ".tmp.jpg"
                
                try {
                    # 使用 ImageMagick 压缩
                    & magick convert $img.FullName -quality $Quality -strip $tempFile 2>$null
                    
                    if (Test-Path $tempFile) {
                        $newSize = (Get-Item $tempFile).Length / 1MB
                        $savings = $originalFileSize - $newSize
                        
                        if ($savings -gt 0) {
                            Move-Item -Path $tempFile -Destination $img.FullName -Force
                            $savedSpace += $savings
                        } else {
                            Remove-Item $tempFile -Force
                        }
                    }
                } catch {
                    Write-Host "  ⚠️  处理失败: $($img.Name)" -ForegroundColor Yellow
                    if (Test-Path $tempFile) {
                        Remove-Item $tempFile -Force
                    }
                }
            } else {
                Write-Host "  [演练] 将压缩: $($img.Name) ($([math]::Round($originalFileSize, 2)) MB)" -ForegroundColor Gray
            }
        }
        
        Write-Progress -Activity "优化图片" -Completed
        
        if (-not $DryRun) {
            Write-Host ""
            Write-Host "✅ 优化完成!" -ForegroundColor Green
            Write-Host "   处理图片: $processed 张" -ForegroundColor Cyan
            Write-Host "   节省空间: $([math]::Round($savedSpace, 2)) MB" -ForegroundColor Cyan
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📝 方案3: Python + Pillow (推荐)" -ForegroundColor Cyan
        Write-Host ""
        
        # 生成 Python 脚本
        $pythonScript = @'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 data/cj/ 图片优化脚本 (Python版)
使用 Pillow 库批量压缩 JPG 图片
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
    import pillow_avif  # 可选：支持 AVIF 格式
except ImportError:
    print("❌ 错误: 需要安装 Pillow 库")
    print("")
    print("安装命令:")
    print("  pip install Pillow pillow-avif")
    print("")
    sys.exit(1)

def optimize_image(image_path, quality=85):
    """优化单张图片"""
    try:
        with Image.open(image_path) as img:
            # 转换为 RGB (如果需要)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # 保存优化后的图片
            img.save(image_path, "JPEG", quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"  ⚠️  处理失败: {image_path.name} - {e}")
        return False

def main():
    print("=" * 50)
    print("   🎯 data/cj/ 图片优化工具 (Python版)")
    print("=" * 50)
    print("")
    
    cj_path = Path("data/cj")
    
    if not cj_path.exists():
        print("❌ 错误: data/cj/ 文件夹不存在！")
        sys.exit(1)
    
    # 扫描所有 JPG 图片
    print("📊 扫描图片文件...")
    images = list(cj_path.rglob("*.jpg")) + list(cj_path.rglob("*.jpeg"))
    
    print(f"   找到 {len(images)} 张 JPG 图片")
    
    # 计算原始大小
    original_size = sum(img.stat().st_size for img in images) / (1024 * 1024)
    print(f"   当前总大小: {original_size:.2f} MB")
    print("")
    
    # 确认开始
    response = input("是否开始优化? (y/N): ")
    if response.lower() != 'y':
        print("操作已取消")
        sys.exit(0)
    
    print("")
    print("开始优化...")
    
    processed = 0
    failed = 0
    
    for i, img_path in enumerate(images, 1):
        print(f"  [{i}/{len(images)}] {img_path.name}", end="")
        
        if optimize_image(img_path, quality=85):
            processed += 1
            print(" ✓")
        else:
            failed += 1
            print(" ✗")
    
    # 计算新大小
    new_size = sum(img.stat().st_size for img in images) / (1024 * 1024)
    saved = original_size - new_size
    
    print("")
    print("=" * 50)
    print("✅ 优化完成!")
    print(f"   处理成功: {processed} 张")
    print(f"   处理失败: {failed} 张")
    print(f"   原始大小: {original_size:.2f} MB")
    print(f"   优化后大小: {new_size:.2f} MB")
    print(f"   节省空间: {saved:.2f} MB ({(saved/original_size*100):.1f}%)")
    print("=" * 50)

if __name__ == "__main__":
    main()
'@
        
        $pythonScriptPath = "tools\optimize_cj_images.py"
        Set-Content -Path $pythonScriptPath -Value $pythonScript -Encoding UTF8
        
        Write-Host "✓ Python 脚本已生成: $pythonScriptPath" -ForegroundColor Green
        Write-Host ""
        
        # 检查 Python 是否安装
        $pythonInstalled = $null -ne (Get-Command "python" -ErrorAction SilentlyContinue)
        
        if (-not $pythonInstalled) {
            Write-Host "❌ Python 未安装" -ForegroundColor Red
            Write-Host ""
            Write-Host "安装步骤:" -ForegroundColor Yellow
            Write-Host "  1. 访问: https://www.python.org/downloads/" -ForegroundColor White
            Write-Host "  2. 下载并安装最新版本" -ForegroundColor White
            Write-Host "  3. 安装 Pillow: pip install Pillow" -ForegroundColor White
            Write-Host "  4. 运行: python $pythonScriptPath" -ForegroundColor White
            Write-Host ""
            exit 1
        }
        
        Write-Host "✓ Python 已安装" -ForegroundColor Green
        Write-Host ""
        Write-Host "执行命令:" -ForegroundColor Yellow
        Write-Host "  python $pythonScriptPath" -ForegroundColor White
        Write-Host ""
        
        $runNow = Read-Host "是否立即运行Python脚本? (y/N)"
        if ($runNow -eq 'y' -or $runNow -eq 'Y') {
            python $pythonScriptPath
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📝 方案4: 手动优化指南" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "推荐在线工具 (免费):" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. TinyPNG (批量压缩)" -ForegroundColor White
        Write-Host "     https://tinypng.com/" -ForegroundColor Gray
        Write-Host "     - 每次最多20张图片" -ForegroundColor Gray
        Write-Host "     - 压缩率: 50-80%" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. Squoosh (单张高质量压缩)" -ForegroundColor White
        Write-Host "     https://squoosh.app/" -ForegroundColor Gray
        Write-Host "     - Google 开发" -ForegroundColor Gray
        Write-Host "     - 支持多种格式" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  3. Compressor.io (批量)" -ForegroundColor White
        Write-Host "     https://compressor.io/" -ForegroundColor Gray
        Write-Host ""
        Write-Host "桌面软件 (推荐):" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. ImageOptim (Mac)" -ForegroundColor White
        Write-Host "  2. FileOptimizer (Windows)" -ForegroundColor White
        Write-Host "  3. XnConvert (跨平台)" -ForegroundColor White
        Write-Host ""
        Write-Host "操作步骤:" -ForegroundColor Yellow
        Write-Host "  1. 打开 data\cj\ 文件夹" -ForegroundColor White
        Write-Host "  2. 选择要优化的图片" -ForegroundColor White
        Write-Host "  3. 上传到在线工具或使用桌面软件" -ForegroundColor White
        Write-Host "  4. 下载优化后的图片替换原文件" -ForegroundColor White
        Write-Host ""
        
        $openFolder = Read-Host "是否打开 data\cj\ 文件夹? (y/N)"
        if ($openFolder -eq 'y' -or $openFolder -eq 'Y') {
            Invoke-Item "data\cj"
        }
    }
    
    default {
        Write-Host "无效选择" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""


















