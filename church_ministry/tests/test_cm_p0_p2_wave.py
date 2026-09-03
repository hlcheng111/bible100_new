# -*- coding: utf-8 -*-
"""教會事工 P0–P2 波次：旅程 Hub、外展/研究整合殼、school 橋接、口述 member_id。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_p0_journey_hub_pages_exist():
    for name in ("index_worship_journey.html", "index_c_education_journey.html"):
        assert (CM / name).is_file(), f"missing {name}"


def test_p0_meta_sidebar_journey_links():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "index_worship_journey.html" in layout
    assert "index_c_education_journey.html" in layout
    assert "sidebar_worship_journey.html" in layout


def test_p0_f_demo_sidebar_restored():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "research-integrated.html" in layout
    assert "equipment-management.html" in layout
    assert "DEMO" in layout


def test_p1_outreach_integrated_shell():
    html = read("church_ministry/modules/expansion/outreach-integrated.html")
    js = read("church_ministry/js/outreach_integrated_shell.js")
    assert "out-integrated-subframe" in html
    assert "outreach-strategy.html" in js
    assert "outreach_followup.html" in js
    side = read("church_ministry/sidebar_church_layout_v1.html")
    assert "outreach-integrated.html" in side


def test_p1_fellowship_hub_not_stub():
    html = read("church_ministry/modules/fellowship/index.html")
    assert "優先開發" not in html
    assert "small-groups-integrated.html" in html
    assert "visitation_index.html" in html
    assert "people_list.html" not in html


def test_p1_voice_member_id_router():
    js = read("js/crm_intent_router.js")
    console = read("ai_tools/pages/crm_automation_console.html")
    for key in ("resolveMemberIdsFromText", "applyMemberContext", "central_member_db.js"):
        assert key in js or key in console


def test_p2_research_integrated():
    assert (CM / "modules/research/research-integrated.html").is_file()
    assert (CM / "js/research_integrated_shell.js").is_file()


def test_p2_school_bridge():
    js = read("church_ministry/js/cm_school_bridge.js")
    edu = read("church_ministry/modules/education/education-integrated.html")
    dash = read("church_ministry/dashboard.html")
    cside = read("church_ministry/sidebar_c_education_journey.html")
    assert "getRosterAlignmentSummary" in js
    assert "cm_school_bridge.js" in edu
    assert "dash-school-bridge-note" in dash
    assert "缺席→探訪" in cside or "探訪" in cside


def test_p2_worship_sunday_primary():
    side = read("church_ministry/sidebar_church_layout_v1.html")
    worship = read("church_ministry/modules/worship/worship-integrated.html")
    assert side.index("worship-sunday-desk.html") < side.index("worship-integrated.html?view=leader")
    assert "worship-sunday-desk.html" in worship


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
