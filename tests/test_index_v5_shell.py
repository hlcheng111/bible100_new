#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
靜態斷言：總站殼 index_v5.html（與 index.html 轉址）結構與關鍵字存在。
不依賴瀏覽器；於 CI 或本機 `python tests/test_index_v5_shell.py` 執行。
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INDEX_V5 = REPO / "index_v5.html"
INDEX_ROOT = REPO / "index.html"

REQUIRED_V5 = [
    'class="row2 top-nav-secondary"',
    '<title>聖經百步四寶 · index_v5 · 總站殼</title>',
    "var DEFAULT_SIDEBAR = 'languages/index_cn.html'",
    "var DEFAULT_CONTENT = 'languages/landing_new_cn.html'",
    "selectedMode = 'material'",
    "el.className = 'row2 top-nav-secondary material-bar'",
    "function renderLanguageGroupsBar(el, item)",
    "grid.className = 'lang-btn-grid'",
    "row.className = 'lang-btn-row'",
    "row.appendChild(createLangButton(code))",
    "var rows = item.rows || [['cn', 'en', 'ch', 'ad'], ['vi', 'id', 'my', 'kh', 'lo']]",
    "function openToolsOverview()",
    "function openBibleExplorer()",
    "openBibleAILabLearnShell",
    "btnToolsOverviewTop",
    "document.body.classList.toggle('mode-qna', mode === 'qna')",
    "function renderChurchContextBar(sub, navItems)",
    "CHURCH_NAV_GROUPS",
    "sub-nav-group",
    "nav-group-brain",
    "setContextOpen(!hideSecondary)",
]

FORBIDDEN_V5 = [
    "Language tracks",  # 舊文案；v5 應為「Language」雙行小標
]


def main() -> int:
    if not INDEX_V5.is_file():
        print("FAIL: missing", INDEX_V5, file=sys.stderr)
        return 1
    text = INDEX_V5.read_text(encoding="utf-8", errors="replace")

    for s in REQUIRED_V5:
        if s not in text:
            print(f"FAIL: index_v5.html missing expected fragment:\n  {s!r}", file=sys.stderr)
            return 1

    for s in FORBIDDEN_V5:
        if s in text:
            print(f"FAIL: index_v5.html should not contain:\n  {s!r}", file=sys.stderr)
            return 1

    if not INDEX_ROOT.is_file():
        print("WARN: missing index.html (skip redirect check)", file=sys.stderr)
    else:
        root = INDEX_ROOT.read_text(encoding="utf-8", errors="replace")
        if "index_v5.html" not in root:
            print("FAIL: index.html should reference index_v5.html", file=sys.stderr)
            return 1

    print("OK: index_v5 shell static checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
