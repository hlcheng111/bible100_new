#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阶段 1B · CM 四页 + Bridge 契约静态检查（含波 3 member_id）

Run: python church_ministry/tests/test_cm_four_pages_bridge.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BRIDGE = REPO / "js" / "church_data_bridge.js"
CENTRAL = REPO / "js" / "central_member_db.js"
PICKER = REPO / "church_ministry" / "js" / "cm_member_picker.js"
DASHBOARD = REPO / "church_ministry" / "dashboard.html"
MEMBER = REPO / "church_ministry" / "modules" / "members" / "member-integrated.html"
VISIT = REPO / "church_ministry" / "modules" / "support" / "visitation_index.html"
FINANCE = REPO / "church_ministry" / "modules" / "finance" / "finance-integrated.html"
VOL_TOOL = REPO / "church_ministry" / "tools" / "volunteer_shift" / "tool.js"
SEED_PAGE = REPO / "church_ministry" / "load_central_member_seed.html"

FOUR_PAGES = [
    (MEMBER, "member-integrated"),
    (VISIT, "visitation_index"),
    (FINANCE, "finance-integrated"),
    (REPO / "church_ministry" / "tools" / "volunteer_shift" / "form.html", "volunteer_shift/form"),
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []
    bridge = read(BRIDGE)

    for needle in (
        "notifyCmDomainChanged",
        "notifyDomainChanged",
        "invalidateBridgeAsyncCaches",
        "tryMigrateFinanceFromLegacyLocalStorage",
        "tryMigrateMemberSystemFromChurchMaster",
    ):
        if needle not in bridge:
            errors.append(f"church_data_bridge.js missing: {needle}")

    for domain, fn in (
        ("members", "saveMemberSystemData"),
        ("visitation", "saveVisitationData"),
        ("volunteer", "saveVolunteerSystemData"),
        ("finance", "saveFinanceSystemData"),
    ):
        marker = f"notifyCmDomainChanged('{domain}')"
        if marker not in bridge:
            errors.append(f"{fn} must call {marker}")

    if "appendPastoralEvent" not in bridge:
        errors.append("church_data_bridge.js missing appendPastoralEvent")
    elif bridge.find("appendPastoralEvent") >= 0:
        pe_start = bridge.find("appendPastoralEvent: function")
        pe_end = bridge.find("listPastoralEvents: function", pe_start)
        pe_block = bridge[pe_start:pe_end] if pe_end > pe_start else bridge[pe_start:pe_start + 2500]
        if "notifyCmDomainChanged('visitation')" not in pe_block:
            errors.append("appendPastoralEvent must call notifyCmDomainChanged('visitation')")

    nft_start = bridge.find("function normalizeFinanceTransaction")
    nft_end = bridge.find("function toCanonicalMemberId", nft_start)
    nft_block = bridge[nft_start:nft_end] if nft_end > nft_start else ""
    if "out.memberId" not in nft_block or "out.member_id" not in nft_block:
        errors.append("normalizeFinanceTransaction must persist memberId/member_id")

    central = read(CENTRAL)
    if "ChurchDataBridge.saveMemberSystemData" not in central:
        errors.append("central_member_db.js set() must delegate to ChurchDataBridge.saveMemberSystemData")

    if not PICKER.is_file():
        errors.append(f"missing shared picker: {PICKER}")
    elif "fillMemberSelect" not in read(PICKER):
        errors.append("cm_member_picker.js must export fillMemberSelect")

    seed = read(SEED_PAGE)
    if "church_data_bridge.js" not in seed:
        errors.append("load_central_member_seed.html should load church_data_bridge.js")

    dash = read(DASHBOARD)
    if "refreshDashboardKpis" not in dash:
        errors.append("dashboard.html missing refreshDashboardKpis()")
    if "b100-cm-data-changed" not in dash:
        errors.append("dashboard.html must listen for b100-cm-data-changed")
    if "SYNC_OBSERVER_UPDATED" not in dash:
        errors.append("dashboard.html must listen for SYNC_OBSERVER_UPDATED postMessage")

    member = read(MEMBER)
    if "localStorage.setItem('memberSystemData'" in member:
        errors.append("member-integrated.html must not direct-write memberSystemData")

    vol = read(VOL_TOOL)
    if "notifyDomainChanged('volunteer')" not in vol:
        errors.append("volunteer_shift/tool.js must call notifyDomainChanged('volunteer')")
    if "fillMemberSelect" not in vol:
        errors.append("volunteer_shift/tool.js should expose fillMemberSelect for member_id")

    visit = read(VISIT)
    if "visitMemberId" not in visit:
        errors.append("visitation_index.html must use visitMemberId select (波3)")
    if "cm_member_picker.js" not in visit:
        errors.append("visitation_index.html should load cm_member_picker.js")

    finance = read(FINANCE)
    if "incomeMemberId" not in finance:
        errors.append("finance-integrated.html income modal must include incomeMemberId select")
    si_start = finance.find("function saveIncome()")
    si_block = finance[si_start:si_start + 1200] if si_start >= 0 else ""
    if "memberId" not in si_block or "incomeMemberId" not in finance:
        errors.append("saveIncome() must pass memberId into transaction")

    for path, label in FOUR_PAGES:
        if not path.is_file():
            errors.append(f"missing page: {label} ({path})")
            continue
        text = read(path)
        if "church_data_bridge.js" not in text and label != "volunteer_shift/form":
            errors.append(f"{label} should load church_data_bridge.js")

    if "getPastoralFollowupSummary" not in bridge or "overdue:" not in bridge:
        errors.append("getPastoralFollowupSummary must expose overdue count")
    if "leave_gaps" not in bridge:
        errors.append("getVolunteerShiftSummary must expose leave_gaps")
    sf_start = bridge.find("savePastoralFollowup: function")
    sf_end = bridge.find("buildPastoralFollowupSnippet: function", sf_start)
    sf_block = bridge[sf_start:sf_end] if sf_end > sf_start else ""
    if "notifyCmDomainChanged('visitation')" not in sf_block:
        errors.append("savePastoralFollowup must call notifyCmDomainChanged('visitation')")

    crm_dash = read(REPO / "church_ministry" / "js" / "crm_role_dashboard.js")
    if "leave_gaps" not in crm_dash or "overdue" not in crm_dash:
        errors.append("crm_role_dashboard.js must surface leave_gaps and overdue KPIs")

    if errors:
        print("FAIL — CM four-pages bridge contract:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — CM four-pages bridge contract (1B + wave3 member_id)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
