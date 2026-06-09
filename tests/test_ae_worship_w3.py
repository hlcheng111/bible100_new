#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""W3 worship data hub, hub panel, attendance visitation, finance prefill."""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"

JS = [
    "js/ae_worship_data_hub.js",
    "js/ae_worship_hub_panel.js",
]
PAGES = [
    "modules/worship/worship-integrated.html",
    "modules/worship/attendance-management.html",
    "modules/worship/pulpit-ministry.html",
]
FINANCE = CM / "modules/finance/finance-integrated.html"


def main() -> int:
    errors = []
    for j in JS:
        if not (CM / j).is_file():
            errors.append("missing " + j)
        else:
            t = (CM / j).read_text(encoding="utf-8", errors="replace")
            if j.endswith("data_hub.js") and "worship_visitation_drafts_v1" not in t:
                errors.append("data hub missing visitation key")
            if j.endswith("hub_panel.js") and "w3-hub-panel" not in t:
                errors.append("hub panel missing w3-hub-panel")

    for p in PAGES:
        fp = CM / p
        if not fp.is_file():
            errors.append("missing " + p)
            continue
        t = fp.read_text(encoding="utf-8", errors="replace")
        if "ae_worship_data_hub.js" not in t:
            errors.append("no data hub in " + p)
        if "ae_worship_hub_panel.js" not in t:
            errors.append("no hub panel in " + p)

    integrated = CM / "modules/worship/worship-integrated.html"
    if integrated.is_file():
        ti = integrated.read_text(encoding="utf-8", errors="replace")
        if 'id="w3-hub-panel"' not in ti:
            errors.append("worship-integrated missing w3-hub-panel host")
        if "AeWorshipHubPanel" not in ti:
            errors.append("worship-integrated missing AeWorshipHubPanel call")

    att = CM / "modules/worship/attendance-management.html"
    if att.is_file():
        ta = att.read_text(encoding="utf-8", errors="replace")
        if "CentralMemberDB" not in ta:
            errors.append("attendance missing CentralMemberDB")
        if "scanAbsentToVisitation" not in ta:
            errors.append("attendance missing visitation scan")

    if FINANCE.is_file():
        tf = FINANCE.read_text(encoding="utf-8", errors="replace")
        if "worship_finance_prefill_v1" not in tf:
            errors.append("finance missing prefill key")
        if "worship-finance-prefill-banner" not in tf:
            errors.append("finance missing prefill banner")
    else:
        errors.append("missing finance-integrated.html")

    shell = CM / "js/ae_worship_six_section_shell.js"
    if shell.is_file() and "ae-worship-hub-strip" not in shell.read_text(encoding="utf-8"):
        errors.append("six_section_shell missing hub strip")

    if errors:
        for e in errors:
            print("FAIL:", e)
        return 1
    print("OK: W3 data hub + visitation + finance prefill wired.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
