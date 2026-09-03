#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
👥 會友事工完整系統 · AI Checklist 靜態契約

Run: python church_ministry/tests/test_member_integrated_contract.py
SSOT: docs/governance/DO_MEMBER_INTEGRATED_AI_CHECKLIST_V1.md §1
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MEMBER = REPO / "church_ministry" / "modules" / "members" / "member-integrated.html"
G_MENU = REPO / "church_planning" / "js" / "planning_sidebar_g_menu.js"
SEED = REPO / "church_ministry" / "load_central_member_seed.html"
BRIDGE = REPO / "js" / "church_data_bridge.js"

TAB_IDS = (
    "tab-overview",
    "tab-members",
    "tab-groups",
    "tab-ministry",
    "tab-growth",
    "tab-analysis",
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    if not MEMBER.is_file():
        print("FAIL: missing member-integrated.html", file=sys.stderr)
        return 1

    html = read(MEMBER)

    for needle in (
        "church_data_bridge.js",
        "crm_context_bar.js",
        "cm_four_pages_roadmap.js",
        'data-cm-four-page="member"',
        "ChurchDataBridge.saveMemberSystemData",
        "👥 會友事工完整系統",
        "spiritual_journey_stage",
        "memberSpiritualStage",
        "in_communion",
    ):
        if needle not in html:
            errors.append(f"member-integrated.html missing: {needle!r}")

    if "localStorage.setItem('memberSystemData'" in html:
        errors.append("member-integrated must not direct-write memberSystemData")

    save_start = html.find("function saveData()")
    save_block = html[save_start : save_start + 600] if save_start >= 0 else ""
    if "saveMemberSystemData" not in save_block:
        errors.append("saveData() must call ChurchDataBridge.saveMemberSystemData")

    for tab_id in TAB_IDS:
        if f'id="{tab_id}"' not in html:
            errors.append(f"missing tab panel: {tab_id}")

    g = read(G_MENU) if G_MENU.is_file() else ""
    if "member-integrated.html" not in g:
        errors.append("planning_sidebar_g_menu.js must link member-integrated.html")
    if "planning_g_admin" not in g:
        errors.append("planning_sidebar_g_menu.js must use crm_from=planning_g_admin")

    seed = read(SEED) if SEED.is_file() else ""
    if "church_data_bridge.js" not in seed:
        errors.append("load_central_member_seed.html must load church_data_bridge.js")

    bridge = read(BRIDGE)
    if "notifyCmDomainChanged('members')" not in bridge:
        errors.append("saveMemberSystemData must notifyCmDomainChanged('members')")

    if errors:
        print("FAIL — member-integrated AI contract:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — member-integrated AI contract (DO_MEMBER_INTEGRATED_AI_CHECKLIST_V1 §1)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
