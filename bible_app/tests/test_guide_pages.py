#!/usr/bin/env python3
"""招待處說明頁靜態檢查"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "shell"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_guide_files_exist():
    assert (SHELL / "js" / "guide_content.js").is_file()
    assert (SHELL / "js" / "guide_pages.js").is_file()
    howto = read(SHELL / "pages" / "guide-howto.html")
    idea = read(SHELL / "pages" / "guide-idea.html")
    assert "B100GuideContent" in howto
    assert "coach-modules.css" in howto
    assert "bible-read-plain" in idea


def test_no_legacy_jargon():
    howto = read(SHELL / "pages" / "guide-howto.html")
    content = read(SHELL / "js" / "guide_content.js")
    assert "頂行1" not in howto
    assert "A–E" not in content or "A–E：" not in content
    assert "斷更" in content or "Missed a few days" in content
    assert "reliefTitle" in content


def test_four_locales():
    c = read(SHELL / "js" / "guide_content.js")
    for loc in ("zh-Hant", "en", "vi", "id"):
        assert loc in c
    assert "HOWTO" in c and "IDEA" in c


def test_idea_conversational():
    c = read(SHELL / "js" / "guide_content.js")
    assert "排行榜" in c or "leaderboard" in c
    assert "guide-relief" in read(SHELL / "css" / "coach-modules.css")


def test_landing_warm_copy():
    landing = read(SHELL / "js" / "landing_tracks.js")
    assert "歡迎來到" in landing or "Welcome to Bible Journey" in landing
    assert "reassure" in landing
    assert "tagline" in landing
    assert "今日關卡" in landing or "Today" in landing


def test_guide_professor_layer():
    c = read(SHELL / "js" / "guide_content.js")
    assert "bibleStoryTitle" in c
    assert "leaderTitle" in c
    assert "whatTitle" in c


def main() -> int:
    tests = [
        test_guide_files_exist,
        test_no_legacy_jargon,
        test_four_locales,
        test_idea_conversational,
        test_landing_warm_copy,
        test_guide_professor_layer,
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
    print(f"\nAll {len(tests)} guide checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
