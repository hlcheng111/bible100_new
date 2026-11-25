#!/usr/bin/env python3
"""
P6：規模檔位套用到各區預設顯示、備份說明（可用的備份／還原）、全站審計

- 檔位：設定檔是單一真相；部門台工具用 data-size-feature 標記；功能不刪，只收起，可「顯示更多工具」
- 備份：只動白名單 key；驗證失敗一個都不寫；白名單涵蓋橋接層全部 *_KEY（防漏）
- 審計：唯讀；只顯示白名單欄位；匯出防公式注入；橋接層記到的操作都有白話
- 全站審計：直接寫正式資料 key（繞過橋接層）的檔案不得增加（基線寫在 SITE_AUDIT_P6.md）
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"
JS = CM / "js"
TIER = JS / "cm_size_tier_config.js"
NAV = JS / "church_size_nav.js"
BK_CFG = JS / "cm_backup_config.js"
BK = JS / "cm_backup.js"
BK_PANEL = JS / "cm_backup_panel.js"
AU = JS / "cm_audit_view.js"
AU_PANEL = JS / "cm_audit_panel.js"
BRIDGE = ROOT / "js" / "church_data_bridge.js"
RAIL = CM / "church_main_rail.html"
WB = CM / "workbenches"
BK_PAGE = CM / "modules" / "admin" / "backup_restore.html"
AU_PAGE = CM / "modules" / "admin" / "audit_log.html"
PLAN = CM / "docs" / "MRM_ENGINEERING_PLAN_V1.md"
SITE_AUDIT = CM / "docs" / "SITE_AUDIT_P6.md"

DEPT_PAGES = ["dept_A_worship", "dept_B_pastoral", "dept_C_discipleship", "dept_D_outreach",
              "dept_E_social", "dept_F_hymns", "dept_G_admin"]


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


# ───────── ① 規模檔位套用 ─────────

def test_features_consistent_with_default_lists():
    out = run_node(r"""
    const C = require(%r);
    const byLabel = {};
    Object.keys(C.FEATURES).forEach(k => byLabel[C.FEATURES[k].label_zh] = k);
    const bad = [];
    C.TIERS.forEach(t => {
      (t.default_open || []).forEach(l => { const k = byLabel[l]; if (k && !C.featureVisible(k, t.id)) bad.push(t.id + ' open but hidden: ' + l); });
      (t.default_collapsed || []).forEach(l => { const k = byLabel[l]; if (k && C.featureVisible(k, t.id)) bad.push(t.id + ' collapsed but visible: ' + l); });
    });
    const ids = C.TIERS.map(t => t.id);
    const badFrom = Object.keys(C.FEATURES).filter(k => ids.indexOf(C.FEATURES[k].from) < 0);
    console.log(JSON.stringify({ bad, badFrom }));
    """ % str(TIER))
    assert out == {"bad": [], "badFrom": []}, out


def test_feature_and_dept_visibility_rules():
    out = run_node(r"""
    const C = require(%r);
    const v = (f) => ['micro','small','medium','large'].map(t => C.featureVisible(f, t) ? 1 : 0).join('');
    const d = (c) => ['micro','small','medium','large'].map(t => C.deptVisible(c, t) ? 1 : 0).join('');
    console.log(JSON.stringify({
      shift: v('shift_suggest'), match: v('matching'), audit: v('audit'), iso: v('multi_service_isolation'),
      unknown: v('not_registered'), A: d('A'), C: d('C'), E: d('E'), G: d('G'), F: d('F'),
    }));
    """ % str(TIER))
    assert out == {"shift": "0111", "match": "0011", "audit": "0011", "iso": "0001", "unknown": "1111",
                   "A": "1111", "C": "0111", "E": "0011", "G": "0111", "F": "0011"}, out


def test_nav_reads_config_and_applies_features_with_fake_dom():
    script = r"""
    const vm = require('vm'); const fs = require('fs');
    function store() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
    function mk(attrs) {
      const e = { attrs, hidden: false, cls: new Set(), getAttribute: k => (k in attrs ? attrs[k] : null), setAttribute() {},
        classList: { toggle: (c, on) => { on ? e.cls.add(c) : e.cls.delete(c); } }, addEventListener() {} };
      return e;
    }
    function run(size, reveal) {
      const ctx = { localStorage: store(), sessionStorage: store() };
      ctx.window = ctx; ctx.document = { body: null, head: null };
      vm.createContext(ctx);
      vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
      vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
      ctx.localStorage.setItem('b100_planning_preview_size', size);
      if (reveal) ctx.sessionStorage.setItem('b100_size_nav_reveal_all', '1');
      const shift = mk({ 'data-size-feature': 'shift_suggest' });
      const match = mk({ 'data-size-feature': 'matching' });
      const audit = mk({ 'data-size-feature': 'audit' });
      const plain = mk({});
      const btn = mk({ 'data-size-reveal-btn': '' }); btn.hidden = true;
      const all = { '[data-size-feature]': [shift, match, audit], '[data-size-reveal-btn]': [btn], '[data-size-reveal-btn], [data-size-reveal-tools-btn]': [btn] };
      const root = { querySelector() { return null; }, querySelectorAll: s => all[s] || [] };
      const r = ctx.B100ChurchSize.applyDensity(root);
      return { hidden: [shift, match, audit].map(e => e.hidden ? 1 : 0).join(''), btnHidden: btn.hidden, hiddenCount: r.hiddenCount,
               hint: ctx.B100ChurchSize.getDensity(size).hint, depts: ctx.B100ChurchSize.getDensity(size).visibleDepts.join('') };
    }
    console.log(JSON.stringify({ micro: run('micro'), small: run('small'), medium: run('medium'), large: run('large'), revealed: run('micro', true) }));
    """ % (str(TIER), str(NAV))
    out = run_node(script)
    assert out["micro"]["hidden"] == "111" and out["micro"]["btnHidden"] is False and out["micro"]["hiddenCount"] == 3, out
    assert out["small"]["hidden"] == "011" and out["small"]["btnHidden"] is False, out
    assert out["medium"]["hidden"] == "000" and out["medium"]["btnHidden"] is True, out
    assert out["large"]["hidden"] == "000", out
    assert out["revealed"]["hidden"] == "000" and out["revealed"]["btnHidden"] is True, out
    assert out["micro"]["depts"] == "AB" and out["small"]["depts"] == "ABCG" and out["medium"]["depts"] == "ABCDEFG", out
    assert "微型堂" in out["micro"]["hint"], out


def test_dept_pages_tagged_and_wired():
    feats = set(re.findall(r'"?([a-z_]+)"?\s*:\s*\{\s*label_zh', read(TIER)))
    assert "shift_suggest" in feats and "audit" in feats, feats
    for name in DEPT_PAGES:
        p = WB / f"{name}.html"
        html = read(p)
        for needle in ("cm_size_tier_config.js", "church_size_nav.js", "data-size-reveal-btn", "applyDensity", "bindRevealButtons"):
            assert needle in html, f"{name} 缺 {needle}"
        assert html.index("cm_size_tier_config.js") < html.index("church_size_nav.js"), f"{name} 設定檔要先載入"
        for f in re.findall(r'data-size-feature="([a-z_]+)"', html):
            assert f in feats, f"{name} 用了未登記功能 {f}"
        for a in re.findall(r'<a [^>]*href="([^"#?]+\.html)"[^>]*>', html):
            if a.startswith("http"):
                continue
            assert (p.parent / a).resolve().exists(), f"{name} 連結壞掉：{a}"


def test_backup_link_never_folded_and_in_reach():
    g = read(WB / "dept_G_admin.html")
    m = re.search(r'<a [^>]*href="\.\./modules/admin/backup_restore\.html"[^>]*>', g)
    assert m and "data-size-feature" not in m.group(0), "備份連結不可被收起"
    a = re.search(r'<a [^>]*href="\.\./modules/admin/audit_log\.html"[^>]*>', g)
    assert a and 'data-size-feature="audit"' in a.group(0)
    rail = read(RAIL)
    assert "modules/admin/backup_restore.html" in rail and "cm_size_tier_config.js" in rail
    assert rail.index("cm_size_tier_config.js") < rail.index("church_size_nav.js")
    m2 = re.search(r'<a [^>]*href="modules/admin/backup_restore\.html"[^>]*>', rail)
    assert m2 and "data-size" not in m2.group(0)


# ───────── ② 備份 ─────────

BPRE = ("const Cfg = require(%r); const B = require(%r);\n"
        "function mem(init) { const m = Object.assign({}, init || {}); return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }\n"
        % (str(BK_CFG), str(BK)))


def test_backup_whitelist_and_roundtrip():
    out = run_node(BPRE + r"""
    const s = mem({ memberSystemData: JSON.stringify({ members: [{ id: 1 }] }), volunteerSystemData: '{"schedules":[]}',
      b100_planning_preview_size: 'small', someOtherAppKey: 'secret', bible100_cm_last_backup_v1: '2020-01-01T00:00:00Z' });
    const b = B.buildBackup(s, new Date('2026-11-24T10:00:00Z'));
    const keys = Object.keys(b.keys).sort();
    const t = mem({});
    const r = B.restore(t, b);
    console.log(JSON.stringify({ keys, app: b.app, personal: b.contains_personal_data, ok: r.ok, same: keys.length === Object.keys(t.m).length && keys.every(k => t.m[k] === s.m[k]),
      fname: B.fileName(new Date(2026, 10, 24, 9, 5)) }));
    """)
    assert out["keys"] == ["b100_planning_preview_size", "memberSystemData", "volunteerSystemData"], out
    assert out["app"] == "bible100_church_ministry_backup" and out["personal"] is True and out["ok"] and out["same"], out
    assert out["fname"] == "bible100_backup_20261124_0905.json", out


def test_restore_rejects_bad_files_and_writes_nothing():
    out = run_node(BPRE + r"""
    const good = { app: Cfg.APP_ID, schema_version: 1, keys: { memberSystemData: '{"members":[]}', volunteerSystemData: '{}' } };
    const cases = {
      notObj: B.validateBackup('x').ok, arr: B.validateBackup([]).ok, otherApp: B.validateBackup({ app: 'nope', schema_version: 1, keys: {} }).ok,
      newer: B.validateBackup({ app: Cfg.APP_ID, schema_version: 99, keys: { memberSystemData: '{}' } }).ok,
      noKeys: B.validateBackup({ app: Cfg.APP_ID, schema_version: 1 }).ok,
      empty: B.validateBackup({ app: Cfg.APP_ID, schema_version: 1, keys: {} }).ok,
      badJson: B.validateBackup({ app: Cfg.APP_ID, schema_version: 1, keys: { memberSystemData: '{oops' } }).ok,
      badTier: B.validateBackup({ app: Cfg.APP_ID, schema_version: 1, keys: { b100_planning_preview_size: 'huge' } }).ok,
      notString: B.validateBackup({ app: Cfg.APP_ID, schema_version: 1, keys: { memberSystemData: { members: [] } } }).ok,
      good: B.validateBackup(good).ok,
    };
    const s = mem({ memberSystemData: 'ORIGINAL' });
    const mixed = { app: Cfg.APP_ID, schema_version: 1, keys: { volunteerSystemData: '{}', memberSystemData: '{bad' } };
    const r = B.restore(s, mixed);
    const unk = B.validateBackup({ app: Cfg.APP_ID, schema_version: 1, keys: { memberSystemData: '{}', evilKey: '1' } });
    const s2 = mem({});
    B.restore(s2, { app: Cfg.APP_ID, schema_version: 1, keys: { memberSystemData: '{}', evilKey: '1' } });
    const s3 = mem({});
    B.restore(s3, good, ['volunteerSystemData']);
    console.log(JSON.stringify({ cases, mixedOk: r.ok, untouched: s.m, ignored: unk.ignored, wrote2: Object.keys(s2.m), wrote3: Object.keys(s3.m) }));
    """)
    c = out["cases"]
    assert [k for k, v in c.items() if v] == ["good"], c
    assert out["mixedOk"] is False and out["untouched"] == {"memberSystemData": "ORIGINAL"}, out
    assert out["ignored"] == ["evilKey"] and out["wrote2"] == ["memberSystemData"], out
    assert out["wrote3"] == ["volunteerSystemData"], out


def test_backup_reminder_states():
    out = run_node(BPRE + r"""
    const now = new Date('2026-11-24T00:00:00Z');
    const withMembers = (extra) => mem(Object.assign({ memberSystemData: JSON.stringify({ members: [{ id: 1 }] }) }, extra || {}));
    const day = (n) => new Date(now.getTime() - n * 86400000).toISOString();
    const s_none = mem({});
    const s_never = withMembers();
    const s_ok = withMembers({ [Cfg.LAST_BACKUP_KEY]: day(3) });
    const s_due = withMembers({ [Cfg.LAST_BACKUP_KEY]: day(Cfg.REMIND_AFTER_DAYS + 5) });
    const s_edge = withMembers({ [Cfg.LAST_BACKUP_KEY]: day(Cfg.REMIND_AFTER_DAYS - 1) });
    const s_garbage = withMembers({ [Cfg.LAST_BACKUP_KEY]: 'not a date' });
    const s_empty_members = mem({ memberSystemData: JSON.stringify({ members: [] }) });
    B.markBackup(s_never, now);
    console.log(JSON.stringify({ none: B.reminder(s_none, now).state, never: B.reminder(withMembers(), now).state, ok: B.reminder(s_ok, now).state,
      due: B.reminder(s_due, now).state, edge: B.reminder(s_edge, now).state, garbage: B.reminder(s_garbage, now).state,
      emptyMembers: B.reminder(s_empty_members, now).state, afterMark: B.reminder(s_never, now).state, mark: s_never.m[Cfg.LAST_BACKUP_KEY],
      inBackup: Object.keys(B.buildBackup(s_never, now).keys).indexOf(Cfg.LAST_BACKUP_KEY) >= 0 }));
    """)
    assert out["none"] == "none" and out["never"] == "never" and out["ok"] == "ok" and out["due"] == "due", out
    assert out["edge"] == "ok" and out["garbage"] == "never" and out["emptyMembers"] == "none", out
    assert out["afterMark"] == "ok" and out["mark"] == "2026-11-24T00:00:00.000Z" and out["inBackup"] is False, out


def test_backup_config_covers_every_bridge_key():
    bridge = read(BRIDGE)
    found = dict(re.findall(r"var\s+([A-Z_]+(?:KEY|ALT))\s*=\s*'([^']+)'", bridge))
    assert len(found) >= 12, found
    allk = set(run_node("const C = require(%r); console.log(JSON.stringify(C.allKeys()));" % str(BK_CFG)))
    missing = {n: k for n, k in found.items() if k not in allk}
    assert not missing, f"備份白名單漏了橋接層的 key：{missing}（請加到 cm_backup_config.js）"
    assert len(allk) == len(set(allk))


def test_backup_code_is_local_only_and_panel_guarded():
    for p in (BK, BK_CFG, BK_PANEL):
        code = read(p)
        for bad in ("fetch(", "XMLHttpRequest", "navigator.sendBeacon", "eval(", "new Function", "WebSocket", "innerHTML +="):
            assert bad not in code, f"{p.name} 不該含 {bad}"
    panel = read(BK_PANEL)
    assert "localStorage.setItem" not in panel and "removeItem" not in panel, "面板不直接寫 storage，只經 CmBackup"
    assert "confirm(" in panel and "before_restore" in panel, "還原前要確認並自動下載還原前備份"
    assert "crm.admin" in panel
    html = read(BK_PAGE)
    for needle in ('id="bk-export"', 'id="bk-file"', 'id="bk-restore-go"', 'id="bk-reminder"', "含會友、牧養、奉獻等個人資料",
                   "USB", "同一種開啟方式", "cm_backup.js", "cm_backup_panel.js", "cm_backup_config.js"):
        assert needle in html, f"backup_restore.html 缺 {needle}"


# ───────── ③ 審計 ─────────

APRE = "const A = require(%r);\n" % str(AU)


def test_audit_describe_whitelists_payload_and_actor():
    out = run_node(APRE + r"""
    const e1 = A.describe({ id: 'a1', action: 'save_member_system_data', operator: 'bridge', timestamp: '2026-11-24T08:30:00.000Z',
      payload: { members: 12, amount: 5000, name: '張三', phone: '0912', nested: { x: 1 } } });
    const e2 = A.describe({ action: 'finance_save_transaction', operator: 'bridge', actor: 'admin', timestamp: '2026-11-24T08:31:00Z', payload: { amount: 999, memo: '奉獻' } });
    const e3 = A.describe({ action: 'brand_new_action', operator: 'crm', timestamp: 'bad' });
    console.log(JSON.stringify({ e1, e2, e3 }));
    """)
    assert out["e1"]["what_zh"] == "儲存會友名冊" and out["e1"]["detail_zh"] == "會友數 12", out
    for secret in ("5000", "張三", "0912"):
        assert secret not in json.dumps(out["e1"], ensure_ascii=False), secret
    assert out["e1"]["who_zh"] == "系統（程式寫入）", out
    assert out["e2"]["who_zh"] == "行政" and out["e2"]["detail_zh"] == "" and out["e2"]["kind_zh"] == "財務", out
    assert out["e3"]["what_zh"].startswith("其他操作（brand_new_action") and out["e3"]["kind"] == "other", out


def test_audit_filter_sort_and_csv_injection_guard():
    out = run_node(APRE + r"""
    const now = new Date('2026-11-24T12:00:00Z');
    const day = (n) => new Date(now.getTime() - n * 86400000).toISOString();
    const list = [
      { action: 'save_member_system_data', operator: 'bridge', timestamp: day(40), payload: { members: 3 } },
      { action: 'save_volunteer_shift', operator: 'bridge', timestamp: day(1), payload: {} },
      { action: 'backup_exported', operator: 'backup', timestamp: day(2), payload: { keys: 4 } },
      { action: 'save_member_system_data', operator: '=HYPERLINK("http://x")', timestamp: day(5), payload: { members: 9 } },
    ];
    const all = A.listRows(list, {}, now);
    const members = A.listRows(list, { kind: 'members' }, now);
    const recent = A.listRows(list, { sinceDays: 7 }, now);
    const text = A.listRows(list, { text: '排班' }, now);
    const csv = A.toCsv(all);
    console.log(JSON.stringify({ order: all.map(r => r.what_zh), members: members.length, recent: recent.length, text: text.length,
      bom: csv.charCodeAt(0) === 0xFEFF, injected: csv.indexOf('"\'=HYPERLINK') >= 0, rawFormula: csv.indexOf(',"=HYPERLINK') >= 0,
      quote: A.csvCell('a"b'), plus: A.csvCell('+1'), at: A.csvCell('@x'), plain: A.csvCell('正常'),
      json: JSON.parse(A.toJson(all)).length }));
    """)
    assert out["order"][0] == "儲存單筆排班" and out["order"][-1] == "儲存會友名冊", out
    assert (out["members"], out["recent"], out["text"]) == (2, 3, 1), out
    assert out["bom"] and out["injected"] and not out["rawFormula"], out
    assert out["quote"] == '"a""b"' and out["plus"] == "\"'+1\"" and out["at"] == "\"'@x\"" and out["plain"] == '"正常"', out
    assert out["json"] == 4, out


def test_audit_labels_cover_every_bridge_action():
    actions = set(re.findall(r"logActivity\(\s*'([a-z_]+)'", read(BRIDGE)))
    assert len(actions) >= 12, actions
    labelled = set(run_node(APRE + "console.log(JSON.stringify(Object.keys(A.ACTION_LABELS)));"))
    missing = actions - labelled
    assert not missing, f"審計白話缺：{missing}（請加到 cm_audit_view.js 的 ACTION_LABELS）"


def test_bridge_records_actor_role_only():
    code = read(BRIDGE)
    seg = code[code.index("logActivity: function"): code.index("runDataSanitizer")]
    assert "entry.actor" in seg and "getRole" in seg, "logActivity 應記下角色"
    assert "getSession" not in seg and "username" not in seg and "token" not in seg, "審計只記角色，不記姓名／token"


def test_audit_panel_is_read_only_and_safe():
    code = read(AU_PANEL)
    for bad in ("setItem", "removeItem", "rotateAuditLogs", "logActivity", "fetch(", "eval(", "XMLHttpRequest"):
        assert bad not in code, f"審計面板不該含 {bad}"
    for m in re.finditer(r"innerHTML\s*=\s*([^;]+);", code):
        assert m.group(1).strip() in ('""', "''"), f"innerHTML 只能用來清空：{m.group(0)}"
    assert "crm.admin" in code and "textContent" in code
    html = read(AU_PAGE)
    for needle in ('id="au-kind"', 'id="au-days"', 'id="au-text"', 'id="au-csv"', 'id="au-json"', 'id="au-body"',
                   "只能查看，不能改、不能刪", "cm_audit_view.js", "cm_audit_panel.js"):
        assert needle in html, f"audit_log.html 缺 {needle}"


# ───────── ④ 全站審計：繞過橋接層的直接寫入（基線） ─────────

CANON = ("memberSystemData|churchMasterDatabase|volunteerSystemData|financeSystemData|financialData|visitationData|"
         "educationSystemData|pastoral_events_v1|pastoralFollowupData|churchAuditLog|careAnnualPlanData|careBoardData|"
         "financeReconciliationData")
BYPASS_BASELINE = {
    "js/bootstrap_church_data.js",
    "js/data_trust_badge.js",
    "church_ministry/js/pastoral_trial_pack.js",
}
SCAN_DIRS = ["church_ministry", "js", "church_planning", "smart_ministry", "school_management", "ai_tools", "nav_hub"]


def test_no_new_bypass_writes_to_canonical_keys():
    pat = re.compile(r"""localStorage\.setItem\(\s*['"](?:%s)['"]""" % CANON)
    hit = set()
    for d in SCAN_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.suffix not in (".js", ".html") or not p.is_file():
                continue
            rel = p.relative_to(ROOT).as_posix()
            if "/tests/" in rel or "/node_modules/" in rel or rel == "js/church_data_bridge.js":
                continue
            if pat.search(read(p)):
                hit.add(rel)
    new = hit - BYPASS_BASELINE
    assert not new, f"新增了繞過橋接層的直接寫入（請改走 ChurchDataBridge）：{sorted(new)}"
    doc = read(SITE_AUDIT)
    for f in sorted(BYPASS_BASELINE):
        assert f in doc, f"SITE_AUDIT_P6.md 要記錄基線檔：{f}"


def test_docs_mention_p6():
    plan = read(PLAN)
    for needle in ("§5.8", "P6", "cm_backup", "cm_audit_view", "data-size-feature", "SITE_AUDIT_P6"):
        assert needle in plan, f"計畫書缺 {needle}"
    doc = read(SITE_AUDIT)
    for needle in ("基線", "備份", "審計", "未做"):
        assert needle in doc, f"SITE_AUDIT_P6.md 缺 {needle}"


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
