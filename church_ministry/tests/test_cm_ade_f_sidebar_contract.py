#!/usr/bin/env python3
"""CM A / D / E / F 区 · Sidebar Kit SSOT 契约"""
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
        "needles": ("聚会出席", "敬拜音乐事工", "成人诗班"),
        "forbidden": ("DEMO", "主日聚會", "更多敬拜"),
    },
    {
        "id": "d",
        "ssot": ROOT / "js" / "cm_d_menu_ssot.js",
        "host": "sb-zone-d",
        "min_hrefs": 2,
        "needles": ("需求登记", "外展差传事工"),
    },
    {
        "id": "e",
        "ssot": ROOT / "js" / "cm_e_menu_ssot.js",
        "host": "sb-zone-e",
        "min_hrefs": 4,
        "needles": ("义工排班", "社会服务事工"),
    },
    {
        "id": "f",
        "ssot": ROOT / "js" / "cm_f_menu_ssot.js",
        "host": "sb-zone-f",
        "min_hrefs": 2,
        "needles": ("诗歌曲库", "诗歌应用事工"),
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
    return CM_BASE / rel_clean.replace("/", "\\")


def main() -> int:
    errors: list[str] = []
    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""

    for zone in ZONES:
        zid = zone["id"]
        ssot_path = zone["ssot"]
        if not ssot_path.is_file():
            errors.append("%s: missing SSOT %s" % (zid, ssot_path.name))
            continue
        ssot = read_text(ssot_path)
        host = zone["host"]
        if host not in sidebar:
            errors.append("%s: sidebar missing #%s" % (zid, host))
        script_needle = ssot_path.name
        if script_needle not in sidebar:
            errors.append("%s: sidebar missing script %s" % (zid, script_needle))
        for needle in zone["needles"]:
            if needle not in ssot:
                errors.append("%s: SSOT missing %s" % (zid, needle))
        for bad in zone.get("forbidden", ()):
            if bad in ssot:
                errors.append("%s: SSOT still contains %s" % (zid, bad))
        paths = extract_hrefs(ssot)
        if len(paths) < zone["min_hrefs"]:
            errors.append("%s: expected >=%d hrefs, got %d" % (zid, zone["min_hrefs"], len(paths)))
        for rel in paths:
            target = resolve_target(rel)
            if not target.is_file():
                errors.append("%s: missing file %s" % (zid, rel.split("#")[0]))

    registry = read_text(ROOT / "js" / "cm_a_g_menu_registry.js")
    for zid in ("a", "d", "e", "f"):
        if 'id: "' + zid + '"' not in registry:
            errors.append("registry missing zone " + zid)
        if registry.count('status: "kit"') < 7:
            pass
    for zid in ("a", "d", "e", "f"):
        block = registry.split('id: "' + zid + '"', 1)
        if len(block) < 2 or 'status: "kit"' not in block[1][:200]:
            errors.append("registry zone %s not kit" % zid)

    if errors:
        print("FAIL CM A/D/E/F sidebar contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK CM A/D/E/F sidebar contract (4 zones kit)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
