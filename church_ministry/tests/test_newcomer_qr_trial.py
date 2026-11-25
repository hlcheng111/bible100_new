# -*- coding: utf-8 -*-
"""新人登記／發碼／儀表／手冊接线（試用）。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_store_api():
    js = read("church_ministry/js/newcomer_qr_store.js")
    for key in (
        "bible100_newcomer_qr_v1",
        "submitSelfRegister",
        "approveAndIssue",
        "resolveCheckinQuery",
        "B100|",
        "getStats",
        "NewcomerQrStore",
    ):
        assert key in js, key


def test_pages_exist():
    for rel in (
        "church_ministry/modules/fellowship/newcomer-self-register.html",
        "church_ministry/modules/fellowship/newcomer-qr-desk.html",
        "church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html",
        "church_ministry/js/lib/qrcode.min.js",
        "church_ministry/js/newcomer_dash_widget.js",
        "church_ministry/css/newcomer_dash.css",
    ):
        assert (ROOT / rel).is_file(), rel


def test_wired_hosts():
    checkin = read("church_ministry/modules/fellowship/attendance-checkin.html")
    dash = read("church_ministry/dashboard_church_layout_v1_content.html")
    side = read("church_ministry/sidebar_pastoral_journey.html")
    store = read("church_ministry/js/attendance_checkin_store.js")
    assert "newcomer_qr_store.js" in checkin
    assert "data-newcomer-dash" in checkin
    assert "data-newcomer-dash" in dash
    assert "newcomer_dash_widget.js" in dash
    assert "newcomer-qr-desk.html" in side
    assert "ATTENDANCE_OPS_HANDBOOK.html" in side
    assert "resolveCheckinQuery" in store
    assert "checkinCode" in store


def test_handbook_links():
    hb = read("church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html")
    for key in (
        "newcomer-self-register.html",
        "newcomer-qr-desk.html",
        "attendance-checkin.html",
        "ATTENDANCE_GOVERNANCE.md",
        "ATTENDANCE_CHECKIN_W0_W1.md",
        "today3",
        "出席記錄系統",
        "今日三步",
    ):
        assert key in hb, key


def test_warm_ux_pages():
    desk = read("church_ministry/modules/fellowship/newcomer-qr-desk.html")
    checkin = read("church_ministry/modules/fellowship/attendance-checkin.html")
    past = read("church_ministry/modules/fellowship/pastoral-integrated.html")
    assert "nc-btn-demo-issue" in desk
    assert "nc-empty-warm" in desk
    assert "好嘢" in desk
    assert "ac-btn-begin-tonight" in checkin
    assert "ac-gate" in checkin
    assert "今晚小組" in past or "關心" in past
    ui = read("church_ministry/js/attendance_checkin_ui.js")
    assert "beginTonight" in ui
    assert "revealWork" in ui


def test_process_strip_wired():
    js = read("church_ministry/js/attendance_process_strip.js")
    assert "AttendanceProcessStrip" in js
    assert "你而家喺" in js or "你而家" in js
    for rel, step in (
        ("church_ministry/modules/fellowship/newcomer-self-register.html", "register"),
        ("church_ministry/modules/fellowship/newcomer-qr-desk.html", "issue"),
        ("church_ministry/modules/fellowship/attendance-checkin.html", "checkin"),
        ("church_ministry/modules/fellowship/pastoral-integrated.html", "pastoral"),
    ):
        html = read(rel)
        assert "attendance_process_strip" in html, rel
        assert 'data-att-line="%s"' % step in html, (rel, step)


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
