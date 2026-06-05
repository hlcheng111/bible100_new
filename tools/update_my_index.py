#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 my/index.html 添加所有章节和 advance 链接
"""
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

index_file = Path(r'C:\Users\hlche\.cursor\bible100_new\languages\my\index.html')

# 读取现有内容
content = index_file.read_text(encoding='utf-8')

# NT 章节列表（緬/英）
nt_chapters = [
    (1, 'NT သင်ခန်းစာ ၁: အဆင့် ၁–၁၃ ဂါလီလေးပင်လယ် - ရိုမား', 'NT Lesson 1: Steps 1–13 Sea of Galilee – Rome'),
    (2, 'NT သင်ခန်းစာ ၂: အဆင့် ၁၄–၁၉', 'NT Lesson 2: Steps 14–19'),
    (3, 'NT သင်ခန်းစာ ၃: အဆင့် ၂၀–၂၉', 'NT Lesson 3: Steps 20–29'),
    (4, 'NT သင်ခန်းစာ ၄: အဆင့် ၃၀–၃၈', 'NT Lesson 4: Steps 30–38'),
    (5, 'NT သင်ခန်းစာ ၅: အဆင့် ၃၉–၄၇', 'NT Lesson 5: Steps 39–47'),
    (6, 'NT သင်ခန်းစာ ၆: အဆင့် ၄၈–၅၆', 'NT Lesson 6: Steps 48–56'),
    (7, 'NT သင်ခန်းစာ ၇: အဆင့် ၅၇–၆၃', 'NT Lesson 7: Steps 57–63'),
    (8, 'NT သင်ခန်းစာ ၈: အဆင့် ၆၄–၇၁', 'NT Lesson 8: Steps 64–71'),
    (9, 'NT သင်ခန်းစာ ၉: အဆင့် ၇၂–၇၉', 'NT Lesson 9: Steps 72–79'),
    (10, 'NT သင်ခန်းစာ ၁၀: အဆင့် ၈၀–၈၇', 'NT Lesson 10: Steps 80–87'),
    (11, 'NT သင်ခန်းစာ ၁၁: အဆင့် ၈၈–၉၄', 'NT Lesson 11: Steps 88–94'),
    (12, 'NT သင်ခန်းစာ ၁၂: အဆင့် ၉၅–၁၀၀', 'NT Lesson 12: Steps 95–100'),
]

ot_chapters = [
    (1, 'OT သင်ခန်းစာ ၁: အဆင့် ၁–၁၁', 'OT Lesson 1: Steps 1–11'),
    (2, 'OT သင်ခန်းစာ ၂: အဆင့် ၁၂–၂၂', 'OT Lesson 2: Steps 12–22'),
    (3, 'OT သင်ခန်းစာ ၃: အဆင့် ၂၃–၃၀', 'OT Lesson 3: Steps 23–30'),
    (4, 'OT သင်ခန်းစာ ၄: အဆင့် ၃၁–၃၆', 'OT Lesson 4: Steps 31–36'),
    (5, 'OT သင်ခန်းစာ ၅: အဆင့် ၃၇–၄၂', 'OT Lesson 5: Steps 37–42'),
    (6, 'OT သင်ခန်းစာ ၆: အဆင့် ၄၃–၅၁', 'OT Lesson 6: Steps 43–51'),
    (7, 'OT သင်ခန်းစာ ၇: အဆင့် ၅၂–၅၈', 'OT Lesson 7: Steps 52–58'),
    (8, 'OT သင်ခန်းစာ ၈: အဆင့် ၅၉–၆၃', 'OT Lesson 8: Steps 59–63'),
    (9, 'OT သင်ခန်းစာ ၉: အဆင့် ၆၄–၇၁', 'OT Lesson 9: Steps 64–71'),
    (10, 'OT သင်ခန်းစာ ၁၀: အဆင့် ၇၂–၈၀', 'OT Lesson 10: Steps 72–80'),
    (11, 'OT သင်ခန်းစာ ၁၁: အဆင့် ၈၁–၉၀', 'OT Lesson 11: Steps 81–90'),
    (12, 'OT သင်ခန်းစာ ၁၂: အဆင့် ၉၁–၁၀၀', 'OT Lesson 12: Steps 91–100'),
]

# 生成 NT 章节列表 HTML
nt_list_html = '\n'.join([
    f'        <li><a href="my/NT/chapters/my_NT_chapter{num:02d}.html" target="contentFrame">{my_title}<br><small>{en_title}</small></a></li>'
    for num, my_title, en_title in nt_chapters
])

# 生成 OT 章节列表 HTML
ot_list_html = '\n'.join([
    f'        <li><a href="my/OT/chapters/my_OT_chapter{num:02d}.html" target="contentFrame">{my_title}<br><small>{en_title}</small></a></li>'
    for num, my_title, en_title in ot_chapters
])

# 生成 T4 章节列表 HTML
t4_list_html = '\n'.join([
    f'        <li><a href="my/T4/chapters/my_T4_chapter{i:02d}.html" target="contentFrame">T4 သင်ခန်းစာ {i}<br><small>T4 Lesson {i}</small></a></li>'
    for i in range(1, 17)
])

# 生成 NT advance 列表 HTML
nt_advance_html = '\n'.join([
    f'            <li><a href="my/NT/advance/my_NT_appendix{i:02d}.html" target="contentFrame">နောက်ဆက်တွဲ {i}<br><small>Appendix {i}</small></a></li>'
    for i in range(1, 18)
])

# 生成 OT advance 列表 HTML
ot_advance_html = '\n'.join([
    f'            <li><a href="my/OT/advance/my_OT_appendix{i:02d}.html" target="contentFrame">နောက်ဆက်တွဲ {i}<br><small>Appendix {i}</small></a></li>'
    for i in range(1, 12)
])

# 生成 T4 advance 列表 HTML
t4_advance_html = '\n'.join([
    f'            <li><a href="my/T4/advance/my_T4_appendix{i:02d}.html" target="contentFrame">နောက်ဆက်တွဲ {i}<br><small>Appendix {i}</small></a></li>'
    for i in range(1, 9)
])

# 替换 NT 部分
nt_section = f'''      <ul id="nt-list" class="course-list" style="display:none;">
{nt_list_html}
        
        <!-- NT Advance -->
        <li class="course-category" style="margin-top: 8px;">
          <h4 onclick="toggleCategory('nt-advance')" style="color: #e67e22; font-size: 11px; margin: 0; padding: 4px 6px; background: #fff3e0; border-radius: 3px; cursor: pointer;">📋 NT နောက်ဆက်တွဲ</h4>
          <ul id="nt-advance" class="course-list" style="display: none; padding-left: 12px;">
{nt_advance_html}
          </ul>
        </li>
      </ul>'''

content = content.replace(
    '<ul id="nt-list" class="course-list" style="display:none;">\n        <li>\n          <a href="my/NT/chapters/my_NT_chapter01.html" target="contentFrame">\n            NT သင်ခန်းစာ ၁: အဆင့် ၁–၁၃ ဂါလီလေးပင်လယ် - ရိုမား<br>\n            <small>NT Lesson 1: Steps 1–13 Sea of Galilee – Rome</small>\n          </a>\n        </li>\n        <!-- 後續可複製成 02–12 -->\n      </ul>',
    nt_section
)

# 替换 OT 部分
ot_section = f'''      <ul id="ot-list" class="course-list" style="display:none;">
{ot_list_html}
        
        <!-- OT Advance -->
        <li class="course-category" style="margin-top: 8px;">
          <h4 onclick="toggleCategory('ot-advance')" style="color: #27ae60; font-size: 11px; margin: 0; padding: 4px 6px; background: #e8f5e9; border-radius: 3px; cursor: pointer;">📋 OT နောက်ဆက်တွဲ</h4>
          <ul id="ot-advance" class="course-list" style="display: none; padding-left: 12px;">
{ot_advance_html}
          </ul>
        </li>
      </ul>'''

content = content.replace(
    '<ul id="ot-list" class="course-list" style="display:none;">\n        <li>\n          <a href="my/OT/chapters/my_OT_chapter01.html" target="contentFrame">\n            OT သင်ခန်းစာ ၁: အဆင့် ၁–၁၁<br>\n            <small>OT Lesson 1: Steps 1–11</small>\n          </a>\n        </li>\n        <!-- 後續可複製成 02–12 -->\n      </ul>',
    ot_section
)

# 替换 T4 部分
t4_section = f'''      <ul id="t4-list" class="course-list" style="display:none;">
{t4_list_html}
        
        <!-- T4 Advance -->
        <li class="course-category" style="margin-top: 8px;">
          <h4 onclick="toggleCategory('t4-advance')" style="color: #9b59b6; font-size: 11px; margin: 0; padding: 4px 6px; background: #f3e5f5; border-radius: 3px; cursor: pointer;">📋 T4 နောက်ဆက်တွဲ</h4>
          <ul id="t4-advance" class="course-list" style="display: none; padding-left: 12px;">
{t4_advance_html}
          </ul>
        </li>
      </ul>'''

content = content.replace(
    '<ul id="t4-list" class="course-list" style="display:none;">\n        <li>\n          <a href="my/T4/chapters/my_T4_chapter01.html" target="contentFrame">\n            T4 သင်ခန်းစာ ၁<br>\n            <small>T4 Lesson 1</small>\n          </a>\n        </li>\n        <!-- 後續可複製成 02–16 -->\n      </ul>',
    t4_section
)

# 写入文件
index_file.write_text(content, encoding='utf-8')
print('已更新 my/index.html：添加所有章节和 advance 链接')
