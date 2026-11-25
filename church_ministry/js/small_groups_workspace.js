/**
 * Page 1 · 小組工作桌 UI
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = { groupId: null, tab: "overview" };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".sg-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    doc.querySelectorAll(".sg-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "sg-panel-" + name);
    });
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function renderGroupSelect() {
    var sel = $("sg-group-select");
    if (!sel) return;
    var groups = H.getGroups();
    sel.innerHTML = groups
      .map(function (g) {
        return (
          '<option value="' +
          g.id +
          '">' +
          H.esc(g.name) +
          " · " +
          H.esc(g.region || g.location || "") +
          " · " +
          H.esc(g.ageBand || "") +
          "</option>"
        );
      })
      .join("");
    var active = H.getActiveGroup();
    state.groupId = active ? active.id : groups[0] && groups[0].id;
    if (state.groupId != null) sel.value = String(state.groupId);
    sel.onchange = function () {
      state.groupId = parseInt(sel.value, 10);
      H.setActiveGroup(state.groupId);
      renderAll();
    };
  }

  function renderOverview() {
    var host = $("sg-panel-overview");
    if (!host || state.groupId == null) return;
    var dash = H.getDashboardForGroup(state.groupId);
    var g = dash.group || {};
    var html =
      '<div class="sg-stat-grid">' +
      '<div class="sg-stat"><span class="n">' +
      dash.rosterCount +
      '</span><span class="l">本組成員</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      dash.goals.length +
      '</span><span class="l">本季目標</span></div>' +
      '<div class="sg-stat warn"><span class="n">' +
      dash.absenceAlerts.length +
      '</span><span class="l">缺席預警</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      dash.birthdays.length +
      '</span><span class="l">本週生日</span></div>' +
      "</div>";

    var inbox = H.getPastoralTaskInbox({ groupId: state.groupId, limit: 12 });
    if (inbox.length) {
      html += '<div class="sg-card alert"><h3>📥 牧養待辦 Inbox（' + inbox.length + "）</h3><ul class=\"alert-list\">";
      inbox.forEach(function (t) {
        html +=
          '<li class="' +
          (t.priority === "critical" || t.priority === "high" ? "hot" : "") +
          '">' +
          (t.memberId ? H.memberLinkHtml(t.memberId, t.name) : H.esc(t.name)) +
          " · " +
          H.esc(t.summary) +
          ' <a href="' +
          H.esc(t.link) +
          '">處理</a>' +
          (t.taskId || t.draftId
            ? ' <button type="button" class="sg-btn sm sg-inbox-done" data-tid="' + H.esc(t.id) + '">完成</button>'
            : "") +
          "</li>";
      });
      html += "</ul></div>";
    }

    html += '<div class="sg-card"><h3>牧職架構</h3><p class="muted">';
    html +=
      "牧者：" +
      H.esc(g.pastor || "—") +
      " · 區長：" +
      H.esc(g.districtLeader || "—") +
      " · 組長：" +
      H.esc(g.leader || "—");
    html += "<br>分區：" + H.esc(g.region || "—") + " · 聚會：" + H.esc(g.meetingDay || "—") + "</p>";
    html +=
      '<p><a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-tree">→ 全教會牧職架構</a> · ' +
      '<a href="pastoral-attendance.html?crm_from=b_pastoral&groupId=' +
      state.groupId +
      '">聚會出席統計</a> · ' +
      '<a href="../members/member-integrated.html?crm_from=b_pastoral#tab=groups">會友小組歸屬</a></p></div>';

    if (dash.birthdays.length) {
      html += '<div class="sg-card"><h3>🎂 本週生日</h3><ul>';
      dash.birthdays.forEach(function (m) {
        html += "<li>" + H.memberLinkHtml(m.id, m.name) + "</li>";
      });
      html += "</ul></div>";
    }

    if (dash.absenceAlerts.length) {
      html += '<div class="sg-card alert"><h3>⚠️ 缺席預警（≥' + H.ABSENCE_ALERT_WEEKS + " 周）</h3><ul>";
      dash.absenceAlerts.forEach(function (a) {
        html +=
          "<li>" +
          H.memberLinkHtml(a.memberId, a.name) +
          " · 連續 " +
          a.streak +
          ' 周 <a href="../support/visitation_index.html?crm_from=b_pastoral">探訪事工</a></li>';
      });
      html += "</ul></div>";
    }

    if (dash.checkinPending) {
      html +=
        '<p class="sg-todo">📌 待辦：本週快評尚未完成 · <button type="button" class="sg-btn sm" data-goto-tab="checkin">去快評</button></p>';
    }

    if (dash.prayerAlerts && dash.prayerAlerts.length) {
      html += '<div class="sg-card alert"><h3>🔴 戰略桌緊急代禱</h3><ul class="alert-list">';
      dash.prayerAlerts.forEach(function (p) {
        if (p.urgency !== "high") return;
        html +=
          '<li class="hot">' +
          H.esc(p.request) +
          ' <a href="pastoral-strategy.html?crm_from=b_pastoral#tab-prayer">戰略桌</a></li>';
      });
      html += "</ul></div>";
    }

    if (dash.pendingAnnouncementRelays && dash.pendingAnnouncementRelays.length) {
      html +=
        '<div class="sg-card"><h3>📣 待轉發教會通告</h3><ul>';
      dash.pendingAnnouncementRelays.forEach(function (r) {
        html +=
          "<li>" +
          H.esc(r.title) +
          ' · <a href="pastoral-events.html?crm_from=b_pastoral#tab-announce">去確認傳遞</a></li>';
      });
      html += "</ul></div>";
    }

    html += '<div class="sg-card"><h3>本組成員（點姓名 → 會友主檔）</h3><div class="sg-roster">';
    H.membersInGroup(state.groupId).forEach(function (m) {
      html +=
        '<span class="sg-chip">' +
        H.memberLinkHtml(m.id, m.name) +
        " <small>" +
        H.esc(m.zone || "") +
        "</small></span>";
    });
    html += "</div></div>";

    host.innerHTML = html;
    host.querySelectorAll(".sg-inbox-done").forEach(function (btn) {
      btn.onclick = function () {
        H.completePastoralTask(btn.getAttribute("data-tid"));
        renderOverview();
      };
    });
    host.querySelectorAll("[data-goto-tab]").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-goto-tab"));
      };
    });
  }

  function renderWeekly() {
    var host = $("sg-panel-weekly");
    if (!host || state.groupId == null) return;
    var wk = H.isoWeekKey(H.todayISO());
    var mtg = H.getMeetingForWeek(state.groupId, wk) || { scripture: "", icebreaker: "", prayers: [] };
    host.innerHTML =
      '<p class="muted">本週 ' +
      H.esc(wk) +
      " · 查經材料、破冰與代禱（儲存後組員可在出席頁對照）</p>" +
      '<label>查經／材料<br><textarea id="sg-scripture" rows="2" class="sg-input">' +
      H.esc(mtg.scripture || "") +
      "</textarea></label>" +
      '<label>破冰<br><textarea id="sg-icebreaker" rows="2" class="sg-input">' +
      H.esc(mtg.icebreaker || "") +
      "</textarea></label>" +
      '<label>代禱事項（每行一項）<br><textarea id="sg-prayers" rows="3" class="sg-input">' +
      H.esc((mtg.prayers || []).join("\n")) +
      "</textarea></label>" +
      '<button type="button" class="sg-btn" id="sg-save-meeting">儲存本週開組</button>';
    $("sg-save-meeting").onclick = function () {
      H.saveWeeklyMeeting(state.groupId, {
        scripture: $("sg-scripture").value,
        icebreaker: $("sg-icebreaker").value,
        prayers: $("sg-prayers").value
      });
      win.alert("已儲存本週開組動態");
    };
  }

  function renderGoals() {
    var host = $("sg-panel-goals");
    if (!host || state.groupId == null) return;
    var w = H.getWorkspace();
    var goals = w.goals.filter(function (g) {
      return Number(g.groupId) === Number(state.groupId);
    });
    var html = goals.length
      ? goals
          .map(function (g) {
            return (
              '<div class="sg-list-item"><strong>' +
              H.esc(g.title) +
              "</strong> · " +
              H.esc(g.period) +
              " · 進度 " +
              (g.pct || 0) +
              "%" +
              (g.gospelFriends != null ? " · 福音朋友 " + g.gospelFriends : "") +
              "</div>"
            );
          })
          .join("")
      : "<p>尚無目標。</p>";
    html +=
      '<button type="button" class="sg-btn" id="sg-add-goal">新增目標（示範）</button>';
    host.innerHTML = html;
    $("sg-add-goal").onclick = function () {
      w.goals.push({
        id: "goal_" + Date.now(),
        groupId: state.groupId,
        title: "新目標（請編輯）",
        period: "本季",
        pct: 0,
        gospelFriends: 0
      });
      H.saveWorkspace(w);
      renderGoals();
    };
  }

  function renderCheckin() {
    var host = $("sg-panel-checkin");
    if (!host || state.groupId == null) return;
    var roster = H.membersInGroup(state.groupId);
    var absentHtml = roster
      .map(function (m) {
        return (
          '<label class="sg-check-row"><input type="checkbox" class="sg-absent-chk" value="' +
          m.id +
          '"> 缺席：' +
          H.esc(m.name) +
          "</label>"
        );
      })
      .join("");
    host.innerHTML =
      "<p>約 5 分鐘 · 勾選缺席會聯動出席統計與探訪預警規則</p>" +
      '<label>微小勝利<br><textarea id="sg-micro-win" rows="3" class="sg-input"></textarea></label>' +
      '<div class="sg-card"><h3>本週出席快選</h3>' +
      absentHtml +
      "</div>" +
      '<label><input type="checkbox" id="sg-need-visit"> 需要探訪跟進（另寫探訪草稿）</label>' +
      '<p><button type="button" class="sg-btn" id="sg-save-checkin">儲存快評</button> ' +
      '<a href="../support/visitation_index.html?crm_from=b_pastoral" id="sg-goto-visitation" style="display:none">→ 探訪事工</a> ' +
      '<a href="pastoral-attendance.html?crm_from=b_pastoral&groupId=' +
      state.groupId +
      '">完整出席彙報</a></p>';

    $("sg-save-checkin").onclick = function () {
      var absent = [];
      doc.querySelectorAll(".sg-absent-chk:checked").forEach(function (chk) {
        absent.push(parseInt(chk.value, 10));
      });
      var records = roster.map(function (m) {
        return {
          memberId: m.id,
          status: absent.indexOf(m.id) >= 0 ? "absent" : "present"
        };
      });
      H.recordGroupAttendanceSession(state.groupId, H.todayISO(), records);
      H.saveCheckin(
        state.groupId,
        $("sg-micro-win").value,
        $("sg-need-visit") && $("sg-need-visit").checked,
        absent
      );
      var gv = $("sg-goto-visitation");
      if (gv && $("sg-need-visit").checked) gv.style.display = "inline";
      win.alert(
        absent.length
          ? "快評已存；已寫入出席。缺席 " + absent.length + " 人，若達 3 周將自動進探訪清單。"
          : "快評已存，全員出席已記錄。"
      );
      renderOverview();
    };
  }

  function renderAll() {
    if (state.groupId == null) {
      var g = H.getActiveGroup();
      state.groupId = g && g.id;
    }
    renderOverview();
    renderWeekly();
    renderGoals();
    renderCheckin();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    renderGroupSelect();
    doc.querySelectorAll(".sg-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-tab"));
      });
    });
    var hash = (win.location.hash || "").replace(/^#/, "");
    if (hash.indexOf("tab-") === 0) switchTab(hash.slice(4));
    var q = new URLSearchParams(win.location.search || "");
    if (q.get("groupId")) {
      state.groupId = parseInt(q.get("groupId"), 10);
      H.setActiveGroup(state.groupId);
      var sel = $("sg-group-select");
      if (sel) sel.value = String(state.groupId);
    }
    $("sg-seed-btn").onclick = function () {
      H.ensurePastoralSeed(true);
      renderGroupSelect();
      renderAll();
      win.alert("已載入示範數據（會友、小組、牧職樹、目標）");
    };
    renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
