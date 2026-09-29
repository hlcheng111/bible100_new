"""Task D/E：PC 分欄閱讀布局與文案清理 — 靜態檢查"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "shell"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_pc_split_layout_markup():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    html = read(SHELL / "pages" / "bible66.html")
    assert "br-nav" in core
    # 欄標題與經文需在同一捲動容器，標題 sticky 才能與四語對齊
    assert "br-read__head" not in core
    assert ".br-cols {\n  position: sticky" in css
    assert "bible-page-shell" in html
    assert "bible-page-shell" in css
    assert "@media (min-width: 960px)" in css
    assert ".br-bookbar" in css


def test_no_lang_note_leftover():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "br-lang-note" not in core
    assert "br-lang-note" not in css
    assert "bible_load_fail_short" in core


def test_reader_has_track_nodes():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    html = read(SHELL / "pages" / "bible66.html")
    assert "B100TrackRegistry.loadTrack" in core
    assert "renderTrackNodes" in core
    assert "brTrackNodes" in core
    assert "br-track-node" in css
    assert "track_registry.js" in html


def test_reader_book_groups_and_mobile_chips():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "br-book-groups" in core
    assert "COMMON_BOOK_IDS" in core
    assert "data-book-group=\"common\"" in core
    assert ".br-book-groups" in css
    assert "@media (max-width: 720px)" in css
    assert "overflow-x: auto" in css


def test_deadzone_breakpoint_stopgap():
    """721–959px 三不管地帶必須有專屬斷點，避免書卷擠成直列"""
    css = read(SHELL / "css" / "track-creative.css")
    assert "@media (min-width: 721px) and (max-width: 959px)" in css


def test_inline_bookbar():
    """書卷選單內嵌於工具列下方，免彈窗；無重複舊約/新約過濾列"""
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    links = read(SHELL / "js" / "page_links.js")
    assert "br-bookbar" in core
    assert "br-book-chip" in core
    assert "br-filters" not in core
    assert "br-f " not in core
    assert "br-bookpicker" not in core
    assert "openBookPicker" not in core
    assert "trackListUrl" in links
    assert "brContextBar" in core
    assert "br-back" in css
    assert ".br-book-chip" in css
    assert "br-bookpicker" not in css


def test_chapter_select_not_grid():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "brChapterSelect" in core
    assert "br-chapter-select" in css
    assert "#brChapters" not in core


def test_quad_adaptive_columns():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "br-wrap--quad-2" in core or "br-wrap--quad-" in css
    assert "withData.length" in core


def test_book_panel_collapsed():
    """書卷選單預設摺疊，點「選書卷」才展開"""
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "brBookToggle" in core
    assert "brBookPanel" in core
    assert "toggleBookPanel" in core
    assert "closeBookPanel" in core
    assert ".br-bookbar-toggle" in css
    assert ".br-bookbar__panel[hidden]" in css


def test_track_progress_bar():
    """跑道閱讀區上方有進度條 + 可點擊節點 + 上下關切換"""
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    prog = read(SHELL / "js" / "read_progress.js")
    assert "brTrackBar" in core
    assert "updateTrackBar" in core
    assert "goTrackIndex" in core
    assert "brTrackBarSegments" in core
    assert "brTrackPrev" in core
    assert "brTrackNext" in core
    assert "trackProgressId" in core
    assert "refreshProgressCelebrate" in core
    assert ".br-trackbar__seg" in css
    assert "bible100-progress" in prog


def test_read_done_track_urls():
    """read-done 返回連結須帶齊 track/day/theme 參數，避免白屏"""
    html = read(SHELL / "pages" / "read-done.html")
    assert "buildReaderQuery" in html
    assert "buildTrackQuery" in html
    assert "focus=" in html
    assert "frame_sync.js" in html


def test_verse_tag_cleanup():
    """e-Sword 標記（FR/FI/RF 等）須從經文文字剝除"""
    core = read(SHELL / "js" / "bible_reader_core.js")
    assert "cleanVerseText" in core
    assert "<RF>" in core or "<Rf>" in core or "/?[" in core
    assert "<FR>" not in core or "replace" in core


def test_theme_page_loads_progress():
    """主題跑道須載入 read_progress.js（B100Progress）"""
    html = read(SHELL / "pages" / "track-theme.html")
    assert "read_progress.js" in html
    assert html.index("read_progress.js") < html.index("track_registry.js")
    assert html.index("read_progress.js") < html.index("track_theme.js")


def test_preview_banner_single_line():
    rt = read(SHELL / "js" / "runtime_mode.js")
    core = read(SHELL / "js" / "bible_reader_core.js")
    assert "previewBannerCopy" in rt
    assert "showReaderPreviewBanner" in rt
    assert "br-preview-bar" in core
    assert "br-demo-panel__cols" not in core


def test_full_mode_hides_preview_noise():
    core = read(SHELL / "js" / "bible_reader_core.js")
    css = read(SHELL / "css" / "track-creative.css")
    assert "br-wrap--full" in core
    assert "br-sample-label" not in core
    assert "br-demo-panel" not in css
    assert "br-sample-label" not in css
    html = read(SHELL / "pages" / "bible66.html")
    assert "fileNote" not in html
    boot = read(SHELL / "js" / "shell_boot.js")
    assert "live-ok-pill" not in boot
    assert "live-ok-pill" not in read(SHELL / "css" / "shell.css")


def test_plain_text_flow_reader():
    """經文改為文字流排版，書卷/章節用下拉選單"""
    core = read(SHELL / "js" / "bible_reader_core.js")
    plain = read(SHELL / "css" / "bible-reader-plain.css")
    html = read(SHELL / "pages" / "bible66.html")
    assert "br-wrap--flow" in core
    assert "br-verse-block" in core
    assert "appendFlowVerseLine" in core
    assert "brBookSelect" in core
    assert "br-picker-row" in core
    assert ".br-verse-line" in plain
    assert "bible-read-plain" in html
    assert "bible-reader-plain.css" in html


def test_phase2_pending_shell():
    html = read(ROOT / "index.html")
    css = read(SHELL / "css" / "shell.css")
    nav = read(SHELL / "js" / "shell_nav.js")
    boot = read(SHELL / "js" / "shell_boot.js")
    shared = read(SHELL / "js" / "bible_reader_shared.js")
    assert "filePreviewBanner" in html
    assert "file-preview-banner" in css
    assert "showFilePreviewBanner" in boot
    assert "track-btn__label" in html
    assert "getEffectiveViewMode" in shared
    assert "br-view-more" in read(SHELL / "js" / "bible_reader_core.js")
    assert "ZONE_PAGES" in nav
    assert "pages/today.html" in nav
    assert "btnBible100" in html


def test_theme_portal_active():
    css = read(SHELL / "css" / "track-creative.css")
    js = read(SHELL / "js" / "track_theme.js")
    assert ".theme-portal.active" in css
    assert " active" in js


def test_nav_labels_i18n():
    loc = read(SHELL / "js" / "page_locale.js")
    assert "bible_nav_books" in loc
    assert "bible_quad_hint" in loc


def test_file_preview_copy_not_retry_later():
    loc = read(SHELL / "js" / "page_locale.js")
    core = read(SHELL / "js" / "bible_reader_core.js")
    rt = read(SHELL / "js" / "runtime_mode.js")
    for key in ("bible_preview_empty", "bible_preview_active", "bible_preview_banner_line"):
        assert key in loc
    assert "sampleEmptyMessage" in core
    assert "isFilePreviewMode" in core
    assert "booksForPicker" in core
    assert "colKeyToLangClass" in core
    assert "br-lang-zh" in read(SHELL / "css" / "bible-reader-plain.css")
    assert "return isFilePreview();" in rt


def test_coach_back_to_landing():
    back = read(SHELL / "js" / "coach_landing_back.js")
    assert "landing.html" in back
    assert "back_landing" in back
    for page in ("pacing.html", "ai-qna.html", "ai-tutor.html", "today.html"):
        html = read(SHELL / "pages" / page)
        assert "coach_landing_back.js" in html


def main() -> int:
    tests = [
        test_pc_split_layout_markup,
        test_no_lang_note_leftover,
        test_reader_has_track_nodes,
        test_reader_book_groups_and_mobile_chips,
        test_deadzone_breakpoint_stopgap,
        test_inline_bookbar,
        test_chapter_select_not_grid,
        test_quad_adaptive_columns,
        test_book_panel_collapsed,
        test_track_progress_bar,
        test_read_done_track_urls,
        test_verse_tag_cleanup,
        test_theme_page_loads_progress,
        test_preview_banner_single_line,
        test_full_mode_hides_preview_noise,
        test_plain_text_flow_reader,
        test_phase2_pending_shell,
        test_theme_portal_active,
        test_nav_labels_i18n,
        test_file_preview_copy_not_retry_later,
        test_coach_back_to_landing,
    ]
    failed = 0
    for fn in tests:
        try:
            fn()
            print(f"OK  {fn.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL {fn.__name__}: {e}")
    if failed:
        print(f"\n{failed} failed")
        return 1
    print(f"\nAll {len(tests)} checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
