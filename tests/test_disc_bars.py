#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DISC 四軸對比硬化與柱狀圖契約。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "disc-profile-assessment.html"
VIZ = REPO / "church_planning" / "js" / "disc_bars_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "disc_pack.js"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "D 推進型 Dominance" not in html or "溝通節奏修飾" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "acs-coaching-desk" not in html or "高 D 長老開會" not in html:
        sys.exit("FAIL: Tab coaching not hardened")
    if "disc_bars_viz.js" not in html:
        sys.exit("FAIL: missing disc_bars_viz.js script")
    if "renderCompareBlock" not in viz or "stress_scores" not in viz:
        sys.exit("FAIL: disc bars viz incomplete")
    if "stress_scores" not in pack or "computeStressScores" not in pack:
        sys.exit("FAIL: disc_pack stress scores missing")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")
    print("OK: DISC bars + hardened Tab intro/coaching contract")


if __name__ == "__main__":
    main()
