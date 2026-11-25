#!/usr/bin/env python3
"""
階段 3 跨區流程檢查器的自我測試。
- 不開瀏覽器的部分：判定規則（不成立要記 ❌／🟡）、報告輸出、file:// 安全寫法回歸。
- 開瀏覽器的部分（找不到 Edge／Chrome 時略過）：五條流程真的跑一遍，不得有 ❌。
"""
import importlib.util
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "church_ministry" / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("cm_zone_flows", SCRIPTS / "cm_zone_flows.py")
F = importlib.util.module_from_spec(spec)
sys.modules["cm_zone_flows"] = F
spec.loader.exec_module(F)
D = sys.modules["cm_zone_dynamic"]


def fake_run():
    r = F.Run.__new__(F.Run)  # 不開瀏覽器
    r.steps, r.flow, r.errors = [], "FX 測試流程", []
    r.shot = lambda label="": ""
    return r


def test_check_records_ok_warn_bad():
    r = fake_run()
    assert r.check("成立", True) is True
    assert r.check("不成立（硬傷）", False, "壞了", sev="P1") is False
    assert r.check("不成立（設計缺口）", False, "可改善", soft=True) is False
    assert [s["status"] for s in r.steps] == ["ok", "bad", "warn"]
    assert r.steps[1]["sev"] == "P1" and r.steps[0]["sev"] == ""  # 通過的步驟不帶嚴重度


def test_reports_written_and_list_problems():
    r = fake_run()
    r.check("甲", True)
    r.check("乙", False, "壞了", sev="P0")
    with tempfile.TemporaryDirectory() as td:
        F.OUT = Path(td)
        F.write_reports(r.steps, {"at": "2026-01-01 00:00", "seconds": 1})
        md = (Path(td) / "flows.md").read_text(encoding="utf-8")
        assert "FX 測試流程" in md and "壞了" in md and "P0" in md
        assert (Path(td) / "flows.json").exists()


def test_five_flows_registered():
    assert sorted(F.FLOWS) == ["f1", "f2", "f3", "f4", "f5"]


def test_no_direct_cross_frame_property_read_for_pastoral_shell():
    """file:// 下 window.parent.PastoralIntegratedShell 會 SecurityError；子頁一律改走 postMessage。"""
    bad = []
    for p in (ROOT / "church_ministry").rglob("*"):
        if p.suffix not in (".html", ".js") or "audit" in p.parts or "_archive" in p.parts:
            continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"(window|global)\.parent\.PastoralIntegratedShell", t):
            bad.append(str(p.relative_to(ROOT)))
    assert not bad, bad


def test_bridge_script_loaded_by_embedded_pages():
    for rel in ("attendance-checkin.html", "pastoral-attendance.html"):
        t = (ROOT / "church_ministry" / "modules" / "fellowship" / rel).read_text(encoding="utf-8")
        assert "pastoral_shell_bridge.js" in t and "installTabNav" in t, rel
    shell = (ROOT / "church_ministry" / "js" / "pastoral_integrated_shell.js").read_text(encoding="utf-8")
    assert "embed=pastoral" in shell


_CACHE = {}


def _run_all():
    if "steps" not in _CACHE:
        r = F.Run(9227)
        try:
            for k in sorted(F.FLOWS):
                F.FLOWS[k](r)
        finally:
            _CACHE["steps"] = r.steps
            r.close()
    return _CACHE["steps"]


def test_real_flows_have_no_hard_failures():
    steps = _run_all()
    assert len(steps) >= 45, len(steps)
    bad = [(s["flow"], s["step"], s["detail"][:80]) for s in steps if s["status"] == "bad"]
    assert not bad, bad


def test_real_flows_known_gaps_only():
    """設計缺口（🟡）只允許已知的這一項；出現新的就要看。"""
    steps = _run_all()
    warn = sorted(s["step"] for s in steps if s["status"] == "warn")
    known = ["登記後『3 日內跟進』有任務可追（任務清單有他）"]
    assert warn == known or warn == [], warn


if __name__ == "__main__":
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    have_browser = bool(D.find_browser())
    for name, fn in tests:
        if name.startswith("test_real_flows") and not have_browser:
            print(f"SKIP {name}: 找不到 Edge／Chrome")
            continue
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
