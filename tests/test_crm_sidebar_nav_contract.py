#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
M5 · CRM 側欄 SSOT 契約：上線側欄＝靜態 HTML；render.js 不得被載入。

Run: python tests/test_crm_sidebar_nav_contract.py
"""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SIDEBAR = REPO / "church_ministry" / "sidebar_crm_journey.html"
RENDER = REPO / "church_ministry" / "js" / "crm_sidebar_render.js"
NAV = REPO / "church_ministry" / "js" / "crm_nav.js"
REGISTRY = REPO / "church_ministry" / "js" / "crm_journey_registry.js"
DOC = REPO / "church_ministry" / "docs" / "CRM_SIDEBAR_SSOT_M5.md"
PLAN_SIDEBAR = REPO / "church_planning" / "sidebar_plan.html"
SPEC = REPO / "church_ministry" / "docs" / "CRM_AE_INTERCONNECT_SPEC.md"


def main() -> int:
    errors: list[str] = []

    if not SIDEBAR.is_file():
        errors.append("missing sidebar_crm_journey.html")
        print("FAIL:", *errors, sep="\n  ")
        return 1

    sb = SIDEBAR.read_text(encoding="utf-8", errors="replace")

    if 'data-crm-sidebar-ssot="static-html"' not in sb:
        errors.append("sidebar must declare data-crm-sidebar-ssot=static-html")

    if 'src="js/crm_sidebar_render.js"' in sb or "src='js/crm_sidebar_render.js'" in sb:
        errors.append("sidebar_crm_journey.html must NOT load crm_sidebar_render.js")
    if re.search(r"<script[^>]+crm_sidebar_render\.js", sb):
        errors.append("sidebar_crm_journey.html must NOT script-src crm_sidebar_render.js")

    if "crm-sidebar-host" in sb:
        errors.append("SSOT sidebar must not use registry render host crm-sidebar-host")

    for needle in (
        "今日三步",
        'data-m3-entry="members"',
        'data-m3-entry="visitation"',
        'data-m3-entry="volunteer"',
        "回教會規劃",
        "sidebar_plan.html",
        "index_plan.html",
        "assessment-os-hub.html",
        "cta-os-war-room.html",
        "crm-af-zone-entries",
        "sidebar_church_layout_v1.html",
        "focus=f",
        "bible100ShellNav",
        "CRM_SIDEBAR_SSOT_M5.md",
    ):
        if needle not in sb:
            errors.append(f"SSOT sidebar missing {needle!r}")

    if "左欄→" in sb or "右欄：" in sb or '<small>→ ' in sb:
        errors.append("sidebar must not show engineering dest hints")

    # Hub / 角色 / A–F 應在預設收合的 details 內（無 open）
    if '<details class="cm-sidebar__details" open>' in sb or "<details open" in sb:
        errors.append("CRM secondary sections must default collapsed (no details open)")

    if not NAV.is_file():
        errors.append("missing crm_nav.js")
    else:
        nav_text = NAV.read_text(encoding="utf-8", errors="replace")
        for fn in ("crmOpenContent", "crmOpenPlanning", "crmOpenAeLayout", "crmShellGo"):
            if fn not in nav_text:
                errors.append(f"crm_nav.js missing {fn}")

    if not REGISTRY.is_file():
        errors.append("missing crm_journey_registry.js")
    else:
        reg_text = REGISTRY.read_text(encoding="utf-8", errors="replace")
        for path in ("assessment-os-hub.html", "cta-os-war-room.html", "index_plan.html"):
            if path not in reg_text and path not in sb:
                errors.append(f"registry/sidebar missing planning path {path}")

    if RENDER.is_file():
        render_text = RENDER.read_text(encoding="utf-8", errors="replace")
        if "@deprecated" not in render_text and "已棄用" not in render_text and "不上線" not in render_text:
            errors.append("crm_sidebar_render.js must be marked deprecated / 不上線")
        # 歷史檔仍勿含工程 dest 字樣（若日後誤掛載）
        if "左欄→" in render_text or "右欄：" in render_text:
            errors.append("deprecated render must not show engineering dest hints")
    else:
        errors.append("keep crm_sidebar_render.js as deprecated stub for history/tests")

    if not DOC.is_file():
        errors.append("missing docs/CRM_SIDEBAR_SSOT_M5.md")
    else:
        doc = DOC.read_text(encoding="utf-8")
        if "sidebar_crm_journey.html" not in doc or "static-html" not in doc:
            errors.append("M5 doc must name static HTML as SSOT")

    if SPEC.is_file():
        spec = SPEC.read_text(encoding="utf-8")
        if "唯一上線" not in spec and "sidebar_crm_journey.html" not in spec:
            errors.append("CRM_AE_INTERCONNECT_SPEC must point sidebar HTML as SSOT")
        if "crm_sidebar_render.js` | CRM 側欄渲染" in spec:
            errors.append("SPEC must not claim render.js is live CRM sidebar")

    if PLAN_SIDEBAR.is_file():
        plan_text = PLAN_SIDEBAR.read_text(encoding="utf-8", errors="replace")
        if "左欄" in plan_text or "右欄：" in plan_text:
            errors.append("planning sidebar must not show engineering dest hints (左欄/右欄)")
    else:
        errors.append("missing sidebar_plan.html")

    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        return 1
    print("OK: CRM sidebar SSOT = static-html (M5); render.js deprecated unused.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
