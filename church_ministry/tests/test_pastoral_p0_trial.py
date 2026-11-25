# -*- coding: utf-8 -*-
"""P0 B 牧養主鏈：試用包 / NLQ / 導遊 / ③④ 面板接线。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_trial_pack_api():
    js = read("church_ministry/js/pastoral_trial_pack.js")
    for key in (
        "PastoralTrialPack",
        "ensureTrialChurch",
        "queryQuickFilter",
        "absence_streak_ge_2",
        "no_group",
        "handover_pending",
    ):
        assert key in js, key


def test_nlq_panel_and_shell():
    nlq = read("church_ministry/js/pastoral_nlq_panel.js")
    shell = read("church_ministry/js/pastoral_integrated_shell.js")
    html = read("church_ministry/modules/fellowship/pastoral-integrated.html")
    assert "past-btn-trial" in nlq
    assert "PastoralNlqPanel" in nlq
    assert 'alerts: "pastoral_alerts_panel.html"' in shell
    assert 'visitation: "pastoral_visitation_panel.html"' in shell
    assert "pastoral_trial_pack.js" in html
    assert "pastoral_nlq_panel.js" in html
    assert 'id="past-nlq-results"' in html
    assert 'id="past-guide-banner"' in html


def test_alerts_and_visitation_panels():
    alerts = read("church_ministry/modules/fellowship/pastoral_alerts_panel.html")
    visit = read("church_ministry/modules/fellowship/pastoral_visitation_panel.html")
    assert "pa-btn-trial" in alerts
    assert "pastoral_trial_pack.js" in alerts
    assert "pv-btn-trial" in visit
    assert "pastoral_trial_pack.js" in visit


def test_visitation_demo_and_sunday_seed():
    vis = read("church_ministry/modules/support/visitation_index.html")
    sunday = read("church_ministry/modules/worship/worship-sunday-desk.html")
    choir = read("church_ministry/modules/worship/choir-team.html")
    assert "vis-btn-trial-demo" in vis
    assert "pastoral_trial_pack.js" in vis
    assert "pastoral_trial_pack.js" in sunday
    assert "btnLoadSeed" in sunday
    assert "attendance-checkin.html" in choir


def test_school_workbench_seed_loop():
    html = read("school_management/manage/academic_integrated.html")
    js = read("school_management/js/sch_workbench_shell.js")
    assert "sch-btn-seed" in html
    assert "sch-btn-grad-demo" in html
    assert "ensureSeedStudents" in js
    assert "graduated" in js
    assert "loadTrialClass" in js


def test_route_kit_completion_cta():
    js = read("church_ministry/js/attendance_route_kit.js")
    assert "路線認得啦" in js
    assert "a_sunday" in js
    assert "academic_integrated.html" in js


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
