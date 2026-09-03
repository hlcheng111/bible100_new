#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""聖經研讀 · 侧栏 / landing / SSOT 链路与关键页存在性"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_site_path_helper():
    js = read("js/b100_site_path.js")
    assert "20260807a" in js
    assert "B100_siteHref" in js
    assert "bible100_new" in js


def test_study_modes_tools_zone():
    modes = json.loads(read("config/modes.json"))
    study = next(m for m in modes["modes"] if m["id"] == "study")
    labels = [x.get("labelShort") for x in study["secondaryNav"] if isinstance(x, dict)]
    assert "工具" in labels
    assert "路線" in labels
    assert "版本" in labels
    tools = next(x for x in study["secondaryNav"] if x.get("focusZone") == "tools")
    assert tools["path"] == "bible_study/_landing/tools.html"


def test_module_nav_tools_content():
    js = read("js/b100_module_nav_ssot.js")
    assert "20260807a" in js
    assert "_landing/tools.html" in js


def test_sidebar_core_paths():
    html = read("bible_study/sidebar.html")
    for p in (
        "parallel_mode_v3.html",
        "_landing/geography_history.html",
        "comprehensive_exegesis_reader.html",
        "Geo &amp; History",
    ):
        assert p in html, "missing path label: " + p
    for removed in (
        "data_sources.html",
        "dictionary_reader.html",
        "crossref_reader.html",
        "search_reader.html",
    ):
        assert removed not in html, "removed shortcut still in sidebar: " + removed


def test_landing_help_link():
    for rel in (
        "bible_study/_landing/home.html",
        "school_management/_landing/home.html",
        "ai_tools/_landing/home.html",
    ):
        html = read(rel)
        assert "../../help/site_home.html" in html, rel
        assert "b100_site_path.js" in html, rel


def test_key_pages_exist():
    pages = [
        "bible_study/parallel_mode_v3.html",
        "bible_study/timeline_viewer.html",
        "bible_study/geo_external_frame.html",
        "bible_study/_landing/home.html",
        "bible_study/_landing/tools.html",
        "bible_study/_landing/geography_history.html",
        "bible_study/_landing/geography_history_data.js",
        "bible_study/external_bible_reader.html",
        "bible_study/comprehensive_exegesis_reader.html",
        "bible_study/versions/kjv.html",
        "bible_study/versions/niv.html",
    ]
    for rel in pages:
        assert (ROOT / rel).is_file(), "missing file: " + rel


def test_geography_data_external_urls():
    js = read("bible_study/_landing/geography_history_data.js")
    urls = re.findall(r"url:\s*'([^']+)'", js)
    assert any("bibleeveryone.com" in u for u in urls)
    assert any(u == "timeline_viewer.html" for u in urls)


def test_nav_link_attrs_uses_site_href():
    js = read("js/b100_nav_ssot.js")
    assert "B100_siteHref" in js


if __name__ == "__main__":
    tests = [
        test_site_path_helper,
        test_study_modes_tools_zone,
        test_module_nav_tools_content,
        test_sidebar_core_paths,
        test_landing_help_link,
        test_key_pages_exist,
        test_geography_data_external_urls,
        test_nav_link_attrs_uses_site_href,
    ]
    for fn in tests:
        fn()
        print("OK", fn.__name__)
    print("\nAll OK:", len(tests))
