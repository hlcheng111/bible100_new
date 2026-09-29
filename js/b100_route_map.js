/**
 * B100 · 代码路线图渲染（真实 href · 与侧栏 SSOT 同色）
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

  function linkFromNav(nav) {
    if (!nav) return null;
    if (typeof global.B100_navLinkAttrs === "function") {
      return global.B100_navLinkAttrs(nav);
    }
    var resolved = global.B100_resolveNav ? global.B100_resolveNav(nav) : nav;
    return { href: resolved.contentUrl || "#", onclick: "" };
  }

  function renderNavAnchor(label, nav, className, innerHtml) {
    var lk = linkFromNav(nav);
    if (!lk || !lk.href || lk.href === "#") {
      return '<span class="' + className + '">' + (innerHtml || esc(label)) + "</span>";
    }
    var onclick = lk.onclick ? ' onclick="' + esc(lk.onclick) + '"' : "";
    return (
      '<a href="' +
      esc(lk.href) +
      '" class="' +
      className +
      '"' +
      onclick +
      ">" +
      (innerHtml || esc(label)) +
      "</a>"
    );
  }

  function renderBranches(branches) {
    if (!branches || !branches.length) return "";
    var html =
      '<details class="b100-route-branch-pack"><summary class="b100-route-branch-pack__sum">▸ 分支（' +
      branches.length +
      '）</summary><ul class="b100-route-branches">';
    branches.forEach(function (b) {
      html += "<li>";
      html += renderNavAnchor(
        b.label,
        b.nav,
        "b100-route-branch " + toneClass("b100-route-branch", b.tone),
        "<strong>" + esc(b.label) + "</strong>"
      );
      html += "</li>";
    });
    html += "</ul></details>";
    return html;
  }

  function renderStation(st) {
    var nav = st.nav || null;
    var cls =
      "b100-route-station " +
      toneClass("b100-route-station", st.tone) +
      (st.highlight ? " b100-route-station--highlight" : "") +
      (nav ? " b100-route-station--clickable" : "");
    var badge = st.highlight ? '<span class="b100-route-station__badge">★ 主入口</span>' : "";
    var headInner =
      '<span class="b100-route-station__label">' +
      esc(st.label) +
      '</span><span class="b100-route-station__title">' +
      esc(st.title) +
      "</span>" +
      badge;
    var headHtml = nav
      ? renderNavAnchor(st.title, nav, "b100-route-station__head-link", headInner)
      : '<div class="b100-route-station__head">' + headInner + "</div>";
    if (nav && headHtml.indexOf("b100-route-station__head-link") >= 0) {
      headHtml = '<div class="b100-route-station__head">' + headHtml + "</div>";
    }
    return (
      '<div class="' +
      cls +
      '">' +
      headHtml +
      '<p class="b100-route-station__desc">' +
      st.desc +
      "</p>" +
      renderBranches(st.branches) +
      "</div>"
    );
  }

  function renderMap(mapId, host) {
    var maps = global.B100_ROUTE_MAPS || {};
    var map = maps[mapId];
    if (!map || !host) return;
    var compact =
      host.getAttribute("data-b100-route-map-compact") === "1" ||
      (doc.body && doc.body.getAttribute("data-b100-landing-zone") === "home");
    var html = '<section class="b100-route-screen' + (compact ? " b100-route-screen--compact" : "") + '">';
    if (compact) {
      html +=
        '<p class="b100-route-screen__hint">主線可點擊；有「▸ 分支」請展開（與左欄同色同源）。</p>';
    } else {
      html +=
        '<h2 class="b100-route-screen__title">' +
        esc(map.title) +
        "</h2>" +
        '<p class="b100-route-screen__lead">' +
        map.lead +
        "</p>";
    }
    html += '<div class="b100-route-line">';
    (map.stations || []).forEach(function (st) {
      html += renderStation(st);
    });
    html += "</div></section>";
    host.innerHTML = html;
  }

  function boot() {
    doc.querySelectorAll("[data-b100-route-map]").forEach(function (host) {
      renderMap(host.getAttribute("data-b100-route-map"), host);
    });
  }

  global.B100RouteMap = { render: renderMap };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
