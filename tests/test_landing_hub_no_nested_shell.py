# -*- coding: utf-8 -*-
"""Hub 右欄不塞模組殼；研讀 landing「主頁」不指向 bible_study/index.html。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_hub_track_is_landing_not_shell():
    modes = (ROOT / "config" / "modes.json").read_text(encoding="utf-8")
    ssot = (ROOT / "js" / "b100_module_nav_ssot.js").read_text(encoding="utf-8")
    sidebar = (ROOT / "bible_study" / "sidebar.html").read_text(encoding="utf-8")
    assert '"path": "bible_app/shell/pages/landing.html"' in modes
    assert 'content: "bible_app/shell/pages/landing.html"' in ssot
    assert 'content: "bible_app/shell/pages/reader-multilang.html"' in ssot
    assert 'href="../bible_app/shell/pages/landing.html"' in sidebar
    assert 'href="../bible_app/shell/index.html"' not in sidebar


def test_module_shell_forbidden_recovers_track():
    ssot = (ROOT / "js" / "b100_module_nav_ssot.js").read_text(encoding="utf-8")
    assert r"bible_app\/shell\/index\.html" in ssot
    assert 'return shellPairForFocus("study", "track")' in ssot


def test_study_landing_home_not_module_index():
    landing = ROOT / "bible_study" / "_landing"
    for name in (
        "geography_history.html",
        "tools.html",
        "versions.html",
        "dictionaries_landing.html",
        "commentaries_landing.html",
        "original_text_landing.html",
    ):
        t = (landing / name).read_text(encoding="utf-8")
        assert 'href="../index.html"' not in t, name
        assert "home.html" in t, name


def test_embedded_track_matches_modes():
    emb = (ROOT / "js" / "config-embedded.js").read_text(encoding="utf-8")
    assert "bible_app/shell/pages/landing.html" in emb


if __name__ == "__main__":
    test_hub_track_is_landing_not_shell()
    test_module_shell_forbidden_recovers_track()
    test_study_landing_home_not_module_index()
    test_embedded_track_matches_modes()
    print("OK")
