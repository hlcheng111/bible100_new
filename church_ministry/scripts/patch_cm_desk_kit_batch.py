# -*- coding: utf-8 -*-
"""批次注入 cm_desk_kit（B：子頁磨到同水準薄殼）。"""
from __future__ import annotations

from pathlib import Path

CM = Path(__file__).resolve().parents[1]

CSS = '<link rel="stylesheet" href="{pre}css/cm_desk.css" />'
REG = '<script src="{pre}js/cm_desk_registry.js"></script>'
KIT = '<script src="{pre}js/cm_desk_kit.js"></script>'
MARK = "<!-- b100-cm-desk-kit -->"

SKIP_DIRS = {"desks", "vendor", "node_modules", "archive"}
SKIP_NAMES = {
    "index.html",  # module shells — handled case by case
}


def prefix_for(rel: Path) -> str:
    depth = len(rel.parts) - 1  # file depth under church_ministry
    if depth <= 0:
        return ""
    return "../" * depth


def should_skip(rel: Path) -> bool:
    if any(p in SKIP_DIRS for p in rel.parts):
        return True
    if rel.name in ("sidebar_church_layout_v1.html", "sidebar_crm_journey.html", "sidebar.html"):
        return True
    if "sidebar" in rel.name:
        return True
    return False


def patch(path: Path) -> bool:
    rel = path.relative_to(CM)
    if should_skip(rel):
        return False
    t = path.read_text(encoding="utf-8", errors="replace")
    if "cm_desk_kit.js" in t or MARK in t:
        return False
    if "<body" not in t.lower():
        return False
    # skip pure redirect stubs (very short)
    if len(t) < 400 and "location.replace" in t:
        return False
    pre = prefix_for(rel)
    block = (
        f"\n{MARK}\n"
        + CSS.format(pre=pre)
        + "\n"
        + REG.format(pre=pre)
        + "\n"
        + KIT.format(pre=pre)
        + "\n"
    )
    if "</body>" in t:
        t2 = t.replace("</body>", block + "</body>", 1)
    elif "</html>" in t:
        t2 = t.replace("</html>", block + "</html>", 1)
    else:
        t2 = t + block
    # ensure canvas limit + ae chrome default minimal if missing
    if "data-b100-ae-chrome" not in t2 and "data-b100-ae-zone" in t2:
        t2 = t2.replace(
            "data-b100-ae-zone=",
            'data-b100-ae-chrome="minimal" data-b100-ae-zone=',
            1,
        )
    path.write_text(t2, encoding="utf-8", newline="\n")
    return True


def main():
    n = 0
    for p in CM.rglob("*.html"):
        if patch(p):
            n += 1
            print("patched", p.relative_to(CM))
    print("TOTAL", n)


if __name__ == "__main__":
    main()
