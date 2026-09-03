#!/usr/bin/env python3
"""CM A–F · 4 层侧栏 SSOT 契约（Step 6）"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
CM_BASE = ROOT / "church_ministry"

ZONES = [
    {
        "id": "a",
        "ssot": ROOT / "js" / "cm_a_menu_ssot.js",
        "host": "sb-zone-a",
        "min_hrefs": 7,
        "needles": ("聚會出席", "敬拜音樂事工"),
        "forbidden": ("DEMO", "更多敬拜"),
        "need_children": True,
    },
    {
        "id": "b",
        "ssot": ROOT / "js" / "cm_b_menu_ssot.js",
        "host": "sb-zone-b",
        "min_hrefs": 8,
        "needles": ("小組出席", "牧養小組事工", "探訪關懷"),
        "forbidden": ("DEMO", "更多牧养"),
        "need_children": True,
    },
    {
        "id": "c",
        "ssot": ROOT / "js" / "cm_c_menu_ssot.js",
        "host": "sb-zone-c",
        "min_hrefs": 5,
        "needles": ("主日学出席", "聖經門訓事工"),
        "forbidden": ("DEMO", "更多门训"),
        "need_children": True,
    },
    {
        "id": "d",
        "ssot": ROOT / "js" / "cm_d_menu_ssot.js",
        "host": "sb-zone-d",
        "min_hrefs": 4,
        "needles": ("需求登記", "外展差傳事工"),
        "forbidden": ("DEMO", "更多外展"),
        "need_children": True,
    },
    {
        "id": "e",
        "ssot": ROOT / "js" / "cm_e_menu_ssot.js",
        "host": "sb-zone-e",
        "min_hrefs": 4,
        "needles": ("義工排班", "社會服務事工"),
        "forbidden": ("DEMO", "更多社服"),
        "need_children": True,
    },
    {
        "id": "f",
        "ssot": ROOT / "js" / "cm_f_menu_ssot.js",
        "host": "sb-zone-f",
        "min_hrefs": 3,
        "needles": ("詩歌曲庫", "詩歌應用事工"),
        "forbidden": ("DEMO",),
        "need_children": False,
    },
]


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def extract_hrefs(ssot: str) -> list[str]:
    paths = re.findall(r'href:\s*href\("([^"]+)"', ssot)
    paths += re.findall(r'href:\s*"(\.\./[^"]+)"', ssot)
    paths += re.findall(r'headHref:\s*href\("([^"]+)"', ssot)
    paths += re.findall(r'headHref:\s*"([^"]+)"', ssot)
    for tab in re.findall(r'eduTab\("([^"]+)"', ssot):
        paths.append("modules/education/education-integrated.html#tab-" + tab)
    for tab in re.findall(r'outTab\("([^"]+)"', ssot):
        paths.append("modules/expansion/outreach-integrated.html#tab-" + tab)
    return paths


def resolve_target(rel: str) -> Path:
    rel_clean = rel.split("#")[0].split("?")[0]
    if rel_clean.startswith("../"):
        return ROOT / rel_clean[3:].replace("/", "\\")
    if "education-integrated.html" in rel_clean:
        return CM_BASE / "modules" / "education" / "education-integrated.html"
    if "outreach-integrated.html" in rel_clean:
        return CM_BASE / "modules" / "expansion" / "outreach-integrated.html"
    return CM_BASE / rel_clean.replace("/", "\\")


def main() -> int:
    errors: list[str] = []
    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""

    for zone in ZONES:
        zid = zone["id"]
        ssot_path = zone["ssot"]
        if not ssot_path.is_file():
            errors.append("%s: missing SSOT" % zid)
            continue
        ssot = read_text(ssot_path)
        if zone["host"] not in sidebar:
            errors.append("%s: sidebar missing #%s" % (zid, zone["host"]))
        if ssot_path.name not in sidebar:
            errors.append("%s: sidebar missing script %s" % (zid, ssot_path.name))
        if 'summary: "' not in ssot and "summary:" not in ssot:
            errors.append("%s: missing layer-3 category summary" % zid)
        for needle in zone["needles"]:
            if needle not in ssot:
                errors.append("%s: SSOT missing %s" % (zid, needle))
        for bad in zone.get("forbidden", ()):
            if bad in ssot:
                errors.append("%s: forbidden %s" % (zid, bad))
        if zone.get("need_children") and "children:" not in ssot:
            errors.append("%s: missing layer-4 children" % zid)
        paths = extract_hrefs(ssot)
        if len(paths) < zone["min_hrefs"]:
            errors.append("%s: expected >=%d hrefs, got %d" % (zid, zone["min_hrefs"], len(paths)))
        for rel in paths:
            target = resolve_target(rel)
            if not target.is_file():
                errors.append("%s: missing file %s" % (zid, rel.split("#")[0]))

    index_html = read_text(ROOT / "church_ministry" / "index.html")
    if "cmZoneBar" not in index_html:
        errors.append("standalone index missing cmZoneBar")
    if "cm_standalone_zone_bar.js" not in index_html:
        errors.append("standalone index missing cm_standalone_zone_bar.js")

    if errors:
        print("FAIL CM 4-layer zones contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM 4-layer zones contract (A-F)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
