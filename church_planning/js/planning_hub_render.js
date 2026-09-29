/**
 * 健康診斷中心 · 三階段解鎖面板（小白：無 blurb、無 Legacy 超市）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function labels() {
    return global.PlanningSidebarLabels || {};
  }

  function cardLabel(t) {
    var L = labels();
    return L.displayLabel ? L.displayLabel(t) : t.label || t.id;
  }

  function cardHint(t) {
    var L = labels();
    return L.landingHint ? L.landingHint(t) : "";
  }

  function renderToolCards(items, opts) {
    opts = opts || {};
    var html = "";
    items.forEach(function (t) {
      if (!t || t.tier === "extended") return;
      var planned = t.status === "planned";
      var onclick = "return planningOpenByToolId(event," + JSON.stringify(t.id) + ");";
      var featured = t.id === "spiritual" ? " pp-phase-card--featured" : "";
      var heavy = t.id === "ncd" ? '<span class="pp-badge-heavy">大表 · 建議 HTTP/Wi-Fi</span>' : "";
      var hint = cardHint(t);
      html +=
        '<a href="#" class="ph-card pp-phase-card' +
        (planned ? " ph-card--planned" : "") +
        featured +
        '" data-tool-id="' +
        esc(t.id) +
        '" onclick="' +
        onclick +
        '">' +
        "<strong>" +
        esc(cardLabel(t)) +
        (planned ? " · 規劃中" : "") +
        "</strong>" +
        (hint ? "<span>" + esc(hint) + "</span>" : "") +
        heavy +
        "</a>";
    });
    return html;
  }

  function renderByCategory(tools, opts) {
    var reg = global.PlanningToolRegistry;
    var byCat = {};
    tools.forEach(function (t) {
      if (!t) return;
      var c = t.category || "其他";
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(t);
    });
    var order = (reg && reg.categoryOrder) || [];
    var html = "";
    order.forEach(function (cat) {
      var items = byCat[cat];
      if (!items || !items.length) return;
      html += '<section class="ph-cat"><h3 class="ph-cat__title">' + esc(cat) + '</h3><div class="ph-grid">';
      html += renderToolCards(items, opts);
      html += "</div></section>";
    });
    return html;
  }

  function renderJourneyBar(state) {
    state = state || {};
    var p1 = state.phase1Progress || { done: 0, total: 3 };
    var hint = "第一階段 " + p1.done + "/" + p1.total;
    if (state.phase1Done && !state.warRoomScanned) {
      hint = "體檢已完成 · 請到戰情室看結果";
    } else if (state.phase3Unlocked) {
      hint = "三階段已解鎖";
    }
    return (
      '<div class="pp-journey-bar">' +
      "<strong>健康檢查旅程</strong> · " +
      '<span><span class="pp-phase-dot' +
      (state.phase1Done ? " pp-phase-dot--done" : " pp-phase-dot--current") +
      '"></span>第一階段</span> · ' +
      '<span><span class="pp-phase-dot' +
      (state.phase2Done ? " pp-phase-dot--done" : state.phase2Unlocked ? " pp-phase-dot--current" : "") +
      '"></span>第二階段</span> · ' +
      '<span><span class="pp-phase-dot' +
      (state.phase3Unlocked ? " pp-phase-dot--current" : "") +
      '"></span>第三階段</span>' +
      " · " +
      esc(hint) +
      "</div>"
    );
  }

  function renderPhaseBlock(phase, unlocked) {
    var reg = global.PlanningToolRegistry;
    var tools = reg && reg.toolsForJourneyPhase ? reg.toolsForJourneyPhase(phase.id) : [];
    var lockMsg = "";
    if (!unlocked) {
      if (phase.id === 2) {
        lockMsg = "請先完成第一階段至少一項體檢（建議：13 題靈命快評），戰情室才能給建議。";
      } else if (phase.id === 3) {
        lockMsg = "請完成第一階段，並完成第二階段或到戰情室按「掃描」後解鎖。";
      }
    }
    var cardsHtml = unlocked ? renderToolCards(tools) : "";
    return (
      '<section class="pp-phase-block' +
      (unlocked ? "" : " pp-phase-block--locked") +
      '" data-phase="' +
      esc(String(phase.id)) +
      '">' +
      '<div class="pp-phase-block__head">' +
      "<h2>" +
      esc(phase.title) +
      "</h2>" +
      "<p>" +
      esc(phase.subtitle) +
      "</p>" +
      (lockMsg ? '<p class="pp-phase-block__lock-msg">' + esc(lockMsg) + "</p>" : "") +
      "</div>" +
      (cardsHtml ? '<div class="pp-phase-grid">' + cardsHtml + "</div>" : "") +
      "</section>"
    );
  }

  function renderPhasePanels(containerId) {
    var host = document.getElementById(containerId || "planning-phase-panels");
    var cfg = global.PlanningPhaseConfig;
    var gate = global.PlanningPhaseGate;
    if (!host || !cfg || !gate) return;

    if (global.PlanningSidebarLabels && global.PlanningSidebarLabels.applyToRegistry) {
      global.PlanningSidebarLabels.applyToRegistry();
    }

    var state = gate.getJourneyState();
    var html = renderJourneyBar(state);
    cfg.PHASES.forEach(function (phase) {
      if (phase.id === "advanced") return;
      html += renderPhaseBlock(phase, gate.isPhaseUnlocked(phase.id));
    });
    host.innerHTML = html;
  }

  function renderAll() {
    var recHost = document.getElementById("planning-recommend-banner");
    if (recHost && global.PlanningRecommendEngine) {
      PlanningRecommendEngine.renderHubBanner(recHost);
    }
    renderPhasePanels("planning-phase-panels");
  }

  global.PlanningHubRender = {
    renderPhasePanels: renderPhasePanels,
    renderAll: renderAll,
    renderToolCards: renderToolCards,
    renderByCategory: renderByCategory
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})(typeof window !== "undefined" ? window : this);
