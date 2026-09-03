"""Task A：四語閱讀器核心統一 — 靜態檢查"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "shell"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_shared_loaded_before_links():
    pages = [
        SHELL / "pages" / "bible66.html",
        SHELL / "pages" / "track-30day.html",
        SHELL / "pages" / "track-golden.html",
        SHELL / "pages" / "track-theme.html",
    ]
    for page in pages:
        html = read(page)
        shared_pos = html.find("bible_reader_shared.js")
        links_pos = html.find("page_links.js")
        assert shared_pos >= 0, f"{page.name}: missing bible_reader_shared.js"
        assert links_pos >= 0, f"{page.name}: missing page_links.js"
        assert shared_pos < links_pos, f"{page.name}: shared must load before page_links"


def test_bible66_uses_reader_core_not_legacy():
    html = read(SHELL / "pages" / "bible66.html")
    assert "bible_reader_core.js" in html
    assert "bible66.js" not in html
    assert "BibleReaderCore" in html


def test_page_links_supports_quad():
    src = read(SHELL / "js" / "page_links.js")
    assert "quad" in src
    assert "B100BibleReader" in src


def test_shared_exports_api():
    src = read(SHELL / "js" / "bible_reader_shared.js")
    for token in (
        "B100BibleReader",
        "buildReadUrl",
        "getViewMode",
        "setViewMode",
        "DEFAULT_VIEW",
        "cuv_trust",
        "vi_1934",
        "id_ayt",
    ):
        assert token in src, f"missing {token} in bible_reader_shared.js"


def test_shell_nav_default_dual_with_quad_available():
    src = read(SHELL / "js" / "shell_nav.js")
    shared = read(SHELL / "js" / "bible_reader_shared.js")
    assert re.search(r"bibleView:\s*'dual'", src)
    assert "var DEFAULT_VIEW = 'dual'" in shared
    assert "bible100-shell-bible-view" in src
    assert "state.bibleView || 'dual'" in src
    assert "quad" in shared


def test_tracks_use_page_links():
    for name in ("track_30day.js", "track_golden.js", "track_theme.js"):
        src = read(SHELL / "js" / name)
        assert "B100PageLinks.bibleReadUrl" in src, f"{name} must use B100PageLinks.bibleReadUrl"


def test_reader_core_view_switcher():
    src = read(SHELL / "js" / "bible_reader_core.js")
    assert "br-view-modes" in src
    assert "setViewMode" in src
    assert "getBibleVersions" in src


def main() -> int:
    tests = [
        test_shared_loaded_before_links,
        test_bible66_uses_reader_core_not_legacy,
        test_page_links_supports_quad,
        test_shared_exports_api,
        test_shell_nav_default_dual_with_quad_available,
        test_tracks_use_page_links,
        test_reader_core_view_switcher,
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
