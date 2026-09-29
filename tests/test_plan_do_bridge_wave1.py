#!/usr/bin/env python3
"""Plan↔Do 波 1+2 静态守门：G 行政交棒 + dashboard SPAC 深链。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOCKERS: list[str] = []
WARNS: list[str] = []


def read(rel: str) -> str:
    p = ROOT / rel.replace("/", "\\")
    if not p.is_file():
        BLOCKERS.append(f"missing file: {rel}")
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


def must_contain(hay: str, needle: str, label: str, warn: bool = False) -> None:
    if needle not in hay:
        (WARNS if warn else BLOCKERS).append(f"{label}: missing `{needle}`")


def main() -> int:
    g_menu = read("church_planning/js/planning_sidebar_g_menu.js")
    must_contain(g_menu, "planning_g_admin", "G admin menu crm_from")
    must_contain(g_menu, "DO_CRM_FROM", "G admin DO_CRM_FROM const")
    must_contain(g_menu, "member-integrated.html", "G admin member link")

    preview = read("church_planning/sidebar_plan_v5_preview.html")
    must_contain(preview, "planning_g_admin", "sidebar preview dashboard crm_from")

    landing = read("church_planning/landing_g_admin.html")
    must_contain(landing, "健康雷達戰情室", "landing two-room Plan")
    must_contain(landing, "戰情總覽", "landing two-room Do")

    ctx = read("church_ministry/js/crm_context_bar.js")
    must_contain(ctx, "planning_g_admin", "crm_context_bar G admin")
    must_contain(ctx, "isPlanningFrom", "crm_context_bar isPlanningFrom")

    dash = read("church_ministry/dashboard.html")
    must_contain(dash, "do-plan-bridge-mount", "dashboard plan-do mount")
    must_contain(dash, "do_ops_activation.js", "dashboard DoOpsActivation")
    must_contain(dash, "data-kpi-target", "dashboard SPAC deep links")
    must_contain(dash, "wireSpacKpiDeepLinks", "dashboard wire SPAC")
    must_contain(dash, "b100-cm-data-changed", "dashboard data-changed listener")
    must_contain(dash, "plan_do_bridge.css", "dashboard plan_do_bridge css")

    do_ops = read("church_ministry/js/do_ops_activation.js")
    must_contain(do_ops, "renderPlanDoBanner", "DoOpsActivation banner")
    must_contain(do_ops, "cta-os-war-room.html", "DoOps banner war room link")

    roadmap = read("church_ministry/js/cm_four_pages_roadmap.js")
    must_contain(roadmap, "planning_g_admin", "four pages roadmap G admin")

    member = read("church_ministry/modules/members/member-integrated.html")
    must_contain(member, "crm_context_bar.js", "member context bar")
    must_contain(member, "cmFourPagesRoadmapMount", "member roadmap mount")

    finance = read("church_ministry/modules/finance/finance-integrated.html")
    must_contain(finance, "crm_context_bar.js", "finance context bar")

    checklist = read("docs/governance/PLAN_DO_ACCEPTANCE_CHECKLIST_V1.md")
    must_contain(checklist, "第 0 部分", "checklist part 0")

    print("=== Plan-Do bridge wave 1+2 gate ===\n")
    if WARNS:
        print(f"WARN ({len(WARNS)}):")
        for w in WARNS:
            print(f"  - {w}")
    if BLOCKERS:
        print(f"\nBLOCKERS ({len(BLOCKERS)}):")
        for b in BLOCKERS:
            print(f"  - {b}")
        print("\nRESULT: FAIL")
        return 1
    print(f"\nRESULT: OK — 0 blockers, {len(WARNS)} warn(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
