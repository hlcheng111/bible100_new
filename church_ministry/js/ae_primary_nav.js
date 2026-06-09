/**
 * A–E primary 頁頂部導航條（回 CRM 旅程 · 本區側欄）
 * body 需 data-b100-ae-zone="a|b|c|d|e"
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
      emoji: "⚙️",
      label: "E · 行政支援",
      role: "leader",
      step: 1,
      path: "dashboard.html",
      focus: "admin"
    }
  };

  function hubUrl(role) {
    var base = "guide_crm_journey_hub.html?tab=journey";
    if (role === "leader") return "guide_crm_journey_hub.html?tab=vision&role=leader";
    return base + "&role=" + encodeURIComponent(role || "staff");
  }

  function inject() {
    var zoneId = (doc.body && doc.body.getAttribute("data-b100-ae-zone")) || "";
    var z = ZONES[zoneId];
    if (!z || doc.getElementById("ae-primary-nav-strip")) return;

    var strip = doc.createElement("div");
    strip.id = "ae-primary-nav-strip";
    strip.className = "ae-primary-nav-strip";
    strip.setAttribute("role", "navigation");
    strip.setAttribute("aria-label", "CRM 與本區導航");

    var prefix = doc.body.getAttribute("data-b100-ae-prefix");
    if (prefix === null || prefix === undefined) prefix = "../../";
    if (prefix && prefix !== "" && prefix.charAt(prefix.length - 1) !== "/") {
      prefix = prefix + "/";
    }

    var shell = typeof win.bible100ShellNav === "function";
    var crmOnclick = shell
      ? "return bible100ShellNav(event,{sidebarUrl:'church_ministry/sidebar_crm_journey.html',contentUrl:'church_ministry/" +
        hubUrl(z.role) +
        "'});"
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
      (crmOnclick
        ? '<a href="#" onclick="' +
          crmOnclick +
          '">🗺️ 回 CRM 旅程</a>'
        : '<a href="' +
          prefix +
          "guide_crm_journey_hub.html?tab=journey&amp;role=" +
          encodeURIComponent(z.role) +
          '">🗺️ 回 CRM 旅程</a>') +
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
