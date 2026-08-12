#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""教會事工 G 區側欄 · 導覽 UI 契約（L2 路牌 → sidebar_plan_v5_preview SSOT）"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LAYOUT = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
CM_SHELL = REPO / "church_ministry" / "js" / "cm_index_shell.js"


def extract_g_section(html: str) -> str:
    start = html.find('data-m2-zone="g"')
    if start < 0:
        return ""
    end = html.find('<div class="sidebar-section"', start + 20)
    if end < 0:
        end = html.find("</div>", start + 200)
    return html[start:end] if end > start else html[start:]


def main() -> int:
    errors: list[str] = []
    if not LAYOUT.is_file():
        print("FAIL: missing sidebar_church_layout_v1.html", file=sys.stderr)
        return 1

    html = LAYOUT.read_text(encoding="utf-8")
    g = extract_g_section(html)
    if not g:
        errors.append("G section not found in sidebar")

    forbidden = [
        "更多步驟",
        "步 1",
        "本步導覽",
        "Legacy",
        "finance-integrated",
        "member-integrated",
        "cm-g-planning-details",
        "assessment-os-hub.html",
        "cta-os-war-room.html",
    ]
    for bad in forbidden:
        if bad in g:
            errors.append(f"G section must not contain {bad!r} (tools live in sidebar_plan_v5_preview)")

    required_in_g = [
        "index_plan.html",
        "sidebar_plan_v5_preview.html",
    ]
    for link in required_in_g:
        if link not in g:
            errors.append(f"G section missing link {link!r}")

    if "openBZoneContentInShell" in html or "visitation_index.html?crm_from=b_pastoral" in html.split("focus=b")[0]:
        pass  # B hijack removed globally — checked in phase2 wave5

    if "openBZoneContentInShell" in html:
        errors.append("sidebar must not hijack B zone content (openBZoneContentInShell removed)")

    shell = CM_SHELL.read_text(encoding="utf-8") if CM_SHELL.is_file() else ""
    if "sidebar_pastoral_journey.html" in shell and "focus === \"b\"" in shell:
        errors.append("cm_index_shell focus=b must not use sidebar_pastoral_journey.html")
    if "worship-sunday-desk.html" not in shell:
        errors.append("cm_index_shell should route focus=a to worship-sunday-desk.html")

    if errors:
        print("FAIL: church nav UI contract (G zone + wave5)", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1
    print("OK: church nav UI contract (G zone + wave5)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
