# -*- coding: utf-8 -*-
"""MRM P1 · 紅旗路徑 + AI 協談安全閘門 靜態／行為檢查。

對應：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §P1
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


# ---------- 紅旗設定 ----------

def test_red_flag_config_exists_and_shape():
    js = read("church_ministry/js/cm_red_flag_config.js")
    for key in (
        "CmRedFlagConfig",
        "DEFAULT_FLAGS",
        "NOTIFY_MIN",
        "buildNoticeText",
        "hasCrisis",
        'EVENT_TYPE: "red_flag"',
    ):
        assert key in js, f"config missing {key}"
    for fid in ("hospital", "bereavement", "job_loss", "self_harm", "violence", "abuse"):
        assert f'id: "{fid}"' in js, f"default flag missing {fid}"


def test_red_flag_not_ai_and_not_cloud():
    """紅旗檔案不得呼叫外部 AI／網路（人工標記、人工通知）。"""
    for rel in ("church_ministry/js/cm_red_flag_config.js", "church_ministry/js/cm_red_flag_panel.js"):
        js = read(rel)
        for bad in ("fetch(", "XMLHttpRequest", "openai", "generativelanguage", "gemini", "anthropic"):
            assert bad not in js.lower(), f"{rel} must not contain {bad}"


def test_notice_text_behavior_via_node():
    node = shutil.which("node")
    if not node:
        print("SKIP node not found")
        return
    code = (
        "const c=require(process.argv[1]);"
        "const a=c.buildNoticeText({name:'陳弟兄',memberId:'M001',flagIds:['hospital']});"
        "const b=c.buildNoticeText({flagIds:['self_harm']});"
        "console.log(JSON.stringify({a:a,b:b,min:c.NOTIFY_MIN,crisisA:c.hasCrisis(['hospital']),crisisB:c.hasCrisis(['self_harm'])}));"
    )
    out = subprocess.run(
        [node, "-e", code, str(CM / "js" / "cm_red_flag_config.js")],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=20,
    )
    assert out.returncode == 0, out.stderr
    data = json.loads(out.stdout.strip())
    assert data["min"] >= 2
    assert "陳弟兄" in data["a"] and "M001" in data["a"] and "住院" in data["a"]
    assert "請勿在群組" in data["a"] and "並非 AI 判斷" in data["a"]
    assert data["crisisA"] is False and data["crisisB"] is True
    assert "危機情境" not in data["a"], "non-crisis notice must not carry crisis line"
    assert "危機情境" in data["b"], "crisis notice must carry safety line"
    assert "未選會友" in data["b"], "notice must still work without a member"


# ---------- 面板 ----------

def test_panel_wired_and_standalone_friendly():
    html = read("church_ministry/modules/fellowship/pastoral_alerts_panel.html")
    for key in (
        'id="rf-card"',
        'id="rf-member"',
        'id="rf-flags"',
        'id="rf-mark"',
        'id="rf-copy"',
        'id="rf-notice"',
        "cm_red_flag_config.js",
        "cm_red_flag_panel.js",
        "cm_member_picker.js",
    ):
        assert key in html, f"panel missing {key}"
    # 紅旗不分規模檔位：卡片本身不得被 data-size-dept 摺疊
    card = html[html.index('id="rf-card"') : html.index('id="rf-card"') + 300]
    assert "data-size-dept" not in card


def test_panel_degrades_without_bridge():
    js = read("church_ministry/js/cm_red_flag_panel.js")
    assert "找不到會友資料底座" in js, "must degrade when ChurchDataBridge is missing"
    assert "通知稿已產生，但寫入紀錄失敗" in js, "write failure must not hide the notice"
    assert "navigator.clipboard" in js and "execCommand" in js, "copy needs fallback"
    # 無自由文字備註欄
    html = read("church_ministry/modules/fellowship/pastoral_alerts_panel.html")
    card_start = html.index('id="rf-card"')
    card_end = html.index("</section>", card_start)
    assert "<textarea" not in html[card_start:card_end]


def test_recent_list_uses_local_time():
    """最近紀錄須與通知稿同為本地時間，避免 UTC 與本地相差造成誤判。"""
    js = read("church_ministry/js/cm_red_flag_panel.js")
    assert "formatTime" in js
    assert "slice(11, 16)" not in js, "must not display raw UTC slice"
    assert "formatTime: formatTime" in read("church_ministry/js/cm_red_flag_config.js")


def test_event_type_registered():
    js = read("js/church_crm_constants.js")
    assert "red_flag" in js


# ---------- AI 協談閘門 ----------

def test_counsel_scenario_gate():
    t = read("js/ai_scenario_ssot.js")
    assert 'id: "counsel_boundary"' in t
    block = t[t.index('id: "counsel_boundary"') : t.index('workbench: "prompt"', t.index('id: "counsel_boundary"'))]
    assert "gate:" in block and "crisis_check" in block
    for gid in ("self_harm", "violence", "abuse", "sexual"):
        assert f'id: "{gid}"' in block, f"gate item missing {gid}"
    assert "不得編造" in block
    assert "此情境須立即交給牧者與專業協助" in block
    assert "AI 草稿，須牧者審核" in block
    # 不寫死任何地區熱線電話
    assert not re.search(r"\d{5,}", block), "do not hardcode hotline numbers"
    assert not re.search(r"\b\d{3}[-\s]?\d{3,}", block), "do not hardcode phone-like numbers"
    # 不是 featured（不放四故事線首頁）
    assert "featured: true" not in block


def test_workbench_blocks_copy_when_gate_fails():
    js = read("ai_tools/js/ai_prompt_workbench.js")
    for key in (
        "blocked: false",
        "function renderGate",
        "function loadScenario",
        "function copyPrompt",
        "state.blocked",
        "keepGate",
    ):
        assert key in js, f"workbench missing {key}"
    # copyPrompt 首段就要擋 blocked
    body = js[js.index("function copyPrompt") : js.index("function copyPrompt") + 260]
    assert "state.blocked" in body
    # 兩個入口（點選／URL 參數）都走 loadScenario
    assert js.count("loadScenario(sc)") >= 2


def test_gate_css_present():
    css = read("ai_tools/css/ai_workbench_shell.css")
    assert ".ai-wb-gate" in css and ".ai-wb-gate__blocked" in css


def test_guardrails_footer_still_applies():
    js = read("js/b100_prompt_guardrails.js")
    assert "不可编造经文" in js or "never invent" in js


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
            except Exception as e:  # noqa: BLE001
                print("ERROR", name, repr(e))
                fails += 1
    sys.exit(1 if fails else 0)
