#!/usr/bin/env python3
"""Church top bar A-G full labels via modes + hub pack."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
MODES = ROOT / "config" / "modes.json"
EMBED = ROOT / "js" / "config-embedded.js"
HUB = ROOT / "js" / "hub_chrome_i18n_pack.js"
INDEX = ROOT / "index_v5.html"
CM_SB = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"


def read(p):
    return p.read_text(encoding="utf-8")


def test_modes_church_full_labels():
    modes = json.loads(read(MODES))["modes"]
    church = next(m for m in modes if m["id"] == "church")
    labels = [x["labelZh"] for x in church["secondaryNav"]]
    for want in (
        "A 敬拜音樂", "B 牧養小組", "C 聖經門訓", "D 外展差傳",
        "E 社會服務", "F 詩歌應用", "G 規劃行政",
    ):
        assert want in labels, f"modes.json missing {want!r}"


def test_embedded_matches_modes_g():
    embed = read(EMBED)
    assert "G 規劃行政" in embed
    assert "church_ministry/dashboard.html" in embed
    assert "focus=g" in embed


def test_hub_pack_full_names():
    hub = read(HUB)
    for bad in ("A. 敬拜", "B. 牧養", "C. 門訓", "D. 外展"):
        assert bad not in hub, f"hub pack still has old short label {bad!r}"
    for good in ("A 敬拜音樂", "G 規劃行政"):
        assert good in hub
    assert "church_ministry/dashboard.html': 'hub.sec.g'" in hub


def test_index_prefers_config_labels():
    html = read(INDEX)
    assert "preferConfig" in html or "useShort === false && item.labelZh" in html


def test_cm_sidebar_g_visible_planning():
    html = read(CM_SB)
    assert "五年計劃 · 量表超市" in html
    assert "cm-g-planning-details" in html
    assert "assessment-os-hub.html" in html


if __name__ == "__main__":
    tests = [
        test_modes_church_full_labels,
        test_embedded_matches_modes_g,
        test_hub_pack_full_names,
        test_index_prefers_config_labels,
        test_cm_sidebar_g_visible_planning,
    ]
    failed = 0
    for t in tests:
        try:
            t()
            print("OK", t.__name__)
        except AssertionError as e:
            failed += 1
            print("FAIL", t.__name__, e)
    sys.exit(1 if failed else 0)
