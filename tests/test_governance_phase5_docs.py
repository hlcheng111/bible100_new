#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阶段 5+ 治理文档静态检查（CM 全熟预算 + 模块波次表）

Run: python tests/test_governance_phase5_docs.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM_BUDGET = REPO / "docs" / "governance" / "CM_FULL_MATURITY_BUDGET_V1.md"
WAVES = REPO / "docs" / "governance" / "SITE_PHASE_5PLUS_MODULE_WAVES_V1.md"
ROADMAP = REPO / "docs" / "governance" / "SITE_PHASE_ROADMAP_V1.md"
AUDIT = REPO / "church_ministry" / "docs" / "CHURCH_MODULE_MATURITY_AUDIT_V2.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    for path in (CM_BUDGET, WAVES):
        if not path.is_file():
            errors.append(f"missing {path.name}")

    if CM_BUDGET.is_file():
        cm = read(CM_BUDGET)
        for needle in ("CM-F1", "CM-F2", "CM-F6", "CHURCH_MODULE_MATURITY_AUDIT_V2", "基本四页"):
            if needle not in cm:
                errors.append(f"CM budget missing: {needle}")

    if WAVES.is_file():
        w = read(WAVES)
        for needle in (
            "SITE-5a",
            "SITE-6",
            "SITE-7",
            "SITE-8",
            "CM 先于 BS",
            "CHURCH_MODULE_MATURITY_AUDIT_V2",
        ):
            if needle not in w:
                errors.append(f"5+ waves missing: {needle}")

    roadmap = read(ROADMAP)
    if "CM_FULL_MATURITY_BUDGET_V1" not in roadmap:
        errors.append("SITE_PHASE_ROADMAP should link CM_FULL_MATURITY_BUDGET_V1")
    if "SITE_PHASE_5PLUS_MODULE_WAVES_V1" not in roadmap:
        errors.append("SITE_PHASE_ROADMAP should link SITE_PHASE_5PLUS_MODULE_WAVES_V1")

    audit = read(AUDIT)
    if "CM_FULL_MATURITY_BUDGET_V1" not in audit:
        errors.append("CHURCH_MODULE_MATURITY_AUDIT_V2 should link CM budget")

    if errors:
        print("FAIL — governance phase 5+ docs:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — governance phase 5+ docs (CM budget + module waves)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
