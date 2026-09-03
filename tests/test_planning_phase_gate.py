#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""G 規劃 Phase 閘門 · registry EXTENDED 與側欄 novice 對齊"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
REGISTRY = REPO / "church_planning" / "js" / "planning_tool_registry.js"
GATE = REPO / "church_planning" / "js" / "planning_phase_gate.js"
CONFIG = REPO / "church_planning" / "js" / "planning_phase_config.js"
RENDER = REPO / "church_planning" / "js" / "planning_sidebar_render.js"


def main() -> int:
    errors: list[str] = []
    for path in (REGISTRY, GATE, CONFIG, RENDER):
        if not path.is_file():
            errors.append(f"missing {path.relative_to(REPO)}")

    if REGISTRY.is_file():
        text = REGISTRY.read_text(encoding="utf-8")
        ext_block = text.split("var EXTENDED = [", 1)
        if len(ext_block) < 2:
            errors.append("planning_tool_registry.js missing EXTENDED block")
        else:
            ext_body = ext_block[1].split("];", 1)[0]
            entries = [e.strip() for e in ext_body.split("{ id:") if e.strip()]
            for entry in entries:
                if "sidebarHidden: true" not in entry:
                    errors.append("each EXTENDED tool must set sidebarHidden: true")

    if RENDER.is_file():
        rt = RENDER.read_text(encoding="utf-8")
        if "noviceMode: true" not in rt:
            errors.append("cm profile must use noviceMode: true")
        if "extendedHost: null" not in rt:
            errors.append("cm profile must not render extended host")

    if GATE.is_file() and CONFIG.is_file():
        gt = GATE.read_text(encoding="utf-8")
        for fn in ("isPhaseUnlocked", "getJourneyState", "phase1Progress"):
            if fn not in gt:
                errors.append(f"planning_phase_gate.js missing {fn!r}")

    if errors:
        print("FAIL: planning phase gate v2", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1
    print("OK: planning phase gate v2")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
