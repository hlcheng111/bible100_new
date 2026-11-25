#!/usr/bin/env python3
"""
P5：口語查詢只回名單、表單回覆轉會友草稿

- 口語查詢：只對應到既有快速查詢鈕；動作字眼只提醒不執行；危機字眼不列名單；聽不懂就說聽不懂
- 表單入庫：草稿不是會友；敏感欄位不匯入；疑似重複預設擋下；寫入只走 saveMemberSystemData（面板），核心檔不寫入
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"
VQ = CM / "js" / "cm_voice_query.js"
INTAKE = CM / "js" / "cm_member_intake.js"
PANEL = CM / "js" / "cm_member_intake_panel.js"
PAGE = CM / "modules" / "members" / "member_form_intake.html"
MEMBER_PAGE = CM / "modules" / "members" / "member-integrated.html"
PAST_PAGE = CM / "modules" / "fellowship" / "pastoral-integrated.html"
NLQ = CM / "js" / "pastoral_nlq_panel.js"
CHIPS = CM / "js" / "cm_ai_care_helper.js"
TRIAL = CM / "js" / "pastoral_trial_pack.js"
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


VPRE = "const V = require(%r);\nconst r = (t) => V.interpret(t);\n" % str(VQ)


# ───────── 口語查詢 ─────────

def test_voice_maps_common_sentences_to_existing_filters():
    out = run_node(VPRE + r"""
    const f = (t) => { const x = r(t); return x.state + ':' + x.filter; };
    console.log(JSON.stringify({
      a: f('這個月誰沒來'), b: f('還沒入小組的人'), c: f('新來的朋友'), d: f('有誰快流失'),
      e: f('待探訪名單'), g: f('誰沒有入小組'), h: f('who 缺席了'), s: f('没来的人'),
    }));
    """)
    assert out == {
        "a": "matched:absence_streak_ge_2", "b": "matched:no_group", "c": "matched:lifecycle_newcomer",
        "d": "matched:lifecycle_at_risk", "e": "matched:handover_pending", "g": "matched:no_group",
        "h": "matched:absence_streak_ge_2", "s": "matched:absence_streak_ge_2",
    }, out


def test_voice_filters_are_only_existing_chips():
    chips = set(re.findall(r'filter:\s*"([a-z_0-9]+)"', read(CHIPS)))
    out = run_node(VPRE + r"console.log(JSON.stringify(V.INTENTS.map(i => i.filter)));")
    assert set(out) == chips, (out, chips)
    trial = read(TRIAL)
    for f in out:
        assert f'"{f}"' in trial, f"queryQuickFilter 不認得 {f}"


def test_voice_ambiguous_does_not_guess():
    out = run_node(VPRE + r"""
    const x = r('新朋友沒來');
    console.log(JSON.stringify({s: x.state, f: x.filter, n: x.candidates.length, m: x.message}));
    """)
    assert out["s"] == "ambiguous" and out["f"] == "" and out["n"] >= 2 and "不替你猜" in out["m"], out


def test_voice_actions_are_warned_never_executed():
    out = run_node(VPRE + r"""
    const a = r('通知缺席的人');
    const b = r('幫我發訊息給大家');
    console.log(JSON.stringify({a: a.state, an: a.notes.join(''), b: b.state, bf: b.filter, bn: b.notes.join('')}));
    """)
    assert out["a"] == "matched" and "不會代你發訊息" in out["an"], out
    assert out["b"] == "none" and out["bf"] == "" and "不會代你發訊息" in out["bn"], out


def test_voice_other_counts_explained():
    out = run_node(VPRE + r"""
    console.log(JSON.stringify({three: r('誰連續沒來三次').notes.join(''), two: r('誰連續沒來兩次').notes.join(''),
      num: r('缺席 4 週的人').notes.join('')}));
    """)
    assert "只提供固定的" in out["three"] and "只提供固定的" in out["num"], out
    assert out["two"] == "", out


def test_voice_time_words_explained():
    out = run_node(VPRE + r"""
    console.log(JSON.stringify({m: r('這個月誰沒來').notes.join(''), n: r('誰沒來').notes.join('')}));
    """)
    assert "不依日期篩選" in out["m"] and out["n"] == "", out


def test_voice_safety_words_block_listing():
    out = run_node(VPRE + r"""
    const x = r('有組員想自殺，誰沒來');
    const y = r('她被家暴');
    console.log(JSON.stringify({x: x.state, xf: x.filter, xm: x.message, y: y.state}));
    """)
    assert out["x"] == "safety" and out["xf"] == "" and "牧者" in out["xm"] and out["y"] == "safety", out


def test_voice_empty_and_unknown():
    out = run_node(VPRE + r"""
    console.log(JSON.stringify({e: r('   ').state, u: r('今天天氣好嗎').state, um: r('今天天氣好嗎').message, nul: r(null).state}));
    """)
    assert out["e"] == "empty" and out["nul"] == "empty" and out["u"] == "none" and "沒聽懂" in out["um"], out


def test_voice_is_offline_and_stateless():
    src = read(VQ)
    for bad in ("fetch(", "XMLHttpRequest", "localStorage", "sessionStorage", "sendBeacon", "http://", "https://"):
        assert bad not in src, f"cm_voice_query.js 不應含 {bad}"


def test_pastoral_page_wiring_shares_chip_path():
    html = read(PAST_PAGE)
    for needle in ('id="past-vq-form"', 'id="past-vq-input"', 'id="past-vq-msg"', "cm_voice_query.js"):
        assert needle in html, f"pastoral-integrated.html 缺 {needle}"
    assert html.index("cm_voice_query.js") < html.index("pastoral_nlq_panel.js"), "cm_voice_query 要先於 nlq 面板載入"
    nlq = read(NLQ)
    assert "function runFilter" in nlq and nlq.count("runFilter(") >= 3, "chip 與一句話查須共用 runFilter"
    assert "CmVoiceQuery" in nlq
    for bad in ("fetch(", "XMLHttpRequest"):
        assert bad not in nlq


# ───────── 表單 → 會友草稿 ─────────

IPRE = r"""
const M = require(%r);
const NOW = new Date(2026, 10, 24, 12).getTime(); // 2026-11-24
const build = (text, existing) => M.buildDrafts(M.parseTable(text), existing || [], {nowMs: NOW, batchId: 't'});
""" % str(INTAKE)

GOOGLE_HEADER = "\t".join([
    "時間戳記", "您的姓名", "聯絡電話（手機）", "電子郵件地址", "性別", "生日（年-月-日）", "誰邀請你來？",
    "請問有什麼代禱事項？", "其他意見",
])


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def test_parse_tsv_csv_bom_quotes_and_blank_rows():
    csv_text = '\ufeffname,note\n"王, 小明","他說""好"""\n"李\n華",x\n'
    out = run_node(IPRE + r"""
    const tsv = M.parseTable('a\tb\n1\t2\n\n3\t4\n');
    const csv = M.parseTable(%s);
    console.log(JSON.stringify({th: tsv.headers, tr: tsv.rows, d1: tsv.delimiter, ch: csv.headers, cr: csv.rows, d2: csv.delimiter,
      empty: M.parseTable('   \n  ').rows.length}));
    """ % js_str(csv_text))
    assert out["th"] == ["a", "b"] and out["tr"] == [["1", "2"], ["3", "4"]] and out["d1"] == "tab", out
    assert out["ch"] == ["name", "note"] and out["d2"] == "comma", out
    assert out["cr"] == [["王, 小明", '他說"好"'], ["李\n華", "x"]], out
    assert out["empty"] == 0, out


