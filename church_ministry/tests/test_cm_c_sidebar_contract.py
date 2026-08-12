#!/usr/bin/env python3
"""CM C 区 · Sidebar Kit SSOT 契约"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
SSOT = ROOT / "js" / "cm_c_menu_ssot.js"
CM_BASE = ROOT / "church_ministry"


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []
    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""
    ssot = read_text(SSOT) if SSOT.is_file() else ""

    for needle in ("sb-zone-c", "cm_c_menu_ssot.js"):
        if needle not in sidebar:
            errors.append("sidebar missing " + needle)

    if "更多門訓" not in ssot:
        errors.append("missing 更多門訓 category")

    if "主日學工作桌" not in ssot:
        errors.append("missing primary SS desk item")

    if "#tab-roster" not in ssot:
        errors.append("missing #tab-roster hash on education-integrated")

    paths = re.findall(r'href:\s*href\("([^"]+)"', ssot)
    if len(paths) < 3:
        errors.append("expected 3 href paths in cm_c_menu_ssot")

    for rel in paths:
        rel_clean = rel.split("#")[0]
        target = CM_BASE / rel_clean.replace("/", "\\")
        if not target.is_file():
            errors.append("missing file church_ministry/" + rel_clean)

    if errors:
        print("FAIL CM C sidebar contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM C sidebar contract (%d hrefs, 2-item category)" % len(paths))
    return 0


if __name__ == "__main__":
    sys.exit(main())
