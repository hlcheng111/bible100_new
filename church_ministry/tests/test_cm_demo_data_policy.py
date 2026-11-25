#!/usr/bin/env python3
"""
示範資料政策（空資料就老實說「尚無資料」）＋ 樣式／字型／新朋友跟進，鎖住不再回來。
純靜態檢查，不開瀏覽器。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def test_no_module_page_auto_loads_demo_when_empty():
    """modules 頁面不可再寫 `if (空) loadDemo();`（自動塞示範）；要走 CmDemoGate。"""
    pat = re.compile(r"if\s*\([^)]*length\s*===?\s*0[^)]*\)\s*loadDemo\w*\(\)\s*;")
    bad = []
    for p in (CM / "modules").glob("*/*.html"):
        if pat.search(p.read_text(encoding="utf-8", errors="ignore")):
            bad.append(str(p.relative_to(ROOT)))
    assert not bad, bad


def test_pages_using_demo_gate_load_the_script():
    bad = []
    for p in (CM / "modules").glob("*/*.html"):
        t = p.read_text(encoding="utf-8", errors="ignore")
        if "CmDemoGate.offer" in t and "cm_demo_gate.js" not in t:
            bad.append(str(p.relative_to(ROOT)))
    assert not bad, bad


def test_pastoral_seed_only_on_explicit_force():
    t = read("church_ministry/js/pastoral_data_hub.js")
    assert "if (force !== true)" in t and "seeded: false" in t


def test_pastoral_shell_does_not_auto_load_trial_church():
    t = read("church_ministry/js/pastoral_integrated_shell.js")
    assert "ensureTrialChurch(false)" not in t
    assert "CmDemoGate" in t


def test_education_panel_does_not_auto_seed():
    t = read("church_ministry/js/education_integrated_ui.js")
    assert 'bible100_edu_demo_seeded' not in t


def test_fellowship_index_has_no_hardcoded_stats():
    t = read("church_ministry/modules/fellowship/index.html")
    for i in ("totalGroups", "totalMembers", "monthlyVisits", "completionRate"):
        m = re.search(r'id="%s">([^<]*)<' % i, t)
        assert m and m.group(1).strip() == "—", (i, m and m.group(1))


def test_volunteer_analysis_uses_real_data():
    t = read("church_ministry/modules/volunteer/volunteer-integrated.html")
    a = t.index("function renderAnalysisTab")
    b = t.index("function renderAttentionList")
    seg = t[a:b]
    assert "Math.random" not in seg and "[35, 42, 28, 15]" not in seg
    assert "所有志工服務狀態正常" not in t


def test_font_awesome_webfonts_exist_locally():
    css = (CM / "assets" / "css" / "fontawesome.min.css").read_text(encoding="utf-8", errors="ignore")
    names = set(re.findall(r"url\(\.\./webfonts/([^)]+)\)", css))
    assert names, "fontawesome.min.css 沒有 webfonts 參照"
    missing = [n for n in names if not (CM / "assets" / "webfonts" / n).exists()]
    assert not missing, missing


def test_tailwind_browser_script_available_and_used_by_sample_page():
    js = CM / "assets" / "js" / "tailwind-browser.min.js"
    assert js.exists() and js.stat().st_size > 100_000
    t = read("church_ministry/modules/fellowship/index.html")
    assert "tailwind-browser.min.js" in t and 'href="../../assets/css/tailwind.min.css"' not in t


def test_newcomer_self_register_creates_3day_followup_task():
    t = read("church_ministry/js/newcomer_qr_store.js")
    assert "FOLLOWUP_DAYS = 3" in t
    assert 'type: "newcomer_followup"' in t
    assert "ensureFollowupTask(memberId, name, FOLLOWUP_DAYS)" in t


if __name__ == "__main__":
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
