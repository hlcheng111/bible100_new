/**
 * B 區牧養 · 4 Tab 整合工作桌殼
 */
(function (global, doc) {
  "use strict";

  var TAB_SRC = {
    groups: "small-groups-integrated.html",
    attendance: "pastoral-attendance.html",
    alerts: "pastoral_alerts_panel.html",
    visitation: "pastoral_visitation_panel.html"
  };

  var activeTab = "groups";

  function $(id) {
    return doc.getElementById(id);
  }

  function bust(url) {
    if (!url) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
  }

  function buildFrameSrc(tab) {
    var base = TAB_SRC[tab] || TAB_SRC.groups;
    var q = [];
    try {
      var sp = new URLSearchParams(global.location.search || "");
      var crm = sp.get("crm_from");
      var role = sp.get("role");
      if (crm) q.push("crm_from=" + encodeURIComponent(crm));
      if (role) q.push("role=" + encodeURIComponent(role));
    } catch (eQ) {}
    return base + (q.length ? "?" + q.join("&") : "");
  }

  function setTabActive(tab) {
    doc.querySelectorAll(".cm-shell-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
  }

  function updateHash(tab) {
    try {
      if (global.history && global.history.replaceState) {
        var u = new URL(global.location.href);
        u.hash = "tab-" + tab;
        global.history.replaceState(null, "", u.pathname + u.search + u.hash);
      } else {
        global.location.hash = "tab-" + tab;
      }
    } catch (eH) {
      global.location.hash = "tab-" + tab;
    }
  }

  function renderOverview() {
    var H = global.PastoralDataHub;
    if (!H) return;
    try {
      if (H.evaluateLifecycleRules) H.evaluateLifecycleRules();
    } catch (eE) {}
    var members = H.getMembers ? H.getMembers() : [];
    var groups = H.getGroups ? H.getGroups() : [];
    var pending = (H.getOrgStore().handoverTasks || []).filter(function (t) {
      return t.status === "pending";
    });
    var alerts = pending.filter(function (t) {
      return t.type === "absence_followup";
    });
    if ($("past-stat-groups")) $("past-stat-groups").textContent = groups.length;
    if ($("past-stat-members")) $("past-stat-members").textContent = members.length;
    if ($("past-stat-pending")) $("past-stat-pending").textContent = pending.length;
    if ($("past-stat-alerts")) {
      $("past-stat-alerts").textContent = alerts.length;
      var wrap = $("past-stat-alerts").parentElement;
      if (wrap) wrap.classList.toggle("warn", alerts.length > 0);
    }
  }

  function switchTab(tab) {
    if (!TAB_SRC[tab]) tab = "groups";
    activeTab = tab;
    var frame = $("past-integrated-subframe");
    if (frame) frame.src = bust(buildFrameSrc(tab));
    setTabActive(tab);
    updateHash(tab);
    renderOverview();
    if (tab === "alerts" && window.CmAiCareHelper) {
      setTimeout(function () {
        var H = global.PastoralDataHub;
        if (!H) return;
        var tasks = (H.getOrgStore().handoverTasks || []).filter(function (t) {
          return t.status === "pending" && t.type === "absence_followup";
        });
        if (tasks[0]) {
          CmAiCareHelper.renderCareCard("past-shell-care", {
            name: tasks[0].memberName,
            streak: 3,
            context: "小組聚會"
          });
        }
      }, 400);
    }
  }

  function resolveInitialTab() {
    var hash = (global.location.hash || "").replace("#tab-", "");
    if (TAB_SRC[hash]) return hash;
    return "groups";
  }

  function notifyParentTab(tab) {
    try {
      if (global.parent && global.parent !== global && global.parent.PastoralIntegratedShell) {
        global.parent.PastoralIntegratedShell.switchTab(tab);
        return;
      }
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: "pastoral-integrated", action: "switchTab", tab: tab }, "*");
      }
    } catch (eN) {}
  }

  function bindOverviewClicks() {
    var map = {
      "past-stat-groups": "groups",
      "past-stat-members": "groups",
      "past-stat-pending": "visitation",
      "past-stat-alerts": "alerts"
    };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (!el) return;
      var wrap = el.parentElement;
      if (!wrap) return;
      wrap.style.cursor = "pointer";
      wrap.title = "點擊切換至「" + map[id] + "」Tab";
      wrap.onclick = function () {
        switchTab(map[id]);
      };
    });
  }

  function bindPostMessage() {
    global.addEventListener("message", function (ev) {
      var d = ev.data;
      if (!d || d.type !== "pastoral-integrated") return;
      if (d.action === "switchTab" && TAB_SRC[d.tab]) switchTab(d.tab);
      if (d.action === "refreshOverview") renderOverview();
    });
  }

  function bindToolbar() {
    doc.querySelectorAll(".cm-shell-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
    $("past-btn-visitation") &&
      ($("past-btn-visitation").onclick = function (ev) {
        if (global.bible100ShellNav) {
          return global.bible100ShellNav(ev, {
            sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=b",
            contentUrl: "church_ministry/modules/support/visitation_index.html?crm_from=b_pastoral_desk"
          });
        }
      });
    $("past-btn-push-queue") &&
      ($("past-btn-push-queue").onclick = function () {
        var H = global.PastoralDataHub;
        if (!H) return;
        H.evaluateLifecycleRules();
        var n = (H.getOrgStore().handoverTasks || []).filter(function (t) {
          return t.status === "pending";
        }).length;
        switchTab("visitation");
        alert(n ? "佇列中有 " + n + " 筆待處理交接" : "已開啟探訪佇列 Tab");
      });
    if (window.CmAiCareHelper && $("past-nlq-chips")) {
      CmAiCareHelper.renderNlqChips("past-nlq-chips", function (chip) {
        if (chip.filter === "handover_pending") switchTab("visitation");
        else if (chip.filter === "absence_streak_ge_2") switchTab("alerts");
        else switchTab("groups");
      });
    }
  }

  function syncSidebarFocusB() {
    try {
      var p = global.parent;
      if (!p || p === global) return;
      var sidebarUrl = "church_ministry/sidebar_church_layout_v1.html?focus=b";
      if (global.CmShellPaths && global.CmShellPaths.isCmIndexShell && global.CmShellPaths.isCmIndexShell(p)) {
        sidebarUrl = "sidebar_church_layout_v1.html?focus=b";
      }
      if (typeof p.bible100ShellNav === "function") {
        p.bible100ShellNav(null, { sidebarUrl: sidebarUrl });
        return;
      }
      p.postMessage({ type: "bible100-shell", sidebarUrl: sidebarUrl }, "*");
    } catch (eS) {}
  }

  async function init() {
    syncSidebarFocusB();
    var H = global.PastoralDataHub;
    if (H) {
      try {
        if (global.ChurchDataBridge && global.ChurchDataBridge.whenReady) {
          await global.ChurchDataBridge.whenReady({ timeoutMs: 8000 });
        }
      } catch (eW) {}
      if (H.migratePastoralStores) H.migratePastoralStores();
    }
    bindToolbar();
    bindOverviewClicks();
    bindPostMessage();
    switchTab(resolveInitialTab());
  }

  global.PastoralIntegratedShell = {
    switchTab: switchTab,
    renderOverview: renderOverview,
    notifyParentTab: notifyParentTab
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
