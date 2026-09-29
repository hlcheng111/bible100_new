#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase 3b–7 + 四語 Track 快檢。Run: python tests/test_hub_phases_3b_7.py"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (REPO / rel.replace("/", "\\")).read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    for rel in (
        "hub-audit-viewer.html",
        "hub-data-health.html",
        "hub-mainline-maturity.html",
        "js/hub_base/hub_base_ops.js",
        "js/hub_base/hub_assessment_import.js",
        "ai_tools/js/ai_draft_guard.js",
        "church_ministry/js/cm_hub_task_strip.js",
        "docs/governance/HUB_MAINLINE_MATURITY_V1.md",
    ):
        if not (REPO / rel.replace("/", "\\")).is_file():
            errors.append(f"missing {rel}")

    edu = read("church_ministry/modules/education/education-integrated.html")
    past = read("church_ministry/modules/fellowship/pastoral-integrated.html")
    shift = read("church_ministry/tools/volunteer_shift/index.html")
    skill = read("smart_ministry/talent_skill_unified.html")
    wb = read("ai_tools/tools/ai_workbench_integrated.html")

    if "cm_hub_task_strip.js" not in edu:
        errors.append("C education missing task strip")
    if "cm_hub_task_strip.js" not in past:
        errors.append("B pastoral missing task strip")
    if "cm_hub_task_strip.js" not in shift:
        errors.append("E shift missing task strip")
    if "HubAssessmentImport" not in skill:
        errors.append("talent_skill_unified missing Phase 5 import")
    if "ai_draft_guard.js" not in wb:
        errors.append("ai workbench missing draft guard")

    langs = read("config/languages.json")
    for code in ("cn", "en", "vi", "id"):
        needle = f'"code": "{code}"'
        if needle not in langs:
            errors.append(f"languages.json missing {code}")
        sidebar_key = f"index_{code}.html"
        if sidebar_key not in langs:
            errors.append(f"languages.json missing sidebar for {code}")
        p = REPO / "languages" / f"index_{code}.html"
        if not p.is_file():
            errors.append(f"missing languages/{sidebar_key}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: phases 3b-7 ({len(errors)})", file=sys.stderr)
        return 1

    print("OK: phases 3b-7 + 4-lang track indexes present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
