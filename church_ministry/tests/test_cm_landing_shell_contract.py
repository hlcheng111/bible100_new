#!/usr/bin/env python3
"""CM · 统一 Landing 壳契约（Step 5）"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LANDING_DIR = ROOT / "church_ministry" / "_landing"
REGISTRY = ROOT / "church_ministry" / "js" / "cm_zone_landing_registry.js"
SHELL_JS = ROOT / "church_ministry" / "js" / "cm_landing_shell.js"
SHELL_CSS = ROOT / "church_ministry" / "css" / "cm_landing_shell.css"

REQUIRED_LANDINGS = [
    "worship.html",
    "fellowship.html",
    "education.html",
    "outreach.html",
    "social.html",
    "hymns.html",
]

ZONE_LETTERS = ("a", "b", "c", "d", "e", "f", "g")


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    for name in REQUIRED_LANDINGS:
        path = LANDING_DIR / name
        if not path.is_file():
            errors.append("missing landing %s" % name)
            continue
        html = read_text(path)
        if "cm-landing-shell-top" not in html:
            errors.append("%s: missing #cm-landing-shell-top" % name)
        if "cm_landing_shell.js" not in html:
            errors.append("%s: missing cm_landing_shell.js" % name)
        if "cm_landing_shell.css" not in html:
            errors.append("%s: missing cm_landing_shell.css" % name)
        if "cm_zone_landing_registry.js" not in html:
            errors.append("%s: missing registry script" % name)

    if not REGISTRY.is_file():
        errors.append("missing cm_zone_landing_registry.js")
    else:
        reg = read_text(REGISTRY)
        nav_ssot = read_text(ROOT / "js" / "cm_zone_nav_ssot.js")
        for zid in ZONE_LETTERS:
            if (
                'id: "' + zid + '"' not in reg
                and 'id: "' + zid + '"' not in nav_ssot
            ):
                errors.append("registry missing zone " + zid)
        if "siteUrls" not in reg:
            errors.append("registry missing siteUrls")
        if "CmZoneNavSsot" not in reg:
            errors.append("registry should read CmZoneNavSsot")

    if not SHELL_JS.is_file():
        errors.append("missing cm_landing_shell.js")
    else:
        shell = read_text(SHELL_JS)
        if "cm-land-addr" not in shell:
            errors.append("shell missing A-G address strip class")
        if "bible100ShellNav" not in shell:
            errors.append("shell missing bible100ShellNav integration")

    if not SHELL_CSS.is_file():
        errors.append("missing cm_landing_shell.css")

    if errors:
        print("FAIL CM landing shell contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM landing shell contract (%d landings)" % len(REQUIRED_LANDINGS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
