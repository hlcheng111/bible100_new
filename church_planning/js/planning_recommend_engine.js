/**
 * G 規劃行政 · 戰情室／Hub 輕量推薦（CTV 最低軸 → 下一工具）
 */
(function (global) {
  "use strict";

  var DIM_TOOL_MAP = {
    P: { toolId: "pastoral", label: "領袖健康診斷", reason: "P 軸（牧養／領袖）偏低，宜先關顧核心同工耗竭與靈命節奏。" },
    S: { toolId: "spiritual", label: "信徒靈命健康", reason: "S 軸（屬靈根基）偏低，宜先談禱告讀經節奏，再推新事工。" },
    G: { toolId: "swot", label: "SWOT 戰略矩陣", reason: "G 軸（治理／異象）偏低，宜先對齊異象與資源配置。" },
    C: { toolId: "shape", label: "SHAPE 恩賜", reason: "C 軸（恩賜能力）偏低，宜先盤點恩賜與崗位再派工。" },
    R: { toolId: "johari", label: "Johari 盲點", reason: "R 軸（團隊關係）偏低，宜先修復溝通與盲點，再加速執行。" },
    F: { toolId: "urgent", label: "重要 vs 緊急", reason: "F 軸（成形果效）偏低，宜檢查是否忙緊急、荒重要。" }
  };

  var ALT_BY_DIM = {
    P: { toolId: "alda", label: "ALDA 領導力" },
    G: { toolId: "raci", label: "RACI 權責工作桌", isRaci: true },
    C: { toolId: "matchmaker", label: "事奉媒合中心", isRoot: true, href: "church_ministry/guide_crm_journey_hub.html?tab=matchmaker" }
  };

  function dimensions() {
    if (global.CTAOSRuntime && global.CTAOSRuntime.dimensions) {
      return global.CTAOSRuntime.dimensions.slice();
    }
    return ["P", "S", "G", "C", "R", "F"];
  }

  function getCompositeVector() {
    if (global.CTAOSWarRoom && typeof global.CTAOSWarRoom.buildWarRoomState === "function") {
      var state = global.CTAOSWarRoom.buildWarRoomState();
      if (state && state.composite && state.toolCount > 0) return state.composite;
    }
    return null;
  }

  function weakestDims(composite, n) {
    n = n || 2;
    if (!composite) return [];
    return dimensions()
      .slice()
      .sort(function (a, b) {
        return (composite[a] || 0) - (composite[b] || 0);
      })
      .slice(0, n);
  }

  function recommendFromComposite(composite) {
    if (!composite) {
      return {
        primary: { toolId: "spiritual", label: "信徒靈命健康", reason: "尚未有戰情合成資料，建議從 13 題靈命快評開始。" },
        weakest: [],
        hasData: false
      };
    }
    var weak = weakestDims(composite, 2);
    var dim = weak[0] || "S";
    var primary = DIM_TOOL_MAP[dim] || DIM_TOOL_MAP.S;
    var alt = ALT_BY_DIM[dim] || null;
    return {
      primary: Object.assign({ dim: dim, score: composite[dim] }, primary),
      alternate: alt,
      weakest: weak.map(function (d) {
        return { dim: d, score: composite[d], hint: (DIM_TOOL_MAP[d] || {}).label };
      }),
      hasData: true
    };
  }

  function getRecommendation() {
    return recommendFromComposite(getCompositeVector());
  }

  function renderHubBanner(host) {
    if (!host) return;
    var rec = getRecommendation();
    var gate = global.PlanningPhaseGate;
    var state = gate && gate.getJourneyState ? gate.getJourneyState() : {};
    var html =
      '<div class="pp-recommend-banner">' +
      "<h3>🎯 " +
      (rec.hasData ? "戰情室建議下一步" : "建議從這裡開始") +
      "</h3>" +
      "<p>" +
      rec.primary.reason +
      "</p>" +
      '<p class="pp-recommend-actions">' +
      '<a href="#" class="pp-btn pp-btn--primary" onclick="return planningOpenByToolId(event,' +
      JSON.stringify(rec.primary.toolId) +
      ');">→ ' +
      rec.primary.label +
      "</a>";
    if (rec.hasData) {
      html +=
        ' <a href="#" class="pp-btn" onclick="return planningOpenContent(event,\'cta-os-war-room.html\');">📡 健康雷達戰情室</a>';
    }
    if (!state.phase1Done) {
      html +=
        ' <a href="#" class="pp-btn pp-btn--ghost" onclick="return planningOpenByToolId(event,\'spiritual\');">⚡ 13 題靈命快評（2 次點擊）</a>';
    }
    html += "</p></div>";
    host.innerHTML = html;
  }

  global.PlanningRecommendEngine = {
    getCompositeVector: getCompositeVector,
    getRecommendation: getRecommendation,
    renderHubBanner: renderHubBanner,
    recommendFromComposite: recommendFromComposite
  };
})(typeof window !== "undefined" ? window : this);
