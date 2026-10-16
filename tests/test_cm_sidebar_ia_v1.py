#!/usr/bin/env python3
"""CM sidebar IA · A–H 收合 + gateway 總圖 + 頂欄 labels."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
GATEWAY = ROOT / "church_ministry" / "_landing" / "gateway.html"
MODES = ROOT / "config" / "modes.json"
EMBED = ROOT / "js" / "config-embedded.js"
INDEX = ROOT / "index.html"
PLAN_SB = ROOT / "church_planning" / "sidebar_plan.html"
H_MENU = ROOT / "js" / "cm_h_menu_ssot.js"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def test_sidebar_removed_clutter():
    html = read(SIDEBAR)
    for bad in (
        "sb-lang-row",
        "三條河總覽",
        "今日常用",
        "事工戰情儀表板",
        "舊 index",
        "聖經百步四寶",
    ):
        assert bad not in html, f"sidebar still contains {bad!r}"


def test_sidebar_ah_hosts():
    html = read(SIDEBAR)
    for z in ("a", "b", "c", "d", "e", "f", "h"):
        assert f'id="sb-zone-{z}"' in html, z
    assert 'data-focus-zone="g"' in html
    assert "cm_h_menu_ssot.js" in html
    assert "G 規劃行政" in html
    assert "H Attendance" in read(H_MENU) or "H 出席系統" in read(H_MENU)


def test_gateway_ah_map():
    html = read(GATEWAY)
    assert 'data-cm-compass="gateway"' in html
    assert "cm_zone_nav_ssot.js" in html
    assert "cm_compass_shell.js" in html
    assert "cm_compass_zones_ssot.js" in html
    zones = read(ROOT / "church_ministry" / "js" / "cm_compass_zones_ssot.js")
    assert "教會總羅盤" in zones
    assert "tiles:" in zones or "layout: \"mosaic\"" in zones
    shell = read(ROOT / "church_ministry" / "js" / "cm_compass_shell.js")
    assert "cm-mosaic" in shell


def test_modes_g_and_h():
    modes = json.loads(read(MODES))["modes"]
    church = next(m for m in modes if m["id"] == "church")
    g = [x for x in church["secondaryNav"] if x.get("labelZh") == "G 規劃行政"][0]
    h = [x for x in church["secondaryNav"] if x.get("labelZh") == "H 出席系統"][0]
    assert "planning.html" in g["path"]
    assert "focus=g" in g["sidebar"]
    assert "attendance.html" in h["path"]
    assert "focus=h" in h["sidebar"]
    assert "Attend" in h["labelEn"]
    assert "planning.html" in g["path"]
    assert g["labelEn"] == "G Plan"


def test_embedded_focus_h():
    embed = read(EMBED)
    assert "focus=h" in embed
    assert "H 出席系統" in embed


def test_topbar_church_full_labels():
    html = read(INDEX)
    # 頂欄2 由 modes secondaryNav／B100ModuleNavSsot 驅動
    assert "secondaryNav" in html or "B100ModuleNavSsot" in html or "config-embedded" in html


def test_plan_sidebar_slim():
    html = read(PLAN_SB)
    # redirect shell still points at preview
    assert "sidebar_plan" in html.lower() or "preview" in html.lower()


if __name__ == "__main__":
    failed = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                failed += 1
                print("FAIL", name, e)
    sys.exit(1 if failed else 0)
