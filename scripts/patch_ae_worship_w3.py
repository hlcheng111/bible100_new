#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject W3 data hub + hub panel scripts into A-zone worship pages."""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"
MARKER = "b100-ae-worship-w3"

W3_SCRIPTS = """
<!-- {marker} -->
<script src="../../js/ae_worship_data_hub.js"></script>
<script src="../../js/ae_worship_hub_panel.js"></script>
""".format(marker=MARKER)

TARGETS = list((CM / "modules/worship").glob("*.html")) + [
    CM / "modules/media/audio-team.html",
    CM / "modules/media/live-streaming.html",
]

INTEGRATED = CM / "modules/worship/worship-integrated.html"


def inject(html: str) -> str:
    if MARKER in html:
        return html
    anchor = '<script src="../../js/ae_worship_ai_draft.js"></script>'
    if anchor in html:
        return html.replace(
            anchor,
            anchor
            + "\n<script src=\"../../js/ae_worship_data_hub.js\"></script>"
            + "\n<script src=\"../../js/ae_worship_hub_panel.js\"></script>"
            + f"\n<!-- {MARKER} -->",
            1,
        )
    m = re.search(r"<!--\s*b100-ae-subpage-shell\s*-->", html, re.I)
    if m:
        return html[: m.start()] + W3_SCRIPTS + "\n" + html[m.start() :]
    return html


def patch_integrated(html: str) -> str:
    if 'id="w3-hub-panel"' not in html:
        html = html.replace(
            '<div style="font-size:18px;font-weight:700;" id="w0-stat-month">—</div>本月服事</div>\n        </div>',
            '<div style="font-size:18px;font-weight:700;" id="w0-stat-month">—</div>本月服事</div>\n        </div>\n        <div id="w3-hub-panel" style="margin-top:10px;"></div>',
            1,
        )
    if "AeWorshipHubPanel" not in html and "renderOverview" in html:
        html = html.replace(
            "document.getElementById('w0-stat-month').textContent = thisMonthServices;\n            }",
            "document.getElementById('w0-stat-month').textContent = thisMonthServices;\n            }\n            if (window.AeWorshipHubPanel) AeWorshipHubPanel.renderMain('w3-hub-panel');",
            1,
        )
    return inject(html)


def main() -> int:
    n = 0
    for fp in TARGETS:
        if not fp.is_file():
            continue
        text = fp.read_text(encoding="utf-8", errors="replace")
        new = patch_integrated(text) if fp.name == "worship-integrated.html" else inject(text)
        if new != text:
            fp.write_text(new, encoding="utf-8")
            n += 1
            print("PATCH", fp.relative_to(REPO))
    print(f"OK: {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
