#!/usr/bin/env python3
"""Verify bible_reader.db contains four translation version keys."""
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "app" / "assets" / "bible" / "bible_reader.db"
REQUIRED = ("cuv_trust", "kjv", "vi_1934", "id_ayt")
MIN_BYTES = 10 * 1024 * 1024


def main() -> int:
    if not DB.exists():
        print("MISSING", DB)
        return 1
    if DB.stat().st_size < MIN_BYTES:
        print("SMALL", DB.stat().st_size)
        return 1
    con = sqlite3.connect(str(DB))
    try:
        rows = con.execute(
            "SELECT version, COUNT(*) FROM verses GROUP BY version"
        ).fetchall()
    finally:
        con.close()
    found = {r[0]: r[1] for r in rows}
    missing = [v for v in REQUIRED if v not in found or found[v] < 1000]
    if missing:
        print("MISSING_VERSIONS", missing, "found:", list(found.keys()))
        return 1
    print("OK bible_reader.db versions:", {k: found[k] for k in REQUIRED})
    return 0


if __name__ == "__main__":
    sys.exit(main())
