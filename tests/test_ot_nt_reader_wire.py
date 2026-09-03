# -*- coding: utf-8 -*-
"""BS-H2：OT/NT 66 卷 reader 深鏈靜態驗收。"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BS = ROOT / "bible_study"
CATALOG = BS / "data" / "bible_books_66.json"
MARKER = "<!-- BS-H2-READER-WIRED -->"


def book_landing_path(b: dict) -> Path:
    """catalog category 與資料夾名不一致時（如 nt_history → history）。"""
    folder = b.get("folder")
    if not folder:
        folder = "history" if b["category"] == "nt_history" else b["category"]
    return BS / b["testament"] / folder / f'{b["name"]}.html'


def test_catalog_has_66_books():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert len(data["books"]) == 66
    ids = [b["id"] for b in data["books"]]
    assert ids == list(range(1, 67))


def test_wire_script_exists():
    assert (ROOT / "scripts/wire_ot_nt_to_reader.py").is_file()


def test_all_book_landings_wired():
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    missing = []
    for b in data["books"]:
        t = b["testament"]
        cat = b["category"]
        path = book_landing_path(b)
        if not path.is_file():
            missing.append(str(path.relative_to(ROOT)))
            continue
        text = path.read_text(encoding="utf-8")
        if MARKER not in text:
            missing.append(str(path.relative_to(ROOT)) + " (no marker)")
            continue
        needle = f'reader.html?book={b["id"]}&chapter=1'
        if needle not in text:
            missing.append(str(path.relative_to(ROOT)) + " (no reader link)")
    assert not missing, "unwired books:\n" + "\n".join(missing)


def test_category_indexes_wired():
    cats = [
        ("OT", "law"),
        ("OT", "history"),
        ("OT", "poetry"),
        ("OT", "major_prophets"),
        ("OT", "minor_prophets"),
        ("NT", "gospels"),
        ("NT", "history"),
        ("NT", "paul_letters"),
        ("NT", "general_letters"),
        ("NT", "revelation"),
    ]
    fails = []
    for t, c in cats:
        path = BS / t / c / "index.html"
        if not path.is_file():
            fails.append(str(path))
            continue
        text = path.read_text(encoding="utf-8")
        if MARKER not in text or "reader.html?book=" not in text:
            fails.append(str(path.relative_to(ROOT)))
    assert not fails, "category index not wired: " + ", ".join(fails)


def test_testament_roots_wired():
    for rel in ("bible_study/OT/index.html", "bible_study/NT/index.html"):
        text = (ROOT / rel).read_text(encoding="utf-8")
        assert MARKER in text, rel
        assert "reader.html" in text, rel


def test_sample_chapter_grid():
    """抽樣：創世記 50 章、馬太 28 章。"""
    gen = (BS / "OT" / "law" / "創世記.html").read_text(encoding="utf-8")
    assert "reader.html?book=1&chapter=50" in gen
    mat = (BS / "NT" / "gospels" / "馬太福音.html").read_text(encoding="utf-8")
    assert "reader.html?book=40&chapter=28" in mat


def test_nt_history_index_only_acts():
    """NT history 資料夾 ≠ OT history category，不得混入舊約歷史書。"""
    text = (BS / "NT" / "history" / "index.html").read_text(encoding="utf-8")
    assert "約書亞記" not in text
    assert "reader.html?book=44&chapter=1" in text


def test_law_index_genesis_reader_script():
    law = (BS / "OT" / "law" / "index.html").read_text(encoding="utf-8")
    assert "reader.html?book=1&chapter=" in law
    assert "comprehensive_exegesis_reader.html?book=創世記&chapter=" not in law or "reader.html" in law


if __name__ == "__main__":
    import sys

    n = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                n += 1
    sys.exit(1 if n else 0)
