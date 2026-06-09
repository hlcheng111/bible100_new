#!/usr/bin/env python3
"""Normalize W1/W2 script block order in A-zone worship pages."""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"

SHELL_BLOCK = """<!-- b100-ae-worship-w1-shell -->
<link rel="stylesheet" href="../../css/ae_worship_six_section.css" />
<script src="../../js/church-master-database.js"></script>
<script src="../../js/central_member_db.js"></script>
<script src="../../js/member_id_bridge.js"></script>
<!-- b100-ae-worship-w2 -->
<script src="../../js/worship_team_bridge.js"></script>
<script src="../../js/ae_worship_crm_bridge.js"></script>
<script src="../../js/ae_worship_ai_draft.js"></script>
<!-- b100-ae-worship-w3 -->
<script src="../../js/ae_worship_data_hub.js"></script>
<script src="../../js/ae_worship_hub_panel.js"></script>
<script src="../../js/ae_worship_page_registry.js"></script>
<script src="../../js/ae_worship_six_section_shell.js"></script>
"""

CHOIR_BLOCK = """<!-- b100-ae-worship-w1-shell -->
<!-- b100-ae-worship-w2 -->
<script src="../../js/church-master-database.js"></script>
<script src="../../js/central_member_db.js"></script>
<script src="../../js/member_id_bridge.js"></script>
<script src="../../js/worship_team_bridge.js"></script>
<script src="../../js/ae_worship_crm_bridge.js"></script>
<script src="../../js/ae_worship_ai_draft.js"></script>
<!-- b100-ae-worship-w3 -->
<script src="../../js/ae_worship_data_hub.js"></script>
<script src="../../js/ae_worship_hub_panel.js"></script>
"""

TARGETS = list((CM / "modules/worship").glob("*.html")) + [
    CM / "modules/media/audio-team.html",
    CM / "modules/media/live-streaming.html",
]

PAT = re.compile(
    r"<!--\s*b100-ae-worship-w1-shell\s*-->.*?<!--\s*b100-ae-subpage-shell\s*-->",
    re.S | re.I,
)


def main() -> int:
    n = 0
    for fp in TARGETS:
        if not fp.is_file():
            continue
        text = fp.read_text(encoding="utf-8", errors="replace")
        if "b100-ae-subpage-shell" not in text:
            continue
        block = CHOIR_BLOCK if fp.name == "choir-team.html" else SHELL_BLOCK
        new = PAT.sub(block + "\n\n<!-- b100-ae-subpage-shell -->", text, count=1)
        if new != text:
            fp.write_text(new, encoding="utf-8")
            n += 1
            print("FIX", fp.relative_to(REPO))
    print(f"OK: {n} files normalized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
