# -*- coding: utf-8 -*-
"""C 区教育数据层：education_data_hub / bridge / UI 接线检查。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_education_hub_exists():
    js = read("church_ministry/js/education_data_hub.js")
    for key in (
        "EducationDataHub",
        "schema_version: SCHEMA_VERSION",
        "migrateEducationStores",
        "ensureEducationSeed",
        "saveRawData",
        "getRawData",
        "recordAttendanceSession",
        "listAbsentWarnings",
        "applyCurriculumTemplate",
        "matchMembersByName",
        "exportEducationBundle",
        "importEducationBundle",
        "downloadEducationBundle",
        "devPlanData",
        "pastoralDiscipleship",
        "CURRICULUM_TEMPLATES",
    ):
        assert key in js, f"missing {key} in education_data_hub.js"


def test_education_bridge_exists():
    js = read("church_ministry/js/education_cross_module_bridge.js")
    for key in (
        "EducationCrossModuleBridge",
        "onEducationAbsenceAlert",
        "recordAttendanceWithCare",
        "getMergedTrainingForMember",
        "getCrossModuleMetrics",
        "getModuleLinks",
        "education_absence",
        "bible_study/dashboard.html",
        "school_management",
        "ai_tools/dashboard.html",
    ):
        assert key in js, f"missing {key} in education_cross_module_bridge.js"


def test_education_ai_helper():
    js = read("church_ministry/js/education_ai_helper.js")
    for key in (
        "EducationAiHelper",
        "education_lesson_drafts_v1",
        "education_leader_report_drafts_v1",
        "buildLessonDraft",
        "buildLeaderReportDraft",
    ):
        assert key in js, f"missing {key}"


def test_education_integrated_fusion_wired():
    html = read("church_ministry/modules/education/education-integrated.html")
    shell = read("church_ministry/js/education_integrated_shell.js")
    ui = read("church_ministry/js/education_integrated_ui.js")
    for key in (
        "education_data_hub.js",
        "education_integrated_shell.js",
        "education_workspace.css",
        "education_integrated_shell.css",
        'data-tab="guide"',
        'data-tab="roster"',
        'data-tab="attendance"',
        "C 區 · 5 Tab",
        "edu-integrated-subframe",
        "data-b100-edu-integrated",
        "P-AE-EDU-SHELL",
        "edu-btn-crm",
        "guide_story.html",
    ):
        assert key in html, f"missing {key} in education-integrated.html"
    for bad in (
        "ae_primary_nav.js",
        "ae_subpage_shell.js",
        "ae_education_story_nav.js",
        "crm_context_bar.js",
        "ae_zone_roadmap.css",
        "edu-cross-links-top",
        "education_integrated_ui.js",
    ):
        assert bad not in html, f"should not load {bad} on integrated shell page"
    for child in (
        "guide_story.html",
        "edu_roster.html",
        "edu_attendance.html",
        "edu_discipleship.html",
        "edu_teaching.html",
    ):
        assert (CM / "modules" / "education" / child).is_file(), f"missing child page {child}"
    assert "EducationIntegratedShell" in shell
    assert "guide_story.html" in shell
    assert "edu_roster.html" in shell
    assert "getPanelMode" in ui
    assert "requestShellTab" in ui
    assert "showComingSoon" not in html
    assert "Math.random" not in html


def test_no_random_in_education_ui():
    ui = read("church_ministry/js/education_integrated_ui.js")
    assert "Math.random" not in ui


def test_satellite_redirects():
    for path, fragment in (
        ("church_ministry/modules/education/sunday-school.html", "tab-roster"),
        ("church_ministry/modules/education/spiritual-growth.html", "tab-discipleship"),
        ("church_ministry/modules/development/development-plan.html", "tab-teaching"),
    ):
        html = read(path)
        assert "education-integrated.html" in html
        assert fragment in html


def test_landing_redirects_to_integrated_guide():
    landing = read("church_ministry/_landing/education.html")
    assert "education-integrated.html" in landing
    assert "tab-guide" in landing
    assert "ae_subpage_shell.js" not in landing


def test_cm_c_menu_ssot_journey_merged():
    js = read("js/cm_c_menu_ssot.js")
    assert "20260811e" in js
    assert "主日學工作桌" in js
    assert 'eduTab("guide")' in js
    assert 'eduTab("attendance")' in js
    assert 'eduTab("discipleship")' in js
    assert '#tab-" + tab' in js
    assert "_landing/education.html" in js
    assert "modules/development/discipleship-training.html" in js
    assert "school_management/sidebar.html" in js
    assert "bible_study/sidebar.html" in js
    assert "ai_tools/sidebar_lab.html" in js
    assert "c_education_absence" in js
    assert "sidebar_crm_journey.html" in js
    assert "回 CRM" in js


def test_sidebar_c_education_redirects_to_layout():
    journey = read("church_ministry/sidebar_c_education_journey.html")
    assert "sidebar_church_layout_v1.html?focus=c" in journey
    assert "education-integrated.html" in journey
    assert "tab-guide" in journey


def test_story_nav_and_shell_lite():
    shell = read("church_ministry/js/ae_subpage_shell.js")
    assert "isEducationIntegratedPage" in shell
    assert "bootEducationShell" in shell
    assert "isEducationCZone" in shell


def test_pastoral_inbox_education_absence():
    hub = read("church_ministry/js/pastoral_data_hub.js")
    assert "education_absence" in hub


def test_crm_journey_shell_nav_for_c():
    reg = read("church_ministry/js/crm_journey_registry.js")
    nav = read("church_ministry/js/crm_nav.js")
    render = read("church_ministry/js/crm_sidebar_render.js")
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    crm_sb = read("church_ministry/sidebar_crm_journey.html")
    for key in (
        "cZoneShellLinks",
        "sidebar_church_layout_v1.html?focus=c",
        "education-integrated.html",
        "bible_study/sidebar.html",
        "ai_tools/sidebar_lab.html",
    ):
        assert key in reg, f"missing {key} in crm_journey_registry"
    assert "sidebar_c_education_journey.html" not in reg.split("C_ZONE_SHELL_LINKS")[1].split("];")[0]
    assert "_landing/education.html" not in reg.split("C_ZONE_SHELL_LINKS")[1].split("];")[0]
    assert "isC && reg.cZoneShellLinks" in render
    assert "tab-guide" in reg
    assert "loadCZoneContentPreferRightPane" in layout
    assert "redirectCZoneToEducationJourneySidebar" not in layout
    assert "sidebar_church_layout_v1.html" in nav
    ae = nav.split("function crmOpenAeLayout")[1].split("function ")[0]
    assert "sidebar_c_education_journey.html" not in ae
    assert "data-crm-retired" in crm_sb

def test_sidebar_bust_hash():
    sb = read("js/sidebar_behavior.js")
    assert "hashIdx" in sb


def test_c_waves_files():
    assert (CM / "css" / "education_workspace.css").is_file()
    assert (CM / "css" / "education_integrated_shell.css").is_file()
    assert (CM / "js" / "education_integrated_ui.js").is_file()
    assert (CM / "js" / "education_integrated_shell.js").is_file()
    assert (CM / "js" / "ae_education_journey_registry.js").is_file()
    assert (CM / "js" / "ae_education_landing_tour.js").is_file()


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
