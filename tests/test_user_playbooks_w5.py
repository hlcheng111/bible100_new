#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
W5 爱用剧本 · 四任务静态检查

Run: python tests/test_user_playbooks_w5.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MD = REPO / "docs" / "governance" / "USER_PLAYBOOKS_W5_V1.md"
HTML = REPO / "help" / "user_playbooks_w5.html"
SIDEBAR = REPO / "help" / "sidebar_help.html"
DOCS_HUB = REPO / "help" / "docs-hub.html"
SITE_HOME = REPO / "help" / "site_home.html"
ROADMAP = REPO / "docs" / "governance" / "SITE_PHASE_ROADMAP_V1.md"

PLAYBOOKS = (
    ("prep", "education-integrated.html#tab-teaching", "备课"),
    ("attendance", "education-integrated.html#tab-attendance", "点名"),
    ("shift", "volunteer_shift/index.html", "排班"),
    ("study", "comprehensive_exegesis_reader.html", "查经"),
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    if not MD.is_file():
        errors.append("missing USER_PLAYBOOKS_W5_V1.md")
    else:
        md = read(MD)
        for title in ("剧本 1", "剧本 2", "剧本 3", "剧本 4"):
            if title not in md:
                errors.append(f"markdown missing section: {title}")
        if "file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html" not in md:
            errors.append("markdown missing file:// acceptance path")

    if not HTML.is_file():
        errors.append("missing help/user_playbooks_w5.html")
    else:
        html = read(HTML)
        if "bible100ShellNav" not in html:
            errors.append("playbook HTML missing bible100ShellNav")
        for pid, target, _label in PLAYBOOKS:
            if f'data-b100-playbook="{pid}"' not in html:
                errors.append(f"playbook HTML missing id {pid}")
            if target not in html:
                errors.append(f"playbook HTML missing target path: {target}")
        if re.search(r"smart_ministry/index\.html|school_management/index\.html", html):
            errors.append("playbook HTML must not link module L0 index shells")

    sb = read(SIDEBAR)
    if "user_playbooks_w5.html" not in sb:
        errors.append("sidebar_help.html should link user_playbooks_w5.html")

    hub = read(DOCS_HUB)
    if "user_playbooks_w5.html" not in hub:
        errors.append("docs-hub.html should link user_playbooks_w5.html")

    home = read(SITE_HOME)
    if "user_playbooks_w5.html" not in home:
        errors.append("site_home.html should link user_playbooks_w5.html")

    roadmap = read(ROADMAP)
    if "阶段 4" not in roadmap or "✅" not in roadmap.split("阶段 4")[1][:120]:
        errors.append("SITE_PHASE_ROADMAP phase 4 should be marked complete")

    for rel in (
        "church_ministry/modules/education/education-integrated.html",
        "church_ministry/tools/volunteer_shift/index.html",
        "bible_study/comprehensive_exegesis_reader.html",
    ):
        if not (REPO / rel).is_file():
            errors.append(f"missing playbook target page: {rel}")

    if errors:
        print("FAIL — user playbooks W5:")
        for e in errors:
            print("  -", e)
        return 1

    print("OK — user playbooks W5 (4 scripts + hub links)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
