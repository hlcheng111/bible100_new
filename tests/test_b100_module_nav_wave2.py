#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Wave 2: study/school/ai 顶栏2 与 b100_module_nav_ssot 对齐（静态）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SSOT = REPO / "js" / "b100_module_nav_ssot.js"
MODES = REPO / "config" / "modes.json"
INDEX = REPO / "index_v5.html"
HUB = REPO / "js" / "b100_hub_embed.js"
SHELL = REPO / "js" / "b100_landing_shell.js"
HUB_CLEAN = REPO / "js" / "index_v5_hub_clean.js"
BUILD_VER = REPO / "config" / "build_version.js"

SCHOOL_LANDING = REPO / "school_management" / "_landing" / "home.html"
STUDY_LANDING = REPO / "bible_study" / "_landing" / "home.html"

SIMPLIFIED_FORBIDDEN = ["教务", "结业", "备课", "规划落地", "妙用说明", "老师不用"]


def extract_zone_labels(js_text: str, mode_id: str) -> list[dict]:
    m = re.search(rf"\b{mode_id}:\s*\{{[^}}]*zones:\s*\[(.*?)\]\s*,\s*\}}", js_text, re.S)
    if not m:
        return []
    block = m.group(1)
    zones = []
    for zm in re.finditer(
        r"\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}",
        block,
        re.S,
    ):
        chunk = zm.group(1)
        id_m = re.search(r'id:\s*"([^"]+)"', chunk)
        label_m = re.search(r'labelZh:\s*"([^"]+)"', chunk)
        content_m = re.search(r'content:\s*"([^"]+)"', chunk)
        if not id_m or not label_m or not content_m:
            continue
        if mode_id == "school" and re.search(r"topBar:\s*false", chunk):
            continue
        zones.append(
            {
                "id": id_m.group(1),
                "labelZh": label_m.group(1),
                "content": content_m.group(1).split("?")[0],
            }
        )
    return zones


def secondary_nav_for_mode(modes: dict, mode_id: str) -> list[dict]:
    for mode in modes.get("modes", []):
        if mode.get("id") == mode_id:
            return mode.get("secondaryNav") or []
    return []


def main() -> int:
    if not SSOT.is_file():
        print("FAIL: missing", SSOT, file=sys.stderr)
        return 1
    ssot = SSOT.read_text(encoding="utf-8", errors="replace")
    if "20260812data" not in ssot and "20260812clean" not in ssot:
        print("FAIL: b100_module_nav_ssot.js NAV_BUILD not bumped", file=sys.stderr)
        return 1
    if "secondaryNavForMode" not in ssot:
        print("FAIL: missing secondaryNavForMode export", file=sys.stderr)
        return 1
    for bad in SIMPLIFIED_FORBIDDEN:
        if bad in ssot:
            print(f"FAIL: ssot still contains simplified label fragment: {bad!r}", file=sys.stderr)
            return 1

    modes = json.loads(MODES.read_text(encoding="utf-8"))
    for mode_id in ("study", "school", "ai"):
        zones = extract_zone_labels(ssot, mode_id)
        nav = [i for i in secondary_nav_for_mode(modes, mode_id) if i.get("focusZone")]
        if len(zones) != len(nav):
            print(f"FAIL: {mode_id} zone count ssot={len(zones)} modes.json={len(nav)}", file=sys.stderr)
            return 1
        for z, item in zip(zones, nav):
            if z["id"] != item.get("focusZone"):
                print(f"FAIL: {mode_id} zone order mismatch {z['id']} vs {item.get('focusZone')}", file=sys.stderr)
                return 1
            if z["labelZh"] != item.get("labelZh"):
                print(
                    f"FAIL: {mode_id}/{z['id']} labelZh ssot={z['labelZh']!r} config={item.get('labelZh')!r}",
                    file=sys.stderr,
                )
                return 1

    index = INDEX.read_text(encoding="utf-8", errors="replace")
    if "secondaryNavForMode" not in index:
        print("FAIL: index_v5.html does not use B100ModuleNavSsot.secondaryNavForMode", file=sys.stderr)
        return 1

    hub = HUB.read_text(encoding="utf-8", errors="replace")
    if "quietLandingDom" not in hub:
        print("FAIL: b100_hub_embed.js missing quietLandingDom", file=sys.stderr)
        return 1
    if "contentWindow === global" not in hub:
        print("FAIL: b100_hub_embed.js missing file:// contentFrame fallback", file=sys.stderr)
        return 1

    if "index_v5_hub_clean.js" not in index:
        print("FAIL: index_v5.html must load index_v5_hub_clean.js for file:// cache bust", file=sys.stderr)
        return 1
    if "20260812data" not in index:
        print("FAIL: index_v5.html build stamp 20260812data missing", file=sys.stderr)
        return 1

    if BUILD_VER.is_file():
        bv = BUILD_VER.read_text(encoding="utf-8", errors="replace")
        if "20260812data" not in bv:
            print("FAIL: build_version.js not bumped to 20260812data", file=sys.stderr)
            return 1

    if HUB_CLEAN.is_file():
        hc = HUB_CLEAN.read_text(encoding="utf-8", errors="replace")
        if "stripEnLabels" not in hc:
            print("FAIL: index_v5_hub_clean.js missing stripEnLabels export", file=sys.stderr)
            return 1
        if "20260812data" not in hc:
            print("FAIL: hub_clean build not bumped", file=sys.stderr)
            return 1
    else:
        print("FAIL: missing", HUB_CLEAN, file=sys.stderr)
        return 1

    cap = REPO / "js" / "page_capability_badge.js"
    if cap.is_file():
        cap_text = cap.read_text(encoding="utf-8", errors="replace")
        if "inHubContentFrame" not in cap_text and "contentWindow === global" not in cap_text:
            print("FAIL: page_capability_badge should skip injection in Hub iframe", file=sys.stderr)
            return 1

    shell = SHELL.read_text(encoding="utf-8", errors="replace")
    if "if (hub)" not in shell or "quietLandingDom" not in shell:
        print("FAIL: landing shell should quiet hub landing chrome", file=sys.stderr)
        return 1

    for landing_path in (SCHOOL_LANDING, STUDY_LANDING):
        if not landing_path.is_file():
            print("FAIL: missing", landing_path, file=sys.stderr)
            return 1
        landing = landing_path.read_text(encoding="utf-8", errors="replace")
        if "b100-kicker" in landing:
            print(f"FAIL: {landing_path.name} should not contain b100-kicker (Hub 顶栏已有模式名)", file=sys.stderr)
            return 1

    if "showModeEn" not in index:
        print("FAIL: index_v5 mode buttons should use showModeEn (zh-Hant 不叠英文)", file=sys.stderr)
        return 1

    school = SCHOOL_LANDING.read_text(encoding="utf-8", errors="replace")
    for bad in SIMPLIFIED_FORBIDDEN:
        if bad in school:
            print(f"FAIL: school landing still contains simplified fragment: {bad!r}", file=sys.stderr)
            return 1

    print("OK: Wave 2 module nav SSOT alignment checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
