#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SITE-5a · CM-F1 + CM-F2 静态检查

Run:
  python church_ministry/tests/test_cm_site5a_wave.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

GUIDE_STEP6 = REPO / "church_planning" / "guides" / "guide_step6_crm.html"
PLANNING_NAV = REPO / "church_planning" / "js" / "planning_nav.js"
SIDEBAR_PLAN = REPO / "church_planning" / "sidebar_plan.html"
CROSS_RISK = REPO / "church_planning" / "cross_risk_summary.html"
LEAVE_SWAP = REPO / "church_ministry" / "tools" / "volunteer_shift" / "leave_swap.html"
TOOL_JS = REPO / "church_ministry" / "tools" / "volunteer_shift" / "tool.js"
ROADMAP_JS = REPO / "church_ministry" / "js" / "cm_four_pages_roadmap.js"
CRM_CTX = REPO / "church_ministry" / "js" / "crm_context_bar.js"

FOUR_PAGES = [
    (REPO / "church_ministry" / "modules" / "members" / "member-integrated.html", "member"),
    (REPO / "church_ministry" / "modules" / "support" / "visitation_index.html", "visit"),
    (REPO / "church_ministry" / "modules" / "finance" / "finance-integrated.html", "finance"),
    (REPO / "church_ministry" / "tools" / "volunteer_shift" / "index.html", "shift"),
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    guide = read(GUIDE_STEP6)
    if "capability-placeholder?id=matchmaker" in guide:
        errors.append("guide_step6_crm.html still links matchmaker placeholder")
    if "planningOpenByToolId(event,'matchmaker')" not in guide:
        errors.append("guide_step6_crm.html must link live matchmaker via planningOpenByToolId")
    if "leave_swap.html" not in guide:
        errors.append("guide_step6_crm.html must link leave_swap.html")
    if "四页" not in guide and "四頁" not in guide:
        errors.append("guide_step6_crm.html should document four-page roadmaps")

    nav = read(PLANNING_NAV)
    if 'appendQueryParam(contentUrl, "crm_from"' not in nav and "crm_from=planning_step6" not in nav:
        errors.append("planning_nav.js must append crm_from via appendQueryParam or literal")
    if '"planning_step6"' not in nav and "planning_step6" not in nav:
        errors.append("planning_nav.js must default crmFrom to planning_step6")

    sidebar = read(SIDEBAR_PLAN)
    if "cross_risk_summary.html" not in sidebar:
        errors.append("sidebar_plan.html must link cross_risk_summary.html")
    if "leave_swap.html" not in sidebar:
        errors.append("sidebar_plan.html must link leave_swap.html")

    g_admin = read(REPO / "js" / "g_do_admin_menu_ssot.js")
    if "cross_risk_summary.html" not in g_admin:
        errors.append("g_do_admin_menu_ssot.js must include cross_risk_summary.html")
    if 'maturity: "wip"' in g_admin and "shift_leave" in g_admin:
        # leave is live — must not keep wip on shift_leave block
        if 'id: "shift_leave"' in g_admin and 'maturity: "wip"' in g_admin.split('id: "shift_leave"', 1)[1][:180]:
            errors.append("g_do_admin_menu_ssot.js shift_leave must not be maturity wip")
    if "ministry-position-matchmaker.html" not in g_admin:
        errors.append("g_do_admin_menu_ssot.js must include ministry-position-matchmaker.html")

    war = read(REPO / "church_planning" / "js" / "cta_os_war_room.js")
    if "guide_crm_journey_hub.html?tab=matchmaker" in war:
        errors.append("cta_os_war_room.js must not send matchmaker to retired CRM hub")
    if "ministry-position-matchmaker.html" not in war:
        errors.append("cta_os_war_room.js HUB.matchmaker must target live matchmaker page")

    for path, label in (
        (CROSS_RISK, "cross_risk_summary"),
        (LEAVE_SWAP, "leave_swap"),
        (ROADMAP_JS, "cm_four_pages_roadmap.js"),
    ):
        if not path.is_file():
            errors.append(f"missing file: {label} ({path})")

    cross = read(CROSS_RISK)
    if "AssessmentRunStore" not in cross:
        errors.append("cross_risk_summary.html must use AssessmentRunStore")

    leave = read(LEAVE_SWAP)
    if "saveLeaveRequest" not in leave:
        errors.append("leave_swap.html must call saveLeaveRequest")
    if "data-cm-four-page=\"shift\"" not in leave:
        errors.append("leave_swap.html must set data-cm-four-page=shift")

    tool = read(TOOL_JS)
    if "leave_swap" not in tool or "saveLeaveRequest" not in tool:
        errors.append("tool.js must implement leave_swap nav + saveLeaveRequest")

    ctx = read(CRM_CTX)
    if "planning_step6" not in ctx:
        errors.append("crm_context_bar.js must handle crm_from=planning_step6")

    for path, key in FOUR_PAGES:
        if not path.is_file():
            errors.append(f"missing four-page: {key}")
            continue
        text = read(path)
        if f'data-cm-four-page="{key}"' not in text:
            errors.append(f"{path.name} must set data-cm-four-page={key}")
        if "cm_four_pages_roadmap.js" not in text:
            errors.append(f"{path.name} must load cm_four_pages_roadmap.js")

    if errors:
        print("FAIL — SITE-5a CM-F1/F2:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — SITE-5a CM-F1 + CM-F2 static checks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
