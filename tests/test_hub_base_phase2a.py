#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 2a · Hub Base 接入配對閉環（gateway + demand-form + matching）

Run: python tests/test_hub_base_phase2a.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (REPO / rel.replace("/", "\\")).read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    demand = REPO / "church_ministry" / "demand-form.html"
    gateway = REPO / "church_ministry" / "_landing" / "gateway.html"
    matching = REPO / "smart_ministry" / "talent_ministry_matching.html"

    for p, label in ((demand, "demand-form"), (gateway, "gateway"), (matching, "matching")):
        if not p.is_file():
            errors.append(f"missing {label}: {p.relative_to(REPO)}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    dt = demand.read_text(encoding="utf-8", errors="replace")
    gt = gateway.read_text(encoding="utf-8", errors="replace")
    mt = matching.read_text(encoding="utf-8", errors="replace")

    for needle in ("hub_base_constant.js", "hub_base_utils.js", "HubBase.logAudit", "upsertMinistryCatalog"):
        if needle not in dt:
            errors.append(f"demand-form.html missing {needle!r}")

    if "canPerform('write_talent')" not in dt and "canPerform(\"write_talent\")" not in dt:
        if "HubBase.canPerform" not in dt:
            errors.append("demand-form.html must check HubBase.canPerform for write")

    if "demand-form.html" not in gt:
        errors.append("gateway.html must link to demand-form.html")
    if "talent_ministry_matching.html" not in gt:
        errors.append("gateway.html must link to talent_ministry_matching.html")

    for needle in ("hub_base_constant.js", "hub_base_utils.js", "hubCan(", "hubAuditBridge", "hubRoleSelect"):
        if needle not in mt:
            errors.append(f"talent_ministry_matching.html missing {needle!r}")

    if "match-auto" in mt or "profile-crm" in mt:
        errors.append("matching page must not reference forbidden match-auto/profile-crm")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: hub_base phase2a ({len(errors)} issues)", file=sys.stderr)
        return 1

    print("OK: hub_base phase2a — demand-form + gateway links + matching HubBase wired.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
