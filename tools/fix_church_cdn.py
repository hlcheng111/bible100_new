# -*- coding: utf-8 -*-
"""
修正 Church Ministry 模块的 CDN 链接
Fix CDN links in Church Ministry module
"""

import os
import glob
import sys
import io

# Set UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Replacements to make
replacements = [
    # Fix Tailwind: change <script> to <link>
    (
        '<script src="assets/css/tailwind.min.css"></script>',
        '<link rel="stylesheet" href="assets/css/tailwind.min.css">'
    ),
    # Fix Font Awesome CDN to local
    (
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        'assets/css/fontawesome.min.css'
    ),
    (
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'assets/css/fontawesome.min.css'
    )
]

def fix_cdn_links():
    print("=" * 60)
    print("   🔧 修正 Church Ministry CDN 链接")
    print("=" * 60)
    print()
    
    # Find all HTML files in church_ministry
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'church_ministry')
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
                
                filename = os.path.basename(html_file)
                print(f"✓ 已修正: {filename}")
                modified_count += 1
                
        except Exception as e:
            print(f"❌ 错误: {os.path.basename(html_file)} - {e}")
    
    print()
    print("=" * 60)
    print(f"✅ 完成！共修正 {modified_count} 个文件")
    print("=" * 60)

if __name__ == '__main__':
    fix_cdn_links()

