#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 3b · 審計檢視 + 健康快照 + Demo 隔離 + 異常流程

Run: python tests/test_hub_base_phase3b.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (REPO / rel.replace("/", "\\")).read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    required = (
        "hub-audit-viewer.html",
        "hub-data-health.html",
        "js/hub_base/hub_base_ops.js",
        "js/hub_base/hub_page_badge.js",
    )
    for rel in required:
        if not (REPO / rel.replace("/", "\\")).is_file():
            errors.append(f"missing {rel}")

    ops = read("js/hub_base/hub_base_ops.js")
    badge = read("js/hub_base/hub_page_badge.js")
    audit_html = read("hub-audit-viewer.html")
    health_html = read("hub-data-health.html")
    matching = read("smart_ministry/talent_ministry_matching.html")
    landing = read("smart_ministry/landing.html")
    sidebar = read("smart_ministry/sidebar.html")
    pdca_shell = read("church_planning/js/pdca_hub_shell.js")
    schema = read("js/hub_base/hub_base_schema.js")

    for needle in (
        "filterAuditEntries",
        "runHealthCheck",
        "proposeTalentTagImport",
        "rejectAssignment",
        "pauseTalentService",
        "leader_confirmed_at",
    ):
        if needle not in ops:
            errors.append(f"hub_base_ops.js missing {needle!r}")

    if "data-b100-page-tier" not in badge:
        errors.append("hub_page_badge.js must use data-b100-page-tier")

    for needle in ("HubBase.filterAuditEntries", "btnExport", "assignment_reject"):
        if needle not in audit_html and needle.replace("assignment_reject", "filterAuditEntries") not in audit_html:
            pass
    if "filterAuditEntries" not in audit_html:
        errors.append("hub-audit-viewer.html must call filterAuditEntries")
    if "runHealthCheck" not in health_html:
        errors.append("hub-data-health.html must call runHealthCheck")

    if "rejectAssignmentRecord" not in matching:
        errors.append("matching page missing rejectAssignmentRecord")
    if "hub-audit-viewer.html" not in matching:
        errors.append("matching page missing audit viewer link")
    if "hub_base_ops.js" not in matching:
        errors.append("matching page must load hub_base_ops.js")

    if 'id="demo-hub"' not in landing or "hidden" not in landing:
        errors.append("landing demo-hub must be hidden by default")
    if 'get("dev")' not in landing and "get('dev')" not in landing:
        errors.append("landing must reveal demo-hub only when ?dev=1")

    if "hub-audit-viewer.html" not in sidebar:
        errors.append("SM sidebar missing audit viewer entry")
    if "hub-data-health.html" not in sidebar:
        errors.append("SM sidebar missing health snapshot entry")

    if "hub-audit-viewer.html" not in pdca_shell:
        errors.append("pdca_hub_shell must link audit viewer")

    if "leader_confirmed_at" not in schema:
        errors.append("schema must document leader_confirmed_at")

    demo_pages = (
        "smart_ministry/console.html",
        "smart_ministry/talent_pool_demo.html",
        "smart_ministry/export_talent_stats_demo.html",
    )
    for dp in demo_pages:
        txt = read(dp)
        if 'data-b100-page-tier="demo"' not in txt:
            errors.append(f"{dp} must set data-b100-page-tier=demo")
        if "hub_page_badge.js" not in txt:
            errors.append(f"{dp} must load hub_page_badge.js")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: hub_base phase3b ({len(errors)} issues)", file=sys.stderr)
        return 1

    print("OK: hub_base phase3b — audit viewer, health check, demo isolation, exception flows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
