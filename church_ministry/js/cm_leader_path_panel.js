/**
 * CM · 領袖培育路徑面板（C 區 · P3）
 * 依賴：CmLeaderPathConfig、ChurchDataBridge（讀寫 pastoral 事件）、CmMemberPicker（選人，可缺）
 * 只記人做的每一步；不自動晉升、不改會友資料、不連網、不呼叫 AI。缺底座時降級並提示。
 */
(function (global) {
  "use strict";

  var doc = global.document;

  function $(id) {
    return doc.getElementById(id);
  }

  function cfg() {
    return global.CmLeaderPathConfig || null;
  }

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function memberName(id) {
    if (!id) return "";
    var P = global.CmMemberPicker;
    return P && P.memberNameById ? P.memberNameById(id) || "" : "";
  }

  function findMember(id) {
    var B = bridge();
    if (!B || !B.getMembers || !id) return null;
    try {
      var list = B.getMembers() || [];
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (String(m.id != null ? m.id : m.memberId) === String(id)) return m;
      }
    } catch (e) {}
    return null;
  }

  function allEvents() {
    var B = bridge();
    try {
      return (B && B.listPastoralEvents ? B.listPastoralEvents(null, 5000) : []) || [];
    } catch (e) {
      return [];
    }
  }

  function setStatus(msg, kind) {
    var el = $("lp-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "lp-status" + (kind ? " lp-status--" + kind : "");
    el.hidden = !msg;
  }

  function selectedId() {
    var sel = $("lp-member");
    return sel ? sel.value : "";
  }

  function copyText(text) {
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = doc.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        doc.body.appendChild(ta);
        ta.select();
        var ok = doc.execCommand("copy");
        doc.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + "-" + (m.length < 2 ? "0" + m : m) + "-" + (day.length < 2 ? "0" + day : day);
  }

  function recordStep(step) {
    var C = cfg();
    var B = bridge();
    var id = selectedId();
    if (!C) return;
    if (!id) {
      setStatus("請先選一位會友。", "warn");
      return;
    }
    var name = memberName(id) || id;
    var ev = C.evaluatePromotion(C.deriveLeaderPath(eventsOf(id)), findMember(id));

    if (step === "promoted") {
      var msg = ev.ready
        ? "確定記錄「牧者同意 " + name + " 晉升為小組長」？\n\n這只會留下一筆紀錄；系統不會自動改會友的屬靈階段或職稱。"
        : "「" + name + "」的晉升條件還沒有全部達成（" +
          ev.unmet.map(function (u) { return u.label; }).join("、") +
          "）。\n\n若牧者仍決定晉升，可繼續記錄。確定要記錄嗎？";
      if (!global.confirm(msg)) return;
    }

    var dateInput = $("lp-date");
    var built = C.buildStepPayload(step, dateInput ? dateInput.value : "");
    if (!built.ok) {
      setStatus(built.reason, "warn");
      return;
    }
    if (!B || !B.appendPastoralEvent) {
      setStatus("找不到會友資料底座，無法記錄；請先用文字記在別處，並通知維護同工。", "warn");
      return;
    }
    try {
      var payload = built.payload;
      payload.member_id = id;
      B.appendPastoralEvent(payload);
      setStatus("已記錄：" + name + " · " + C.stepLabel(step) + "。", "ok");
    } catch (e) {
      setStatus("沒有記錄成功（" + String((e && e.message) || e) + "）。可能沒有寫入權限。", "warn");
    }
    render();
  }

  function eventsOf(id) {
    var C = cfg();
    return allEvents().filter(function (e) {
      return e && e.event_type === C.EVENT_TYPE && String(e.member_id) === String(id);
    });
  }

  function renderChecklist(ev) {
    var host = $("lp-checklist");
    if (!host) return;
    host.innerHTML = "";
    ev.items.forEach(function (it) {
      var li = doc.createElement("li");
      li.className = it.met ? "lp-ok" : "lp-todo";
      li.textContent = (it.met ? "✔ " : "○ ") + it.label + " — " + it.detail;
      host.appendChild(li);
    });
    var banner = $("lp-ready");
    if (banner) {
      banner.hidden = !ev.ready;
    }
  }

  function renderActions(path) {
    var C = cfg();
    var host = $("lp-actions");
    if (!host) return;
    host.innerHTML = "";
    var steps = C.nextSteps(path.stage);
    if (!steps.length) {
      var p = doc.createElement("p");
      p.className = "muted";
      p.textContent = "這位已晉升小組長，不需要再記培育步驟。";
      host.appendChild(p);
      return;
    }
    steps.forEach(function (step) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "edu-btn lp-btn" + (step === "promoted" ? " lp-btn--final" : "");
      b.setAttribute("data-lp-step", step);
      b.textContent = (step === "apprentice" && path.stage === "paused") ? "繼續見習" : C.stepLabel(step);
      b.onclick = function () {
        recordStep(step);
      };
      host.appendChild(b);
    });
  }

  function renderOverview() {
    var C = cfg();
    var host = $("lp-overview");
    if (!host || !C) return;
    host.innerHTML = "";
    var byMember = {};
    allEvents().forEach(function (e) {
      if (e && e.event_type === C.EVENT_TYPE) {
        (byMember[e.member_id] = byMember[e.member_id] || []).push(e);
      }
    });
    var ids = Object.keys(byMember);
    if (!ids.length) {
      var li0 = doc.createElement("li");
      li0.className = "muted";
      li0.textContent = "還沒有人開始。選一位會友，按「邀請見習」或「開始見習」就會出現在這裡。";
      host.appendChild(li0);
      return;
    }
    ids.forEach(function (id) {
      var p = C.deriveLeaderPath(byMember[id]);
      var li = doc.createElement("li");
      var a = doc.createElement("button");
      a.type = "button";
      a.className = "lp-link";
      a.textContent = (memberName(id) || id) + " · " + C.stageLabel(p.stage) +
        (p.stage === "apprentice" || p.stage === "paused" ? "（" + p.activeDays + " 天／影隨 " + p.shadowCount + " 次）" : "");
      a.onclick = function () {
        var sel = $("lp-member");
        if (sel) sel.value = id;
        render();
      };
      li.appendChild(a);
      host.appendChild(li);
    });
  }

  function render() {
    var C = cfg();
    if (!C) return;
    var id = selectedId();
    var box = $("lp-detail");
    renderOverview();
    if (!box) return;
    if (!id) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var path = C.deriveLeaderPath(eventsOf(id));
    var ev = C.evaluatePromotion(path, findMember(id));
    var stageEl = $("lp-stage");
    if (stageEl) stageEl.textContent = (memberName(id) || id) + " · " + C.stageLabel(path.stage);
    var checklistWrap = $("lp-checklist-wrap");
    if (checklistWrap) checklistWrap.hidden = path.stage === "leader";
    renderChecklist(ev);
    renderActions(path);
    var sum = $("lp-summary");
    if (sum) sum.textContent = C.buildSummaryText({ name: memberName(id) || id, path: path, evaluation: ev });
  }

  function onCopy() {
    var sum = $("lp-summary");
    if (!sum) return;
    copyText(sum.textContent || "")
      .then(function () {
        setStatus("已複製進度摘要，可貼到牧者會議紀錄。", "ok");
      })
      .catch(function () {
        setStatus("無法自動複製，請手動選取摘要文字。", "warn");
      });
  }

  function init() {
    if (!$("lp-card")) return;
    var P = global.CmMemberPicker;
    var sel = $("lp-member");
    if (sel && P && P.fillMemberSelect) {
      P.fillMemberSelect(sel, null, { placeholder: "— 選擇會友 —" });
      if (P.preselectFromQuery) P.preselectFromQuery(sel, "memberId");
    }
    if (sel) sel.onchange = render;
    var dateInput = $("lp-date");
    if (dateInput && !dateInput.value) dateInput.value = todayStr();
    var copy = $("lp-copy");
    if (copy) copy.onclick = onCopy;
    if (!bridge()) {
      setStatus("找不到會友資料底座，只能瀏覽說明；請從教會事工入口開啟本頁。", "warn");
    }
    render();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.CmLeaderPathPanel = { init: init, render: render, recordStep: recordStep };
})(typeof window !== "undefined" ? window : this);
