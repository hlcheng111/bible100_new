#!/usr/bin/env python3
"""
P4：E 區排班規則檢查、Google 連結設定檔、見習帶領包（AI 情境）、多語鍵

- 規則檢查只讀：不改排班、不通知、不連網、不呼叫 AI
- Google 連結：只接受 https 且在允許網域；空白＝「尚未設定」
- zh-Hant、en 為正式；vi／id 為機器草稿，頁面須標示「待人工校對」
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"
RULES = CM / "js" / "cm_shift_rules.js"
LINKS = CM / "js" / "cm_google_links_config.js"
PANEL = CM / "js" / "cm_shift_rules_panel.js"
PAGE = CM / "tools" / "volunteer_shift" / "rules_check.html"
TOOL = CM / "tools" / "volunteer_shift" / "tool.js"
LEADER = CM / "modules" / "education" / "leader_path_panel.html"
PACK = CM / "js" / "cm_chrome_i18n_pack.js"
SSOT = ROOT / "js" / "ai_scenario_ssot.js"
PLAN = CM / "docs" / "MRM_ENGINEERING_PLAN_V1.md"


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def run_node(script: str):
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node not found")
    res = subprocess.run([node, "-e", script], capture_output=True, text=True, encoding="utf-8", timeout=30)
    if res.returncode != 0:
        raise RuntimeError(res.stderr or res.stdout)
    return json.loads(res.stdout.strip().splitlines()[-1])


PRELUDE = r"""
const C = require(%r);
const NOW = new Date(2026, 10, 24, 12).getTime(); // 2026-11-24（週二）
const row = (o) => Object.assign({ id: Math.random().toString(36).slice(2), memberId: '1', memberName: '小明',
  ministryId: 'm1', ministryName: '招待', date: '2026-11-29', shift: '早堂', confirmed: true }, o);
const kinds = (r) => r.issues.map((i) => i.kind);
""" % str(RULES)


# ───────── 規則檢查 ─────────

def test_double_booked_same_slot():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([row({ministryId:'m1'}), row({ministryId:'m2', ministryName:'音響'})], {nowMs: NOW});
    console.log(JSON.stringify({k: kinds(r), sev: r.issues[0] && r.issues[0].severity, high: r.counts.high}));
    """)
    assert "double_booked" in out["k"] and out["high"] >= 1 and out["sev"] == "high", out


def test_different_shift_not_double_booked():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([row({shift:'早堂'}), row({shift:'晚堂', ministryId:'m2'})], {nowMs: NOW});
    console.log(JSON.stringify({k: kinds(r)}));
    """)
    assert "double_booked" not in out["k"], out


def test_uncovered_leave_and_not_counted_as_workload():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([row({leaveStatus:'leave_only'})], {nowMs: NOW});
    console.log(JSON.stringify({k: kinds(r), bal: r.balance.length}));
    """)
    assert out["k"] == ["uncovered_leave"] and out["bal"] == 0, out


def test_swapped_uses_substitute_for_double_booking():
    out = run_node(PRELUDE + r"""
    const swapped = row({memberId:'1', leaveStatus:'swapped', substituteMemberId:'2', substituteMemberName:'小華'});
    const other = row({memberId:'2', memberName:'小華', ministryId:'m2'});
    const r = C.checkSchedules([swapped, other], {nowMs: NOW});
    const d = r.issues.find((i) => i.kind === 'double_booked');
    console.log(JSON.stringify({has: !!d, name: d && d.name, leave: kinds(r).includes('uncovered_leave')}));
    """)
    assert out == {"has": True, "name": "小華", "leave": False}, out


def test_over_week_and_week_starts_monday():
    out = run_node(PRELUDE + r"""
    const rows = ['2026-11-25','2026-11-26','2026-11-27'].map((d, i) => row({memberId:'3', memberName:'小美', date:d, shift:'S'+i}));
    const r = C.checkSchedules(rows, {nowMs: NOW});
    console.log(JSON.stringify({k: kinds(r), wk1: C.weekKey('2026-11-29'), wk2: C.weekKey('2026-11-30')}));
    """)
    assert "over_week" in out["k"] and "over_month" not in out["k"], out
    assert out["wk1"] == "2026-11-23" and out["wk2"] == "2026-11-30", out


