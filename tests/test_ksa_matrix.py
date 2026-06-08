#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""KSA 九宮格硬化與執行力契約。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "ministry-competency-assessment.html"
VIZ = REPO / "church_planning" / "js" / "ksa_matrix_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "competency_pack.js"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "堂會關鍵職位 KSA" not in html or "知識 Knowledge" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "倦怠老手" not in html or "熱血新人" not in html:
        sys.exit("FAIL: Tab coaching pastoral guides missing")
    if "ksa_matrix_viz.js" not in html:
        sys.exit("FAIL: missing ksa_matrix_viz.js")
    if "renderMatrixBlock" not in viz or "ZONE_LABELS" not in viz:
        sys.exit("FAIL: ksa matrix viz incomplete")
    if "ksa_execution_contract" not in pack or "matrix_position" not in pack:
        sys.exit("FAIL: competency_pack execution contract missing")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not on window")
    if re.search(r"\bglobal\.MinistryPathBridge", html):
        sys.exit("FAIL: global.MinistryPathBridge in page script")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")
    print("OK: KSA matrix + hardened Tab intro/coaching contract")


if __name__ == "__main__":
    main()
