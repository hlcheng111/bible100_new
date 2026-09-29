#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教會規劃行政兩分支：規劃 ↔ 行政 雙欄互切；廢 CRM 主入口。

Run: python tests/test_church_triangle_nav.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MODES = REPO / "config" / "modes.json"

TRIANGLE_FILES = {
    "plan_sidebar": "church_planning/sidebar_plan.html",
    "plan_landing": "church_planning/index_plan.html",
    "admin_sidebar": "church_ministry/sidebar_church_layout_v1.html",
}


def shell_nav_targets(text: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for m in re.finditer(
        r"bible100ShellNav\s*\(\s*[^,]+,\s*\{([^}]+)\}",
        text,
        flags=re.S,
    ):
        body = m.group(1)
        sb = re.search(r"sidebarUrl\s*:\s*['\"]([^'\"]+)['\"]", body)
        cf = re.search(r"contentUrl\s*:\s*['\"]([^'\"]+)['\"]", body)
        if sb and cf:
            out.append((sb.group(1), cf.group(1)))
    for m in re.finditer(
        r"planningOpenAdmin\s*\(\s*[^,]+,\s*['\"]([^'\"]+)['\"]",
        text,
    ):
        out.append(("church_ministry/sidebar_church_layout_v1.html?focus=f", m.group(1)))
    return out


def church_secondary_nav() -> list[dict]:
    data = json.loads(MODES.read_text(encoding="utf-8"))
    for mode in data.get("modes", []):
        if mode.get("id") == "church":
            return list(mode.get("secondaryNav") or [])
    return []


def main() -> int:
    errors: list[str] = []

    data = json.loads(MODES.read_text(encoding="utf-8"))
    church = next((m for m in data.get("modes", []) if m.get("id") == "church"), None)
    if not church:
        errors.append("missing church mode")
        print("FAIL", file=sys.stderr)
        return 1

    de = church.get("defaultEntry") or {}
    if "sidebar_plan.html" not in str(de.get("sidebar", "")):
        errors.append("defaultEntry must be planning sidebar_plan")
    if "index_plan.html" not in str(de.get("path", "")):
        errors.append("defaultEntry must be index_plan")

    nav = church_secondary_nav()
    if any("guide_crm_journey_hub" in str(i.get("path", "")) for i in nav):
        errors.append("secondaryNav must not include CRM hub")
    if not any("index_plan" in str(i.get("path", "")) for i in nav):
        errors.append("missing 規劃 nav")
    if not any(
        "dashboard.html" in str(i.get("path", "")) and "focus=f" in str(i.get("sidebar", ""))
        for i in nav
    ):
        errors.append("missing 行政 nav")

    plan_sb = (REPO / TRIANGLE_FILES["plan_sidebar"]).read_text(encoding="utf-8", errors="replace")
    if "planningOpenAdmin" not in plan_sb:
        errors.append("plan sidebar must call planningOpenAdmin for step 6")
    if "guide_crm_journey_hub" in plan_sb:
        errors.append("plan sidebar must not link CRM hub as primary")

    admin_sb = (REPO / TRIANGLE_FILES["admin_sidebar"]).read_text(encoding="utf-8", errors="replace")
    admin_nav = shell_nav_targets(admin_sb)
    if not any("sidebar_plan.html" in sb for sb, _ in admin_nav):
        errors.append("admin sidebar must shell-nav back to sidebar_plan")

    plan_text = (REPO / TRIANGLE_FILES["plan_landing"]).read_text(encoding="utf-8", errors="replace")
    if "sidebar_crm_journey" in plan_text:
        errors.append("index_plan must not use CRM sidebar")
    if "sidebar_church_layout_v1" not in plan_text:
        errors.append("index_plan must dual-pane to admin layout")

    ph = REPO / "church_planning" / "pages" / "capability-placeholder.html"
    if not ph.is_file():
        errors.append("missing capability-placeholder.html")

    if errors:
        print("FAIL: church plan/admin two-branch nav", file=sys.stderr)
        for e in errors:
            print(f"  · {e}", file=sys.stderr)
        return 1

    print("OK: 教會規劃行政 — 規劃↔行政雙欄；廢 CRM 主入口；未有功能占位存在。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
