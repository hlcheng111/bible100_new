# -*- coding: utf-8 -*-
"""越文逐字對照：任意句翻譯路徑存在，且不以原文冒充譯文。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IG = ROOT / "bible_study" / "interlinear"


def test_interlinear_files_exist():
    for rel in (
        "index.html",
        "interlinear.css",
        "js/lexicon_vi.js",
        "js/segment_vi.js",
        "js/verse_lookup.js",
        "js/translate_engine.js",
        "js/interlinear_app.js",
    ):
        assert (IG / rel).is_file(), rel


def test_no_original_as_translation():
    app = (IG / "js/interlinear_app.js").read_text(encoding="utf-8")
    tr = (IG / "js/translate_engine.js").read_text(encoding="utf-8")
    html = (IG / "index.html").read_text(encoding="utf-8")
    assert "transZh: overlay && overlay.translationZh ? overlay.translationZh : null" in app
    assert "looksLikeSourceEcho" in tr
    assert "translateFreeText" in tr
    assert "mymemory.translated.net" in tr
    assert "generativelanguage.googleapis.com" in tr
    assert "絕不把原文" in html
    assert "先不上雲" in html
    assert "刻意不做" in html
    lex = (IG / "js/lexicon_vi.js").read_text(encoding="utf-8")
    assert "LEXICON_ID" in lex
    assert "SAMPLE_TEXT_ID" in lex
    tr = (IG / "js/translate_engine.js").read_text(encoding="utf-8")
    assert "id|zh-TW" in tr or "src + '|zh-TW'" in tr
    scope = (ROOT / "bible_study/docs/INTERLINEAR_SCOPE_V1.md").read_text(encoding="utf-8")
    assert "泰／緬／日／韓" in scope
    assert "只做越南文、印尼文" in scope


def test_nav_wired():
    modes = (ROOT / "config" / "modes.json").read_text(encoding="utf-8")
    assert "bible_study/interlinear/index.html" in modes
    sidebar = (ROOT / "bible_study" / "sidebar.html").read_text(encoding="utf-8")
    assert 'href="interlinear/index.html"' in sidebar
    ssot = (ROOT / "js" / "b100_module_nav_ssot.js").read_text(encoding="utf-8")
    assert "bible_study/interlinear/index.html" in ssot


if __name__ == "__main__":
    test_interlinear_files_exist()
    test_no_original_as_translation()
    test_nav_wired()
    print("OK")
