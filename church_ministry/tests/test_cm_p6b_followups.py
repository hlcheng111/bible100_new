#!/usr/bin/env python3
"""
P6 後續（依序）：① 舊財務頁改走橋接層 ② 備份加密（可選）③ PDCA 摘要接上檔位 ④ 兩個舊探訪頁改走橋接層

每一步完成時在本檔加對應測試；基線檔的減少同步反映在 test_cm_p6_tier_backup_audit.py 與 SITE_AUDIT_P6.md。
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"
JS = CM / "js"
BRIDGE = ROOT / "js" / "church_data_bridge.js"
FIN_PAGE = CM / "modules" / "administration" / "financial-management.html"
FIN_JS = JS / "cm_finance_legacy.js"
SITE_AUDIT = CM / "docs" / "SITE_AUDIT_P6.md"


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


# ───────── ① 舊財務頁 ─────────

FPRE = "const F = require(%r);\n" % str(FIN_JS)


def test_finance_page_goes_through_bridge_only():
    html = read(FIN_PAGE)
    for bad in (".setItem(", ".getItem(", "localStorage", "loadDemo", "Chart(", "cdn.jsdelivr"):
        assert bad not in html, f"舊財務頁不該含 {bad}"
    for needle in ("saveFinanceTransaction", "softDeleteFinanceTransaction", "getFinanceDataAsync",
                   "W4 合併提示", "finance-integrated.html", "financeSystemData", "cm_finance_legacy.js", "church_data_bridge.js"):
        assert needle in html, f"舊財務頁缺 {needle}"
    assert html.index("church_data_bridge.js") < html.index("cm_finance_legacy.js") < html.index("saveFinanceTransaction")
    assert "已生成" not in html, "不可再有假的「報表已生成」"
    assert "esc(" in html and "data-void" in html, "表格內容要跳脫，作廢用 data 屬性"


def test_finance_helpers_no_network_and_no_finance_writes():
    code = read(FIN_JS)
    for bad in ("fetch(", "XMLHttpRequest", "eval(", "sendBeacon", "saveFinance", "removeItem"):
        assert bad not in code, f"cm_finance_legacy.js 不該含 {bad}"
    assert len(re.findall(r"\.setItem\(", code)) == 1, "只允許寫一個「已匯入」標記"


def test_finance_validate_error_text_and_csv():
    out = run_node(FPRE + r"""
    const v = (a, d) => F.validateEntry({ amount: a, date: d });
    console.log(JSON.stringify({
      ok: v('1200.5', '2026-11-24').ok, zero: v('0', '2026-11-24').ok, neg: v('-5', '2026-11-24').ok, nan: v('abc', '2026-11-24').ok,
      badDate: v('10', '2026-02-30').ok, empty: v('10', '').ok, amt: v('1200.5', '2026-11-24').amount,
      rbac: F.errorText({ code: 'RBAC_DENIED' }), contam: F.errorText({ code: 'FINANCE_DATA_CONTAMINATION_ERROR' }), other: F.errorText(new Error('boom')),
      csv: F.toCsv([{ type: 'expense', date: '2026-11-01', categoryName: '水電', amount: 5000, description: '=HYPERLINK("x")', txn_id: 'T1' },
                    { type: 'income', date: '2026-11-02', category: '奉獻', amount: 100, description: '含"引號"', txn_id: 'T2' }]),
    }));
    """)
    assert out["ok"] is True and out["amt"] == 1200.5, out
    assert not any(out[k] for k in ("zero", "neg", "nan", "badDate", "empty")), out
    assert "財務寫入權限" in out["rbac"] and "示範資料" in out["contam"] and "boom" in out["other"], out
    csv = out["csv"]
    assert csv.startswith("\ufeff") and "\"'=HYPERLINK" in csv and ',"=HYPERLINK' not in csv, csv
    assert '"含""引號"""' in csv and '"支出"' in csv and '"收入"' in csv, csv


