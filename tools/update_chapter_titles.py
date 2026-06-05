#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新章节文件的标题为双语格式（柬/英 或 寮/英）
"""
import os
import re
import sys
from pathlib import Path

# 设置输出编码为UTF-8
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

base_dir = Path(r'C:\Users\hlche\.cursor\bible100_new\languages')

# 从sidebar文件中提取的标题映射
# 格式: (模块, 章节号): (本地语言标题, 英文标题)
kh_titles = {
    ('NT', 1): ('បទរៀន NT ១: ជំហាន ១-១៣ សមុទ្រហ្គាលីលេ - រ៉ូម', 'NT Lesson 1: Steps 1-13 Sea of Galilee - Rome'),
    ('NT', 2): ('បទរៀន NT ២: ជំហាន ១៤-១៩ ក្រិកច្បាំងឈ្នះប៉ាស៊ី - ទេវតា និងអ្នកដឹកនាំ', 'NT Lesson 2: Steps 14-19 Greek Conquest of Persia - Angels and Magi'),
    ('NT', 3): ('បទរៀន NT ៣: ជំហាន ២០-២៩ រត់ទៅអេហ្ស៊ីប - ការកើតឡើងវិញ', 'NT Lesson 3: Steps 20-29 Flight to Egypt - Truth of Rebirth'),
    ('NT', 4): ('បទរៀន NT ៤: ជំហាន ៣០-៣៨ ស្ត្រីនៅអណ្តូង - សរសើរព្រះ', 'NT Lesson 4: Steps 30-38 Woman at the Well - Glorify God'),
    ('NT', 5): ('បទរៀន NT ៥: ជំហាន ៣៩-៤៧ ប្រតិកម្មពីរ - ព្រះយេស៊ូមានបន្ទូល: ខ្ញុំគឺជាព្រះ', 'NT Lesson 5: Steps 39-47 Two Reactions - Jesus Says: I Am God'),
    ('NT', 6): ('បទរៀន NT ៦: ជំហាន ៤៨-៥៦ ខ្ញុំគឺជាពន្លឺ - ហូសាណា', 'NT Lesson 6: Steps 48-56 I Am the Light - Hosanna'),
    ('NT', 7): ('បទរៀន NT ៧: ជំហាន ៥៧-៦៣ សម្អាតព្រះវិហារម្តងទៀត - មានសាក្សីជាង ៥០០ នាក់', 'NT Lesson 7: Steps 57-63 Cleansing the Temple Again - Over 500 Witnesses'),
    ('NT', 8): ('បទរៀន NT ៨: ជំហាន ៦៤-៧១ កូនព្រះឡើងទៅស្ថានសួគ៌ - សោឡដែលគ្មានមេត្តា', 'NT Lesson 8: Steps 64-71 Ascension of the Son - Ruthless Saul'),
    ('NT', 9): ('បទរៀន NT ៩: ជំហាន ៧២-៧៩ ព្រះយេស៊ូបញ្ចេញពន្លឺ - ម៉ាកដកថយ', 'NT Lesson 9: Steps 72-79 Jesus Shines - Mark Retreats'),
    ('NT', 10): ('បទរៀន NT ១០: ជំហាន ៨០-៨៧ ត្រឡប់ទៅអង់ទីយ៉ុក - នាំទីម៉ូតេ', 'NT Lesson 10: Steps 80-87 Return to Antioch - Bring Timothy'),
    ('NT', 11): ('បទរៀន NT ១១: ជំហាន ៨៨-៩៤ មកជួយយើង - ទៅកាន់យេរូសាឡឹម', 'NT Lesson 11: Steps 88-94 Come Help Us - To Jerusalem'),
    ('NT', 12): ('បទរៀន NT ១២: ជំហាន ៩៥-១០០ ការបះបោរ - ព្រះអម្ចាស់នឹងមកឆាប់', 'NT Lesson 12: Steps 95-100 Riot - The Lord Will Come Soon'),
    ('OT', 1): ('បទរៀន OT ១: ជំហាន ១-១១', 'OT Lesson 1: Steps 1-11'),
    ('OT', 2): ('បទរៀន OT ២: ជំហាន ១២-២២', 'OT Lesson 2: Steps 12-22'),
    ('OT', 3): ('បទរៀន OT ៣: ជំហាន ២៣-៣០', 'OT Lesson 3: Steps 23-30'),
    ('OT', 4): ('បទរៀន OT ៤: ជំហាន ៣១-៣៦', 'OT Lesson 4: Steps 31-36'),
    ('OT', 5): ('បទរៀន OT ៥: ជំហាន ៣៧-៤២', 'OT Lesson 5: Steps 37-42'),
    ('OT', 6): ('បទរៀន OT ៦: ជំហាន ៤៣-៥១', 'OT Lesson 6: Steps 43-51'),
    ('OT', 7): ('បទរៀន OT ៧: ជំហាន ៥២-៥៨', 'OT Lesson 7: Steps 52-58'),
    ('OT', 8): ('បទរៀន OT ៨: ជំហាន ៥៩-៦៣', 'OT Lesson 8: Steps 59-63'),
    ('OT', 9): ('បទរៀន OT ៩: ជំហាន ៦៤-៧១', 'OT Lesson 9: Steps 64-71'),
    ('OT', 10): ('បទរៀន OT ១០: ជំហាន ៧២-៨០', 'OT Lesson 10: Steps 72-80'),
    ('OT', 11): ('បទរៀន OT ១១: ជំហាន ៨១-៩០', 'OT Lesson 11: Steps 81-90'),
    ('OT', 12): ('បទរៀន OT ១២: ជំហាន ៩១-១០០', 'OT Lesson 12: Steps 91-100'),
}

lo_titles = {
    ('NT', 1): ('ບົດຮຽນ NT 1: ຂັ້ນຕອນ 1-13 ທະເລກາລີເລ - ໂຣມ', 'NT Lesson 1: Steps 1-13 Sea of Galilee - Rome'),
    ('NT', 2): ('ບົດຮຽນ NT 2: ຂັ້ນຕອນ 14-19', 'NT Lesson 2: Steps 14-19'),
    ('NT', 3): ('ບົດຮຽນ NT 3: ຂັ້ນຕອນ 20-29', 'NT Lesson 3: Steps 20-29'),
    ('NT', 4): ('ບົດຮຽນ NT 4: ຂັ້ນຕອນ 30-38', 'NT Lesson 4: Steps 30-38'),
    ('NT', 5): ('ບົດຮຽນ NT 5: ຂັ້ນຕອນ 39-47', 'NT Lesson 5: Steps 39-47'),
    ('NT', 6): ('ບົດຮຽນ NT 6: ຂັ້ນຕອນ 48-56', 'NT Lesson 6: Steps 48-56'),
    ('NT', 7): ('ບົດຮຽນ NT 7: ຂັ້ນຕອນ 57-63', 'NT Lesson 7: Steps 57-63'),
    ('NT', 8): ('ບົດຮຽນ NT 8: ຂັ້ນຕອນ 64-71', 'NT Lesson 8: Steps 64-71'),
    ('NT', 9): ('ບົດຮຽນ NT 9: ຂັ້ນຕອນ 72-79', 'NT Lesson 9: Steps 72-79'),
    ('NT', 10): ('ບົດຮຽນ NT 10: ຂັ້ນຕອນ 80-87', 'NT Lesson 10: Steps 80-87'),
    ('NT', 11): ('ບົດຮຽນ NT 11: ຂັ້ນຕອນ 88-94', 'NT Lesson 11: Steps 88-94'),
    ('NT', 12): ('ບົດຮຽນ NT 12: ຂັ້ນຕອນ 95-100', 'NT Lesson 12: Steps 95-100'),
}

# 添加T4和OT标题（使用字典推导式）
kh_titles.update({('T4', i): (f'T4 បទរៀន {i}', f'T4 Lesson {i}') for i in range(1, 17)})
lo_titles.update({('OT', i): (f'ບົດຮຽນ OT {i}', f'OT Lesson {i}') for i in range(1, 13)})
lo_titles.update({('T4', i): (f'T4 ບົດຮຽນ {i}', f'T4 Lesson {i}') for i in range(1, 17)})

def update_chapter_file(file_path, lang_code, module, chapter_num):
    """更新单个章节文件的标题"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # 获取标题
        if lang_code == 'kh':
            titles = kh_titles.get((module, chapter_num))
        else:
            titles = lo_titles.get((module, chapter_num))
        
        if not titles:
            print(f'警告: 未找到标题 {lang_code} {module} {chapter_num}')
            return False
        
        local_title, en_title = titles
        full_title = f'{local_title} | {en_title}'
        
        # 更新 <title> 标签
        title_pattern = r'<title>.*?</title>'
        new_title = f'<title>{full_title}</title>'
        content = re.sub(title_pattern, new_title, content, flags=re.DOTALL)
        
        # 更新 <h1> 标签
        h1_pattern = r'<h1>.*?</h1>'
        new_h1 = f'<h1>{full_title}</h1>'
        content = re.sub(h1_pattern, new_h1, content, flags=re.DOTALL)
        
        # 如果内容有变化，写入文件
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f'错误处理 {file_path}: {e}')
        return False

# 主处理逻辑
count = 0
for lang_code in ['kh', 'lo']:
    lang_dir = base_dir / lang_code
    if not lang_dir.exists():
        continue
    
    titles_dict = kh_titles if lang_code == 'kh' else lo_titles
    
    # 处理所有章节文件
    for chapter_file in lang_dir.rglob(f'{lang_code}_*_chapter*.html'):
        # 解析文件名: kh_NT_chapter03.html -> (NT, 3)
        match = re.match(rf'{lang_code}_(NT|OT|T4)_chapter(\d+)\.html', chapter_file.name)
        if not match:
            continue
        
        module = match.group(1)
        chapter_num = int(match.group(2))
        
        # 更新文件
        if update_chapter_file(chapter_file, lang_code, module, chapter_num):
            count += 1
            print(f'已更新: {chapter_file.relative_to(base_dir)}')

print(f'\n完成！共更新 {count} 个文件的标题。')
