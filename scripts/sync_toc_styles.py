#!/usr/bin/env python3
"""Sync toc-styles.css from languages/js/ to each lang/js/ for vi, my, kh, id, lo."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "languages" / "js" / "toc-styles.css"
LANGUAGES = ROOT / "languages"

for lang in ("vi", "my", "kh", "id", "lo"):
    dst_dir = LANGUAGES / lang / "js"
    if not dst_dir.exists():
        dst_dir.mkdir(parents=True)
    dst = dst_dir / "toc-styles.css"
    if SRC.exists():
        dst.write_text(SRC.read_text(encoding="utf-8"), encoding="utf-8")
        print("OK %s" % dst.relative_to(ROOT))
