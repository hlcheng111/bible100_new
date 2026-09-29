"""W6: Church Center role split + B sidebar SSOT."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def test_congregation_role_js():
    text = (CM / "js/cm_congregation_role.js").read_text(encoding="utf-8")
    assert "isMember" in text
    assert 'role === "member"' in text or "member" in text


def test_congregation_member_default():
    text = (CM / "congregation/index.html").read_text(encoding="utf-8")
    assert 'data-cm-desk-kit="off"' in text
    assert "cc-member-view" in text
    assert "cc-leader-only" in text
    assert "E-03" in text
    assert "cm_congregation_role.js" in text


def test_cm_b_menu_pastoral_integrated():
    text = (ROOT / "js/cm_b_menu_ssot.js").read_text(encoding="utf-8")
    assert "pastoral-integrated.html" in text
    assert "pastTab" in text
    assert text.count("pastTab(") >= 5
    assert "small-groups-integrated.html" not in text
    assert "20260806w6" in text


def test_sidebar_b_zone_loader():
    text = (CM / "sidebar_church_layout_v1.html").read_text(encoding="utf-8")
    assert "loadBZoneContentPreferRightPane" in text
    assert "pastoral-integrated" in text
    assert "admin-integrated" in text


def test_e_menu_congregation_member():
    text = (ROOT / "js/cm_e_menu_ssot.js").read_text(encoding="utf-8")
    assert 'role: "member"' in text or "role=member" in text


def test_pastoral_alerts_parent_switch():
    text = (CM / "modules/fellowship/pastoral_alerts_panel.html").read_text(encoding="utf-8")
    assert "goVisitationTab" in text
    assert "PastoralIntegratedShell" in text or "pastoral-integrated" in text


def test_pastoral_shell_postmessage():
    text = (CM / "js/pastoral_integrated_shell.js").read_text(encoding="utf-8")
    assert "bindPostMessage" in text
    assert "bindOverviewClicks" in text


if __name__ == "__main__":
    tests = [
        test_congregation_role_js,
        test_congregation_member_default,
        test_cm_b_menu_pastoral_integrated,
        test_sidebar_b_zone_loader,
        test_e_menu_congregation_member,
        test_pastoral_alerts_parent_switch,
        test_pastoral_shell_postmessage,
    ]
    failed = 0
    for t in tests:
        try:
            t()
            print("OK:", t.__name__)
        except AssertionError as e:
            failed += 1
            print("FAIL:", t.__name__, e)
    raise SystemExit(1 if failed else 0)
