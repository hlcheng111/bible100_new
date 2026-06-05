# -*- coding: utf-8 -*-
"""Emit docs/PHASE0_PAGE_INDEX_LOCAL.html — run: python docs/_gen_phase0_index.py"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def file_url(rel_posix: str) -> str:
    p = (ROOT / rel_posix).resolve()
    return p.as_uri()


def classify(rel: str, name: str) -> tuple[str, str]:
    n = name.lower()
    r = rel
    if "/tests/" in r or ("test" in n and "grok" in n):
        return "試驗／Grok", "試行"
    if "sidebar" in n:
        return "導航", "輔助"
    if "dist/" in r:
        return "建置產物", "輔助"
    if "temp" in n or n == "00temp.html":
        return "其他", "待清理"

    if rel.endswith("信徒靈性生命健康自我審查.html"):
        return "調查", "主入口候選"
    if "spiritual_app/index_spiritual.html" in rel:
        return "調查", "試行"
    if "spiritual_app/" in rel and name == "index.html":
        return "調查", "重複候選"

    if any(
        x in n
        for x in (
            "matching",
            "pairing",
            "ministry_matching",
        )
    ) or "配對" in name:
        return "配對", "視產品線"

    if any(
        x in n
        for x in (
            "survey",
            "diagnosis",
            "審查",
            "check-up",
            "checkup",
            "questionnaire",
            "assessment",
            "mbti",
            "disc_test",
            "shape_test",
            "spiritual_gift",
            "talent_main_survey",
            "health-diagnosis",
            "pastoral-spiritual",
        )
    ):
        return "調查", "視產品線"

    if any(
        x in n
        for x in (
            "planning",
            "swot",
            "pdca",
            "smart-planning",
            "kanban",
            "vision",
            "strategy",
            "goals",
            "workflow",
            "8020",
            "process",
            "page_fill",
            "page_see",
            "page_learn",
            "page_reports",
            "user-guide",
            "church-planning-index",
            "index_plan",
            "church_health",
            "church-health",
            "ncd",
        )
    ):
        return "計劃", "視產品線"

    if "planning/" in r and r.startswith("church_planning/planning/"):
        return "計劃子頁", "視產品線"

    if n == "index.html" and r.startswith("smart_ministry/"):
        return "導航", "輔助"
    if "dashboard" in n or n == "console.html":
        return "儀表", "輔助"
    if "landing" in n or "_landing" in r:
        return "落地頁", "輔助"

    return "其他", "待盤"


def main() -> None:
    dirs = ["church_planning", "smart_ministry", "tools"]
    rows: list[tuple[str, str, str, str]] = []
    for d in dirs:
        base = ROOT / d
        if not base.is_dir():
            continue
        for p in sorted(base.rglob("*.html")):
            rel = p.relative_to(ROOT).as_posix()
            typ, main = classify(rel, p.name)
            rows.append((rel, typ, main, file_url(rel)))

    # docs checklist html
    rows.append(
        (
            "docs/PHASE0_INVENTORY_CHECKLIST.html",
            "文件",
            "輔助",
            file_url("docs/PHASE0_INVENTORY_CHECKLIST.html"),
        )
    )

    by_type: dict[str, list] = {}
    for rel, typ, main, url in rows:
        by_type.setdefault(typ, []).append((rel, main, url))

    order = [
        "調查",
        "計劃",
        "計劃子頁",
        "配對",
        "導航",
        "儀表",
        "落地頁",
        "試驗／Grok",
        "建置產物",
        "文件",
        "其他",
    ]

    trs = []
    for typ in order:
        chunk = by_type.get(typ, [])
        if not chunk:
            continue
        trs.append(
            f'<tr class="grp"><td colspan="4"><strong>{typ}</strong>（{len(chunk)}）</td></tr>'
        )
        for rel, main, url in sorted(chunk, key=lambda x: x[0].lower()):
            win_path = str(ROOT / rel.replace("/", "\\"))
            trs.append(
                "<tr>"
                f"<td class='mono'>{rel}</td>"
                f"<td>{typ}</td>"
                f"<td>{main}</td>"
                f"<td><a href=\"{url}\">本機開啟</a><br><span class='small'>{win_path}</span></td>"
                "</tr>"
            )

    html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phase 0 盤點 — 本機頁面索引</title>
<style>
body {{ font-family: "Segoe UI","Microsoft JhengHei",sans-serif; margin:1rem; background:#f6f7f9; color:#1a1d21; }}
.wrap {{ max-width:1280px; margin:0 auto; background:#fff; padding:1rem 1.25rem 2rem; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,.08); }}
h1 {{ font-size:1.35rem; margin-top:0; }}
.banner {{ background:#1e3a5f; color:#e8f0ff; padding:.75rem 1rem; border-radius:8px; margin-bottom:1rem; font-size:.95rem; }}
table {{ width:100%; border-collapse:collapse; font-size:.88rem; }}
th, td {{ border:1px solid #c8cdd4; padding:.4rem .5rem; vertical-align:top; }}
th {{ background:#e8ecf2; text-align:left; }}
tr.grp td {{ background:#dfe6f2; font-size:.95rem; }}
.mono {{ font-family:ui-monospace,Consolas,monospace; word-break:break-all; }}
.small {{ font-size:.78rem; color:#555; word-break:break-all; }}
a {{ color:#0b57d0; }}
ul.toc {{ margin:.5rem 0 1rem 1.2rem; }}
</style>
</head>
<body><div class="wrap">
<div class="banner">路徑基底：<strong>{ROOT}</strong>。點「本機開啟」以 <code>file:///</code> 在 Edge／Chrome 開啟（若瀏覽器阻擋本機檔案，請從檔案總管雙擊同一個 .html）。分類為 Phase 0 粗分，可再於盤點表修正。</div>
<h1>Phase 0 盤點：本機 HTML 索引</h1>
<p>掃描範圍：<code>church_planning/</code>、<code>smart_ministry/</code>、<code>tools/</code>，另含盤點表 HTML。<strong>不含</strong> <code>disciple_dynamics/</code> 內兩百餘章節頁（屬課程內容，非本表「工具頁」主線）。</p>
<p>重新產生本頁：在專案根目錄執行 <code class="mono">python docs/_gen_phase0_index.py</code></p>
<table>
<thead><tr><th>相對路徑</th><th>類型</th><th>主線標籤</th><th>PC 連結／Windows 路徑</th></tr></thead>
<tbody>
{chr(10).join(trs)}
</tbody>
</table>
<p class="small" style="margin-top:1rem;">產生工具：docs/_gen_phase0_index.py · 路徑與使用者帳號綁定；若專案搬移請改腳本内 ROOT 或重新執行。</p>
</div></body></html>"""

    out = ROOT / "docs" / "PHASE0_PAGE_INDEX_LOCAL.html"
    out.write_text(html, encoding="utf-8")
    print("Wrote", out, "rows", len(rows))


if __name__ == "__main__":
    main()
