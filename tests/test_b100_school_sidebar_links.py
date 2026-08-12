#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""學校管理 · 侧栏 / landing / SSOT 链路与关键页存在性"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIDEBAR_REL = "school_management/sidebar.html"
SIDEBAR_DIR = ROOT / "school_management"

HREF_IN_CONTENT_NAV = re.compile(
    r'<a\b[^>]*\bdata-b100-nav="content"[^>]*\bhref="([^"#]+)"',
    re.I,
)
HREF_BEFORE_NAV = re.compile(
    r'<a\b[^>]*\bhref="([^"#]+)"[^>]*\bdata-b100-nav="content"',
    re.I,
)

# A–E 收生→畢業主線 · 侧栏應全列且檔案存在
FLOW_SIDEBAR_HREFS = [
    "enrollment_brochure.html",
    "portal/index.html",
    "course_completion.html",
    "manage/students_tabs.html",
    "manage/courses_tabs.html",
    "manage/classes_tabs.html",
    "manage/teachers_tabs.html",
    "manage/grades_tabs.html",
    "manage/activities_tabs.html",
    "manage/finance_tabs.html",
    "manage/communication_tabs.html",
    "manage/property_tabs.html",
    "manage/system_tabs.html",
    "manage/module_integration.html",
    "manage/church_link_tabs.html",
    "manage/ai_prompts_tabs.html",
    "_landing/home.html",
    "dashboard.html",
]

FLOW_GROUPS = (
    "A · 招生入學",
    "B · 學籍教務",
    "C · 教學評估",
    "D · 校務財務",
    "E · 整合",
)


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def sidebar_hrefs(html: str) -> list[str]:
    hrefs = HREF_IN_CONTENT_NAV.findall(html) + HREF_BEFORE_NAV.findall(html)
    seen: set[str] = set()
    out: list[str] = []
    for href in hrefs:
        key = href.split("?")[0].split("#")[0]
        if key not in seen:
            seen.add(key)
            out.append(key)
    return out


def test_school_ssot_zones():
    js = read("js/b100_module_nav_ssot.js")
    assert "20260812data" in js
    assert "school:" in js
    assert "school_management/course_completion.html" in js
    assert "school_management/_landing/home.html" in js
    assert 'focus: "graduation"' in js
    assert 'focus: "enrollment"' in js
    assert 'focus: "academic"' in js


def test_school_modes_secondary_nav():
    modes = json.loads(read("config/modes.json"))
    school = next(m for m in modes["modes"] if m["id"] == "school")
    labels = [x.get("labelShort") for x in school["secondaryNav"] if isinstance(x, dict)]
    assert "路線" in labels
    assert "結業" in labels
    graduation = next(x for x in school["secondaryNav"] if x.get("focusZone") == "graduation")
    assert graduation["path"] == "school_management/course_completion.html"


def test_school_sidebar_shell_contract():
    html = read(SIDEBAR_REL)
    assert 'data-b100-module-focus-mode="school"' in html
    assert 'target="contentFrame"' in html
    assert "sidebar_behavior.js" in html
    assert "b100_module_sidebar_focus.js" in html
    assert "b100_module_nav_ssot.js" in html
    assert "b100_sidebar_ssot_rail.js" not in html
    assert "學校管理" in html
    for bad in ('href="#"', "javascript:void(0)"):
        assert bad not in html


def test_school_sidebar_focus_zones():
    html = read(SIDEBAR_REL)
    assert 'data-b100-focus-zone="home"' in html
    for z in ("workbench", "enrollment", "academic", "graduation"):
        assert 'data-b100-focus-zone="' + z + '"' in html
    assert 'data-b100-focus-zone="courses"' not in html


def test_school_sidebar_flow_categories():
    html = read(SIDEBAR_REL)
    for group in FLOW_GROUPS:
        assert group in html, "missing flow group: " + group
    for href in FLOW_SIDEBAR_HREFS:
        assert href in html, "missing flow link: " + href
    assert "data-b100-site-path" in html
    assert "結業登記" in html
    assert "教務工作台" in html


def test_school_sidebar_hrefs_exist():
    html = read(SIDEBAR_REL)
    missing: list[str] = []
    for href in sidebar_hrefs(html):
        if href.startswith(("http:", "https:", "about:")):
            continue
        path = SIDEBAR_DIR / href
        if not path.is_file():
            missing.append(href)
    assert not missing, "missing sidebar targets: " + ", ".join(missing)


def test_school_landing_help_link():
    html = read("school_management/_landing/home.html")
    assert "../../help/site_home.html" in html
    assert "b100_site_path.js" in html
    assert "school_departments_data.js" in html
    assert "A–E 各部門運作說明" in html
    assert "school_departments_data.js" in html


def test_school_landing_departments_ssot():
    js = read("school_management/_landing/school_departments_data.js")
    assert "SCHOOL_DEPARTMENTS" in js
    for gid in ("A", "B", "C", "D", "E"):
        assert 'id: "' + gid + '"' in js or "id: '" + gid + "'" in js
    for wid in ("W0", "W1", "W8"):
        assert wid in js


def test_school_route_map_ae():
    js = read("js/b100_nav_ssot.js")
    assert "A 招生入學" in js
    assert "E 整合" in js
    assert "收生→畢業主線" in js


def test_school_key_pages_exist():
    pages = ["school_management/" + h for h in FLOW_SIDEBAR_HREFS]
    pages.append("school_management/index.html")
    for rel in pages:
        assert (ROOT / rel).is_file(), "missing file: " + rel


if __name__ == "__main__":
    tests = [
        test_school_ssot_zones,
        test_school_modes_secondary_nav,
        test_school_sidebar_shell_contract,
        test_school_sidebar_focus_zones,
        test_school_sidebar_flow_categories,
        test_school_sidebar_hrefs_exist,
        test_school_landing_help_link,
        test_school_landing_departments_ssot,
        test_school_route_map_ae,
        test_school_key_pages_exist,
    ]
    for fn in tests:
        fn()
        print("OK", fn.__name__)
    print("\nAll OK:", len(tests))
