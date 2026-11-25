#!/usr/bin/env python3
"""
規模檔位設定檔 + A–H 區對照（MRM_ENGINEERING_PLAN_V1 §1、§1.1、§4.1）

- 四檔區間：微 <50、小 50–149、中 150–499、大 500+（下限含、上限不含）
- 預設開啟／收起清單與牧者指定一致
- 缺席預警門檻預設由設定檔讀取（未載入時退回 14）
- 計畫書：F 樂以載道不排入波次，只在 A 列註記
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIER_JS = ROOT / "church_ministry" / "js" / "cm_size_tier_config.js"
HUB_JS = ROOT / "church_ministry" / "js" / "pastoral_data_hub.js"
PANEL = ROOT / "church_ministry" / "modules" / "fellowship" / "pastoral_alerts_panel.html"
PLAN = ROOT / "church_ministry" / "docs" / "MRM_ENGINEERING_PLAN_V1.md"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def run_node(script: str) -> dict:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node not found")
    res = subprocess.run([node, "-e", script], capture_output=True, text=True, encoding="utf-8", timeout=30)
    if res.returncode != 0:
        raise RuntimeError(res.stderr or res.stdout)
    return json.loads(res.stdout.strip().splitlines()[-1])


def test_tier_config_shape_and_order():
    out = run_node(r"""
    const C = require(%r);
    console.log(JSON.stringify({ids: C.TIERS.map(t=>t.id), labels: C.TIERS.map(t=>t.label_zh), ranges: C.TIERS.map(t=>[t.min,t.max])}));
    """ % str(TIER_JS))
    assert out["ids"] == ["micro", "small", "medium", "large"], out
    assert out["labels"] == ["微", "小", "中", "大"], out
    assert out["ranges"] == [[0, 50], [50, 150], [150, 500], [500, None]], out


def test_tier_boundaries():
    out = run_node(r"""
    const C = require(%r);
    const pts = [0, 49, 50, 149, 150, 499, 500, 9999, -5, NaN, 'abc'];
    console.log(JSON.stringify(pts.map(n => C.tierFor(n).id)));
    """ % str(TIER_JS))
    assert out == ["micro", "micro", "small", "small", "medium", "medium", "large", "large", "micro", "micro", "micro"], out


def test_default_open_and_collapsed_lists_match_decision():
    out = run_node(r"""
    const C = require(%r);
    const by = Object.fromEntries(C.TIERS.map(t=>[t.id, t]));
    console.log(JSON.stringify({
      microOpen: by.micro.default_open, microCol: by.micro.default_collapsed,
      smallOpen: by.small.default_open, smallCol: by.small.default_collapsed,
      mediumOpen: by.medium.default_open, mediumCol: by.medium.default_collapsed,
      largeOpen: by.large.default_open, largeCol: by.large.default_collapsed
    }));
    """ % str(TIER_JS))
    assert out["microOpen"] == ["名冊", "預警", "紅旗", "AI 草稿"], out
    assert out["microCol"] == ["配對", "多部門看板", "審計"], out
    assert set(["新人漏斗", "排班建議"]).issubset(out["smallOpen"]), out
    assert out["smallCol"] == ["多分堂權限"], out
    assert set(["跨部門 360", "每週 PDCA 摘要"]).issubset(out["mediumOpen"]), out
    assert out["mediumCol"] == ["多堂點隔離"], out
    assert out["largeOpen"] == ["全部功能"] and out["largeCol"] == [], out


def test_absence_threshold_defaults_from_config():
    out = run_node(r"""
    const vm = require('vm'); const fs = require('fs');
    function loadHub(withCfg, cfgOverride) {
      const store = {};
      const win = { localStorage: {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); }
      } };
      const ctx = { window: win, console };
      vm.createContext(ctx);
      if (withCfg) {
        vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
        if (cfgOverride) win.CmSizeTierConfig.ABSENCE_THRESHOLD_DEFAULT_DAYS = cfgOverride;
      }
      vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
      return win.PastoralDataHub.getAbsenceThreshold();
    }
    const noCfg = loadHub(false);
    const withCfg = loadHub(true);
    const overridden = loadHub(true, 21);
    console.log(JSON.stringify({noCfgDays: noCfg.days, withCfgDays: withCfg.days, withCfgChoices: withCfg.choices, overriddenDays: overridden.days, overriddenWeeks: overridden.weeks}));
    """ % (str(TIER_JS), str(HUB_JS)))
    assert out["noCfgDays"] == 14, out
    assert out["withCfgDays"] == 14, out
    assert out["withCfgChoices"] == [7, 14, 21, 28], out
    assert out["overriddenDays"] == 21 and out["overriddenWeeks"] == 3, out


def test_alerts_panel_loads_tier_config_before_hub():
    h = read(PANEL)
    i_cfg = h.find("cm_size_tier_config.js")
    i_hub = h.find("pastoral_data_hub.js")
    assert i_cfg > 0 and i_hub > 0, "panel must load both scripts"
    assert i_cfg < i_hub, "tier config must load before hub"


def test_config_is_pure_no_network_or_ai():
    js = read(TIER_JS)
    for banned in ("fetch(", "XMLHttpRequest", "openai", "gemini", "ChatGPT"):
        assert banned not in js, f"tier config must not contain {banned}"


def test_plan_sections_updated():
    p = read(PLAN)
    assert "四檔規模用「檔位」切換，不分叉程式碼" in p
    assert "每個模組可獨立運作" in p and "紅旗、預警、領袖路徑都不得依賴他模" in p
    assert "| 微 | 不滿 50 人 |" in p
    assert "| 小 | 50–149 人 |" in p
    assert "| 中 | 150–499 人 |" in p
    assert "主日平均出席" in p
    assert "| 大 | 500 人以上 |" in p
    assert "cm_size_tier_config.js" in p
    assert "### 4.1 A–H 區對照" in p
    assert "| **A** | 崇拜聖樂 |" in p
    assert "| **H** | 出席系統 |" in p
    # F 樂以載道不排入計畫：不得出現 F 列的波次列，只允許在 A 列註記
    assert "| **F** |" not in p, "F must not be a row in the zone table"
    assert "F 樂以載道" in p and "不排入本計畫" in p


def test_range_labels_in_config():
    out = run_node(r"""
    const C = require(%r);
    console.log(JSON.stringify({r: C.TIERS.map(t=>t.range_zh), f: C.TIERS.map(t=>t.full_zh), basis: C.BASIS_ZH}));
    """ % str(TIER_JS))
    assert out["r"] == ["不滿 50 人", "50–149 人", "150–499 人", "500 人以上"], out
    assert "主日平均出席" in out["basis"], out


def test_no_old_size_numbers_left_in_ui():
    """全站舊口徑（≤80／81–250／251+、<30／30–120）不得殘留在頁面或腳本。"""
    banned = ["≤80", "81–250", "251+", "微型 &lt;30", "30–120", "120–400"]
    skip_dirs = {"_archive", "archive", "backups", "node_modules", ".git", "data", "tests", "docs"}
    hits = []
    for ext in ("*.html", "*.js"):
        for p in ROOT.rglob(ext):
            rel = p.relative_to(ROOT).parts
            if rel[0] not in ("church_ministry", "church_planning", "js"):
                continue
            if any(part in skip_dirs for part in rel):
                continue
            t = read(p)
            for b in banned:
                if b in t:
                    hits.append((str(p.relative_to(ROOT)), b))
    assert not hits, hits


def test_rail_has_four_size_buttons_and_allows_medium():
    h = read(ROOT / "church_ministry" / "church_main_rail.html")
    for key in ("micro", "small", "medium", "large"):
        assert f'data-size="{key}"' in h, key
    assert "medium: 1" in h
    labels = read(ROOT / "church_ministry" / "js" / "church_size_nav.js")
    assert "不滿 50 人" in labels and "500 人以上" in labels


def test_planning_maps_medium_without_overwriting_shared_key():
    a = read(ROOT / "church_planning" / "js" / "planning_landing_multimode.js")
    b = read(ROOT / "church_planning" / "js" / "planning_sidebar_preview_v21.js")
    assert 'size === "medium"' in a and "roadmapKey" in a
    assert 'rawSize === "medium"' in b
    # 寫入鍵時保留 medium，而不是被改成 micro/large
    assert 'lsSet(size === "medium" ? "medium" : view)' in a
    assert 'lsSet(SIZE_KEY, rawSize === "medium" ? "medium" : size)' in b


def test_alerts_panel_beginner_guide_and_plain_wording():
    h = read(PANEL)
    assert 'id="pa-guide"' in h and "30 秒看懂" in h
    assert 'href="#rf-card"' in h and 'href="#pa-absence"' in h and 'id="pa-absence"' in h
    for cantonese in ("邊個", "冇", "唔會", "嘅", "呢度", "睇下", "俾"):
        assert cantonese not in h, f"unify wording: found {cantonese}"
    # 載入試用資料前必須確認（會寫入約 40 位示範會友）
    assert "window.confirm(" in h and "40" in h
    panel = read(ROOT / "church_ministry" / "js" / "cm_red_flag_panel.js")
    for plain in ("我來跟進", "先擱置", "已處理完", "重新打開"):
        assert plain in panel, plain


if __name__ == "__main__":
    failed = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except Exception as e:
                failed += 1
                print("FAIL", name, e)
    sys.exit(1 if failed else 0)
