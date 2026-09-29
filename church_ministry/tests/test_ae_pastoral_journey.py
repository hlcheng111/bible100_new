#!/usr/bin/env python3
"""B 牧养 · 牧羊小径 B0 静态检查"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "_landing/fellowship.html",
    "modules/support/visitation_index.html",
    "modules/fellowship/small-groups.html",
    "modules/fellowship/fellowship-circles.html",
    "sidebar_pastoral_journey.html",
    "js/ae_pastoral_journey_registry.js",
    "js/ae_pastoral_landing_tour.js",
    "css/ae_pastoral_landing_tour.css",
    "docs/B_PASTORAL_W0_CONTENT_SPEC.md",
]

SNIPPETS = {
    "_landing/fellowship.html": ["牧羊小径", "三面镜子", "六件事", "mirror-grid"],
    "js/ae_pastoral_journey_registry.js": ["我是谁", "我在哪里", "我去哪里", "MIRRORS", "SIX_QUESTIONS"],
    "js/ae_primary_nav.js": ["sidebar_pastoral_journey.html"],
    "sidebar_church_layout_v1.html": [
        "探访事工", "牧羊导览", "团契总览", "小组工作桌",
        "pastoral-org-roster.html", "pastoral-attendance.html",
        "pastoral-events.html", "pastoral-training.html", "pastoral-strategy.html",
    ],
    "js/crm_journey_registry.js": [
        "探访事工", "member-integrated.html", "small-groups-integrated.html",
        "pastoral-org-roster.html", "pastoral-strategy.html",
    ],
    "js/ae_pastoral_story_nav.js": ["是什么", "从哪来", "visitation_index.html"],
    "js/ae_subpage_shell.js": ["bootPastoralShell", "isPastoralBZone"],
    "js/crm_context_bar.js": ["isPastoralBPage", "b_pastoral"],
    "modules/support/visitation_index.html": ["探访事工", "本週探訪清單", "成長追蹤"],
    "modules/fellowship/small-groups.html": ["小组之家", "memberId"],
    "modules/fellowship/fellowship-circles.html": ["团契的圈", "青年"],
}


def main():
    errors = []
    for rel in REQUIRED:
        if not (ROOT / rel).is_file():
            errors.append(f"missing: {rel}")
    for rel, needles in SNIPPETS.items():
        p = ROOT / rel
        if not p.is_file():
            errors.append(f"missing snippet file: {rel}")
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        for n in needles:
            if n not in text:
                errors.append(f"{rel}: missing {n!r}")
    if errors:
        print("FAIL", len(errors))
        for e in errors:
            print(" -", e.encode("utf-8", errors="replace").decode("utf-8"))
        raise SystemExit(1)
    print("OK", len(REQUIRED), "files")


if __name__ == "__main__":
    main()
