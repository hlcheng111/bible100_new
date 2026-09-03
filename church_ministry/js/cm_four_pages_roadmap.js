/**
 * CM 基本四页 · 小白路線圖橫幅（SITE-5a / CM-F2）
 * 用法：<body data-cm-four-page="member|visit|shift|finance"> + mount('#id')
 */
(function (global) {
  "use strict";

  var PLAYBOOK = "../../help/user_playbooks_w5.html";

  var ROADMAPS = {
    member: {
      emoji: "①",
      title: "會友人事 · member_id 主檔起點",
      ssotId: "member",
      steps: [
        "載入試用會友或新增一筆（確認 member_id）",
        "小組／培訓／出席在此維護",
        "探訪、排班、財務都引用同一主鍵"
      ],
      next: { label: "下一步：探訪", href: "../support/visitation_index.html" }
    },
    visit: {
      emoji: "②",
      title: "探訪關懷 · 探訪工作桌",
      ssotId: "visit",
      steps: [
        "選日期與對象（姓名與會友主檔一致）",
        "填簡要、優先級與跟進選項",
        "本週清單可匯出 CSV／列印"
      ],
      next: { label: "下一步：排班", href: "../../tools/volunteer_shift/index.html" }
    },
    shift: {
      emoji: "③",
      title: "義工排班 · 排班表",
      ssotId: "shift_roster",
      steps: [
        "先有人、有崗位（或載入 A1 試用）",
        "新增排班 → 複製邀請文字親自送出",
        "請假時到「請假調班」登記代班"
      ],
      next: { label: "請假調班", href: "leave_swap.html" }
    },
    finance: {
      emoji: "④",
      title: "財務事工 · 收支管理",
      ssotId: "finance_tx",
      steps: [
        "總覽看本月收支與預算",
        "新增收入／支出（經 Bridge 寫入）",
        "儀表板奉獻 KPI 會同步更新"
      ],
      next: { label: "回戰情總覽", href: "../../dashboard.html" }
    }
  };

  function esc(s) {
    var d = global.document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function planningContext() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      var f = p.get("crm_from") || p.get("from") || "";
      if (global.CrmContextBar && global.CrmContextBar.isPlanningFrom) {
        return global.CrmContextBar.isPlanningFrom(f) ? f : "";
      }
      return f === "planning_step6" || f === "planning_g_admin" || f === "planning" ? f : "";
    } catch (e) {
      return "";
    }
  }

  function appendCrmFrom(href) {
    var ctx = planningContext();
    if (!ctx) return href;
    if (/crm_from=/.test(href)) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "crm_from=" + encodeURIComponent(ctx);
  }

  function mount(selector) {
    var el = typeof selector === "string" ? global.document.querySelector(selector) : selector;
    if (!el) return;
    var key = (global.document.body && global.document.body.getAttribute("data-cm-four-page")) || "";
    var cfg = ROADMAPS[key];
    if (!cfg) return;

    var fromPlan = !!planningContext();
    if (fromPlan && cfg.ssotId && global.GDoAdminMenu) {
      var ssotItem = global.GDoAdminMenu.itemById(cfg.ssotId);
      if (ssotItem) {
        cfg = Object.assign({}, cfg, {
          emoji: ssotItem.label.charAt(0),
          title: ssotItem.label,
          subtitle: ssotItem.en || ""
        });
      }
    }
    var planBadge =
      planningContext() === "planning_step6"
        ? "來自規劃步 6"
        : fromPlan
          ? "來自 G 行政管理"
          : "";
    var stepsHtml = cfg.steps.map(function (s, i) {
      return "<li><strong>" + (i + 1) + ".</strong> " + esc(s) + "</li>";
    }).join("");

    var nextHref = cfg.next ? appendCrmFrom(cfg.next.href) : "";
    var nextBtn = cfg.next
      ? '<a class="cm4p-roadmap__btn" href="' + esc(nextHref) + '">' + esc(cfg.next.label) + " →</a>"
      : "";

    el.innerHTML =
      '<div class="cm4p-roadmap' + (fromPlan ? " cm4p-roadmap--plan" : "") + '" role="note">' +
      '<div class="cm4p-roadmap__head">' +
      '<span class="cm4p-roadmap__emoji">' + cfg.emoji + "</span>" +
      "<strong>" + esc(cfg.title) + "</strong>" +
      (fromPlan ? '<span class="cm4p-roadmap__badge">' + esc(planBadge) + "</span>" : "") +
      "</div>" +
      '<ol class="cm4p-roadmap__steps">' + stepsHtml + "</ol>" +
      '<div class="cm4p-roadmap__actions">' +
      nextBtn +
      '<a class="cm4p-roadmap__btn cm4p-roadmap__btn--ghost" href="' + esc(PLAYBOOK) + '" target="_parent">W5 劇本</a>' +
      "</div></div>";
  }

  global.CmFourPagesRoadmap = { mount: mount, ROADMAPS: ROADMAPS };
})(typeof window !== "undefined" ? window : this);
