#!/usr/bin/env python3
"""CM sidebar IA v1 + G zone + gateway tabs + topbar labels."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SIDEBAR = ROOT / "church_ministry" / "sidebar_church_layout_v1.html"
GATEWAY = ROOT / "church_ministry" / "_landing" / "gateway.html"
MODES = ROOT / "config" / "modes.json"
EMBED = ROOT / "js" / "config-embedded.js"
INDEX = ROOT / "index_v5.html"
PLAN_SB = ROOT / "church_planning" / "sidebar_plan.html"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def test_sidebar_removed_clutter():
    html = read(SIDEBAR)
    for bad in (
        "sb-lang-row",
        "回規劃（五年計劃",
        "教會選路",
        "三條河總覽",
        "今日常用",
        "主日一桌",
        "探訪工作桌",
        "小组工作桌",
        "事工戰情儀表板",
        "進階 · Advanced",
        "舊 index",
        "離開本模組／換左欄",
        "聖經百步四寶",
    ):
        assert bad not in html, f"sidebar still contains {bad!r}"


def test_sidebar_g_order():
    html = read(SIDEBAR)
    dash = html.find("數據儀表")
    plan = html.find("五年計劃戰略路徑")
    fin = html.find("財務事工 · Finance")
    assert dash >= 0 and plan > dash and fin > plan, "G section order: dash -> plan -> finance"


def test_sidebar_ag_labels():
    html = read(SIDEBAR)
    for good in (
        "A 敬拜音樂",
        "B 牧養小組",
        "C 聖經門訓",
        "D 外展差傳",
        "E 社會服務",
        "F 詩歌應用",
        "G 規劃行政",
        "主日聚會",
        "探訪事工",
        "小組事工",
        "整全資訊曲譜",
        "預算規劃",
    ):
        assert good in html, f"sidebar missing {good!r}"


def test_gateway_top_tabs():
    html = read(GATEWAY)
    assert "cm-gw-tabs" in html
    assert "路線首頁" in html
    for tab in ("tab=overview", "tab=members", "tab=groups", "tab=ministry", "tab=growth", "tab=analysis"):
        assert tab in html, f"gateway missing {tab!r}"


def test_modes_g_dashboard():
    modes = json.loads(read(MODES))["modes"]
    church = next(m for m in modes if m["id"] == "church")
    g = [x for x in church["secondaryNav"] if x.get("labelZh") == "G 規劃行政"][0]
    assert "dashboard.html" in g["path"]
    assert "focus=g" in g["sidebar"]
    assert "sidebar_plan" not in g["sidebar"]


def test_embedded_g_dashboard():
    embed = read(EMBED)
    assert "church_ministry/dashboard.html" in embed
    assert "sidebar_church_layout_v1.html?focus=g" in embed


def test_topbar_church_full_labels():
    html = read(INDEX)
    assert "useShort: false" in html or "useShort:false" in html.replace(" ", "")


def test_cm_sidebar_g_planning_steps():
    html = read(SIDEBAR)
    assert "cm-plan-step" in html
    assert "cm-planning-sidebar-tools-step2" in html
    assert "cm-planning-sidebar-tools-extended" in html
    assert "planning_sidebar_render.js" in html
    assert "步 2 健康診斷 · 17 正式量表" in html
    assert "延伸版本（暫不寫戰情室）" in html
    assert "深度規劃工作坊" in html


def test_plan_sidebar_slim():
    html = read(PLAN_SB)
    assert "各項工具量表（點此收合）" not in html
    assert "步 1 屬靈前言" in html
    assert "量表超市" in html
    assert "planning-sidebar-tools-step2" in html
    assert "planning_sidebar_render.js" in html


if __name__ == "__main__":
    tests = [
        test_sidebar_removed_clutter,
        test_sidebar_g_order,
        test_sidebar_ag_labels,
        test_gateway_top_tabs,
        test_modes_g_dashboard,
        test_embedded_g_dashboard,
        test_topbar_church_full_labels,
        test_cm_sidebar_g_planning_steps,
        test_plan_sidebar_slim,
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
