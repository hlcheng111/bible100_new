#!/usr/bin/env python3
"""
階段 0＋1 掃描器的「自我測試」：

1. 用一個臨時的假專案（故意放壞頁）驗證掃描器真的抓得到每一種問題。
   → 防止掃描器自己壞掉、報「全綠」的假象。
2. 用真專案驗證結構不變量（每頁恰有一個狀態、選單頁都有掃到、結果可重現、報告檔寫得出來）。
"""
import importlib.util
import json
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCAN_PY = ROOT / "church_ministry" / "scripts" / "cm_zone_scan.py"

spec = importlib.util.spec_from_file_location("cm_zone_scan", SCAN_PY)
Z = importlib.util.module_from_spec(spec)
sys.modules["cm_zone_scan"] = Z
spec.loader.exec_module(Z)

GOOD_TEXT = "這是一個內容完整的頁面，" * 40


def page(body: str, head_extra: str = "", title: str = "測試頁") -> str:
    return (
        '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">'
        f"<title>{title}</title>{head_extra}</head><body>{body}</body></html>"
    )


def build_fixture(root: Path):
    cm = root / "church_ministry"
    w = cm / "modules" / "worship"
    w.mkdir(parents=True)
    (root / "js").mkdir()
    (cm / "js").mkdir()
    (cm / "js" / "ok_script.js").write_text("var a = 1;", encoding="utf-8")
    (cm / "js" / "bad_script.js").write_text("var a = 'x\n y';", encoding="utf-8")
    (root / "js" / "cm_a_menu_ssot.js").write_text(
        'var items = [ href("modules/worship/ok.html"), href("modules/worship/ghost.html"),'
        ' href("modules/worship/broken_link.html"), href("modules/worship/syntax.html"),'
        ' href("modules/worship/bypass.html"), href("modules/worship/hash.html"),'
        ' href("modules/worship/stub.html"), href("modules/worship/redir.html"),'
        ' href("modules/worship/jsrender.html"), href("modules/worship/case.html"),'
        ' href("modules/worship/stale.html"), href("modules/worship/ext_bad.html") ];',
        encoding="utf-8",
    )
    (w / "ok.html").write_text(page(f"<p>{GOOD_TEXT}</p><a href='broken_link.html'>連到另一頁</a>"), encoding="utf-8")
    (w / "broken_link.html").write_text(page(f"<p>{GOOD_TEXT}</p><a href='nope.html'>壞</a>"), encoding="utf-8")
    (w / "syntax.html").write_text(
        page(f"<p>{GOOD_TEXT}</p><script>var s = 'abc\n def';</script>"), encoding="utf-8")
    (w / "bypass.html").write_text(
        page(f"<p>{GOOD_TEXT}</p><script>localStorage.setItem('financialData','{{}}');</script>"), encoding="utf-8")
    (w / "hash.html").write_text(page(f"<p>{GOOD_TEXT}</p><a href='#'>空連結</a>"), encoding="utf-8")
    (w / "stub.html").write_text(page("<p>x</p>"), encoding="utf-8")
    (w / "redir.html").write_text(page("<p>轉</p><script>location.replace('nowhere.html')</script>"), encoding="utf-8")
    (w / "jsrender.html").write_text(
        page("<div id='root'></div>", '<script src="../../js/ok_script.js"></script>'), encoding="utf-8")
    (w / "case.html").write_text(page(f"<p>{GOOD_TEXT}</p><a href='OK.html'>大小寫</a>"), encoding="utf-8")
    (w / "stale.html").write_text(page(f"<p>{GOOD_TEXT} F 行政支援</p>"), encoding="utf-8")
    (w / "ext_bad.html").write_text(
        page(f"<p>{GOOD_TEXT}</p>", '<script src="../../js/bad_script.js"></script>'), encoding="utf-8")
    (w / "orphan.html").write_text(page(f"<p>{GOOD_TEXT}</p>"), encoding="utf-8")
    (w / "nocharset.html").write_text(
        f"<html><head><title>x</title></head><body><p>{GOOD_TEXT}</p></body></html>", encoding="utf-8")
    (w / "missing_script.html").write_text(
        page(f"<p>{GOOD_TEXT}</p>", '<script src="gone.js"></script>'), encoding="utf-8")


def codes(rec):
    return {c for c, _, _ in rec["issues"]}


def by_name(res):
    return {r["path"].split("/")[-1]: r for r in res["pages"]}


