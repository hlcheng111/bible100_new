#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SHAPE 九大恩賜雷達 · 靜態契約與 pack 資料鍵。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SHAPE_HTML = REPO / "church_planning" / "shape-gifts-assessment.html"
RADAR_JS = REPO / "church_planning" / "js" / "shape_radar_svg.js"
CONTENT_JS = REPO / "church_planning" / "js" / "coaching_desk_content.js"
PACK_JS = REPO / "church_planning" / "js" / "tool_packs" / "shape_pack.js"

GIFT_KEYS = [
    "teaching", "shepherding", "encouragement", "administration",
    "evangelism", "serving", "hospitality", "worship", "discernment",
]


def main() -> None:
    html = SHAPE_HTML.read_text(encoding="utf-8")
    radar = RADAR_JS.read_text(encoding="utf-8")
    content = CONTENT_JS.read_text(encoding="utf-8")
    pack = PACK_JS.read_text(encoding="utf-8")

    if "acs-quickstart" not in html or "神國職位推薦矩陣" not in html:
        sys.exit("FAIL: Tab ① 未硬化完整理念")
    if "acs-coaching-desk" not in html or "acs-invite-draft" not in html:
        sys.exit("FAIL: Tab ④ 未硬化輔導桌")
    if 'data-acs-hardcoded="true"' not in html:
        sys.exit("FAIL: 缺少 data-acs-hardcoded")
    if "shape_radar_svg.js" not in html:
        sys.exit("FAIL: 未引入 shape_radar_svg.js")
    for k in GIFT_KEYS:
        if k not in radar:
            sys.exit(f"FAIL: radar 缺少恩賜鍵 {k}")
    if 'toolId === "shape"' not in content or "ShapeRadarSvg" not in content:
        sys.exit("FAIL: coaching_desk_content 未接通 SHAPE 雷達")
    if "gift_scores" not in pack:
        sys.exit("FAIL: shape_pack 無 gift_scores")
    if "shape_engine_contract" not in pack or "buildShapeEngineContract" not in pack:
        sys.exit("FAIL: shape_pack 無 shape_engine_contract")
    if "九大屬靈恩賜白話定位" not in html:
        sys.exit("FAIL: Tab intro missing nine gifts plain table")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: 仍有 matching_demo 死鏈")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not exposed on window")
    if re.search(r"\bglobal\.MinistryPathBridge", html):
        sys.exit("FAIL: browser-invalid global.MinistryPathBridge in page script")
    if "恩賜誤解澄清" not in html:
        sys.exit("FAIL: Tab coaching missing pastoral scenario pack")
    print("OK: SHAPE radar + hardened Tab intro/coaching contract")


if __name__ == "__main__":
    main()
