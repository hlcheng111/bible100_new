# -*- coding: utf-8 -*-
"""BS-H4：HTTP 抽樣 + 資料層 registry 收口靜態／輕量驗收。"""
from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BS = ROOT / "bible_study"
BASE = "http://127.0.0.1:8080"


def fetch(path: str) -> tuple[int, str]:
    url = BASE + path
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as e:
        return 0, str(e)


def test_h4_server_reachable():
    code, _ = fetch("/bible_study/reader.html")
    assert code == 200, "start: python -m http.server 8080"


def test_h2_genesis_landing_reader_links():
    code, html = fetch("/bible_study/OT/law/%E5%89%B5%E4%B8%96%E8%A8%98.html")
    assert code == 200
    assert "<!-- BS-H2-READER-WIRED -->" in html
    assert "reader.html?book=1&chapter=50" in html


def test_reader_deep_link_page():
    code, html = fetch("/bible_study/reader.html?book=1&chapter=1")
    assert code == 200
    assert "getBibleChapterRows" in html
    assert "bs_study_chrome.js" in html


def test_parallel_lists_minor_langs():
    """版本清單由 registry 動態產生；頁面須掛 registry 與動態建構函式。"""
    code, html = fetch("/bible_study/parallel_mode_v3.html")
    assert code == 200
    assert "bible_version_registry.js" in html
    assert "getRegistryParallelBibles" in html or "BS_buildParallelSources" in html
    reg = (BS / "js" / "bible_version_registry.js").read_text(encoding="utf-8")
    assert "vi1934" in reg and "id_ayt" in reg


def test_dictionary_uses_registry_loader():
    html = (BS / "dictionary_reader.html").read_text(encoding="utf-8")
    assert "bs_registry_reader.js" in html
    assert "BS_loadRegistryResource('dictionaries', 'bible_dict')" in html
    assert "../data/cd/圣经语汇词典.json" not in html


def test_crossref_uses_registry_keys():
    html = (BS / "crossref_reader.html").read_text(encoding="utf-8")
    assert "bs_registry_reader.js" in html
    assert "faith_crossref" in html
    assert "cuv_crossref" in html
    assert "xinwangai" not in html


def test_registry_dictionary_path():
    reg = (BS / "js" / "bible_version_registry.js").read_text(encoding="utf-8")
    assert "data/cd/圣经语汇词典.json" in reg
    assert "BS_getRegistryEntry" in reg


def test_registry_reader_helper_exists():
    assert (BS / "js" / "bs_registry_reader.js").is_file()
    text = (BS / "js" / "bs_registry_reader.js").read_text(encoding="utf-8")
    assert "BS_loadRegistryResource" in text


def test_bible_engine_unescape_json():
    text = (BS / "js" / "BibleEngine.js").read_text(encoding="utf-8")
    assert "_unescapeJsonText" in text


def test_minor_bible_json_files_on_disk():
    for rel in (
        "data/bibles/clean/越南聖經1934.json",
        "data/bibles/clean/印尼AYT.json",
        "data/cd/圣经语汇词典.json",
        "data/bibles/信望爱串珠.json",
    ):
        p = ROOT / rel
        assert p.is_file(), f"missing {rel}"
        assert p.stat().st_size > 1000


def test_vi1934_json_parseable():
    p = ROOT / "data/bibles/clean/越南聖經1934.json"
    data = json.loads(p.read_text(encoding="utf-8"))
    assert "version" in data or "verses" in data or isinstance(data, dict)


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
