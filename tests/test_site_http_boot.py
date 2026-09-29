# -*- coding: utf-8 -*-
"""总站 HTTP 启动文件静态检查"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_site_http_probe_exists():
    p = ROOT / "js" / "site_http_probe.js"
    assert p.is_file()
    assert "__B100_SITE_HTTP__" in p.read_text(encoding="utf-8")


def test_site_http_boot_exists():
    p = ROOT / "js" / "b100_site_http_boot.js"
    t = p.read_text(encoding="utf-8")
    assert "8080" in t
    assert "redirectIfLive" in t


def test_index_html_boots_http():
    t = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "b100_site_http_boot.js" in t
    assert "Bible100一键开启" in t


def test_root_launcher_bat():
    bat = ROOT / "打开Bible100.bat"
    assert bat.is_file()
    t = bat.read_text(encoding="utf-8")
    assert "8080" in t
    assert "index_v5.html" in t


def test_live_db_bridge_multi_port():
    t = (ROOT / "bible_app" / "shell" / "js" / "live_db_bridge.js").read_text(encoding="utf-8")
    assert "8080" in t
    assert "getHubUrl" in t


def test_track_bat_delegates_to_site():
    t = (ROOT / "bible_app" / "打開聖經跑道.bat").read_text(encoding="utf-8")
    assert "打开Bible100.bat" in t


if __name__ == "__main__":
    tests = [v for k, v in globals().items() if k.startswith("test_") and callable(v)]
    for fn in tests:
        fn()
        print("OK", fn.__name__)
    print("ALL OK", len(tests))
