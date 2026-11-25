#!/usr/bin/env python3
"""
階段 2 動態檢查器的「自我測試」：用故意做壞的小頁，確認檢查器真的抓得到、也不會亂按危險按鈕。
找不到 Edge／Chrome 時整檔略過（不算失敗）。
"""
import importlib.util
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "church_ministry" / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("cm_zone_dynamic", SCRIPTS / "cm_zone_dynamic.py")
D = importlib.util.module_from_spec(spec)
sys.modules["cm_zone_dynamic"] = D
spec.loader.exec_module(D)

TEXT = "這是一個內容完整的頁面，" * 30


def page(body, head=""):
    return f'<!DOCTYPE html><html><head><meta charset="UTF-8"><title>t</title>{head}</head><body>{body}</body></html>'


FIXTURES = {
    "ok.html": page(f"<p>{TEXT}</p><button onclick=\"document.title='x'\">看更多</button>"),
    "throw.html": page(f"<p>{TEXT}</p><script>throw new Error('boom');</script>"),
    "blank.html": page(""),
    "script404.html": page(f'<p>{TEXT}</p><script src="missing_file.js"></script>'),
    "clickboom.html": page(f"<p>{TEXT}</p><button onclick=\"throw new Error('click-boom')\">展開</button>"),
    "undef.html": page(f"<p>{TEXT} 本月人數：undefined</p>"),
    "danger.html": page(f"<p>{TEXT}</p><button onclick=\"throw new Error('DANGER-CLICKED')\">刪除全部資料</button>"),
    "dialog.html": page(f"<p>{TEXT}</p><button onclick=\"alert('hi')\">提示</button>"),
    "nav.html": page(f"<p>{TEXT}</p><button onclick=\"location.href='ok.html'\">前往</button>"
                     "<button onclick=\"throw new Error('after-nav')\">之後的按鈕</button>"),
    "clip.html": page(f"<p>{TEXT}</p><button onclick=\"navigator.clipboard.writeText('x')\">複製</button>"),
}


def run_fixture():
    tmp = Path(tempfile.mkdtemp())
    for k, v in FIXTURES.items():
        (tmp / k).write_text(v, encoding="utf-8")
    shots = tmp / "shots"
    br = D.Browser(9225)
    out = {}
    try:
        for k in FIXTURES:
            out[k] = D.check_page(br, (tmp / k).as_uri(), k, shots)
    finally:
        br.close()
    return tmp, out


_CACHE = {}


def get():
    if "r" not in _CACHE:
        _CACHE["r"] = run_fixture()
    return _CACHE["r"][1]


def test_ok_page_passes_and_screenshot_saved():
    r = get()["ok.html"]
    assert r["status"] == "ok", (r["problems"], r["notes"])
    assert r["clicks"] >= 1
    tmp = _CACHE["r"][0]
    assert any((tmp / "shots").glob("*.jpg"))


def test_js_exception_detected():
    r = get()["throw.html"]
    assert r["status"] == "bad" and any("boom" in p for p in r["problems"]), r["problems"]


def test_blank_page_detected():
    r = get()["blank.html"]
    assert r["status"] == "bad" and any("空白" in p for p in r["problems"]), r["problems"]


def test_missing_script_is_noticed():
    r = get()["script404.html"]
    assert r["status"] in ("warn", "bad") and r["notes"] + r["problems"], r


def test_click_error_detected():
    r = get()["clickboom.html"]
    assert r["status"] == "bad" and r["click_errors"], r


def test_suspicious_text_flagged():
    r = get()["undef.html"]
    assert "undefined" in r["suspicious"] and r["status"] == "warn", r["notes"]


def test_danger_button_is_never_clicked():
    r = get()["danger.html"]
    assert r["status"] == "ok" and not r["click_errors"], (r["problems"], r["click_errors"])


def test_dialog_is_recorded_not_blocking():
    r = get()["dialog.html"]
    assert r["dialogs"] and r["status"] == "ok" and r["info"], r


def test_navigation_button_is_info_and_remaining_buttons_still_tested():
    r = get()["nav.html"]
    assert any("導向他頁" in i for i in r["info"]), r["info"]
    # 導向他頁後會回來繼續按，所以後面那顆會爆的按鈕仍要被抓到
    assert any("after-nav" in e["error"] for e in r["click_errors"]), r["click_errors"]


def test_clipboard_permission_is_not_a_page_error():
    r = get()["clip.html"]
    assert r["status"] == "ok" and not r["click_errors"], (r["problems"], r["click_errors"], r["info"])


def test_pick_pages_returns_bcg_pages():
    pages = D.pick_pages(["b", "c", "g"], ROOT, False)
    assert len(pages) >= 40 and {p["zone"] for p in pages} == {"b", "c", "g"}


def _cleanup():
    if "r" in _CACHE:
        shutil.rmtree(_CACHE["r"][0], ignore_errors=True)


if __name__ == "__main__":
    if not D.find_browser():
        print("SKIP: 找不到 Edge／Chrome")
        raise SystemExit(0)
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(e).__name__}: {e}")
    _cleanup()
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
