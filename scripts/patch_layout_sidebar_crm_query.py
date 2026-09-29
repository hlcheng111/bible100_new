#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""為 sidebar_church_layout_v1.html 子鏈批量加上 crm_from=sidebar&role=&step=（波 3）。"""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

REPO = Path(__file__).resolve().parents[1]
SIDEBAR = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
REGISTRY = REPO / "church_ministry" / "js" / "crm_journey_registry.js"

HREF_RE = re.compile(
    r'href="((?:modules/|dashboard\.html|people/|congregation/|theme-settings\.html|'
    r'custom-page-editor\.html|vision_and_plan\.html|roadmap-overview\.html|'
    r'ministry_core\.html|ai-and-compliance\.html|community-overview\.html)[^"]*)"',
    re.I,
)

SUBPAGE_RE = re.compile(
    r'\{\s*zone:\s*"([a-z])"[^}]*?path:\s*"([^"]+)"[^}]*?(?:role:\s*"([^"]+)")?[^}]*?(?:step:\s*(\d+))?',
    re.S,
)
ZONE_PRIMARY_RE = re.compile(
    r'id:\s*"([a-z])"[^}]*?primary:\s*\{[^}]*?path:\s*"([^"]+)"[^}]*?role:\s*"([^"]+)"[^}]*?step:\s*(\d+)',
    re.S,
)

SKIP_PREFIXES = ("#", "javascript:", "../", "http://", "https://")


def norm_key(path: str) -> str:
    return path.split("?")[0].split("#")[0].replace("\\", "/").lower()


def load_lookup() -> dict[str, tuple[str, int]]:
    text = REGISTRY.read_text(encoding="utf-8", errors="replace")
    lookup: dict[str, tuple[str, int]] = {}
    zone_default: dict[str, tuple[str, int]] = {}

    for m in ZONE_PRIMARY_RE.finditer(text):
        zone, path, role, step = m.group(1), m.group(2), m.group(3), int(m.group(4))
        zone_default[zone] = (role, step)
        lookup.setdefault(norm_key(path), (role, step))

    for m in SUBPAGE_RE.finditer(text):
        zone, path = m.group(1), m.group(2)
        role = m.group(3)
        step = m.group(4)
        key = norm_key(path)
        if key in lookup:
            continue
        if role and step is not None:
            lookup[key] = (role, int(step))
        elif zone in zone_default:
            lookup[key] = zone_default[zone]

    return lookup


def augment_href(href: str, lookup: dict[str, tuple[str, int]]) -> str | None:
    if any(href.startswith(p) for p in SKIP_PREFIXES):
        return None
    if "crm_from=" in href:
        return None

    parsed = urlparse(href)
    key = norm_key(parsed.path or href)
    ctx = lookup.get(key)
    if not ctx:
        return None

    role, step = ctx
    q = parse_qs(parsed.query, keep_blank_values=True)
    q["crm_from"] = ["sidebar"]
    q["role"] = [role]
    q["step"] = [str(step)]
    new_query = urlencode([(k, v[0]) for k, v in q.items()])
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


def patch_sidebar() -> tuple[int, int]:
    lookup = load_lookup()
    text = SIDEBAR.read_text(encoding="utf-8", errors="replace")
    patched = 0
    skipped = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal patched, skipped
        old = m.group(1)
        new = augment_href(old, lookup)
        if not new:
            skipped += 1
            return m.group(0)
        patched += 1
        return f'href="{new}"'

    new_text = HREF_RE.sub(repl, text)
    if new_text != text:
        SIDEBAR.write_text(new_text, encoding="utf-8", newline="\n")
    return patched, skipped


def main() -> int:
    if not SIDEBAR.is_file():
        print(f"MISSING {SIDEBAR}")
        return 1
    patched, skipped = patch_sidebar()
    print(f"PATCH layout sidebar: {patched} hrefs updated, {skipped} unchanged/skipped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
