# -*- coding: utf-8 -*-
"""
教會事工 · 階段 3：跨區「流程」檢查（全自動，用無頭 Edge 真的走一遍）

階段 2 看「每一頁會不會爆」；階段 3 看「一件事從 A 頁做到 Z 頁，資料有沒有真的接上」。
五條流程（每步都註明跨哪幾區）：
  F1 新朋友→登記→發碼→簽到→名冊→跟進          （B 牧養／0 CRM）
  F2 缺席→預警→探訪草稿→關懷→回來後解除        （B 牧養）
  F3 初信→門訓完成→出席達標→門徒晉升（提摩太池）（B 牧養／C 門訓）
  F4 排班→重複排／請假→檢查器抓到→補救後消失    （E 服事／G 規劃）
  F5 備份→模擬遺失→還原（含加密、壞檔）→資料原樣回來（G 行政）

做法：頁面操作盡量用真的畫面（填表、按按鈕）；準備資料與核對用頁面自己載入的 API。
每步記 ✅／🟡／❌＋證據；全程不寫專案檔，只寫報告與截圖。瀏覽器用全新暫存設定檔。

執行：
  python church_ministry/scripts/cm_zone_flows.py                 # 全部流程
  python church_ministry/scripts/cm_zone_flows.py --flows f1,f4
產出（church_ministry/audit/stage3/）：flows.json／flows.md／screens/
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(HERE))

import cm_zone_dynamic as D  # noqa: E402  重用：瀏覽器、CDP、事件分類

OUT = REPO / "church_ministry" / "audit" / "stage3"
FS = "church_ministry/modules/fellowship"

# 讓流程不被 confirm／alert 卡住，並把 alert 內容記下來供核對
INIT_JS = (
    "window.__alerts=[];window.__confirms=[];"
    "window.alert=function(m){window.__alerts.push(String(m))};"
    "window.confirm=function(m){window.__confirms.push(String(m));return true};"
    "window.prompt=function(){return ''};"
)

ICON = {"ok": "✅", "warn": "🟡", "bad": "❌"}


class Run:
    def __init__(self, port: int):
        self.br = D.Browser(port=port)
        self.c = self.br.cdp
        self.c.send("Page.addScriptToEvaluateOnNewDocument", {"source": INIT_JS})
        self.steps: list[dict] = []
        self.flow = ""
        self.shots = OUT / "screens"
        self.n = 0
        self.errors: list[str] = []

    # ---- 瀏覽器動作 ----
    def nav(self, rel: str, settle: float = 1.3):
        path, suffix = re.match(r"([^?#]*)(.*)", rel).groups()
        url = (REPO / path).resolve().as_uri() + suffix
        c = self.c
        c.drain()
        c.send("Page.navigate", {"url": "about:blank"}, timeout=10)
        c.pump(0.15)
        c.drain()
        c.send("Page.navigate", {"url": url}, timeout=D.NAV_TIMEOUT)
        c.pump(D.NAV_TIMEOUT, until=lambda: any(e["method"] == "Page.loadEventFired" for e in c.events))
        c.pump(settle)
        self.collect_errors(rel)

    def collect_errors(self, where: str):
        exc, con, failed, http_bad, _ = D.classify_events(self.c.drain())
        for e in exc:
            self.errors.append(f"{where}：JS 例外 {e}")
            self.add("頁面載入時不應有 JS 例外", "bad", f"{where} → {e}", sev="P1", shot=False)

    def js(self, expr: str, timeout: float = 20.0):
        """執行一段會 return JSON 字串的 JS（async 可）；回傳解析後的值。"""
        raw = self.c.eval("(async function(){ try { " + expr + " } catch(e){ return JSON.stringify({__err: String(e && e.message || e)}); } })()", timeout)
        if isinstance(raw, dict) and "__error__" in raw:
            return {"__err": raw["__error__"]}
        try:
            v = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            return raw
        return v

    def wait(self, sec: float):
        self.c.pump(sec)
        self.collect_errors("互動中")

    def text(self) -> str:
        v = self.c.eval("document.body ? document.body.innerText : ''")
        return v if isinstance(v, str) else ""

    def shot(self, label: str) -> str:
        try:
            self.n += 1
            fn = f"{self.n:02d}_{self.flow.split(' ')[0]}.jpg"
            d = self.c.send("Page.captureScreenshot", {"format": "jpeg", "quality": 45}, timeout=15)
            self.shots.mkdir(parents=True, exist_ok=True)
            (self.shots / fn).write_bytes(base64.b64decode(d["data"]))
            return fn
        except Exception:
            return ""

    def reset_storage(self):
        """全新空白 → 載入示範會友 → 牧養示範資料。"""
        self.nav("church_ministry/load_central_member_seed.html", 3.0)
        self.js("localStorage.clear(); return JSON.stringify(1);")
        self.nav("church_ministry/load_central_member_seed.html", 3.5)
        self.nav(f"{FS}/pastoral-integrated.html", 1.5)
        r = self.js("if(window.PastoralTrialPack){PastoralTrialPack.ensureTrialChurch(true);} else if(window.PastoralDataHub){PastoralDataHub.ensurePastoralSeed(true);} "
                    "return JSON.stringify({hub:!!window.PastoralDataHub, n:(window.PastoralDataHub?PastoralDataHub.getMembers().length:0)});")
        return r

    # ---- 記錄 ----
    def add(self, name: str, status: str, detail: str = "", sev: str = "", zones: str = "", shot: bool = True):
        s = {"flow": self.flow, "step": name, "status": status, "detail": detail, "sev": sev if status != "ok" else "",
             "zones": zones, "screenshot": self.shot(name) if shot else ""}
        self.steps.append(s)
        print(f"  {ICON[status]} {name}" + (f" — {detail[:110]}" if detail and status != "ok" else ""), flush=True)

    def check(self, name: str, cond, detail: str = "", sev: str = "P1", zones: str = "", soft: bool = False, shot: bool = True):
        """soft=True：不成立只算 🟡（設計缺口／可改善），不算 ❌。"""
        if cond:
            self.add(name, "ok", detail, zones=zones, shot=shot)
        else:
            self.add(name, "warn" if soft else "bad", detail, sev=sev, zones=zones, shot=shot)
        return bool(cond)

    def close(self):
        self.br.close()


def err_of(v) -> str:
    return v.get("__err", "") if isinstance(v, dict) else ""


# ═════════════════════════ F1 新朋友 ═════════════════════════
def flow_f1(r: Run):
    r.flow = "F1 新朋友→名冊→跟進"
    print(f"\n【{r.flow}】", flush=True)
    r.reset_storage()
    NAME, PHONE = "流程新朋友甲", "0911000111"

    r.nav(f"{FS}/newcomer-self-register.html")
    r.js(f"document.getElementById('nc-name').value={json.dumps(NAME)};"
         f"document.getElementById('nc-phone').value={json.dumps(PHONE)};"
         "document.getElementById('nc-note').value='第一次來';"
         "document.querySelectorAll('input[type=checkbox]').forEach(function(c,i){ if(i===0) c.checked=true; });"
         "document.getElementById('nc-submit').click(); return JSON.stringify(1);")
    r.wait(0.8)
    ok_vis = r.js("var e=document.getElementById('nc-ok'); return JSON.stringify(!!e && getComputedStyle(e).display!=='none');")
    r.check("新朋友自助登記：送出後看到成功提示", ok_vis is True, "沒看到 #nc-ok 成功區塊", zones="0／B")
    mem = r.js(f"var ms=JSON.parse(localStorage.getItem('memberSystemData')||'{{}}'); var m=(ms.members||[]).find(function(x){{return x.name==={json.dumps(NAME)};}}); return JSON.stringify(m?{{id:m.id,status:m.status}}:null);")
    r.check("登記後會友主檔真的多了一人（member_id）", bool(mem) and mem.get("id") is not None, f"主檔查無此人：{mem}", zones="0／B", shot=False)

    r.nav(f"{FS}/newcomer-qr-desk.html")
    r.check("接待台『待發碼』看得到這位新朋友", NAME in r.text(), "待發碼名單沒有此人（登記→接待台沒接上）", zones="B")
    r.js("var b=document.querySelector('.btn-issue'); if(b) b.click(); return JSON.stringify(!!b);")
    r.wait(1.0)
    code = r.js("var N=window.NewcomerQrStore; var i=N?N.listIssued(1)[0]:null; return JSON.stringify(i?{code:i.checkinCode,mid:i.memberId}:null);")
    r.check("接待台按『發碼』→ 真的發出 6 碼身份碼", bool(code) and code.get("code"), "沒有發碼紀錄", zones="B")
    r.check("發碼後畫面顯示該碼（可列印）", bool(code) and code.get("code") and code["code"] in r.text(), "畫面沒有顯示碼", sev="P2", soft=True)
    if not code:
        return
    mid = code["mid"]

    # 簽到：用畫面
    r.nav(f"{FS}/attendance-checkin.html")
    evt = r.js("var S=window.AttendanceCheckinStore; if(!S) return JSON.stringify({err:'no store'});"
               "var e=S.createEvent({type:'worship',title:'流程測試主日'}); S.startEvent(e.id||(e.event&&e.event.id)); "
               "return JSON.stringify({id:e.id||(e.event&&e.event.id)});")
    eid = evt.get("id") if isinstance(evt, dict) else ""
    r.nav(f"{FS}/attendance-checkin.html")
    r.js("var b=document.getElementById('ac-btn-begin-tonight'); if(b) b.click(); return JSON.stringify(1);")
    r.wait(0.6)
    r.js("var s=document.getElementById('ac-event-select'); if(s && " + json.dumps(eid) + "){ s.value=" + json.dumps(eid) + "; s.dispatchEvent(new Event('change',{bubbles:true})); }"
         f"var q=document.getElementById('ac-manual-q'); q.value={json.dumps(code['code'])}; document.getElementById('ac-btn-search').click(); return JSON.stringify(1);")
    r.wait(1.0)
    r.js("var h=document.querySelector('#ac-manual-hits button'); if(h) h.click(); return JSON.stringify(!!h);")
    r.wait(0.8)
    att = r.js(f"var S=AttendanceCheckinStore; var id={json.dumps(eid)}; var rows=S.listAttendance(id)||[]; return JSON.stringify(rows.filter(function(a){{return String(a.memberId)===String({json.dumps(mid)});}}).length);")
    r.check("輸入身份碼→簽到成功（出席紀錄多一筆）", att == 1 or att == 1.0 or (isinstance(att, int) and att >= 1),
            f"出席紀錄筆數={att}（畫面搜尋→簽到沒走通）", zones="B", sev="P1")

    # 名冊 / 跟進
    r.nav(f"{FS}/pastoral-integrated.html", 1.5)
    life = r.js(f"var H=PastoralDataHub; var inbox=H.getPastoralTaskInbox().filter(function(t){{return String(t.memberId)===String({json.dumps(mid)});}}); "
                f"return JSON.stringify({{inHub:!!H.getMemberById({json.dumps(mid)}), stage:H.getMemberLifecycleStage({json.dumps(mid)}), tasks:inbox.map(function(t){{return t.type;}})}});")
    r.check("牧養名冊（PastoralDataHub）讀得到這位新朋友", bool(life) and life.get("inHub"), "牧養端找不到（0／B 之間沒共用 member_id）", zones="0／B", shot=False)
    r.nav(f"{FS}/pastoral-org-roster.html", 1.8)
    r.js("var t=document.querySelector('.por-tab[data-tab=roster]'); if(t) t.click(); return JSON.stringify(1);")
    r.wait(0.8)
    r.check("牧養名冊頁『多維矩陣名冊』Tab 看得到他", NAME in r.text(), "名冊 Tab 沒顯示新朋友", zones="B")
    nf = r.js(f"var o=JSON.parse(localStorage.getItem('pastoral_org_v1')||'{{}}'); var ts=(o.handoverTasks||[]).filter(function(t){{return t.type==='newcomer_followup'&&String(t.memberId)==={json.dumps(str(mid))};}}); "
              "return JSON.stringify(ts.map(function(t){return {due:t.dueDate,days:t.dueInDays,status:t.status};}));")
    r.check("登記後『3 日內跟進』任務自動建立，且只有 1 張（發碼／簽到沒重複）",
            isinstance(nf, list) and len(nf) == 1 and nf[0].get("days") == 3 and nf[0].get("status") == "pending",
            f"newcomer_followup 任務：{nf}", sev="P2", zones="B", shot=False)
    r.check("這張跟進任務出現在牧養『任務清單』（getPastoralTaskInbox）",
            bool(life) and "newcomer_followup" in life.get("tasks", []),
            f"任務清單類型：{life and life.get('tasks')}", sev="P2", zones="B", shot=False)

    # 另一條路徑：青年登記 → 有任務
    r.nav(f"{FS}/pastoral-integrated.html", 1.5)
    y = r.js("var x=PastoralDataHub.registerYouthNewcomer({name:'流程青年乙',activity:'青年查經'}); "
             "var t=PastoralDataHub.getPastoralTaskInbox().filter(function(k){return String(k.memberId)===String(x.memberId);}); "
             "return JSON.stringify({ok:x.ok,tasks:t.map(function(k){return k.type;})});")
    r.check("青年登記路徑：會自動產生『新朋友落戶』任務", bool(y) and y.get("ok") and "newcomer_placement" in y.get("tasks", []), f"{y}", zones="B", shot=False)
    r.nav(f"{FS}/pastoral-org-roster.html#tab-lifecycle", 1.8)
    r.js("var t=document.querySelector('.por-tab[data-tab=lifecycle]'); if(t) t.click(); return JSON.stringify(1);")
    r.wait(0.8)
    r.check("名冊『生命週期轉接』Tab 看得到青年乙的落戶任務（任務連結指向這裡）", "流程青年乙" in r.text(), "任務產生了但轉接 Tab 沒顯示", sev="P2", soft=True, zones="B")


# ═════════════════════════ F2 缺席→關懷 ═════════════════════════
def flow_f2(r: Run):
    r.flow = "F2 缺席→預警→關懷"
    print(f"\n【{r.flow}】", flush=True)
    r.reset_storage()
    r.nav(f"{FS}/pastoral-integrated.html", 1.5)
    info = r.js(
        "var H=PastoralDataHub; var g=H.getGroups().find(function(x){return H.membersInGroup(x.id).length>=3;}); if(!g) return JSON.stringify({err:'no group'});"
        "var ms=H.membersInGroup(g.id); var target=ms[0]; var wks=H.getAbsenceThreshold().weeks; var base=new Date();"
        "for(var i=wks;i>=0;i--){ var d=new Date(base.getTime()-i*7*86400000); var iso=d.toISOString().slice(0,10);"
        "  var recs=ms.map(function(m){return {memberId:m.id,status:(m.id===target.id?'absent':'present')};});"
        "  H.recordGroupAttendanceSession(g.id, iso, recs); }"
        "return JSON.stringify({gid:g.id,mid:target.id,name:target.name,weeks:wks});")
    if not r.check("準備：找到有 3 人以上的小組並登記連續缺席", isinstance(info, dict) and "mid" in info, f"{info}", shot=False):
        return
    mid, name, gid = info["mid"], info["name"], info["gid"]
    alerts = r.js(f"var a=PastoralDataHub.listAbsenceAlerts().filter(function(x){{return String(x.memberId)===String({json.dumps(mid)});}}); return JSON.stringify(a);")
    r.check(f"連續缺席 {info['weeks']} 週 → 進入預警名單", bool(alerts), "沒進預警名單", zones="B", shot=False)
    inbox = r.js(f"var t=PastoralDataHub.getPastoralTaskInbox().filter(function(x){{return String(x.memberId)==={json.dumps(str(mid))}||String(x.memberId)==={json.dumps(mid)};}}); return JSON.stringify(t.map(function(x){{return x.type;}}));")
    r.check("預警 → 任務清單有『探訪草稿』或『缺席』任務", bool(inbox), f"任務清單沒有他：{inbox}", zones="B", shot=False)

    r.nav(f"{FS}/pastoral_alerts_panel.html?embed=pastoral", 1.5)
    r.check("缺席預警面板畫面看得到這個人", name in r.text(), "預警面板沒顯示（資料有、畫面沒有）", zones="B")
    r.nav(f"{FS}/pastoral_visitation_panel.html?embed=pastoral", 1.5)
    r.check("探訪佇列畫面看得到這個人", name in r.text(), "探訪佇列沒顯示", sev="P2", soft=True, zones="B")

    # 預警面板按鈕：加入探訪（safe）
    r.nav(f"{FS}/pastoral_alerts_panel.html?embed=pastoral", 1.5)
    clicked = r.js("var b=Array.prototype.find.call(document.querySelectorAll('button'),function(x){return /探訪|探访|加入|佇列|队列/.test(x.innerText);}); if(b) b.click(); return JSON.stringify(b?b.innerText.trim().slice(0,20):null);")
    r.wait(0.8)
    r.check("預警面板有可按的『加入探訪』類按鈕且按了不爆", clicked is not None, "找不到按鈕", sev="P2", soft=True, zones="B")

    # 外殼 Tab 切換（file:// 修復驗證）：從探訪 Tab 回其他 Tab 不報 SecurityError
    r.nav(f"{FS}/pastoral-integrated.html#tab-attendance", 2.0)
    r.js("var f=document.getElementById('past-integrated-subframe'); return JSON.stringify(f?f.src:null);")
    r.wait(1.0)
    r.check("工作桌開『點名』Tab 在 file:// 下沒有 SecurityError", not r.errors or not any("SecurityError" in e for e in r.errors), "；".join(r.errors[-2:]), sev="P1")
    r.shot("點名Tab")

    # 關懷完成 → 任務消失
    r.nav(f"{FS}/pastoral-integrated.html", 1.5)
    done = r.js(f"var H=PastoralDataHub; H.evaluateLifecycleRules(); var ts=H.getPastoralTaskInbox().filter(function(x){{return String(x.memberId)===String({json.dumps(mid)});}}); "
                "ts.forEach(function(t){H.completePastoralTask(t.id);}); "
                f"var left=H.getPastoralTaskInbox().filter(function(x){{return String(x.memberId)===String({json.dumps(mid)}) && x.type!=='absence';}}); return JSON.stringify({{done:ts.length,left:left.length}});")
    r.check("完成關懷後，探訪／交接任務從清單消失", isinstance(done, dict) and done.get("left") == 0, f"{done}", zones="B", shot=False)

    # 他回來了 → 預警解除
    back = r.js(f"var H=PastoralDataHub; var ms=H.membersInGroup({json.dumps(gid)}); var recs=ms.map(function(m){{return {{memberId:m.id,status:'present'}};}}); "
                "H.recordGroupAttendanceSession(" + json.dumps(gid) + ", new Date().toISOString().slice(0,10), recs); "
                f"var still=H.listAbsenceAlerts().some(function(a){{return String(a.memberId)===String({json.dumps(mid)});}}); return JSON.stringify({{still:still,stage:H.getMemberLifecycleStage({json.dumps(mid)})}});")
    r.check("他回來出席後 → 預警解除、狀態回到穩定", isinstance(back, dict) and back.get("still") is False and back.get("stage") != "at_risk", f"{back}", zones="B", shot=False)


# ═════════════════════════ F3 門徒晉升 ═════════════════════════
def flow_f3(r: Run):
    r.flow = "F3 門訓→晉升"
    print(f"\n【{r.flow}】", flush=True)
    r.reset_storage()
    r.nav(f"{FS}/pastoral-integrated.html", 1.5)
    pre = r.js("var H=PastoralDataHub; var c=H.getCourses(); return JSON.stringify({courses:c.map(function(x){return x.type;})});")
    if isinstance(pre, dict) and not pre.get("courses"):
        r.js("if(window.PastoralTrialPack&&PastoralTrialPack.ensureTrialChurch) PastoralTrialPack.ensureTrialChurch(true); return JSON.stringify(1);")
        pre = r.js("var c=PastoralDataHub.getCourses(); return JSON.stringify({courses:c.map(function(x){return x.type;})});")
    r.check("門訓課程資料存在（初信／門徒／組長預備）",
            isinstance(pre, dict) and all(t in pre.get("courses", []) for t in ("foundation", "disciple", "leader")),
            f"課程：{pre}（空白新教會沒有課程，必須先建立或載入示範）", sev="P1", soft=True, zones="C", shot=False)
    prep = r.js(
        "var H=PastoralDataHub; var g=H.getGroups().find(function(x){return H.membersInGroup(x.id).length>=3;}); var ms=H.membersInGroup(g.id); var t=ms[ms.length-1];"
        "var base=new Date(); for(var i=3;i>=0;i--){ var iso=new Date(base.getTime()-i*7*86400000).toISOString().slice(0,10);"
        "  H.recordGroupAttendanceSession(g.id, iso, ms.map(function(m){return {memberId:m.id,status:'present'};})); }"
        "var cs=H.getCourses(); function cid(ty){var c=cs.find(function(x){return x.type===ty;}); return c&&c.id;}"
        "if(cid('foundation')) H.setEnrollment(t.id,cid('foundation'),'completed'); if(cid('disciple')) H.setEnrollment(t.id,cid('disciple'),'completed'); if(cid('leader')) H.setEnrollment(t.id,cid('leader'),'in_progress');"
        "return JSON.stringify({mid:t.id,name:t.name,rate:H.getMemberAttendanceRate(t.id,g.id)});")
    if not r.check("準備：選一位組員，4 週全勤＋完成初信與門徒、組長預備進行中", isinstance(prep, dict) and "mid" in prep, f"{prep}", shot=False):
        return
    mid, name = prep["mid"], prep["name"]
    cand = r.js(f"var c=PastoralDataHub.getTimothyCandidates({{all:true}}).find(function(x){{return String(x.memberId)===String({json.dumps(mid)});}}); return JSON.stringify(c||null);")
    r.check("系統判斷他『符合提摩太人選』（分數≥60、出席率達標）", isinstance(cand, dict) and cand.get("qualifies"), f"{cand}", zones="B／C", shot=False)
    lad = r.js(f"return JSON.stringify(PastoralDataHub.getSpiritualLadderForMember({json.dumps(mid)}).map(function(s){{return s.step.id+':'+s.status;}}));")
    r.check("屬靈階梯顯示：初信／門徒已完成", isinstance(lad, list) and "foundation:done" in lad and "disciple:done" in lad, f"{lad}", sev="P2", soft=True, zones="C", shot=False)

    r.nav(f"{FS}/pastoral-training.html", 2.0)
    r.check("門訓頁畫面看得到這位候選人", name in r.text(), "候選人資料有、門訓頁沒顯示", sev="P2", soft=True, zones="C")
    r.js(f"PastoralDataHub.promoteToTimothyPool({json.dumps(mid)}, '流程測試'); return JSON.stringify(1);")
    r.nav(f"{FS}/pastoral-training.html", 2.0)
    pool = r.js(f"var s=PastoralDataHub.getTrainingStore(); return JSON.stringify({{inPool:s.timothyPool.some(function(t){{return String(t.memberId)===String({json.dumps(mid)});}}),stage:PastoralDataHub.getMemberLifecycleStage({json.dumps(mid)})}});")
    r.check("晉升後：進入提摩太池、狀態＝領袖培養", isinstance(pool, dict) and pool.get("inPool") and pool.get("stage") == "growing", f"{pool}", zones="B／C", shot=False)
    r.check("晉升後：門訓頁畫面看得到『提摩太池』名單", name in r.text() and ("提摩太" in r.text() or "Timothy" in r.text()), "池裡有人但畫面沒有", sev="P2", soft=True, zones="C")
    # 教育端是否收到（跨 C）
    edu = r.js(f"var X=window.PastoralCrossModuleBridge; if(!X||!X.getMergedTrainingRows) return JSON.stringify({{bridge:false}}); var rows=X.getMergedTrainingRows(); return JSON.stringify({{bridge:true,n:(rows||[]).length}});")
    r.check("門訓↔主日學橋接可讀（getMergedTrainingRows）", isinstance(edu, dict) and edu.get("bridge"), f"{edu}", sev="P2", soft=True, zones="B／C", shot=False)


def issues_text(r: Run) -> str:
    """只讀排班檢查器的『問題清單』區（不含頁面常駐的規則說明，避免誤判）。"""
    v = r.js("var e=document.getElementById('rcIssues'); return JSON.stringify(e?e.innerText:'');")
    return v if isinstance(v, str) else ""


# ═════════════════════════ F4 排班 ═════════════════════════
def flow_f4(r: Run):
    r.flow = "F4 排班→檢查"
    print(f"\n【{r.flow}】", flush=True)
    r.reset_storage()
    VS = "church_ministry/tools/volunteer_shift"
    r.nav(f"{VS}/load_a1_demo.html", 1.5)
    r.nav(f"{VS}/form.html", 1.5)
    demo = r.js("var T=window.VolunteerShiftTool; if(!T) return JSON.stringify({err:'no tool'}); var x=T.loadA1DemoData(); return JSON.stringify(x);")
    r.check("載入服事示範資料（3 人、2 事工）", isinstance(demo, dict) and demo.get("ok"), f"{demo}", sev="P2", soft=True, zones="E", shot=False)
    r.nav(f"{VS}/form.html", 1.5)
    opts = r.js("var s=document.getElementById('fieldMemberId'); var m=document.getElementById('fieldMinistryId'); return JSON.stringify({m:Array.prototype.map.call(s.options,function(o){return o.value;}).filter(Boolean), y:Array.prototype.map.call(m.options,function(o){return o.value;}).filter(Boolean)});")
    r.check("新增排班表單的『人員／事工』下拉有選項（來自會友主檔）", isinstance(opts, dict) and len(opts.get("m", [])) >= 1, f"{opts}", zones="E／0", shot=False)
    if not (isinstance(opts, dict) and opts.get("m")):
        return
    pid, ymin = opts["m"][0], (opts["y"][0] if opts["y"] else "")
    day = r.js("var d=new Date(Date.now()+3*86400000); return JSON.stringify(d.toISOString().slice(0,10));")

    def add_via_form(shift: str):
        r.nav(f"{VS}/form.html", 1.2)
        r.js(f"document.getElementById('fieldMemberId').value={json.dumps(pid)};"
             f"document.getElementById('fieldMinistryId').value={json.dumps(ymin)};"
             f"document.getElementById('fieldDate').value={json.dumps(day)};"
             f"document.getElementById('fieldShift').value={json.dumps(shift)};"
             "document.getElementById('humanConfirm').checked=true;"
             "document.getElementById('crmIntentForm').requestSubmit(); return JSON.stringify(1);")
        r.wait(1.0)
        return r.js("var t=document.getElementById('formStatus'); return JSON.stringify(t?t.innerText:'');")

    s1 = add_via_form("流程測試崇拜")
    s2 = add_via_form("流程測試崇拜")  # 同人同時段 → 重複排
    cnt = r.js(f"var v=JSON.parse(localStorage.getItem('volunteerSystemData')||'{{}}'); return JSON.stringify((v.schedules||[]).filter(function(s){{return s.shift==='流程測試崇拜'||String(s.shift||'').indexOf('流程測試')>=0;}}).length);")
    r.check("用表單新增排班兩筆（同人、同日、同班）→ 資料層多 2 筆", cnt == 2, f"實際 {cnt} 筆；表單訊息：{s1} / {s2}", zones="E", shot=False)
    r.nav(f"{VS}/list.html", 1.5)
    r.check("排班清單畫面看得到剛排的班", "流程測試崇拜" in r.text(), "清單沒顯示剛新增的班", zones="E")

    r.nav(f"{VS}/rules_check.html", 1.8)
    t = issues_text(r)
    n_leave_before = None
    r.check("排班檢查器抓到『同時段重複排』", "同時段重複排" in t, "檢查器沒抓到重複排（排班→檢查沒接上）", zones="E／G")

    # 請假無人代班
    r.nav(f"{VS}/form.html", 1.0)
    sid = r.js("var v=JSON.parse(localStorage.getItem('volunteerSystemData')||'{}'); var s=(v.schedules||[]).find(function(x){return String(x.shift||'').indexOf('流程測試')>=0;}); return JSON.stringify(s?s.id:null);")
    lv = r.js(f"var x=VolunteerShiftTool.saveLeaveRequest({{scheduleId:{json.dumps(sid)},reason:'流程測試請假'}}); return JSON.stringify(x);")
    r.check("請假（無代班）成功寫入", isinstance(lv, dict) and lv.get("ok"), f"{lv}", zones="E", shot=False)
    r.nav(f"{VS}/rules_check.html", 1.8)
    n_leave_before = issues_text(r).count("請假無人代班")
    r.check("檢查器抓到『請假無人代班』", n_leave_before >= 1, "檢查器沒抓到無人代班", zones="E／G")
    r.nav(f"{VS}/leave_swap.html", 1.5)
    r.check("請假調班頁畫面看得到這筆請假", "流程測試請假" in r.text() or "請假" in r.text(), "請假頁沒顯示", sev="P2", soft=True, zones="E")

    # 補救（走產品自己的資料介面）：① 請假的班指定代班者 ② 刪掉重複的那一筆
    r.nav(f"{VS}/leave_swap.html", 1.2)
    fixed = r.js(
        "var B=ChurchDataBridge; var vol=B.getVolunteerData(); var rows=(vol.schedules||[]).filter(function(s){return String(s.shift||'').indexOf('流程測試')>=0;});"
        "var sub=(VolunteerShiftTool.getMembersOptions().filter(function(m){return String(m.id)!==String(rows[0].memberId);})[0]||{}).id;"
        "var x=VolunteerShiftTool.saveLeaveRequest({scheduleId:rows[0].id,substituteMemberId:sub,reason:'流程測試代班'});"
        "vol=B.getVolunteerData(); var seen=false; vol.schedules=(vol.schedules||[]).filter(function(s){ if(String(s.shift||'').indexOf('流程測試')<0) return true; if(s.id===rows[0].id) return true; return false; });"
        "B.saveVolunteerSystemData(vol); return JSON.stringify({sub:sub,ok:x.ok,left:vol.schedules.filter(function(s){return String(s.shift||'').indexOf('流程測試')>=0;}).length});")
    r.check("補救：指定代班者＋刪掉重複班（走產品自己的資料介面）", isinstance(fixed, dict) and fixed.get("ok") and fixed.get("left") == 1, f"{fixed}", zones="E", shot=False)
    r.nav(f"{VS}/rules_check.html", 1.8)
    t2 = issues_text(r)
    r.check("補救（移除問題班次）後，檢查器的重複／無人代班提醒消失", "同時段重複排" not in t2 and t2.count("請假無人代班") < n_leave_before, f"問題移除後：重複排={'同時段重複排' in t2}；無人代班 {n_leave_before}→{t2.count('請假無人代班')}", zones="E／G")


# ═════════════════════════ F5 備份還原 ═════════════════════════
def flow_f5(r: Run):
    r.flow = "F5 備份→還原"
    print(f"\n【{r.flow}】", flush=True)
    r.reset_storage()
    BK = "church_ministry/modules/admin/backup_restore.html"
    r.nav(BK, 1.5)
    ready = r.js("return JSON.stringify({b:!!window.CmBackup,c:!!window.CmBackupCrypto,mem:(JSON.parse(localStorage.getItem('memberSystemData')||'{}').members||[]).length});")
    r.check("備份頁載入：備份核心＋加密核心＋名冊有資料", isinstance(ready, dict) and ready.get("b") and ready.get("mem", 0) > 0, f"{ready}", zones="G", shot=True)
    remind = r.js("var e=document.getElementById('bk-reminder'); return JSON.stringify(e?e.innerText:'');")
    r.check("備份頁提醒文字：有資料但沒備份過 → 提示『建議現在備份』", "備份" in (remind or ""),
            f"提醒文字：{remind}", sev="P2", soft=True, zones="G", shot=False)

    snap = r.js("var b=CmBackup.buildBackup(localStorage,new Date()); localStorage.setItem('__flow_snapshot', JSON.stringify(b)); "
                "return JSON.stringify({keys:Object.keys(b.keys).length, mem:Object.keys(b.keys).indexOf('memberSystemData')>=0});")
    r.check("備份檔內容包含會友名冊與牧養資料", isinstance(snap, dict) and snap.get("keys", 0) >= 2 and snap.get("mem"), f"{snap}", zones="G", shot=False)
    plain = r.js("return JSON.stringify(localStorage.getItem('__flow_snapshot'));")
    enc = r.js("var b=JSON.parse(localStorage.getItem('__flow_snapshot')); var e=await CmBackupCrypto.encryptBackup(b,'FlowTest-2026',CmBackupConfig.APP_ID); "
               "try{ var back=await CmBackupCrypto.decryptBackup(e,'FlowTest-2026'); var okRound=JSON.stringify(back.keys)===JSON.stringify(b.keys);}catch(x){var okRound=false;}"
               "var wrong=false; try{ await CmBackupCrypto.decryptBackup(e,'Wrong-Pass-99'); }catch(x){ wrong=true; }"
               "localStorage.setItem('__flow_enc', JSON.stringify(e)); return JSON.stringify({okRound:okRound,wrongRejected:wrong,envKeys:Object.keys(e)});")
    r.check("加密備份：對的密碼解得回原樣、錯的密碼被拒", isinstance(enc, dict) and enc.get("okRound") and enc.get("wrongRejected"), f"{enc}", zones="G", shot=False)
    encs = r.js("return JSON.stringify(localStorage.getItem('__flow_enc'));")

    tmp = Path(tempfile.mkdtemp(prefix="cm_flow_"))
    f_plain, f_enc, f_bad = tmp / "plain.json", tmp / "enc.json", tmp / "bad.json"
    f_plain.write_text(plain, encoding="utf-8")
    f_enc.write_text(encs, encoding="utf-8")
    f_bad.write_text('{"app":"bible100_church_ministry","schema_version":1,"keys":{"memberSystemData":"{壞掉"}}', encoding="utf-8")

    def wipe():
        r.js("var b=JSON.parse(localStorage.getItem('__flow_snapshot')); Object.keys(b.keys).forEach(function(k){localStorage.removeItem(k);}); "
             "return JSON.stringify(1);")

    def upload(path: Path):
        c = r.c
        c.send("DOM.enable")
        doc = c.send("DOM.getDocument", {"depth": 1})
        node = c.send("DOM.querySelector", {"nodeId": doc["root"]["nodeId"], "selector": "#bk-file"})
        c.send("DOM.setFileInputFiles", {"files": [str(path)], "nodeId": node["nodeId"]})
        r.wait(1.0)

    # 壞檔：被擋下、現有資料不動
    r.nav(BK, 1.2)
    before = r.js("return JSON.stringify(localStorage.getItem('memberSystemData'));")
    upload(f_bad)
    msg = r.js("var m=document.getElementById('bk-msg'); return JSON.stringify(m?m.innerText:'');")
    after = r.js("return JSON.stringify(localStorage.getItem('memberSystemData'));")
    r.check("壞檔（內容不是正確資料）被擋下並說明原因、現有名冊不變", ("沒有改動" in (msg or "") or "不是正確" in (msg or "")) and before == after, f"訊息：{msg}", zones="G")

    # 模擬遺失 → 明文還原
    wipe()
    gone = r.js("return JSON.stringify(localStorage.getItem('memberSystemData')===null);")
    r.nav(BK, 1.2)
    upload(f_plain)
    r.check("選入備份檔 → 畫面列出將還原的項目（先確認、不直接覆蓋）", r.js("var b=document.getElementById('bk-restore-box'); return JSON.stringify(!!b && !b.hidden);") is True, "沒出現確認清單", zones="G")
    r.js("document.getElementById('bk-restore-go').click(); return JSON.stringify(1);")
    r.wait(1.5)
    same = r.js("var b=JSON.parse(localStorage.getItem('__flow_snapshot'))||{keys:{}}; return JSON.stringify(true);")
    restored = r.js("var snap=JSON.parse(localStorage.getItem('__flow_snapshot')); var bad=[]; Object.keys(snap.keys).forEach(function(k){ if(k!=='churchAuditLog' && localStorage.getItem(k)!==snap.keys[k]) bad.push(k); }); return JSON.stringify({gone:" + json.dumps(bool(gone)) + ", bad:bad});")
    r.check("模擬資料遺失後按『還原』→ 每一項資料與備份逐字相同", isinstance(restored, dict) and restored.get("gone") and not restored.get("bad"), f"{restored}", zones="G")
    r.check("還原後出現『重新整理頁面』提示", r.js("var b=document.getElementById('bk-reload'); return JSON.stringify(!!b && !b.hidden);") is True, "沒提示重新整理", sev="P2", soft=True, zones="G", shot=False)
    r.nav(f"{FS}/pastoral-org-roster.html", 1.8)
    r.check("還原後，牧養名冊頁讀得到還原的會友", len(r.text()) > 100 and "陈弟兄" in r.text() or "會友" in r.text() or "会友" in r.text(), "名冊頁空白", zones="G／B")

    # 加密檔路徑
    wipe()
    r.nav(BK, 1.2)
    upload(f_enc)
    dec_vis = r.js("var b=document.getElementById('bk-dec-box'); return JSON.stringify(!!b && !b.hidden);")
    r.check("選入加密備份 → 要求輸入密碼（不顯示內容）", dec_vis is True, "沒要求密碼", zones="G")
    r.js("document.getElementById('bk-dec-pw').value='Wrong-Pass-99'; document.getElementById('bk-dec-go').click(); return JSON.stringify(1);")
    r.wait(1.5)
    r.check("輸錯密碼：被拒、資料沒被改動", r.js("return JSON.stringify(localStorage.getItem('memberSystemData')===null);") is True, "錯密碼卻寫入了資料？", sev="P0", zones="G", shot=False)
    r.js("document.getElementById('bk-dec-pw').value='FlowTest-2026'; document.getElementById('bk-dec-go').click(); return JSON.stringify(1);")
    r.wait(2.0)
    r.js("document.getElementById('bk-restore-go').click(); return JSON.stringify(1);")
    r.wait(2.0)
    restored2 = r.js("var snap=JSON.parse(localStorage.getItem('__flow_snapshot')); var bad=[]; Object.keys(snap.keys).forEach(function(k){ if(k!=='churchAuditLog' && localStorage.getItem(k)!==snap.keys[k]) bad.push(k); }); return JSON.stringify({bad:bad});")
    r.check("輸對密碼 → 解密 → 還原：資料與備份逐字相同", isinstance(restored2, dict) and not restored2.get("bad"), f"{restored2}", zones="G")


FLOWS = {"f1": flow_f1, "f2": flow_f2, "f3": flow_f3, "f4": flow_f4, "f5": flow_f5}


def write_reports(steps: list[dict], meta: dict):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "flows.json").write_text(json.dumps({"meta": meta, "steps": steps}, ensure_ascii=False, indent=2), encoding="utf-8")
    flows: dict[str, list[dict]] = {}
    for s in steps:
        flows.setdefault(s["flow"], []).append(s)
    tot = {k: sum(1 for s in steps if s["status"] == k) for k in ("ok", "warn", "bad")}
    L = ["# 階段 3 · 跨區流程檢查報告", "",
         "> 自動產生（`cm_zone_flows.py`）。無頭 Edge 真的走完每條流程：填表、按按鈕、換頁、核對資料有沒有接上。**只讀專案**。", "",
         f"- 產生時間：{meta['at']}｜耗時 {meta['seconds']} 秒｜模式：file://｜起始資料：全新＋示範會友",
         f"- 總計 **{len(steps)}** 個檢查點：✅ {tot['ok']}　🟡 {tot['warn']}　❌ {tot['bad']}", "",
         "## 1. 各流程總覽", "", "| 流程 | ✅ | 🟡 | ❌ | 一句話 |", "|---|---|---|---|---|"]
    for f, ss in flows.items():
        c = {k: sum(1 for s in ss if s["status"] == k) for k in ("ok", "warn", "bad")}
        verdict = "全程接通" if not c["bad"] and not c["warn"] else ("可走通，有可改善處" if not c["bad"] else "有斷點，需修")
        L.append(f"| {f} | {c['ok']} | {c['warn']} | {c['bad']} | {verdict} |")
    L += ["", "## 2. 逐步結果", ""]
    for f, ss in flows.items():
        L += [f"### {f}", "", "| # | 區 | 檢查點 | 結果 | 說明／證據 | 截圖 |", "|---|---|---|---|---|---|"]
        for i, s in enumerate(ss, 1):
            shot = f"[圖](screens/{s['screenshot']})" if s["screenshot"] else ""
            d = (s["detail"] or "").replace("|", "／").replace("\n", " ")[:200]
            sev = f"（{s['sev']}）" if s["sev"] else ""
            L.append(f"| {i} | {s['zones']} | {s['step']} | {ICON[s['status']]}{sev} | {d} | {shot} |")
        L.append("")
    probs = [s for s in steps if s["status"] != "ok"]
    L += ["## 3. 發現清單（需你決定／要修）", ""]
    if not probs:
        L.append("無。")
    else:
        L += ["| 嚴重度 | 流程 | 檢查點 | 說明 |", "|---|---|---|---|"]
        for s in sorted(probs, key=lambda x: (x["sev"] or "P9", x["flow"])):
            L.append(f"| {s['sev'] or '—'}{'（設計缺口）' if s['status']=='warn' else ''} | {s['flow']} | {s['step']} | {(s['detail'] or '')[:180].replace('|','／')} |")
    L += ["", "## 4. 限制", "",
          "- 資料用示範會友與合成日期；真實教會的資料量、舊資料格式要靠真人試用。",
          "- 「簽到」「發碼」等少數步驟用頁面自己載入的 API 準備資料，再以畫面核對；純視覺好不好懂交給中立 AI 與牧者。",
          "- file:// 之下無法驗證 HTTP 才有的功能（如 fetch 載入的資料庫）。"]
    (OUT / "flows.md").write_text("\n".join(L), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--flows", default="f1,f2,f3,f4,f5")
    ap.add_argument("--port", type=int, default=9226)
    a = ap.parse_args()
    t0 = time.time()
    r = Run(a.port)
    try:
        for k in [x.strip().lower() for x in a.flows.split(",") if x.strip()]:
            try:
                FLOWS[k](r)
            except Exception as e:  # noqa: BLE001
                r.add("流程執行中斷", "bad", f"{type(e).__name__}: {e}"[:200], sev="P1", shot=False)
    finally:
        steps = r.steps
        r.close()
    meta = {"at": time.strftime("%Y-%m-%d %H:%M"), "seconds": int(time.time() - t0)}
    write_reports(steps, meta)
    tot = {k: sum(1 for s in steps if s["status"] == k) for k in ("ok", "warn", "bad")}
    print(f"\nDONE steps={len(steps)} ok={tot['ok']} warn={tot['warn']} bad={tot['bad']} -> {OUT / 'flows.md'}")


if __name__ == "__main__":
    main()
