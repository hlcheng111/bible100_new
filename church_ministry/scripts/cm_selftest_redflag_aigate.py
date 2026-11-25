# -*- coding: utf-8 -*-
"""自我演練：紅旗「標記→通知稿→複製」＋ AI 協談安全閘門（無頭 Edge，file://）。

用法：python church_ministry/scripts/cm_selftest_redflag_aigate.py
輸出每步 OK/FAIL；全 OK 退出碼 0。不寫入任何正式資料（只動瀏覽器暫存 profile）。
"""
import json
import sys

sys.path.insert(0, "church_ministry/scripts")
import cm_zone_flows as F  # noqa: E402

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(("OK  " if cond else "FAIL"), name, detail if not cond else "")


def js(r, expr):
    v = r.js(expr)
    return v


def main():
    r = F.Run(9302)
    try:
        # ---------- 紅旗 ----------
        page = "church_ministry/modules/fellowship/pastoral_alerts_panel.html"
        r.nav(page, 1.5)
        # 先放兩位測試會友到瀏覽器暫存（暫存 profile，不碰正式資料），再重載
        js(r, "localStorage.setItem('memberSystemData', JSON.stringify({churchId:'default',members:["
              "{memberId:1,id:1,name:'測試甲',status:'active'},{memberId:2,id:2,name:'測試乙',status:'active'}]})); return 1")
        r.nav(page, 2.2)
        n_flags = js(r, "return document.querySelectorAll('#rf-flags input[data-rf-flag]').length")
        check("紅旗：顯示勾選項", (n_flags or 0) >= 6, "flags=%s" % n_flags)

        # 沒勾就按標記 → 要提示，不產生通知稿
        js(r, "document.getElementById('rf-mark').click(); return 1")
        r.wait(0.3)
        st = js(r, "return document.getElementById('rf-status').textContent")
        notice_hidden = js(r, "var n=document.getElementById('rf-notice'); return !n || n.hidden")
        check("紅旗：未勾選時擋下並提示", st and "勾選" in st and notice_hidden, st)

        # 勾「住院」＋「自傷」並選一位會友
        js(r, """
          var cbs=document.querySelectorAll('#rf-flags input[data-rf-flag]');
          cbs.forEach(function(c){ if(c.value==='hospital'||c.value==='self_harm'){c.checked=true;} });
          var sel=document.getElementById('rf-member');
          if(sel && sel.options.length>1){ sel.selectedIndex=1; }
          return sel ? sel.options.length : -1
        """)
        js(r, "document.getElementById('rf-mark').click(); return 1")
        r.wait(0.5)
        notice = js(r, "var n=document.getElementById('rf-notice'); return n && !n.hidden ? n.textContent : ''")
        status = js(r, "return document.getElementById('rf-status').textContent")
        copy_vis = js(r, "var b=document.getElementById('rf-copy'); return !!b && !b.hidden")
        check("紅旗：產生通知稿", bool(notice) and len(notice) > 20, notice[:60] if notice else "")
        check("紅旗：危機項目有醒目字樣", notice and ("危機" in notice or "立即" in notice or "緊急" in notice), (notice or "")[:120])
        check("紅旗：通知稿提示交給至少兩位牧者", "2" in (status or "") or "兩" in (status or "") or "至少" in (status or ""), status)
        check("紅旗：出現複製鈕", copy_vis)

        # 事件寫入（人工標記、不經 AI）
        logged = js(r, """
          var hit=0;
          for (var i=0;i<localStorage.length;i++){
            var k=localStorage.key(i); var v=localStorage.getItem(k)||'';
            if (v.indexOf('red_flag')>=0 && v.indexOf('human_marked')>=0) hit++;
          }
          return hit
        """)
        has_member = js(r, "var s=document.getElementById('rf-member'); return !!s && s.selectedIndex>0")
        if has_member:
            check("紅旗：有選會友時寫入事件流", (logged or 0) >= 1, "hit=%s" % logged)
        else:
            print("NOTE 紅旗：名冊為空，未選會友；已驗證降級（只產生通知稿）。status=", status)
            check("紅旗：無名冊時降級提示", "沒有選會友" in (status or "") or "通知稿" in (status or ""), status)

        # 複製
        js(r, "document.getElementById('rf-copy').click(); return 1")
        r.wait(0.6)
        st2 = js(r, "return document.getElementById('rf-status').textContent")
        check("紅旗：按複製後無 JS 例外", not [e for e in r.errors if "rf-" in str(e)], str(r.errors[-2:]))

        # ---------- AI 協談閘門 ----------
        r.nav("ai_tools/tools/ai_workbench_integrated.html?scenario=counsel_boundary", 2.5)
        gate = js(r, "var g=document.getElementById('ai-wb-gate'); return g ? g.querySelectorAll('input[type=checkbox]').length : -1")
        check("AI 閘門：載入協談情境即出現自檢表", (gate or 0) >= 4, "items=%s" % gate)
        res0 = js(r, "var b=document.getElementById('ai-wb-result'); return b ? b.textContent : ''")
        check("AI 閘門：自檢前不出現提示詞", "自檢" in (res0 or ""), (res0 or "")[:80])

        # 勾危機 → 停止
        js(r, "document.querySelector('#ai-wb-gate input[type=checkbox][value=self_harm]').click(); return 1")
        r.wait(0.3)
        blocked = js(r, """
          var m=document.querySelector('#ai-wb-gate .ai-wb-gate__blocked');
          var ok=document.querySelector('#ai-wb-gate button');
          return JSON.stringify({show: !!m && !m.hidden, text: m? m.textContent:'', okDisabled: ok? ok.disabled:null})
        """)
        b = blocked if isinstance(blocked, dict) else json.loads(blocked)
        check("AI 閘門：勾危機後顯示『交給牧者與專業協助』", b["show"] and "牧者" in b["text"], b["text"][:80])
        check("AI 閘門：勾危機後『產生提示詞』鈕被鎖", b["okDisabled"] is True)
        # 強按也不能產生
        js(r, "document.querySelector('#ai-wb-gate button').click(); return 1")
        r.wait(0.3)
        res1 = js(r, "var b=document.getElementById('ai-wb-result'); return b ? b.textContent : ''")
        check("AI 閘門：危機狀態不產生提示詞", "已停止" in (res1 or "") or "自檢" in (res1 or ""), (res1 or "")[:80])
        # 複製被擋
        cp = js(r, """
          if (typeof window.copyPrompt==='function') { try { var p=window.copyPrompt(); return 'called'; } catch(e){ return 'err '+e } }
          return 'nofn'
        """)
        # 取消危機 → 可產生
        js(r, "document.querySelector('#ai-wb-gate input[type=checkbox][value=self_harm]').click(); return 1")
        r.wait(0.3)
        js(r, "document.querySelector('#ai-wb-gate button').click(); return 1")
        r.wait(0.5)
        res2 = js(r, "var b=document.getElementById('ai-wb-result'); return b ? b.textContent : ''")
        check("AI 閘門：全未勾才產生提示詞", res2 and "自檢" not in res2[:20] and len(res2) > 80, (res2 or "")[:80])
        check("AI 閘門：提示詞帶『AI 草稿，須牧者審核』", "AI 草稿，須牧者審核" in (res2 or ""))
        check("AI 閘門：提示詞要求不得編造", "不得編造" in (res2 or "") or "不編造" in (res2 or "") or "不可編造" in (res2 or ""))
        import re
        check("AI 閘門：提示詞沒寫死電話", not re.search(r"\d{5,}", res2 or ""))

        errs = [e for e in r.errors if "favicon" not in str(e)]
        check("兩頁皆無 JS 例外", not errs, str(errs[-3:]))
    finally:
        r.close()
    bad = [n for n, ok in results if not ok]
    print("\nDONE %d checks, %d fail" % (len(results), len(bad)))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
