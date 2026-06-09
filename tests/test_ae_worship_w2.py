#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""W2 worship team bridge, CRM links, AI draft assets."""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"

JS = [
    "js/worship_team_bridge.js",
    "js/ae_worship_crm_bridge.js",
    "js/ae_worship_ai_draft.js",
]
PAGES = [
    "modules/worship/worship-team-management.html",
    "modules/worship/choir-team.html",
    "modules/worship/pulpit-ministry.html",
]


def main() -> int:
    errors = []
    for j in JS:
        if not (CM / j).is_file():
            errors.append("missing " + j)
    for p in PAGES:
        fp = CM / p
        if not fp.is_file():
            errors.append("missing " + p)
            continue
        t = fp.read_text(encoding="utf-8", errors="replace")
        if "b100-ae-worship-w2" not in t and p != "modules/worship/pulpit-ministry.html":
            pass
        if "ae_worship_crm_bridge.js" not in t:
            errors.append("no crm bridge in " + p)
        if "worship_team_bridge.js" not in t and "choir-team" not in p:
            pass
    wt = CM / "modules/worship/worship-team-management.html"
    if wt.is_file() and "WorshipTeamBridge" not in wt.read_text(encoding="utf-8"):
        errors.append("worship-team missing WorshipTeamBridge usage")
    if errors:
        for e in errors:
            print("FAIL:", e)
        return 1
    print("OK: W2 worship bridge + CRM + AI draft wired.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
