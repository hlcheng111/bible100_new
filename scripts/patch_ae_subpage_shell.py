#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""為 church_ministry A–E 子頁注入 ae_subpage_shell 互聯腳本（波 2c）。"""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CM = REPO / "church_ministry"

MARKER = "ae_subpage_shell.js"
SNIPPET_RE = re.compile(
    r"\n\s*<!-- b100-ae-subpage-shell -->.*?</script>\s*",
    re.S,
)

# 與 crm_journey_registry.js AE_SUBPAGES 對齊
PRIMARY_PATHS = [
    "modules/worship/worship-integrated.html",
    "modules/support/visitation_index.html",
    "modules/education/education-integrated.html",
    "modules/expansion/outreach-strategy.html",
    "dashboard.html",
]

SUBPAGE_PATHS = [
    "modules/worship/pulpit-ministry.html",
    "modules/worship/sermon-notes-admin.html",
    "modules/worship/hospitality.html",
    "modules/worship/worship-team-management.html",
    "modules/worship/choir-team.html",
    "modules/worship/instrument-team.html",
    "modules/worship/congregational-songs.html",
    "modules/worship/sheet-music.html",
    "modules/worship/song-library.html",
    "modules/worship/worship-management.html",
    "modules/worship/worship-reports.html",
    "modules/worship/attendance-management.html",
    "modules/media/audio-team.html",
    "modules/media/live-streaming.html",
    "modules/media/video-production.html",
    "modules/development/youth-ministry-dev.html",
    "modules/development/development-plan.html",
    "modules/expansion/community-assessment.html",
    "modules/expansion/mission-opportunities.html",
    "modules/expansion/new-ministry-planning.html",
    "modules/expansion/church-planting.html",
    "modules/expansion/branch-management.html",
    "modules/expansion/mission-expansion.html",
    "modules/expansion/cross-cultural.html",
    "modules/innovation/new-media.html",
    "modules/innovation/innovation-projects.html",
    "modules/innovation/technology-integration.html",
    "modules/innovation/digital-transformation.html",
    "modules/innovation/technology-apps.html",
    "modules/innovation/smart-tools-dev.html",
    "modules/innovation/best-practices.html",
    "modules/volunteer/volunteer-integrated.html",
    "people/people_list.html",
    "modules/members/member-integrated.html",
    "modules/finance/finance-integrated.html",
    "modules/administration/financial-management.html",
    "modules/equipment/equipment-management.html",
    "modules/library/library-management.html",
    "community-overview.html",
    "modules/research/index.html",
    "modules/research/member-statistics.html",
    "modules/research/ministry-performance.html",
    "modules/research/growth-trends.html",
    "modules/research/engagement-analysis.html",
    "modules/tech/ai-assistant.html",
    "modules/tech/smart-recommendation.html",
    "modules/support/smart-reminders.html",
    "modules/support/workflow.html",
    "modules/support/technical-support.html",
    "modules/support/help-documentation.html",
    "theme-settings.html",
    "custom-page-editor.html",
    "vision_and_plan.html",
    "roadmap-overview.html",
    "ministry_core.html",
    "ai-and-compliance.html",
    "congregation/index.html",
]


def cm_prefix(rel: str) -> str:
    depth = rel.count("/")
    return "../" * depth if depth else ""


def site_prefix(rel: str) -> str:
    return cm_prefix(rel) + "../"


def build_snippet(rel: str, minimal: bool = False) -> str:
    cm = cm_prefix(rel)
    site = site_prefix(rel)
    if minimal:
        return f"""
<!-- b100-ae-subpage-shell -->
<link rel="stylesheet" href="{cm}css/ae_zone_roadmap.css" />
<script src="{cm}js/crm_journey_registry.js"></script>
<script src="{cm}js/ae_subpage_shell.js"></script>
"""
    return f"""
<!-- b100-ae-subpage-shell -->
<link rel="stylesheet" href="{cm}css/ae_primary_nav_strip.css" />
<link rel="stylesheet" href="{cm}css/ae_zone_roadmap.css" />
<link rel="stylesheet" href="{cm}css/crm_context_bar.css" />
<script src="{site}config/build_version.js"></script>
<script src="{site}js/shell_nav.js"></script>
<script src="{cm}js/crm_journey_registry.js"></script>
<script src="{cm}js/crm_context_bar.js"></script>
<script src="{cm}js/ae_primary_nav.js"></script>
<script src="{cm}js/ae_subpage_shell.js"></script>
"""


def patch_file(path: Path, rel: str, minimal: bool = False) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")
    snippet = build_snippet(rel, minimal=minimal)
    if MARKER in text:
        if "<!-- b100-ae-subpage-shell -->" in text:
            new_text = SNIPPET_RE.sub("\n" + snippet, text, count=1)
            if new_text == text:
                return "skip"
            path.write_text(new_text, encoding="utf-8", newline="\n")
            return "update"
        return "skip"
    low = text.lower()
    idx = low.rfind("</body>")
    if idx < 0:
        return "no-body"
    new_text = text[:idx] + snippet + text[idx:]
    path.write_text(new_text, encoding="utf-8", newline="\n")
    return "patch"


def main() -> int:
    patched = updated = skipped = missing = 0
    all_paths = [(r, r in PRIMARY_PATHS) for r in PRIMARY_PATHS] + [
        (r, False) for r in SUBPAGE_PATHS if r not in PRIMARY_PATHS
    ]
    for rel, is_primary in all_paths:
        p = CM / rel
        if not p.is_file():
            print(f"MISSING {rel}")
            missing += 1
            continue
        status = patch_file(p, rel, minimal=is_primary)
        if status == "patch":
            patched += 1
            print(f"PATCH {rel}")
        elif status == "update":
            updated += 1
            print(f"UPDATE {rel}")
        else:
            skipped += 1
    print(f"OK: patched={patched} updated={updated} skipped={skipped} missing={missing}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
