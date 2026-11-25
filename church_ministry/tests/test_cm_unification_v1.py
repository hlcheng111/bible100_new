#!/usr/bin/env python3
"""
教會事工 · 統一化（樣式／繁體／會友編號／出席總帳／landing 版型）鎖住不再回來。
靜態檢查＋用 node 在模擬 localStorage 裡真的跑編號與總帳邏輯，不開瀏覽器。
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"
JS = CM / "js"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def node(code: str):
    r = subprocess.run(["node", "-e", code], capture_output=True, text=True, encoding="utf-8", cwd=str(JS), timeout=60)
    assert r.returncode == 0, r.stderr[-600:]
    return json.loads(r.stdout.strip().splitlines()[-1])


SHIM = """
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return k in this._d ? this._d[k] : null; }, setItem(k,v){ this._d[k]=String(v); }, removeItem(k){ delete this._d[k]; } };
global.document = { addEventListener(){}, getElementById(){ return null; } };
"""


# ───────── ① 樣式：tailwind 只能用 <script>（它是瀏覽器版，不是 CSS 檔） ─────────
def test_no_page_links_tailwind_as_css():
    bad = []
    for p in list((CM / "modules").glob("*/*.html")) + list((CM / "functions").glob("*.html")):
        t = p.read_text(encoding="utf-8", errors="ignore")
        if re.search(r'<link[^>]+tailwind[^>]*\.css', t) or "cdn.tailwindcss.com" in t:
            bad.append(p.name)
    assert not bad, bad


def test_tailwind_script_path_resolves():
    bad = []
    for p in (CM / "modules").glob("*/*.html"):
        t = p.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'<script src="([^"]*tailwind-browser\.min\.js)"', t):
            if not (p.parent / m.group(1)).resolve().exists():
                bad.append(f"{p.name}: {m.group(1)}")
    assert not bad, bad


def test_inline_scripts_have_no_raw_newline_in_strings():
    """修過的 15 頁（匯出 CSV 的字串中間被斷行）不再回來：用 node --check 逐頁檢查內嵌 script。"""
    import tempfile
    bad = []
    for p in (CM / "modules").glob("*/*.html"):
        t = p.read_text(encoding="utf-8", errors="ignore")
        if "tailwind-browser.min.js" not in t:
            continue
        js = "\n".join(re.findall(r"<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>", t))
        f = Path(tempfile.gettempdir()) / "_cm_chk.js"
        f.write_text(js, encoding="utf-8")
        r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        # visitation_index 是 ES module（有 import），node --check 以 CJS 解析會誤報，略過
        if r.returncode != 0 and "import" not in r.stderr and p.name != "visitation_index.html":
            bad.append(p.name)
    assert not bad, bad


# ───────── ② 繁體：示範資料／畫面文字不可再有簡體 ─────────
def test_no_simplified_chinese_in_church_ministry_ui_and_demo_data():
    from opencc import OpenCC  # opencc-python-reimplemented
    cc = OpenCC("s2tw")
    skip_names = {"cm_voice_query.js", "cm_finance_legacy.js"}  # 刻意保留簡體（接受簡體輸入／認得舊簡體資料）
    skip_dirs = ("_archive", "tests", "docs", "audit", "scripts", "assets", "node_modules", "projects")
    bad = []
    for dp in ("modules", "js", "_landing", "css", "data"):
        for p in (CM / dp).rglob("*"):
            if not p.is_file() or p.suffix not in (".html", ".js", ".json", ".css") or p.name in skip_names:
                continue
            if any(x in p.parts for x in skip_dirs):
                continue
            t = p.read_text(encoding="utf-8", errors="ignore")
            conv = cc.convert(t)
            if conv == t or len(conv) != len(t):
                continue
            # s2tw 會把個別「正體字」再轉成用法不同的字（表→錶、台→臺、了→瞭、里→裡…），這些不算簡體
            diff = [(a, b) for a, b in zip(t, conv) if a != b and (a, b) not in {("表", "錶"), ("台", "臺"), ("台", "檯"), ("了", "瞭"), ("里", "裡"), ("占", "佔"), ("干", "幹")}]
            if diff:
                bad.append(f"{p.relative_to(CM)}: {''.join(a for a, _ in diff[:12])}")
    assert not bad, bad[:15]


def test_voice_query_accepts_simplified_input():
    out = node(SHIM + "const V=require('./cm_voice_query.js'); const r=V.interpret||V.interpret; "
               "console.log(JSON.stringify(['没来的人','還沒入小組的人'].map(t=>V.interpret(t).state)))")
    assert out == ["matched", "matched"], out


# ───────── ③ 會友編號只有一種（數字） ─────────
def test_member_id_normalize_accepts_every_legacy_form():
    out = node(SHIM + """
