#!/usr/bin/env python3
"""CM 侧栏 focus 模式契约"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
RENDER = ROOT / "js" / "cm_sidebar_zone_render.js"
KIT = ROOT / "js" / "b100_sidebar_render.js"
DOC = ROOT / "docs" / "governance" / "CM_FOCUS_SIDEBAR_V1.md"


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []
    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""
    render = read_text(RENDER) if RENDER.is_file() else ""
    kit = read_text(KIT) if KIT.is_file() else ""

    if "sb-focus-footer" not in sidebar:
        errors.append("sidebar missing #sb-focus-footer")
    if "getFocusZone" not in render:
        errors.append("cm_sidebar_zone_render missing getFocusZone")
    if "renderZoneRail" not in kit:
        errors.append("b100_sidebar_render missing renderZoneRail")
    if "sb-kit-zone--rail" not in read_text(ROOT / "css" / "b100_sidebar_kit.css"):
        errors.append("kit css missing rail class")
    if not DOC.is_file():
        errors.append("missing CM_FOCUS_SIDEBAR_V1.md")

    if errors:
        print("FAIL CM focus sidebar contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM focus sidebar contract")
    return 0


if __name__ == "__main__":
    sys.exit(main())
