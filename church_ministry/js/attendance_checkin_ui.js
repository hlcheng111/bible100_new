/**
 * W1 現場點名 UI · 手動簽到 + 組長批量
 */
(function (win, doc) {
  "use strict";

  var S = win.AttendanceCheckinStore;
  var H = win.PastoralDataHub;
  if (!S) return;

  var state = {
    eventId: null,
    mode: "manual",
    lastMsg: ""
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function setMsg(text, kind) {
    state.lastMsg = text || "";
    var el = $("ac-msg");
    if (!el) return;
    el.textContent = state.lastMsg;
    el.className = "ac-msg" + (kind ? " ac-msg--" + kind : "");
  }

  function currentEvent() {
    return state.eventId ? S.getEvent(state.eventId) : null;
  }

  function fillEventSelect() {
    var sel = $("ac-event-select");
    if (!sel) return;
    var events = S.listEvents();
    if (!events.length) {
      sel.innerHTML = '<option value="">— 尚未有場次 —</option>';
      return;
    }
    sel.innerHTML = events
      .map(function (ev) {
        var mark = ev.status === "open" ? "🟢" : ev.status === "closed" ? "⚫" : "⚪";
        return (
          '<option value="' +
          esc(ev.id) +
          '">' +
          mark +
          " " +
          esc(ev.date) +
          " · " +
          esc(ev.title) +
          "（" +
          esc(S.typeLabel(ev.type)) +
          "）</option>"
        );
      })
      .join("");
    if (state.eventId) sel.value = state.eventId;
    else {
      state.eventId = events[0].id;
      sel.value = state.eventId;
    }
  }

  function fillGroupSelect() {
    var sel = $("ac-new-group");
    if (!sel) return;
    var groups = S.getGroups();
    sel.innerHTML =
      '<option value="">— 全體／無小組 —</option>' +
      groups
        .map(function (g) {
          return '<option value="' + esc(g.id) + '">' + esc(g.name || g.id) + "</option>";
        })
        .join("");
  }

  function renderStats() {
    var box = $("ac-stats");
    if (!box) return;
    var ev = currentEvent();
    if (!ev) {
      box.innerHTML = '<p class="muted">請先建立或選擇一場聚會。</p>';
      return;
    }
    var st = S.eventStats(ev.id);
    box.innerHTML =
      '<div class="ac-stat-grid">' +
      '<div class="ac-stat"><span class="n">' +
      st.present +
      '</span><span class="l">已到（含遲到）</span></div>' +
      '<div class="ac-stat"><span class="n">' +
      st.late +
      '</span><span class="l">遲到</span></div>' +
      '<div class="ac-stat"><span class="n">' +
      st.expected +
      '</span><span class="l">應出席</span></div>' +
      '<div class="ac-stat"><span class="n">' +
      st.rate +
      '%</span><span class="l">出席率</span></div></div>' +
      '<p class="muted">場次狀態：<strong>' +
      esc(ev.status) +
      "</strong> · 遲到截止：" +
      esc((ev.lateAfter || "").slice(11, 16) || "—") +
      " · 簽到窗至 " +
      esc((ev.checkinClosesAt || "").slice(11, 16) || "—") +
      "</p>";
  }

  function renderCheckedList() {
    var host = $("ac-checked-list");
    if (!host) return;
    var ev = currentEvent();
    if (!ev) {
      host.innerHTML = "";
      return;
    }
    var rows = S.listAttendance(ev.id)
      .filter(function (a) {
        return a.status === "present" || a.status === "late" || a.status === "leave";
      })
      .sort(function (a, b) {
        return String(b.checkedInAt || "").localeCompare(String(a.checkedInAt || ""));
      });
    if (!rows.length) {
      host.innerHTML = '<p class="muted">尚未有簽到紀錄。</p>';
      return;
    }
    host.innerHTML =
      '<table class="pa-table"><thead><tr><th>時間</th><th>會友</th><th>狀態</th><th>來源</th></tr></thead><tbody>' +
      rows
        .map(function (a) {
          var m = S.getMemberById(a.memberId);
          var name = m ? m.name || m.fullName || a.memberId : a.memberId;
          var link =
            H && H.memberLinkHtml
              ? H.memberLinkHtml(a.memberId, name)
              : esc(name);
          return (
            "<tr><td>" +
            esc(S.formatTime(a.checkedInAt)) +
            "</td><td>" +
            link +
            "</td><td>" +
            esc(a.status) +
            "</td><td>" +
            esc(a.checkinMethod) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderBatchRoster() {
    var host = $("ac-batch-roster");
    if (!host) return;
    var ev = currentEvent();
    if (!ev) {
      host.innerHTML = '<p class="muted">請先選擇場次。</p>';
      return;
    }
    var roster = S.expectedRoster(ev);
    if (!roster.length) {
      host.innerHTML =
        '<p class="muted">名單為空。請先載入示範會友，或為此場次指定小組。</p>';
      return;
    }
    host.innerHTML =
      '<p class="muted">勾選出席者，可改請假／缺席；儲存時一次寫入（小組場會同步週報出席以供缺席預警）。</p>' +
      '<table class="pa-table"><thead><tr><th>會友</th><th>出席</th><th>請假</th><th>缺席</th></tr></thead><tbody>' +
      roster
        .map(function (m) {
          var mid = S.memberIdOf(m);
          var existing = S.findAttendance(ev.id, mid);
          var st = existing ? existing.status : "absent";
          if (st === "late") st = "present";
          if (st !== "present" && st !== "leave") st = "absent";
          var name = m.name || m.fullName || mid;
          return (
            "<tr><td>" +
            esc(name) +
            " <small class=\"muted\">#" +
            esc(mid) +
            "</small></td>" +
            '<td><input type="radio" name="ac_b_' +
            esc(mid) +
            '" value="present"' +
            (st === "present" ? " checked" : "") +
            "></td>" +
            '<td><input type="radio" name="ac_b_' +
            esc(mid) +
            '" value="leave"' +
            (st === "leave" ? " checked" : "") +
            "></td>" +
            '<td><input type="radio" name="ac_b_' +
            esc(mid) +
            '" value="absent"' +
            (st === "absent" ? " checked" : "") +
            "></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>" +
      '<p><button type="button" class="pa-btn" id="ac-batch-save">儲存本場點名</button></p>';
    var btn = $("ac-batch-save");
    if (btn) {
      btn.onclick = function () {
        var rows = roster.map(function (m) {
          var mid = S.memberIdOf(m);
          var picked = doc.querySelector('input[name="ac_b_' + mid + '"]:checked');
          return { memberId: mid, status: picked ? picked.value : "absent" };
        });
        var res = S.saveLeaderBatch(ev.id, rows, { operator: "leader" });
        if (!res.ok) {
          setMsg("儲存失敗：" + (res.error || ""), "err");
          return;
        }
        var alertN =
          res.groupSync && res.groupSync.result && res.groupSync.result.alerts
            ? res.groupSync.result.alerts.length
            : 0;
        setMsg(
          "已儲存 " +
            res.count +
            " 筆" +
            (alertN ? "；缺席預警 " + alertN + " 人（請到預警 Tab 人工確認探訪）" : ""),
          "ok"
        );
        refreshAll();
      };
    }
  }

  function setMode(mode) {
    state.mode = mode;
    doc.querySelectorAll(".ac-mode-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
    });
    var man = $("ac-panel-manual");
    var bat = $("ac-panel-batch");
    if (man) man.classList.toggle("active", mode === "manual");
    if (bat) bat.classList.toggle("active", mode === "batch");
    if (mode === "batch") renderBatchRoster();
  }

  function doManualCheckIn(member, method) {
    var ev = currentEvent();
    if (!ev) {
      setMsg("請先選擇場次", "err");
      return;
    }
    if (ev.status === "draft") {
      S.startEvent(ev.id);
    }
    if (ev.status === "closed") {
      setMsg("場次已結束，無法簽到", "err");
      return;
    }
    var mid = S.memberIdOf(member);
    var res = S.checkIn({
      eventId: ev.id,
      memberId: mid,
      checkinMethod: method || "manual_code",
      operator: "usher"
    });
    if (!res.ok) {
      setMsg("失敗：" + (res.error || ""), "err");
      return;
    }
    setMsg(
      res.duplicate
        ? (member.name || mid) + " · 已經記低過喇（" + (res.message || "已打卡") + "）"
        : "多謝！" + (member.name || mid) + " · 已記低出席",
      res.duplicate ? "warn" : "ok"
    );
    $("ac-manual-q").value = "";
    $("ac-manual-hits").innerHTML = "";
    refreshAll();
  }

  function renderHits(list) {
    var host = $("ac-manual-hits");
    if (!host) return;
    if (!list.length) {
      host.innerHTML = '<p class="muted">找不到會友。可改用完整會員編號或電話。</p>';
      return;
    }
    host.innerHTML = list
      .map(function (m) {
        var mid = S.memberIdOf(m);
        var phone = m.phone ? " · " + m.phone : "";
        return (
          '<button type="button" class="ac-hit" data-mid="' +
          esc(mid) +
          '"><strong>' +
          esc(m.name || m.fullName || mid) +
          "</strong><span class=\"muted\"> #" +
          esc(mid) +
          esc(phone) +
          "</span></button>"
        );
      })
      .join("");
    host.querySelectorAll(".ac-hit").forEach(function (btn) {
      btn.onclick = function () {
        var m = S.getMemberById(btn.getAttribute("data-mid"));
        if (!m) return;
        var q = ($("ac-manual-q").value || "").trim();
        var method = /^\d+$/.test(q) && String(S.memberIdOf(m)) === q ? "manual_code" : digitsPhone(q) ? "manual_phone" : "manual_name";
        doManualCheckIn(m, method);
      };
    });
  }

  function digitsPhone(q) {
    return /\d{4,}/.test(String(q || "").replace(/\D/g, ""));
  }

  function refreshAll() {
    fillEventSelect();
    renderStats();
    renderCheckedList();
    if (state.mode === "batch") renderBatchRoster();
  }

  function bind() {
    fillGroupSelect();
    fillEventSelect();

    var sel = $("ac-event-select");
    if (sel) {
      sel.onchange = function () {
        state.eventId = sel.value || null;
        refreshAll();
      };
    }

    doc.querySelectorAll(".ac-mode-tab").forEach(function (btn) {
      btn.onclick = function () {
        setMode(btn.getAttribute("data-mode"));
      };
    });

    var btnSeed = $("ac-btn-seed");
    if (btnSeed) {
      btnSeed.onclick = function () {
        S.ensureSeedAll();
        fillGroupSelect();
        refreshAll();
        setMsg("已載入示範會友／場次（若原本已有資料則只補場次）", "ok");
      };
    }

    var btnCreate = $("ac-btn-create");
    if (btnCreate) {
      btnCreate.onclick = function () {
        var type = ($("ac-new-type") && $("ac-new-type").value) || "cell";
        var title = ($("ac-new-title") && $("ac-new-title").value) || "";
        var groupId = $("ac-new-group") && $("ac-new-group").value;
        var ev = S.createEvent({
          type: type,
          title: title || undefined,
          groupId: groupId || null,
          date: S.todayISO()
        });
        state.eventId = ev.id;
        refreshAll();
        setMsg("已建立場次：" + ev.title, "ok");
      };
    }

    function revealWork() {
      var gate = $("ac-gate");
      var work = $("ac-work");
      if (gate) gate.hidden = true;
      if (work) work.hidden = false;
    }

    function beginTonight() {
      if (!S.listEvents().length) {
        S.ensureSeedAll();
        fillGroupSelect();
        refreshAll();
      }
      if (!state.eventId) {
        var events = S.listEvents();
        if (events[0]) state.eventId = events[0].id;
      }
      if (!state.eventId) {
        setMsg("請先載入示範或建立一場聚會", "err");
        return;
      }
      var ev = S.getEvent(state.eventId);
      if (ev && ev.status === "draft") {
        var res = S.startEvent(state.eventId);
        if (!res.ok) {
          setMsg("無法開始：" + res.error, "err");
          return;
        }
      }
      revealWork();
      setMsg("好嘢！聚會已開始。而家可以輸入短碼或電話幫人簽到。", "ok");
      refreshAll();
      var q = $("ac-manual-q");
      if (q) q.focus();
    }

    var btnBegin = $("ac-btn-begin-tonight");
    if (btnBegin) {
      btnBegin.onclick = beginTonight;
    }

    var btnStart = $("ac-btn-start");
    if (btnStart) {
      btnStart.onclick = function () {
        if (!state.eventId) return;
        var res = S.startEvent(state.eventId);
        if (!res.ok) setMsg("無法開始：" + res.error, "err");
        else {
          revealWork();
          setMsg("好嘢！聚會已開始，可以簽到。", "ok");
          refreshAll();
        }
      };
    }

    var btnClose = $("ac-btn-close");
    if (btnClose) {
      btnClose.onclick = function () {
        if (!state.eventId) return;
        S.closeEvent(state.eventId);
        setMsg("場次已結束", "warn");
        refreshAll();
      };
    }

    var btnSearch = $("ac-btn-search");
    if (btnSearch) {
      btnSearch.onclick = function () {
        var q = ($("ac-manual-q") && $("ac-manual-q").value) || "";
        renderHits(S.findMembers(q));
      };
    }

    var qInput = $("ac-manual-q");
    if (qInput) {
      qInput.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          var hits = S.findMembers(qInput.value);
          if (hits.length === 1) {
            var q = qInput.value.trim();
            var method = "manual_name";
            var code = String(hits[0].checkinCode || "").toUpperCase();
            if (q.indexOf("B100|") === 0 || (code && q.toUpperCase().indexOf(code) >= 0)) {
              method = "identity_qr";
            } else if (String(S.memberIdOf(hits[0])) === q) {
              method = "manual_code";
            } else if (digitsPhone(q)) {
              method = "manual_phone";
            }
            doManualCheckIn(hits[0], method);
          } else {
            renderHits(hits);
          }
        }
      });
    }

    var btnCsv = $("ac-btn-csv");
    if (btnCsv) {
      btnCsv.onclick = function () {
        if (!state.eventId) return;
        var csv = S.exportEventCsv(state.eventId);
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var a = doc.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "attendance_" + state.eventId + ".csv";
        a.click();
        URL.revokeObjectURL(a.href);
      };
    }

    setMode("manual");
    refreshAll();

    try {
      var cur = currentEvent();
      if (cur && cur.status === "open") revealWork();
    } catch (eG) {}
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", bind);
  else bind();
})(window, document);
