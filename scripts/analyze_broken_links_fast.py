#!/usr/bin/env python3
"""Fast broken-link count; skip languages, backups, archive, hymn_00/22/most/chi/pwc/world."""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SKIP_PREFIX = (
    "languages/", "backups/", "archive/",
    "hymn_management/hymn/hymn_00/", "hymn_management/hymn/hymn_22/",
    "hymn_management/hymn/hymn_most/", "hymn_management/hymn/hymn_chi/",
    "hymn_management/hymn/hymn_pwc/", "hymn_management/hymn/hymn_world/",
)
HREF = re.compile(rb'''href\s*=\s*(["'])([^"'#?]+)\1''', re.I)


def main() -> int:
    broken: list[str] = []
    for p in ROOT.rglob("*.htm*"):
        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        if any(rel.startswith(s) for s in SKIP_PREFIX):
            continue
        raw = p.read_bytes()[:150000]
        for mm in HREF.finditer(raw):
            h = mm.group(2)
            try:
                s = unquote(h.decode("utf-8", errors="replace")).strip()
            except Exception:
                continue
            if any(s.startswith(x) for x in ("http://", "https://", "mailto:", "javascript:", "data:", "chrome-extension:", "file://", "/")):
                continue
            if s.startswith("#") or not s or "<" in s:
                continue
            tgt = (p.parent / s.split("#")[0].split("?")[0]).resolve()
            if tgt.suffix.lower() in (".html", ".htm", ".json") and not tgt.is_file():
                broken.append(rel)
                break
    c = Counter(b.split("/")[0] for b in broken)
    print("BROKEN (fast scope):", len(broken))
    for k, v in c.most_common(15):
        print(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
