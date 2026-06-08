#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Johari 四象限硬化與交叉比對矩陣契約。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "johari-window-assessment.html"
VIZ = REPO / "church_planning" / "js" / "johari_matrix_viz.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "johari_pack.js"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    viz = VIZ.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if "自評 vs 邀請他評" not in html or "四象限與事奉方向" not in html:
        sys.exit("FAIL: Tab intro not fully hardened")
    if "acs-coaching-desk" not in html or "同工盲區" not in html:
        sys.exit("FAIL: Tab coaching not hardened")
    if "johari_matrix_viz.js" not in html:
        sys.exit("FAIL: missing johari_matrix_viz.js script")
    if "renderFullMatrix" not in viz or "compareBarsHtml" not in viz:
        sys.exit("FAIL: matrix viz incomplete")
    if "peer_overlay" not in pack or "buildDemoRun" not in pack:
        sys.exit("FAIL: johari_pack demo peer missing")
    if re.search(r"matching_demo", html):
        sys.exit("FAIL: matching_demo dead link")
    if "window.loadDemoReport" not in html:
        sys.exit("FAIL: loadDemoReport not exposed on window")
    if re.search(r"\bglobal\.MinistryPathBridge", html):
        sys.exit("FAIL: browser-invalid global.MinistryPathBridge in page script")
    if "Blind 盲點區偏高" not in html:
        sys.exit("FAIL: Tab coaching missing Blind/Hidden scenario pack")
    if "四象限牧養誤區" not in html:
        sys.exit("FAIL: Tab intro missing pastoral misconceptions")
    if "acs-peer-feedback" not in html:
        sys.exit("FAIL: peer merge inline feedback missing")
    if re.search(r"\balert\s*\(", html):
        sys.exit("FAIL: peer submit still uses alert()")
    print("OK: Johari matrix + hardened Tab intro/coaching contract")


if __name__ == "__main__":
    main()
