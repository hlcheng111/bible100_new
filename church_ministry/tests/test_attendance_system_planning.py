# -*- coding: utf-8 -*-
"""出席記錄系統 · 規劃入口 + 各大模組頁面存在與接線。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_planning_hub_and_menu():
    hub = read("church_planning/attendance_system_hub.html")
    assert "出席記錄系統" in hub
    assert "att-hub-nums" in hub
    assert "worship-sunday-desk.html" in hub
    assert "attendance-checkin.html" in hub
    assert "education-integrated.html" in hub

    ssot = read("js/g_do_admin_menu_ssot.js")
    assert 'summary: "⑤ 出席系統"' in ssot or "⑤ 出席系統" in ssot
    assert "attendance_system_hub.html" in ssot
    assert "att_worship" in ssot
    assert "att_checkin" in ssot
    assert "att_edu" in ssot

    gmenu = read("church_planning/js/planning_sidebar_g_menu.js")
    assert 'data-admin="attendance"' in gmenu
    assert "att_hub" in gmenu

    index = read("church_planning/index_plan.html")
    assert "attendance_system_hub.html" in index
    assert "出席系統" in index

    rail = read("church_planning/js/planning_zone_rail.js")
    assert "attendance_system_hub.html" in rail
    assert "planning-zone-rail__l2" in rail or "planning-zone-rail__chip" in rail


def test_module_attendance_pages_exist():
    paths = [
        "church_ministry/modules/worship/worship-sunday-desk.html",
        "church_ministry/modules/fellowship/attendance-checkin.html",
        "church_ministry/modules/fellowship/pastoral-attendance.html",
        "church_ministry/modules/fellowship/newcomer-qr-desk.html",
        "church_ministry/modules/fellowship/newcomer-self-register.html",
        "church_ministry/modules/education/education-integrated.html",
        "church_ministry/modules/education/edu_attendance.html",
        "church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html",
        "church_ministry/js/attendance_checkin_store.js",
        "church_ministry/js/attendance_checkin_ui.js",
        "church_ministry/js/newcomer_qr_store.js",
        "church_ministry/js/newcomer_dash_widget.js",
        "church_planning/attendance_system_hub.html",
    ]
    for rel in paths:
        assert (ROOT / rel).is_file(), rel


def test_stores_and_dash_api():
    store = read("church_ministry/js/attendance_checkin_store.js")
    for key in (
        "AttendanceCheckinStore",
        "listEvents",
        "eventStats",
        "checkIn",
        "startEvent",
    ):
        assert key in store, key
    nqr = read("church_ministry/js/newcomer_qr_store.js")
    for key in ("getStats", "approveAndIssue", "submitSelfRegister"):
        assert key in nqr, key
    dash = read("church_ministry/dashboard_church_layout_v1_content.html")
    assert "data-newcomer-dash" in dash
    assert "newcomer_dash_widget.js" in dash
    assert "出席記錄系統" in dash or "ATTENDANCE_OPS_HANDBOOK" in dash


def test_handbook_not_metro():
    hb = read("church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html")
    assert "出席記錄系統" in hb
    assert "地鐵" not in hb


def test_h_zone_landing():
    land = read("church_ministry/_landing/attendance.html")
    assert "H 出席系統" in land
    assert 'data-cm-compass="h"' in land
    assert "cm_compass_zones_ssot.js" in land
    zones = read("church_ministry/js/cm_compass_zones_ssot.js")
    assert "attendance-checkin.html" in zones
    assert "Attend" in zones
    assert "attendance-checkin.html" in zones
    menu = read("js/cm_h_menu_ssot.js")
    assert "CmHMenu" in menu
    modes = read("config/modes.json")
    assert "H 出席系統" in modes
    assert "focus=h" in modes


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
