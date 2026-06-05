#!/usr/bin/env python3
"""Scan mainline HTML for broken relative href (excludes archive/, backups/, languages/)."""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SKIP_PARTS = {"archive", "backups", ".git", "node_modules", "languages", "doc_viewer"}
HREF_RE = re.compile(r"""href\s*=\s*(["'])([^"'#?]+)\1""", re.I)


def skip(path: Path) -> bool:
    return any(p in SKIP_PARTS for p in path.parts)


def main() -> int:
    missing: list[tuple[str, str]] = []
    for path in sorted(ROOT.rglob("*")):
        if path.suffix.lower() not in {".html", ".htm"} or skip(path):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        base = path.parent
        for m in HREF_RE.finditer(text):
            raw = unquote(m.group(2).strip())
            if not raw or "<" in raw or raw.startswith(
                ("http://", "https://", "file://", "mailto:", "javascript:", "data:", "chrome-extension:")
            ):
                continue
            if "${" in raw:
                continue
            tgt = (base / raw).resolve()
            try:
                tgt.relative_to(ROOT.resolve())
            except ValueError:
                missing.append((str(path.relative_to(ROOT)), raw))
                continue
            if not tgt.exists():
                missing.append((str(path.relative_to(ROOT)), raw))
    print(f"MAINLINE_MISSING: {len(missing)}")
    for src, tgt in sorted(missing)[:80]:
        print(f"  {src} -> {tgt}")
    if len(missing) > 80:
        print(f"  ... and {len(missing) - 80} more")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
