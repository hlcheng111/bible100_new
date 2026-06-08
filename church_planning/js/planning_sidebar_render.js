/**
 * 教會規劃側欄 · 各項工具量表（依 registry 小分類渲染；* = 規劃中／待建頁）
 */
(function (global) {
  "use strict";

  var TARGETS = ["planning-sidebar-tools-top", "planning-sidebar-tools-step2"];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderSidebarTools(containerId) {
    var host = document.getElementById(containerId);
    var reg = global.PlanningToolRegistry;
    if (!host || !reg || !reg.tools) return;

    var byCat = {};
    reg.tools.forEach(function (t) {
      if (t.sidebarStep3 === false) return;
      var c = t.category || "其他";
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(t);
    });

    var order = reg.categoryOrder || [];
    var html = "";
    order.forEach(function (cat) {
      var items = byCat[cat];
      if (!items || !items.length) return;
      html += '<p class="sidebar-cat-title">' + esc(cat) + "</p>";
      items.forEach(function (t) {
        var planned = t.status === "planned";
        html +=
          '<a href="' +
          esc(t.path) +
          '" class="sidebar-item sidebar-item--sub' +
          (planned ? " sidebar-item--planned" : "") +
          '" data-b100-path="church_planning/' +
          esc(t.path) +
          '" onclick="return planningOpenByToolId(event,' +
          JSON.stringify(t.id) +
          ');">' +
          "<strong>" +
          esc(t.label) +
          (planned ? " *" : "") +
          "</strong>" +
          "<small>" +
          esc(t.blurb) +
          "</small></a>";
      });
    });

    host.innerHTML = html;
  }

  function renderAll() {
    TARGETS.forEach(renderSidebarTools);
  }

  global.PlanningSidebarRender = {
    renderSidebarTools: renderSidebarTools,
    renderAll: renderAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})(typeof window !== "undefined" ? window : this);
