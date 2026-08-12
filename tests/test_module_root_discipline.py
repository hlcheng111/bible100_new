#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P2 · 模組根目錄紀律 — 黑名單目錄不得出現在模組根。

Run: python tests/test_module_root_discipline.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "config" / "module_manifest.json"

FORBIDDEN_ROOT_DIRS = frozenset(
    {
        "node_modules",
        "src",
        "dist",
        "public",
        "test",
        "tests",
        "sub",
        "__tests__",
        "coverage",
        ".pytest_cache",
        "cypress",
        "e2e",
    }
)

CP_ALLOWED_ROOT_DIRS = frozenset(
    {
        "_archive",
        "tools",
        "companion",
        "guides",
        "planning",
        "js",
        "css",
        "docs",
        "image_plan",
        "planning_surveys",
        "spiritual_app",
    }
)


def module_roots(manifest: dict) -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    for mod in manifest.get("modules", []):
        mid = mod.get("id")
        if not mid or mid in ("shell", "nav_hub", "languages"):
            continue
        landing = mod.get("landing") or mod.get("sidebar")
        if not landing:
            continue
        root = REPO / Path(str(landing)).parts[0]
        if root.is_dir():
            out.append((mid, root))
    return out


def main() -> int:
    errors: list[str] = []
    if not MANIFEST.is_file():
        print("FAIL: missing manifest", file=sys.stderr)
        return 1

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    checked: set[str] = set()

    for mid, root in module_roots(data):
        if mid in checked:
            continue
        checked.add(mid)
        for child in root.iterdir():
            if not child.is_dir():
                continue
            name = child.name.lower()
            if name in FORBIDDEN_ROOT_DIRS:
                errors.append(f"{mid}: forbidden root dir {root.name}/{child.name}/")

    cp = REPO / "church_planning"
    if cp.is_dir():
        for child in cp.iterdir():
            if not child.is_dir():
                continue
            if child.name.startswith("_") or child.name in CP_ALLOWED_ROOT_DIRS:
                continue
            if child.name.lower() in FORBIDDEN_ROOT_DIRS:
                continue
            errors.append(
                f"church_planning: non-whitelist root dir {child.name}/ "
                f"(see MODULE_ROOT_DISCIPLINE.md)"
            )

    doc = REPO / "docs" / "governance" / "MODULE_ROOT_DISCIPLINE.md"
    if not doc.is_file():
        errors.append("missing docs/governance/MODULE_ROOT_DISCIPLINE.md")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: module root discipline ({len(errors)} issues)", file=sys.stderr)
        return 1

    print(f"OK: module root discipline — {len(checked)} module roots scanned, church_planning whitelist OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
