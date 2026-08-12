#!/usr/bin/env python3
"""B100 Sidebar Kit · 静态契约"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT_CSS = ROOT / "css" / "b100_sidebar_kit.css"
KIT_JS = ROOT / "js" / "b100_sidebar_render.js"
CONTRACT = ROOT / "docs" / "governance" / "SIDEBAR_IA_CONTRACT_V1.md"


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []
    for p in (KIT_CSS, KIT_JS, CONTRACT):
        if not p.is_file():
            errors.append("missing " + str(p.relative_to(ROOT)))

    js = read_text(KIT_JS) if KIT_JS.is_file() else ""
    css = read_text(KIT_CSS) if KIT_CSS.is_file() else ""

    for needle in ("renderZone", "renderCategory", "renderItem", "renderZoneRail", "sb-kit-en", "KIT_BUILD"):
        if needle not in js:
            errors.append("b100_sidebar_render.js missing " + needle)

    for cls in ("sb-kit-zone", "sb-kit-cat", "sb-kit-item", "sb-kit-cat__arrow"):
        if cls not in css:
            errors.append("b100_sidebar_kit.css missing " + cls)

    if "i18nKey" not in read_text(CONTRACT):
        errors.append("SIDEBAR_IA_CONTRACT missing i18nKey")

    if errors:
        print("FAIL B100 Sidebar Kit contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK B100 Sidebar Kit contract")
    return 0


if __name__ == "__main__":
    sys.exit(main())