def test_over_month_with_override_rules():
    out = run_node(PRELUDE + r"""
    const rows = [row({date:'2026-11-24', shift:'a'}), row({date:'2026-11-30', shift:'b'}), row({date:'2026-11-30', shift:'c'})]
      .map((r) => Object.assign(r, {memberId:'4', memberName:'小強'}));
    const r = C.checkSchedules(rows, {nowMs: NOW, rules: {max_per_month: 2, max_per_week: 0}});
    console.log(JSON.stringify({k: kinds(r)}));
    """)
    assert out["k"] == ["over_month"], out


def test_unconfirmed_soon_only_within_days():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([
      row({date:'2026-11-26', confirmed:false}),
      row({memberId:'9', memberName:'遠', date:'2026-12-20', confirmed:false})
    ], {nowMs: NOW});
    console.log(JSON.stringify({n: r.issues.filter((i) => i.kind === 'unconfirmed_soon').length}));
    """)
    assert out["n"] == 1, out


def test_understaffed_needs_ministry_need():
    out = run_node(PRELUDE + r"""
    const rows = [row({memberId:'1'}), row({memberId:'2', memberName:'乙'})];
    const withNeed = C.checkSchedules(rows, {nowMs: NOW, ministries: [{id:'m1', name:'招待', needPeople:3}]});
    const noNeed = C.checkSchedules(rows, {nowMs: NOW, ministries: [{id:'m1', name:'招待'}]});
    console.log(JSON.stringify({a: kinds(withNeed), b: kinds(noNeed)}));
    """)
    assert out["a"] == ["understaffed"] and out["b"] == [], out


def test_uneven_is_low_and_needs_enough_people():
    out = run_node(PRELUDE + r"""
    const dates = ['2026-11-24','2026-11-25','2026-11-30','2026-12-01','2026-12-07','2026-12-08'];
    const heavy = dates.map((d, i) => row({memberId:'A', memberName:'甲', date:d, shift:'s'+i, ministryId:'m'+i}));
    const light = ['B','C','D'].map((n, i) => row({memberId:n, memberName:n, date:'2026-11-2'+(6+i), shift:'x', ministryId:'z'+i}));
    const off = {max_per_week: 0, max_per_month: 0};
    const r = C.checkSchedules(heavy.concat(light), {nowMs: NOW, rules: off});
    const few = C.checkSchedules(heavy.slice(0, 3).concat(light.slice(0, 1)), {nowMs: NOW, rules: off});
    const u = r.issues.find((i) => i.kind === 'uneven');
    console.log(JSON.stringify({has: !!u, sev: u && u.severity, fewHas: kinds(few).includes('uneven')}));
    """)
    assert out == {"has": True, "sev": "low", "fewHas": False}, out


def test_bad_dates_skipped_and_window_respected():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([
      row({date:'2026-13-45'}), row({date:''}), { id: 'x' }, null,
      row({date:'2026-11-01'}),       // 已過去
      row({date:'2027-03-01'}),       // 超出 30 天
      row({date:'2026-11-27', memberId:'8', memberName:'內'})
    ], {nowMs: NOW});
    console.log(JSON.stringify({scanned: r.scanned, skipped: r.skipped, from: r.window.from, to: r.window.to}));
    """)
    assert out["scanned"] == 1 and out["skipped"] == 4, out
    assert out["from"] == "2026-11-24" and out["to"] == "2026-12-24", out


def test_never_throws_on_junk_input():
    out = run_node(PRELUDE + r"""
    const a = C.checkSchedules(undefined);
    const b = C.checkSchedules('oops', {nowMs: 'x', rules: {max_per_week: 'bad'}});
    console.log(JSON.stringify({a: a.scanned, b: b.rules.max_per_week}));
    """)
    assert out == {"a": 0, "b": 2}, out


