"""CM rebuild W0–W2 static checks (pastoral/admin integrated, desks redirect, SSOT)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel: str) -> str:
    return (ROOT / rel.replace("/", "\\") if False else ROOT / rel).read_text(encoding="utf-8")


def test_pastoral_integrated_exists():
    p = CM / "modules/fellowship/pastoral-integrated.html"
    assert p.is_file(), "missing pastoral-integrated.html"
    text = p.read_text(encoding="utf-8")
    assert "pastoral_integrated_shell.js" in text
    assert "past-integrated-subframe" in text
    assert 'data-tab="alerts"' in text


def test_admin_integrated_exists():
    p = CM / "modules/admin/admin-integrated.html"
    assert p.is_file(), "missing admin-integrated.html"
    text = p.read_text(encoding="utf-8")
    assert "admin_integrated_shell.js" in text
    assert 'data-tab="finance"' in text


def test_desks_redirect_pastoral():
    text = (CM / "desks/pastoral.html").read_text(encoding="utf-8")
    assert "pastoral-integrated.html" in text
    assert "location.replace" in text


def test_desks_index_redirects_gateway():
    text = (CM / "desks/index.html").read_text(encoding="utf-8")
    assert "gateway.html" in text


def test_cm_zone_nav_b_g_d():
    text = (ROOT / "js/cm_zone_nav_ssot.js").read_text(encoding="utf-8")
    assert "pastoral-integrated.html" in text
    assert "admin-integrated.html" in text
    assert "outreach-integrated.html" in text


def test_modes_church_b_g():
    text = (ROOT / "config/modes.json").read_text(encoding="utf-8")
    assert "pastoral-integrated.html" in text
    assert "admin-integrated.html" in text


def test_visitation_queue_ui():
    text = (CM / "js/cm_visitation_queue_ui.js").read_text(encoding="utf-8")
    assert "sourceBadge" in text
    assert "renderHandoverList" in text


def test_responsive_tokens():
    text = (CM / "css/cm_responsive_tokens.css").read_text(encoding="utf-8")
    assert "44px" in text
    assert "767px" in text


if __name__ == "__main__":
    tests = [
        test_pastoral_integrated_exists,
        test_admin_integrated_exists,
        test_desks_redirect_pastoral,
        test_desks_index_redirects_gateway,
        test_cm_zone_nav_b_g_d,
        test_modes_church_b_g,
        test_visitation_queue_ui,
        test_responsive_tokens,
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
