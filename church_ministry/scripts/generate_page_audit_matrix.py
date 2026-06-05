# -*- coding: utf-8 -*-
"""產生 church_ministry 全頁稽核矩陣（啟發式分級，供人工覆核）。"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "PAGE_AUDIT_MATRIX_v1.md"

INTEGRATED = (
    "member-integrated",
    "finance-integrated",
    "education-integrated",
    "volunteer-integrated",
    "worship-integrated",
    "small-groups-integrated",
)

def sniff(p: Path) -> str:
    try:
        t = p.read_text(encoding="utf-8", errors="replace")[:24000]
    except OSError:
        return "?"
    parts = []
    if "ChurchDataBridge" in t or "church_data_bridge.js" in t:
        parts.append("Bridge")
    if "simple_database_system.js" in t:
        parts.append("simpleDB")
    if re.search(r"示意|規劃中|placeholder|TODO:\s*接", t):
        parts.append("示意/待辦")
    if "cm-back-bar" in t or "cm_research_snapshot" in t:
        parts.append("研究殼")
    return "+".join(parts) or "—"


def tier(p: Path, t: str) -> str:
    rel = str(p.relative_to(ROOT)).replace("\\", "/")
    if any(x in rel for x in INTEGRATED):
        return "A 核心整合頁"
    if "modules/research/" in rel:
        return "B 研究報表(殼+KPI)"
    if "dashboard" in rel.lower() or rel.endswith("load_central_member_seed.html"):
        return "A 儀表板/種子"
    if "visitation_index" in rel or "congregation-care" in rel:
        return "B 重點流程"
    if re.search(r"示意|規劃中", t[:12000]):
        return "C 示意/占位為主"
    if "href=\"#\"" in t[:8000]:
        return "D 含#連結(待查)"
    return "E 一般頁(需人工)"


def main():
    rows = []
    for p in sorted(ROOT.rglob("*.html")):
        if "_archive" in str(p):
            continue
        rel = p.relative_to(ROOT).as_posix()
        try:
            full = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        rows.append((rel, tier(p, full), sniff(p)))

    lines = [
        "# 教會事工 · 全頁稽核矩陣 v1（自動產生）",
        "",
        "> **說明**：分級為啟發式（非人工點擊）。請以 `A→E` 作為優先覆核順序；`信號` 僅供快速篩選。",
        "",
        "| 路徑 | 分級 | 信號 |",
        "|------|------|------|",
    ]
    for rel, tr, sig in rows:
        lines.append(f"| `{rel}` | {tr} | {sig} |")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote", OUT, "rows:", len(rows))


if __name__ == "__main__":
    main()
