# -*- coding: utf-8 -*-
"""W0/W1 現場點名：store / 頁面 / 牧養 Tab② 接线。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_store_contract_keys():
    js = read("church_ministry/js/attendance_checkin_store.js")
    for key in (
        "bible100_attendance_checkin_v1",
        "checkIn",
        "saveLeaderBatch",
        "startEvent",
        "findMembers",
        "manual_code",
        "leader_batch",
        "duplicate",
        "AttendanceCheckinStore",
    ):
        assert key in js, f"missing {key}"


def test_checkin_page_wired():
    html = read("church_ministry/modules/fellowship/attendance-checkin.html")
    assert "attendance_checkin_store.js" in html
    assert "attendance_checkin_ui.js" in html
    assert "pastoral_data_hub.js" in html
    assert "ac-manual-q" in html
    assert "ac-batch-roster" in html
    assert "載入示範" in html or "示范" in html


def test_pastoral_shell_tab_points_to_checkin():
    js = read("church_ministry/js/pastoral_integrated_shell.js")
    assert 'attendance: "attendance-checkin.html"' in js


def test_sidebar_has_checkin_link():
    side = read("church_ministry/sidebar_pastoral_journey.html")
    assert "attendance-checkin.html" in side
    assert "pastoral-attendance.html" in side


def test_story_nav_has_checkin():
    nav = read("church_ministry/js/ae_pastoral_story_nav.js")
    assert "attendance-checkin.html" in nav


def test_doc_exists():
    doc = read("church_ministry/docs/ATTENDANCE_CHECKIN_W0_W1.md")
    assert "bible100_attendance_checkin_v1" in doc
    assert "W1" in doc
