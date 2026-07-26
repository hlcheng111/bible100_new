# -*- coding: utf-8 -*-
"""BS-W1：聖經研讀資料註冊表與 BibleEngine 合併靜態檢查。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REG = ROOT / "bible_study" / "js" / "bible_version_registry.js"
ENGINE = ROOT / "bible_study" / "js" / "BibleEngine.js"
LEGACY = ROOT / "bible_study" / "js" / "universal-data-loader.js"
UI = ROOT / "bible_study" / "data_sources.html"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_registry_file_exists():
    assert REG.is_file(), "missing bible_version_registry.js"


def test_registry_has_core_bibles():
    text = read("bible_study/js/bible_version_registry.js")
    for key in ("faith", "kjv", "niv", "vi1934", "id_ayt"):
        assert f"key: '{key}'" in text, f"registry missing bible {key}"
    assert "BS_DATA_REGISTRY" in text


def test_bible_engine_uses_registry():
    text = read("bible_study/js/BibleEngine.js")
    for frag in (
        "BS_DATA_REGISTRY",
        "probeAllSources",
        "getSourceStatus",
        "bible_version_registry",
        "initialize",
        "queryBible",
        "queryCommentary",
    ):
        assert frag in text, f"BibleEngine missing {frag}"


def test_universal_loader_is_thin_shim():
    text = read("bible_study/js/universal-data-loader.js")
    assert "@deprecated" in text.lower() or "deprecated" in text.lower()
    assert len(text.splitlines()) < 25, "universal-data-loader should be thin shim"
    assert "class UniversalDataLoader" not in text


def test_data_sources_page():
    assert UI.is_file()
    html = read("bible_study/data_sources.html")
    assert "bible_version_registry.js" in html
    assert "BibleEngine.js" in html
    assert "probeAllSources" in html


def test_sidebar_links_data_sources():
    sb = read("bible_study/sidebar.html")
    assert "data_sources.html" in sb


def test_modules_json_index_entry():
    mods = read("config/modules.json")
    assert "bible_study/index.html" in mods


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
