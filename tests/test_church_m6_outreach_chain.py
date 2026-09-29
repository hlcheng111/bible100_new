#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
M6：D 外展真鏈 + W0 短規格；儀表板成熟度不得吃外展 store。

Run: python tests/test_church_m6_outreach_chain.py
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUTREACH = REPO / "church_ministry" / "modules" / "expansion" / "outreach-strategy.html"
STORE = REPO / "church_ministry" / "js" / "outreach_desk_store.js"
VISIT = REPO / "church_ministry" / "modules" / "support" / "visitation_index.html"
BRIDGE = REPO / "js" / "church_data_bridge.js"
LAYOUT = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
DOC_D = REPO / "church_ministry" / "docs" / "D_OUTREACH_W0_CONTENT_SPEC.md"
DOC_E = REPO / "church_ministry" / "docs" / "E_SOCIAL_W0_CONTENT_SPEC.md"
DOC_M6 = REPO / "church_ministry" / "docs" / "M6_W0_AND_D_CHAIN.md"


def main() -> int:
    errors: list[str] = []

    for path, label in (
        (OUTREACH, "outreach-strategy.html"),
        (STORE, "outreach_desk_store.js"),
        (DOC_D, "D_OUTREACH_W0"),
        (DOC_E, "E_SOCIAL_W0"),
        (DOC_M6, "M6_W0_AND_D_CHAIN"),
    ):
        if not path.is_file():
            errors.append(f"missing {label}")

    if OUTREACH.is_file():
        html = OUTREACH.read_text(encoding="utf-8")
        for needle in (
            'data-m6-d-chain="1"',
            "outreach_desk_store.js",
            "OutreachDeskStore",
            "轉探訪跟進",
            "visitation_index.html",
            "bible100_outreach_desk_v1",
        ):
            if needle not in html:
                errors.append(f"outreach page missing {needle!r}")
        if "loadDemo()" in html and "regionGrid" in html:
            errors.append("outreach-strategy must not remain pure DEMO map page")

    if STORE.is_file():
        js = STORE.read_text(encoding="utf-8")
        for needle in (
            "bible100_outreach_desk_v1",
            "bible100_outreach_handoff_v1",
            "setHandoff",
            "consumeHandoff",
            "addItem",
        ):
            if needle not in js:
                errors.append(f"store missing {needle!r}")

    if VISIT.is_file():
        vt = VISIT.read_text(encoding="utf-8")
        if "outreach-handoff-card" not in vt or "outreach_desk_store.js" not in vt:
            errors.append("visitation_index must show outreach handoff card")

    if LAYOUT.is_file():
        layout = LAYOUT.read_text(encoding="utf-8")
        if 'data-m6-d-chain="1"' not in layout:
            errors.append("layout D primary must mark data-m6-d-chain")
        # D primary should not still be DEMO badge only
        d_block = ""
        if "🌍 D." in layout:
            d_block = layout.split("🌍 D.", 1)[1].split("🤝 E.", 1)[0]
        if "outreach-strategy" in d_block and "sb-mat--demo" in d_block.split("outreach-strategy", 1)[0][-80:]:
            pass  # check primary line
        for line in d_block.splitlines():
            if "outreach-strategy" in line and "sidebar-item-primary" in line:
                if "sb-mat--demo" in line and "sb-mat--live" not in line:
                    errors.append("D primary outreach-strategy should be LIVE not DEMO")

    if BRIDGE.is_file():
        bridge = BRIDGE.read_text(encoding="utf-8")
        # maturity must not reference outreach desk key
        start = bridge.find("getCrmMaturitySummary")
        chunk = bridge[start : start + 2500] if start >= 0 else ""
        if "bible100_outreach_desk" in chunk or "outreach_desk" in chunk:
            errors.append("getCrmMaturitySummary must NOT include outreach desk store")

    if DOC_D.is_file() and "轉探訪" not in DOC_D.read_text(encoding="utf-8"):
        errors.append("D W0 spec must describe 轉探訪 chain")

    if errors:
        print("FAIL: M6 outreach chain", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: M6 W0 specs + D outreach real chain (dashboard contract untouched).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