def test_fixture_detects_every_defect():
    tmp = Path(tempfile.mkdtemp())
    try:
        build_fixture(tmp)
        res = Z.scan(tmp)
        P = by_name(res)
        assert codes(P["ok.html"]) == set() and P["ok.html"]["status"] == "ok", codes(P["ok.html"])
        assert "link_broken" in codes(P["broken_link.html"]) and P["broken_link.html"]["status"] == "bad"
        assert "js_syntax" in codes(P["syntax.html"]) and P["syntax.html"]["status"] == "bad"
        assert "biz_direct_write" in codes(P["bypass.html"]) and P["bypass.html"]["status"] == "bad"
        assert "dead_link" in codes(P["hash.html"]) and P["hash.html"]["status"] == "warn"
        assert P["stub.html"]["status"] == "stub"
        assert "link_broken" in codes(P["redir.html"]) and P["redir.html"]["status"] == "bad"
        assert P["jsrender.html"]["js_render"] is True and P["jsrender.html"]["status"] != "stub"
        assert "case_mismatch" in codes(P["case.html"]) and P["case.html"]["status"] == "bad"
        assert "stale_zone_name" in codes(P["stale.html"])
        assert "js_ext_syntax" in codes(P["ext_bad.html"]) and P["ext_bad.html"]["status"] == "bad"
        assert "orphan" in codes(P["orphan.html"])
        assert "no_charset" in codes(P["nocharset.html"])
        assert "script_missing" in codes(P["missing_script.html"])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_fixture_zone_map_and_dangling():
    tmp = Path(tempfile.mkdtemp())
    try:
        build_fixture(tmp)
        res = Z.scan(tmp)
        P = by_name(res)
        assert P["ok.html"]["zones"] == ["a"] and P["ok.html"]["zone_basis"] == "選單設定檔"
        assert P["orphan.html"]["zone_basis"] == "資料夾推測"
        dang = {(d["zone"], d["ref"]) for d in res["dangling"]}
        assert ("a", "modules/worship/ghost.html") in dang, dang
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_fixture_outputs_are_written():
    tmp = Path(tempfile.mkdtemp())
    try:
        build_fixture(tmp)
        Z.run(tmp)
        for rel in (
            "church_ministry/docs/ZONE_PAGE_MAP_V1.md",
            "church_ministry/docs/ZONE_STATIC_SCAN_V1.md",
            "church_ministry/audit/zone_scan_data.json",
            "church_ministry/audit/zone_scan_pages.csv",
            "church_ministry/audit/zone_scan_dashboard.html",
        ):
            p = tmp / rel
            assert p.exists() and p.stat().st_size > 200, rel
        data = json.loads((tmp / "church_ministry/audit/zone_scan_data.json").read_text(encoding="utf-8"))
        assert len(data["pages"]) >= 13
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ───────── 真專案的結構不變量 ─────────

_REAL = {}


def real():
    if "r" not in _REAL:
        _REAL["r"] = Z.scan(ROOT)
    return _REAL["r"]


def test_real_every_page_has_one_valid_status_and_zone():
    r = real()
    assert len(r["pages"]) >= 250, len(r["pages"])
    for p in r["pages"]:
        assert p["status"] in ("ok", "warn", "bad", "stub"), p["path"]
        assert p["zones"] and all(z in Z.ZONE_LABELS for z in p["zones"]), p["path"]


def test_real_every_menu_page_is_scanned():
    r = real()
    scanned = {p["path"] for p in r["pages"]}
    for z, paths in r["ssot_pages"].items():
        for rel in paths:
            assert rel in scanned, f"選單頁沒掃到：{z} {rel}"


def test_real_all_eight_zones_plus_crm_have_menu_pages():
    r = real()
    for z in Z.ZONE_ORDER:
        assert r["ssot_pages"].get(z), f"{z} 區沒有讀到任何選單頁（設定檔格式變了？）"


# 已知未解（資料缺件，待確認；非程式錯）：舊版整全曲譜索引缺 FrontPage 資料檔
KNOWN_OPEN = {"hymn_management/hymn/default.htm"}


def test_real_no_reachable_page_has_p0_or_p1():
    """使用者走得到的頁，不得有 JS 語法錯、缺腳本、斷連結（防止回退）。"""
    r = real()
    bad = [
        (p["path"], [(c, d) for c, s, d in p["issues"] if s in ("P0", "P1")][:2])
        for p in r["pages"]
        if p["reachable"] and p["status"] == "bad" and p["path"] not in KNOWN_OPEN
    ]
    assert not bad, bad


# 已知失效且沒有任何頁面引用的舊檔（整檔被存成一行 \n 字面字串，已損毀）
KNOWN_DEAD_JS = {"js/global_nav.js"}


def test_real_shared_scripts_have_no_syntax_errors():
    """js/、church_ministry/js/、church_planning/js/ 每一支腳本都要能編譯（含動態載入的）。"""
    r = real()
    assert r["js_files_checked"] >= 200, r["js_files_checked"]
    bad = [e for e in r["js_syntax_errors"] if e["path"] not in KNOWN_DEAD_JS]
    assert not bad, bad
    # 已知失效檔確實沒人引用（若有人引用了，就不能再當「已知」放行）
    import subprocess
    out = subprocess.run(["rg", "-l", "global_nav\\.js", "--glob", "*.html", "--glob", "*.js", str(ROOT)],
                         capture_output=True, text=True, encoding="utf-8")
    users = [x for x in out.stdout.splitlines() if "ZONE_" not in x and "/audit/" not in x.replace("\\", "/")
             and not x.replace("\\", "/").endswith("js/global_nav.js") and "test_cm_zone_scan" not in x]
    assert not users, users


def test_real_scan_is_reproducible():
    a = json.dumps(Z.scan(ROOT), ensure_ascii=False, sort_keys=True, default=str)
    b = json.dumps(Z.scan(ROOT), ensure_ascii=False, sort_keys=True, default=str)
    assert a == b


def test_real_syntax_check_actually_ran():
    r = real()
    assert r["node_available"] and not r["syntax_unavailable"], "沒有 Node，語法檢查沒跑"


def test_real_outputs_written_to_temp():
    tmp = Path(tempfile.mkdtemp())
    try:
        Z.run(ROOT, out_docs=tmp / "docs", out_audit=tmp / "audit")
        assert (tmp / "docs" / "ZONE_PAGE_MAP_V1.md").stat().st_size > 1000
        assert (tmp / "audit" / "zone_scan_pages.csv").stat().st_size > 1000
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


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
