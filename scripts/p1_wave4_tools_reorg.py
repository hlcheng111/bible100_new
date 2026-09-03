#!/usr/bin/env python3
"""Wave 4: move 17 live tool HTML pages to church_planning/tools/."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
TOOLS = PLAN / "tools"

TOOL_FILES = (
    "Church_Governance_spiritual_health.html",
    "Church_Governance_pastoral_health.html",
    "Church_Governance_8020_focus.html",
    "Church_Governance_urgent_matrix.html",
    "Church_Governance_SMART_goals.html",
    "Church_Governance_PDCA_cycle.html",
    "Church_Governance_KPI_alignment.html",
    "Church_Governance_SWOT_matrix.html",
    "Church_Governance_Culture_radar.html",
    "Church_Health_NCD_planning.html",
    "shape-gifts-assessment.html",
    "ministry-competency-assessment.html",
    "alda-leadership-assessment.html",
    "ministry-position-matchmaker.html",
    "johari-window-assessment.html",
    "disc-profile-assessment.html",
    "mbti-self-awareness.html",
)

REDIRECT_STUBS = (
    ("important-urgent-matrix.html", "Church_Governance_urgent_matrix.html"),
    ("smart-assessment.html", "Church_Governance_SMART_goals.html"),
    ("culture-alignment-assessment.html", "Church_Governance_Culture_radar.html"),
    ("kpi-okr-alignment.html", "Church_Governance_KPI_alignment.html"),
    ("ministry-8020-planning.html", "Church_Governance_8020_focus.html"),
    ("pdca-planning.html", "Church_Governance_PDCA_cycle.html"),
    ("swot-planning.html", "Church_Governance_SWOT_matrix.html"),
    ("信徒靈性生命健康自我審查.html", "Church_Governance_spiritual_health.html"),
)

STUB = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=tools/{name}">
  <title>已搬移 · {title}</title>
  <script>location.replace('tools/{name}');</script>
</head>
<body><p>已搬至 <a href="tools/{name}">tools/{name}</a></p></body>
</html>
"""

ROOT_PREFIX = (
    "assessment-os-hub.html",
    "cta-os-war-room.html",
    "cta-os-tool-report.html",
    "dashboard.html",
    "index_plan.html",
    "index.html",
    "sidebar_plan.html",
    "companion/",
    "planning/",
    "guides/",
    "../",
    "http",
    "#",
    "javascript:",
)


def fix_tool_html(text: str) -> str:
    same = set(TOOL_FILES)

    def bump(m: re.Match[str]) -> str:
        attr, val = m.group(1), m.group(2)
        if val.startswith("../") or val.startswith("http") or val.startswith("#") or val.startswith("javascript:"):
            return m.group(0)
        base = val.split("?")[0].split("#")[0]
        if base in same:
            return m.group(0)
        if any(val.startswith(p) for p in ROOT_PREFIX):
            if val.startswith("../"):
                return m.group(0)
            return f'{attr}../{val}"'
        if val.startswith("css/") or val.startswith("js/"):
            return f'{attr}../{val}"'
        return m.group(0)

    text = re.sub(r'(href=")([^"]+)"', bump, text)
    text = re.sub(r'(src=")([^"]+)"', bump, text)
    text = re.sub(r"(href=')([^']+)'", bump, text)
    # shell_nav was ../js from root → ../../js from tools/
    text = text.replace('src="../js/shell_nav.js"', 'src="../../js/shell_nav.js"')
    text = text.replace("href=\"../css/", 'href="../css/')
    return text


def update_registry() -> None:
    reg = PLAN / "js" / "planning_tool_registry.js"
    text = reg.read_text(encoding="utf-8")
    for name in TOOL_FILES:
        text = text.replace(f'path: "{name}"', f'path: "tools/{name}"')
    reg.write_text(text, encoding="utf-8")


def update_js_tool_links() -> None:
    js_dir = PLAN / "js"
    replacements = []
    for name in TOOL_FILES:
        replacements.append((f'"{name}"', f'"tools/{name}"'))
        replacements.append((f"'{name}'", f"'tools/{name}'"))
        replacements.append((f"../church_planning/{name}", f"../church_planning/tools/{name}"))
    for path in js_dir.rglob("*.js"):
        if path.name == "planning_tool_registry.js":
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in replacements:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


def write_redirect(old: str, target: str) -> None:
    (PLAN / old).write_text(
        STUB.replace("{name}", target).replace("{title}", target),
        encoding="utf-8",
    )


def main() -> None:
    TOOLS.mkdir(parents=True, exist_ok=True)
    for name in TOOL_FILES:
        src = PLAN / name
        dst = TOOLS / name
        if src.is_file():
            shutil.move(str(src), str(dst))
        if dst.is_file():
            dst.write_text(fix_tool_html(dst.read_text(encoding="utf-8")), encoding="utf-8")
        write_redirect(name, name)

    for old, target in REDIRECT_STUBS:
        write_redirect(old, target)

    update_registry()
    update_js_tool_links()

    readme = TOOLS / "README.md"
    readme.write_text(
        "# tools/ · 18 live 工具主檔（17 HTML + RACI 在 planning/）\n\n"
        "路徑 SSOT：`js/planning_tool_registry.js`。\n"
        "根目錄同名 `.html` 為 redirect stub → `tools/<name>`。\n",
        encoding="utf-8",
    )
    print(f"OK: tools/ reorg — {len(TOOL_FILES)} pages moved, stubs + registry updated.")


if __name__ == "__main__":
    main()
