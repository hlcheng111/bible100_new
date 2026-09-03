#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阶段 3 · SMART/SCH/DD 边界 + Hub 壳中壳 C-03 静态检查

Run: python church_ministry/tests/test_cm_phase3_wave.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
INDEX_V5 = REPO / "index_v5.html"
CM_SIDEBAR = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
SHELL_NAV = REPO / "js" / "shell_nav.js"
MANIFEST = REPO / "config" / "module_manifest.json"
EDU = REPO / "church_ministry" / "modules" / "education" / "education-integrated.html"
EDU_SHELL = REPO / "church_ministry" / "js" / "education_integrated_shell.js"
SMART_LINK = REPO / "smart_ministry" / "js" / "smart_ministry_linking.js"

MODULE_SHELLS = (
    "smart_ministry/index.html",
    "school_management/index.html",
    "disciple_dynamics/index.html",
    "church_ministry/index.html",
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    v5 = read(INDEX_V5)
    if "enableModuleShellEmbedLayout()" in v5 and re.search(
        r"function openSchoolManagement[\s\S]{0,400}enableModuleShellEmbedLayout\(\)", v5
    ):
        errors.append("index_v5 openSchoolManagement still uses enableModuleShellEmbedLayout")
    if re.search(
        r"function openSchoolManagement[\s\S]{0,500}school_management/index\.html", v5
    ):
        errors.append("index_v5 openSchoolManagement must not load school_management/index.html")
    if "school_management/_landing/home.html" not in v5:
        errors.append("index_v5 openSchoolManagement should load school_management/_landing/home.html")
    if "bible100ResolveHubContentUrl" not in v5:
        errors.append("index_v5 postMessage should call bible100ResolveHubContentUrl for C-03 guard")

    sb = read(CM_SIDEBAR)
    for shell in ("smart_ministry/index.html", "school_management/index.html"):
        if f'data-b100-content="{shell}"' in sb:
            errors.append(f"sidebar_church_layout_v1 data-b100-content still points to {shell}")

    nav = read(SHELL_NAV)
    for shell in MODULE_SHELLS:
        if shell not in nav:
            errors.append(f"shell_nav.js HUB_MODULE_SHELL_MAP missing {shell}")
    if "resolveHubContentAvoidModuleShell" not in nav:
        errors.append("shell_nav.js missing resolveHubContentAvoidModuleShell")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sch = next(m for m in manifest["modules"] if m["id"] == "school_management")
    if sch.get("landing") == "school_management/index.html":
        errors.append("module_manifest school landing must not be index.html")
    if sch.get("layout") == "module-shell-embed":
        errors.append("module_manifest school must not use module-shell-embed layout")

    edu = read(EDU)
    for needle in ("edu-dd-bridge", "edu-btn-dd-library", "externalId", "cm_school_bridge.js"):
        if needle not in edu:
            errors.append(f"education-integrated.html missing {needle}")

    edu_js = read(EDU_SHELL)
    if "disciple_dynamics/dashboard.html" not in edu_js:
        errors.append("education_integrated_shell.js missing DD read-only shell nav")

    link_js = read(SMART_LINK)
    if "SmartMinistryCanonical" not in link_js:
        errors.append("smart_ministry_linking.js must route via SmartMinistryCanonical (C-06)")
    if "addMinistryAssignment" not in link_js:
        errors.append("smart_ministry_linking.js must call addMinistryAssignment for canonical writes")

    if errors:
        print("FAIL — CM phase 3 wave:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — CM phase 3 wave (C-03 / SMART / SCH / DD boundaries)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
