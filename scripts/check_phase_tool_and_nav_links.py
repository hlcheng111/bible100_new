#!/usr/bin/env python3
"""
Resolve relative href="..." in selected HTML files from bible100_new root.
Print MISSING / OK counts. Run from repo: python scripts/check_phase_tool_and_nav_links.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Pages: four-tool wave + nav/tools/help shells
SCAN_FILES = [
    "tools/tools-overview-sidebar.html",
    "tools/tools-dashboard.html",
    "nav_hub/index.html",
    "nav_hub/sidebar.html",
    "nav_hub/dashboard.html",
    "nav_hub/sitemap_navigation.html",
    "nav_hub/omni_entry.html",
    "nav_hub/documentation_center.html",
    "help/tools-overview.html",
    "help/docs-hub.html",
    "help/global-tools.htm",
    "church_planning/planning/index.html",
    "church_planning/spiritual_app/index.html",
    "smart_ministry/talent_ministry_matching.html",
    "smart_ministry/talent_tracking.html",
    "church_planning/planning/ai-summary.html",
    "help/church-tool-four-pillars.html",
    "help/role-task-start.html",
    "help/project-status-hub.html",
]

HREF_RE = re.compile(r"""href\s*=\s*(["'])([^"'#?]+)\1""", re.I)


def norm_target(raw: str) -> str | None:
    t = raw.strip()
    if not t or t.startswith(("http://", "https://", "mailto:", "javascript:", "data:")):
        return None
    if t.startswith("#"):
        return None
    return t


def main() -> int:
    missing: list[tuple[str, str, str]] = []
    ok = 0
    for rel in SCAN_FILES:
        path = ROOT / rel
        if not path.is_file():
            print(f"SKIP (file missing): {rel}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        base = path.parent
        for m in HREF_RE.finditer(text):
            tgt = norm_target(m.group(2))
            if tgt is None:
                continue
            if "${" in tgt or "{{" in tgt:
                continue
            resolved = (base / tgt).resolve()
            try:
                resolved.relative_to(ROOT.resolve())
            except ValueError:
                missing.append((rel, tgt, "outside repo"))
                continue
            if resolved.is_file() or resolved.is_dir():
                ok += 1
            else:
                missing.append((rel, tgt, "not found"))
    print(f"OK (resolved paths exist): {ok}")
    print(f"MISSING: {len(missing)}")
    for src, tgt, why in sorted(missing, key=lambda x: (x[0], x[1]))[:200]:
        print(f"  {src} -> {tgt}  ({why})")
    if len(missing) > 200:
        print(f"  ... and {len(missing) - 200} more")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
