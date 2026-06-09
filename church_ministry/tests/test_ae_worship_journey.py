#!/usr/bin/env python3
"""敬拜花园 · 服事旅程 + W5+ 同步接线静态检查"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "_landing/worship.html",
    "modules/worship/worship-together.html",
    "modules/worship/worship-integrated.html",
    "modules/worship/pulpit-ministry.html",
    "sidebar_worship_journey.html",
    "js/ae_worship_journey_registry.js",
    "js/ae_worship_landing_tour.js",
    "js/ae_worship_plan_sync.js",
    "js/ae_worship_together.js",
    "css/ae_worship_landing_tour.css",
]

SNIPPETS = {
    "js/crm_journey_registry.js": [
        "服事旅程·公园",
        "worship-together.html",
        "_landing/worship.html",
    ],
    "js/crm_nav.js": ["sidebar_worship_journey.html"],
    "js/ae_subpage_shell.js": ["sidebar_worship_journey.html"],
    "modules/worship/pulpit-ministry.html": [
        "ae_worship_plan_sync.js",
        "WorshipPlanSync.syncFromPulpit",
    ],
    "modules/worship/worship-team-management.html": [
        "ae_worship_plan_sync.js",
        "WorshipPlanSync.syncFromWorshipTeam",
    ],
    "js/ae_worship_plan_pipeline.js": [
        "w5SyncSub",
        "openPlanTab",
        "syncAllFromSubpages",
    ],
    "js/worship_team_bridge.js": ["syncFromWorshipTeam"],
    "_landing/worship.html": ["敬拜花园", "route-grid"],
    "modules/worship/worship-together.html": [
        "data-ae-worship-shell",
        "worship-together-root",
    ],
}


def main():
    errors = []
    for rel in REQUIRED:
        if not (ROOT / rel).is_file():
            errors.append(f"missing file: {rel}")
    for rel, needles in SNIPPETS.items():
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"missing snippet file: {rel}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for needle in needles:
            if needle not in text:
                errors.append(f"{rel}: missing {needle!r}")
    if errors:
        print("FAIL")
        for e in errors:
            print(" -", e)
        raise SystemExit(1)
    print("OK", len(REQUIRED), "files,", sum(len(v) for v in SNIPPETS.values()), "snippets")


if __name__ == "__main__":
    main()
