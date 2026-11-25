#!/usr/bin/env python3
"""
P3 領袖培育路徑（C 區）：見習 → 影隨 → 晉升條件 → 牧者人工同意

- 只記人做的每一步（事件流），不自動晉升、不改會友資料、不連網、不呼叫 AI
- 狀態由事件推導（含補登日期、暫停不計天數、已晉升後不再變動）
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = ROOT / "church_ministry" / "js" / "cm_leader_path_config.js"
PANEL_JS = ROOT / "church_ministry" / "js" / "cm_leader_path_panel.js"
HTML = ROOT / "church_ministry" / "modules" / "education" / "leader_path_panel.html"
DISC = ROOT / "church_ministry" / "modules" / "education" / "edu_discipleship.html"
CONSTANTS = ROOT / "js" / "church_crm_constants.js"
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


PRELUDE = r"""
const C = require(%r);
const DAY = 86400000;
const T0 = Date.parse('2026-01-01T12:00:00Z');
const iso = (ms) => new Date(ms).toISOString();
const ev = (step, ms) => ({ event_type: 'leader_path', member_id: '7', ts: iso(ms), metadata: { step } });
""" % str(CFG)


def test_config_defaults_are_small_white_editable():
    out = run_node(PRELUDE + r"""
    console.log(JSON.stringify({crit: C.CRITERIA, steps: C.STEPS, type: C.EVENT_TYPE}));
    """)
    assert out["crit"] == {"min_apprentice_days": 90, "min_shadow_sessions": 3, "require_baptized": True}, out
    assert out["steps"] == ["invited", "apprentice", "shadow", "paused", "promoted"], out
    assert out["type"] == "leader_path"


def test_derive_basic_stages():
    out = run_node(PRELUDE + r"""
    const none = C.deriveLeaderPath([], T0);
    const invited = C.deriveLeaderPath([ev('invited', T0)], T0 + DAY);
    const app = C.deriveLeaderPath([ev('apprentice', T0)], T0 + 100 * DAY);
    console.log(JSON.stringify({none: none.stage, invited: invited.stage, app: app.stage, appDays: app.activeDays}));
    """)
    assert out == {"none": "none", "invited": "invited", "app": "apprentice", "appDays": 100}, out


def test_shadow_counts_only_after_apprentice_start():
    out = run_node(PRELUDE + r"""
    const p = C.deriveLeaderPath([
      ev('shadow', T0 - 5 * DAY),      // 見習前的影隨不算
      ev('apprentice', T0),
      ev('shadow', T0 + 10 * DAY), ev('shadow', T0 + 20 * DAY)
    ], T0 + 30 * DAY);
    console.log(JSON.stringify({shadow: p.shadowCount, days: p.activeDays}));
    """)
    assert out == {"shadow": 2, "days": 30}, out


def test_pause_days_are_not_counted():
    out = run_node(PRELUDE + r"""
    const p = C.deriveLeaderPath([
      ev('apprentice', T0), ev('paused', T0 + 30 * DAY), ev('apprentice', T0 + 60 * DAY)
    ], T0 + 100 * DAY);
    const stillPaused = C.deriveLeaderPath([ev('apprentice', T0), ev('paused', T0 + 30 * DAY)], T0 + 100 * DAY);
    console.log(JSON.stringify({days: p.activeDays, stage: p.stage, pausedDays: stillPaused.activeDays, pausedStage: stillPaused.stage}));
    """)
    assert out == {"days": 70, "stage": "apprentice", "pausedDays": 30, "pausedStage": "paused"}, out


def test_promoted_is_terminal_and_freezes_days():
    out = run_node(PRELUDE + r"""
    const p = C.deriveLeaderPath([
      ev('apprentice', T0), ev('promoted', T0 + 95 * DAY),
      ev('paused', T0 + 100 * DAY), ev('apprentice', T0 + 110 * DAY)
    ], T0 + 300 * DAY);
    console.log(JSON.stringify({stage: p.stage, days: p.activeDays, promoted: !!p.promotedMs}));
    """)
    assert out == {"stage": "leader", "days": 95, "promoted": True}, out


def test_invalid_events_are_ignored():
    out = run_node(PRELUDE + r"""
    const p = C.deriveLeaderPath([
      { event_type: 'red_flag', metadata: { step: 'apprentice' }, ts: iso(T0) },   // 其他類型
      { event_type: 'leader_path', metadata: { step: 'nonsense' }, ts: iso(T0) },  // 未知步驟
      { event_type: 'leader_path', metadata: { step: 'apprentice' }, ts: 'not-a-date' },
      { event_type: 'leader_path', ts: iso(T0) }, null, undefined
    ], T0 + 10 * DAY);
    const notArray = C.deriveLeaderPath(null, T0);
    console.log(JSON.stringify({stage: p.stage, steps: p.steps, na: notArray.stage}));
    """)
    assert out == {"stage": "none", "steps": 0, "na": "none"}, out


def test_promotion_checklist_and_ready_flag():
    out = run_node(PRELUDE + r"""
    const evs = [ev('apprentice', T0), ev('shadow', T0 + 10 * DAY), ev('shadow', T0 + 40 * DAY), ev('shadow', T0 + 70 * DAY)];
    const path = C.deriveLeaderPath(evs, T0 + 100 * DAY);
    const ok = C.evaluatePromotion(path, { baptized: true });
    const unknownBaptism = C.evaluatePromotion(path, {});
    const noMember = C.evaluatePromotion(path, null);
    const notRequired = C.evaluatePromotion(path, null, { require_baptized: false });
    const early = C.evaluatePromotion(C.deriveLeaderPath(evs, T0 + 30 * DAY), { baptized: true });
    const invited = C.evaluatePromotion(C.deriveLeaderPath([ev('invited', T0)], T0 + 200 * DAY), { baptized: true });
    console.log(JSON.stringify({
      ok: ok.ready, okItems: ok.items.length,
      unk: unknownBaptism.ready, unkUnmet: unknownBaptism.unmet.map(u => u.id),
      noMember: noMember.ready,
      notReq: notRequired.ready, notReqItems: notRequired.items.length,
      earlyReady: early.ready, earlyUnmet: early.unmet.map(u => u.id),
      invitedReady: invited.ready
    }));
    """)
    assert out["ok"] is True and out["okItems"] == 4, out
    assert out["unk"] is False and out["unkUnmet"] == ["baptized"], out
    assert out["noMember"] is False, out
    assert out["notReq"] is True and out["notReqItems"] == 3, out
    assert out["earlyReady"] is False and out["earlyUnmet"] == ["days"], out
    assert out["invitedReady"] is False, out


def test_criteria_override_is_respected():
    out = run_node(PRELUDE + r"""
    const evs = [ev('apprentice', T0), ev('shadow', T0 + 5 * DAY)];
    const path = C.deriveLeaderPath(evs, T0 + 20 * DAY);
    const strict = C.evaluatePromotion(path, { baptized: true });
    const loose = C.evaluatePromotion(path, { baptized: true }, { min_apprentice_days: 14, min_shadow_sessions: 1 });
    console.log(JSON.stringify({strict: strict.ready, loose: loose.ready}));
    """)
    assert out == {"strict": False, "loose": True}, out


def test_build_step_payload_rules():
    out = run_node(PRELUDE + r"""
    const now = Date.parse('2026-06-15T10:00:00Z');
    const today = C.buildStepPayload('shadow', '', now);
    const back = C.buildStepPayload('apprentice', '2026-03-01', now);
    const future = C.buildStepPayload('apprentice', '2026-12-31', now);
    const bad = C.buildStepPayload('apprentice', '03/01/2026', now);
    const unknown = C.buildStepPayload('hack', '', now);
    console.log(JSON.stringify({
      todayOk: today.ok, todayType: today.payload.event_type, todayStep: today.payload.metadata.step, human: today.payload.metadata.human_marked,
      backOk: back.ok, backDate: back.payload.ts.slice(0, 7),
      futureOk: future.ok, badOk: bad.ok, unknownOk: unknown.ok
    }));
    """)
    assert out["todayOk"] and out["todayType"] == "leader_path" and out["todayStep"] == "shadow" and out["human"] is True, out
    assert out["backOk"] and out["backDate"] == "2026-03", out
    assert out["futureOk"] is False and out["badOk"] is False and out["unknownOk"] is False, out


def test_next_steps_only_meaningful_buttons():
    out = run_node(PRELUDE + r"""
    console.log(JSON.stringify({
      none: C.nextSteps('none'), invited: C.nextSteps('invited'),
      apprentice: C.nextSteps('apprentice'), paused: C.nextSteps('paused'), leader: C.nextSteps('leader')
    }));
    """)
    assert out["none"] == ["invited", "apprentice"], out
    assert out["invited"] == ["apprentice"], out
    assert out["apprentice"] == ["shadow", "paused", "promoted"], out
    assert out["paused"] == ["apprentice"], out
    assert out["leader"] == [], out


def test_summary_text_is_descriptive_not_deciding():
    out = run_node(PRELUDE + r"""
    const evs = [ev('apprentice', T0), ev('shadow', T0 + 10 * DAY)];
    const path = C.deriveLeaderPath(evs, T0 + 100 * DAY);
    const e = C.evaluatePromotion(path, { baptized: true });
    console.log(JSON.stringify({text: C.buildSummaryText({name: '王小明', path, evaluation: e})}));
    """)
    t = out["text"]
    assert "王小明" in t and "見習中" in t, t
    assert "✔" in t and "○" in t, t
    assert "牧者決定" in t, t
    assert "條件尚未齊全" in t, t


def test_event_type_registered_without_touching_five_stages():
    c = read(CONSTANTS)
    assert "leader_path:" in c
    # 五階枚舉不得被改（慕道、初信、成長、服事、領袖）
    for sid in ("seeker", "new_believer", "growing", "serving", "leader"):
        assert f"id: '{sid}'" in c
    assert "apprentice" not in c, "見習不得加進屬靈階段五階"


def test_panel_and_html_wired():
    h = read(HTML)
    for key in ('id="lp-card"', 'id="lp-member"', 'id="lp-date"', 'id="lp-actions"', 'id="lp-checklist"', 'id="lp-ready"', 'id="lp-copy"', 'id="lp-overview"', "30 秒看懂"):
        assert key in h, key
    i_cfg = h.find("cm_leader_path_config.js")
    i_panel = h.find("cm_leader_path_panel.js")
    assert 0 < i_cfg < i_panel, "config must load before panel"
    assert "church_data_bridge.js" in h
    p = read(PANEL_JS)
    assert "appendPastoralEvent" in p and "confirm(" in p and 'step === "promoted"' in p
    assert "CmLeaderPathConfig" in p


def test_panel_never_writes_member_or_calls_network_or_ai():
    for path in (CFG, PANEL_JS):
        js = read(path)
        for banned in ("fetch(", "XMLHttpRequest", "sendBeacon", "openai", "gemini", "ChatGPT", "B100PromptGuardrails", "WebSocket"):
            assert banned not in js, f"{path.name} must not contain {banned}"
    p = read(PANEL_JS)
    for banned in ("saveMemberSystemData", "updateMember", "setMemberStage", "spiritual_journey_stage"):
        assert banned not in p, f"panel must not modify member data: {banned}"


def test_entry_link_from_discipleship_tab():
    d = read(DISC)
    assert 'href="leader_path_panel.html"' in d
    assert 'target="_top"' not in d.split("leader_path_panel.html")[1].split("</p>")[0], "must open inside the same iframe"


def test_plan_documents_p3():
    p = read(PLAN)
    assert "### 5.4 P3 規格" in p
    assert "leader_path" in p and "leader_path_panel.html" in p
    assert "cm_leader_path_config.js" in p


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
