#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 3 · PDCA Hub 閉環 + 三模側欄會友主路

Run: python tests/test_hub_base_phase3.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (REPO / rel.replace("/", "\\")).read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    pdca = REPO / "church_planning" / "Church_Governance_PDCA_cycle.html"
    spiritual = REPO / "church_planning" / "Church_Governance_spiritual_health.html"
    bridge = REPO / "church_planning" / "js" / "pdca_hub_bridge.js"
    shell = REPO / "church_planning" / "js" / "pdca_hub_shell.js"
    cong = REPO / "church_planning" / "js" / "spiritual_congregation_panel.js"

    for p, label in (
        (pdca, "PDCA html"),
        (spiritual, "spiritual html"),
        (bridge, "pdca_hub_bridge"),
        (shell, "pdca_hub_shell"),
        (cong, "spiritual_congregation_panel"),
    ):
        if not p.is_file():
            errors.append(f"missing {label}: {p.relative_to(REPO)}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    pt = pdca.read_text(encoding="utf-8", errors="replace")
    st = spiritual.read_text(encoding="utf-8", errors="replace")
    bt = bridge.read_text(encoding="utf-8", errors="replace")
    sht = shell.read_text(encoding="utf-8", errors="replace")

    for needle in (
        "hub_base_utils.js",
        "pdca_hub_bridge.js",
        "pdca_hub_shell.js",
        "pdca-hub-manpower-card",
        "pdca-hub-act-card",
    ):
        if needle not in pt:
            errors.append(f"PDCA page missing {needle!r}")

    for needle in ("pdca_hub_bridge.js", "spiritual_congregation_panel.js", "spiritual-congregation-mount"):
        if needle not in st:
            errors.append(f"spiritual health missing {needle!r}")

    for needle in (
        "computeManpowerSnapshot",
        "applyActAndPrepareMatching",
        "formatCheckText",
        "PdcaHubBridge",
    ):
        if needle not in bt:
            errors.append(f"pdca_hub_bridge.js missing {needle!r}")

    if "pdca-hub-act-apply" not in sht:
        errors.append("pdca_hub_shell.js must wire Act apply button")

    sm_sb = read("smart_ministry/sidebar.html")
    ai_sb = read("ai_tools/sidebar_lab.html")
    gw = read("church_ministry/_landing/gateway.html")
    gifts = read("smart_ministry/spiritual_gifts.html")
    plan_sb = read("church_planning/sidebar_plan_v5_preview.html")

    if "會友主路" not in sm_sb:
        errors.append("SM sidebar missing 會友主路 strip")
    if "人找工（先從這裡）" not in ai_sb:
        errors.append("AI Lab sidebar missing 會友主路 section")
    if "我是會友" not in gw:
        errors.append("CM gateway missing 會友入口")
    if "talent_ministry_matching.html" in gifts and "事奉配對工作台 →" in gifts:
        errors.append("spiritual_gifts nav-row must not expose member matching CTA")
    if "本季事奉檢討" not in plan_sb:
        errors.append("planning sidebar missing PDCA entry")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: hub_base phase3 ({len(errors)} issues)", file=sys.stderr)
        return 1

    print("OK: hub_base phase3 — PDCA bridge + spiritual congregation + sidebar member paths.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
