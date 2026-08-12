/**
 * B100 · 模块侧栏 focus 折疊（范本：cm_sidebar_zone_render.js）
 */
(function (global, doc) {
  "use strict";

  var FOCUS_BUILD = "20260812data";

  var FOCUS_LABELS = {
    study: {
      home: "路線圖",
      track: "聖經跑道",
      tools: "核心捷徑",
      versions: "聖經版本",
      commentary: "釋經參讀",
      geo: "地理歷史",
    },
    school: {
      home: "路線圖",
      workbench: "教務工作台",
      enrollment: "A 招生入學",
      academic: "B 學籍教務",
      graduation: "結業登記",
    },
    ai: {
      home: "路線總覽",
      workbench: "備課創作工作台",
      ministry: "事工 AI 应用",
      plan: "規劃落地 Plan",
      teach: "備課創作工作台",
      create: "備課創作工作台",
      learn: "備課創作工作台",
      serve: "事工 AI 应用",
      smart: "事工 AI 应用",
      lab: "備課創作工作台",
    },
  };

  function getFocus() {
    var raw = "";
    try {
      raw = global.location.search || "";
      if (!raw && global.location.href) {
        var m = String(global.location.href).match(/[?&]focus=([^&#]+)/i);
        if (m) raw = "?focus=" + m[1];
      }
      return String(new URLSearchParams(raw).get("focus") || "").toLowerCase();
    } catch (e) {
      try {
        var m2 = String(global.location.href || "").match(/[?&]focus=([^&#]+)/i);
        return m2 ? decodeURIComponent(m2[1]).toLowerCase() : "";
      } catch (e2) {
        return "";
      }
    }
  }

  function getModeId() {
    var body = doc.body;
    if (body && body.getAttribute("data-b100-module-focus-mode")) {
      return body.getAttribute("data-b100-module-focus-mode");
    }
    var Nav = global.B100ModuleNavSsot;
    if (Nav && Nav.detectModeFromPath) {
      return Nav.detectModeFromPath(global.location.pathname || "") || "";
    }
    return "";
  }

  function shellNavPair(sidebarUrl, contentUrl) {
    if (typeof global.bible100ShellNav === "function") {
      return global.bible100ShellNav(null, {
        sidebarUrl: sidebarUrl,
        contentUrl: contentUrl,
      });
    }
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(
          {
            type: "b100-shell",
            sidebarUrl: sidebarUrl,
            contentUrl: contentUrl,
          },
          "*"
        );
        return true;
      }
    } catch (eP) {}
    return false;
  }

  function navFocusZone(modeId, zoneId) {
    var Nav = global.B100ModuleNavSsot;
    if (!Nav || !Nav.shellPairForFocus) return false;
    var pair = Nav.shellPairForFocus(modeId, zoneId);
    if (!pair) return false;
    return shellNavPair(pair.sidebarUrl, pair.contentUrl);
  }

  function navFullMap(modeId) {
    var Nav = global.B100ModuleNavSsot;
    if (!Nav) return false;
    var mod = Nav.moduleById(modeId);
    if (!mod) return false;
    var base = mod.sidebar.split("?")[0];
    return shellNavPair(base, mod.defaultContent);
  }

  function focusLabel(modeId, focus) {
    var map = FOCUS_LABELS[modeId] || {};
    return map[focus] || focus;
  }

  function renderFocusBanner(modeId, focus) {
    var host = doc.getElementById("b100-focus-banner");
    if (!host) {
      host = doc.createElement("div");
      host.id = "b100-focus-banner";
      var sidebar = doc.querySelector(".sidebar") || doc.querySelector(".sidebar-container");
      if (sidebar && sidebar.firstChild) {
        sidebar.insertBefore(host, sidebar.firstChild);
      } else if (sidebar) {
        sidebar.appendChild(host);
      } else {
        doc.body.insertBefore(host, doc.body.firstChild);
      }
    }
    if (!focus) {
      host.style.display = "none";
      host.innerHTML = "";
      return;
    }
    host.style.display = "block";
    host.className = "b100-focus-banner";
    host.innerHTML =
      "📌 目前分區：<strong>" +
      focusLabel(modeId, focus) +
      "</strong> · 其餘區已收合 · 點標題可切換";
  }

  function applyFocusUi(focus) {
    var sections = doc.querySelectorAll("[data-b100-focus-zone]");
    sections.forEach(function (sec) {
      var zone = String(sec.getAttribute("data-b100-focus-zone") || "").toLowerCase();
      sec.classList.remove("b100-focus-zone--active", "b100-focus-zone--collapsed");
      if (!focus) return;
      if (zone === focus) {
        sec.classList.add("b100-focus-zone--active");
        sec.querySelectorAll("details").forEach(function (d) {
          if (sec.getAttribute("data-b100-focus-open-details") === "1") {
            d.open = true;
          }
        });
      } else {
        sec.classList.add("b100-focus-zone--collapsed");
      }
    });
  }

  function renderFooter(modeId, focus) {
    var host = doc.getElementById("b100-focus-footer");
    if (!host) {
      host = doc.createElement("div");
      host.id = "b100-focus-footer";
      var sidebar = doc.querySelector(".sidebar") || doc.querySelector(".sidebar-container") || doc.body;
      sidebar.appendChild(host);
    }
    if (!focus) {
      host.innerHTML = "";
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML =
      '<a href="#" class="b100-focus-expand" data-b100-focus-expand="1" title="Show full sidebar">' +
      "📋 展開全區選單<small> · Full map</small></a>";
  }

  function bindHandlers(modeId) {
    doc.addEventListener(
      "click",
      function (ev) {
        var expand = ev.target.closest("[data-b100-focus-expand]");
        if (expand) {
          ev.preventDefault();
          ev.stopPropagation();
          navFullMap(modeId);
          return;
        }
        var sw = ev.target.closest("[data-b100-focus-switch]");
        if (sw) {
          ev.preventDefault();
          ev.stopPropagation();
          navFocusZone(modeId, sw.getAttribute("data-b100-focus-switch"));
          return;
        }
        var collapsedHead = ev.target.closest(
          ".b100-focus-zone--collapsed h3, .b100-focus-zone--collapsed .b100-focus-head"
        );
        if (collapsedHead) {
          var sec = collapsedHead.closest("[data-b100-focus-zone]");
          if (sec) {
            ev.preventDefault();
            ev.stopPropagation();
            navFocusZone(modeId, sec.getAttribute("data-b100-focus-zone"));
          }
        }
      },
      true
    );
  }

  function boot() {
    var modeId = getModeId();
    if (!modeId) return;
    var focus = getFocus();
    applyFocusUi(focus);
    renderFocusBanner(modeId, focus);
    renderFooter(modeId, focus);
    bindHandlers(modeId);
    doc.documentElement.setAttribute("data-b100-focus-build", FOCUS_BUILD);
    if (doc.body) {
      doc.body.setAttribute("data-b100-focus-active", focus || "");
    }
  }

  global.B100ModuleSidebarFocus = {
    FOCUS_BUILD: FOCUS_BUILD,
    boot: boot,
    getFocus: getFocus,
    navFocusZone: navFocusZone,
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
