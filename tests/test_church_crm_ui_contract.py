#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P3 / Tier 5 · CRM UI 行为锁（C 的 UI 层）

锁定牧者／同工可见文案、页籤、信任承诺、工作桌与媒合 UI 接线。
与 test_church_crm_bridge.py（API/档案）互补，专注使用者界面契约。

Run: python tests/test_church_crm_ui_contract.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"

FORBIDDEN_USER_COPY = (
    "Phase 3",
    "CTA-OS 戰情室（Phase",
    "日常手腳",
    "5F 規劃",
    "notePreview",
)

UI_PAGES: dict[str, tuple[str, ...]] = {
    "guide_crm_journey_hub.html": (
        "crm-hub-v4",
        "crm-master-tabs",
        'data-tab="journey"',
        'data-tab="matchmaker"',
        "只預填",
        "不自動儲存",
        "ministry_path_bridge.js",
        "path_cards_hitl_panel",
        "governance_crm_bridge.js",
        "crm-journey-link",
    ),
    "dashboard.html": (
        "小白今日工作桌",
        "getCrmWorkbenchTodos",
        "crm-kpi-v1-root",
        "demo_data_governance.html",
        "data_trust_badge.js",
        "crm_context_bar.js",
        "demo KPI 不可當正式決策",
        "不會自動通知",
        "牧養敏感資料不顯示全文",
    ),
    "modules/members/member-integrated.html": (
        "spiritual_journey_stage",
        "church_crm_constants.js",
        "exportMemberSystemBundle",
        "visitation_index.html",
    ),
    "modules/support/visitation_index.html": (
        "recordPastoralEvent",
        "appendPastoralEvent",
        "resolveMemberIdFromBridge",
    ),
    "modules/volunteer/volunteer-integrated.html": (
        "renderCrmMinistrySuggestions",
        "confirmCrmSuggestion",
    ),
    "sidebar_crm_journey.html": (
        "bible100ShellNav",
        "sidebar_plan.html",
        "guide_crm_journey_hub.html",
        "visitation_index.html",
    ),
    "tools/volunteer_shift/index.html": (
        "data_trust_badge.js",
        "小白驗收檢查",
        "uat.html",
    ),
    "tools/visitation_followup/index.html": (
        "data_trust_badge.js",
        "pastoral_sensitive",
    ),
}

TRUST_COPY_ANY = ("只預填", "不自動儲存", "不會自動通知", "prefill_only")


def main() -> int:
    errors: list[str] = []
    checked = 0

    for rel, needles in UI_PAGES.items():
        path = CM / rel
        if not path.is_file():
            errors.append(f"missing CRM UI page: {rel}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        checked += 1
        for needle in needles:
            if needle not in text:
                errors.append(f"{rel} missing UI lock: {needle!r}")
        for bad in FORBIDDEN_USER_COPY:
            if bad in text:
                errors.append(f"{rel} must not expose {bad!r} to users")

    hub = (CM / "guide_crm_journey_hub.html").read_text(encoding="utf-8", errors="replace")
    if not any(t in hub for t in TRUST_COPY_ANY):
        errors.append("guide_crm_journey_hub must state data-trust copy (prefill / no auto-save)")

    role_js = CM / "js" / "crm_role_dashboard.js"
    if role_js.is_file():
        rj = role_js.read_text(encoding="utf-8", errors="replace")
        for bad in ("t.note", "notePreview"):
            if bad in rj:
                errors.append(f"crm_role_dashboard.js must not expose {bad!r}")

    if errors:
        print("FAIL: church CRM UI contract (P3)", file=sys.stderr)
        for e in errors:
            print(f"  · {e}", file=sys.stderr)
        return 1

    print(
        f"OK: church CRM UI contract — {checked} pages locked "
        f"(tabs, trust copy, workbench, matchmaker UI, no engineer leak)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
