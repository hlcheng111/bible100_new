/**
 * 教會規劃側欄 · 小白路牌（Phase 1–3 動態解鎖；無六步、無 Legacy）
 */
(function (global) {
  "use strict";

  var PROFILES = [
    {
      id: "planning",
      canonicalHosts: ["planning-sidebar-tools-top", "planning-sidebar-tools-step2"],
      extendedHost: "planning-sidebar-tools-extended",
      linkMode: "planning",
      pathPrefix: "",
      noviceMode: false
    },
    {
      id: "cm",
      canonicalHosts: ["cm-g-phase-tools"],
      extendedHost: null,
      linkMode: "b100",
      pathPrefix: "../church_planning/",
      noviceMode: true
    }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function labels() {
    return global.PlanningSidebarLabels || {};
  }

  function displayLabel(t) {
    var L = labels();
    return L.displayLabel ? L.displayLabel(t) : t.label || t.id;
  }

  function displaySub(t) {
    var L = labels();
    if (L && L.landingHint) return L.landingHint(t);
    return L.displayEn ? L.displayEn(t) : "";
  }

  function gate() {
    return global.PlanningPhaseGate;
  }

  function toolsForNoviceSidebar(reg) {
    var cfg = global.PlanningPhaseConfig;
    var g = gate();
    if (!reg || !cfg || !g) return [];

    var ids = [];
    if (g.isPhaseUnlocked(2)) {
      ids = ids.concat(cfg.PHASE2_TOOL_IDS || []);
      ids.push("raci");
    }
    if (g.isPhaseUnlocked(3)) {
      ids = ids.concat(cfg.PHASE3_TOOL_IDS || []);
    }

    var seen = {};
    return ids
      .filter(function (id) {
        if (seen[id]) return false;
        seen[id] = true;
        return true;
      })
      .map(function (id) {
        return reg.byId[id];
      })
      .filter(Boolean);
  }

  function toolHref(t, profile) {
    return profile.pathPrefix + t.path;
  }

  function renderToolLink(t, profile) {
    if (!t || t.status === "planned" || t.tier === "extended") return "";

    var href = toolHref(t, profile);
    var sub = displaySub(t);
    var small = sub ? "<small>" + esc(sub) + "</small>" : "";

    if (profile.linkMode === "b100") {
      return (
        '<a href="' +
        esc(href) +
        '" data-b100-nav="content" class="sidebar-item submenu-item">' +
        esc(displayLabel(t)) +
        small +
        "</a>"
      );
    }

    return (
      '<a href="' +
      esc(t.path) +
      '" class="sidebar-item sidebar-item--sub submenu-item" data-b100-path="church_planning/' +
      esc(t.path) +
      '" onclick="return planningOpenByToolId(event,' +
      JSON.stringify(t.id) +
      ');">' +
      esc(displayLabel(t)) +
      small +
      "</a>"
    );
  }

  function renderFlatTools(host, tools, profile) {
    if (!host) return;
    if (!tools || !tools.length) {
      host.innerHTML = "";
      return;
    }
    var html = "";
    tools.forEach(function (t) {
      html += renderToolLink(t, profile);
    });
    host.innerHTML = html;
  }

  function sidebarStep2Tools(reg) {
    if (reg && typeof reg.toolsForSidebarStep2 === "function") {
      var list = reg.toolsForSidebarStep2();
      if (list && list.length) return list;
    }
    return reg && reg.canonicalTools ? reg.canonicalTools() : [];
  }

  function extendedForSidebar(list) {
    return (list || []).filter(function (t) {
      return !t.sidebarHidden;
    });
  }

  function renderProfile(profile) {
    var reg = global.PlanningToolRegistry;
    if (!reg) return;

    var tools;
    if (profile.noviceMode) {
      tools = toolsForNoviceSidebar(reg);
    } else {
      tools = sidebarStep2Tools(reg);
    }

    profile.canonicalHosts.forEach(function (hostId) {
      var host = document.getElementById(hostId);
      if (host) renderFlatTools(host, tools, profile);
    });

    if (profile.noviceMode) {
      var fold = document.getElementById("cm-g-unlocked-tools");
      if (fold) {
        fold.hidden = !tools || !tools.length;
      }
    }

    if (profile.extendedHost && reg.extended) {
      var extHost = document.getElementById(profile.extendedHost);
      if (extHost) {
        renderFlatTools(extHost, extendedForSidebar(reg.extended), profile);
      }
    }
  }

  function renderProgressStrip(hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    var g = gate();
    var hint = "請先填「13 題靈命快評」";
    if (g && g.getJourneyState) {
      var s = g.getJourneyState();
      var p = g.phase1Progress ? g.phase1Progress() : { done: 0, total: 3 };
      if (!s.phase1Done && p.done === 0) {
        hint = "請先填「13 題靈命快評」";
      } else if (!s.phase1Done) {
        hint = "第一階段進行中（" + p.done + "/" + p.total + "）";
      } else if (!s.warRoomScanned) {
        hint = "體檢已完成，請到戰情室看結果";
      } else if (!s.phase3Unlocked) {
        hint = "可到診斷中心解鎖更多工具";
      } else {
        hint = "三階段已解鎖，按需選工具";
      }
    }
    host.innerHTML =
      '<p class="cm-g-progress"><span class="cm-g-progress__text">' + esc(hint) + "</span></p>";
  }

  function renderAll() {
    if (global.PlanningSidebarLabels && global.PlanningSidebarLabels.applyToRegistry) {
      global.PlanningSidebarLabels.applyToRegistry();
    }
    PROFILES.forEach(renderProfile);
    renderProgressStrip("cm-g-progress-strip");
  }

  global.PlanningSidebarRender = {
    renderFlatTools: renderFlatTools,
    renderProfile: renderProfile,
    renderAll: renderAll,
    renderProgressStrip: renderProgressStrip,
    toolsForNoviceSidebar: toolsForNoviceSidebar,
    sidebarStep2Tools: sidebarStep2Tools
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})(typeof window !== "undefined" ? window : this);
