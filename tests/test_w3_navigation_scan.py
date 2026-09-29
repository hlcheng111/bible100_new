# -*- coding: utf-8 -*-
"""H1a-e: 全站 W3 側欄契約靜態檢查（擴展版）。"""
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN_IN_SIDEBARS = [
    ('href="#"', 'href="#"'),
    ("javascript:void(0)", "javascript:void(0)"),
    ("data-edu-cross", "data-edu-cross"),
]

INLINE_SHELL_ONCLICK = re.compile(
    r'onclick\s*=\s*["\']return\s+bible100ShellNav',
    re.I,
)

W3_SIDEBAR_SCAN = [
    # H1a
    "church_ministry/sidebar_church_layout_v1.html",
    "church_ministry/sidebar_crm_journey.html",
    "church_ministry/sidebar_pastoral_journey.html",
    "church_ministry/sidebar_worship_journey.html",
    "church_ministry/congregation/sidebar.html",
    "church_ministry/sidebar_c_education_journey.html",
    # H1b
    "school_management/sidebar.html",
    "smart_ministry/sidebar.html",
    "hymn_management/sidebar.html",
    # H1c
    "ai_tools/sidebar.html",
    "ai_tools/sidebar_lab.html",
    # H1d
    "church_planning/sidebar_plan.html",
    "disciple_dynamics/sidebar.html",
    "nav_hub/sidebar.html",
    # H1e
    "help/sidebar_help.html",
    "languages/my/sidebar.html",
    # 參考
    "bible_study/sidebar.html",
]

REQUIRED_SCRIPTS = (
    "sidebar_shell_target_fallback.js",
    "shell_nav.js",
    "sidebar_behavior.js",
)


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def scan_sidebar(rel: str) -> list[str]:
    issues: list[str] = []
    path = ROOT / rel
    if not path.is_file():
        return [f"{rel}: missing file"]
    text = read(rel)
    for label, needle in FORBIDDEN_IN_SIDEBARS:
        if needle in text:
            issues.append(f"{rel}: forbidden {label}")
    if INLINE_SHELL_ONCLICK.search(text):
        issues.append(f"{rel}: inline bible100ShellNav onclick")
    if "MISSING" in text:
        issues.append(f"{rel}: broken data-b100-sidebar MISSING")
    if 'data-b100-sidebar=" class=' in text:
        issues.append(f"{rel}: malformed module link")
    for script in REQUIRED_SCRIPTS:
        if script not in text:
            issues.append(f"{rel}: missing {script}")
    if 'data-b100-nav="content"' not in text and 'data-b100-nav="module"' not in text:
        issues.append(f"{rel}: no data-b100-nav attributes")
    return issues


def test_h1_all_sidebars_compliant():
    fails: list[str] = []
    for rel in W3_SIDEBAR_SCAN:
        fails.extend(scan_sidebar(rel))
    assert not fails, "H1 W3 failures:\n" + "\n".join(fails)


def test_bible_study_no_deprecated_reader_links():
    for rel in (
        "bible_study/sidebar.html",
        "bible_study/search_reader.html",
        "bible_study/comprehensive_exegesis_reader.html",
        "bible_study/external_bible_reader.html",
    ):
        text = read(rel)
        assert "bible_reader_final.html" not in text, f"{rel} still links bible_reader_final"


def test_apply_w3_scripts_exist():
    assert (ROOT / "scripts/apply_w3_sidebar_contract.py").is_file()
    assert (ROOT / "docs/governance/H1_W3_SIDEBAR_REPORT.md").is_file()


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
