#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject W2 CRM / AI draft / worship team bridge scripts into A-zone pages."""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"
MARKER = "b100-ae-worship-w2"

W2_SCRIPTS = """
<!-- {marker} -->
<script src="../../js/worship_team_bridge.js"></script>
<script src="../../js/ae_worship_crm_bridge.js"></script>
<script src="../../js/ae_worship_ai_draft.js"></script>
""".format(marker=MARKER)

TARGETS = list((CM / "modules/worship").glob("*.html")) + [
    CM / "modules/media/audio-team.html",
    CM / "modules/media/live-streaming.html",
]


def inject(html: str) -> str:
    if MARKER in html:
        return html
    anchor = '<script src="../../js/ae_worship_six_section_shell.js"></script>'
    if anchor in html:
        return html.replace(
            anchor,
            '<script src="../../js/worship_team_bridge.js"></script>\n'
            '<script src="../../js/ae_worship_crm_bridge.js"></script>\n'
            '<script src="../../js/ae_worship_ai_draft.js"></script>\n'
            f"<!-- {MARKER} -->\n" + anchor,
            1,
        )
    m = re.search(r"<!--\s*b100-ae-subpage-shell\s*-->", html, re.I)
    if m:
        return html[: m.start()] + W2_SCRIPTS + "\n" + html[m.start() :]
    return html


def patch_choir(html: str) -> str:
    if 'id="ae-worship-bridge-extras"' not in html and "choir-bridge" in html:
        html = html.replace(
            '<div class="bridge-grid">',
            '<div id="ae-worship-bridge-extras"></div>\n            <div id="ae-worship-ai-draft"></div>\n            <div class="bridge-grid">',
            1,
        )
    if 'id="ae-worship-ai-draft-training"' not in html and "choir-training" in html:
        html = html.replace(
            '<div id="trainingSummary"',
            '<div id="ae-worship-ai-draft-training"></div>\n            <div id="trainingSummary"',
            1,
        )
    return html


def main() -> int:
    n = 0
    for fp in TARGETS:
        if not fp.is_file():
            continue
        text = fp.read_text(encoding="utf-8", errors="replace")
        new = inject(text)
        if fp.name == "choir-team.html":
            new = patch_choir(new)
        if new != text:
            fp.write_text(new, encoding="utf-8")
            n += 1
            print("PATCH", fp.relative_to(REPO))
    print(f"OK: {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
