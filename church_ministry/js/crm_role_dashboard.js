/**
 * 教會事工三級 Dashboard 卡片（會友 / 同工 / 決策者）
 * CRM Dashboard v1：A1 排班 + A2 探訪跟進 + CTV + Data Trust
 */
(function (global) {
  "use strict";

  var ROLES = {
    member: { label: "會友", zh: "會友視角" },
    staff: { label: "同工／老師", zh: "同工視角" },
    leader: { label: "決策者", zh: "決策者視角" }
  };

  var STORAGE_KEY = "church_dashboard_role_v1";

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function card(title, bodyHtml, linkHtml) {
    return (
      '<div class="role-card" style="margin-bottom:8px;">' +
      '<div class="role-name">' + title + "</div>" +
      '<div class="role-todo" style="margin:6px 0;">' + bodyHtml + "</div>" +
      (linkHtml || "") +
      "</div>"
    );
  }

  function link(href, text, target) {
    target = target || "_parent";
    return '<a class="link-chip" href="' + esc(href) + '" target="' + target + '" style="display:inline-block;margin-top:6px;margin-right:6px;">' + esc(text) + "</a>";
  }

  function truncateReason(text, max) {
    var s = String(text || "");
    var n = max != null ? max : 28;
    if (s.length <= n) return s;
    return s.slice(0, n) + "…";
  }

  function getTrustState(b) {
    var demoA1 = false;
    var demoA2 = false;
    var demoA3 = false;
    try {
      if (global.DataTrustBadge && DataTrustBadge.isVolunteerShiftDemoLoaded) {
        demoA1 = DataTrustBadge.isVolunteerShiftDemoLoaded();
      }
      if (global.DataTrustBadge && DataTrustBadge.isVisitationFollowupDemoLoaded) {
        demoA2 = DataTrustBadge.isVisitationFollowupDemoLoaded();
      } else if (global.localStorage) {
        demoA2 = !!global.localStorage.getItem("visitation_followup_demo_loaded_at");
      }
      if (global.DataTrustBadge && DataTrustBadge.isFinanceReconciliationDemoLoaded) {
        demoA3 = DataTrustBadge.isFinanceReconciliationDemoLoaded();
      } else if (global.localStorage) {
        demoA3 = !!global.localStorage.getItem("finance_reconciliation_demo_loaded_at");
      }
    } catch (e) {}
    var hasReal = false;
    if (b) {
      try {
        var vs = b.getVolunteerShiftSummary ? b.getVolunteerShiftSummary(365) : {};
        var pf = b.getPastoralFollowupSummary ? b.getPastoralFollowupSummary(365) : {};
        var fin = b.getFinanceReconciliationSummary ? b.getFinanceReconciliationSummary(365) : {};
        hasReal = (vs.total || 0) > 0 || (pf.pending || 0) > 0 || (fin.total_records || 0) > 0;
        if (!hasReal && b.getMembers) hasReal = (b.getMembers() || []).length > 0;
      } catch (e2) {}
    }
    var state = "empty";
    if (demoA1 || demoA2 || demoA3) state = hasReal ? "mixed" : "demo";
    else if (hasReal) state = "real";
    return {
      state: state,
      demo_a1: demoA1,
      demo_a2: demoA2,
      demo_a3: demoA3,
      label: state === "mixed" ? "mixed（含 demo）" : state === "demo" ? "demo" : state === "real" ? "real" : "empty"
    };
  }

  function getCrmKpiSnapshot(b) {
    b = b || bridge();
    if (!b) {
      return { ok: false, vs: {}, pf: {}, fin: {}, ctv: 0, trust: getTrustState(null) };
    }
    var vs = b.getVolunteerShiftSummary ? b.getVolunteerShiftSummary(14) || {} : {};
    var pf = b.getPastoralFollowupSummary ? b.getPastoralFollowupSummary(7) || {} : {};
    var fin = b.getFinanceReconciliationSummary ? b.getFinanceReconciliationSummary(30) || {} : {};
    var ctvList = b.listPendingMinistrySuggestions ? b.listPendingMinistrySuggestions() || [] : [];
    return {
      ok: true,
      vs: vs,
      pf: pf,
      fin: fin,
      ctv: ctvList.length,
      trust: getTrustState(b)
    };
  }

  function safetyNoticeHtml(compact) {
    var style = compact ? "font-size:10px;line-height:1.55;margin:0;color:#92400e;" : "font-size:10px;line-height:1.6;margin:8px 0 0;color:#3730a3;";
    return (
      '<ul style="' + style + 'padding-left:16px;">' +
      "<li><strong>demo KPI 不可當正式決策報告</strong>（mixed/demo 時請先清 demo 或載入正式資料）</li>" +
      "<li><strong>不會自動通知</strong> LINE／WhatsApp；邀請與關懷稿僅 copy_only</li>" +
      "<li><strong>牧養／財務敏感資料不顯示全文</strong>；儀表板僅數字與摘要，完整 note 請至授權工具頁</li>" +
      "</ul>"
    );
  }

  function renderMember(b) {
    var members = b.getMembers ? b.getMembers() : [];
    var sampleId = members[0] ? String(members[0].memberId != null ? members[0].memberId : members[0].id) : null;
    var shifts = sampleId && b.listVolunteerShifts ? b.listVolunteerShifts({ memberId: sampleId, limit: 5 }) : [];
    var events = sampleId && b.listPastoralEvents ? b.listPastoralEvents(sampleId, 3) : [];
    var html = "";
    if (!members.length) {
      html += card("👤 我的資料", "尚無會友資料。請同工協助建立名單，或載入試用種子。", link("load_central_member_seed.html", "載入試用會友"));
    } else {
      html += card(
        "👤 我的資料",
        "示範以第一位會友（" + esc(members[0].name || sampleId) + "）為例。正式使用時請以您的 member_id 登入。",
        link("modules/members/member-360-timeline.html?memberId=" + encodeURIComponent(sampleId), "查看 360 時間軸")
      );
    }
    if (!shifts.length) {
      html += card("📅 我的服事", "近期沒有排班紀錄。", link("tools/volunteer_shift/index.html", "了解排班工具"));
    } else {
      html += card(
        "📅 我的服事",
        "近期待服事 " + shifts.length + " 筆（" + shifts.filter(function (s) { return !s.confirmed; }).length + " 待確認）。",
        link("tools/volunteer_shift/list.html", "查看排班清單")
      );
    }
    if (!events.length) {
      html += card("❤️ 關懷跟進", "尚無關懷紀錄。", link("modules/support/visitation_index.html", "探訪工作桌"));
    } else {
      html += card("❤️ 關懷跟進", "最近 " + events.length + " 則牧養事件。", link("modules/members/member-360-timeline.html", "時間軸"));
    }
    return html;
  }

  function renderStaff(b) {
    var snap = getCrmKpiSnapshot(b);
    var sum = snap.vs;
    var pf = snap.pf;
    var ctv = snap.ctv;
    var html = "";
    html += card(
      "📅 近 14 天待確認排班",
      "<strong>" + esc(sum.pending_confirm != null ? sum.pending_confirm : "—") + "</strong> 筆待同工確認（A1）· 缺口 <strong>" +
        esc(sum.leave_gaps != null ? sum.leave_gaps : "—") +
        "</strong>（請假未代班）。",
      link("tools/volunteer_shift/list.html", "處理排班清單") + link("tools/volunteer_shift/leave_swap.html", "請假調班")
    );
    html += card(
      "🤝 近 7 天探訪跟進待處理",
      "<strong>" + esc(pf.pending != null ? pf.pending : "—") + "</strong> 筆待跟進 · 逾期 <strong>" +
        esc(pf.overdue != null ? pf.overdue : "—") +
        "</strong>（A2 · 不含 note 全文）。",
      link("tools/visitation_followup/list.html", "跟進清單") + link("tools/visitation_followup/form.html", "新增跟進")
    );
    html += card(
      "⏰ 今日到期跟進",
      "<strong>" + esc(pf.due_today != null ? pf.due_today : "—") + "</strong> 筆今日到期。",
      link("tools/visitation_followup/list.html", "今日跟進清單")
    );
    html += card(
      "🧭 CTV 待決策",
      "<strong>" + esc(ctv) + "</strong> 項事奉配對建議待確認。",
      link("tools/volunteer_shift/form.html", "排班／CTV 候選") +
        link("../church_planning/cta-os-war-room.html", "CTA 戰情室")
    );
    html += card(
      "🤖 AI 營運自動化",
      "口述／文字 → <strong>只預填</strong>表單，不自動儲存、不會自動通知。",
      link("../ai_tools/pages/crm_automation_console.html", "營運自動化控制台")
    );
    html += card(
      "📋 傳統工作桌",
      "新人 SLA、風險關懷、階段晉升、CTA-OS（右欄動態待辦）。",
      link("modules/support/visitation_index.html", "探訪工作桌")
    );
    return html;
  }

  function renderLeader(b) {
    var snap = getCrmKpiSnapshot(b);
    var sum = snap.vs;
    var pf = snap.pf;
    var ctv = snap.ctv;
    var trust = snap.trust;
    var m = b.getCrmMaturitySummary ? b.getCrmMaturitySummary() : {};
    var html = "";

    var fin = snap.fin;
    var kpiLine =
      "A1 排班 · 近 14 天 upcoming <strong>" + esc(sum.upcoming != null ? sum.upcoming : "—") +
      "</strong> · pending_confirm <strong>" + esc(sum.pending_confirm != null ? sum.pending_confirm : "—") +
      "</strong><br>A2 跟進 · pending <strong>" + esc(pf.pending != null ? pf.pending : "—") +
      "</strong> · due_today <strong>" + esc(pf.due_today != null ? pf.due_today : "—") +
      "</strong><br>A3 財務 · 待對帳 <strong>" + esc(fin.pending != null ? fin.pending : "—") +
      "</strong> · exception <strong>" + esc(fin.exception != null ? fin.exception : "—") +
      "</strong> · 30 天金額 <strong>" + esc(fin.total_amount != null ? fin.total_amount : "—") +
      "</strong><br>CTV 待決策 <strong>" + esc(ctv) +
      "</strong> · Data Trust <strong>" + esc(trust.label) +
      "</strong> · CRM 就緒度 " + esc(m.percent != null ? m.percent + "%" : "—");

    html += card("📊 CRM 決策 KPI（A1/A2）", kpiLine,
      link("tools/volunteer_shift/dashboard.html", "A1 儀表板") +
        link("tools/visitation_followup/dashboard.html", "A2 儀表板") +
        link("tools/finance_reconciliation/list.html", "A3 對帳清單") +
        link("../church_planning/cta-os-war-room.html", "CTA 戰情室")
    );

    var followups = b.listPastoralFollowups
      ? b.listPastoralFollowups({ excludeArchived: true, limit: 5 })
      : [];
    if (followups.length) {
      var reasonLines = followups.slice(0, 3).map(function (t) {
        return esc(t.member_name || t.member_id) + "：" + esc(truncateReason(t.reason, 24)) +
          "（" + esc(t.priority) + " · " + esc(t.due_date) + "）";
      }).join("<br>");
      html += card(
        "🤝 跟進 reason 摘要（無 note）",
        reasonLines,
        link("tools/visitation_followup/list.html", "完整清單")
      );
    }

    html += '<div class="role-card" style="margin-bottom:8px;background:#fffbeb;border-color:#fde68a;">' +
      '<div class="role-name">🔒 決策者資料契約</div>' + safetyNoticeHtml(true) + "</div>";

    html += card(
      "🧭 RACI／成熟度",
      "CTV " + ctv + " 項 · 詳見 DECISION_MAKER_PATH。",
      link("../church_planning/planning/raci-reflection.html", "RACI 反思") +
        link("docs/DECISION_MAKER_PATH.md", "決策者一條路", "_blank")
    );
    return html;
  }

  function renderCrmKpiStrip() {
    var host = document.getElementById("crm-kpi-v1-root");
    if (!host) return;
    var b = bridge();
    if (!b) {
      host.innerHTML = '<p class="role-todo">ChurchDataBridge 未載入</p>';
      return;
    }
    var snap = getCrmKpiSnapshot(b);
    var sum = snap.vs;
    var pf = snap.pf;
    host.innerHTML =
      '<div class="stats-spac" style="margin-top:4px;">' +
      '<div class="stat-pill"><div class="stat-label"><span>A1 待確認排班</span><span>14 天</span></div>' +
      '<div class="stat-main">' + esc(sum.pending_confirm != null ? sum.pending_confirm : "—") + '</div>' +
      '<div class="stat-foot"><a href="tools/volunteer_shift/list.html" target="_parent">排班清單 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>排班缺口</span><span>請假未代班</span></div>' +
      '<div class="stat-main">' + esc(sum.leave_gaps != null ? sum.leave_gaps : "—") + '</div>' +
      '<div class="stat-foot"><a href="tools/volunteer_shift/leave_swap.html" target="_parent">請假調班 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>A2 待跟進</span><span>7 天</span></div>' +
      '<div class="stat-main">' + esc(pf.pending != null ? pf.pending : "—") + '</div>' +
      '<div class="stat-foot"><a href="tools/visitation_followup/list.html" target="_parent">跟進清單 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>探訪逾期</span><span>due &lt; 今天</span></div>' +
      '<div class="stat-main">' + esc(pf.overdue != null ? pf.overdue : "—") + '</div>' +
      '<div class="stat-foot"><a href="tools/visitation_followup/list.html" target="_parent">逾期跟進 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>A2 今日到期</span><span>7 天窗</span></div>' +
      '<div class="stat-main">' + esc(pf.due_today != null ? pf.due_today : "—") + '</div>' +
      '<div class="stat-foot"><a href="tools/visitation_followup/form.html" target="_parent">新增跟進 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>CTV 待決策</span><span>canonical</span></div>' +
      '<div class="stat-main">' + esc(snap.ctv) + '</div>' +
      '<div class="stat-foot"><a href="tools/volunteer_shift/form.html" target="_parent">CTV／排班 →</a></div></div>' +
      '<div class="stat-pill"><div class="stat-label"><span>A3 待對帳</span><span>財務</span></div>' +
      '<div class="stat-main">' + esc(snap.fin.pending != null ? snap.fin.pending : "—") + '</div>' +
      '<div class="stat-foot">exception ' + esc(snap.fin.exception != null ? snap.fin.exception : "—") +
      ' · <a href="tools/finance_reconciliation/list.html" target="_parent">對帳 →</a></div></div>' +
      "</div>" +
      '<p class="note" style="margin-top:8px;">Data Trust：<strong>' + esc(snap.trust.label) +
      "</strong> · demo KPI 不可當正式決策報告 · 不會自動通知</p>";
  }

  function renderTodayDesk() {
    var b = bridge();
    var metaShifts = document.getElementById("deskMetaShifts");
    var metaFollow = document.getElementById("deskMetaFollowup");
    if (!b || !metaShifts || !metaFollow) return;
    var snap = getCrmKpiSnapshot(b);
    metaShifts.textContent =
      "近 14 天待確認 " + (snap.vs.pending_confirm != null ? snap.vs.pending_confirm : "—") +
      " · 缺口 " + (snap.vs.leave_gaps != null ? snap.vs.leave_gaps : "—");
    metaFollow.textContent =
      "今日到期 " + (snap.pf.due_today != null ? snap.pf.due_today : "—") +
      " · 逾期 " + (snap.pf.overdue != null ? snap.pf.overdue : "—") +
      " · 待跟進 " + (snap.pf.pending != null ? snap.pf.pending : "—");
  }

  function getSavedRole() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "staff";
    } catch (e) {
      return "staff";
    }
  }

  function saveRole(role) {
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch (e) {}
  }

  function renderRoleDashboard(role) {
    var host = document.getElementById("crm-role-dashboard-root");
    if (!host) return;
    var b = bridge();
    if (!b) {
      host.innerHTML = '<p class="role-todo">ChurchDataBridge 未載入</p>';
      return;
    }
    role = role || getSavedRole();
    var html = "";
    if (role === "member") html = renderMember(b);
    else if (role === "leader") html = renderLeader(b);
    else html = renderStaff(b);
    host.innerHTML = html || '<p class="role-todo">無卡片</p>';
    document.querySelectorAll("[data-crm-role-btn]").forEach(function (btn) {
      var r = btn.getAttribute("data-crm-role-btn");
      btn.style.fontWeight = r === role ? "700" : "400";
      btn.style.background = r === role ? "#eef2ff" : "#fff";
    });
  }

  function initRoleSwitcher() {
    var bar = document.getElementById("crm-role-switch");
    if (!bar) return;
    Object.keys(ROLES).forEach(function (key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "link-chip";
      btn.setAttribute("data-crm-role-btn", key);
      btn.textContent = ROLES[key].label;
      btn.style.cursor = "pointer";
      btn.style.border = "1px solid #c7d2fe";
      btn.addEventListener("click", function () {
        saveRole(key);
        renderRoleDashboard(key);
      });
      bar.appendChild(btn);
    });
    renderCrmKpiStrip();
    renderTodayDesk();
    renderRoleDashboard(getSavedRole());
  }

  global.CrmRoleDashboard = {
    ROLES: ROLES,
    init: initRoleSwitcher,
    render: renderRoleDashboard,
    getCrmKpiSnapshot: getCrmKpiSnapshot,
    renderCrmKpiStrip: renderCrmKpiStrip,
    renderTodayDesk: renderTodayDesk
  };
})(typeof window !== "undefined" ? window : this);
