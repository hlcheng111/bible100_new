#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
靜態斷言：總站殼 index.html（index_v5.html 為舊書籤轉址）結構與關鍵字存在。
不依賴瀏覽器；於 CI 或本機 `python tests/test_index_v5_shell.py` 執行。
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INDEX_ROOT = REPO / "index.html"
INDEX_V5 = REPO / "index_v5.html"

REQUIRED_SHELL = [
    'class="row2 top-nav-secondary"',
    'b100_site_http_boot.js',
    'applyBootQueryParams',
    'css/b100_label.css',
    'index_v5_hub_clean.js',
    "var SITE_HOME_CONTENT = 'help/site_home.html'",
    "function loadSiteHome()",
    "function navigateShell(opts)",
    "window.loadSiteHome = loadSiteHome",
    "window.navigateShell = navigateShell",
    "G_PLAN_SIDEBAR = 'church_planning/sidebar_plan_v5_preview.html'",
    "function openChurchGZone",
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
    "function isQnaWorkbenchUrl(url)",
    "function syncQnaShellLayout(contentUrl)",
    "function renderChurchContextBar(sub, navItems)",
    "CHURCH_NAV_GROUPS",
    "sub-nav-group",
    "nav-group-brain",
    "setContextOpen(!hideSecondary)",
    "hub-lang-pills",
    "getUiLocale",
]

FORBIDDEN_SHELL = [
    "Language tracks",  # 舊文案；v5 應為「Language」雙行小標
]


def main() -> int:
    if not INDEX_ROOT.is_file():
        print("FAIL: missing", INDEX_ROOT, file=sys.stderr)
        return 1
    text = INDEX_ROOT.read_text(encoding="utf-8", errors="replace")

    for s in REQUIRED_SHELL:
        if s not in text:
            print(f"FAIL: index.html missing expected fragment:\n  {s!r}", file=sys.stderr)
            return 1

    for s in FORBIDDEN_SHELL:
        if s in text:
            print(f"FAIL: index.html should not contain:\n  {s!r}", file=sys.stderr)
            return 1

    if not INDEX_V5.is_file():
        print("WARN: missing index_v5.html (skip redirect check)", file=sys.stderr)
    else:
        legacy = INDEX_V5.read_text(encoding="utf-8", errors="replace")
        if "index.html" not in legacy:
            print("FAIL: index_v5.html should reference index.html for redirect", file=sys.stderr)
            return 1

    print("OK: index shell static checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
