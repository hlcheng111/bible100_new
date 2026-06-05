#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为緬甸文模块生成 advance 页面
"""
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

base_dir = Path(r'C:\Users\hlche\.cursor\bible100_new\languages\my')

# Advance 页面配置
advance_config = {
    'NT': {'count': 17, 'color': '#e67e22'},
    'OT': {'count': 11, 'color': '#27ae60'},
    'T4': {'count': 8, 'color': '#9b59b6'},
}

def gen_advance_html(module, num, color):
    title_my = f'{module} နောက်ဆက်တွဲ {num}'
    title_en = f'{module} Appendix {num}'
    title_full = f'{title_my} | {title_en}'
    
    html = f'''<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_full}</title>
<style>
body {{ font-family:"Microsoft YaHei","Noto Sans Myanmar","Segoe UI",sans-serif; margin:0; padding:20px; line-height:1.6; background:#f8f9fb; }}
h1 {{ color:{color}; margin-bottom:12px; }}
.bilingual {{ display:flex; gap:16px; flex-wrap:wrap; }}
.col {{ flex:1; min-width:280px; padding:14px; background:#fff; border:1px solid #e5e7eb; border-radius:6px; }}
.col h2 {{ margin-top:0; font-size:1.05rem; }}
.placeholder {{ padding:10px; border:1px dashed {color}; background:#fffdf7; color:#555; }}
@media (max-width: 768px) {{ .bilingual {{ flex-direction:column; }} }}
</style>
</head>
<body>
<h1>{title_full}</h1>

<div class="bilingual">
  <div class="col">
    <h2>မြန်မာဘာသာ (Myanmar)</h2>
    <div class="placeholder">
      ဤနေရာတွင် {module} နောက်ဆက်တွဲ {num} ၏ အကြောင်းအရာကို မြန်မာဘာသာဖြင့်ရေးသားပါ။<br>
      (Later: paste full Myanmar translation here.)
    </div>
  </div>
  <div class="col">
    <h2>English Reference</h2>
    <div class="placeholder">
      Put English summary or reference content for {module} Appendix {num} here.<br>
      (Later: add English summary or key points.)
    </div>
  </div>
</div>

</body>
</html>
'''
    return html

# 生成所有 advance 页面
for module, cfg in advance_config.items():
    advance_dir = base_dir / module / 'advance'
    advance_dir.mkdir(parents=True, exist_ok=True)
    
    for i in range(1, cfg['count'] + 1):
        num = f"{i:02d}"
        file_path = advance_dir / f"my_{module}_appendix{num}.html"
        html_content = gen_advance_html(module, num, cfg['color'])
        file_path.write_text(html_content, encoding='utf-8')
        print(f'Generated: {file_path}')

print(f'\n完成！共生成 {sum(cfg["count"] for cfg in advance_config.values())} 个 advance 页面。')
