#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""church_tools_manifest.js 路徑契約 — LIVE 項目檔案須存在（missing 除外）。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "js" / "church_tools_manifest.js"

PATH_RE = re.compile(r'\bpath:\s*"([^"]+)"')
STATUS_RE = re.compile(r'status:\s*"([^"]+)"')


def parse_entries(text: str) -> list[tuple[str, str]]:
    """逐列掃描 { ... path ... status ... } 區塊（簡化 parser）。"""
    items: list[tuple[str, str]] = []
    for block in re.findall(r"\{[^{}]+\}", text):
        pm = PATH_RE.search(block)
        sm = STATUS_RE.search(block)
        if not sm:
            continue
        path = pm.group(1) if pm else ""
        items.append((path, sm.group(1)))
    return items


def main() -> int:
    errors: list[str] = []
    if not MANIFEST.is_file():
        print("FAIL: missing js/church_tools_manifest.js", file=sys.stderr)
        return 1

    text = MANIFEST.read_text(encoding="utf-8")
    if "ChurchToolsManifest" not in text:
        errors.append("manifest must export ChurchToolsManifest")

    required_layers = ("planning", "crm", "guide", "automation")
    for layer in required_layers:
        if f'layer: "{layer}"' not in text:
            errors.append(f"manifest missing layer: {layer}")

    for path, status in parse_entries(text):
        if status in ("missing", "planned", "stub", "partial"):
            continue
        if status != "live":
            continue
        if not path or path.startswith("index_v5.html"):
            continue
        full = REPO / path.replace("/", "\\") if sys.platform == "win32" else REPO / path
        if not full.is_file():
            errors.append(f"live manifest path missing file: {path!r}")

    if "guide_step2_raci" not in text:
        errors.append("manifest must include guide_step2_raci")
    if "volunteer_shift" not in text:
        errors.append("manifest must include volunteer_shift tool_id")

    if errors:
        print("FAIL: church tools manifest", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: church tools manifest (layers + live paths).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