def test_finance_legacy_import_prep():
    out = run_node(FPRE + r"""
    const demo = JSON.stringify({ income: [{ id: 1, date: '2025-10-01', category: '奉献', amount: 50000, note: '主日奉献' }, { id: 2, date: '2025-10-08', category: '奉献', amount: 48000, note: '主日奉献' }],
                                  expense: [{ id: 1, date: '2025-10-05', category: '水电', amount: 5000, note: '10月水电费' }, { id: 2, date: '2025-10-07', category: '薪资', amount: 30000, note: '同工薪资' }] });
    const real = JSON.stringify({ income: [{ date: '2026-03-01', category: '奉獻', amount: 800, note: '主日' }, { date: 'bad', amount: 5 }],
                                  expense: [{ date: '2026-03-02', category: '水電', amount: 120 }] });
    const mixed = JSON.parse(demo); mixed.income.push({ date: '2026-04-01', category: '奉獻', amount: 10, note: '真的' });
    const d = F.parseLegacy(demo), r = F.parseLegacy(real), m = F.parseLegacy(JSON.stringify(mixed));
    console.log(JSON.stringify({ demoOffer: d.offer, demoFlag: d.demo, real: { offer: r.offer, count: r.count, skipped: r.skipped, first: r.entries[0], noteDefault: r.entries[1].description },
      mixedOffer: m.offer, mixedCount: m.count, garbage: F.parseLegacy('{oops').offer, empty: F.parseLegacy('').offer, none: F.parseLegacy('{}').offer }));
    """)
    assert out["demoOffer"] is False and out["demoFlag"] is True, out
    assert out["real"]["offer"] and out["real"]["count"] == 2 and out["real"]["skipped"] == 1, out
    assert out["real"]["first"] == {"type": "income", "category": "奉獻", "categoryName": "奉獻", "amount": 800, "date": "2026-03-01",
                                    "description": "主日", "source": "legacy_financialData"}, out
    assert out["real"]["noteDefault"] == "水電", out
    assert out["mixedOffer"] is True and out["mixedCount"] == 5, "示範資料混入真資料時不可整批忽略"
    assert not (out["garbage"] or out["empty"] or out["none"]), out


def test_finance_legacy_import_marker_blocks_second_import():
    out = run_node(r"""
    const vm = require('vm'); const fs = require('fs');
    const m = {}; const ls = { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } };
    const ctx = { localStorage: ls }; ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx);
    const F = ctx.CmFinanceLegacy;
    m.financialData = JSON.stringify({ income: [{ date: '2026-03-01', category: 'x', amount: 5, note: 'n' }], expense: [] });
    const before = F.readLegacy().offer; F.markImported(); const after = F.readLegacy().offer;
    console.log(JSON.stringify({ before, after, marker: m[F.IMPORTED_KEY], legacyKept: !!m.financialData }));
    """ % str(FIN_JS))
    assert out == {"before": True, "after": False, "marker": "1", "legacyKept": True}, out


def test_misplaced_legacy_shape_is_found_read_only_and_bridge_no_longer_moves_old_shape():
    out = run_node(r"""
    const vm = require('vm'); const fs = require('fs');
    function mk(init) { const m = Object.assign({}, init); const ctx = { localStorage: { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } } };
      ctx.window = ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync(%r, 'utf8'), ctx); return { F: ctx.CmFinanceLegacy, m }; }
    const legacyShape = { income: [{ date: '2026-03-01', category: 'x', amount: 5, note: 'n' }], expense: [] };
    const a = mk({ financeSystemData: JSON.stringify(legacyShape) });
    const ra = a.F.readLegacy();
    const b = mk({ financeSystemData: JSON.stringify({ transactions: [{ txn_id: 'T', amount: 1 }], income: legacyShape.income }) });
    const c = mk({ financeSystemData: JSON.stringify({ transactions: [] }) });
    console.log(JSON.stringify({ aOffer: ra.offer, aCount: ra.count, untouched: a.m.financeSystemData === JSON.stringify(legacyShape), bOffer: b.F.readLegacy().offer, cOffer: c.F.readLegacy().offer }));
    """ % str(FIN_JS))
    assert out == {"aOffer": True, "aCount": 1, "untouched": True, "bOffer": False, "cOffer": False}, out
    code = read(BRIDGE)
    i = code.index("function tryMigrateFinanceFromLegacyLocalStorage")
    seg = code[i: i + 1500]
    assert "Array.isArray(alt.transactions)" in seg and seg.index("Array.isArray(alt.transactions)") < seg.index("setJson(FIN_KEY, alt)"), "舊格式不可整包搬進正式帳"


def test_bridge_finance_writes_require_finance_write():
    code = read(BRIDGE)
    for fn in ("softDeleteFinanceTransaction: function", "saveFinanceTransaction: function"):
        i = code.index(fn)
        seg = code[i: i + 700]
        assert "assertRbac('finance.write')" in seg, f"{fn} 缺權限檢查"
        assert seg.index("assertRbac") < seg.index("getFinanceData"), f"{fn} 權限檢查須在讀寫之前"


def test_finance_page_no_longer_in_bypass_baseline_and_backup_covers_marker():
    doc = read(SITE_AUDIT)
    assert "financial-management.html" in doc and "已收斂" in doc
    cfg = read(JS / "cm_backup_config.js")
    assert "bible100_cm_finance_legacy_imported_v1" in cfg


