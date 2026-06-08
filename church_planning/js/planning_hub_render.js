/**
 * 健康診斷中心 · 14 工具超市渲染
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderSupermarket(containerId) {
    var host = document.getElementById(containerId || "planning-tool-supermarket");
    var reg = global.PlanningToolRegistry;
    if (!host || !reg || !reg.tools) return;

    var byCat = {};
    reg.tools.forEach(function (t) {
      var c = t.category || "其他";
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(t);
    });

    var order = reg.categoryOrder || [
      "靈命與真理",
      "恩賜與事奉",
      "治理與優先",
      "團隊與關係",
      "文化與戰略",
      "目標衡量",
      "教會健康"
    ];
    var html = "";
    order.forEach(function (cat) {
      var items = byCat[cat];
      if (!items || !items.length) return;
      html += '<section class="ph-cat"><h3 class="ph-cat__title">' + esc(cat) + "</h3><div class=\"ph-grid\">";
      items.forEach(function (t) {
        if (t.sidebarStep3 === false) return;
        var planned = t.status === "planned";
        html +=
          '<a href="#" class="ph-card' +
          (planned ? " ph-card--planned" : "") +
          '" data-tool-id="' +
          esc(t.id) +
          '" onclick="return planningOpenContent(event,' +
          JSON.stringify(t.path) +
          ');">' +
          "<strong>" +
          esc(t.label) +
          (planned ? " · 規劃中" : "") +
          "</strong>" +
          '<span class="ph-card__blurb">' +
          esc(t.blurb) +
          "</span></a>";
      });
      html += "</div></section>";
    });

    host.innerHTML = html;
  }

  global.PlanningHubRender = { renderSupermarket: renderSupermarket };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      renderSupermarket("planning-tool-supermarket");
    });
  } else {
    renderSupermarket("planning-tool-supermarket");
  }
})(typeof window !== "undefined" ? window : this);
