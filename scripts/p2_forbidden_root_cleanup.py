#!/usr/bin/env python3
"""P2: remove forbidden dirs from church_planning root (public, node_modules)."""
from __future__ import annotations

import shutil
from pathlib import Path

PLAN = Path(__file__).resolve().parent.parent / "church_planning"
ARCHIVE = PLAN / "_archive" / "dev_vite_shell_2026-06"

FORBIDDEN = ("node_modules", "public")


def main() -> None:
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    for name in FORBIDDEN:
        src = PLAN / name
        if not src.exists():
            print(f"skip (absent): {name}")
            continue
        if name == "public":
            dst = ARCHIVE / "public"
            if dst.exists():
                shutil.rmtree(dst)
            shutil.move(str(src), str(dst))
            print(f"moved public/ -> archive")
        else:
            shutil.rmtree(src)
            print(f"removed {name}/")
    print("OK: P2 forbidden root cleanup done.")


if __name__ == "__main__":
    main()
