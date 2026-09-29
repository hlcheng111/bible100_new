#!/usr/bin/env python3

# -*- coding: utf-8 -*-

"""全站 L0/L1 landing SSOT 靜態檢查。"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
REGISTRY = REPO / "config" / "landing_registry.json"

REQUIRED_FILES = [
    "help/site_home.html",
    "help/sidebar_site_map.html",
    "help/page_placeholder.html",
    "languages/_landing/home.html",
    "bible_study/_landing/home.html",
    "qna/_landing/home.html",
    "church_ministry/_landing/gateway.html",
    "school_management/_landing/home.html",
    "ai_tools/_landing/home.html",
    "tools/_landing/home.html",
    "js/b100_nav_ssot.js",
    "js/b100_route_map.js",
    "js/b100_shell_route_nav.js",
    "js/b100_module_sidebar.js",
    "css/b100_route_map.css",
    "css/b100_module_sidebar.css",
    "config/landing_registry.json",
]

# 顶栏进模块 → 旧工作侧栏（非 sidebar_landing）
SIDEBAR_BY_MODE = {
    "material": "languages/index_cn.html",
    "study": "bible_study/sidebar.html",
    "qna": "about:blank",
    "church": "church_ministry/sidebar_church_layout_v1.html",
    "school": "school_management/sidebar.html",
    "ai": "ai_tools/sidebar_lab.html",
}

LANDING_MUST_LOAD_SSOT = [
    "help/site_home.html",
    "languages/_landing/home.html",
    "bible_study/_landing/home.html",
    "qna/_landing/home.html",
    "church_ministry/_landing/gateway.html",
    "school_management/_landing/home.html",
    "ai_tools/_landing/home.html",
    "tools/_landing/home.html",
]


def main() -> int:
    missing = [p for p in REQUIRED_FILES if not (REPO / p).is_file()]
    if missing:
        print("FAIL: missing landing files:", ", ".join(missing), file=sys.stderr)
        return 1

    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    site = data.get("siteHome") or {}
    if site.get("sidebar") != "help/sidebar_site_map.html":
        print("FAIL: landing_registry siteHome.sidebar", file=sys.stderr)
        return 1

    modes = data.get("modes") or {}
    for mode_id, sidebar in SIDEBAR_BY_MODE.items():
        entry = modes.get(mode_id) or {}
        if entry.get("sidebar") != sidebar:
            print(f"FAIL: modes.{mode_id}.sidebar should be {sidebar}", file=sys.stderr)
            return 1

    index_v5 = (REPO / "index_v5.html").read_text(encoding="utf-8", errors="replace")
    if "b100_nav_ssot.js" not in index_v5:
        print("FAIL: index_v5 should load b100_nav_ssot.js", file=sys.stderr)
        return 1
    if "languages/index_cn.html" not in index_v5:
        print("FAIL: index_v5 should reference languages/index_cn.html default sidebar", file=sys.stderr)
        return 1

    ssot_js = (REPO / "js/b100_nav_ssot.js").read_text(encoding="utf-8", errors="replace")
    for key in ("site", "material", "study", "qna", "church", "school", "ai"):
        if key + ":" not in ssot_js:
            print(f"FAIL: b100_nav_ssot.js missing tree {key}", file=sys.stderr)
            return 1
    if "B100_navLinkAttrs" not in ssot_js:
        print("FAIL: b100_nav_ssot.js missing B100_navLinkAttrs", file=sys.stderr)
        return 1

    for rel in LANDING_MUST_LOAD_SSOT:
        html = (REPO / rel).read_text(encoding="utf-8", errors="replace")
        if "b100_nav_ssot.js" not in html:
            print(f"FAIL: {rel} should load b100_nav_ssot.js", file=sys.stderr)
            return 1
        if "b100_landing_tabs" in html:
            print(f"FAIL: {rel} should not load landing tabs", file=sys.stderr)
            return 1
        if "data-b100-route-map" not in html:
            print(f"FAIL: {rel} should include route map", file=sys.stderr)
            return 1
        if 'src="#"' in html or "href=\"#\"" in html:
            print(f"WARN: {rel} still has # placeholder links", file=sys.stderr)

    material_html = (REPO / "languages/_landing/home.html").read_text(encoding="utf-8", errors="replace")
    if "landing_infographic_loop.png" not in material_html:
        print("FAIL: languages/_landing/home.html missing loop infographic", file=sys.stderr)
        return 1

    # 資訊圖路徑存在性
    img_checks = {
        "languages/_landing/home.html": REPO / "languages/images/landing_infographic_flow.png",
        "languages/_landing/home.html#loop": REPO / "languages/images/landing_infographic_loop.png",
        "bible_study/_landing/home.html": REPO / "docs/image_b100_site/b100_09—bible_study_ladder.jpg",
        "qna/_landing/home.html": REPO / "docs/image_b100_site/b100_04—qna_four_layer_flow.jpg",
        "church_ministry/_landing/gateway.html": REPO / "docs/image_b100_site/b100_03—church_ministry_gateway_three_rivers.jpg",
        "school_management/_landing/home.html": REPO / "docs/image_b100_site/b100_11—school_campus_hub.png",
        "ai_tools/_landing/home.html": REPO / "docs/image_b100_site/b100_05—ai_lab_three_paths.jpg",
        "tools/_landing/home.html": REPO / "docs/image_b100_site/b100_G0_site_map_infographic.png",
    }
    for rel, img_path in img_checks.items():
        if not img_path.is_file():
            print(f"FAIL: landing infographic missing for {rel}: {img_path}", file=sys.stderr)
            return 1

    print("OK: site landing SSOT static checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
