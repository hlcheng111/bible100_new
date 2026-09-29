#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教会事工 · 连结存在性扫描（B · 半自动）

解析侧栏／Hub 的 href 与 bible100ShellNav 目标，确认档案存在。

Run: python tests/test_church_ministry_link_scan.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

SCAN_FILES = [
    "church_ministry/sidebar.html",
    "church_ministry/sidebar_crm_journey.html",
    "church_ministry/sidebar_church_layout_v1.html",
    "church_ministry/guide_crm_journey_hub.html",
    "church_ministry/dashboard.html",
    "church_ministry/index.html",
]

HREF_RE = re.compile(r"""href\s*=\s*(["'])([^"'#?]+)\1""", re.I)
SHELL_NAV_RE = re.compile(
    r"(sidebarUrl|contentUrl)\s*:\s*['\"]([^'\"]+)['\"]",
    re.I,
)

SKIP_PREFIXES = ("http://", "https://", "mailto:", "javascript:", "data:", "#")
SKIP_FRAGMENTS = ("${", "{{")


def norm_href(raw: str) -> str | None:
    t = raw.strip()
    if not t or any(t.startswith(p) for p in SKIP_PREFIXES):
        return None
    if any(f in t for f in SKIP_FRAGMENTS):
        return None
    return t


def resolve_from_page(page_rel: str, target: str, *, root_relative: bool) -> Path:
    clean = target.split("?")[0]
    if root_relative:
        return (REPO / clean).resolve()
    base = (REPO / page_rel).parent
    return (base / clean).resolve()


def collect_targets(page_rel: str, text: str) -> list[tuple[str, str, bool]]:
    """Return (target, kind, root_relative)."""
    out: list[tuple[str, str, bool]] = []
    for m in HREF_RE.finditer(text):
        tgt = norm_href(m.group(2))
        if tgt:
            out.append((tgt, "href", False))
    for key, val in SHELL_NAV_RE.findall(text):
        if val and not val.startswith("#"):
            out.append((val, f"shell:{key}", True))
    return out


def main() -> int:
    missing: list[tuple[str, str, str]] = []
    ok = 0
    scanned = 0

    for rel in SCAN_FILES:
        path = REPO / rel
        if not path.is_file():
            missing.append((rel, rel, "scan file missing"))
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        seen: set[tuple[str, str]] = set()
        for tgt, kind, root_rel in collect_targets(rel, text):
            key = (tgt.split("?")[0], kind)
            if key in seen:
                continue
            seen.add(key)
            scanned += 1
            resolved = resolve_from_page(rel, tgt, root_relative=root_rel)
            try:
                resolved.relative_to(REPO.resolve())
            except ValueError:
                missing.append((rel, tgt, f"{kind}: outside repo"))
                continue
            if resolved.is_file() or resolved.is_dir():
                ok += 1
            else:
                missing.append((rel, tgt, kind))

    print(f"Scanned files: {len(SCAN_FILES)}")
    print(f"Unique targets: {scanned}")
    print(f"OK (exist): {ok}")
    print(f"MISSING: {len(missing)}")
    for src, tgt, why in sorted(missing, key=lambda x: (x[0], x[1]))[:120]:
        print(f"  {src} -> {tgt}  ({why})")
    if len(missing) > 120:
        print(f"  ... and {len(missing) - 120} more")

    if missing:
        print("FAIL: church ministry link scan", file=sys.stderr)
        return 1

    print("OK: church ministry link scan — all sidebar/hub targets resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
