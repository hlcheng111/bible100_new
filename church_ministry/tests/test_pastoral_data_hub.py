# -*- coding: utf-8 -*-
"""B 区牧养数据层：pastoral_data_hub / 出席页 / 小组工作桌 接线检查。"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_pastoral_data_hub_exists_and_keys():
    js = read("church_ministry/js/pastoral_data_hub.js")
    for key in (
        "pastoral_small_groups_v1",
        "group_attendance_v1",
        "recordGroupAttendanceSession",
        "createVisitationDraft",
        "memberProfileUrl",
        "ensurePastoralSeed",
        "consecutiveAbsenceWeeks",
    ):
        assert key in js, f"missing {key} in pastoral_data_hub.js"


def test_small_groups_integrated_wired():
    html = read("church_ministry/modules/fellowship/small-groups-integrated.html")
    assert "pastoral_data_hub.js" in html
    assert "small_groups_workspace.js" in html
    assert "pastoral_workspace.css" in html
    assert "sg-tab-overview" in html or "总览看板" in html
    assert "pastoral-attendance.html" in html


def test_pastoral_attendance_page():
    html = read("church_ministry/modules/fellowship/pastoral-attendance.html")
    assert "pastoral_data_hub.js" in html
    assert "pastoral_attendance_ui.js" in html
    assert "att-tab-weekly" in html or "每周汇报" in html


def test_member_id_link_pattern():
    hub = read("church_ministry/js/pastoral_data_hub.js")
    assert "memberId" in hub
    assert "member-integrated.html" in hub or "memberGrowthUrl" in hub


def test_nav_links_to_attendance():
    sidebar = read("church_ministry/sidebar_church_layout_v1.html")
    journey = read("church_ministry/sidebar_pastoral_journey.html")
    assert "pastoral-attendance.html" in sidebar
    assert "pastoral-attendance.html" in journey


def test_story_nav_attendance_story():
    nav = read("church_ministry/js/ae_pastoral_story_nav.js")
    assert "pastoral-attendance.html" in nav
    assert "聚会" in nav or "出席" in nav


def test_registry_attendance():
    reg = read("church_ministry/js/crm_journey_registry.js")
    assert "pastoral-attendance.html" in reg


def test_pages_2_4_5_6_exist():
    pages = [
        ("church_ministry/modules/fellowship/pastoral-org-roster.html", "pastoral_org_roster_ui.js"),
        ("church_ministry/modules/fellowship/pastoral-events.html", "pastoral_events_ui.js"),
        ("church_ministry/modules/fellowship/pastoral-training.html", "pastoral_training_ui.js"),
        ("church_ministry/modules/fellowship/pastoral-strategy.html", "pastoral_strategy_ui.js"),
    ]
    for html_path, js_name in pages:
        html = read(html_path)
        assert "pastoral_data_hub.js" in html
        assert js_name in html


def test_hub_org_events_training_strategy():
    js = read("church_ministry/js/pastoral_data_hub.js")
    for key in (
        "getPastoralOrgTree",
        "getMembersFiltered",
        "pastoral_events_board_v1",
        "pastoral_training_v1",
        "pastoral_strategy_v1",
        "pastoral_org_v1",
        "getOrgTreeEnriched",
        "getLeaderHealthKpis",
        "evaluateLifecycleRules",
        "pushToStrategyDesk",
        "getProfile360",
        "getYearlyPastoralReport",
        "getPendingPastoralTasks",
    ):
        assert key in js, f"missing {key}"


def test_cross_module_bridge():
    js = read("church_ministry/js/pastoral_cross_module_bridge.js")
    for key in (
        "getMemberGrowthTimeline",
        "recordActivityRegistrationFee",
        "syncTrainingToEducation",
        "pastoralDiscipleship",
        "getMergedTrainingRows",
    ):
        assert key in js, f"missing {key} in pastoral_cross_module_bridge.js"
    member = read("church_ministry/modules/members/member-integrated.html")
    assert "pastoral_cross_module_bridge.js" in member
    assert "getMemberGrowthTimeline" in member or "牧养成长时间轴" in member


def test_hub_events_strategy_depth():
    js = read("church_ministry/js/pastoral_data_hub.js")
    for key in (
        "getAnnouncementRelayStats",
        "confirmAnnouncementRelay",
        "getRegistrationLeaderboard",
        "enrollGroupForEvent",
        "addRotaWithValidation",
        "validateServingAssignment",
        "addEventArchiveRich",
        "pushPrayerToWorkspace",
        "getPrayerAlertsForGroup",
        "simulateProposalImpact",
        "getChurchHealthIndex",
        "groupPrayerAlerts",
        "groupAcks",
    ):
        assert key in js, f"missing {key}"
    ev_ui = read("church_ministry/js/pastoral_events_ui.js")
    assert "pev-relay-kpi" in ev_ui or "传递率" in ev_ui
    assert "pev-group-enroll" in ev_ui or "批量" in ev_ui
    st_ui = read("church_ministry/js/pastoral_strategy_ui.js")
    assert "pst-health-grid" in st_ui or "教会健康指数" in st_ui
    sg = read("church_ministry/js/small_groups_workspace.js")
    assert "prayerAlerts" in sg or "战略桌紧急代祷" in sg


def test_b_waves_b1_b5():
    hub = read("church_ministry/js/pastoral_data_hub.js")
    bridge = read("church_ministry/js/pastoral_cross_module_bridge.js")
    for key in (
        "migratePastoralStores",
        "getSpiritualLadderForMember",
        "getTimothyCandidates",
        "addMakeupSession",
        "promoteToTimothyPool",
        "getPastoralTaskInbox",
        "completePastoralTask",
        "registerYouthNewcomer",
        "getViewerRole",
        "filterVisitLogForViewer",
        "exportPastoralBundle",
        "importPastoralBundle",
        "downloadPastoralBundle",
        "trySyncPastoralBundleToCloud",
        "getFellowshipCircleStats",
        "makeupSessions",
        "timothyPool",
        "schema_version: 2",
    ):
        assert key in hub, f"missing {key} in hub"
    for key in (
        "pullGiftAssessmentForMember",
        "syncAllPlanningGifts",
        "onVisitationCompleted",
        "bible100_assessment_runs",
    ):
        assert key in bridge, f"missing {key} in bridge"
    train_ui = read("church_ministry/js/pastoral_training_ui.js")
    assert "ptr-ladder-track" in train_ui or "属灵成长阶梯" in train_ui
    assert "提摩太" in train_ui
    sg = read("church_ministry/js/small_groups_workspace.js")
    assert "getPastoralTaskInbox" in sg or "牧养待办 Inbox" in sg
    strat = read("church_ministry/js/pastoral_strategy_ui.js")
    assert "filterVisitLogForViewer" in strat or "getViewerRole" in strat
    vis = read("church_ministry/modules/support/visitation_index.html")
    assert "onVisitationCompleted" in vis
    youth = read("church_ministry/modules/development/youth-ministry-dev.html")
    assert "registerYouthNewcomer" in youth or "registerYouth" in youth
    circles = read("church_ministry/modules/fellowship/fellowship-circles.html")
    assert "getFellowshipCircleStats" in circles or "pastoral_data_hub" in circles
    idx = read("church_ministry/modules/fellowship/index.html")
    assert "downloadPastoralBundle" in idx or "hub-export-btn" in idx
    nav = read("church_ministry/js/ae_pastoral_story_nav.js")
    assert "提摩太" in nav or "属灵阶梯" in nav


def test_sidebar_all_six_pages():
    sidebar = read("church_ministry/sidebar_church_layout_v1.html")
    for slug in (
        "pastoral-org-roster.html",
        "pastoral-attendance.html",
        "pastoral-events.html",
        "pastoral-training.html",
        "pastoral-strategy.html",
        "small-groups-integrated.html",
    ):
        assert slug in sidebar


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
