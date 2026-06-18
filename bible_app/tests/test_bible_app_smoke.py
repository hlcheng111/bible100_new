#!/usr/bin/env python3
"""Smoke checks for bible_app scaffold."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = [
    ROOT / "packages" / "core" / "src" / "tracking" / "TrackingEngine.ts",
    ROOT / "app" / "app" / "tracks" / "index.tsx",
    ROOT / "firebase" / "firestore.rules",
    ROOT / "sheets" / "README.md",
    ROOT / "docs" / "PHASE1_PRD.md",
]


def main():
    missing = [str(p.relative_to(ROOT)) for p in REQUIRED if not p.exists()]
    if missing:
        print("MISSING:", missing)
        return 1
    print("OK bible_app smoke:", len(REQUIRED), "paths")
    return 0


if __name__ == "__main__":
    sys.exit(main())
