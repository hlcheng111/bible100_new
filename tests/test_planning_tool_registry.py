#!/usr/bin/env python3
"""Planning tool registry: 17 canonical + extended paths exist; hub/sidebar hooks."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CP = ROOT / "church_planning"
REGISTRY = CP / "js" / "planning_tool_registry.js"
HUB = CP / "assessment-os-hub.html"
SIDEBAR = CP / "sidebar_plan.html"
GUIDE5 = CP / "guides" / "guide_step5_strategy.html"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def parse_registry_paths(js: str):
    tools_block = js.split("var TOOLS = [", 1)[1].split("];", 1)[0]
    ext_block = js.split("var EXTENDED = [", 1)[1].split("];", 1)[0]
    canonical = re.findall(r'\{\s*id:\s*"([^"]+)"[^}]*?path:\s*"([^"]+)"', tools_block)
    extended = re.findall(r'\{\s*id:\s*"([^"]+)"[^}]*?path:\s*"([^"]+)"', ext_block)
    return canonical, extended


def test_canonical_count_and_files():
    js = read(REGISTRY)
    canonical, _extended = parse_registry_paths(js)
    assert len(canonical) == 18, f"expected 18 registry entries (17+ raci), got {len(canonical)}"
    supermarket_ids = {id_ for id_, _p in canonical if id_ != "raci"}
    assert len(supermarket_ids) == 17, f"expected 17 supermarket tools, got {len(supermarket_ids)}"
    for id_, rel in canonical:
        fp = CP / rel
        assert fp.is_file(), f"canonical missing file {rel!r} (id={id_})"


def test_extended_files():
    js = read(REGISTRY)
    _, extended = parse_registry_paths(js)
    assert len(extended) == 10, f"expected 10 extended tools, got {len(extended)}"
    for id_, rel in extended:
        fp = CP / rel
        assert fp.is_file(), f"extended missing file {rel!r} (id={id_})"


def test_hub_dual_sections():
    html = read(HUB)
    assert "planning-tool-supermarket" in html
    assert "planning-tool-extended" in html
    assert "暫不寫入戰情室" in html
    assert "planning_hub_render.js" in html


def test_sidebar_dynamic_render():
    html = read(SIDEBAR)
    assert "planning-sidebar-tools-step2" in html
    assert "planning-sidebar-tools-extended" in html
    assert "planning_sidebar_render.js" in html

    cm = read(ROOT / "church_ministry" / "sidebar_church_layout_v1.html")
    assert "cm-planning-sidebar-tools-step2" in cm
    assert "planning_sidebar_render.js" in cm
    assert "planningOpenExtended" not in html or "延伸" in html


def test_guide_step5_all_tools():
    html = read(GUIDE5)
    for key in ("swot", "smart", "urgent", "pdca"):
        assert f"planningOpenByToolId(event,'{key}')" in html, f"guide_step5 missing {key}"


if __name__ == "__main__":
    tests = [
        test_canonical_count_and_files,
        test_extended_files,
        test_hub_dual_sections,
        test_sidebar_dynamic_render,
        test_guide_step5_all_tools,
    ]
    failed = 0
    for t in tests:
        try:
            t()
            print("OK", t.__name__)
        except AssertionError as e:
            failed += 1
            print("FAIL", t.__name__, e)
    sys.exit(1 if failed else 0)
