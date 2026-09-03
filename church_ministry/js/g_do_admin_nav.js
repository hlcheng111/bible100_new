/**
 * G 行政管理 · Do 內容頁安全繩（僅 standalone 開啟時；殼內有左欄則不注入）
 */
(function (global, doc) {
  "use strict";

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

  function hasParentSidebar() {
    try {
      if (!global.parent || global.parent === global) return false;
      return !!global.parent.document.getElementById("sidebarFrame");
    } catch (e) {
      return true;
    }
  }

  function currentPageId() {
    var path = (global.location.pathname || "").replace(/\\/g, "/");
    if (/member-integrated\.html/i.test(path)) return "member";
    if (/visitation_index\.html/i.test(path)) return "visit";
    if (/volunteer_shift\/index\.html/i.test(path)) return "shift_roster";
    if (/leave_swap\.html/i.test(path)) return "shift_leave";
    if (/finance-integrated\.html/i.test(path)) {
      var h = (global.location.hash || "").toLowerCase();
      if (h.indexOf("budget") >= 0) return "finance_budget";
      return "finance_tx";
    }
    if (/dashboard\.html/i.test(path) && /church_ministry/i.test(path)) return "dashboard";
    if (/landing_g_admin\.html/i.test(path)) return "landing";
    return "";
  }

  function cmPrefixFromBody() {
    var el = doc.body;
    if (el && el.getAttribute("data-g-do-cm-prefix") != null) {
      return el.getAttribute("data-g-do-cm-prefix");
    }
    var path = (global.location.pathname || "").replace(/\\/g, "/");
    if (/\/church_ministry\/dashboard\.html/i.test(path)) return "";
    if (/\/church_ministry\/modules\//i.test(path)) return "../../";
    if (/\/church_ministry\/tools\//i.test(path)) return "../../";
    return "../../";
  }

  function navigate(ev, rootRel) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (typeof global.planningOpenDo === "function" && rootRel) {
      return global.planningOpenDo(ev, rootRel.replace(/^church_ministry\//, "church_ministry/"), {
        crmFrom: getCrmFrom() || "planning_g_admin"
      });
    }
    if (typeof global.bible100ShellNav === "function" && rootRel) {
      global.bible100ShellNav(ev, { contentUrl: rootRel });
      return false;
    }
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: "navigate", url: rootRel }, "*");
        return false;
      }
    } catch (ePm) { /* ignore */ }
    return false;
  }

  function inject() {
    var menu = global.GDoAdminMenu;
    if (!menu || doc.getElementById("g-do-admin-nav")) return;
    if (!getCrmFrom()) return;
    if (hasParentSidebar()) return;

    var crmFrom = getCrmFrom() || menu.CRM_FROM;
    var cmPrefix = cmPrefixFromBody();
    var cur = currentPageId();
    var strip = doc.createElement("nav");
    strip.id = "g-do-admin-nav";
    strip.className = "g-do-admin-nav g-do-admin-nav--slim";
    strip.setAttribute("role", "navigation");
    strip.setAttribute("aria-label", "G 行政管理");

    var landing = menu.itemById("landing");
    var dash = menu.itemById("dashboard");
    var html =
      '<span class="g-do-admin-nav__title">G 行政</span>' +
      '<a href="' +
      menu.contentPageHref(landing, cmPrefix, crmFrom) +
      '" data-do-id="landing">' +
      landing.label +
      "</a>";
    if (cur !== "dashboard") {
      html +=
        '<a href="' +
        menu.contentPageHref(dash, cmPrefix, crmFrom) +
        '" data-do-id="dashboard">' +
        dash.label +
        "</a>";
    }
    strip.innerHTML = html;

    strip.querySelectorAll("a[data-do-id]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var item = menu.itemById(a.getAttribute("data-do-id"));
        if (!item) return;
        navigate(ev, menu.rootRelPath(item, crmFrom));
      });
    });

    doc.body.insertBefore(strip, doc.body.firstChild);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  global.GDoAdminNav = { inject: inject, getCrmFrom: getCrmFrom, currentPageId: currentPageId };
})(window, document);
