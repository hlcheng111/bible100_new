# -*- coding: utf-8 -*-
"""Export bible_reader.db → verses/bN.js for file:// <script src> (Chrome blocks XHR of the .db)."""
from __future__ import annotations

import json
import sqlite3
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "app" / "assets" / "bible" / "bible_reader.db"
OUT = ROOT / "app" / "assets" / "bible" / "verses"
VERSIONS = ("cuv_trust", "kjv", "vi_1934", "id_ayt")


def main() -> None:
    if not DB.is_file():
        raise SystemExit("missing " + str(DB))
    OUT.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(DB))
    cur = con.execute(
        "SELECT version, b, c, v, t FROM verses WHERE version IN (?,?,?,?) ORDER BY b, version, c, v",
        VERSIONS,
    )
    books: dict[int, dict] = defaultdict(lambda: {ver: defaultdict(dict) for ver in VERSIONS})
    for version, b, c, v, t in cur:
        books[int(b)][version][int(c)][int(v)] = t or ""
    con.close()
    for b, pack in books.items():
        out_pack = {}
        for ver in VERSIONS:
            chs = {}
            for c, verses in pack[ver].items():
                max_v = max(verses) if verses else 0
                arr = [""] + [verses.get(i, "") for i in range(1, max_v + 1)]
                chs[str(c)] = arr
            out_pack[ver] = chs
        path = OUT / ("b%s.js" % b)
        body = (
            "window.B100FileVerses=window.B100FileVerses||{};"
            "window.B100FileVerses[%s]=" % b
            + json.dumps(out_pack, ensure_ascii=False, separators=(",", ":"))
            + ";\n"
        )
        path.write_text(body, encoding="utf-8")
        print("wrote", path.name, path.stat().st_size)
    print("books", len(books), "dir", OUT)


if __name__ == "__main__":
    main()
