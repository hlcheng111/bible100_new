# -*- coding: utf-8 -*-
"""Gateway + A–E／G／H 羅盤 landing · 殼與導覽接線。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_compass_ssot_and_pages():
    ssot = read("church_ministry/js/cm_compass_zones_ssot.js")
    assert "CmCompassZones" in ssot
    assert 'layout: "mosaic"' in ssot
    for layout in ("timeline", "loop", "tabs", "funnel", "net", "board", "steps"):
        assert 'layout: "%s"' % layout in ssot, layout
    # no shared four-door compass / no demo dept / no double-shell dashboard
    assert "四向羅盤" not in ssot
    assert "dept_C_discipleship" not in ssot
    assert "dept_A_worship" not in ssot
    assert "dept_B_pastoral" not in ssot
    assert "dashboard_church_layout_v1.html" not in ssot
    assert "dashboard_church_layout_v1_content.html" in ssot
    assert (ROOT / "church_ministry/js/cm_zone_palette_ssot.js").is_file()
    for z in ("a", "b", "c", "d", "e", "g", "h", "gateway"):
        assert ("%s:" % z) in ssot or ('"%s"' % z) in ssot or ("  %s:" % z) in ssot
    files = {
        "a": "church_ministry/_landing/worship.html",
        "b": "church_ministry/_landing/pastoral.html",
        "c": "church_ministry/_landing/education.html",
        "d": "church_ministry/_landing/outreach.html",
        "e": "church_ministry/_landing/social.html",
        "g": "church_ministry/_landing/planning.html",
        "h": "church_ministry/_landing/attendance.html",
        "gateway": "church_ministry/_landing/gateway.html",
    }
    for z, rel in files.items():
        html = read(rel)
        assert 'data-cm-compass="%s"' % z in html, rel
        assert "cm_compass_zones_ssot.js" in html
        assert "cm_compass_shell.js" in html
        assert "cm_compass_shell.css" in html
        assert "cm_zone_palette" in html
    shell = read("church_ministry/js/cm_compass_shell.js")
    assert "cm-mosaic" in shell
    assert "cm-layout-" in shell
    assert 'id="cm-panel"' in shell or "cm-panel" in shell
    # panel must be rendered after stage (below)
    assert shell.index("cm-stage") < shell.index('id="cm-panel"') or shell.index("cm-stage") < shell.index("cm-panel")


def test_nav_points_to_landings():
    nav = read("js/cm_zone_nav_ssot.js")
    for path in (
        "_landing/worship.html",
        "_landing/pastoral.html",
        "_landing/education.html",
        "_landing/outreach.html",
        "_landing/social.html",
        "_landing/planning.html",
        "_landing/attendance.html",
        "_landing/gateway.html",
    ):
        assert path in nav, path
    modes = read("config/modes.json")
    assert "_landing/planning.html" in modes
    assert "_landing/pastoral.html" in modes
    assert "pastoral-integrated.html?crm_from=hub_b" not in modes


def test_fellowship_redirect():
    html = read("church_ministry/_landing/fellowship.html")
    assert "pastoral.html" in html


if __name__ == "__main__":
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                fails += 1
    raise SystemExit(1 if fails else 0)
