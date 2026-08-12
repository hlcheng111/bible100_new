#!/usr/bin/env python3
"""G 行政管理 · Do 側欄 SSOT 契約（label + en · 單一真相）"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SIDEBAR = ROOT / "church_planning" / "sidebar_plan_v5_preview.html"
SSOT_JS = ROOT / "js" / "g_do_admin_menu_ssot.js"
G_MENU_JS = ROOT / "church_planning" / "js" / "planning_sidebar_g_menu.js"
LANDING = ROOT / "church_planning" / "landing_g_admin.html"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def parse_flat_items(ssot: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for block in re.findall(r"\{[^{}]*id:\s*\"([^\"]+)\"[^{}]*\}", ssot):
        pass
    # simpler: find id/label/en triples in FLAT array section
    flat_section = ssot.split("var FLAT = [", 1)[-1].split("];", 1)[0]
    for chunk in re.split(r"\n\s*\{", flat_section):
        id_m = re.search(r'id:\s*"([^"]+)"', chunk)
        label_m = re.search(r'label:\s*"([^"]+)"', chunk)
        en_m = re.search(r'en:\s*"([^"]+)"', chunk)
        if id_m and label_m and en_m:
            items.append({"id": id_m.group(1), "label": label_m.group(1), "en": en_m.group(1)})
    return items


def main() -> int:
    errors: list[str] = []

    sidebar = read_text(SIDEBAR) if SIDEBAR.is_file() else ""
    ssot = read_text(SSOT_JS) if SSOT_JS.is_file() else ""
    gmenu = read_text(G_MENU_JS) if G_MENU_JS.is_file() else ""
    landing = read_text(LANDING) if LANDING.is_file() else ""

    for needle in ("g_do_admin_menu_ssot.js", "planning_sidebar_g_menu.js", "sb-admin-root"):
        if needle not in sidebar:
            errors.append(f"sidebar_plan_v5_preview missing {needle}")

    if "data-do-menu-static" in sidebar:
        errors.append("sidebar still has static Do menu duplicate — use empty sb-admin-root only")

    if 'href="#"' in gmenu:
        errors.append("planning_sidebar_g_menu.js still uses href=\"#\"")

    for needle in ("renderAdminFolder", "sb-g-en", "itemSubline"):
        if needle not in gmenu:
            errors.append(f"planning_sidebar_g_menu.js missing {needle}")

    if "renderLandingList" not in ssot:
        errors.append("SSOT missing renderLandingList")

    flat = parse_flat_items(ssot)
    if len(flat) < 8:
        errors.append(f"SSOT FLAT expected >=8 items with en, got {len(flat)}")

    for item in flat:
        if not item["label"].strip():
            errors.append(f"SSOT item {item['id']} missing label")
        if not item["en"].strip():
            errors.append(f"SSOT item {item['id']} missing en")

    for gid in ("shift", "finance"):
        if f'{gid}: {{ summary:' not in ssot:
            errors.append(f"SSOT GROUPS missing {gid}")
        if f'en: "' not in ssot.split(f"{gid}:")[1].split("}", 1)[0]:
            errors.append(f"SSOT GROUPS.{gid} missing en")

    if "do-link-list" not in landing:
        errors.append("landing_g_admin missing #do-link-list host for SSOT render")

    if "renderLandingList" not in landing:
        errors.append("landing_g_admin must call GDoAdminMenu.renderLandingList")

    # SSOT 路徑檔案存在
    cm_paths = re.findall(r'cmPath:\s*"([^"]+)"', ssot)
    for rel in cm_paths:
        rel_clean = rel.split("#")[0]
        target = ROOT / "church_ministry" / rel_clean
        if not target.is_file():
            errors.append("SSOT cmPath missing file: church_ministry/" + rel_clean)

    if errors:
        print("FAIL G Do sidebar SSOT contract")
        for e in errors:
            print(" -", e)
        return 1

    print("OK G Do SSOT contract (%d items label+en, JS render only)" % len(flat))
    return 0


if __name__ == "__main__":
    sys.exit(main())
