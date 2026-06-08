#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MBTI 四軸能量槽硬化與 P 軸 Fallback 契約。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "mbti-self-awareness.html"
VIZ = REPO / "church_planning" / "js" / "mbti_axes_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "mbti_pack.js"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "16 型性格在堂會事奉" not in html or "shape_p_fallback" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "acs-coaching-desk" not in html or "高 T 與 高 F" not in html:
        sys.exit("FAIL: Tab coaching not hardened")
    if "mbti_axes_viz.js" not in html:
        sys.exit("FAIL: missing mbti_axes_viz.js script")
    if "renderAxesBlock" not in viz or "axisSliderSvg" not in viz:
        sys.exit("FAIL: mbti axes viz incomplete")
    if "shape_p_fallback" not in pack or "axis_percents" not in pack:
        sys.exit("FAIL: mbti_pack P-axis fallback missing")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not exposed on window")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")
    print("OK: MBTI axes + hardened Tab intro/coaching + P-axis contract")


if __name__ == "__main__":
    main()
