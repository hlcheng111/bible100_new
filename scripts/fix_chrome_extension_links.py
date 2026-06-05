#!/usr/bin/env python3
"""Remove broken chrome-extension:// PDF anchor tags (batch-1, excl archive)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAT = re.compile(
    r'<a\s+[^>]*href\s*=\s*["\']chrome-extension://[^"\']*["\'][^>]*>.*?</a>',
    re.I | re.S,
)


def main() -> int:
    total = 0
    for path in ROOT.rglob("*.htm*"):
        if any(p in path.parts for p in ("archive", "languages", "backups")):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        new_text, n = PAT.subn("", text)
        if n:
            path.write_text(new_text, encoding="utf-8")
            total += n
            rel = str(path.relative_to(ROOT)).encode("ascii", "backslashreplace").decode()
            print(f"  {n}: {rel}")
    print(f"Removed {total} chrome-extension anchors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
