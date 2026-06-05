#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Myanmar (my) chapter skeletons for NT/OT/T4 with bilingual placeholders.
"""
import pathlib

base = pathlib.Path(__file__).resolve().parent.parent / "languages" / "my"

templates = {
    "NT": {
        "count": 12,
        "color": "#e67e22",
        "title_fmt": "NT သင်ခန်းစာ {n}: အဆင့် {start}–{end} | NT Lesson {n}: Steps {start}–{end}",
        "range": [
            (1, 13),
            (14, 19),
            (20, 29),
            (30, 38),
            (39, 47),
            (48, 56),
            (57, 63),
            (64, 71),
            (72, 79),
            (80, 87),
            (88, 94),
            (95, 100),
        ],
    },
    "OT": {
        "count": 12,
        "color": "#27ae60",
        "title_fmt": "OT သင်ခန်းစာ {n}: အဆင့် {start}–{end} | OT Lesson {n}: Steps {start}–{end}",
        "range": [
            (1, 11),
            (12, 22),
            (23, 30),
            (31, 36),
            (37, 42),
            (43, 51),
            (52, 58),
            (59, 63),
            (64, 71),
            (72, 80),
            (81, 90),
            (91, 100),
        ],
    },
    "T4": {
        "count": 16,
        "color": "#9b59b6",
        "title_fmt": "T4 သင်ခန်းစာ {n} | T4 Lesson {n}",
        "range": [(None, None)] * 16,
    },
}


def gen_html(title: str, color: str) -> str:
    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
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
<h1>{title}</h1>

<div class="bilingual">
  <div class="col">
    <h2>မြန်မာဘာသာ (Myanmar)</h2>
    <div class="placeholder">
      ဤနေရာတွင် အကြောင်းအရာကို မြန်မာဘာသာဖြင့်ရေးသားပါ။<br>
      (Later: paste full Myanmar translation here.)
    </div>
  </div>
  <div class="col">
    <h2>English Reference</h2>
    <div class="placeholder">
      Put English summary or reference content here.<br>
      (Later: add English summary or key points.)
    </div>
  </div>
</div>

</body>
</html>
"""


def main():
    for module, cfg in templates.items():
        folder = base / module / "chapters"
        folder.mkdir(parents=True, exist_ok=True)
        for i in range(1, cfg["count"] + 1):
            num = f"{i:02d}"
            start, end = cfg["range"][i - 1]
            title = cfg["title_fmt"].format(
                n=i,
                start="" if start is None else start,
                end="" if end is None else end,
            )
            path = folder / f"my_{module}_chapter{num}.html"
            path.write_text(gen_html(title, cfg["color"]), encoding="utf-8")
            print(f"generated {path}")


if __name__ == "__main__":
    main()
