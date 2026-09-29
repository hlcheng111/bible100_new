/**
 * G 行政管理 · Do 內容頁標題同步（crm_from=planning* 時對齊 SSOT 側欄命名）
 */
(function (global, doc) {
  "use strict";

  var PAGE_MAP = [
    { re: /member-integrated\.html/i, id: "member" },
    { re: /visitation_index\.html/i, id: "visit" },
    { re: /volunteer_shift\/index\.html/i, id: "shift_roster" },
    { re: /leave_swap\.html/i, id: "shift_leave" },
    { re: /finance-integrated\.html/i, id: "finance_tx", hash: "budget", altId: "finance_budget" },
    { re: /dashboard\.html/i, id: "dashboard", cmOnly: true },
    { re: /landing_g_admin\.html/i, id: "landing", planOnly: true }
  ];

  function getCrmFrom() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      var f = p.get("crm_from") || p.get("from") || "";
      if (global.CrmContextBar && global.CrmContextBar.isPlanningFrom) {
        return global.CrmContextBar.isPlanningFrom(f) ? f : "";
      }
      return f === "planning_g_admin" || f === "planning_step6" || f === "planning" ? f : "";
    } catch (e) {
      return "";
    }
  }

  function resolvePageId() {
    var path = (global.location.pathname || "").replace(/\\/g, "/");
    var hash = (global.location.hash || "").toLowerCase();
    for (var i = 0; i < PAGE_MAP.length; i++) {
      var row = PAGE_MAP[i];
      if (!row.re.test(path)) continue;
      if (row.hash && hash.indexOf(row.hash) >= 0 && row.altId) return row.altId;
      return row.id;
    }
    return "";
  }

  function applyTitles() {
    var menu = global.GDoAdminMenu;
    if (!menu) return;
    var crm = getCrmFrom();
    var onLanding = /landing_g_admin\.html/i.test(global.location.pathname || "");
    if (!crm && !onLanding) return;

    var pageId = resolvePageId();
    var item = pageId ? menu.itemById(pageId) : null;
    if (!item || pageId === "dashboard") return;

    var h1 =
      doc.querySelector("h1") ||
      doc.querySelector(".header h1") ||
      doc.querySelector(".cm-tool-hero h1");
    if (h1) {
      h1.textContent = item.label;
      if (item.en) {
        var sub = h1.nextElementSibling;
        if (!sub || !sub.classList.contains("g-do-page-en")) {
          sub = doc.createElement("p");
          sub.className = "g-do-page-en";
          sub.style.cssText = "margin:4px 0 0;font-size:12px;color:#64748b;";
          h1.parentNode.insertBefore(sub, h1.nextSibling);
        }
        sub.textContent = item.en + (item.maturity === "wip" ? " · 開發中" : "");
      }
    }

    var titleText = item.label.replace(/^[^\u4e00-\u9fff①②③④⑤⑥⑦⑧⑨⑩]+/, "").trim();
    if (titleText) {
      doc.title = titleText + " | G 行政管理 · Do";
    }

    doc.querySelectorAll("[data-g-do-legacy-title]").forEach(function (el) {
      el.textContent = item.label;
    });
  }

  function hideLegacyBackLinks() {
    if (!getCrmFrom() && !/landing_g_admin\.html/i.test(global.location.pathname || "")) return;
    doc.querySelectorAll('a[href*="dashboard.html"]').forEach(function (a) {
      var t = (a.textContent || "").trim();
      if (/教會事工中心|教會事工儀表板|返回教會/.test(t) && !a.closest("#g-do-admin-nav")) {
        var wrap = a.closest("div[style*='padding:10px']") || a.parentElement;
        if (wrap && wrap.childNodes.length <= 2) wrap.style.display = "none";
        else a.style.display = "none";
      }
    });
  }

  function boot() {
    applyTitles();
    hideLegacyBackLinks();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.GDoAdminPageChrome = { applyTitles: applyTitles, getCrmFrom: getCrmFrom };
})(window, document);
