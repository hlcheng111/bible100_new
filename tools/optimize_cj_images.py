#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 data/cj/ 图片优化脚本 (Python版)
使用 Pillow 库批量压缩 JPG 图片
预计节省: 200-400 MB
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ 错误: 需要安装 Pillow 库")
    print("")
    print("安装命令:")
    print("  pip install Pillow")
    print("")
    sys.exit(1)

def optimize_image(image_path, quality=85, backup=False):
    """
    优化单张图片
    
    Args:
        image_path: 图片路径
        quality: 压缩质量 (1-100)
        backup: 是否备份原文件
    
    Returns:
        tuple: (success, original_size, new_size)
    """
    try:
        original_size = image_path.stat().st_size
        
        # 如果需要备份
        if backup:
            backup_path = image_path.with_suffix('.jpg.backup')
            import shutil
            shutil.copy2(image_path, backup_path)
        
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
    import sys
    import io
    
    # Fix encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("   🎯 data/cj/ 图片优化工具 (Python版)")
    print("=" * 60)
    print("")
    
    cj_path = Path("data/cj")
    
    if not cj_path.exists():
        print("❌ 错误: data/cj/ 文件夹不存在！")
        print("   请在项目根目录运行此脚本")
        sys.exit(1)
    
    # 扫描所有 JPG 图片
    print("📊 扫描图片文件...")
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
    
    # 确认开始
    response = input("是否开始优化? (y/N): ")
    if response.lower() != 'y':
        print("操作已取消")
        sys.exit(0)
    
    print("")
    print("=" * 60)
    print("开始优化...")
    print("=" * 60)
    print("")
    
    processed = 0
    failed = 0
    total_original = 0
    total_new = 0
    
    for i, img_path in enumerate(images, 1):
        percentage = (i / len(images)) * 100
        print(f"  [{i}/{len(images)}] ({percentage:.1f}%) {img_path.name}", end="")
        
        success, orig_size, new_size = optimize_image(img_path, quality=quality)
        
        if success:
            processed += 1
            total_original += orig_size
            total_new += new_size
            saved = orig_size - new_size
            saved_pct = (saved / orig_size * 100) if orig_size > 0 else 0
            print(f" ✓ (节省 {saved_pct:.1f}%)")
        else:
            failed += 1
            print(" ✗ 失败")
    
    # 计算总节省
    total_saved = total_original - total_new
    saved_pct = (total_saved / total_original * 100) if total_original > 0 else 0
    
    print("")
    print("=" * 60)
    print("✅ 优化完成!")
    print("=" * 60)
    print(f"处理成功: {processed} 张")
    print(f"处理失败: {failed} 张")
    print(f"原始大小: {format_size(total_original)}")
    print(f"优化后: {format_size(total_new)}")
    print(f"节省空间: {format_size(total_saved)} ({saved_pct:.1f}%)")
    print("=" * 60)
    print("")
    
    if processed > 0:
        print("✅ 建议:")
        print("  1. 测试图片显示是否正常")
        print("  2. 如有问题，使用备份恢复: data_backup_20251010.zip")
        print("")

if __name__ == "__main__":
    main()

