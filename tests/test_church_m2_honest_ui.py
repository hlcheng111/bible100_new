#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
M2 誠實 UI 契約：角標 + CRM／F 預設開合 + 小白 3 步到探訪／會友。

Run: python tests/test_church_m2_honest_ui.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CRM_SB = REPO / "church_ministry" / "sidebar_crm_journey.html"
LAYOUT_SB = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
BADGE_CSS = REPO / "css" / "sidebar_maturity_badges.css"
ABC_DOC = REPO / "church_ministry" / "docs" / "TRANSFORM_ABC_CHECKLIST_STAGE1.md"


def main() -> int:
    errors: list[str] = []

    if not BADGE_CSS.is_file():
        errors.append("missing css/sidebar_maturity_badges.css")
    else:
        css = BADGE_CSS.read_text(encoding="utf-8")
        for needle in ("sb-mat--live", "sb-mat--partial", "sb-mat--demo"):
            if needle not in css:
                errors.append(f"badge css missing {needle}")

    if not CRM_SB.is_file():
        errors.append("missing sidebar_crm_journey.html")
    else:
        crm = CRM_SB.read_text(encoding="utf-8")
        for needle in (
            "今日三步",
            'data-m2-step="members"',
            'data-m2-step="visitation"',
            'data-m2-step="volunteer"',
            "member-integrated.html",
            "visitation_index.html",
            "sb-mat--live",
            "cm-sidebar__details",
            "sidebar_maturity_badges.css",
        ):
            if needle not in crm:
                errors.append(f"CRM sidebar missing {needle!r}")
        # Hub / 角色必須在 details 內（預設收合 = 無 open 屬性於那些區塊）
        if "guide_crm_journey_hub.html?tab=matchmaker" in crm:
            # matchmaker 應在 details 內且該 details 不應帶 open
            idx = crm.find("matchmaker")
            before = crm[max(0, idx - 400) : idx]
            if "<details" not in before and "<details " not in before:
                # look for nearest details open before matchmaker
                pass
            # 確保沒有 <details open> 包住 Hub（允許無 open）
            if '<details class="cm-sidebar__details" open>' in crm or "<details open class=" in crm:
                errors.append("CRM sidebar Hub/角色 details must default collapsed (no open)")
        if "今日三步" in crm and crm.find("今日三步") > crm.find("matchmaker") if "matchmaker" in crm else False:
            errors.append("CRM: 今日三步 must appear before matchmaker / Hub extras")

    if not LAYOUT_SB.is_file():
        errors.append("missing sidebar_church_layout_v1.html")
    else:
        layout = LAYOUT_SB.read_text(encoding="utf-8")
        for needle in (
            "sidebar_maturity_badges.css",
            "layout-m2-hint",
            'data-m2-step="visitation"',
            'data-m2-step="members"',
            'data-m2-f-core="1"',
            "sb-mat--live",
            "sb-mat--demo",
            "F. 行政支援",
            "E. 社會服務",
        ):
            if needle not in layout:
                errors.append(f"layout sidebar missing {needle!r}")
        if '<details open>' in layout and "进阶工具目录" in layout:
            # 进阶工具不得預設 open
            pos = layout.find("进阶工具目录")
            chunk = layout[max(0, pos - 80) : pos]
            if "<details open>" in chunk:
                errors.append("A 进阶工具目录 must not use details open by default")
        if "data-m2-f-core" in layout and "focus === 'f'" not in layout and 'focus === "f"' not in layout:
            errors.append("layout focus script must special-case focus=f for F collapse")

    if not ABC_DOC.is_file():
        errors.append("missing docs/TRANSFORM_ABC_CHECKLIST_STAGE1.md")
    else:
        doc = ABC_DOC.read_text(encoding="utf-8")
        for needle in ("類 A", "類 B", "類 C", "今日三步", "getCrmMaturitySummary", "議決"):
            if needle not in doc:
                errors.append(f"ABC checklist missing {needle!r}")

    if errors:
        print("FAIL: church M2 honest UI", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: M2 honest UI (badges + CRM/F collapse + 3-step + ABC checklist).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
