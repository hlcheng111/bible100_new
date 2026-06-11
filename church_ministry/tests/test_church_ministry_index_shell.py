# -*- coding: utf-8 -*-
"""church_ministry/index.html 獨立模組殼與 Hub 契約。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_cm_index_not_redirect():
    html = read("church_ministry/index.html")
    assert "guide_crm_journey_hub.html" not in html.split("<!--")[0]
    assert "location.replace" not in html
    assert 'http-equiv="refresh"' not in html
    assert "sidebarFrame" in html
    assert "contentFrame" in html
    assert "dashboard_church_layout_v1.html" in html
    assert "sidebar_church_layout_v1.html" in html
    assert "P-CM-STANDALONE" in html


def test_cm_shell_js_exists():
    for name in (
        "js/cm_shell_paths.js",
        "js/cm_hub_detect.js",
        "js/cm_index_shell.js",
    ):
        assert (CM / name).is_file(), f"missing {name}"


def test_cm_shell_paths_contract():
    js = read("church_ministry/js/cm_shell_paths.js")
    for key in ("CmShellPaths", "resolveShellUrl", "inCmStandaloneTree", "church_ministry/"):
        assert key in js


def test_layout_v1_uses_cm_resolve():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "cm_shell_paths.js" in layout
    assert "cmResolve" in layout
    assert "redirectCZoneToEducationJourneySidebar" in layout


def test_education_integrated_hub_detect():
    html = read("church_ministry/modules/education/education-integrated.html")
    css = read("church_ministry/css/education_integrated_shell.css")
    assert "cm_hub_detect.js" in html
    assert "b100-hub-embedded" in css


def test_shell_nav_resolves_module_iframe_src():
    js = read("js/shell_nav.js")
    for key in ("resolveIframeSrc", "bible100ResolveIframeSrc", "shellWin"):
        assert key in js


def test_c_sidebar_no_nested_cm_index_link():
    side = read("church_ministry/sidebar_c_education_journey.html")
    assert "index.html?focus=c" not in side


def test_layout_v1_loads_sidebar_behavior():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "sidebar_behavior.js" in layout


def test_layout_v1_shell_nav_avoids_hash_base_trap():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert 'href="#"' not in layout
    assert "discipleship-training.html" in layout
    assert "bible_study/sidebar.html" in layout


if __name__ == "__main__":
    import sys

    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                fails += 1
    sys.exit(1 if fails else 0)
