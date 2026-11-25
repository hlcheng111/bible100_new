/**
 * Page 6 · 牧養戰略桌（深度業務 UI）
 * Tab1 痛點分類 · Tab2 提案模擬 · Tab3 代禱紅綠燈推小組 · Tab4 教會健康指數
 */
(function (win, doc) {
  "use strict";

  var H = win.PastoralDataHub;
  if (!H) return;

  var state = { tab: "visits", selectedProposal: null };

  function $(id) {
    return doc.getElementById(id);
  }

  function switchTab(name) {
    state.tab = name;
    doc.querySelectorAll(".pst-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === name);
    });
    ["visits", "proposals", "prayer", "yearly"].forEach(function (t) {
      var p = $("pst-panel-" + t);
      if (p) p.classList.toggle("active", t === name);
    });
    renderAll();
    if (win.history && win.history.replaceState) {
      win.history.replaceState(null, "", "#tab-" + name);
    }
  }

  function painChip(cat) {
    if (!cat) return "";
    return '<span class="pst-pain-chip">' + H.esc(cat) + "</span>";
  }

  function sensBadge(level) {
    if (level === "high") return '<span class="por-sens-high">高敏</span>';
    return '<span class="pst-sens-normal">一般</span>';
  }

  function prayerSignal(urgency, pushed) {
    if (urgency === "high") {
      return '<span class="pst-light red" title="緊急">🔴</span>' + (pushed ? ' <span class="ok">已推小組工作桌</span>' : ' <button type="button" class="sg-btn sm pst-push-btn">推小組</button>');
    }
    return '<span class="pst-light green" title="一般">🟢</span>';
  }

  function renderVisits() {
    var host = $("pst-panel-visits");
    if (!host) return;
    var store = H.getStrategyStore();
    var members = H.getMembers();
    var role = H.getViewerRole();
    var inbox = H.getPastoralTaskInbox({ limit: 15 });
    var html =
      '<p class="muted">當前視角：<strong>' +
      H.esc(role) +
      "</strong>（高敏字段僅 pastor/district 可見 · URL 加 <code>?role=pastor</code>）</p>";
    if (inbox.length) {
      html += '<div class="sg-card alert"><h3>📥 統一牧養待辦 Inbox</h3><ul class="alert-list">';
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
          '">處理</a></li>';
      });
      html += "</ul></div>";
    }
    html +=
      '<div class="sg-card"><h3>新增牧者探訪日誌</h3>' +
      '<select id="pst-visit-member" class="sg-select"><option value="">選擇對象</option>' +
      members
        .map(function (m) {
          return '<option value="' + m.id + '">' + H.esc(m.name) + "</option>";
        })
        .join("") +
      '</select><input id="pst-visit-author" class="sg-input" placeholder="記錄者（牧者／區長）">' +
      '<label>痛點分類 <select id="pst-visit-pain" class="sg-select"><option value="">—</option>' +
      H.PAIN_CATEGORIES.map(function (c) {
        return '<option value="' + c + '">' + c + "</option>";
      }).join("") +
      '</select></label> <label>保密 <select id="pst-visit-sens" class="sg-select">' +
      H.SENSITIVITY_LEVELS.map(function (s) {
        return '<option value="' + s.id + '">' + s.label + "</option>";
      }).join("") +
      '</select></label> <label>跟進週期 <select id="pst-visit-cycle" class="sg-select">' +
      H.FOLLOWUP_CYCLES.map(function (c) {
        return '<option value="' + c + '">' + c + "</option>";
      }).join("") +
      '</select><textarea id="pst-visit-sum" class="sg-input" rows="2" placeholder="輔導摘要"></textarea>' +
      '<button type="button" class="sg-btn pst-btn" id="pst-visit-save">儲存日誌</button></div>';

    html += '<div class="sg-card"><h3>探訪日誌 · 痛點分類</h3>';
    if (!store.visitLogs.length) html += '<p class="muted">暫無日誌</p>';
    store.visitLogs.forEach(function (v) {
      var row = H.filterVisitLogForViewer(v, role);
      html +=
        '<div class="sg-list-item' +
        (row.sensitivity === "high" && !row.redacted ? " pst-sens-row" : "") +
        '">' +
        H.esc(row.date) +
        " · " +
        (row.targetMemberId ? H.memberLinkHtml(row.targetMemberId, row.targetName || "會友") : H.esc(row.targetName)) +
        " · " +
        H.esc(row.author) +
        " " +
        painChip(row.painCategory) +
        " " +
        sensBadge(row.sensitivity) +
        (row.redacted ? ' <span class="por-sens-high">已脫敏</span>' : "") +
        (row.followupCycle ? ' <small>跟進：' + H.esc(row.followupCycle) + "</small>" : "") +
        "<br>" +
        H.esc(row.summary) +
        "</div>";
    });
    html += "</div>";
    host.innerHTML = html;
    var save = $("pst-visit-save");
    if (save) {
      save.onclick = function () {
        var mid = ($("pst-visit-member") && $("pst-visit-member").value) || "";
        var sum = ($("pst-visit-sum") && $("pst-visit-sum").value) || "";
        if (!mid || !sum.trim()) return;
        var m = H.getMemberById(mid);
        H.addVisitLog({
          targetMemberId: mid,
          targetName: m ? m.name : mid,
          author: ($("pst-visit-author") && $("pst-visit-author").value) || "牧者",
          summary: sum.trim(),
          painCategory: ($("pst-visit-pain") && $("pst-visit-pain").value) || "",
          sensitivity: ($("pst-visit-sens") && $("pst-visit-sens").value) || "normal",
          followupCycle: ($("pst-visit-cycle") && $("pst-visit-cycle").value) || "1周內"
        });
        renderVisits();
      };
    }
  }

  function renderProposals() {
    var host = $("pst-panel-proposals");
    if (!host) return;
    var store = H.getStrategyStore();
    if (!state.selectedProposal && store.proposals.length) state.selectedProposal = store.proposals[0].id;

    var html =
      '<div class="sg-card"><h3>策略提案 · 效益模擬</h3>' +
      '<input id="pst-prop-title" class="sg-input" placeholder="提案標題">' +
      '<input id="pst-prop-author" class="sg-input" placeholder="提案人">' +
      '<textarea id="pst-prop-body" class="sg-input" rows="2" placeholder="方向、新小組開拓、事工轉型…"></textarea>' +
      '<div class="pst-sim-grid">' +
      '<input id="pst-prop-budget" type="number" class="sg-input" placeholder="預算 $">' +
      '<input id="pst-prop-manpower" type="number" class="sg-input" placeholder="人力（人月）">' +
      '<input id="pst-prop-reach" type="number" class="sg-input" placeholder="預估屬靈觸達人數">' +
      "</div>" +
      '<button type="button" class="sg-btn pst-btn" id="pst-prop-save">提交提案</button></div>';

    html += '<div class="sg-card"><h3>策略提案室</h3>';
    store.proposals.forEach(function (p) {
      var sim = H.simulateProposalImpact(p.id);
      var active = state.selectedProposal === p.id;
      html +=
        '<div class="sg-list-item' +
        (active ? " pst-prop-active" : "") +
        '"><strong>' +
        H.esc(p.title) +
        "</strong> · " +
        H.esc(p.author) +
        " · " +
        H.esc(p.status) +
        "<br>" +
        H.esc(p.body);
      if (sim) {
        html +=
          '<div class="pst-sim-result"><span class="pst-roi">ROI ' +
          sim.roiScore +
          "</span> · " +
          H.esc(sim.summary) +
          "</div>";
      }
      html +=
        '<br><button type="button" class="sg-btn sm pst-sim-btn" data-pid="' +
        p.id +
        '">重新模擬</button> ' +
        '<a href="../../church_planning/index_plan.html" target="_parent">→ 教會規劃 OS</a></div>';
    });
    html += "</div>";
    host.innerHTML = html;

    var save = $("pst-prop-save");
    if (save) {
      save.onclick = function () {
        var title = ($("pst-prop-title") && $("pst-prop-title").value) || "";
        if (!title.trim()) return;
        var rec = H.addStrategyProposal({
          title: title.trim(),
          author: ($("pst-prop-author") && $("pst-prop-author").value) || "",
          body: ($("pst-prop-body") && $("pst-prop-body").value) || "",
          budget: parseFloat(($("pst-prop-budget") && $("pst-prop-budget").value) || "0") || 0,
          manpower: parseFloat(($("pst-prop-manpower") && $("pst-prop-manpower").value) || "0") || 0,
          expectedReach: parseInt(($("pst-prop-reach") && $("pst-prop-reach").value) || "0", 10) || 0
        });
        state.selectedProposal = rec.id;
        renderProposals();
      };
    }
    host.querySelectorAll(".pst-sim-btn").forEach(function (btn) {
      btn.onclick = function () {
        state.selectedProposal = btn.getAttribute("data-pid");
        var sim = H.simulateProposalImpact(state.selectedProposal);
        if (sim) alert(sim.summary + "\nROI 指數：" + sim.roiScore);
        renderProposals();
      };
    });
  }

  function renderPrayer() {
    var host = $("pst-panel-prayer");
    if (!host) return;
    var store = H.getStrategyStore();
    var groups = H.getGroups();
    var html =
      '<div class="sg-card"><h3>發佈代禱事項 · 紅綠燈推小組工作桌</h3>' +
      '<p class="muted">🔴 緊急事項將自動同步至 Page ① 小組工作桌總覽</p>' +
      '<textarea id="pst-pray-req" class="sg-input" rows="2" placeholder="代禱內容"></textarea>' +
      '<select id="pst-pray-group" class="sg-select"><option value="">全教會各組</option>' +
      groups
        .map(function (g) {
          return '<option value="' + g.id + '">' + H.esc(g.name) + "</option>";
        })
        .join("") +
      '</select> <select id="pst-pray-urg" class="sg-select"><option value="normal">🟢 一般</option><option value="high">🔴 緊急</option></select>' +
      '<button type="button" class="sg-btn pst-btn" id="pst-pray-save">發佈</button></div>';

    html += '<div class="sg-card"><h3>關懷代禱網絡</h3><table class="pa-table pst-prayer-table"><thead><tr><th>信號</th><th>日期</th><th>事項</th><th>範圍</th><th>推送</th></tr></thead><tbody>';
    store.prayerItems.forEach(function (p) {
      var g = p.groupId
        ? groups.find(function (x) {
            return Number(x.id) === Number(p.groupId);
          })
        : null;
      html +=
        "<tr" +
        (p.urgency === "high" ? ' class="pst-row-urgent"' : "") +
        "><td>" +
        (p.urgency === "high" ? '<span class="pst-light red">🔴</span>' : '<span class="pst-light green">🟢</span>') +
        "</td><td>" +
        H.esc(p.date) +
        "</td><td>" +
        H.esc(p.request) +
        "</td><td>" +
        (g ? H.esc(g.name) : "全教會") +
        "</td><td>" +
        (p.pushedToGroups
          ? '<span class="ok">已推送</span> <a href="small-groups-integrated.html?crm_from=b_pastoral">工作桌</a>'
          : '<button type="button" class="sg-btn sm pst-push-btn" data-pid="' +
            p.id +
            '">推小組</button>') +
        "</td></tr>";
    });
    html += "</tbody></table></div>";
    host.innerHTML = html;

    var save = $("pst-pray-save");
    if (save) {
      save.onclick = function () {
        var req = ($("pst-pray-req") && $("pst-pray-req").value) || "";
        if (!req.trim()) return;
        var gid = $("pst-pray-group") && $("pst-pray-group").value;
        H.addPrayerItem({
          request: req.trim(),
          urgency: ($("pst-pray-urg") && $("pst-pray-urg").value) || "normal",
          groupId: gid ? parseInt(gid, 10) : null
        });
        renderPrayer();
      };
    }
    host.querySelectorAll(".pst-push-btn").forEach(function (btn) {
      btn.onclick = function () {
        H.pushPrayerToWorkspace(btn.getAttribute("data-pid"));
        renderPrayer();
      };
    });
  }

  function renderYearly() {
    var host = $("pst-panel-yearly");
    if (!host) return;
    var rep = H.getYearlyPastoralReport();
    var hi = rep.healthIndex || H.getChurchHealthIndex();
    var html =
      '<div class="sg-card"><h3>' +
      rep.year +
      ' 教會健康指數 · 年度牧養大盤點</h3>' +
      '<div class="pst-health-grid">' +
      '<div class="sg-stat"><span class="n">' +
      (hi.baptismConversionRate != null ? hi.baptismConversionRate + "%" : "—") +
      '</span><span class="l">受洗轉化率</span><div class="pst-kpi-bar"><span style="width:' +
      (hi.baptismConversionRate || 0) +
      '%"></span></div></div>' +
      '<div class="sg-stat"><span class="n">' +
      (hi.trainingPenetration != null ? hi.trainingPenetration + "%" : "—") +
      '</span><span class="l">門訓滲透率</span><div class="pst-kpi-bar"><span style="width:' +
      (hi.trainingPenetration || 0) +
      '%"></span></div></div>' +
      '<div class="sg-stat"><span class="n">' +
      (hi.reclaimRate != null ? hi.reclaimRate + "%" : "—") +
      '</span><span class="l">流失復得率</span><div class="pst-kpi-bar"><span style="width:' +
      (hi.reclaimRate || 0) +
      '%"></span></div></div>' +
      '<div class="sg-stat"><span class="n">' +
      (hi.groupRelayRate != null ? hi.groupRelayRate + "%" : "—") +
      '</span><span class="l">通告小組傳遞率</span><div class="pst-kpi-bar"><span style="width:' +
      (hi.groupRelayRate || 0) +
      '%"></span></div></div>' +
      "</div>";

    html +=
      '<div class="pst-kpi">' +
      '<div class="sg-stat"><span class="n">' +
      rep.memberCount +
      '</span><span class="l">會友總數</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      rep.groupCount +
      '</span><span class="l">細胞小組</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      rep.baptizedCount +
      '</span><span class="l">已受洗</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      rep.newcomerCount +
      '</span><span class="l">新朋友階段</span></div>' +
      '<div class="sg-stat warn"><span class="n">' +
      rep.atRiskCount +
      '</span><span class="l">流失預警</span></div>' +
      '<div class="sg-stat"><span class="n">' +
      rep.trainingCompletions +
      '</span><span class="l">訓練結業</span></div>' +
      '<div class="sg-stat warn"><span class="n">' +
      rep.pendingTasks +
      '</span><span class="l">待跟進任務</span></div>' +
      "</div>" +
      '<p class="muted">數據來自 memberSystemData、group_attendance_v1、pastoral_events_board_v1、pastoral_training_v1</p>' +
      '<p><a href="pastoral-attendance.html?crm_from=b_pastoral#tab-alerts">出席預警</a> · ' +
      '<a href="pastoral-org-roster.html?crm_from=b_pastoral#tab-lifecycle">生命週期</a> · ' +
      '<a href="pastoral-events.html?crm_from=b_pastoral#tab-announce">活動通告傳遞率</a> · ' +
      '<a href="../support/visitation_index.html?crm_from=b_pastoral">探訪事工</a></p></div>';
    host.innerHTML = html;
  }

  function renderAll() {
    if (state.tab === "visits") renderVisits();
    if (state.tab === "proposals") renderProposals();
    if (state.tab === "prayer") renderPrayer();
    if (state.tab === "yearly") renderYearly();
  }

  function boot() {
    H.ensurePastoralSeed(false);
    doc.querySelectorAll(".pst-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    var seed = $("pst-seed-btn");
    if (seed) {
      seed.onclick = function () {
        H.ensurePastoralSeed(true);
        renderAll();
        seed.textContent = "已載入示範";
      };
    }
    var exp = $("pst-export-btn");
    if (exp) {
      exp.onclick = function () {
        H.downloadPastoralBundle();
      };
    }
    var roleSel = $("pst-role-sel");
    if (roleSel) {
      try {
        roleSel.value = H.getViewerRole();
      } catch (eR) {}
      roleSel.onchange = function () {
        try {
          win.sessionStorage.setItem("crm_role", roleSel.value);
        } catch (eS) {}
        renderAll();
      };
    }
    var hash = (win.location.hash || "").replace("#tab-", "");
    if (hash && ["visits", "proposals", "prayer", "yearly"].indexOf(hash) >= 0) switchTab(hash);
    else renderAll();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
