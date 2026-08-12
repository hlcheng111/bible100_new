#!/usr/bin/env python3
"""Wave 3: move church_planning companion pages to companion/ and fix relative paths."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
COMP = PLAN / "companion"
ARCHIVE = PLAN / "_archive" / "p1_wave2_2026-06"

COMPANION_FILES = (
    "page_see.html",
    "page_learn.html",
    "page_fill.html",
    "page_reports.html",
    "a1-health-entry.html",
    "planning-user-guide.html",
    "leader-pipeline-radar.html",
    "ministry-8020-slasher.html",
    "strategy-conflict-report.html",
    "pastoral-professional-review.html",
    "supabase-setup.html",
    "church-health-diagnosis.html",
    "pastoral-spiritual-survey-pro.html",
    "12 Apostles Leadership Assessment.html",
)

STUB_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=companion/{name}">
  <title>已搬移 · {title}</title>
  <script>location.replace('companion/{name}');</script>
</head>
<body><p>已搬至 <a href="companion/{name}">companion/{name}</a></p></body>
</html>
"""

ROOT_REPLACEMENTS = (
    ('href="page_see.html"', 'href="companion/page_see.html"'),
    ('href="page_learn.html"', 'href="companion/page_learn.html"'),
    ('href="page_fill.html"', 'href="companion/page_fill.html"'),
    ('href="page_reports.html"', 'href="companion/page_reports.html"'),
    ('href="supabase-setup.html"', 'href="companion/supabase-setup.html"'),
    ('href="planning-user-guide.html"', 'href="companion/planning-user-guide.html"'),
    ('href="ministry-8020-slasher.html"', 'href="companion/ministry-8020-slasher.html"'),
    ('href="church-health-diagnosis.html"', 'href="companion/church-health-diagnosis.html"'),
    ('href="pastoral-spiritual-survey-pro.html"', 'href="companion/pastoral-spiritual-survey-pro.html"'),
    ('withChurchId("strategy-conflict-report.html")', 'withChurchId("companion/strategy-conflict-report.html")'),
    ('withChurchId("ministry-8020-slasher.html")', 'withChurchId("companion/ministry-8020-slasher.html")'),
    ('withChurchId("leader-pipeline-radar.html")', 'withChurchId("companion/leader-pipeline-radar.html")'),
    ('withChurchId("pastoral-professional-review.html")', 'withChurchId("companion/pastoral-professional-review.html")'),
    ("planningOpenContent(event,'planning-user-guide.html')", "planningOpenContent(event,'companion/planning-user-guide.html')"),
    ("planningOpenContent(event,'vision.html')", "planningOpenContent(event,'companion/vision.html')"),
    ('onclick="return planningOpenContent(event,\'vision.html\');"', "onclick=\"return planningOpenContent(event,'companion/vision.html');\""),
    ('onclick="return planningOpenContent(event,\'planning-user-guide.html\');"', "onclick=\"return planningOpenContent(event,'companion/planning-user-guide.html');\""),
    ('href="vision.html"', 'href="companion/vision.html"'),
    ('href="a1-health-entry.html"', 'href="companion/a1-health-entry.html"'),
)


def fix_companion_html(text: str) -> str:
    """Adjust paths for files now one level below church_planning/."""
    same_folder = set(COMPANION_FILES) | {"vision.html"}
    prefix_targets = (
        "dashboard.html",
        "planning/",
        "assessment-os-hub.html",
        "cta-os-war-room.html",
        "index_plan.html",
        "index.html",
        "sidebar_plan.html",
        "Church_Governance_",
        "Church_Health_",
        "css/",
        "js/",
        "../",
    )

    def bump(m: re.Match[str]) -> str:
        attr, val = m.group(1), m.group(2)
        if val.startswith("../") or val.startswith("http") or val.startswith("#") or val.startswith("javascript:"):
            return m.group(0)
        base = val.split("?")[0].split("#")[0]
        if base in same_folder or any(base.startswith(x) for x in ("page_", "12 Apostles")):
            return m.group(0)
        if any(val.startswith(t) for t in prefix_targets):
            return f'{attr}../{val}"'
        return m.group(0)

    text = re.sub(r'(href=")([^"]+)"', bump, text)
    text = re.sub(r'(src=")([^"]+)"', bump, text)
    text = re.sub(r"(href=')([^']+)'", bump, text)
    return text


def apply_root_replacements(path: Path) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    orig = text
    for old, new in ROOT_REPLACEMENTS:
        text = text.replace(old, new)
    if text != orig:
        path.write_text(text, encoding="utf-8")


def write_stub(name: str) -> None:
    stub = PLAN / name
    stub.write_text(
        STUB_TEMPLATE.format(name=name, title=name),
        encoding="utf-8",
    )


def main() -> None:
    COMP.mkdir(parents=True, exist_ok=True)

    vision_src = ARCHIVE / "vision.html"
    if vision_src.is_file() and not (COMP / "vision.html").is_file():
        shutil.copy2(vision_src, COMP / "vision.html")

    for name in COMPANION_FILES:
        src = PLAN / name
        dst = COMP / name
        if src.is_file():
            shutil.move(str(src), str(dst))
        elif not dst.is_file():
            print(f"skip missing: {name}")

    for name in list(COMPANION_FILES) + ["vision.html"]:
        p = COMP / name
        if p.is_file():
            p.write_text(fix_companion_html(p.read_text(encoding="utf-8")), encoding="utf-8")
            write_stub(name)

    for rel in (
        "dashboard.html",
        "sidebar_plan.html",
        "assessment-os-hub.html",
        "Church_Governance_SWOT_matrix.html",
        "Church_Governance_pastoral_health.html",
        "js/pastoral_acs_shell.js",
        "js/pastoral_pastoral_desk_content.js",
    ):
        apply_root_replacements(PLAN / rel)

    # a1-health-entry may be referenced in dashboard JS strings
    dash = PLAN / "dashboard.html"
    if dash.is_file():
        t = dash.read_text(encoding="utf-8")
        t = t.replace("a1-health-entry.html", "companion/a1-health-entry.html")
        dash.write_text(t, encoding="utf-8")

    print(f"OK: companion reorg — {len(COMPANION_FILES) + 1} pages in companion/, stubs at root.")


if __name__ == "__main__":
    main()
