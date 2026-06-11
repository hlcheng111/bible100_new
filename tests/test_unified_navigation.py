# -*- coding: utf-8 -*-
"""Bible100 統一導航契約靜態檢查。"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

# 合規範本與關鍵側欄（逐步擴充）
SIDEBAR_WATCH = [
    "church_ministry/sidebar_c_education_journey.html",
]

FORBIDDEN_IN_SIDEBARS = [
    ('href="#"', "href=\"#\""),
    ("javascript:void(0)", "javascript:void(0)"),
    ("data-edu-cross", "data-edu-cross"),
]

INLINE_SHELL_ONCLICK = re.compile(
    r'onclick\s*=\s*["\']return\s+bible100ShellNav',
    re.I,
)


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_governance_docs_exist():
    assert (ROOT / "docs/governance/UNIFIED_NAVIGATION.md").is_file()
    assert (ROOT / ".cursor/rules/bible100-unified-navigation.mdc").is_file()


def test_sidebar_behavior_contract():
    js = read("js/sidebar_behavior.js")
    for key in (
        "B100SidebarNav",
        "data-b100-nav",
        "navigateModuleViaShell",
        "navigateContentViaShell",
        "hrefToSiteRootRelative",
        "fallbackContentViaBase",
        "isInShell",
    ):
        assert key in js, f"missing {key} in sidebar_behavior.js"


def test_shell_nav_returns_boolean():
    js = read("js/shell_nav.js")
    assert "@returns {boolean}" in js or "return true" in js
    assert "parentFrames()" in js
    assert "return false" in js


def test_c_education_sidebar_is_reference():
    html = read("church_ministry/sidebar_c_education_journey.html")
    assert 'data-b100-nav="content"' in html
    assert 'data-b100-nav="module"' in html
    assert "sidebar_behavior.js" in html
    assert "shell_nav.js" in html
    assert "modules/development/discipleship-training.html" in html
    assert "bible_study/sidebar.html" in html
    for _label, needle in FORBIDDEN_IN_SIDEBARS:
        assert needle not in html, f"C sidebar must not contain {needle}"
    assert not INLINE_SHELL_ONCLICK.search(html), "no inline bible100ShellNav onclick"


def test_watched_sidebars_no_forbidden_patterns():
    fails = []
    for rel in SIDEBAR_WATCH:
        text = read(rel)
        for label, needle in FORBIDDEN_IN_SIDEBARS:
            if needle in text:
                fails.append(f"{rel}: {label}")
        if INLINE_SHELL_ONCLICK.search(text):
            fails.append(f"{rel}: inline bible100ShellNav onclick")
    assert not fails, "; ".join(fails)


def test_module_hub_rule_references_unified_nav():
    mdc = read(".cursor/rules/bible100-module-hub-standalone.mdc")
    assert "UNIFIED_NAVIGATION" in mdc
    assert "bible100-unified-navigation.mdc" in mdc


if __name__ == "__main__":
    import sys

    n = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                n += 1
    sys.exit(1 if n else 0)
