#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""B100 · study / school / ai focus 侧栏 + 禁壳契约"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_module_nav_focus_ssot():
    js = read("js/b100_module_nav_ssot.js")
    assert "20260812clean" in js
    assert "shellPairForFocus" in js
    assert "isModuleShellUrl" in js
    assert "bible_study\\/index" in js or "bible_study/index" in js
    assert "sidebarUrlForZone" in js


def test_focus_sidebar_scripts():
    for rel in [
        "bible_study/sidebar.html",
        "school_management/sidebar.html",
        "ai_tools/sidebar_lab.html",
    ]:
        html = read(rel)
        assert "data-b100-focus-zone" in html
        assert "b100_module_sidebar_focus.js" in html
        assert "data-b100-module-focus-mode" in html


def test_study_sidebar_zones():
    html = read("bible_study/sidebar.html")
    for z in ("tools", "versions", "commentary", "geo"):
        assert 'data-b100-focus-zone="' + z + '"' in html
    assert "target=\"_blank\"" in html and "index.html" in html
    assert "目前資源" not in html
    assert "b100-focus-banner" not in html  # injected by JS


def test_modes_focus_zone():
    modes = read("config/modes.json")
    assert "focusZone" in modes
    assert "parallel_mode_v3.html" in modes
    assert "sidebar.html?focus=commentary" in modes
    assert "focus=tools" in modes
    assert "_landing/tools.html" in modes


def test_shell_nav_bible_study_index_guard():
    js = read("js/shell_nav.js")
    assert "bible_study/index.html" in js


def test_study_landing_commentary_note():
    home = read("bible_study/_landing/home.html")
    assert "釋經參讀" in home and "CMC" in home


if __name__ == "__main__":
    tests = [
        test_module_nav_focus_ssot,
        test_focus_sidebar_scripts,
        test_study_sidebar_zones,
        test_modes_focus_zone,
        test_shell_nav_bible_study_index_guard,
        test_study_landing_commentary_note,
    ]
    for t in tests:
        t()
        print("OK", t.__name__)
    print(f"\n{len(tests)}/{len(tests)} passed")
