# -*- coding: utf-8 -*-
"""file:// 跑道：不喊 bat、不丟假 8080、iframe 不塞雲端。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "bible_app" / "shell" / "js"


def test_no_bat_or_fake_8080_in_reader_ui():
    core = (SHELL / "bible_reader_core.js").read_text(encoding="utf-8")
    boot = (SHELL / "shell_boot.js").read_text(encoding="utf-8")
    mode = (SHELL / "runtime_mode.js").read_text(encoding="utf-8")
    b66 = (ROOT / "bible_app" / "shell" / "pages" / "bible66.html").read_text(encoding="utf-8")
    for t in (core, boot, mode, b66):
        assert "打开圣经跑道.bat" not in t
        assert "打開聖經跑道.bat" not in t
        assert "Bible100一键开启" not in t
        assert "127.0.0.1:8080/index_v5.html" not in t
    assert "showOfflineBanner" not in boot
    assert 'target="_blank"' in core
    assert "b100PickDb" in core
    assert "read66.html" in (SHELL / "shell_nav.js").read_text(encoding="utf-8")
    html = (ROOT / "bible_app" / "app" / "assets" / "bible" / "read66.html").read_text(encoding="utf-8")
    assert "../../../shell/pages/track-plan1y.html" in html
    assert 'href="../../shell/' not in html
    assert "../../../shell/js/bible_reader_core.js" in html
    assert "回跑道選其他關" in core
    assert "inBibleAssets" in (SHELL / "page_nav_bar.js").read_text(encoding="utf-8")
    bridge = (SHELL / "live_db_bridge.js").read_text(encoding="utf-8")
    i = bridge.find("function afterLiveProbe")
    assert i >= 0
    chunk = bridge[i : i + 280]
    assert "if (fn) fn()" in chunk
    assert "probe(2)" not in chunk
    assert (ROOT / "bible_app" / "app" / "assets" / "bible" / "verses" / "b40.js").is_file()


def test_no_iframe_cloud_embed():
    nav = (SHELL / "shell_nav.js").read_text(encoding="utf-8")
    i = nav.find("function setFrame")
    assert i >= 0
    assert "lovestoblog" not in nav[i : i + 900]
    bridge = (SHELL / "live_db_bridge.js").read_text(encoding="utf-8")
    j = bridge.find("function ensureReaderPage")
    assert j >= 0
    assert "location.replace" not in bridge[j : j + 200]


def test_multilang_file_switch_and_collapsed_cats():
    html = (ROOT / "bible_app" / "shell" / "pages" / "reader-multilang.html").read_text(
        encoding="utf-8"
    )
    ml = (SHELL / "reader_multilang.js").read_text(encoding="utf-8")
    core = (SHELL / "bible_reader_core.js").read_text(encoding="utf-8")
    css = (ROOT / "bible_app" / "shell" / "css" / "reader-multilang.css").read_text(
        encoding="utf-8"
    )
    assert "data_bundle.js" in html
    assert "ensureFileBook" in core
    assert "ensureBookData" in ml
    assert "selectBook" in ml
    assert "ml-drawer" in ml
    assert "mlDrawerBtn" in ml
    assert "更多" in ml
    assert "[|]" not in ml
    assert "譯本" in ml
    assert "placeLangPills" in ml
    assert "mlLangDrawerSlot" in ml
    assert "max-width: none" in css
    assert "ml-rail" in ml
    assert "章 " in ml
    assert ".ml-drawer-btn" in css
    assert ".ml-rail" in css
    # 跑道路徑不可被 ensureFileBook 改掉
    assert "if (location.protocol !== 'file:')" in core
    i = core.find("BibleReaderCore.prototype.go")
    assert i >= 0
    assert "ensureFileBook" not in core[i : i + 280]
    import json
    books = json.loads(
        (ROOT / "bible_app" / "shell" / "data" / "books.json").read_text(encoding="utf-8")
    )
    assert len(books.get("books") or []) == 66
    verses = ROOT / "bible_app" / "app" / "assets" / "bible" / "verses"
    assert (verses / "b1.js").is_file()
    assert (verses / "b40.js").is_file()
    assert (verses / "b66.js").is_file()
    hub = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "☰ 側欄" in hub
    assert "body.ui-locale-en .sub-btn.sub-btn--compact .t-en" in hub
    assert "body.ui-locale-vi .sub-btn.sub-btn--compact .t-en" not in hub


if __name__ == "__main__":
    test_no_bat_or_fake_8080_in_reader_ui()
    test_no_iframe_cloud_embed()
    test_multilang_file_switch_and_collapsed_cats()
    print("OK")
