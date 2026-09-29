#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mission UX Layer static checks (Phase UX-1～3).

Run: python tests/test_mission_ux_wireflow.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MISSION = REPO / "church_ministry" / "mission"
MODES = REPO / "config" / "modes.json"
DATA = REPO / "data" / "missions"

REQUIRED_PAGES = [
    "mission_hub.html",
    "disciple_center.html",
    "diagnostic_hub.html",
    "city_missions.html",
    "industry_missions.html",
    "task_library.html",
    "sidebar_mission.html",
]

REQUIRED_JS = [
    "js/mission_hub_nav.js",
    "js/mission_tasks_embed.js",
]

REQUIRED_CSS = ["css/mission_ux.css"]

REQUIRED_DATA = [
    "city_tasks_v1.json",
    "industry_tasks_v1.json",
]

TASK_REQUIRED_FIELDS = {"id", "title", "description", "tags", "difficulty", "hours_per_month"}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def church_mode() -> dict:
    modes = load_json(MODES)
    for m in modes.get("modes", []):
        if m.get("id") == "church":
            return m
    raise AssertionError("church mode missing")


def validate_task_file(path: Path, errors: list[str]) -> None:
    if not path.is_file():
        errors.append(f"missing data file: {path.relative_to(REPO)}")
        return
    data = load_json(path)
    tasks = data.get("tasks")
    if not isinstance(tasks, list):
        errors.append(f"{path.name}: tasks must be array")
        return
    if len(tasks) != 10:
        errors.append(f"{path.name}: expected 10 pilot tasks, got {len(tasks)}")
    for i, t in enumerate(tasks):
        if not isinstance(t, dict):
            errors.append(f"{path.name}[{i}]: task must be object")
            continue
        missing = TASK_REQUIRED_FIELDS - set(t.keys())
        if missing:
            errors.append(f"{path.name}[{i}]: missing fields {sorted(missing)}")
        if not isinstance(t.get("tags"), list) or not t["tags"]:
            errors.append(f"{path.name}[{i}]: tags must be non-empty array")


def main() -> int:
    errors: list[str] = []

    for name in REQUIRED_PAGES:
        p = MISSION / name
        if not p.is_file():
            errors.append(f"missing page: church_ministry/mission/{name}")

    for name in REQUIRED_JS + REQUIRED_CSS:
        p = MISSION / name
        if not p.is_file():
            errors.append(f"missing asset: church_ministry/mission/{name}")

    nav_js = MISSION / "js" / "mission_hub_nav.js"
    if nav_js.is_file():
        nav_text = nav_js.read_text(encoding="utf-8")
        for sym in ["renderTaskList", "missionOpenContent", "initDiagnosticHub", "initDiscipleCenter"]:
            if sym not in nav_text:
                errors.append(f"mission_hub_nav.js missing export/logic: {sym}")

    sidebar = MISSION / "sidebar_mission.html"
    if sidebar.is_file():
        sb = sidebar.read_text(encoding="utf-8")
        if "data-b100-nav" not in sb:
            errors.append("sidebar_mission.html must use data-b100-nav")
        if "sidebar_behavior.js" not in sb:
            errors.append("sidebar_mission.html must load sidebar_behavior.js")
        for href in ["mission_hub.html", "disciple_center.html", "diagnostic_hub.html"]:
            if href not in sb:
                errors.append(f"sidebar_mission.html missing link: {href}")

    for name in REQUIRED_DATA:
        validate_task_file(DATA / name, errors)

    ux_doc = REPO / "docs" / "governance" / "UX_WIREFLOW_MISSION_V1.md"
    if not ux_doc.is_file():
        errors.append("missing docs/governance/UX_WIREFLOW_MISSION_V1.md")

    church = church_mode()
    nav = church.get("secondaryNav") or []
    mission = next(
        (
            i
            for i in nav
            if isinstance(i, dict)
            and "mission/mission_hub.html" in str(i.get("path", ""))
        ),
        None,
    )
    if not mission:
        errors.append("church secondaryNav missing 門徒與使命 → mission_hub.html")
    else:
        sb = str(mission.get("sidebar", ""))
        if "sidebar_mission.html" not in sb:
            errors.append(f"mission nav must use sidebar_mission.html, got {sb!r}")
        label = str(mission.get("labelZh", ""))
        if "門徒" not in label and "使命" not in label:
            errors.append(f"mission labelZh should mention 門徒/使命, got {label!r}")

    hub = MISSION / "mission_hub.html"
    if hub.is_file():
        ht = hub.read_text(encoding="utf-8")
        for needle in ["disciple_center.html", "diagnostic_hub.html", "MissionHubNav"]:
            if needle not in ht:
                errors.append(f"mission_hub.html missing {needle!r}")

    guide = REPO / "help" / "site-navigation-guide.html"
    if guide.is_file():
        gt = guide.read_text(encoding="utf-8")
        if "門徒與使命" not in gt and "mission/mission_hub" not in gt:
            errors.append("site-navigation-guide.html should document 門徒與使命 branch")

    if errors:
        print("FAIL — mission UX wireflow checks:")
        for e in errors:
            print(" -", e)
        return 1

    print("OK — mission UX wireflow (pages, data, modes, docs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