def test_report_and_prompt_rules_text():
    out = run_node(PRELUDE + r"""
    const r = C.checkSchedules([row({leaveStatus:'leave_only'})], {nowMs: NOW});
    console.log(JSON.stringify({rep: C.buildReportText(r), empty: C.buildReportText(C.checkSchedules([], {nowMs: NOW})),
      pr: C.buildPromptRules({max_per_week: 1})}));
    """)
    assert "不會自動改班" in out["rep"] and "[重要]" in out["rep"], out
    assert "沒有排班資料" in out["empty"], out
    assert "每週最多 1 次" in out["pr"] and "不要自動通知任何人" in out["pr"], out


def test_rules_file_is_read_only_and_offline():
    src = read(RULES)
    for bad in ("fetch(", "XMLHttpRequest", "localStorage", "saveVolunteerSystemData", "http://", "https://"):
        assert bad not in src, f"cm_shift_rules.js 不應含 {bad}"
    panel = read(PANEL)
    for bad in ("saveVolunteerSystemData", "fetch(", "localStorage", "XMLHttpRequest"):
        assert bad not in panel, f"cm_shift_rules_panel.js 不應含 {bad}"


# ───────── Google 連結設定檔 ─────────

LPRE = r"""
const G = require(%r);
""" % str(LINKS)


def test_google_check_cases():
    out = run_node(LPRE + r"""
    const s = (x) => G.check(x).state;
    console.log(JSON.stringify({
      empty: s(''), blank: s('   '), undef: s(undefined),
      http: s('http://docs.google.com/forms/d/e/abc'),
      host: s('https://evil.example.com/form'),
      cred: s('https://user:pw@docs.google.com/forms/d/e/abc'),
      space: s('https://docs.google.com/forms/d/e/a bc'),
      js: s('javascript:alert(1)'),
      docs: s('https://docs.google.com/forms/d/e/abc/viewform'),
      short: s('https://forms.gle/AbCdEf'),
      sub: s('https://docs.google.com.evil.com/x'),
      notset: G.NOT_SET_ZH
    }));
    """)
    assert out == {
        "empty": "unset", "blank": "unset", "undef": "unset",
        "http": "invalid", "host": "invalid", "cred": "invalid", "space": "invalid", "js": "invalid",
        "docs": "ok", "short": "ok", "sub": "invalid", "notset": "尚未設定",
    }, out


def test_google_defaults_all_unset_and_resolve_override():
    out = run_node(LPRE + r"""
    const ids = Object.keys(G.LINKS);
    const unset = ids.every((id) => G.resolve(id).state === 'unset');
    const ov = G.resolve('newcomer_form', {newcomer_form: {label_zh: '新人', url: 'https://forms.gle/xyz'}});
    console.log(JSON.stringify({ids, unset, ov: ov.state, missing: G.resolve('nope').state}));
    """)
    for want in ("volunteer_schedule_sheet", "volunteer_availability_form", "apprentice_feedback_form", "newcomer_form"):
        assert want in out["ids"], out
    assert out["unset"] is True and out["ov"] == "ok" and out["missing"] == "unset", out


def test_google_file_makes_no_requests():
    src = read(LINKS)
    for bad in ("fetch(", "XMLHttpRequest", "localStorage", "sendBeacon"):
        assert bad not in src, f"cm_google_links_config.js 不應含 {bad}"
    assert 'rel", "noopener noreferrer"' in src or "noopener noreferrer" in src


# ───────── 頁面接線 ─────────

