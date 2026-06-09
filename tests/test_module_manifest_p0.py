#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P0 · module_manifest.json + 冻结核心 + 治理文档存在性。

Run: python tests/test_module_manifest_p0.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "config" / "module_manifest.json"


def main() -> int:
    errors: list[str] = []
    if not MANIFEST.is_file():
        print("FAIL: missing config/module_manifest.json", file=sys.stderr)
        return 1

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))

    for rel in data.get("governanceDocs", []):
        p = REPO / rel
        if not p.is_file():
            errors.append(f"missing governance doc: {rel}")

    for rel in data.get("frozenCore", []):
        p = REPO / rel
        if not p.is_file():
            errors.append(f"frozen core missing: {rel}")

    for mod in data.get("modules", []):
        mid = mod.get("id", "?")
        for key in ("landing", "sidebar", "altLanding", "altSidebar", "registry"):
            rel = mod.get(key)
            if not rel:
                continue
            p = REPO / rel
            if not p.is_file():
                errors.append(f"module {mid!r} missing {key}: {rel}")

    for link in data.get("crossLinks", []):
        from_rel = link.get("from")
        expect = link.get("expect")
        if not from_rel or not expect:
            continue
        p = REPO / from_rel
        if not p.is_file():
            errors.append(f"crossLink from missing: {from_rel}")
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        if expect not in text:
            errors.append(
                f"crossLink {link.get('id')!r}: {from_rel} must contain {expect!r}"
            )

    waves = data.get("cleanupWaves", [])
    if not waves or waves[0].get("wave") != 0:
        errors.append("cleanupWaves must start with wave 0 (P0)")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: module manifest P0 ({len(errors)} issues)", file=sys.stderr)
        return 1

    n_mod = len(data.get("modules", []))
    n_frozen = len(data.get("frozenCore", []))
    n_links = len(data.get("crossLinks", []))
    print(
        f"OK: module manifest P0 — {n_mod} modules, {n_frozen} frozen, {n_links} crossLinks, governance docs present."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
