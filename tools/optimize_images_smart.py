#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 智能图片优化脚本
只优化那些能减小文件大小的图片
"""

import os
import sys
from pathlib import Path
import io
import tempfile
import shutil

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("安装命令: pip install Pillow")
    sys.exit(1)

def optimize_image_smart(image_path, quality=85):
    """
    智能优化：只有当优化后文件更小时才保存
    
    Returns:
        tuple: (success, original_size, new_size, saved_bytes)
    """
    try:
        original_size = image_path.stat().st_size
        
        # 如果文件很小，跳过
        if original_size < 50 * 1024:  # 小于50KB
            return False, original_size, original_size, 0
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            temp_path = Path(tmp.name)
        
        try:
            with Image.open(image_path) as img:
                # 转换为 RGB
                if img.mode in ("RGBA", "P", "LA"):
                    img = img.convert("RGB")
                
                # 保存到临时文件
                img.save(temp_path, "JPEG", quality=quality, optimize=True)
            
            new_size = temp_path.stat().st_size
            
            # 只有当新文件更小时才替换
            if new_size < original_size:
                saved = original_size - new_size
                shutil.move(str(temp_path), str(image_path))
                return True, original_size, new_size, saved
            else:
                # 新文件更大，删除临时文件
                temp_path.unlink()
                return False, original_size, original_size, 0
                
        finally:
            # 确保清理临时文件
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except:
                    pass
                    
    except Exception as e:
        return False, 0, 0, 0

def format_size(size_bytes):
    """格式化文件大小"""
    if size_bytes < 0:
        return f"-{format_size(-size_bytes)}"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def main():
    print("=" * 60)
    print("   智能图片优化工具")
    print("   (只优化能减小的图片)")
    print("=" * 60)
    print("")
    
    # 选择目标文件夹
    target_paths = [
        ("data/cj", "data/cj/ (串珠图片)"),
        ("languages", "languages/ (所有图片)")
    ]
    
    print("请选择要优化的文件夹:")
    for i, (path, desc) in enumerate(target_paths, 1):
        print(f"  {i}. {desc}")
    print("")
    
    choice = input("请选择 (1-2，默认1): ").strip()
    if not choice:
        choice = "1"
    
    if choice == "1":
        target_path = Path("data/cj")
    elif choice == "2":
        target_path = Path("languages")
    else:
        print("无效选择")
        sys.exit(1)
    
    if not target_path.exists():
        print(f"错误: {target_path} 文件夹不存在！")
        sys.exit(1)
    
    print("")
    print("扫描图片文件...")
    
    # 扫描 JPG 和 PNG
    jpg_images = list(target_path.rglob("*.jpg")) + list(target_path.rglob("*.jpeg"))
    png_images = list(target_path.rglob("*.png"))
    
    all_images = jpg_images + png_images
    
    if not all_images:
        print("   未找到图片文件")
        sys.exit(0)
    
    print(f"   找到 {len(jpg_images)} 张 JPG, {len(png_images)} 张 PNG")
    print(f"   总计: {len(all_images)} 张图片")
    print("")
    
    # 计算原始大小
    original_total = sum(img.stat().st_size for img in all_images)
    print(f"   当前总大小: {format_size(original_total)}")
    print("")
    
    quality = 85
    print(f"优化设置:")
    print(f"  - 质量: {quality}%")
    print(f"  - 策略: 智能优化 (只保存更小的)")
    print(f"  - 跳过: < 50KB 的文件")
    print("")
    
    print("开始优化...")
    print("")
    
    optimized = 0
    skipped = 0
    failed = 0
    total_saved = 0
    
    for i, img_path in enumerate(all_images, 1):
        if i % 100 == 0 or i == 1 or i == len(all_images):
            percentage = (i / len(all_images)) * 100
            print(f"  进度: {i}/{len(all_images)} ({percentage:.1f}%) - 已优化: {optimized}, 节省: {format_size(total_saved)}")
        
        success, orig_size, new_size, saved = optimize_image_smart(img_path, quality=quality)
        
        if success:
            optimized += 1
            total_saved += saved
        elif orig_size > 0:
            skipped += 1
        else:
            failed += 1
    
    print("")
    print("=" * 60)
    print("优化完成!")
    print("=" * 60)
    print(f"优化成功: {optimized} 张")
    print(f"跳过: {skipped} 张 (无需优化或文件太小)")
    print(f"失败: {failed} 张")
    print(f"节省空间: {format_size(total_saved)}")
    
    if optimized > 0:
        avg_saved = (total_saved / original_total * 100) if original_total > 0 else 0
        print(f"平均节省: {avg_saved:.1f}%")
    
    print("=" * 60)
    print("")
    
    if optimized > 0:
        print("建议:")
        print("  1. 测试图片显示是否正常")
        print("  2. 如有问题，使用备份恢复")
        print("")

if __name__ == "__main__":
    main()


















