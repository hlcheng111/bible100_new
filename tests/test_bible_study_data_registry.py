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


def test_lazy_chapter_module():
    path = ROOT / "bible_study" / "js" / "bible_lazy_chapter.js"
    assert path.is_file()
    text = path.read_text(encoding="utf-8")
    for frag in ("getBibleChapterRows", "searchBible", "BS_buildParallelSources"):
        assert frag in text, f"bible_lazy_chapter missing {frag}"


def test_parallel_uses_registry():
    html = read("bible_study/parallel_mode_v3.html")
    for frag in ("bible_version_registry.js", "bible_lazy_chapter.js", "getBibleChapterRows", "parallelCanRun"):
        assert frag in html, f"parallel_mode_v3 missing {frag}"


def test_search_uses_registry():
    html = read("bible_study/search_reader.html")
    for frag in ("bible_version_registry.js", "buildSearchOptionsFromRegistry", "BibleEngine.searchBible"):
        assert frag in html, f"search_reader missing {frag}"


def test_comprehensive_local_first():
    html = read("bible_study/comprehensive_exegesis_reader.html")
    assert "queryCommentary('comprehensive'" in html
    assert "CMC 釋經參讀（fallback）" in html
    assert "injectCMC" not in html


def test_prompt_templates_p3_doc():
    doc = ROOT / "bible_study" / "docs" / "PROMPT_TEMPLATES_P3.md"
    assert doc.is_file()
    text = doc.read_text(encoding="utf-8")
    assert "PT-01" in text and "護欄" in text


def test_w3_prompt_builder():
    text = read("bible_study/js/bs_prompt_builder.js")
    for frag in ("BS_PromptBuilder", "mountSelect", "copyPrompt", "GUARDRAILS"):
        assert frag in text, frag


def test_w3_qna_bridge():
    text = read("bible_study/js/bs_qna_bridge.js")
    assert "buildQnaUrl" in text
    assert "wellsofgrace_chen_ot" in text
    exeg = read("bible_study/comprehensive_exegesis_reader.html")
    assert "bsQnaChapterLink" in exeg
    assert "bs_prompt_builder.js" in exeg


def test_qna_deep_link_params():
    qna = read("qna/index.html")
    assert "state.refBook" in qna or "refBook" in qna
    assert '_sp.get("book")' in qna


def test_parallel_minor_langs_registry():
    reg = read("bible_study/js/bible_version_registry.js")
    assert "vi1934" in reg and "id_ayt" in reg
    par = read("bible_study/parallel_mode_v3.html")
    assert "vi1934" in par or "BS_buildParallelSources" in par


def test_site_registry_bs_linked():
    site = read("docs/governance/SITE_PAGE_REGISTRY_V1.md")
    assert "PAGE_MATURITY_BS.md" in site


def test_reader_lazy_convergence():
    r = read("bible_study/reader.html")
    assert "getBibleChapterRows" in r
    assert "bs_study_chrome.js" in r


def test_index_state_subscribe():
    idx = read("bible_study/index.html")
    assert "StudyState.subscribe" in idx
    assert "bs_qna_bridge.js" in idx


def test_w4_topbar_task_labels():
    idx = read("bible_study/index.html")
    for label in ("讀經文", "看註釋", "比譯本", "同章難題", "全部工具", "備課包"):
        assert label in idx, label
    assert "bs_shell_w4.js" in idx
    assert "bs_data_status.js" in idx
    assert 'id="bsDataChip"' in idx
    assert "📡 資料" not in idx or "檢查資料" in idx


def test_w4_lesson_pack():
    pb = read("bible_study/js/bs_prompt_builder.js")
    assert "copyLessonPack" in pb
    assert "buildLessonPack" in pb


def test_w4_cmc_banner():
    ex = read("bible_study/comprehensive_exegesis_reader.html")
    assert "bsCmcBannerHost" in ex
    assert "showCmcBanner" in ex


def test_w4_page_registry():
    reg = read("bible_study/js/bs_page_registry.js")
    assert "BS-01" in reg
    assert "BS_getPageMeta" in reg


def test_w5_languages_hub():
    reg = read("bible_study/js/bible_version_registry.js")
    assert "languagesHub" in reg
    for code in ("cn", "en", "vi", "id", "ch", "ad"):
        assert f"code: '{code}'" in reg
    assert "BS_getLanguagesHub" in reg


def test_w5_fts_module():
    fts = read("bible_study/js/bible_fts.js")
    assert "searchBibleFts" in fts
    search = read("bible_study/search_reader.html")
    assert "bible_fts.js" in search


def test_w5_no_bible_reader_final_in_bs():
    for rel in (
        "bible_study/sidebar.html",
        "bible_study/search_reader.html",
        "bible_study/comprehensive_exegesis_reader.html",
    ):
        assert "bible_reader_final.html" not in read(rel)


def test_w5_reader_redirect_stub():
    stub = ROOT / "data" / "bibles" / "bible_reader_final.html"
    assert stub.is_file()
    html = stub.read_text(encoding="utf-8")
    assert "bible_study/reader.html" in html
    assert "deprecated" in html.lower()


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
