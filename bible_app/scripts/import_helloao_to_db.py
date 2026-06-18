#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Append helloao VI/ID clean JSON into bible_reader.db (keeps existing versions)."""
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent
DB_PATH = ROOT / "app" / "assets" / "bible" / "bible_reader.db"
BIBLE_CLEAN = REPO_ROOT / "data" / "bibles" / "clean"

VERSION_MAP = {
    "越南聖經1934.json": "vi_1934",
    "印尼AYT.json": "id_ayt",
}


def import_json(conn: sqlite3.Connection, path: Path, version_id: str) -> int:
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    rows = raw.get("data", [])
    cur = conn.cursor()
    cur.execute("DELETE FROM verses WHERE version = ?", (version_id,))
    n = 0
    for row in rows:
        cur.execute(
            "INSERT OR REPLACE INTO verses (version, b, c, v, t) VALUES (?, ?, ?, ?, ?)",
            (version_id, int(row["b"]), int(row["c"]), int(row["v"]), row["t"]),
        )
        n += 1
    conn.commit()
    return n


def main() -> int:
    if not DB_PATH.exists():
        print(f"Missing {DB_PATH}; run json_to_sqlite.py first", file=sys.stderr)
        return 1
    if not BIBLE_CLEAN.exists():
        print(f"Missing {BIBLE_CLEAN}; run fetch_helloao_bible.py first", file=sys.stderr)
        return 1

    conn = sqlite3.connect(DB_PATH)
    total = 0
    for fname, vid in VERSION_MAP.items():
        fp = BIBLE_CLEAN / fname
        if not fp.exists():
            print(f"Skip missing {fp}", flush=True)
            continue
        n = import_json(conn, fp, vid)
        print(f"Imported {vid}: {n} verses", flush=True)
        total += n
    conn.close()
    print(f"Done ({total} new verses in {DB_PATH.name})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