# ───────── ② 備份加密（可選） ─────────

CRYPTO = JS / "cm_backup_crypto.js"
BK = JS / "cm_backup.js"
BK_CFG = JS / "cm_backup_config.js"
BK_PANEL = JS / "cm_backup_panel.js"
BK_PAGE = CM / "modules" / "admin" / "backup_restore.html"

CPRE = ("const W = require('crypto').webcrypto; const C = require(%r); const Cfg = require(%r); const B = require(%r);\n"
        "function mem(init) { const m = Object.assign({}, init || {}); return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }\n"
        % (str(CRYPTO), str(BK_CFG), str(BK)))


def test_crypto_roundtrip_wrong_password_and_tamper():
    out = run_node(CPRE + r"""
    (async () => {
      const s = mem({ memberSystemData: JSON.stringify({ members: [{ id: 1, name: '王小明' }] }), b100_planning_preview_size: 'small' });
      const plain = B.buildBackup(s, new Date('2026-11-24T00:00:00Z'));
      const env = await C.encryptBackup(plain, 'correct-horse', Cfg.APP_ID, W);
      const raw = JSON.stringify(env);
      const back = await C.decryptBackup(env, 'correct-horse', W);
      const wrong = await C.decryptBackup(env, 'wrong-password', W).then(() => 'ok', e => e.code);
      const tampered = JSON.parse(raw); const bytes = Buffer.from(tampered.data, 'base64'); bytes[bytes.length - 3] ^= 1; tampered.data = bytes.toString('base64');
      const tamperRes = await C.decryptBackup(tampered, 'correct-horse', W).then(() => 'ok', e => e.code);
      const weak = await C.encryptBackup(plain, 'short', Cfg.APP_ID, W).then(() => 'ok', e => e.code);
      const env2 = await C.encryptBackup(plain, 'correct-horse', Cfg.APP_ID, W);
      const badIter = JSON.parse(raw); badIter.kdf.iterations = 999999999;
      const iterRes = await C.decryptBackup(badIter, 'correct-horse', W).then(() => 'ok', e => e.code);
      const restored = mem({}); const rr = B.restore(restored, back);
      console.log(JSON.stringify({
        same: JSON.stringify(back) === JSON.stringify(plain), wrong, tamperRes, weak, iterRes, isEnc: C.isEncrypted(env), plainIsEnc: C.isEncrypted(plain),
        leak: raw.indexOf('王小明') >= 0 || raw.indexOf('memberSystemData') >= 0, differentSalt: env.kdf.salt !== env2.kdf.salt, differentIv: env.cipher.iv !== env2.cipher.iv,
        app: env.app, restoredOk: rr.ok && restored.m.b100_planning_preview_size === 'small',
        validateEnc: B.validateBackup(env).errors.join(''),
      }));
    })();
    """)
    assert out["same"] and out["restoredOk"], out
    assert out["wrong"] == "BAD_PASSWORD_OR_DATA" and out["tamperRes"] == "BAD_PASSWORD_OR_DATA", out
    assert out["weak"] == "WEAK_PASSWORD" and out["iterRes"] == "UNSUPPORTED", out
    assert out["isEnc"] is True and out["plainIsEnc"] is False and out["leak"] is False, out
    assert out["differentSalt"] and out["differentIv"], "每次加密都要用新的 salt 與 iv"
    assert out["app"] == "bible100_church_ministry_backup", out
    assert "加密備份" in out["validateEnc"] and "密碼" in out["validateEnc"], out


