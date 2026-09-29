/**
 * B100 · 模块侧栏顶区：与顶栏② SSOT 同序的快链（study / school / ai）
 */
(function (global, doc) {
  "use strict";

  var RAIL_BUILD = "20260811w3";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function relativeContentHref(contentUrl, modeId) {
    var href = String(contentUrl || "");
    var prefix =
      modeId === "study"
        ? "bible_study/"
        : modeId === "school"
          ? "school_management/"
          : modeId === "ai"
            ? "ai_tools/"
            : "";
    if (prefix && href.indexOf(prefix) === 0) {
      href = href.slice(prefix.length);
    }
    return href;
  }

  function renderRail(modeId) {
    var Nav = global.B100ModuleNavSsot;
    if (!Nav || !Nav.moduleById) return;
    var mod = Nav.moduleById(modeId);
    if (!mod || !mod.zones || !mod.zones.length) return;

    var host = doc.querySelector(".sidebar") || doc.querySelector(".sidebar-container");
    if (!host || doc.getElementById("b100-sidebar-ssot-rail")) return;

    var nav = doc.createElement("nav");
    nav.id = "b100-sidebar-ssot-rail";
    nav.className = "b100-sidebar-ssot-rail";
    nav.setAttribute("aria-label", mod.labelZh + " zones");

    var zones = mod.zones.slice();
    if (modeId === "school") {
      zones = zones.filter(function (z) {
        return z.topBar !== false;
      });
    }

    var inner =
      '<details open class="b100-sidebar-ssot-rail__block">' +
      '<summary class="b100-sidebar-ssot-rail__sum">' +
      '<span class="b100-label"><span class="b100-label__zh">↔ 頂欄分區</span>' +
      '<span class="b100-label__en">Top bar zones</span></span>' +
      "</summary><div class=\"b100-sidebar-ssot-rail__links\">";

    zones.forEach(function (z) {
      var pair = Nav.shellPairForFocus(modeId, z.id);
      if (!pair || !pair.contentUrl) return;
      var href = relativeContentHref(pair.contentUrl, modeId);
      inner +=
        '<a href="' +
        esc(href) +
        '" data-b100-nav="content" class="sidebar-item b100-sidebar-ssot-rail__link" data-b100-ssot-zone="' +
        esc(z.id) +
        '">' +
        '<span class="b100-label b100-label--inline">' +
        '<span class="b100-label__zh">' +
        esc(z.labelZh) +
        "</span>" +
        '<span class="b100-label__en">' +
        esc(z.labelEn || "") +
        "</span></span></a>";
    });

    inner += "</div></details>";
    nav.innerHTML = inner;
    host.insertBefore(nav, host.firstChild);
  }

  function boot() {
    var modeId =
      (doc.body && doc.body.getAttribute("data-b100-module-focus-mode")) || "";
    if (!modeId) return;
    renderRail(modeId);
  }

  global.B100SidebarSsotRail = {
    RAIL_BUILD: RAIL_BUILD,
    renderRail: renderRail,
    boot: boot,
  };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
