/**
 * B100 · L1 landing Tab（与侧栏 SSOT 同源）
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toneClass(prefix, tone) {
    return tone ? prefix + "--tone-" + tone : "";
  }

  function runNav(nav, e) {
    if (!nav) return false;
    if (typeof global.B100_resolveNav === "function") {
      nav = global.B100_resolveNav(nav);
    }
    if (typeof global.b100ShellRouteNav === "function") {
      return global.b100ShellRouteNav(nav, e);
    }
    return false;
  }

  function renderBranchLinks(branches) {
    if (!branches || !branches.length) return "";
    var html = '<ul class="b100-landing-tabs__branches">';
    branches.forEach(function (b) {
      html +=
        '<li><a href="#" class="b100-landing-tabs__branch ' +
        toneClass("b100-landing-tabs__branch", b.tone) +
        '" data-b100-route-nav="' +
        esc(JSON.stringify(b.nav || {})) +
        '">' +
        esc(b.label) +
        "</a></li>";
    });
    html += "</ul>";
    return html;
  }

  function renderPanel(mod, index, active) {
    var nav = mod.nav ? JSON.parse(JSON.stringify(mod.nav)) : null;
    if (typeof global.B100_resolveNav === "function" && nav) {
      nav = global.B100_resolveNav(nav);
    }
    var enterBtn = nav
      ? '<p class="b100-landing-tabs__enter"><a href="#" class="b100-landing-tabs__cta" data-b100-route-nav="' +
        esc(JSON.stringify(mod.nav || {})) +
        '">→ 进入主入口</a></p>'
      : "";
    return (
      '<div class="b100-landing-tabs__panel' +
      (active ? " b100-landing-tabs__panel--active" : "") +
      '" role="tabpanel" id="b100-tab-panel-' +
      index +
      '" data-tab-index="' +
      index +
      '">' +
      '<p class="b100-landing-tabs__panel-desc">' +
      esc(mod.desc || "") +
      "</p>" +
      renderBranchLinks(mod.children) +
      enterBtn +
      "</div>"
    );
  }

  function bindTabs(root, modules) {
    var tabs = root.querySelectorAll(".b100-landing-tabs__tab");
    var panels = root.querySelectorAll(".b100-landing-tabs__panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        var idx = tab.getAttribute("data-tab-index");
        tabs.forEach(function (t) {
          t.classList.toggle("b100-landing-tabs__tab--active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("b100-landing-tabs__panel--active", p.getAttribute("data-tab-index") === idx);
        });
      });
    });
    root.querySelectorAll("[data-b100-route-nav]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        try {
          var nav = JSON.parse(el.getAttribute("data-b100-route-nav") || "{}");
          runNav(nav, e);
        } catch (err) {}
      });
    });
  }

  function renderLandingTabs(container) {
    var key = container.getAttribute("data-b100-landing-tabs");
    if (!key) return;
    var trees = global.B100_SIDEBAR_TREES || {};
    var tree = trees[key];
    if (!tree || !tree.modules || !tree.modules.length) return;

    var route = tree.route || {};
    var modules = tree.modules;
    var html =
      '<section class="b100-landing-tabs ' +
      toneClass("b100-landing-tabs", tree.home && tree.home.tone) +
      '">';
    if (route.title) {
      html += '<h2 class="b100-landing-tabs__title">' + esc(route.title) + "</h2>";
    }
    if (route.lead) {
      html += '<p class="b100-landing-tabs__lead">' + route.lead + "</p>";
    }
    html += '<div class="b100-landing-tabs__bar" role="tablist">';
    modules.forEach(function (mod, i) {
      var label = mod.stationLabel || mod.label;
      html +=
        '<button type="button" class="b100-landing-tabs__tab ' +
        toneClass("b100-landing-tabs__tab", mod.tone) +
        (mod.highlight ? " b100-landing-tabs__tab--highlight" : "") +
        (i === 0 ? " b100-landing-tabs__tab--active" : "") +
        '" role="tab" aria-selected="' +
        (i === 0 ? "true" : "false") +
        '" data-tab-index="' +
        i +
        '">' +
        esc(label) +
        "</button>";
    });
    html += '</div><div class="b100-landing-tabs__panels">';
    modules.forEach(function (mod, i) {
      html += renderPanel(mod, i, i === 0);
    });
    html += "</div></section>";
    container.innerHTML = html;
    bindTabs(container, modules);
  }

  function init() {
    doc.querySelectorAll("[data-b100-landing-tabs]").forEach(renderLandingTabs);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.B100_renderLandingTabs = renderLandingTabs;
})(typeof window !== "undefined" ? window : this, document);
