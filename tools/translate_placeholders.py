#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量翻译占位文本为柬埔寨语和寮国语
"""
import os
import re
import sys
from pathlib import Path

# 设置输出编码为UTF-8
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 翻译映射
translations = {
    'kh': {
        'Local Language': 'ភាសាមូលដ្ឋាន',
        'Add local-language content here.': 'បន្ថែមមាតិកាភាសាមូលដ្ឋាននៅទីនេះ។'
    },
    'lo': {
        'Local Language': 'ພາສາທ້ອງຖິ່ນ',
        'Add local-language content here.': 'ເພີ່ມເນື້ອໃນພາສາທ້ອງຖິ່ນທີ່ນີ້.'
    }
}

base_dir = Path(r'C:\Users\hlche\.cursor\bible100_new\languages')
count = 0

for lang_code in ['kh', 'lo']:
    lang_dir = base_dir / lang_code
    if not lang_dir.exists():
        continue
    
    # 查找所有章节文件（排除chapter01）
    for chapter_file in lang_dir.rglob(f'{lang_code}_*_chapter*.html'):
        if 'chapter01' in chapter_file.name:
            continue
        
        try:
            # 读取文件
            content = chapter_file.read_text(encoding='utf-8')
            original_content = content
            
            # 替换文本
            trans = translations[lang_code]
            content = content.replace('<h2>Local Language</h2>', f'<h2>{trans["Local Language"]}</h2>')
            content = content.replace('Add local-language content here.', trans['Add local-language content here.'])
            
            # 如果内容有变化，写入文件
            if content != original_content:
                chapter_file.write_text(content, encoding='utf-8')
                count += 1
                print(f'已更新: {chapter_file.relative_to(base_dir)}')
        except Exception as e:
            print(f'错误处理 {chapter_file}: {e}')

print(f'\n完成！共更新 {count} 个文件。')
