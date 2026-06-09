#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject W1 six-section shell assets into A-zone worship/media pages."""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"

WORSHIP_PAGES = [
    "modules/worship/pulpit-ministry.html",
    "modules/worship/sermon-notes-admin.html",
    "modules/worship/hospitality.html",
    "modules/worship/worship-integrated.html",
    "modules/worship/worship-team-management.html",
    "modules/worship/instrument-team.html",
    "modules/worship/congregational-songs.html",
    "modules/worship/sheet-music.html",
    "modules/worship/song-library.html",
    "modules/worship/worship-management.html",
    "modules/worship/worship-reports.html",
    "modules/worship/attendance-management.html",
    "modules/media/audio-team.html",
    "modules/media/live-streaming.html",
]

CHOIR_PATCH_ONLY = "modules/worship/choir-team.html"

MARKER = "b100-ae-worship-w1-shell"
SHELL_BLOCK = """
<!-- {marker} -->
<link rel="stylesheet" href="../../css/ae_worship_six_section.css" />
<script src="../../js/church-master-database.js"></script>
<script src="../../js/central_member_db.js"></script>
<script src="../../js/member_id_bridge.js"></script>
<script src="../../js/ae_worship_page_registry.js"></script>
<script src="../../js/ae_worship_six_section_shell.js"></script>
""".format(marker=MARKER)

CHOIR_BLOCK = """
<!-- {marker} -->
<script src="../../js/church-master-database.js"></script>
<script src="../../js/central_member_db.js"></script>
<script src="../../js/member_id_bridge.js"></script>
""".format(marker=MARKER)


def inject_block(html: str, block: str) -> str:
    if MARKER in html:
        return html
    m = re.search(r"<!--\s*b100-ae-subpage-shell\s*-->", html, re.I)
    if m:
        return html[: m.start()] + block + "\n" + html[m.start() :]
    m = re.search(r"</body>", html, re.I)
    if not m:
        raise ValueError("no </body>")
    return html[: m.start()] + block + "\n" + html[m.start() :]


def ensure_body_zone(html: str, skip_shell: bool = False) -> str:
    if skip_shell:
        if 'data-ae-worship-shell="skip"' in html:
            return html
        html = re.sub(
            r"<body([^>]*)>",
            r'<body\1 data-b100-ae-zone="a" data-ae-worship-shell="skip">',
            html,
            count=1,
            flags=re.I,
        )
        return html
    if "data-b100-ae-zone" in html:
        return html
    return re.sub(
        r"<body([^>]*)>",
        r'<body\1 data-b100-module="church_ministry" data-b100-pattern="P-AE-SUB" data-b100-ae-zone="a">',
        html,
        count=1,
        flags=re.I,
    )


def main() -> int:
    changed = 0
    for rel in WORSHIP_PAGES:
        fp = CM / rel
        if not fp.is_file():
            print(f"SKIP missing {rel}")
            continue
        text = fp.read_text(encoding="utf-8", errors="replace")
        new = ensure_body_zone(inject_block(text, SHELL_BLOCK))
        if new != text:
            fp.write_text(new, encoding="utf-8")
            changed += 1
            print(f"PATCH {rel}")

    fp = CM / CHOIR_PATCH_ONLY
    if fp.is_file():
        text = fp.read_text(encoding="utf-8", errors="replace")
        new = ensure_body_zone(inject_block(text, CHOIR_BLOCK), skip_shell=True)
        if "id=\"memberIdLinkPanel\"" not in new and "choir-org" in new:
            new = new.replace(
                '<p class="section-lead" style="font-size:10px;color:#64748b;">后期互联',
                '<div id="memberIdLinkPanel"></div>\n            <p class="section-lead" style="font-size:10px;color:#64748b;">后期互联',
                1,
            )
        if new != text:
            fp.write_text(new, encoding="utf-8")
            changed += 1
            print(f"PATCH {CHOIR_PATCH_ONLY}")

    print(f"OK: {changed} files updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