const fs=require('fs');
global.CentralMemberDB={get(){return {members:[{id:1,memberId:1,name:'甲'},{id:12,name:'乙'},{id:1001,memberId:1001,name:'丙'}]}}};
global.document={getElementById(){return null}};
eval(fs.readFileSync('./member_id_bridge.js','utf8'));
const B=window.MemberIdBridge;
console.log(JSON.stringify({
  n:['M1','M001','m12','cm-12','007','1001',' 5 '].map(B.normalizeId),
  bad:['','abc','x1',null,'M','1a'].map(B.normalizeId),
  hit:['M001','cm-12','1001','M999'].map(function(x){var m=B.resolveById(x);return m?m.name:null}),
  disp:B.displayId('M012')
}))""")
    assert out["n"] == ["1", "1", "12", "12", "7", "1001", "5"], out
    assert out["bad"] == ["", "", "", "", "", ""], out
    assert out["hit"] == ["甲", "乙", "丙", None], out
    assert out["disp"] == "12", out


def test_instrument_team_no_longer_invents_m001_ids():
    t = read("church_ministry/modules/worship/instrument-team.html")
    assert "memberID:'M001'" not in t and "'M' + String(" not in t
    assert "migrateMemberIds" in t and "normalizeId" in t
    assert "按姓名對齊" in t and "從中央會友選人" in t


# ───────── ④ 出席資料：三套收成一條主線 ─────────
LEDGER_CASE = SHIM + """
const fs=require('fs');
global.CentralMemberDB={get(){return {members:[{id:1,memberId:1,name:'甲'},{id:2,memberId:2,name:'乙'},{id:3,memberId:3,name:'丙'}]}}};
eval(fs.readFileSync('./member_id_bridge.js','utf8'));
eval(fs.readFileSync('./attendance_checkin_store.js','utf8'));
eval(fs.readFileSync('./attendance_ledger.js','utf8'));
const L=window.AttendanceLedger, S=window.AttendanceCheckinStore;
// 舊桶：一場一筆（含舊式 M 編號）
localStorage.setItem('attendanceRecords', JSON.stringify([{id:1,date:'2026-11-01',service:'第一堂',marks:{'M001':'P','2':'A'},present:1,absent:1,total:2,rate:50}]));
const before=L.summary();
const mig=L.migrateLegacy(), mig2=L.migrateLegacy();
const loaded=L.loadSunday('2026-11-01','第一堂');
// 新點名：只寫主線，並鏡射舊桶
const save=L.saveSunday({date:'2026-11-08',service:'第一堂',marks:{'1':'P','2':'A','3':'P'},memberIds:['1','2','3']});
const save2=L.saveSunday({date:'2026-11-08',service:'第一堂',marks:{'1':'A','2':'A','3':'P'},memberIds:['1','2','3']});
const sess=L.sessions({type:'worship'});
const flat=L.flatRows({type:'worship'}).filter(r=>r.status==='absent').map(r=>r.memberName+'@'+r.date);
const legacy=JSON.parse(localStorage.getItem('attendanceRecords'));
console.log(JSON.stringify({
  beforeUnmigrated:before.legacy.unmigrated, mig:mig.migrated, mig2:mig2.migrated, migSkipped2:mig2.skipped,
  loadedSource:loaded.source, loadedMarks:loaded.marks,
  saveOk:save.ok, rate1:save.rate, rate2:save2.rate, events:S.listEvents().length,
  sess:sess.map(s=>[s.date,s.service,s.present,s.absent]),
  flat:flat, legacyLen:legacy.length, legacySavedRate:legacy.filter(r=>r.date==='2026-11-08')[0].rate,
  after:L.summary().legacy.unmigrated
}))
"""


def test_ledger_migrates_legacy_and_keeps_single_main_bucket():
    o = node(LEDGER_CASE)
    assert o["beforeUnmigrated"] == 1 and o["mig"] == 1 and o["mig2"] == 0 and o["migSkipped2"] == 1, o
    assert o["loadedSource"] == "event" and o["loadedMarks"] == {"1": "P", "2": "A"}, o  # 舊 M001 → 1
    assert o["saveOk"] and o["rate1"] == 67 and o["rate2"] == 33, o
    assert o["events"] == 2, o  # 同一場重存不重複建場
    assert o["sess"] == [["2026-11-01", "第一堂", 1, 1], ["2026-11-08", "第一堂", 1, 2]], o
    assert o["flat"] == ["乙@2026-11-01", "甲@2026-11-08", "乙@2026-11-08"], o
    assert o["legacyLen"] == 2 and o["legacySavedRate"] == 33, o  # 舊桶仍被鏡射，舊報表不斷線
    assert o["after"] == 0, o


def test_sunday_desk_writes_through_ledger_not_legacy_key():
    t = read("church_ministry/modules/worship/worship-sunday-desk.html")
    assert "AttendanceLedger" in t and "Ledger.saveSunday" in t and "Ledger.loadSunday" in t
    assert 'localStorage.setItem(KEY' not in t and 'var KEY = "attendanceRecords"' not in t
    for s in ("attendance_checkin_store.js", "attendance_ledger.js", "member_id_bridge.js", "cm_demo_gate.js"):
        assert s in t, s
    assert "loadTrialForty(false)" not in t, "不可再自動塞示範名冊"
    assert "CmDemoGate.offer" in t


def test_worship_hub_reads_attendance_from_ledger():
    t = read("church_ministry/js/ae_worship_data_hub.js")
    assert 'readJson("attendanceRecords"' not in t.split("function readAttendanceFlat")[1].split("function listMasterMembers")[0] or "AttendanceLedger" in t
    assert t.count("readAttendanceFlat()") >= 3 and "AttendanceLedger.flatRows" in t
    pages = [p for p in (CM / "modules").glob("*/*.html") if "ae_worship_data_hub.js" in p.read_text(encoding="utf-8", errors="ignore")]
    assert pages
    miss = [p.name for p in pages if "attendance_ledger.js" not in p.read_text(encoding="utf-8", errors="ignore")]
    assert not miss, miss


def test_governance_doc_names_main_bucket_and_id_rule():
    t = read("church_ministry/docs/ATTENDANCE_GOVERNANCE.md")
    assert "attendance_ledger.js" in t and "數字 memberId" in t


# ───────── ⑤ Landing 與路線圖：統一、緊湊、有資料何來何去 ─────────
def test_route_kit_every_step_has_flow_note():
    t = read("church_ministry/js/attendance_route_kit.js")
    flow_keys = set(re.findall(r'"([a-z_]+:[a-z0-9]+)":\s*"📥', t))
    step_ids = set()
    for rid, block in re.findall(r"\b(b_pastoral|b_checkin|b_stats|b_visit|a_worship|a_sunday|school):\s*\{([\s\S]*?)\n      \},?\n", t):
        for sid in re.findall(r'id:\s*"([a-z]+\d)"', block):
            step_ids.add(f"{rid}:{sid}")
    # stepsB 是函式（b_pastoral 的 b1–b4）
    step_ids |= {f"b_pastoral:b{i}" for i in range(1, 5)}
    missing = sorted(k for k in step_ids if k not in flow_keys)
    assert not missing, missing


def test_route_kit_css_one_line_steps_and_checkbox_not_stretched():
    c = read("church_ministry/css/attendance_route_kit.css")
    assert "min-width: 14px !important" in c, "宿主頁 input{min-width:140px} 會把勾選框撐大"
    assert re.search(r"\.att-route__step-t\s*\{[^}]*white-space:\s*nowrap", c)


def test_compass_landings_use_one_compact_layout():
    css = read("church_ministry/css/cm_compass_shell.css")
    assert "統一版型" in css and "clip-path" not in css.split("統一版型")[1].split("Zone themes")[0]
    js = read("church_ministry/js/cm_compass_shell.js")
    assert 'class="num"' in js and "mountRouteKit" in js and 'ROUTE_BY_ZONE = { a: "a_worship"' in js
    assert 'class="hero-en"' in js and 'class="kicker"' not in js.replace("cm-kicker", "")


def test_title_wrap_scan_script_exists():
    assert (CM / "scripts" / "cm_title_wrap_scan.py").exists()


if __name__ == "__main__":
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
