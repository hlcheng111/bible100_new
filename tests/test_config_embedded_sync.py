#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ensure js/config-embedded.js mirrors config/*.json (file:// SSOT).
Run: python tests/test_config_embedded_sync.py
After editing config: node scripts/generate_config_embedded.js
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
EMBEDDED = REPO / "js" / "config-embedded.js"
CONFIG = REPO / "config"

SYNC_FILES = [
    "modules.json",
    "modes.json",
    "languages.json",
    "paths.json",
    "local-languages.json",
]

FORBIDDEN_IN_CHURCH_NAV = [
    "CTA-OS 戰情室",
    "CTA War Room",
]


def load_embedded_config() -> dict:
    if not EMBEDDED.is_file():
        raise FileNotFoundError(f"missing {EMBEDDED}")
    text = EMBEDDED.read_text(encoding="utf-8")
    marker = "BIBLE100_EMBEDDED_CONFIG = "
    start = text.find(marker)
    if start < 0:
        raise ValueError("BIBLE100_EMBEDDED_CONFIG not found in config-embedded.js")
    start += len(marker)
    end = text.rfind("};")
    if end < start:
        raise ValueError("malformed config-embedded.js (no closing };)")
    return json.loads(text[start : end + 1])


def main() -> int:
    embedded = load_embedded_config()
    errors: list[str] = []

    for name in SYNC_FILES:
        src_path = CONFIG / name
        if not src_path.is_file():
            continue
        src = json.loads(src_path.read_text(encoding="utf-8"))
        emb = embedded.get(name)
        if emb is None:
            errors.append(f"missing embedded key: {name!r}")
            continue
        if src != emb:
            errors.append(f"drift: config/{name} != js/config-embedded.js[{name!r}]")

    modes_emb = embedded.get("modes.json") or {}
    church = next((m for m in modes_emb.get("modes", []) if m.get("id") == "church"), None)
    if church:
        nav = church.get("secondaryNav") or []
        labels = " ".join(
            str(i.get("labelZh") or i.get("labelEn") or "")
            for i in nav
            if isinstance(i, dict)
        )
        for bad in FORBIDDEN_IN_CHURCH_NAV:
            if bad in labels:
                errors.append(f"church secondaryNav must not contain top-bar item: {bad!r}")

        crm = next(
            (i for i in nav if isinstance(i, dict) and "guide_crm_journey_hub" in str(i.get("path", ""))),
            None,
        )
        if crm and "sidebar_crm_journey.html" not in str(crm.get("sidebar", "")):
            errors.append("embedded church CRM journey must use sidebar_crm_journey.html")

        abcd_markers = ["worship.html", "small-groups", "education-integrated", "outreach-strategy"]
        for marker in abcd_markers:
            item = next(
                (i for i in nav if isinstance(i, dict) and marker in str(i.get("path", ""))),
                None,
            )
            if item and "sidebar_church_layout_v1.html" not in str(item.get("sidebar", "")):
                errors.append(f"embedded church nav {marker} must use sidebar_church_layout_v1.html")

    if errors:
        print("FAIL: config embedded sync", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        print("\nFix: node scripts/generate_config_embedded.js", file=sys.stderr)
        return 1

    print("OK: config-embedded.js mirrors config/*.json (", len(SYNC_FILES), "files).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