def test_header_mapping_and_sensitive_columns_ignored():
    out = run_node(IPRE + "const hm = M.mapHeaders(%s.split('\\t'));\nconsole.log(JSON.stringify(hm));" % js_str(GOOGLE_HEADER))
    m = out["mapping"]
    for k in ("timestamp", "name", "phone", "email", "gender", "birthday", "inviter", "note"):
        assert k in m, (k, out)
    ign = {g["header"]: g["reason"] for g in out["ignored"]}
    assert "請問有什麼代禱事項？" in ign and "敏感" in ign["請問有什麼代禱事項？"], out


def test_sensitive_data_never_reaches_drafts():
    row = "\t".join(["2026/11/20 下午 3:12:00", "陳大文", "91234567", "dm@example.com", "男", "1990/5/3", "王姐",
                     "我媽媽癌症末期，請代禱 SECRET-PRAYER", "多謝"])
    out = run_node(IPRE + "const res = build(%s);\nconsole.log(JSON.stringify(res));" % js_str(GOOGLE_HEADER + "\n" + row))
    blob = json.dumps(out, ensure_ascii=False)
    assert "SECRET-PRAYER" not in blob and "癌症" not in blob, "敏感欄位內容不應出現在草稿"
    d = out["drafts"][0]
    assert d["notes"] == "介紹人：王姐；表單備註：多謝", d


