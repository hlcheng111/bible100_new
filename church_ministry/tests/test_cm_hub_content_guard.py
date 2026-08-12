#!/usr/bin/env python3
"""Hub 右栏禁止载入 CM 侧栏 HTML（Issue A）。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_shell_nav_blocks_cm_sidebar_in_content():
    js = read("js/shell_nav.js")
    assert "isForbiddenHubContent" in js
    assert "sidebar_church_layout_v1" in js
    assert "church_ministry/_landing/gateway.html" in js


def test_navigate_shell_sanitizes_content():
    html = read("index_v5.html")
    assert "CmZoneNavSsot" in html
    assert "sanitizeContentUrl" in html


def test_cm_zone_nav_ssot_landings_not_desks():
    js = read("js/cm_zone_nav_ssot.js")
    assert "_landing/worship.html" in js
    assert "dashboard_church_layout_v1" not in js


def test_sidebar_has_contentframe_guard():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "contentFrame" in layout
    assert "recoverFromSidebarInContent" in layout or "bible100ShellNav" in layout


def test_sidebar_rail_uses_focus_switch():
    render = read("js/b100_sidebar_render.js")
    assert "data-cm-focus-switch" in render
    assert 'target="_self"' in render


def test_modes_church_secondary_uses_landings():
    import json

    modes = json.loads(read("config/modes.json"))
    church = next(m for m in modes["modes"] if m["id"] == "church")
    paths = [i.get("path", "") for i in church.get("secondaryNav", [])]
    assert any("_landing/worship.html" in p for p in paths)
    assert not any("dashboard_church_layout_v1" in p for p in paths)


if __name__ == "__main__":
    import sys

    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                fails += 1
    sys.exit(1 if fails else 0)
