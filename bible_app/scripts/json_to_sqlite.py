#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convert Bible100 clean JSON to SQLite for mobile offline pack."""
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent
OUT_DIR = ROOT / "app" / "assets" / "bible"
BIBLE_CLEAN = REPO_ROOT / "data" / "bibles" / "clean"

VERSION_MAP = {
    "KJV.json": "kjv",
    "信望爱(和合本).json": "cuv_trust",
    "吕振中.json": "luzhen",
    "越南聖經1934.json": "vi_1934",
    "印尼AYT.json": "id_ayt",
}


def import_json(conn: sqlite3.Connection, path: Path, version_id: str) -> int:
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    rows = raw.get("data", [])
    cur = conn.cursor()
    n = 0
    for row in rows:
        cur.execute(
            "INSERT OR REPLACE INTO verses (version, b, c, v, t) VALUES (?, ?, ?, ?, ?)",
            (version_id, int(row["b"]), int(row["c"]), int(row["v"]), row["t"]),
        )
        n += 1
    conn.commit()
    return n


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    db_path = OUT_DIR / "bible_reader.db"
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE verses (
            version TEXT NOT NULL,
            b INTEGER NOT NULL,
            c INTEGER NOT NULL,
            v INTEGER NOT NULL,
            t TEXT NOT NULL,
            PRIMARY KEY (version, b, c, v)
        )
    """)
    conn.execute("CREATE INDEX idx_verses_lookup ON verses(version, b, c)")

    total = 0
    if BIBLE_CLEAN.exists():
        for fname, vid in VERSION_MAP.items():
            fp = BIBLE_CLEAN / fname
            if fp.exists():
                n = import_json(conn, fp, vid)
                print(f"Imported {vid}: {n} verses from {fp.name}", flush=True)
                total += n
    else:
        sample = ROOT / "packages" / "core" / "data" / "sample_bible.json"
        with open(sample, encoding="utf-8") as f:
            raw = json.load(f)
        cur = conn.cursor()
        for row in raw["data"]:
            cur.execute(
                "INSERT INTO verses VALUES (?, ?, ?, ?, ?)",
                (raw["version"], row["b"], row["c"], row["v"], row["t"]),
            )
            total += 1
        for row in raw.get("en", []):
            cur.execute(
                "INSERT INTO verses VALUES (?, ?, ?, ?, ?)",
                ("SAMPLE_EN", row["b"], row["c"], row["v"], row["t"]),
            )
            total += 1
        conn.commit()
        print(f"No data/bibles/clean — seeded sample only ({total} verses)")

    conn.close()
    print(f"Wrote {db_path} ({total} verses)")


if __name__ == "__main__":
    main()
