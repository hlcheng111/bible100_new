#!/usr/bin/env python3
"""CM B 区 · Sidebar Kit SSOT 契约"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
SSOT = ROOT / "js" / "cm_b_menu_ssot.js"
RENDER = ROOT / "js" / "cm_sidebar_zone_render.js"
CM_BASE = ROOT / "church_ministry"


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []
    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""
    ssot = read_text(SSOT) if SSOT.is_file() else ""

    for needle in (
        "sb-zone-b",
        "b100_sidebar_kit.css",
        "b100_sidebar_render.js",
        "cm_b_menu_ssot.js",
        "cm_sidebar_zone_render.js",
    ):
        if needle not in sidebar:
            errors.append("sidebar_church_layout_v1 missing " + needle)

    if "data-sb-zone-host" not in sidebar:
        errors.append("missing sb-zone-b host")

    if 'href="#"' in ssot:
        errors.append("cm_b_menu_ssot still has href=#")

    items = re.findall(r'href:\s*href\("([^"]+)"', ssot)
    if len(items) < 8:
        errors.append("expected >=8 href paths in cm_b_menu_ssot")

    for rel in items:
        rel_clean = rel.split("#")[0]
        target = CM_BASE / rel_clean.replace("/", "\\")
        if not target.is_file():
            errors.append("missing file church_ministry/" + rel_clean)

    for field in ("label:", "en:", "i18nKey:"):
        if ssot.count(field) < 5:
            errors.append("cm_b_menu_ssot missing enough " + field)

    if "更多牧養" not in ssot:
        errors.append("missing 更多牧養 category")

    if errors:
        print("FAIL CM B sidebar contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM B sidebar contract (%d hrefs verified)" % len(items))
    return 0


if __name__ == "__main__":
    sys.exit(main())
