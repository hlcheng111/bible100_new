#!/usr/bin/env python3
"""Summarize broken-link files by folder (excl languages)."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
HREF = re.compile(rb'href\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', re.I)

def main() -> None:
    broken: list[str] = []
    for p in ROOT.rglob("*.htm*"):
        if "languages" in p.parts:
            continue
        raw = p.read_bytes()
        for mm in HREF.finditer(raw[:200000]):
            h = mm.group(1) or mm.group(2) or mm.group(3)
            if not h:
                continue
            try:
                s = unquote(h.decode("utf-8", errors="replace")).strip()
            except Exception:
                continue
            if any(
                s.startswith(x)
                for x in (
                    "http://", "https://", "mailto:", "javascript:",
                    "data:", "tel:", "chrome-extension:", "file://",
                )
            ):
                continue
            if s.startswith("#") or not s:
                continue
            tgt = (p.parent / s.split("#")[0].split("?")[0]).resolve()
            if tgt.suffix.lower() in (".html", ".htm", ".json") and not tgt.is_file():
                broken.append(str(p.relative_to(ROOT)).replace("\\", "/"))
                break
    c = Counter(b.split("/")[0] for b in broken)
    print("BROKEN_LINK_FILES:", len(broken))
    for k, v in c.most_common(25):
        print(f"  {k}: {v}")
    mainline = [
        b for b in broken
        if not b.startswith(("hymn_management/hymn/", "archive/", "backups/"))
    ]
    print("MAINLINE (excl hymn corpus, archive, backups):", len(mainline))
    for b in sorted(mainline)[:40]:
        line = (" " + b).encode("ascii", "backslashreplace").decode()
        print(line)

if __name__ == "__main__":
    main()
