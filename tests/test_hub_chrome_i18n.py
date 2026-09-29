# -*- coding: utf-8 -*-
"""總站 index_v5 Chrome 四語靜態檢查。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_hub_pack_exists():
    js = read("js/hub_chrome_i18n_pack.js")
    assert "HubChromeI18nPack" in js
    for key in ("hub.brand", "hub.mode.church", "hub.sec.a", "hub.church.group.brain"):
        assert key in js


def test_index_v5_wires_ui_locale():
    html = read("index_v5.html")
    assert "b100_chrome_i18n.js" in html
    assert "hub_chrome_i18n_pack.js" in html
    assert "hub-lang-pills" in html
    assert 'data-locale="vi"' in html
    assert "getUiLocale" in html
    assert "applyHubChromeI18n" in html
    assert "refreshHubI18nUi" in html


def test_bridge_always_en_for_vi_id():
    js = read("js/b100_chrome_i18n.js")
    assert "primary === en" in js or "primary && primary === en" in js
    assert "bridgeHint" in js


def test_shell_appends_locale_to_cm():
    js = read("js/index_v5_shell.js")
    assert "appendLocale" in js
    assert "church_ministry" in js


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
