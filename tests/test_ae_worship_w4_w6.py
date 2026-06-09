#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""W4 dual view + W6 visitation closure + A strategy bridge."""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"


def main() -> int:
    errors: list[str] = []
    js_files = [
        "js/ae_worship_role_views.js",
        "js/ae_worship_volunteer_card.js",
        "js/ae_worship_strategy_bridge.js",
        "js/ae_worship_visitation_bridge.js",
    ]
    for j in js_files:
        if not (CM / j).is_file():
            errors.append("missing " + j)

    integrated = CM / "modules/worship/worship-integrated.html"
    if integrated.is_file():
        t = integrated.read_text(encoding="utf-8", errors="replace")
        for needle in [
            "worship-volunteer-root",
            "worship-leader-root",
            "ae_worship_role_views.js",
            "ae_worship_volunteer_card.js",
            "ae_worship_strategy_bridge.js",
        ]:
            if needle not in t:
                errors.append("integrated missing " + needle)
    else:
        errors.append("missing worship-integrated.html")

    visitation = CM / "modules/support/visitation_index.html"
    if visitation.is_file():
        tv = visitation.read_text(encoding="utf-8", errors="replace")
        if "worship-visitation-drafts" not in tv:
            errors.append("visitation missing worship drafts panel")
        if "ae_worship_visitation_bridge.js" not in tv:
            errors.append("visitation missing bridge script")
    else:
        errors.append("missing visitation_index.html")

    hub = CM / "js/ae_worship_data_hub.js"
    if hub.is_file():
        th = hub.read_text(encoding="utf-8", errors="replace")
        if "scanBurnoutSignals" not in th:
            errors.append("data hub missing scanBurnoutSignals")
    else:
        errors.append("missing ae_worship_data_hub.js")

    choir = CM / "modules/worship/choir-team.html"
    if choir.is_file():
        tc = choir.read_text(encoding="utf-8", errors="replace")
        bi = tc.find('id="choir-bridge"')
        fl = tc.find('id="choir-flow"')
        if bi < 0 or fl < 0 or fl > bi:
            errors.append("choir-team flow should precede bridge in DOM")
    else:
        errors.append("missing choir-team.html")

    reg = CM / "js/ae_worship_page_registry.js"
    if reg.is_file():
        tr = reg.read_text(encoding="utf-8", errors="replace")
        if 'mode: "tool"' not in tr:
            errors.append("registry missing tool mode")
    shell = CM / "js/ae_worship_six_section_shell.js"
    if shell.is_file() and "ae-worship-theory-fold" not in shell.read_text(encoding="utf-8"):
        errors.append("shell missing theory fold")

    if errors:
        for e in errors:
            print("FAIL:", e)
        return 1
    print("OK: W4 dual view + W6 visitation closure + strategy bridge.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
