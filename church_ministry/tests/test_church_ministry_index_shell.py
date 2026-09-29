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
    assert "sidebar_church_layout_v1.html" in html
    assert "_landing/gateway.html" in html
    assert "cm-top-wrap" in html or "cmTopWrap" in html
    assert "P-CM-STANDALONE" in html


def test_cm_shell_js_exists():
    for name in (
        "js/cm_shell_paths.js",
        "js/cm_hub_detect.js",
        "js/cm_index_shell.js",
        "js/cm_chrome_i18n_pack.js",
    ):
        assert (CM / name).is_file(), f"missing {name}"
    assert (ROOT / "js" / "b100_chrome_i18n.js").is_file()


def test_cm_shell_paths_contract():
    js = read("church_ministry/js/cm_shell_paths.js")
    for key in ("CmShellPaths", "resolveShellUrl", "inCmStandaloneTree", "church_ministry/"):
        assert key in js
    # 模組內路徑不可一律加 ../（否則 iframe 404）
    assert "CROSS" in js or "bible_study" in js
    assert 'return "../" + url' in js
    assert "return url;" in js


def test_worship_reports_skip_six_section():
    html = read("church_ministry/modules/worship/worship-sunday-desk.html")
    assert 'data-b100-ae-chrome="off"' in html
    assert "主日一桌" in html


def test_index_topbar_human_labels():
    html = read("church_ministry/index.html")
    assert "Standalone 模組殼" not in html
    assert "cmZoneBar" in html
    assert "b100_cm_hub_secondary.css" in html


def test_layout_v1_uses_cm_resolve():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "cm_shell_paths.js" in layout
    assert "cmResolve" in layout
    assert "loadCZoneContentPreferRightPane" in layout
    assert "redirectCZoneToEducationJourneySidebar" not in layout


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
    ssot_c = read("js/cm_c_menu_ssot.js")
    assert 'href="#"' not in layout
    assert "discipleship-training.html" in ssot_c
    assert "cm_sidebar_zone_render.js" in layout
    assert "sb-zone-a" in layout and "sb-zone-f" in layout


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
