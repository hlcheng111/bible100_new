/**
 * G 規劃行政 · 三階段旅程 SSOT（Phase 1→2→3 + 進階）
 */
(function (global) {
  "use strict";

  var PHASE1_TOOL_IDS = ["spiritual", "pastoral", "ncd"];
  var PHASE2_TOOL_IDS = ["shape", "competency", "johari", "alda"];
  var PHASE3_TOOL_IDS = ["swot", "smart", "kpiokr", "pdca"];
  var ADVANCED_TOOL_IDS = ["urgent", "ministry8020", "culture", "disc", "mbti", "matchmaker"];

  var JOURNEY_CORE_IDS = PHASE1_TOOL_IDS.concat(PHASE2_TOOL_IDS, PHASE3_TOOL_IDS);

  var PHASES = [
    {
      id: 1,
      title: "Phase 1 · 起步體檢",
      subtitle: "先花 10～15 分鐘，看清教會最核心健康輪廓",
      toolIds: PHASE1_TOOL_IDS,
      defaultToolId: "spiritual"
    },
    {
      id: 2,
      title: "Phase 2 · 團隊深耕",
      subtitle: "恩賜、能力與團隊盲點——適合完成 Phase 1 後解鎖",
      toolIds: PHASE2_TOOL_IDS,
      requiresPhase1: true
    },
    {
      id: 3,
      title: "Phase 3 · 戰略衝刺",
      subtitle: "SWOT、SMART、KPI、PDCA——適合長執對齊異象與目標",
      toolIds: PHASE3_TOOL_IDS,
      requiresPhase1: true,
      requiresPhase2OrScan: true
    },
    {
      id: "advanced",
      title: "進階工具",
      subtitle: "依戰情室破口或牧者判斷按需選用",
      toolIds: ADVANCED_TOOL_IDS,
      requiresPhase1: true
    }
  ];

  var POST_COMPLETE_CTA = {
    spiritual: { warRoom: true, label: "回健康雷達戰情室看六維結果" },
    pastoral: { warRoom: true, label: "回健康雷達戰情室看六維結果" },
    ncd: { warRoom: true, label: "回健康雷達戰情室看六維結果" },
    shape: { warRoom: true, matchmaker: true },
    competency: { warRoom: true },
    johari: { warRoom: true },
    alda: { warRoom: true },
    swot: { warRoom: true, strategy: true },
    smart: { warRoom: true, dashboard: true },
    kpiokr: { warRoom: true, dashboard: true },
    pdca: { warRoom: true, dashboard: true },
    urgent: { warRoom: true, label: "回戰情室 · 下一步 RACI 權責梳理", nextToolId: "raci" },
    ministry8020: { warRoom: true, label: "回戰情室 · 確認剪枝後資源傾斜", prune: true },
    culture: { warRoom: true, label: "回戰情室 · 信任破口時先補關係", nextToolId: "ncd" },
    disc: { warRoom: true, matchmaker: true, label: "回戰情室 · 溝通風格僅修飾節奏" },
    mbti: { warRoom: true, matchmaker: true, label: "回戰情室 · 性格參考不作定論" },
    matchmaker: { warRoom: true, hitl: true, label: "匯總完成 · 請牧者 HITL 確認試任" },
    default: { warRoom: true }
  };

  global.PlanningPhaseConfig = {
    PHASE1_TOOL_IDS: PHASE1_TOOL_IDS,
    PHASE2_TOOL_IDS: PHASE2_TOOL_IDS,
    PHASE3_TOOL_IDS: PHASE3_TOOL_IDS,
    ADVANCED_TOOL_IDS: ADVANCED_TOOL_IDS,
    JOURNEY_CORE_IDS: JOURNEY_CORE_IDS,
    PHASES: PHASES,
    SIDEBAR_STEP2_TOOL_IDS: PHASE1_TOOL_IDS.concat(PHASE2_TOOL_IDS),
    SIDEBAR_STEP5_TOOL_IDS: PHASE3_TOOL_IDS.concat(ADVANCED_TOOL_IDS),
    postCompleteCta: function (toolId) {
      return POST_COMPLETE_CTA[toolId] || POST_COMPLETE_CTA.default;
    },
    phaseForToolId: function (toolId) {
      if (PHASE1_TOOL_IDS.indexOf(toolId) >= 0) return 1;
      if (PHASE2_TOOL_IDS.indexOf(toolId) >= 0) return 2;
      if (PHASE3_TOOL_IDS.indexOf(toolId) >= 0) return 3;
      if (ADVANCED_TOOL_IDS.indexOf(toolId) >= 0) return "advanced";
      return null;
    }
  };
})(typeof window !== "undefined" ? window : this);
