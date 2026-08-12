#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""G 區 → 教會行政儀表：禁 _landing/church_ministry/ 幽靈路徑"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SIDEBAR = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
GATEWAY = REPO / "church_ministry" / "_landing" / "gateway.html"
LANDING = REPO / "church_planning" / "index_plan.html"
INDEX = REPO / "index_v5.html"
BEHAVIOR = REPO / "js" / "sidebar_behavior.js"

FORBIDDEN = [
    'href="dashboard.html',
    'href="../dashboard.html"',
    "_landing/church_ministry/dashboard",
]

REQUIRED = [
    "church_ministry/dashboard.html",
    "bible100ShellNav",
]


def extract_g_dashboard(html: str) -> str:
    i = html.find("日常行政儀表")
    if i < 0:
        return ""
    return html[max(0, i - 200) : i + 200]


def main() -> int:
    errors: list[str] = []

    for path in (SIDEBAR, GATEWAY, LANDING, INDEX, BEHAVIOR):
        if not path.is_file():
            errors.append(f"missing {path.relative_to(REPO)}")

    if SIDEBAR.is_file():
        st = SIDEBAR.read_text(encoding="utf-8")
        g_start = st.find('data-m2-zone="g"')
        g_block = st[g_start : g_start + 2500] if g_start >= 0 else st
        for bad in FORBIDDEN:
            if bad in g_block:
                errors.append(f"G sidebar dashboard link must not use {bad!r}")
        if "data-b100-path=\"church_ministry/dashboard.html" not in g_block:
            errors.append("G sidebar dashboard missing data-b100-path site-root href")

    if GATEWAY.is_file():
        gt = GATEWAY.read_text(encoding="utf-8")
        if "../dashboard.html" in gt:
            errors.append("gateway must not use ../dashboard.html (use site-root + shellNav)")
        if "church_ministry/dashboard.html" not in gt:
            errors.append("gateway missing church_ministry/dashboard.html link")

    if INDEX.is_file():
        it = INDEX.read_text(encoding="utf-8")
        if "_landing/church_ministry" not in it:
            errors.append("index_v5 navigateContentFrame missing ghost-path repair")

    if BEHAVIOR.is_file():
        bt = BEHAVIOR.read_text(encoding="utf-8")
        if "type: \"navigate\", url: new URL(href" in bt.replace(" ", ""):
            errors.append("sidebar_behavior navigate postMessage must not use absolute URL from wrong base")

    for req in REQUIRED:
        found = False
        for path in (SIDEBAR, GATEWAY, LANDING):
            if path.is_file() and req in path.read_text(encoding="utf-8"):
                found = True
                break
        if not found:
            errors.append(f"missing required dashboard nav artifact: {req!r}")

    if errors:
        print("FAIL: G dashboard path contract", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1
    print("OK: G dashboard path contract")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
