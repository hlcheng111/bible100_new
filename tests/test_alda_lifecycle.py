#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ALDA 生命週期雷達硬化與契約。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "alda-leadership-assessment.html"
VIZ = REPO / "church_planning" / "js" / "alda_lifecycle_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "alda_pack.js"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "帶領力梯隊生命週期演進" not in html or "願景 Aspiration" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "事工機器" not in html or "先鋒同工" not in html:
        sys.exit("FAIL: Tab coaching pastoral guides missing")
    if "alda_lifecycle_viz.js" not in html:
        sys.exit("FAIL: missing alda_lifecycle_viz.js")
    if "renderLifecycleBlock" not in viz or "lifecycleRadarSvg" not in viz:
        sys.exit("FAIL: alda lifecycle viz incomplete")
    if "alda_lifecycle_contract" not in pack or "lifecycle_position" not in pack:
        sys.exit("FAIL: alda_pack lifecycle contract missing")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not on window")
    if re.search(r"\bglobal\.MinistryPathBridge", html):
        sys.exit("FAIL: global.MinistryPathBridge in page script")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")
    print("OK: ALDA lifecycle radar + hardened Tab intro/coaching contract")


if __name__ == "__main__":
    main()