def test_crypto_password_rules_and_no_network():
    out = run_node(CPRE + r"""
    console.log(JSON.stringify({ short: C.checkPassword('1234567').ok, ok: C.checkPassword('12345678').ok, mismatch: C.checkPassword('12345678', '1234567x').errors,
      match: C.checkPassword('12345678', '12345678').ok, min: C.MIN_PASSWORD_LENGTH, iter: C.ITERATIONS }));
    """)
    assert out["short"] is False and out["ok"] is True and out["match"] is True, out
    assert out["mismatch"] == ["兩次輸入的密碼不一樣。"] and out["min"] >= 8 and out["iter"] >= 200000, out
    code = read(CRYPTO)
    for bad in ("fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "sessionStorage", "eval(", "console.log"):
        assert bad not in code, f"cm_backup_crypto.js 不該含 {bad}"


def test_panel_and_page_encryption_flow():
    panel = read(BK_PANEL)
    assert "localStorage.setItem" not in panel and "sessionStorage" not in panel, "密碼不可存檔"
    assert "encryptBackup" in panel and "decryptBackup" in panel and "bible100_backup_enc" in panel
    assert "packForDownload(safety, current.password)" in panel, "原檔是加密的，還原前保險備份也要加密"
    i = panel.index("function logAct")
    assert "password" not in panel[i: i + 400], "操作紀錄不可帶密碼"
    assert panel.count("clearPasswordFields()") >= 3, "用完要清掉密碼欄位"
    html = read(BK_PAGE)
    for needle in ('id="bk-enc"', 'id="bk-pw"', 'id="bk-pw2"', 'id="bk-dec-pw"', 'id="bk-dec-go"', "忘記密碼就永遠打不開", "沒有任何補救",
                   "cm_backup_crypto.js", 'type="password"'):
        assert needle in html, f"backup_restore.html 缺 {needle}"
    assert html.index("cm_backup.js") < html.index("cm_backup_crypto.js") < html.index("cm_backup_panel.js")
    assert 'id="bk-enc" checked' not in html, "加密為可選，預設不勾"


# ───────── ③ 每週 PDCA 摘要接上檔位 ─────────

TIER = JS / "cm_size_tier_config.js"
DASH = CM / "dashboard.html"


def test_weekly_pdca_wired_and_unused_features_match_doc():
    html = read(DASH)
    assert re.search(r'id="do-plan-feedback-mount"[^>]*data-size-feature="weekly_pdca"', html), "戰情 dashboard 的 PDCA 面板要標記"
    assert "data-size-reveal-btn" in html and "applyDensity" in html and "bindRevealButtons" in html
    assert html.index("cm_size_tier_config.js") < html.index("church_size_nav.js")
    feats = set(re.findall(r'"?([a-z0-9_]+)"?\s*:\s*\{\s*label_zh', read(TIER)))
    used = set()
    for p in CM.rglob("*.html"):
        rel = p.relative_to(CM).as_posix()
        if rel.startswith(("_archive/", "tests/")):
            continue
        used |= set(re.findall(r'data-size-feature="([a-z_]+)"', read(p)))
    unused = feats - used
    assert unused == {"cross_dept_360", "multi_campus_permission", "multi_service_isolation"}, f"未對應功能與文件不一致：{unused}"
    doc = read(SITE_AUDIT)
    for f in unused:
        assert f in doc, f"SITE_AUDIT_P6.md 要列出尚未對應的 {f}"
    assert "每週 Check 摘要（紅旗頁的「複製本週摘要」）刻意不收起" in doc


def test_red_flag_week_summary_never_folded():
    alerts = read(CM / "modules" / "fellowship" / "pastoral_alerts_panel.html")
    assert "rf-week-copy" in alerts and "data-size-feature" not in alerts, "紅旗頁的每週摘要不可被檔位收起"


# ───────── ④ 兩個舊探訪頁 ─────────

VIS_MAIN = CM / "modules" / "support" / "visitation.html"
VIS_SITE = CM / "projects" / "visitation_site" / "visitation.html"


def test_visitation_pages_write_only_through_bridge():
    for p in (VIS_MAIN, VIS_SITE):
        html = read(p)
        assert ".setItem(" not in html, f"{p.name} 不可直接寫瀏覽器儲存"
        assert "ChurchDataBridge.saveVisitationData(data)" in html, f"{p.name} 要經橋接層儲存"
        assert "RBAC_DENIED" in html and "沒有儲存" in html, f"{p.name} 要有權限／失敗提示"
        assert "return false" in html[html.index("function saveData"): html.index("function saveData") + 900]
    site = read(VIS_SITE)
    assert site.index("church_data_bridge.js") < site.index("function loadData"), "橋接層要先載入"
    assert "getVisitationData" in site and "混進去" in site


def test_bridge_save_visitation_requires_permission():
    code = read(BRIDGE)
    i = code.index("saveVisitationData: function")
    seg = code[i: i + 300]
    assert "assertRbac('visitation.write')" in seg and seg.index("assertRbac") < seg.index("setJson"), "探訪寫入要先過權限"
    auth = read(ROOT / "js" / "church_auth.js")
    assert "'visitation.write'" in auth


def test_baseline_shrunk_to_three_fallback_files():
    t = read(CM / "tests" / "test_cm_p6_tier_backup_audit.py")
    block = t[t.index("BYPASS_BASELINE = {"): t.index("SCAN_DIRS")]
    files = re.findall(r'"([^"]+\.(?:js|html))"', block)
    assert sorted(files) == ["church_ministry/js/pastoral_trial_pack.js", "js/bootstrap_church_data.js", "js/data_trust_badge.js"], files


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
