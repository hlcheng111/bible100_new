# -*- coding: utf-8 -*-
"""Static checks for qna/index.html (canonical Q&A entry)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "qna" / "index.html"
V2 = ROOT / "qna" / "qna_index_4layer_V2.htm"
V3 = ROOT / "qna" / "qna_index_4layer_V3.htm"
INDEX_V5 = ROOT / "index_v5.html"
MODES = ROOT / "config" / "modes.json"


def test_qna_index_is_canonical():
    assert INDEX.is_file()
    html = INDEX.read_text(encoding="utf-8")
    assert "引導式目錄 V3" not in html
    assert "SOURCE_CAPABILITY" in html
    assert "qna_nav_config.js" in html
    assert "data/qna_sidebar_bundle.js" in html
    assert 'String(_sp.get("src")' in html
    assert "20260726-v3j" not in html


def test_legacy_redirects():
    for p in (V2, V3):
        t = p.read_text(encoding="utf-8")
        assert "index.html" in t
        assert "SOURCE_CAPABILITY" not in t


def test_index_v5_uses_qna_index():
    v5 = INDEX_V5.read_text(encoding="utf-8")
    assert "qna/index.html" in v5
    assert "qna/qna_index_4layer_V2.htm" not in v5
    modes = MODES.read_text(encoding="utf-8")
    assert "qna-index" in modes
    modules = (ROOT / "config" / "modules.json").read_text(encoding="utf-8")
    assert "qna/index.html" in modules


if __name__ == "__main__":
    test_qna_index_is_canonical()
    test_legacy_redirects()
    test_index_v5_uses_qna_index()
    print("OK test_qna_index")
