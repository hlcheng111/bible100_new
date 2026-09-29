#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
M3 入口 SSOT：會友／探訪／義工排班各一條主路徑，禁止第二品牌宣傳。

Run: python tests/test_church_m3_entry_paths.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CRM_SB = REPO / "church_ministry" / "sidebar_crm_journey.html"
LAYOUT_SB = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
HUB = REPO / "church_ministry" / "guide_crm_journey_hub.html"
DASH = REPO / "church_ministry" / "dashboard.html"
MODES = REPO / "config" / "modes.json"
DOC = REPO / "church_ministry" / "docs" / "ENTRY_PATH_SSOT_M3.md"

SSOT = {
    "members": "modules/members/member-integrated.html",
    "visitation": "modules/support/visitation_index.html",
    "volunteer": "tools/volunteer_shift/index.html",
}

FORBIDDEN_BRANDS = (
    "探訪工作跟進台",
    "A1 全自動義工排班",
    "義工智能排班",
    "志工事工（主入口）",
    "會友事工（主入口）",
    "探访事工（主入口）",
)


def main() -> int:
    errors: list[str] = []

    if not DOC.is_file():
        errors.append("missing ENTRY_PATH_SSOT_M3.md")
    else:
        doc = DOC.read_text(encoding="utf-8")
        for path in SSOT.values():
            if path not in doc:
                errors.append(f"SSOT doc missing {path}")

    if not CRM_SB.is_file():
        errors.append("missing CRM sidebar")
    else:
        crm = CRM_SB.read_text(encoding="utf-8")
        for key, path in SSOT.items():
            if f'data-m3-entry="{key}"' not in crm:
                errors.append(f"CRM sidebar missing data-m3-entry={key}")
            if path not in crm:
                errors.append(f"CRM sidebar missing path {path}")
        if "會友主檔" not in crm:
            errors.append("CRM sidebar must use label 會友主檔")
        if "唯一主路徑" not in crm and "M3" not in crm:
            errors.append("CRM sidebar should mention M3 / 唯一主路徑")
        # volunteer-integrated must not be primary (no data-m3-entry=volunteer on it)
        for m in re.finditer(
            r'href="([^"]*volunteer-integrated[^"]*)"[^>]*>', crm
        ):
            chunk = crm[m.start() : m.start() + 200]
            if 'data-m3-entry="volunteer"' in chunk:
                errors.append("volunteer-integrated must not be data-m3-entry=volunteer")

    if not LAYOUT_SB.is_file():
        errors.append("missing layout sidebar")
    else:
        layout = LAYOUT_SB.read_text(encoding="utf-8")
        if 'data-m3-entry="volunteer"' not in layout or "volunteer_shift" not in layout:
            errors.append("E zone must primary-link volunteer_shift with data-m3-entry=volunteer")
        # E primary should not be volunteer-integrated as sidebar-item-primary
        e_block = ""
        if "🤝 E. 社會服務" in layout:
            e_block = layout.split("🤝 E. 社會服務", 1)[1]
            if "行政核心" in e_block:
                e_block = e_block.split("行政核心", 1)[0]
            elif "⚙️ F. 行政支援" in e_block:
                e_block = e_block.split("⚙️ F. 行政支援", 1)[0]
        if "volunteer-integrated" in e_block and "sidebar-item-primary" in e_block:
            # primary class near integrated?
            for line in e_block.splitlines():
                if "volunteer-integrated" in line and "sidebar-item-primary" in line:
                    errors.append("E must not mark volunteer-integrated as sidebar-item-primary")
        if 'data-m3-shortcut="1"' not in layout:
            errors.append("B/F shortcuts should mark data-m3-shortcut=1 for members duplicate")
        for bad in FORBIDDEN_BRANDS:
            if bad in layout:
                errors.append(f"layout still uses forbidden brand {bad!r}")

    if HUB.is_file():
        hub = HUB.read_text(encoding="utf-8")
        for bad in ("探訪工作跟進台", "A1 全自動義工排班"):
            if bad in hub:
                errors.append(f"Hub still uses forbidden brand {bad!r}")
        if "crm-m3-entry-strip" not in hub:
            errors.append("Hub must include crm-m3-entry-strip for 今日三步")
        for key in SSOT:
            if hub.count(f'data-m3-entry="{key}"') < 1:
                errors.append(f"Hub missing data-m3-entry={key}")

    if DASH.is_file():
        dash = DASH.read_text(encoding="utf-8")
        for bad in ("義工智能排班",):
            if bad in dash:
                errors.append(f"dashboard forbidden brand {bad!r}")
        for key in SSOT:
            if f'data-m3-entry="{key}"' not in dash:
                errors.append(f"dashboard missing data-m3-entry={key}")

    if MODES.is_file():
        modes = MODES.read_text(encoding="utf-8")
        if "E. 社會服務" in modes and "volunteer_shift/index.html" not in modes:
            errors.append("modes.json E. 社會服務 path must be volunteer_shift/index.html")
        if re.search(
            r"E\. 社會服務[\s\S]{0,200}volunteer-integrated",
            modes,
        ):
            errors.append("modes.json E must not point at volunteer-integrated as primary path")

    if errors:
        print("FAIL: church M3 entry paths", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: M3 entry SSOT (members / visitation / volunteer_shift).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
