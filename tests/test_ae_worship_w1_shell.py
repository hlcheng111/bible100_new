#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""W1 A 敬拜六项 shell 与 memberId 桥接文件检查。"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"
MARKER = "b100-ae-worship-w1-shell"

PAGES = [
    CM / "modules/worship/pulpit-ministry.html",
    CM / "modules/worship/worship-integrated.html",
    CM / "modules/media/audio-team.html",
    CM / "modules/worship/choir-team.html",
]

REQUIRED_JS = [
    CM / "js/central_member_db.js",
    CM / "js/member_id_bridge.js",
    CM / "js/ae_worship_page_registry.js",
    CM / "js/ae_worship_six_section_shell.js",
]


def main() -> int:
    errors: list[str] = []
    for p in REQUIRED_JS:
        if not p.is_file():
            errors.append(f"missing {p.relative_to(REPO)}")
    for p in PAGES:
        if not p.is_file():
            errors.append(f"missing page {p.relative_to(REPO)}")
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        if MARKER not in text:
            errors.append(f"no W1 marker in {p.name}")
        if "member_id_bridge.js" not in text:
            errors.append(f"no member_id_bridge in {p.name}")
    reg = CM / "js/ae_worship_page_registry.js"
    if reg.is_file():
        t = reg.read_text(encoding="utf-8")
        if "pulpit-ministry" not in t or "live-streaming" not in t:
            errors.append("registry missing page entries")
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        return 1
    print("OK: W1 worship shell + memberId bridge files present on sample pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
