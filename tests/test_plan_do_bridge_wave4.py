#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Plan↔Do 波 4 静态守门：Do→Plan 回饋 + PDCA Check 引用。"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOCKERS: list[str] = []


def read(rel: str) -> str:
    p = ROOT / rel.replace("/", "\\")
    if not p.is_file():
        BLOCKERS.append(f"missing file: {rel}")
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


def must_contain(hay: str, needle: str, label: str) -> None:
    if needle not in hay:
        BLOCKERS.append(f"{label}: missing `{needle}`")


def main() -> int:
    feedback = read("church_ministry/js/do_plan_feedback.js")
    must_contain(feedback, "bible100_do_plan_feedback_v1", "do_plan_feedback storage key")
    must_contain(feedback, "buildCrossRiskSignals", "cross-risk builder")
    must_contain(feedback, "pdca_check_text", "PDCA check text")
    must_contain(feedback, "renderDoPlanFeedbackPanel", "dashboard panel")
    must_contain(feedback, "renderPdcaDoFeedbackBanner", "PDCA banner")
    must_contain(feedback, "Church_Governance_PDCA_cycle.html", "PDCA link")
    must_contain(feedback, "Church_Governance_urgent_matrix.html", "urgent link")

    dash = read("church_ministry/dashboard.html")
    must_contain(dash, "do-plan-feedback-mount", "dashboard Do→Plan mount")
    must_contain(dash, "do_plan_feedback.js", "dashboard loads DoPlanFeedback")

    css = read("church_ministry/css/plan_do_bridge.css")
    must_contain(css, "do-plan-feedback", "Do→Plan CSS")

    pdca = read("church_planning/Church_Governance_PDCA_cycle.html")
    must_contain(pdca, "pdca-do-feedback-banner", "PDCA Do feedback banner")
    must_contain(pdca, "do_plan_feedback.js", "PDCA loads DoPlanFeedback")

    shell = read("church_planning/js/pdca_acs_shell.js")
    must_contain(shell, "renderDoFeedbackBanners", "PdcaAcsShell Do feedback hook")

    checklist = read("docs/governance/PLAN_DO_ACCEPTANCE_CHECKLIST_V1.md")
    must_contain(checklist, "波 4", "checklist wave 4 section")

    print("=== Plan-Do bridge wave 4 gate ===\n")
    if BLOCKERS:
        print(f"BLOCKERS ({len(BLOCKERS)}):")
        for b in BLOCKERS:
            print(f"  - {b}")
        print("\nRESULT: FAIL")
        return 1
    print("RESULT: OK — 0 blockers")
    return 0


if __name__ == "__main__":
    sys.exit(main())
