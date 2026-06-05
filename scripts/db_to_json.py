#!/usr/bin/env python3
"""
將 SQLite .db 聖經/註釋資料轉為 JSON
用法: python db_to_json.py [輸入.db] [輸出.json]
若無參數，則轉換 data/bibles 與 data/cj 下所有 .db
"""
import sqlite3
import json
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_ROOT = SCRIPT_DIR.parent / "data"

def convert_bible_db(db_path):
    """聖經格式: Bible.data[] with Book, Chapter, Verse, Scripture"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    data = []
    for t in tables:
        try:
            rows = cur.execute(f"SELECT * FROM {t}").fetchall()
            for row in rows:
                d = dict(row)
                if 'Book' in d or 'book' in d:
                    data.append(d)
        except Exception as e:
            print(f"  Skip table {t}: {e}")
    conn.close()
    return {"Bible": {"columns": ["Book", "Chapter", "Verse", "Scripture"], "data": data}}

def convert_commentary_db(db_path):
    """註釋格式: 嘗試常見結構"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    out = {"metadata": {"source": str(db_path.name)}, "commentaries": []}
    for t in tables:
        try:
            cols = [r[1] for r in cur.execute(f"PRAGMA table_info({t})").fetchall()]
            rows = cur.execute(f"SELECT * FROM {t}").fetchall()
            for row in rows:
                d = dict(zip(cols, row))
                out["commentaries"].append(d)
        except Exception as e:
            print(f"  Skip {t}: {e}")
    conn.close()
    return out

def convert_one(db_path, out_path, is_commentary=False):
    db_path = Path(db_path)
    out_path = Path(out_path)
    if not db_path.exists():
        print(f"Skip (not found): {db_path}")
        return False
    try:
        if is_commentary or "cj" in str(db_path) or "commentary" in str(db_path).lower():
            obj = convert_commentary_db(db_path)
        else:
            obj = convert_bible_db(db_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        print(f"OK: {db_path.name} -> {out_path.name}")
        return True
    except Exception as e:
        print(f"ERR: {db_path} - {e}")
        return False

def main():
    if len(sys.argv) >= 3:
        convert_one(sys.argv[1], sys.argv[2], "cj" in sys.argv[1].lower())
        return
    # 批量轉換
    for folder in ["bibles", "cj"]:
        d = DATA_ROOT / folder
        if not d.exists():
            continue
        for db in d.glob("*.db"):
            out = db.with_suffix(".json")
            convert_one(db, out, folder == "cj")

if __name__ == "__main__":
    main()