def test_rules_page_wiring():
    html = read(PAGE)
    for needle in ("cm_shift_rules.js", "cm_google_links_config.js", "cm_shift_rules_panel.js",
                   "cm_chrome_i18n_pack.js", 'id="rcCopy"', 'id="rcCopyRules"', 'id="rcGuide"',
                   "scenario=shift_voice", 'id="cmI18nLangHost"', 'id="rcDraftNote"', "不會改任何資料"):
        assert needle in html, f"rules_check.html 缺 {needle}"
    assert "rules_check" in read(TOOL) and "⑦ 排班檢查" in read(TOOL)
    panel = read(PANEL)
    assert "getVolunteerData" in panel and "CmGoogleLinks" in panel and "volunteer_schedule_sheet" in panel


def test_leader_page_has_kit_and_feedback_link():
    html = read(LEADER)
    for needle in ("scenario=apprentice_kit", "apprentice_feedback_form", "cm_google_links_config.js",
                   'id="lp-draft-note"', "langHost: false"):
        assert needle in html, f"leader_path_panel.html 缺 {needle}"


# ───────── AI 情境 ─────────

def test_apprentice_kit_scenario_guardrails():
    src = read(SSOT)
    m = re.search(r'id:\s*"apprentice_kit".*?workbench:\s*"prompt"', src, re.S)
    assert m, "找不到 apprentice_kit 情境"
    block = m.group(0)
    for needle in ("見習者", "老手", "討論三問", "自傷", "家暴", "虐待", "性侵", "停止", "通知牧者",
                   "AI 草稿，須小組長／牧者審核", "不編造經文", "不決定誰可以晉升", "請勿填寫真實姓名"):
        assert needle in block, f"apprentice_kit 缺 {needle}"


def test_shift_voice_has_rules():
    src = read(SSOT)
    m = re.search(r'id:\s*"shift_voice".*?workbench:\s*"serve"', src, re.S)
    assert m, "找不到 shift_voice"
    block = m.group(0)
    for needle in ("同一個人在同一時段不可排在兩個崗位", "每週最多 2 次", "已請假的人不要排", "缺 N 人",
                   "不自動通知任何人", "人選待補", "不要填真實電話或隱私"):
        assert needle in block, f"shift_voice 缺 {needle}"


def test_ssot_version_matches_pages():
    build = re.search(r'var BUILD = "([^"]+)"', read(SSOT)).group(1)
    for rel in ("ai_tools/tools/ai_workbench_integrated.html", "ai_tools/_landing/home.html"):
        assert f"ai_scenario_ssot.js?v={build}" in read(ROOT / rel), f"{rel} 的 ssot 版本字串未對齊 {build}"


# ───────── 多語 ─────────

def test_i18n_p4_keys_have_zh_and_en_and_draft_flag():
    pack = read(PACK)
    keys = sorted(set(re.findall(r"'(cm\.p4\.[a-z0-9_.]+)'\s*:\s*\{", pack)))
    assert len(keys) >= 20, keys
    out = run_node(r"""
    global.window = global;
    require(%r);
    const P = global.CmChromeI18nPack;
    const ks = Object.keys(P).filter((k) => k.startsWith('cm.p4.'));
    const bad = ks.filter((k) => !(P[k]['zh-Hant'] && P[k].en && P[k].vi && P[k].id));
    console.log(JSON.stringify({n: ks.length, bad, draft: Object.keys(global.CmChromeI18nDraftKeys || {})}));
    """ % str(PACK))
    assert out["bad"] == [] and out["n"] == len(keys), out
    assert out["draft"] == ["vi", "id"], out
    # 頁面用到的每個 data-i18n 鍵都要存在於 pack
    for page in (PAGE, LEADER):
        used = set(re.findall(r'data-i18n="(cm\.p4\.[^"]+)"', read(page)))
        missing = used - set(keys)
        assert not missing, f"{page.name} 使用了不存在的鍵 {missing}"


def test_plan_doc_mentions_p4():
    doc = read(PLAN)
    for needle in ("§5.5", "rules_check", "cm_google_links_config", "apprentice_kit", "草稿待校"):
        assert needle in doc, f"計畫書缺 {needle}"


if __name__ == "__main__":
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
