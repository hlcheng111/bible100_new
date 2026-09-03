# -*- coding: utf-8 -*-
"""教會事工 Chrome + Blurb i18n（認路用四語）靜態檢查。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_shared_i18n_lib_exists():
    js = read("js/b100_chrome_i18n.js")
    for key in (
        "B100ChromeI18n",
        "getLocale",
        "setLocale",
        "appendLocale",
        "b100-locale",
        "zh-Hant",
        "boot",
    ):
        assert key in js, f"missing {key}"


def test_cm_pack_four_locales():
    js = read("church_ministry/js/cm_chrome_i18n_pack.js")
    assert "CmChromeI18nPack" in js
    for loc in ("zh-Hant", "en", "vi", "id"):
        assert f"{loc}:" in js or f"'{loc}'" in js or f'"{loc}"' in js
    for key in (
        "cm.brand",
        "cm.sb.sec.a",
        "cm.sb.sec.f",
        "cm.dash.map.title",
        "cm.forms.note",
    ):
        assert key in js, f"pack missing {key}"


def test_index_wires_lang_pills():
    html = read("church_ministry/index.html")
    assert "b100_chrome_i18n.js" in html
    assert "cm_chrome_i18n_pack.js" in html
    assert 'data-locale="zh-Hant"' in html
    assert 'data-locale="en"' in html
    assert 'data-locale="vi"' in html
    assert 'data-locale="id"' in html
    assert 'data-i18n="cm.brand"' in html
    assert "reloadFramesForLocale" in html


def test_sidebar_three_levels_i18n():
    html = read("church_ministry/sidebar_church_layout_v1.html")
    for key in (
        "cm.sb.a.folder",
        "cm.sb.a.pulpit",
        "cm.sb.a.music",
        "cm.sb.a.sunday",
        "cm.sb.b.guide",
        "cm.sb.b.groups",
        "cm.sb.e.adv",
        "cm.sb.f.memfin",
        "cm.sb.f.finance",
        "cm.sb.meta.plan",
    ):
        assert f'data-i18n="{key}"' in html, f"sidebar missing {key}"
    # L3 summaries should keep arrow span
    assert "cm.sb.a.folder" in html and "arrow" in html


def test_landing_pages_chrome_i18n():
    for rel in (
        "church_ministry/_landing/worship.html",
        "church_ministry/_landing/fellowship.html",
        "church_ministry/_landing/education.html",
    ):
        html = read(rel)
        assert "b100_chrome_i18n.js" in html, rel
        assert "cm_chrome_i18n_pack.js" in html, rel


def test_pack_has_l3_and_landing_keys():
    js = read("church_ministry/js/cm_chrome_i18n_pack.js")
    for key in (
        "cm.sb.a.sunday",
        "cm.sb.b.strategy",
        "cm.sb.f.walk",
        "cm.land.worship.title",
        "cm.land.fellow.title",
        "cm.land.edu.redirect",
    ):
        assert key in js, f"pack missing {key}"


def test_dashboard_map_card():
    html = read("church_ministry/dashboard_church_layout_v1.html")
    assert "cm-module-map" in html
    assert 'data-i18n="cm.dash.map.title"' in html
    assert 'data-i18n="cm.dash.map.a"' in html
    assert 'data-i18n-bridge="1"' in html
    assert "b100_chrome_i18n.js" in html


def test_high_value_pages_chrome_i18n():
    pages = (
        "church_ministry/desks/index.html",
        "church_ministry/dashboard.html",
        "church_ministry/vision_and_plan.html",
        "church_ministry/roadmap-overview.html",
        "church_ministry/tools/volunteer_shift/index.html",
        "church_ministry/modules/support/visitation_index.html",
        "church_ministry/modules/fellowship/index.html",
    )
    for rel in pages:
        html = read(rel)
        assert "b100_chrome_i18n.js" in html, rel
        assert "cm_chrome_i18n_pack.js" in html, rel
        assert "B100CmI18nBoot" in html or "cm_chrome_i18n_boot.js" in html, rel


def test_pack_has_page_and_desk_keys():
    js = read("church_ministry/js/cm_chrome_i18n_pack.js")
    for key in (
        "cm.page.desks.title",
        "cm.page.dash.title",
        "cm.page.vision.title",
        "cm.page.roadmap.title",
        "cm.page.shift.title",
        "cm.page.visit.title",
        "cm.page.fellow.title",
        "cm.desk.overview.title",
        "cm.desk.education.title",
    ):
        assert key in js, f"pack missing {key}"


def test_shell_locale_reload_api():
    js = read("church_ministry/js/cm_index_shell.js")
    assert "reloadFramesForLocale" in js
    assert "withLocale" in js
    assert "b100-locale" in js
    assert "CmIndexShell" in js


def test_pack_file_on_disk():
    assert (CM / "js" / "cm_chrome_i18n_pack.js").is_file()
    assert (ROOT / "js" / "b100_chrome_i18n.js").is_file()


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
