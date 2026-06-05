#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
聖經研讀中心 - 純淨 JSON 導出腳本
從現有 .json 或 .db 轉換為標準格式，避免 position 1 解析錯誤
輸出：嚴格 UTF-8、無 BOM、無 JS 包裝
"""
import json
import os
import sqlite3
import sys
from pathlib import Path

# 專案根目錄
ROOT = Path(__file__).resolve().parent.parent
DATA_BIBLES = ROOT / "data" / "bibles"
DATA_CJ = ROOT / "data" / "cj"
OUT_BIBLES = ROOT / "data" / "bibles" / "clean"
OUT_CJ = ROOT / "data" / "cj" / "clean"


def ensure_dir(p):
    p.mkdir(parents=True, exist_ok=True)


def _read_json_robust(path):
    """讀取可能含字面 \\n 或控制字元的損壞 JSON"""
    import re
    with open(path, "rb") as f:
        data = f.read()
    text = data.decode("utf-8", errors="replace")
    # 修正：字面 \n 替換為實際換行（常見損壞模式）
    if "\\n" in text and "\n" not in text[:100]:
        text = text.replace("\\n", "\n").replace("\\t", "\t").replace("\\r", "\r")
    # 移除 JSON 字串內不允許的控制字元 (0x00-0x1F 除 \t \n \r)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', ' ', text)
    return json.loads(text)


def export_bible_from_json(src_path, version_name, out_path):
    """從現有 JSON 轉換為標準格式"""
    raw = _read_json_robust(src_path)

    data = []
    # 支援多種現有結構
    if "Bible" in raw and "data" in raw["Bible"]:
        rows = raw["Bible"]["data"]
    elif "data" in raw:
        rows = raw["data"]
    elif "verses" in raw:
        # 巢狀結構轉扁平
        for book_name, chs in raw["verses"].items():
            bid = raw.get("books", []).index(book_name) + 1 if book_name in raw.get("books", []) else 0
            for ch, verses in chs.items():
                for v, text in verses.items():
                    data.append({"b": bid, "c": int(ch), "v": int(v), "t": text})
        out = {"version": version_name, "data": data}
        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        return len(data)

    for row in rows:
        b = row.get("Book") or row.get("book") or row.get("b")
        c = row.get("Chapter") or row.get("chapter") or row.get("c")
        v = row.get("Verse") or row.get("verse") or row.get("v")
        t = (row.get("Scripture") or row.get("scripture") or row.get("text") or row.get("t") or "").strip()
        if b is not None and c is not None and v is not None:
            data.append({"b": int(b), "c": int(c), "v": int(v), "t": t})

    out = {"version": version_name, "data": data}
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    return len(data)


def export_bible_from_db(db_path, version_name, out_path):
    """從 SQLite 導出為標準 JSON"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 嘗試常見表結構
    tables = ["verses", "Bible", "bible"]
    for tbl in tables:
        try:
            cur.execute(f"SELECT * FROM {tbl} LIMIT 1")
            cols = [d[0] for d in cur.description]
            break
        except sqlite3.OperationalError:
            continue
    else:
        conn.close()
        return 0

    b_col = "book" if "book" in cols else "Book" if "Book" in cols else "b"
    c_col = "chapter" if "chapter" in cols else "Chapter" if "Chapter" in cols else "c"
    v_col = "verse" if "verse" in cols else "Verse" if "Verse" in cols else "v"
    t_col = "text" if "text" in cols else "Scripture" if "Scripture" in cols else "scripture" if "scripture" in cols else "content"

    cur.execute(f"SELECT {b_col}, {c_col}, {v_col}, {t_col} FROM {tbl} ORDER BY {b_col}, {c_col}, {v_col}")
    data = []
    for row in cur.fetchall():
        r = dict(row)
        data.append({
            "b": int(r.get(b_col, 0)),
            "c": int(r.get(c_col, 0)),
            "v": int(r.get(v_col, 0)),
            "t": (r.get(t_col) or "").strip()
        })

    conn.close()
    out = {"version": version_name, "data": data}
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    return len(data)


def export_comprehensive_from_json(src_path, out_path):
    """綜合解讀：轉為標準 items 格式"""
    with open(src_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    items = []
    if "commentaries" in raw:
        for c in raw["commentaries"]:
            items.append({
                "book": int(c.get("book", 0)),
                "chapter": int(c.get("chapter", 0)),
                "title": c.get("title", ""),
                "content": (c.get("content") or "").strip()
            })
    elif "items" in raw:
        items = raw["items"]

    out = {"source": "Comprehensive", "items": items}
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    return len(items)


def main():
    ensure_dir(OUT_BIBLES)
    ensure_dir(OUT_CJ)

    bible_sources = [
        ("KJV.json", "KJV"),
        ("NIV.json", "NIV"),
        ("和合本.json", "和合本"),
        ("信望爱(和合本).json", "信望爱(和合本)"),
        ("吕振中.json", "吕振中"),
    ]

    print("=== 聖經經文導出 ===")
    for fname, version in bible_sources:
        src = DATA_BIBLES / fname
        out = OUT_BIBLES / fname
        if src.exists():
            try:
                n = export_bible_from_json(src, version, out)
                print(f"  ✅ {version}: {n} 節 -> {out.name}")
            except Exception as e:
                print(f"  ❌ {version}: {e}")
        else:
            db_path = DATA_BIBLES / fname.replace(".json", ".db")
            if db_path.exists():
                try:
                    n = export_bible_from_db(db_path, version, out)
                    print(f"  ✅ {version} (from .db): {n} 節")
                except Exception as e:
                    print(f"  ❌ {version}: {e}")
            else:
                print(f"  ⚠️ 跳過 {fname} (檔案不存在)")

    print("\n=== 綜合解讀導出 ===")
    src_cj = DATA_CJ / "综合解读_明文版.json"
    out_cj = OUT_CJ / "Comprehensive.json"
    if src_cj.exists():
        try:
            n = export_comprehensive_from_json(src_cj, out_cj)
            print(f"  ✅ 综合解读: {n} 條 -> {out_cj.name}")
        except Exception as e:
            print(f"  ❌ 综合解读: {e}")
    else:
        print(f"  ⚠️ 综合解读_明文版.json 不存在")

    print("\n完成。純淨 JSON 已輸出至 data/bibles/clean 與 data/cj/clean")


if __name__ == "__main__":
    main()
