# -*- coding: utf-8 -*-
"""
教會事工 · 標題折行掃描：找出「標題／按鈕／分頁鈕佔 3 行以上」的畫面（格子過大、標題折很多行）。

用法：
  python church_ministry/scripts/cm_title_wrap_scan.py              # landing + 各區主桌
  python church_ministry/scripts/cm_title_wrap_scan.py --max 2      # 超過幾行才算（預設 2）
輸出：church_ministry/audit/stage4/title_wrap_scan.md

只讀、不寫專案檔。用無頭 Edge 開 file://，量每個標題類元素的行數。
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(HERE))

import cm_zone_flows as F  # noqa: E402

CM = REPO / "church_ministry"
OUT = CM / "audit" / "stage4" / "title_wrap_scan.md"

# 量這些元素的行數（標題、導覽按鈕、分頁、路線圖步驟、格子名稱）
SELECTOR = (
    "h1,h2,h3,.tab,.pa-tab,.sg-tab,.att-route__step-t,.cm-node .name,.cm-tile .name,"
    ".cm-step-card strong,.stat b,.nav-tab,[role=tab]"
)

MEASURE = r"""return (function(max){
  var out=[];
  document.querySelectorAll(%s).forEach(function(el){
    var r=el.getBoundingClientRect();
    if(!r.width||!r.height) return;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') return;
    var lh=parseFloat(cs.lineHeight); if(!lh||isNaN(lh)) lh=parseFloat(cs.fontSize)*1.4;
    var pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth);
    var lines=Math.round((r.height-pad)/lh);
    var txt=(el.textContent||'').trim().replace(/\s+/g,' ');
    if(lines>max && txt) out.push({tag:el.tagName.toLowerCase(),cls:String(el.className||'').slice(0,40),lines:lines,w:Math.round(r.width),text:txt.slice(0,40)});
  });
  return JSON.stringify(out);
})(%d)
"""


def pages() -> list[str]:
    out = []
    for p in sorted((CM / "_landing").glob("*.html")):
        out.append(p.relative_to(REPO).as_posix())
    mods = [
        "worship/worship-sunday-desk.html", "worship/worship-integrated.html",
        "fellowship/pastoral-integrated.html", "fellowship/attendance-checkin.html",
        "fellowship/pastoral-attendance.html", "education/education-integrated.html",
        "expansion/outreach-integrated.html", "volunteer/volunteer-integrated.html",
        "members/member-integrated.html", "finance/finance-integrated.html",
    ]
    for m in mods:
        p = CM / "modules" / m
        if p.exists():
            out.append(p.relative_to(REPO).as_posix())
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max", type=int, default=2)
    args = ap.parse_args()
    r = F.Run(9311)
    rows = []
    try:
        for rel in pages():
            r.nav(rel, 2.0)
            raw = r.js(MEASURE % (json.dumps(SELECTOR), args.max))
            hits = raw if isinstance(raw, list) else []
            rows.append((rel, hits))
            print(("❌" if hits else "✅"), rel, len(hits))
    finally:
        r.close()
    lines = ["# 標題折行掃描（超過 %d 行才列出）" % args.max, ""]
    bad = 0
    for rel, hits in rows:
        if not hits:
            continue
        bad += len(hits)
        lines.append("## " + rel)
        for h in hits[:12]:
            lines.append("- `%s.%s` %d 行 · 寬 %dpx · 「%s」" % (h["tag"], h["cls"], h["lines"], h["w"], h["text"]))
        lines.append("")
    if not bad:
        lines.append("全部通過：沒有標題折超過 %d 行。" % args.max)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("總計 %d 處；報告 %s" % (bad, OUT))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
