#!/usr/bin/env python3
"""
Priority fixes: main dashboards h1, hymn entry links, batch-1 broken href replacements.
Run from bible100_new: python scripts/fix_mainline_priority.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (relative path from ROOT, old, new) — only mainline / hymn entry, not hymn_00/*
HREF_REPLACEMENTS: list[tuple[str, str, str]] = [
    ("church_ministry/admin_dashboard_demo.html", "ai/ai-tools-hub.html", "../ai_tools/dashboard.html"),
    ("help/church-tool-four-pillars.html", "../PROJECT_MILESTONE_2026-04-29.md", "../docs/PROJECT_MILESTONE_2026-04-29.md"),
    ("help/project-status-hub.html", "../PROJECT_MILESTONE_2026-04-29.md", "../docs/PROJECT_MILESTONE_2026-04-29.md"),
    ("help/site-sidebar-nav-map.html", "SITE_側欄三層選單_去向.html", "../archive/20260507_root_wave2/SITE_側欄三層選單_去向.html"),
    ("hymn_management/hymn/default.htm", "hymn_web-TITLE.htm", "index_hymn_web/hymn_English_Title.htm"),
    ("hymn_management/hymn/index_hymnal/default.htm", "hymn_web-TITLE.htm", "../index_hymn_web/hymn_English_Title.htm"),
]

# Files to patch chrome-extension PDF links → strip anchor (batch-1: entry pages only)
CHROME_EXT_FILES = [
    "hymn_management/hymn/default.htm",
    "hymn_management/hymn/default_simple_sort_fixed.html",
    "hymn_management/landing.html",
    "hymn_management/index.html",
]

CHROME_PAT = re.compile(
    r'<a\s+[^>]*href\s*=\s*["\']chrome-extension://[^"\']*["\'][^>]*>.*?</a>',
    re.I | re.S,
)


def ensure_h1_in_school_dashboard(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    if re.search(r"<h1\b", text, re.I):
        return False
    marker = '<div id="dashboard-main" class="dashboard-tab">'
    if marker not in text:
        return False
    insert = (
        marker + "\n"
        '    <div class="dashboard-header" style="text-align:center;margin-bottom:20px;">\n'
        "        <h1>學校管理儀表板</h1>\n"
        "        <p style=\"color:#7f8c8d;font-size:1rem;\">學籍、課程與成績管理入口</p>\n"
        "    </div>\n"
    )
    text = text.replace(marker, insert, 1)
    path.write_text(text, encoding="utf-8")
    return True


def ensure_h1_tools_dashboard(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    if re.search(r"<h1\b", text, re.I):
        return False
    old = '<strong>全站功能總入口</strong>'
    if old not in text:
        return False
    text = text.replace(old, "<h1 style=\"display:inline;font-size:inherit;margin:0;\">全站功能總入口</h1>", 1)
    path.write_text(text, encoding="utf-8")
    return True


def patch_hymn_sidebar(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    block = """    <div class="quick-links" style="margin-top:10px;padding-top:8px;border-top:1px solid #e0e0e0;">
      <a href="dashboard.html" target="contentFrame">📋 儀表板</a>
      <a href="hymn/hymn_main_index.html" target="contentFrame">🎵 詩歌主控台</a>
      <a href="hymn/default.htm" target="contentFrame">📑 詩歌總索引</a>
      <a href="hymn/index_hymn_web/hymn_English_Title.htm" target="contentFrame">🔤 英文標題索引</a>
      <a href="javascript:showAllHymnals()">📚 顯示全部</a>
      <a href="javascript:clearFilters()">🔄 清除篩選</a>
      <a href="javascript:exportData()">💾 導出數據</a>
    </div>"""
    pat = re.compile(
        r'<div class="quick-links" style="margin-top:10px;[^"]*">.*?</div>',
        re.S,
    )
    if "hymn/hymn_main_index.html" in text:
        return False
    new_text, n = pat.subn(block, text, count=1)
    if n:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def apply_href_replacements() -> int:
    n = 0
    for rel, old, new in HREF_REPLACEMENTS:
        path = ROOT / rel.replace("/", "\\")
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if old not in text:
            continue
        path.write_text(text.replace(old, new), encoding="utf-8")
        n += 1
        print(f"  href: {rel}")
    return n


def strip_chrome_extension_links() -> int:
    n = 0
    for rel in CHROME_EXT_FILES:
        path = ROOT / rel.replace("/", "\\")
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        new_text, c = CHROME_PAT.subn("", text)
        if c:
            path.write_text(new_text, encoding="utf-8")
            n += c
            print(f"  chrome-ext removed ({c}): {rel}")
    return n


def main() -> int:
    print("=== Mainline priority fixes ===")
    if ensure_h1_in_school_dashboard(ROOT / "school_management" / "dashboard.html"):
        print("  h1: school_management/dashboard.html")
    if ensure_h1_tools_dashboard(ROOT / "tools" / "tools-dashboard.html"):
        print("  h1: tools/tools-dashboard.html")
    if patch_hymn_sidebar(ROOT / "hymn_management" / "sidebar.html"):
        print("  hymn entry: hymn_management/sidebar.html")
    print(f"href replacements: {apply_href_replacements()}")
    print(f"chrome-extension anchors removed: {strip_chrome_extension_links()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
