#!/usr/bin/env python3
"""
P2 牧養閉環 · 自動測試（MRM_ENGINEERING_PLAN_V1 §6）

涵蓋：
- 紅旗狀態機（open / ack / done / snoozed）：純函式用 node 實測
- 每週 Check 摘要：純文字，不替人寫 Act
- 未聚會門檻：預設 14 天，可選 7/14/21/28，非法值回退；用 node vm 沙盒實測
- 面板接線與「不得留下下一波 P2 過時文字」
- 不得出現 AI／外部網路呼叫（紅旗與狀態不經 AI）
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = ROOT / "church_ministry" / "js" / "cm_red_flag_config.js"
PANEL = ROOT / "church_ministry" / "js" / "cm_red_flag_panel.js"
HUB = ROOT / "church_ministry" / "js" / "pastoral_data_hub.js"
CONST = ROOT / "js" / "church_crm_constants.js"
HTML = ROOT / "church_ministry" / "modules" / "fellowship" / "pastoral_alerts_panel.html"


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


def test_status_constants_registered():
    c = read(CONST)
    assert "red_flag_status" in c, "red_flag_status must be registered in PASTORAL_EVENT_TYPES"
    cfg = read(CFG)
    assert 'STATUS_EVENT_TYPE: STATUS_EVENT_TYPE' in cfg
    assert '"open", "ack", "done", "snoozed"' in cfg


def test_status_derivation_behavior():
    script = r"""
    const C = require(%r);
    const ev = [
      {event_id:'f1', event_type:'red_flag', member_id:'1', ts:'2026-11-24T10:00:00.000Z'},
      {event_id:'f2', event_type:'red_flag', member_id:'2', ts:'2026-11-24T11:00:00.000Z'},
      {event_id:'s1', event_type:'red_flag_status', member_id:'1', ts:'2026-11-24T12:00:00.000Z', metadata:{alert_id:'f1', status:'ack'}},
      {event_id:'s2', event_type:'red_flag_status', member_id:'1', ts:'2026-11-24T13:00:00.000Z', metadata:{alert_id:'f1', status:'done'}},
      {event_id:'s3', event_type:'red_flag_status', member_id:'2', ts:'2026-11-24T14:00:00.000Z', metadata:{alert_id:'f2', status:'bogus'}},
      {event_id:'s4', event_type:'red_flag_status', member_id:'9', ts:'2026-11-24T15:00:00.000Z', metadata:{alert_id:'nope', status:'done'}}
    ];
    // 較舊的狀態事件晚到（陣列順序亂）也不應覆蓋最新狀態
    const shuffled = [ev[3], ev[0], ev[2], ev[4], ev[1], ev[5]];
    const st = C.deriveFlagStatuses(shuffled);
    const none = C.deriveFlagStatuses([{event_id:'x', event_type:'red_flag', ts:'2026-11-24T01:00:00.000Z'}]);
    console.log(JSON.stringify({
      f1: st.f1.status, f2: st.f2.status, unknownAlertIgnored: !('nope' in st), noneOpen: none.x.status,
      labels: [C.statusLabel('open'), C.statusLabel('ack'), C.statusLabel('done'), C.statusLabel('snoozed'), C.statusLabel('weird')]
    }));
    """ % str(CFG)
    out = run_node(script)
    assert out["f1"] == "done", out
    assert out["f2"] == "open", "invalid status must fall back to open"
    assert out["unknownAlertIgnored"] is True
    assert out["noneOpen"] == "open"
    assert out["labels"] == ["待處理", "已認領", "已完成", "暫緩", "待處理"], out["labels"]


def test_weekly_summary_counts_and_no_ai_act():
    script = r"""
    const C = require(%r);
    const flags = [
      {event_id:'a', event_type:'red_flag', ts:'2026-11-23T02:00:00.000Z'},
      {event_id:'b', event_type:'red_flag', ts:'2026-11-18T02:00:00.000Z'}
    ];
    const statuses = C.deriveFlagStatuses(flags.concat([
      {event_id:'s', event_type:'red_flag_status', ts:'2026-11-24T01:00:00.000Z', metadata:{alert_id:'a', status:'ack'}}
    ]));
    const weekStart = Date.parse('2026-11-23T00:00:00.000Z');
    const text = C.buildWeeklySummaryText({flagEvents: flags, statuses, absenceCount: 3, weekStartMs: weekStart});
    console.log(JSON.stringify({text}));
    """ % str(CFG)
    text = run_node(script)["text"]
    assert "紅旗（本週新增）：1 筆" in text, text
    assert "已認領 1" in text, text
    assert "未聚會達門檻、待探訪：3 人" in text, text
    assert "成效判斷與下週行動由牧者填寫" in text, text


def test_threshold_default_14_and_choices():
    script = r"""
    const vm = require('vm'); const fs = require('fs');
    function load(storedValue) {
      const store = {};
      if (storedValue !== undefined) store['bible100_cm_absence_threshold_days'] = String(storedValue);
      const win = { localStorage: {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); }
      } };
      const ctx = { window: win, console };
      vm.createContext(ctx);
      vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
      return { H: win.PastoralDataHub, store };
    }
    const a = load();
    const defaultThr = a.H.getAbsenceThreshold();
    const b = load(21);
    const c = load(5);
    const set7 = a.H.setAbsenceThresholdDays(7);
    const setBad = a.H.setAbsenceThresholdDays(99);
    console.log(JSON.stringify({
      defaultDays: defaultThr.days, defaultWeeks: defaultThr.weeks, defaultExported: a.H.ABSENCE_ALERT_WEEKS,
      loadedDays: b.H.getAbsenceThreshold().days, loadedWeeks: b.H.getAbsenceThreshold().weeks,
      invalidStoredFallsBack: c.H.getAbsenceThreshold().days,
      set7: set7, setBadFallsBack: setBad.days, storedAfterSet: a.store['bible100_cm_absence_threshold_days'],
      exportedUpdated: a.H.ABSENCE_ALERT_WEEKS
    }));
    """ % str(HUB)
    out = run_node(script)
    assert out["defaultDays"] == 14, out
    assert out["defaultWeeks"] == 2, "14 天應換算為 2 週"
    assert out["defaultExported"] == 2
    assert out["loadedDays"] == 21 and out["loadedWeeks"] == 3
    assert out["invalidStoredFallsBack"] == 14
    assert out["set7"]["weeks"] == 1
    assert out["setBadFallsBack"] == 14
    assert out["storedAfterSet"] == "14"
    assert out["exportedUpdated"] == 2


def test_panel_and_html_wiring():
    p = read(PANEL)
    for key in ("setFlagStatus", "ACTIONS", "renderWeekly", "onCopyWeekly", "rf-week-copy", "rf-week-text", "STATUS_EVENT_TYPE"):
        assert key in p, f"panel missing {key}"
    h = read(HTML)
    assert 'id="rf-week-text"' in h and 'id="rf-week-copy"' in h
    assert 'id="pa-threshold"' in h
    assert 'value="14"' in h and "14 天（建議）" in h
    assert "setAbsenceThresholdDays" in h
    assert "下一波（P2）" not in h, "stale P2 placeholder text must be removed"
    assert "連續約 3 週" not in h, "hard-coded 3-week text must be removed"


def test_no_ai_or_network_in_p2_code():
    for path in (CFG, PANEL):
        js = read(path)
        for banned in ("fetch(", "XMLHttpRequest", "sendBeacon", "openai", "gemini", "ChatGPT", "B100PromptGuardrails", "WebSocket"):
            assert banned not in js, f"{path.name} must not contain {banned}"


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
