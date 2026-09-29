/**
 * G 規劃行政 · 三層側欄（戰略規劃依類別 · 行政管理四主線）
 * Do 命名只讀 js/g_do_admin_menu_ssot.js
 */
(function (global) {
  "use strict";

  var DO_CRM_FROM = "planning_g_admin";
  var MENU_BUILD = "20260804d";

  var CATEGORY_META = {
    "靈命與真理": { num: "①", en: "Spiritual Life" },
    "恩賜與事奉": { num: "②", en: "Gifts & Ministry" },
    "治理與優先": { num: "③", en: "Governance" },
    "團隊與關係": { num: "④", en: "Team & Relations" },
    "文化與戰略": { num: "⑤", en: "Culture & Strategy" },
    "目標衡量": { num: "⑥", en: "Goals & Metrics" },
    "教會健康": { num: "⑦", en: "Church Health" }
  };

  function menu() {
    return global.GDoAdminMenu || null;
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function doOnclick(contentRel) {
    return (
      "return planningOpenDo(event," +
      JSON.stringify(contentRel) +
      ",{crmFrom:" +
      JSON.stringify(DO_CRM_FROM) +
      "});"
    );
  }

  function planOnclick(planPath) {
    return "return planningOpenContent(event," + JSON.stringify(planPath) + ");";
  }

  function itemSubline(item) {
    var M = menu();
    if (M && M.sublineHtml) return M.sublineHtml(item);
    return item && item.en ? '<small class="sb-g-en">' + esc(item.en) + "</small>" : "";
  }

  function doLink(item, extraClass) {
    var M = menu();
    if (!M || !item) return "";
    var href = M.sidebarContentHref(item, DO_CRM_FROM);
    var rootRel = M.rootRelPath(item, DO_CRM_FROM);
    var cls =
      "sidebar-item sidebar-item--sub sidebar-item--admin" +
      (extraClass || "") +
      (item.primary ? " sidebar-item--do-primary" : "");
    return (
      '<a href="' +
      esc(href) +
      '" target="contentFrame" class="' +
      cls.trim() +
      '" title="' +
      esc(item.en || item.label) +
      '" onclick="' +
      doOnclick(rootRel) +
      '"><strong>' +
      esc(item.label) +
      "</strong>" +
      itemSubline(item) +
      "</a>"
    );
  }

  function planLandingLink(item) {
    var M = menu();
    if (!M || !item || !item.planPath) return "";
    var href = M.sidebarContentHref(item, DO_CRM_FROM);
    return (
      '<a href="' +
      esc(href) +
      '" target="contentFrame" class="sidebar-item sidebar-item--landing sidebar-item--admin" title="' +
      esc(item.en || item.label) +
      '" onclick="' +
      planOnclick(item.planPath) +
      '"><strong>' +
      esc(item.label) +
      "</strong>" +
      itemSubline(item) +
      "</a>"
    );
  }

  function renderAdminFolder(host) {
    if (!host) return;
    var M = menu();
    if (!M) {
      host.innerHTML =
        '<p class="sb-g-empty">Do 選單載入中…（若持續空白請 Ctrl+F5）</p>';
      return;
    }

    host.setAttribute("data-do-menu-build", MENU_BUILD);

    var html = "";
    html += planLandingLink(M.itemById("landing"));
    html += doLink(M.itemById("dashboard"), " sidebar-item--do-primary");

    M.FLAT.forEach(function (item) {
      if (item.group) return;
      if (item.id === "landing" || item.id === "dashboard") return;
      html += doLink(item);
    });

    html +=
      '<details class="sidebar-step sb-g-admin-sub" data-admin="shift">' +
      "<summary>" +
      M.groupSummaryHtml(M.GROUPS.shift) +
      "</summary>" +
      doLink(M.itemById("shift_roster")) +
      doLink(M.itemById("shift_leave")) +
      "</details>";

    html +=
      '<details class="sidebar-step sb-g-admin-sub" data-admin="finance">' +
      "<summary>" +
      M.groupSummaryHtml(M.GROUPS.finance) +
      "</summary>" +
      doLink(M.itemById("finance_tx")) +
      doLink(M.itemById("finance_budget")) +
      "</details>";

    host.innerHTML = html;
  }

  function toolLabel(t) {
    var labels = global.PlanningSidebarLabels;
    if (labels && labels.displayLabel) return labels.displayLabel(t);
    return t.sidebarLabel || t.label || t.id || "";
  }

  function toolHint(t) {
    var labels = global.PlanningSidebarLabels;
    if (labels && labels.displayEn) {
      var en = labels.displayEn(t);
      if (en) return en;
    }
    return t.sidebarEn || "";
  }

  function renderPlanCategories(host) {
    if (!host) return;
    var reg = global.PlanningToolRegistry;
    if (!reg || !reg.canonicalTools) {
      host.innerHTML = '<p class="sb-g-empty">量表索引載入中…</p>';
      return;
    }
    var order = reg.categoryOrder || [];
    var byCat = {};
    (reg.tools || [])
      .filter(function (t) {
        return t.tier !== "extended" && t.status !== "planned";
      })
      .forEach(function (t) {
        var cat = t.category || "其他";
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(t);
      });

    var html = order
      .filter(function (cat) {
        return byCat[cat] && byCat[cat].length;
      })
      .map(function (cat) {
        var meta = CATEGORY_META[cat] || { num: "·", en: cat };
        var tools = byCat[cat];
        var toolLinks = tools
          .map(function (t) {
            var hint = toolHint(t);
            return (
              '<a href="' +
              esc(t.path) +
              '" target="contentFrame" class="sidebar-item sidebar-item--sub sidebar-item--tool" data-tool-id="' +
              esc(t.id) +
              '"><strong>' +
              esc(toolLabel(t)) +
              "</strong>" +
              (hint ? '<small class="sb-g-en">' + esc(hint) + "</small>" : "") +
              "</a>"
            );
          })
          .join("");
        return (
          '<details class="sidebar-step sb-g-cat" data-g-cat="' +
          esc(cat) +
          '">' +
          '<summary class="sb-g-cat__summary">' +
          '<span class="sb-g-cat__num">' +
          esc(meta.num) +
          "</span>" +
          "<span><strong>" +
          esc(cat) +
          '</strong><small class="sb-g-cat__en">' +
          esc(meta.en) +
          " · " +
          tools.length +
          " 項</small></span>" +
          "</summary>" +
          toolLinks +
          "</details>"
        );
      })
      .join("");

    host.innerHTML = html || '<p class="sb-g-empty">尚無量表</p>';
  }

  function boot() {
    renderPlanCategories(document.getElementById("sb-plan-categories"));
    if (!menu()) {
      global.setTimeout(boot, 40);
      return;
    }
    renderAdminFolder(document.getElementById("sb-admin-root"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.PlanningSidebarGMenu = {
    renderPlanCategories: renderPlanCategories,
    renderAdminFolder: renderAdminFolder,
    renderAdminMenu: renderAdminFolder,
    CATEGORY_META: CATEGORY_META,
    DO_CRM_FROM: DO_CRM_FROM,
    MENU_BUILD: MENU_BUILD
  };
})(typeof window !== "undefined" ? window : this);
