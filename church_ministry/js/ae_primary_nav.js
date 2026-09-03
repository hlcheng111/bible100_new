/**
 * A–E primary 頁頂部導航條（回日常工作 · 本區側欄）
 * body 需 data-b100-ae-zone="a|b|c|d|e|f"
 */
(function (doc, win) {
  "use strict";

  var ZONES = {
    a: {
      emoji: "🎼",
      label: "A · 敬拜",
      role: "staff",
      step: 0,
      path: "modules/worship/worship-integrated.html",
      focus: "a"
    },
    b: {
      emoji: "👥",
      label: "B · 牧養探訪",
      role: "staff",
      step: 5,
      path: "modules/support/visitation_index.html",
      focus: "b"
    },
    c: {
      emoji: "📚",
      label: "C · 教育培訓",
      role: "teacher",
      step: 0,
      path: "modules/education/education-integrated.html",
      focus: "c"
    },
    d: {
      emoji: "🌍",
      label: "D · 外展差傳",
      role: "staff",
      step: 2,
      path: "modules/expansion/outreach-strategy.html",
      focus: "d"
    },
    e: {
      emoji: "🤝",
      label: "E · 社會服務",
      role: "staff",
      step: 3,
      path: "tools/volunteer_shift/index.html",
      focus: "e"
    },
    f: {
      emoji: "⚙️",
      label: "F · 行政",
      role: "leader",
      step: 1,
      path: "dashboard.html",
      focus: "f"
    }
  };

  function shouldHideInHub() {
    if (win.B100HubEmbed && win.B100HubEmbed.shouldHideChrome) {
      return win.B100HubEmbed.shouldHideChrome();
    }
    try {
      if (win.parent && win.parent !== win && win.frameElement) {
        var n = win.frameElement.id || win.frameElement.getAttribute("name") || "";
        return n === "contentFrame";
      }
    } catch (eHub) { /* ignore */ }
    return false;
  }

  function inject() {
    if (shouldHideInHub()) return;
    var zoneId = (doc.body && doc.body.getAttribute("data-b100-ae-zone")) || "";
    var z = ZONES[zoneId];
    if (!z || doc.getElementById("ae-primary-nav-strip")) return;

    var strip = doc.createElement("div");
    strip.id = "ae-primary-nav-strip";
    strip.className = "ae-primary-nav-strip";
    strip.setAttribute("role", "navigation");
    strip.setAttribute("aria-label", "日常與本區導航");

    var prefix = doc.body.getAttribute("data-b100-ae-prefix");
    if (prefix === null || prefix === undefined) prefix = "../../";
    if (prefix && prefix !== "" && prefix.charAt(prefix.length - 1) !== "/") {
      prefix = prefix + "/";
    }

    var shell = typeof win.bible100ShellNav === "function";
    var homeOnclick = shell
      ? "return bible100ShellNav(event,{sidebarUrl:'church_ministry/sidebar_church_layout_v1.html?focus=f',contentUrl:'church_ministry/dashboard.html'});"
      : "";
    var layoutSidebar =
      z.focus === "a"
        ? "church_ministry/sidebar_worship_journey.html"
        : "church_ministry/sidebar_church_layout_v1.html?focus=" + z.focus;
    var layoutOnclick = shell
      ? "return bible100ShellNav(event,{sidebarUrl:'" +
        layoutSidebar +
        "',contentUrl:'church_ministry/" +
        z.path +
        "'});"
      : "";

    strip.innerHTML =
      '<span class="ae-nav-zone">' +
      z.emoji +
      " " +
      z.label +
      "</span>" +
      (homeOnclick
        ? '<a href="#" onclick="' +
          homeOnclick +
          '">🟩 回日常工作</a>'
        : '<a href="' +
          prefix +
          'dashboard.html">🟩 回日常工作</a>') +
      (layoutOnclick
        ? '<a href="#" class="ae-nav-muted" onclick="' +
          layoutOnclick +
          '">📂 本區完整側欄</a>'
        : "") +
      '<a href="' +
      prefix +
      'load_central_member_seed.html?crm_from=sidebar&amp;role=' +
      encodeURIComponent(z.role) +
      '" class="ae-nav-muted" target="_parent">📥 載入試用會友</a>';

    doc.body.insertBefore(strip, doc.body.firstChild);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  win.AePrimaryNav = { zones: ZONES, inject: inject };
})(document, window);
