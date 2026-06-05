#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 data/cj/ 图片优化脚本 (自动执行版)
使用 Pillow 库批量压缩 JPG 图片
预计节省: 200-400 MB
"""

import os
import sys
from pathlib import Path
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from PIL import Image
except ImportError:
    print("❌ 错误: 需要安装 Pillow 库")
    print("")
    print("安装命令:")
    print("  pip install Pillow")
    print("")
    sys.exit(1)

def optimize_image(image_path, quality=85):
    """
    优化单张图片
    
    Args:
        image_path: 图片路径
        quality: 压缩质量 (1-100)
    
    Returns:
        tuple: (success, original_size, new_size)
    """
    try:
        original_size = image_path.stat().st_size
        
        with Image.open(image_path) as img:
            # 转换为 RGB (如果需要)
            if img.mode in ("RGBA", "P", "LA"):
                img = img.convert("RGB")
            
            # 保存优化后的图片
            img.save(image_path, "JPEG", quality=quality, optimize=True)
        
        new_size = image_path.stat().st_size
        return True, original_size, new_size
        
    except Exception as e:
        return False, 0, 0

def format_size(size_bytes):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def main():
    print("=" * 60)
    print("   data/cj/ 图片优化工具 (自动执行版)")
    print("=" * 60)
    print("")
    
    cj_path = Path("data/cj")
    
    if not cj_path.exists():
        print("错误: data/cj/ 文件夹不存在！")
        print("   请在项目根目录运行此脚本")
        sys.exit(1)
    
    # 扫描所有 JPG 图片
    print("扫描图片文件...")
    images = list(cj_path.rglob("*.jpg")) + list(cj_path.rglob("*.jpeg"))
    
    if not images:
        print("   未找到 JPG 图片")
        sys.exit(0)
    
    print(f"   找到 {len(images)} 张 JPG 图片")
    
    # 计算原始大小
    original_total_size = sum(img.stat().st_size for img in images)
    print(f"   当前总大小: {format_size(original_total_size)}")
    print("")
    
    # 显示设置
    quality = 85
    print(f"压缩设置:")
    print(f"  - 质量: {quality}%")
    print(f"  - 优化: 是")
    print(f"  - 备份: 否 (已有 data_backup_20251010.zip)")
    print("")
    
    # 自动开始，不需要确认
    print("自动开始优化...")
    print("")
    print("=" * 60)
    print("")
    
    processed = 0
    failed = 0
    total_original = 0
    total_new = 0
    
    for i, img_path in enumerate(images, 1):
        percentage = (i / len(images)) * 100
        
        # 每50张显示一次进度
        if i % 50 == 0 or i == 1 or i == len(images):
            print(f"  进度: {i}/{len(images)} ({percentage:.1f}%)")
        
        success, orig_size, new_size = optimize_image(img_path, quality=quality)
        
        if success:
            processed += 1
            total_original += orig_size
            total_new += new_size
        else:
            failed += 1
            if failed <= 5:  # 只显示前5个失败
                print(f"  失败: {img_path.name}")
    
    # 计算总节省
    total_saved = total_original - total_new
    saved_pct = (total_saved / total_original * 100) if total_original > 0 else 0
    
    print("")
    print("=" * 60)
    print("优化完成!")
    print("=" * 60)
    print(f"处理成功: {processed} 张")
    print(f"处理失败: {failed} 张")
    print(f"原始大小: {format_size(total_original)}")
    print(f"优化后: {format_size(total_new)}")
    print(f"节省空间: {format_size(total_saved)} ({saved_pct:.1f}%)")
    print("=" * 60)
    print("")
    
    if processed > 0:
        print("建议:")
        print("  1. 测试图片显示是否正常")
        print("  2. 如有问题，使用备份恢复: data_backup_20251010.zip")
        print("")
    
    # 创建完成报告
    report_path = Path("data/cj/优化完成报告.txt")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("data/cj/ 图片优化完成报告\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"优化时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"处理成功: {processed} 张\n")
        f.write(f"处理失败: {failed} 张\n")
        f.write(f"原始大小: {format_size(total_original)}\n")
        f.write(f"优化后大小: {format_size(total_new)}\n")
        f.write(f"节省空间: {format_size(total_saved)} ({saved_pct:.1f}%)\n")
        f.write(f"压缩质量: {quality}%\n")
        f.write("\n备份文件: data_backup_20251010.zip\n")
    
    print(f"完成报告已保存: {report_path}")

if __name__ == "__main__":
    main()


















