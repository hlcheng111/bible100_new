/**
 * CM · 紅旗面板（B 牧養 · 預警頁）
 *
 * 硬規則：
 *  - 人工勾選標記；不呼叫 AI、不自動派工、不自動發送。
 *  - 通知稿一定產生；寫入事件流失敗不影響通知稿。
 *  - 不收自由文字備註（避免把隱私細節留在系統）。
 *  - 可獨立運作：缺 ChurchDataBridge／CmMemberPicker 時降級為「只產生通知稿」。
 *
 * 依賴（皆可缺）：CmRedFlagConfig（必要）、ChurchDataBridge、CmMemberPicker
 */
(function (global, doc) {
  "use strict";

  function $(id) {
    return doc.getElementById(id);
  }

  function cfg() {
    return global.CmRedFlagConfig || null;
  }

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function memberName(id) {
    if (!id) return "";
    var P = global.CmMemberPicker;
    return P && P.memberNameById ? P.memberNameById(id) : "";
  }

  function setStatus(msg, kind) {
    var el = $("rf-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "rf-status" + (kind ? " rf-status--" + kind : "");
    el.hidden = !msg;
  }

  function renderFlagChecks() {
    var host = $("rf-flags");
    var C = cfg();
    if (!host || !C) return;
    host.innerHTML = "";
    C.getFlags().forEach(function (f) {
      var label = doc.createElement("label");
      label.className = "rf-flag" + (f.crisis ? " rf-flag--crisis" : "");
      var cb = doc.createElement("input");
      cb.type = "checkbox";
      cb.value = f.id;
      cb.setAttribute("data-rf-flag", f.id);
      var span = doc.createElement("span");
      span.textContent = f.label_zh + (f.crisis ? "（危機）" : "");
      label.appendChild(cb);
      label.appendChild(span);
      host.appendChild(label);
    });
  }

  function selectedFlagIds() {
    var host = $("rf-flags");
    if (!host) return [];
    var ids = [];
    host.querySelectorAll("input[data-rf-flag]").forEach(function (cb) {
      if (cb.checked) ids.push(cb.value);
    });
    return ids;
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

  function currentMember() {
    var sel = $("rf-member");
    var id = sel ? sel.value : "";
    return { id: id, name: id ? memberName(id) : "" };
  }

  function recordEvent(member, ids) {
    var B = bridge();
    var C = cfg();
    if (!B || !B.appendPastoralEvent) {
      return { ok: false, reason: "找不到會友資料底座（ChurchDataBridge）" };
    }
    try {
      B.appendPastoralEvent({
        member_id: member.id,
        event_type: C.EVENT_TYPE,
        summary: ids.map(C.labelFor).join("、"),
        source_module: "pastoral_alerts_panel",
        metadata: {
          flags: ids,
          crisis: C.hasCrisis(ids),
          human_marked: true,
          notify_min: C.NOTIFY_MIN
        }
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: String((e && e.message) || e) };
    }
  }

  function onMark() {
    var C = cfg();
    if (!C) return;
    var ids = selectedFlagIds();
    if (!ids.length) {
      setStatus("請先勾選至少一項，再按「標記」。", "warn");
      return;
    }
    var member = currentMember();
    var text = C.buildNoticeText({ name: member.name, memberId: member.id, flagIds: ids });

    var out = $("rf-notice");
    var copyBtn = $("rf-copy");
    if (out) {
      out.textContent = text;
      out.hidden = false;
    }
    if (copyBtn) copyBtn.hidden = false;

    if (!member.id) {
      setStatus("已產生通知稿，但沒有選會友，所以沒有寫入紀錄。請先把通知稿交給牧者。", "warn");
    } else {
      var res = recordEvent(member, ids);
      if (res.ok) {
        setStatus("已由人工標記並記錄。請現在把通知稿交給至少 " + C.NOTIFY_MIN + " 位牧者／負責同工。", "ok");
      } else {
        setStatus("通知稿已產生，但寫入紀錄失敗（" + res.reason + "）。請先通知牧者，再回報維護同工。", "warn");
      }
    }
    renderRecent();
  }

  function onCopy() {
    var out = $("rf-notice");
    if (!out) return;
    copyText(out.textContent || "")
      .then(function () {
        setStatus("已複製通知稿，請貼給牧者（電話或訊息由人發送）。", "ok");
      })
      .catch(function () {
        setStatus("無法自動複製，請手動選取上方通知稿複製。", "warn");
      });
  }

  /* 與通知稿一致：一律顯示本地時間（事件以 UTC ISO 儲存） */
  function fmtDate(iso) {
    var C = cfg();
    var d = new Date(iso);
    if (C && C.formatTime && !isNaN(d.getTime())) return C.formatTime(d);
    var s = String(iso || "");
    return s.slice(0, 10);
  }

  function allEvents() {
    var B = bridge();
    try {
      return (B && B.listPastoralEvents ? B.listPastoralEvents(null, 500) : []) || [];
    } catch (e) {
      return [];
    }
  }

  /* P2：狀態變更寫回事件流（追加一筆 red_flag_status，不改原紀錄） */
  function setFlagStatus(flagEvent, status) {
    var B = bridge();
    var C = cfg();
    if (!B || !B.appendPastoralEvent || !C) {
      setStatus("找不到會友資料底座，無法更新狀態；請先通知牧者。", "warn");
      return;
    }
    try {
      B.appendPastoralEvent({
        member_id: flagEvent.member_id,
        event_type: C.STATUS_EVENT_TYPE,
        summary: C.statusLabel(status),
        source_module: "pastoral_alerts_panel",
        metadata: { alert_id: flagEvent.event_id, status: status, human_marked: true }
      });
      setStatus("已更新為「" + C.statusLabel(status) + "」。", "ok");
    } catch (e) {
      setStatus("狀態未寫入（" + String((e && e.message) || e) + "）。請先通知牧者。", "warn");
    }
    renderRecent();
  }

  var ACTIONS = {
    open: [{ to: "ack", label: "我來跟進" }, { to: "snoozed", label: "先擱置" }],
    ack: [{ to: "done", label: "已處理完" }, { to: "snoozed", label: "先擱置" }],
    snoozed: [{ to: "ack", label: "我來跟進" }],
    done: [{ to: "open", label: "重新打開" }]
  };

  function renderRecent() {
    var host = $("rf-recent");
    var C = cfg();
    if (!host || !C) return;
    host.innerHTML = "";
    var all = allEvents();
    var statuses = C.deriveFlagStatuses(all);
    var rows = all
      .filter(function (r) {
        return r && r.event_type === C.EVENT_TYPE;
      })
      .slice(0, 8);
    if (!rows.length) {
      var li0 = doc.createElement("li");
      li0.className = "muted";
      li0.textContent = "目前沒有紅旗紀錄。有人遇到急事時，在上方勾選並按「標記」，就會出現在這裡。";
      host.appendChild(li0);
      renderWeekly();
      return;
    }
    rows.forEach(function (r) {
      var st = statuses[r.event_id] ? statuses[r.event_id].status : "open";
      var li = doc.createElement("li");
      var name = memberName(r.member_id) || r.member_id || "—";
      var ids = (r.metadata && r.metadata.flags) || [];
      var label = ids.length ? ids.map(C.labelFor).join("、") : r.summary || "";
      var txt = doc.createElement("span");
      txt.textContent = fmtDate(r.ts || r.created_at) + " · " + name + " · " + label + " · 【" + C.statusLabel(st) + "】";
      li.appendChild(txt);
      (ACTIONS[st] || []).forEach(function (a) {
        var b = doc.createElement("button");
        b.type = "button";
        b.className = "pa-btn sm outline cm-touch-target";
        b.textContent = a.label;
        b.onclick = function () {
          setFlagStatus(r, a.to);
        };
        li.appendChild(b);
      });
      host.appendChild(li);
    });
    renderWeekly();
  }

  /* P2：每週 Check 摘要（只整理，不替人寫行動） */
  function startOfWeekMs() {
    var d = new Date();
    var day = (d.getDay() + 6) % 7; // 週一為 0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.getTime();
  }

  function renderWeekly() {
    var C = cfg();
    var out = $("rf-week-text");
    if (!C || !out) return;
    var all = allEvents();
    var H = global.PastoralDataHub;
    var absenceCount = 0;
    try {
      absenceCount = H && H.listAbsenceAlerts ? (H.listAbsenceAlerts() || []).length : 0;
    } catch (e) {
      absenceCount = 0;
    }
    out.textContent = C.buildWeeklySummaryText({
      flagEvents: all.filter(function (r) {
        return r && r.event_type === C.EVENT_TYPE;
      }),
      statuses: C.deriveFlagStatuses(all),
      absenceCount: absenceCount,
      weekStartMs: startOfWeekMs()
    });
  }

  function onCopyWeekly() {
    var out = $("rf-week-text");
    if (!out) return;
    copyText(out.textContent || "")
      .then(function () {
        setStatus("已複製本週 Check 摘要，可貼到 PDCA 的 Check 欄。", "ok");
      })
      .catch(function () {
        setStatus("無法自動複製，請手動選取摘要文字。", "warn");
      });
  }

  function init() {
    if (!$("rf-card")) return;
    var P = global.CmMemberPicker;
    var sel = $("rf-member");
    if (sel && P && P.fillMemberSelect) {
      P.fillMemberSelect(sel, null, { placeholder: "— 選擇會友（名單空也可先產生通知稿）—" });
      if (P.preselectFromQuery) P.preselectFromQuery(sel, "memberId");
    } else if (sel) {
      sel.innerHTML = '<option value="">（無會友名單 · 只產生通知稿）</option>';
    }
    renderFlagChecks();
    renderRecent();
    var mark = $("rf-mark");
    var copyBtn = $("rf-copy");
    if (mark) mark.onclick = onMark;
    if (copyBtn) copyBtn.onclick = onCopy;
    var wkCopy = $("rf-week-copy");
    if (wkCopy) wkCopy.onclick = onCopyWeekly;
    renderWeekly();
  }

  global.CmRedFlagPanel = { init: init, renderRecent: renderRecent, renderWeekly: renderWeekly };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : this, document);
