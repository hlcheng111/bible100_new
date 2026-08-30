# -*- coding: utf-8 -*-
"""逐字對照：V6 外觀、無 Key 直譯、不提示 bat；導覽掛點不變。"""
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
        "js/interlinear_app.js",
    ):
        assert (IG / rel).is_file(), rel


def test_v6_ui_no_key_no_bat():
    html = (IG / "index.html").read_text(encoding="utf-8")
    css = (IG / "interlinear.css").read_text(encoding="utf-8")
    app = (IG / "js/interlinear_app.js").read_text(encoding="utf-8")
    look = (IG / "js/verse_lookup.js").read_text(encoding="utf-8")
    seg = (IG / "js/segment_vi.js").read_text(encoding="utf-8")

    assert "步驟一" in html and "步驟二" in html and "步驟三" in html
    assert 'id="targetLangSelect"' in html
    assert 'id="analysisLangSelect"' in html
    assert 'id="analysisDirection"' in html
    assert "無需 API Key" in html or "無 API Key" in html
    assert "translate_engine.js" not in html
    assert "btnSaveKey" not in html
    assert "Gemini" not in html
    assert "MyMemory" not in html
    assert ".bat" not in html.lower()
    assert "請打開" not in html
    assert "經庫未載入" not in html
    assert "經庫未載入" not in app
    assert "Bible100.bat" not in look
    assert "請打開" not in look
    assert "literalDraft" in seg
    assert "literal-draft" in app
    assert "lookupKey(transZh) === Seg.lookupKey(line)" in app
    assert "絕不把原文" in html
    assert "刻意不做" in html
    assert "--zone-in: #EFF6FF" in css
    assert "--zone-read: #F0FDFA" in css
    assert "--zone-test: #FFFBEB" in css

    lex = (IG / "js/lexicon_vi.js").read_text(encoding="utf-8")
    assert "LEXICON_ID" in lex
    assert "SAMPLE_TEXT_ID" in lex

    scope = (ROOT / "bible_study/docs/INTERLINEAR_SCOPE_V1.md").read_text(encoding="utf-8")
    assert "泰／緬／日／韓" in scope
    assert "只做越南文、印尼文" in scope
    assert "不上雲" in scope
    assert "提示 bat" in scope


def test_nav_wired():
    modes = (ROOT / "config" / "modes.json").read_text(encoding="utf-8")
    assert "bible_study/interlinear/index.html" in modes
    sidebar = (ROOT / "bible_study" / "sidebar.html").read_text(encoding="utf-8")
    assert 'href="interlinear/index.html"' in sidebar
    assert 'data-b100-nav="content"' in sidebar
    ssot = (ROOT / "js" / "b100_module_nav_ssot.js").read_text(encoding="utf-8")
    assert "bible_study/interlinear/index.html" in ssot


if __name__ == "__main__":
    test_interlinear_files_exist()
    test_v6_ui_no_key_no_bat()
    test_nav_wired()
    print("OK")
