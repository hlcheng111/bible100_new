#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""各 live 測評頁須在 HTML 內硬寫 ①②③④ Tab 標記（RACI exempt）。"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"

COACHING_PAGES = [
    "shape-gifts-assessment.html",
    "ministry-competency-assessment.html",
    "alda-leadership-assessment.html",
    "ministry-position-matchmaker.html",
    "johari-window-assessment.html",
    "disc-profile-assessment.html",
    "mbti-self-awareness.html",
]

STRATEGIC_PAGES = [
    "swot-planning.html",
    "pdca-planning.html",
    "ministry-8020-planning.html",
]

TAB_MARKERS = ["①", "②", "③", "④"]
HARDEN_ATTR = 'data-acs-hardcoded="true"'


def _fail(msg: str) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)


def assert_tabs_in_html(path: Path, *, coaching: bool) -> None:
    text = path.read_text(encoding="utf-8")
    for m in TAB_MARKERS:
        if m not in text:
            _fail(f"{path.name}: missing tab marker {m}")
    if coaching:
        if HARDEN_ATTR not in text:
            _fail(f"{path.name}: missing {HARDEN_ATTR} on hardcoded shell")
        if 'data-acs-tab="intro"' not in text:
            _fail(f"{path.name}: missing data-acs-tab buttons")


def main() -> None:
    for name in COACHING_PAGES:
        assert_tabs_in_html(PLAN / name, coaching=True)
    for name in STRATEGIC_PAGES:
        p = PLAN / name
        text = p.read_text(encoding="utf-8")
        for m in TAB_MARKERS:
            if m not in text:
                _fail(f"{name}: missing tab marker {m}")
        if 'data-strategic-tab="survey"' not in text:
            _fail(f"{name}: missing strategic hybrid tab buttons")
    print("OK: assessment 4-tab shell contract (%d coaching + %d strategic)" % (
        len(COACHING_PAGES), len(STRATEGIC_PAGES)))


if __name__ == "__main__":
    main()
