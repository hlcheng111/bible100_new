/**
 * G 行政管理 · Do 四主線命名 SSOT
 * 契約（同 planning_sidebar_labels.js）：
 *   label = 中文主標 ·   en = 英文副標（小字，不拼進 H1）
 * 路徑 cmPath 為 CM 模組內部檔位，側欄只顯示 label/en，不顯示 URL。
 */
(function (global) {
  "use strict";

  var CRM_FROM = "planning_g_admin";
  var MENU_BUILD = "20260805s5";

  /** 僅 landing 頁說明用；不出現在側欄／dashboard */
  var HINT = "Do 主路：① 會友 → ② 探訪 → 📡 戰情 · ③④ 依規模加開";

  /** @type {Array<object>} */
  var FLAT = [
    {
      id: "landing",
      kind: "plan",
      label: "📖 行政運作原則",
      en: "Admin Principles · Do",
      planPath: "landing_g_admin.html"
    },
    {
      id: "dashboard",
      label: "📡 戰情總覽",
      en: "Bridge KPI · Do",
      cmPath: "dashboard.html",
      primary: true
    },
    {
      id: "member",
      label: "① 會友人事",
      en: "Member Registry",
      hint: "member_id 主檔起點",
      cmPath: "modules/members/member-integrated.html"
    },
    {
      id: "visit",
      label: "② 探訪關懷",
      en: "Pastoral Care",
      hint: "探訪工作桌",
      cmPath: "modules/support/visitation_index.html"
    },
    {
      id: "shift_roster",
      label: "排班表",
      en: "Shift Roster",
      cmPath: "tools/volunteer_shift/index.html",
      group: "shift"
    },
    {
      id: "shift_leave",
      label: "請假調班",
      en: "Substitute",
      cmPath: "tools/volunteer_shift/leave_swap.html",
      group: "shift"
    },
    {
      id: "cross_risk",
      kind: "plan",
      label: "跨部門風險摘要",
      en: "Cross-Risk Summary",
      planPath: "cross_risk_summary.html",
      group: "shift"
    },
    {
      id: "matchmaker",
      kind: "plan",
      label: "事奉媒合",
      en: "Ministry Matchmaker",
      hint: "Plan↔Do 正式派工",
      planPath: "ministry-position-matchmaker.html",
      group: "shift"
    },
    {
      id: "finance_tx",
      label: "💵 收支管理",
      en: "Finance Ledger",
      hint: "奉獻 · 支出登錄",
      cmPath: "modules/finance/finance-integrated.html#transactions",
      group: "finance"
    },
    {
      id: "finance_budget",
      label: "📋 預算規劃",
      en: "Budget Planning",
      hint: "年度預算類別",
      cmPath: "modules/finance/finance-integrated.html#budget",
      group: "finance"
    }
  ];

  var GROUPS = {
    shift: { summary: "③ 義工排班", en: "Volunteer Scheduling" },
    finance: { summary: "④ 財務事工", en: "Finance Ministry" }
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function splitHash(url) {
    url = String(url || "");
    var hi = url.indexOf("#");
    if (hi < 0) return { base: url, hash: "" };
    return { base: url.slice(0, hi), hash: url.slice(hi) };
  }

  function appendCrmFrom(url, crmFrom) {
    url = String(url || "");
    crmFrom = crmFrom || CRM_FROM;
    if (!crmFrom || /crm_from=/.test(url)) return url;
    if (/^church_planning\//.test(url) || url.indexOf("landing_g_admin") >= 0) return url;
    var parts = splitHash(url);
    var base = parts.base;
    base += (base.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(crmFrom);
    return base + parts.hash;
  }

  function sidebarContentHref(item, crmFrom) {
    crmFrom = crmFrom || CRM_FROM;
    if (item.planPath) return item.planPath;
    return "../" + appendCrmFrom("church_ministry/" + item.cmPath, crmFrom);
  }

  function rootRelPath(item, crmFrom) {
    crmFrom = crmFrom || CRM_FROM;
    if (item.planPath) return "church_planning/" + item.planPath.replace(/^\.\//, "");
    return appendCrmFrom("church_ministry/" + item.cmPath, crmFrom);
  }

  function contentPageHref(item, cmPrefix, crmFrom) {
    cmPrefix = cmPrefix == null ? "../../" : cmPrefix;
    crmFrom = crmFrom || CRM_FROM;
    if (item.planPath) {
      try {
        if (/church_planning/i.test(global.location.pathname || "")) {
          return item.planPath;
        }
      } catch (eP) { /* ignore */ }
      var depth = (String(cmPrefix).match(/\.\.\//g) || []).length;
      var planPrefix = "";
      for (var i = 0; i <= depth; i++) planPrefix += "../";
      return planPrefix + "church_planning/" + item.planPath;
    }
    return cmPrefix + appendCrmFrom(item.cmPath, crmFrom);
  }

  function itemById(id) {
    for (var i = 0; i < FLAT.length; i++) {
      if (FLAT[i].id === id) return FLAT[i];
    }
    return null;
  }

  function maturityBadge(item) {
    if (!item || item.maturity !== "wip") return "";
    return '<span class="sb-g-wip">開發中</span>';
  }

  function sublineHtml(item) {
    if (!item || !item.en) return "";
    return (
      '<small class="sb-g-en">' +
      esc(item.en) +
      maturityBadge(item) +
      "</small>"
    );
  }

  function groupSummaryHtml(group) {
    if (!group) return "";
    return (
      '<span class="sb-g-group-sum">' +
      "<strong>" +
      esc(group.summary) +
      "</strong>" +
      (group.en ? '<small class="sb-g-en">' + esc(group.en) + "</small>" : "") +
      "</span>"
    );
  }

  function renderLandingList(host, opts) {
    if (!host) return;
    opts = opts || {};
    var crmFrom = opts.crmFrom || CRM_FROM;
    var cmPrefix = opts.cmPrefix || "../church_ministry/";

    function anchor(item, isPlan) {
      var href = item.planPath
        ? item.planPath
        : cmPrefix + appendCrmFrom(item.cmPath, crmFrom);
      var onclick = "";
      if (isPlan && global.planningOpenContent && item.planPath) {
        onclick =
          ' onclick="return planningOpenContent(event,' +
          JSON.stringify(item.planPath) +
          ');"';
      } else if (!isPlan && global.planningOpenDo) {
        onclick =
          ' onclick="return planningOpenDo(event,' +
          JSON.stringify(rootRelPath(item, crmFrom)) +
          ',{crmFrom:' +
          JSON.stringify(crmFrom) +
          '});"';
      }
      return (
        '<a href="' +
        esc(href) +
        '"' +
        onclick +
        ">" +
        esc(item.label) +
        maturityBadge(item) +
        "</a>" +
        sublineHtml(item) +
        (item.hint ? '<small class="do-hint">' + esc(item.hint) + "</small>" : "")
      );
    }

    var html = "";
    html += "<p class=\"do-route-hint\">" + esc(HINT) + "</p>";
    ["dashboard", "member", "visit"].forEach(function (id) {
      var item = itemById(id);
      if (item) html += "<li>" + anchor(item, false) + "</li>";
    });

    html += "<li><strong>" + esc(GROUPS.shift.summary) + "</strong>";
    if (GROUPS.shift.en) {
      html += '<small class="sb-g-en">' + esc(GROUPS.shift.en) + "</small>";
    }
    html += '<div class="do-sub">';
    html += anchor(itemById("shift_roster"), false);
    html += " · ";
    html += anchor(itemById("shift_leave"), false);
    html += " · ";
    html += anchor(itemById("cross_risk"), true);
    html += " · ";
    html += anchor(itemById("matchmaker"), true);
    html += "</div></li>";

    html += "<li><strong>" + esc(GROUPS.finance.summary) + "</strong>";
    if (GROUPS.finance.en) {
      html += '<small class="sb-g-en">' + esc(GROUPS.finance.en) + "</small>";
    }
    html += '<div class="do-sub">';
    html += anchor(itemById("finance_tx"), false);
    html += anchor(itemById("finance_budget"), false);
    html += "</div></li>";

    host.innerHTML = html;
  }

  global.GDoAdminMenu = {
    CRM_FROM: CRM_FROM,
    MENU_BUILD: MENU_BUILD,
    HINT: HINT,
    FLAT: FLAT,
    GROUPS: GROUPS,
    appendCrmFrom: appendCrmFrom,
    splitHash: splitHash,
    sidebarContentHref: sidebarContentHref,
    rootRelPath: rootRelPath,
    contentPageHref: contentPageHref,
    itemById: itemById,
    sublineHtml: sublineHtml,
    groupSummaryHtml: groupSummaryHtml,
    renderLandingList: renderLandingList
  };
})(typeof window !== "undefined" ? window : this);
