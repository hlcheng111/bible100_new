#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阶段 2 · CM A/B/D 主路升格静态检查（波 5 扩展）

Run: python church_ministry/tests/test_cm_phase2_wave.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MODES = REPO / "config" / "modes.json"
EMBEDDED = REPO / "js" / "config-embedded.js"
SUNDAY = REPO / "church_ministry" / "modules" / "worship" / "worship-sunday-desk.html"
SG = REPO / "church_ministry" / "modules" / "fellowship" / "small-groups-integrated.html"
FELLOW_LAND = REPO / "church_ministry" / "_landing" / "fellowship.html"
OUT_SHELL = REPO / "church_ministry" / "modules" / "expansion" / "outreach-integrated.html"
SIDEBAR = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
CM_SHELL = REPO / "church_ministry" / "js" / "cm_index_shell.js"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    sunday = read(SUNDAY)
    if 'id="memberJump"' not in sunday:
        errors.append("worship-sunday-desk.html missing memberJump select")
    if "jumpToMember" not in sunday:
        errors.append("worship-sunday-desk.html missing jumpToMember()")
    if "savePastoralFollowup" not in sunday:
        errors.append("worship-sunday-desk pushVisitation should use Bridge savePastoralFollowup")
    if "visitationDraftsFromAttendance" in sunday:
        errors.append("worship-sunday-desk should not write visitationDraftsFromAttendance (dual truth)")

    sg = read(SG)
    for needle in (
        "pastoral_data_hub.js",
        "small_groups_workspace.js",
        "pastoral_workspace.css",
        "sg-tab-overview",
        "sg-panel-overview",
        "pastoral-attendance.html",
    ):
        if needle not in sg:
            errors.append(f"small-groups-integrated.html missing: {needle}")

    land = read(FELLOW_LAND)
    if "small-groups-integrated.html" not in land:
        errors.append("fellowship landing should link small-groups-integrated.html")
    import re
    if re.search(r'small-groups-integrated\.html[^"\']*target="contentFrame"', land):
        errors.append("fellowship primary CTA must not use target=contentFrame")

    modes = json.loads(MODES.read_text(encoding="utf-8"))
    church = next(m for m in modes["modes"] if m["id"] == "church")
    a_item = next(x for x in church["secondaryNav"] if x.get("labelShort") == "A")
    b_item = next(x for x in church["secondaryNav"] if x.get("labelShort") == "B")
    d_item = next(x for x in church["secondaryNav"] if x.get("labelShort") == "D")
    if "worship-sunday-desk.html" not in a_item.get("path", ""):
        errors.append("modes.json A path should be worship-sunday-desk.html")
    if "small-groups-integrated.html" not in b_item.get("path", ""):
        errors.append("modes.json B path should be small-groups-integrated.html")
    if "outreach-integrated.html" not in d_item.get("path", ""):
        errors.append("modes.json D path should be outreach-integrated.html")

    emb = read(EMBEDDED)
    if "worship-sunday-desk.html" not in emb:
        errors.append("config-embedded.js A path should include worship-sunday-desk.html")
    if "outreach-integrated.html" not in emb:
        errors.append("config-embedded.js D path should include outreach-integrated.html")

    sidebar = read(SIDEBAR)
    if "openBZoneContentInShell" in sidebar:
        errors.append("sidebar_church_layout_v1 must not hijack B zone (openBZoneContentInShell)")
    if "worship-sunday-desk.html" not in sidebar:
        errors.append("sidebar A primary should link worship-sunday-desk.html")

    shell = read(CM_SHELL)
    if re.search(r'focus\s*===\s*"a"[\s\S]{0,400}_landing/worship\.html', shell):
        errors.append("cm_index_shell focus=a should not default to _landing/worship.html")
    if "sidebar_pastoral_journey.html" in shell and re.search(
        r'focus\s*===\s*"b"[\s\S]{0,400}sidebar_pastoral_journey', shell
    ):
        errors.append("cm_index_shell focus=b should use sidebar_church_layout_v1 not pastoral journey")
    if "small-groups-integrated.html" not in shell:
        errors.append("cm_index_shell focus=b should route to small-groups-integrated.html")

    out = read(OUT_SHELL)
    if "outreach_integrated_shell.js" not in out:
        errors.append("outreach-integrated.html missing shell script")
    if "outreach-strategy.html" not in out:
        errors.append("outreach-integrated iframe should load outreach-strategy.html")

    if errors:
        print("FAIL — CM phase 2 wave:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — CM phase 2 wave (A/B/D · wave5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
