#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""G 區小白側欄 v2 · 路牌鐵腕（禁六步 / Legacy / blurb）"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RENDER = REPO / "church_planning" / "js" / "planning_sidebar_render.js"
HUB_RENDER = REPO / "church_planning" / "js" / "planning_hub_render.js"
LABELS = REPO / "church_planning" / "js" / "planning_sidebar_labels.js"
REGISTRY = REPO / "church_planning" / "js" / "planning_tool_registry.js"
LAYOUT = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
HUB = REPO / "church_planning" / "assessment-os-hub.html"
LANDING = REPO / "church_planning" / "index_plan.html"

FORBIDDEN_IN_SIDEBAR_RENDER = [
    "t.blurb",
    "ACS 四 Tab",
    "最小因子",
    "十步精靈",
]

FORBIDDEN_IN_G_SIDEBAR_HTML = [
    "cm-g-planning-details",
    "更多步驟",
    "步 1",
    "步 2",
    "步 3",
    "步 4",
    "步 5",
    "步 6",
    "本步導覽",
    "Legacy ref",
    "舊版參考",
    "cm-plan-step",
    "Church_Governance_spiritual_health",
    "cm-planning-sidebar-tools",
]

FORBIDDEN_IN_HUB_HTML = [
    "全部 17",
    "舊版 10",
    "planning-tool-supermarket",
    "planning-tool-extended",
]

FORBIDDEN_IN_LANDING = [
    "六步主線",
    "更多步驟",
]

REQUIRED = [
    "noviceMode",
    "cm-g-phase-tools",
    "cm-g-unlocked-tools",
    "cm-g-progress-strip",
    "toolsForNoviceSidebar",
    "landingHint",
    "PlanningSidebarLabels",
]


def main() -> int:
    errors: list[str] = []

    for path in (RENDER, LABELS, LAYOUT, HUB_RENDER, REGISTRY):
        if not path.is_file():
            errors.append(f"missing {path.relative_to(REPO)}")

    if RENDER.is_file():
        text = RENDER.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_SIDEBAR_RENDER:
            if bad in text:
                errors.append(f"planning_sidebar_render.js must not reference {bad!r}")
        if "sidebar-cat-title" in text:
            errors.append("sidebar render should not emit category titles (路牌模式)")
        for req in ("noviceMode", "cm-g-phase-tools", "toolsForNoviceSidebar"):
            if req not in text:
                errors.append(f"planning_sidebar_render.js missing {req!r}")
        if "extendedHost: null" not in text:
            errors.append("cm profile must set extendedHost: null (no Legacy in novice sidebar)")

    if HUB_RENDER.is_file():
        ht = HUB_RENDER.read_text(encoding="utf-8")
        if "t.blurb" in ht:
            errors.append("planning_hub_render.js must not use t.blurb")
        if "renderSupermarket" in ht or "renderExtended" in ht:
            errors.append("hub render must not expose supermarket/extended to novices")
        if 'phase.id === "advanced"' not in ht:
            errors.append("hub render must skip advanced phase panel")

    if LAYOUT.is_file():
        lt = LAYOUT.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_G_SIDEBAR_HTML:
            if bad in lt:
                errors.append(f"sidebar_church_layout_v1 must not contain {bad!r}")
        for req in ("起步指南", "第一階段體檢", "戰情室看結果", "日常行政儀表"):
            if req not in lt:
                errors.append(f"G sidebar missing novice label: {req!r}")
        if "cm-g-unlocked-tools" not in lt:
            errors.append("G sidebar missing cm-g-unlocked-tools fold")
        if "僅供進階長執" not in lt:
            errors.append("G sidebar missing advanced-only fold")

    if HUB.is_file():
        hub_t = HUB.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_HUB_HTML:
            if bad in hub_t:
                errors.append(f"assessment-os-hub.html must not contain {bad!r}")

    if LANDING.is_file():
        land_t = LANDING.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_LANDING:
            if bad in land_t:
                errors.append(f"index_plan.html must not contain {bad!r}")
        if "左欄是路牌" not in land_t:
            errors.append("index_plan.html missing left-rail hint")

    if REGISTRY.is_file():
        reg_t = REGISTRY.read_text(encoding="utf-8")
        if "sidebarHidden: true" not in reg_t:
            errors.append("EXTENDED tools should set sidebarHidden: true")

    for req in REQUIRED:
        found = False
        for path in (RENDER, LABELS, LAYOUT, HUB_RENDER):
            if path.is_file() and req in path.read_text(encoding="utf-8"):
                found = True
                break
        if not found:
            errors.append(f"missing required signage artifact: {req!r}")

    if errors:
        print("FAIL: planning sidebar signage v2", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1
    print("OK: planning sidebar signage v2")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
