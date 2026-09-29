#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 1 · Hub Base 底座靜態煙測（Wave 1）

Run: python tests/test_hub_base_phase1.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HB = REPO / "js" / "hub_base"
GOV = REPO / "docs" / "governance" / "HUB_BASE_V1.md"


def read(rel: str) -> str:
    p = REPO / rel.replace("/", "\\") if "\\" not in rel else REPO / rel
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    files = {
        "constant": HB / "hub_base_constant.js",
        "schema": HB / "hub_base_schema.js",
        "utils": HB / "hub_base_utils.js",
    }
    for name, path in files.items():
        if not path.is_file():
            errors.append(f"missing js/hub_base/hub_base_{name}.js")

    if not GOV.is_file():
        errors.append("missing docs/governance/HUB_BASE_V1.md")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: hub_base phase1 ({len(errors)} issues)", file=sys.stderr)
        return 1

    const_t = files["constant"].read_text(encoding="utf-8", errors="replace")
    schema_t = files["schema"].read_text(encoding="utf-8", errors="replace")
    utils_t = files["utils"].read_text(encoding="utf-8", errors="replace")

    # Constant: roles + CM zones + storage keys
    for needle in ("ROLES", "CM_ZONES", "memberSystemData", "bible100_smart_ministry_main", "bible100_audit_log"):
        if needle not in const_t:
            errors.append(f"hub_base_constant.js missing {needle!r}")

    # Schema: five domains
    for domain in ("MEMBER_CRM", "MINISTRY_CATALOG", "TALENT_POOL", "AUDIT_LOG", "PDCA_RUN"):
        if domain not in schema_t:
            errors.append(f"hub_base_schema.js missing domain {domain}")
    if "spaceId" not in schema_t and "churchId" not in schema_t:
        errors.append("hub_base_schema.js missing spaceId/churchId fields")

    # Utils: facade + audit + bundle + no replace canonical
    for fn in ("logAudit", "exportBundle", "importBundle", "getSpaceId", "setSimulatedRole", "canPerform", "validateRecord"):
        if fn not in utils_t:
            errors.append(f"hub_base_utils.js missing function {fn!r}")
    if "CentralMemberDB" not in utils_t or "SmartMinistryCanonical" not in utils_t:
        errors.append("hub_base_utils.js must delegate to canonical APIs")
    if "不取代" not in utils_t and "facade" not in utils_t.lower():
        errors.append("hub_base_utils.js must document facade-not-replacement policy")

    # Governance doc references
    gov_t = GOV.read_text(encoding="utf-8", errors="replace")
    for needle in ("CentralMemberDB", "SmartMinistryCanonical", "AssessmentRunStore", "facade"):
        if needle not in gov_t:
            errors.append(f"HUB_BASE_V1.md missing reference to {needle!r}")

    # Manifest governance doc (optional check)
    manifest = REPO / "config" / "module_manifest.json"
    if manifest.is_file():
        if "HUB_BASE_V1.md" not in manifest.read_text(encoding="utf-8", errors="replace"):
            errors.append("module_manifest.json governanceDocs should list HUB_BASE_V1.md")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: hub_base phase1 ({len(errors)} issues)", file=sys.stderr)
        return 1

    print("OK: hub_base phase1 — 3 modules, 5 schema domains, facade+audit+bundle, governance doc.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