def test_draft_fields_normalized_and_ready():
    row = "\t".join(["2026/11/20 下午 3:12:00", "  陳  大文 ", "+852 9123-4567", "DM@Example.com", "男性", "1990/5/3", "", "", ""])
    out = run_node(IPRE + "const d = build(%s).drafts[0];\nconsole.log(JSON.stringify(d));" % js_str(GOOGLE_HEADER + "\n" + row))
    assert out["name"] == "陳 大文" and out["phone"] == "+85291234567" and out["email"] == "dm@example.com", out
    assert out["gender"] == "男" and out["birthday"] == "1990-05-03" and out["age"] == 36, out
    assert out["first_visit_date"] == "2026-11-20" and out["status"] == "ready" and out["row_no"] == 2, out


def test_bad_values_warn_but_do_not_crash():
    rows = [
        "\t".join(["", "甲", "12", "not-an-email", "不明", "3/5/1990", "", "", ""]),
        "\t".join(["2099/01/01", "乙", "91234567", "", "", "2999-01-01", "", "", ""]),
        "\t".join(["", "", "91110000", "", "", "", "", "", ""]),
        "\t".join(["", "丙", "", "", "", "", "", "", ""]),
    ]
    out = run_node(IPRE + "const res = build(%s);\nconsole.log(JSON.stringify(res.drafts));" % js_str(GOOGLE_HEADER + "\n" + "\n".join(rows)))
    a, b, c, d = out
    assert a["status"] == "check" and a["phone"] == "" and a["email"] == "" and len(a["warnings"]) >= 4, a
    assert b["first_visit_date"] == "2026-11-24" and b["birthday"] == "" and b["status"] == "check", b  # 未來日期不採用
    assert c["status"] == "invalid" and "沒有姓名" in c["warnings"][0], c
    assert d["status"] == "check" and any("沒有電話也沒有電郵" in w for w in d["warnings"]), d


def test_duplicate_detection_existing_and_batch():
    existing = [
        {"id": 7, "name": "舊會友", "phone": "91234567", "email": ""},
        {"id": 8, "name": "同名者", "phone": "60000000", "email": "x@y.com"},
        {"id": 9, "name": "另一位", "phone": "", "email": "same@mail.com"},
    ]
    rows = [
        "\t".join(["", "新甲", "+852 9123 4567", "", "", "", "", "", ""]),   # 對名冊 電話（後 8 碼相同）
        "\t".join(["", "同名者", "98887777", "", "", "", "", "", ""]),       # 只同名 → check
        "\t".join(["", "新乙", "", "SAME@mail.com", "", "", "", "", ""]),     # 對名冊 電郵
        "\t".join(["", "批內甲", "95550000", "", "", "", "", "", ""]),
        "\t".join(["", "批內甲二", "9555 0000", "", "", "", "", "", ""]),     # 批內電話重複
    ]
    out = run_node(IPRE + "const res = build(%s, %s);\nconsole.log(JSON.stringify(res.drafts.map(d => ({n:d.name, s:d.status, k:d.duplicates.map(x => x.kind+':'+x.where)}))));"
                   % (js_str(GOOGLE_HEADER + "\n" + "\n".join(rows)), json.dumps(existing, ensure_ascii=False)))
    by = {d["n"]: d for d in out}
    assert by["新甲"]["s"] == "duplicate" and "phone:名冊" in by["新甲"]["k"], by
    assert by["同名者"]["s"] == "check" and by["同名者"]["k"] == ["name:名冊"], by
    assert by["新乙"]["s"] == "duplicate" and "email:名冊" in by["新乙"]["k"], by
    assert by["批內甲"]["s"] == "check" or by["批內甲"]["s"] == "ready", by
    assert by["批內甲二"]["s"] == "duplicate" and "phone:本批" in by["批內甲二"]["k"], by


