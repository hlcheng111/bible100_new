/**
 * G 區行政營運 · 3 Tab 整合工作桌殼
 */
(function (global, doc) {
  "use strict";

  var TAB_SRC = {
    dashboard: "../../dashboard.html",
    finance: "../finance/finance-integrated.html",
    members: "../members/member-integrated.html",
    planning: "../../../church_planning/index_plan.html"
  };

  function $(id) {
    return doc.getElementById(id);
  }

  function bust(url) {
    if (!url) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function buildFrameSrc(tab) {
    var base = TAB_SRC[tab] || TAB_SRC.dashboard;
    var q = [];
    try {
      var sp = new URLSearchParams(global.location.search || "");
      var crm = sp.get("crm_from");
      if (crm) q.push("crm_from=" + encodeURIComponent(crm));
    } catch (e) {}
    if (tab === "members") return base + (q.length ? "?" + q.join("&") + "&" : "?") + "embed=1#tab=overview";
    return base + (q.length ? "?" + q.join("&") : "");
  }

  function setTabActive(tab) {
    doc.querySelectorAll(".cm-shell-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
  }

  function switchTab(tab) {
    if (!TAB_SRC[tab]) tab = "dashboard";
    if (tab === "planning") {
      setTabActive(tab);
      try {
        global.location.hash = "tab-" + tab;
      } catch (eH) {}
      if (global.bible100ShellNav) {
        global.bible100ShellNav(null, {
          sidebarUrl: "church_planning/sidebar_plan_v5_preview.html",
          contentUrl: "church_planning/index_plan.html?crm_from=g_admin_tab"
        });
      }
      return;
    }
    var frame = $("admin-integrated-subframe");
    if (frame) frame.src = bust(buildFrameSrc(tab));
    setTabActive(tab);
    try {
      global.location.hash = "tab-" + tab;
    } catch (eH) {}
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[hash]) return hash;
    return "dashboard";
  }

  function syncSidebarFocusG() {
    try {
      var p = global.parent;
      if (!p || p === global) return;
      var sidebarUrl = "church_ministry/sidebar_church_layout_v1.html?focus=g";
      if (global.CmShellPaths && global.CmShellPaths.isCmIndexShell && global.CmShellPaths.isCmIndexShell(p)) {
        sidebarUrl = "sidebar_church_layout_v1.html?focus=g";
      }
      if (typeof p.bible100ShellNav === "function") {
        p.bible100ShellNav(null, { sidebarUrl: sidebarUrl });
        return;
      }
      p.postMessage({ type: "bible100-shell", sidebarUrl: sidebarUrl }, "*");
    } catch (eS) {}
  }

  function init() {
    syncSidebarFocusG();
    doc.querySelectorAll(".cm-shell-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    $("admin-btn-planning") &&
      ($("admin-btn-planning").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "church_planning/sidebar_plan_v5_preview.html",
            contentUrl: "church_planning/index_plan.html?crm_from=g_admin"
          });
        }
      });
    switchTab(resolveInitialTab());
  }

  global.AdminIntegratedShell = { switchTab: switchTab };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
