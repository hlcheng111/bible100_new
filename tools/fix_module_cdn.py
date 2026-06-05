# -*- coding: utf-8 -*-
"""
修正模块的CDN链接（通用版）
Fix CDN links in any module
"""

import os
import glob
import sys
import io

# Set UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def fix_cdn_for_module(module_name):
    """修正指定模块的CDN链接"""
    
    print("=" * 60)
    print(f"   🔧 修正 {module_name} 模块 CDN 链接")
    print("=" * 60)
    print()
    
    # Replacements to make
    replacements = [
        # Fix Tailwind: change <script> to <link>
        (
            '<script src="https://cdn.tailwindcss.com"></script>',
            '<link rel="stylesheet" href="assets/css/tailwind.min.css">'
        ),
        # Already converted Tailwind script tags
        (
            '<script src="assets/css/tailwind.min.css"></script>',
            '<link rel="stylesheet" href="assets/css/tailwind.min.css">'
        ),
        # Fix Chart.js CDN
        (
            'https://cdn.jsdelivr.net/npm/chart.js',
            'assets/js/chart.min.js'
        ),
        # Fix Font Awesome CDN (version 6.0.0)
        (
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
            'assets/css/fontawesome.min.css'
        ),
        # Fix Font Awesome CDN (version 6.4.0)
        (
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'assets/css/fontawesome.min.css'
        ),
        # Fix other common CDN patterns
        (
            'src="https://cdn.tailwindcss.com"',
            'href="assets/css/tailwind.min.css" rel="stylesheet"'
        )
    ]
    
    # Find all HTML files in the module
    base_dir = os.path.join(os.path.dirname(__file__), '..', module_name)
    html_files = glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True)
    
    print(f"📊 找到 {len(html_files)} 个 HTML 文件")
    print()
    
    modified_count = 0
    
    for html_file in html_files:
        try:
            # Read file
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Apply all replacements
            for old_text, new_text in replacements:
                if old_text in content:
                    content = content.replace(old_text, new_text)
            
            # Write back if changed
            if content != original_content:
                with open(html_file, 'w', encoding='utf-8', newline='') as f:
                    f.write(content)
                
                filename = os.path.relpath(html_file, base_dir)
                print(f"✓ 已修正: {filename}")
                modified_count += 1
                
        except Exception as e:
            print(f"❌ 错误: {os.path.basename(html_file)} - {e}")
    
    print()
    print("=" * 60)
    print(f"✅ 完成！共修正 {modified_count} 个文件")
    print("=" * 60)
    
    return modified_count

if __name__ == '__main__':
    if len(sys.argv) > 1:
        module_name = sys.argv[1]
    else:
        print("请指定模块名称，例如: python fix_module_cdn.py ai_tools")
        sys.exit(1)
    
    fix_cdn_for_module(module_name)

