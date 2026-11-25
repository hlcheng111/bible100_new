# -*- coding: utf-8 -*-
"""出席治理文件 + 今日一件事路線圖 kit 接线。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_governance_doc():
    doc = read("church_ministry/docs/ATTENDANCE_GOVERNANCE.md")
    for key in (
        "member_id",
        "bible100_attendance_checkin_v1",
        "attendance_route_kit",
        "HITL",
        "分母",
        "身份碼",
    ):
        assert key in doc, key


def test_kit_files():
    js = read("church_ministry/js/attendance_route_kit.js")
    css = read("church_ministry/css/attendance_route_kit.css")
    assert "AttendanceRouteKit" in js
    assert "bible100_att_route_check_v1" in js
    assert "b_pastoral" in js and "a_worship" in js and "school" in js
    assert "att-route__cta" in css


def test_hosts_wired():
    # 落地頁（_landing）由 cm_compass_shell.js 依區碼掛載路線圖，不再手寫 data-att-route
    shell = read("church_ministry/js/cm_compass_shell.js")
    for zone, route in (("a", "a_worship"), ("b", "b_pastoral"), ("h", "b_checkin")):
        assert '%s: "%s"' % (zone, route) in shell, (zone, route)
    for rel in (
        "church_ministry/_landing/worship.html",
        "church_ministry/_landing/pastoral.html",
        "church_ministry/_landing/attendance.html",
    ):
        assert "cm_compass_shell" in read(rel), rel
    hosts = [
        ("church_ministry/modules/fellowship/pastoral-integrated.html", "b_pastoral"),
        ("church_ministry/modules/fellowship/attendance-checkin.html", "b_checkin"),
        ("church_ministry/modules/fellowship/pastoral-attendance.html", "b_stats"),
        ("church_ministry/modules/support/visitation_index.html", "b_visit"),
        ("church_ministry/modules/worship/worship-sunday-desk.html", "a_sunday"),
        ("school_management/_landing/home.html", "school"),
    ]
    for rel, route in hosts:
        html = read(rel)
        assert "attendance_route_kit" in html, rel
        assert 'data-att-route="%s"' % route in html, (rel, route)


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