def test_missing_name_column_reported():
    out = run_node(IPRE + r"""
    const res = build('電話\t電郵\n91234567\ta@b.com');
    console.log(JSON.stringify({has: res.has_name_column, n: res.drafts.length, st: res.drafts[0].status}));
    """)
    assert out["has"] is False and out["st"] == "invalid", out


def test_member_record_uses_next_id_and_human_stage():
    out = run_node(IPRE + r"""
    const res = build('姓名\t電話\n陳\t91234567');
    const existing = [{id: 3}, {memberId: 12}, {id: 'legacy_x'}];
    const rec = M.toMemberRecord(res.drafts[0], existing, {stage: 'new_believer'});
    const rec2 = M.toMemberRecord(res.drafts[0], [], {});
    console.log(JSON.stringify({rec, id2: rec2.id, st2: rec2.spiritual_journey_stage, next: M.nextMemberId(existing)}));
    """)
    r = out["rec"]
    assert r["id"] == 13 and r["memberId"] == 13 and out["next"] == 13, out
    assert r["spiritual_journey_stage"] == "new_believer" and r["baptized"] is False and r["membershipDate"] == "", r
    assert r["source"] == "form_intake" and r["intake_draft_id"].startswith("fd_"), r
    assert out["id2"] == 1 and out["st2"] == "seeker", out


def test_core_never_writes_or_goes_online():
    src = read(INTAKE)
    for bad in ("saveMemberSystemData", "localStorage", "fetch(", "XMLHttpRequest", "sendBeacon", "http://", "https://"):
        assert bad not in src, f"cm_member_intake.js 不應含 {bad}"


def test_panel_single_write_path_and_privacy_guards():
    src = read(PANEL)
    assert src.count("saveMemberSystemData(") == 1, "寫入會友必須只有一個入口"
    assert "RBAC_DENIED" in src and "duplicatesAgainst" in src, "寫入前要再查一次重複、要處理無權限"
    assert 'ta.value = ""' in src, "整理後須清掉貼上框"
    assert "confirm(" in src and "我確認不是同一人" in src
    for bad in ("fetch(", "XMLHttpRequest", "sendBeacon"):
        assert bad not in src

def test_intake_page_and_entry_link():
    html = read(PAGE)
    for needle in ('id="mi-paste"', 'id="mi-build"', 'id="mi-drafts"', 'id="mi-add-ready"', 'id="mi-clear-all"',
                   'id="mi-stage"', 'id="mi-links"', "還不是會友", "不會匯入", "cm_member_intake.js",
                   "cm_member_intake_panel.js", "cm_google_links_config.js"):
        assert needle in html, f"member_form_intake.html 缺 {needle}"
    assert 'href="member_form_intake.html"' in read(MEMBER_PAGE) and "linkFormIntake" in read(MEMBER_PAGE)


def test_plan_doc_mentions_p5():
    doc = read(PLAN)
    for needle in ("§5.6", "§5.7", "cm_voice_query", "cm_member_intake", "member_form_intake", "匹配口徑"):
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
