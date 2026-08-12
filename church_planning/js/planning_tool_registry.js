/**
 * 教會規劃 · 工具 SSOT（與 cta_os_war_room.js TOOL_LINKS / cta_os_bridge TOOL_META 對齊）
 * path：相對 church_planning/ 目錄，勿加前綴。
 * tier: "canonical"（寫入戰情室）| "extended"（其他時期版本，暫不寫戰情室）
 * status: "live" | "planned"
 */
(function (global) {
  "use strict";

  var TOOLS = [
    { id: "spiritual", path: "Church_Governance_spiritual_health.html", label: "信徒靈命健康", category: "靈命與真理", tier: "canonical", ctv: ["P", "F"], blurb: "看見會眾靈命輪廓，避免只忙事工 · 13 題 · 約 10 分鐘", status: "live", maturity: { aldaTier: 10, note: "spiritual_pack · SpiritualAcsShell · 鏈路起點" } },
    { id: "pastoral", path: "Church_Governance_pastoral_health.html", label: "領袖健康診斷", category: "靈命與真理", tier: "canonical", ctv: ["P", "F"], blurb: "察覺帶領者是否快燃盡 · 30 題 · 約 15 分鐘", status: "live", maturity: { aldaTier: 11, note: "pastoral_pack · loadUpstreamChain · 完整版 pro 頁保留" } },
    { id: "shape", path: "shape-gifts-assessment.html", label: "SHAPE 恩賜探索", category: "恩賜與事奉", tier: "canonical", ctv: ["S", "C"], blurb: "找出事奉方向（恩賜、心志、環境）· 個人自評", status: "live", maturity: { aldaTier: 11, note: "shape_pack + MinistryPathBridge" } },
    { id: "competency", path: "ministry-competency-assessment.html", label: "事奉能力評估", category: "恩賜與事奉", tier: "canonical", ctv: ["S", "C"], blurb: "知識、態度、技能缺口，安排陪跑 · KSA", status: "live", maturity: { aldaTier: 12, note: "competency_pack v2 · KSA 培訓缺口 · MinistryPathBridge" } },
    { id: "alda", path: "alda-leadership-assessment.html", label: "ALDA 領導力", category: "恩賜與事奉", tier: "canonical", ctv: ["P", "G"], blurb: "長執／團隊帶領的四維基準 · 個人或小組", status: "live", maturity: { aldaTier: 11, note: "alda_pack + MinistryPathBridge · 戰情室 P 軸" } },
    { id: "matchmaker", path: "ministry-position-matchmaker.html", label: "崗位配對參考台", category: "恩賜與事奉", tier: "canonical", ctv: ["S", "C"], blurb: "匯總前面測評，對照崗位缺口 · 只匯總不重新打分 · 牧者確認", status: "live", maturity: { aldaTier: 12, note: "matchmaker_core + MatchmakerViz overlay · HITL" } },
    { id: "ministry8020", path: "Church_Governance_8020_focus.html", label: "事工聚焦 · 80/20", category: "文化與戰略", tier: "canonical", ctv: ["G", "C"], blurb: "找出少數關鍵事工，溫和剪枝過載 · 帕累托", status: "live", maturity: { aldaTier: 11, note: "eightytwenty_pack + AssessmentRunStore · 帕累托 SVG" } },
    { id: "urgent", path: "Church_Governance_urgent_matrix.html", label: "輕重緩急 · 艾森豪威爾", category: "治理與優先", tier: "canonical", ctv: ["G", "F"], blurb: "本季先處理什麼、什麼可緩 · 14 題 · 四象限", status: "live", maturity: { aldaTier: 11, note: "urgency_pack · loadUpstreamChain · UrgencyAcsShell" } },
    { id: "smart", path: "Church_Governance_SMART_goals.html", label: "可守住的目標 · SMART", category: "目標衡量", tier: "canonical", ctv: ["G", "C"], blurb: "把異象寫成這一季守得住的事工目標 · 15 題", status: "live", maturity: { aldaTier: 11, note: "smart_pack v2 · loadUpstreamChain · SmartFunnelViz · 守門決策桌" } },
    { id: "pdca", path: "Church_Governance_PDCA_cycle.html", label: "季度跟進 · PDCA", category: "治理與優先", tier: "canonical", ctv: ["G"], blurb: "計劃—執行—檢查—調整，小步改進 · 12 題", status: "live", maturity: { aldaTier: 11, note: "pdca_pack v2 · Small Wins · 活體 SWOT 鏈路" } },
    { id: "kpiokr", path: "Church_Governance_KPI_alignment.html", label: "目標與衡量 · KPI / OKR", category: "目標衡量", tier: "canonical", ctv: ["G"], blurb: "目標、指標、資源是否對齊 · 12 題", status: "live", maturity: { aldaTier: 11, note: "kpi_pack v2 · loadUpstreamChain · 資源卡關率" } },
    { id: "johari", path: "johari-window-assessment.html", label: "Johari 盲點覺察", category: "團隊與關係", tier: "canonical", ctv: ["R"], blurb: "看見自己不知道、別人看見的部分 · 可自評＋他評", status: "live", maturity: { aldaTier: 11, note: "johari_pack peer + MinistryPathBridge" } },
    { id: "disc", path: "disc-profile-assessment.html", label: "溝通風格 · DISC", category: "團隊與關係", tier: "canonical", ctv: ["R"], blurb: "了解溝通節奏，減少同工摩擦 · 16 題", status: "live", maturity: { aldaTier: 11, note: "disc_pack + MinistryPathBridge" } },
    { id: "mbti", path: "mbti-self-awareness.html", label: "性格傾向 · MBTI（簡）", category: "團隊與關係", tier: "canonical", ctv: ["R"], blurb: "輔助自我覺察；簡化版，不作神學定論", status: "live", maturity: { aldaTier: 11, note: "mbti_pack + MinistryPathBridge" } },
    { id: "swot", path: "Church_Governance_SWOT_matrix.html", label: "戰略盤點 · SWOT", category: "文化與戰略", tier: "canonical", ctv: ["C"], blurb: "把內外局勢配成可執行策略 · 八維工作坊", status: "live", maturity: { aldaTier: 12, note: "swot_pack v2 · Delta_Variance · 工作坊寫入 AssessmentRunStore" } },
    { id: "culture", path: "Church_Governance_Culture_radar.html", label: "長執同心四問", category: "文化與戰略", tier: "canonical", ctv: ["C"], blurb: "推大變動前，看異象、生命、真理、信任是否同心 · 24 題", status: "live", maturity: { aldaTier: 11, note: "culture_pack v2 · CVAM 雷達 · TRUST_BREACH · NCD 上游" } },
    { id: "ncd", path: "Church_Health_NCD_planning.html", label: "NCD 教會健康", category: "教會健康", tier: "canonical", ctv: ["F", "P"], blurb: "看整間教會哪裡最弱，先治一處 · 24 題快評", status: "live", maturity: { aldaTier: 12, note: "ncd_pack v2 · 八維最小因子 · Tab④ SWOT/SMART 傳送門" } },
    { id: "raci", path: "planning/raci-reflection.html", label: "權責梳理 · RACI", category: "治理與優先", tier: "canonical", ctv: ["G", "R"], blurb: "理清誰負責、誰配合、誰知會 · 工作桌（非打分問卷）", status: "live", sidebarStep3: false, charterExempt: true, warRoom: false, maturity: { note: "步驟3工作桌 · 非測評4-Tab憲章 · 含長執開會手冊分頁" } }
  ];

  /** 其他時期版本 · 暫不寫入戰情室 · 小白側欄與 hub 永不列出 */
  var EXTENDED = [
    { id: "spiritual_a1", path: "a1-health-entry.html", label: "A1 信徒健康（6 題）", category: "靈命與真理", tier: "extended", relatedId: "spiritual", blurb: "小白友善快評 · 獨立 localStorage", warRoom: false, sidebarHidden: true },
    { id: "spiritual_legacy", path: "spiritual_app/index.html", label: "屬靈自我審查（早期版）", category: "靈命與真理", tier: "extended", relatedId: "spiritual", blurb: "spiritual_app 原型 · 未接戰情室", warRoom: false, sidebarHidden: true },
    { id: "pastoral_pro", path: "pastoral-spiritual-survey-pro.html", label: "領袖健康·完整協調版", category: "靈命與真理", tier: "extended", relatedId: "pastoral", blurb: "長卷問卷 · 快評頁內亦連結", warRoom: false, sidebarHidden: true },
    { id: "pastoral_review", path: "pastoral-professional-review.html", label: "A1.5 同工專業審查", category: "靈命與真理", tier: "extended", relatedId: "pastoral", blurb: "面談對照桌 · CentralMemberDB notes", warRoom: false, sidebarHidden: true },
    { id: "talent_os", path: "planning_surveys/Kingdom Talent OS.html", label: "天國人才 OS（整合門戶）", category: "恩賜與事奉", tier: "extended", relatedId: "shape", blurb: "早期恩賜／事奉整合原型", warRoom: false, sidebarHidden: true },
    { id: "leader_pipeline", path: "leader-pipeline-radar.html", label: "領袖 Pipeline 雷達", category: "恩賜與事奉", tier: "extended", relatedId: "alda", blurb: "九維健康 + Pipeline 摘要", warRoom: false, sidebarHidden: true },
    { id: "swot_ai", path: "教會健康戰略診斷系統 Church SWOT AI.html", label: "SWOT AI 導航儀", category: "文化與戰略", tier: "extended", relatedId: "swot", blurb: "Alpine 版 SWOT · 試用", warRoom: false, sidebarHidden: true },
    { id: "8020_slasher", path: "ministry-8020-slasher.html", label: "80/20 事工精簡桌", category: "文化與戰略", tier: "extended", relatedId: "ministry8020", blurb: "孤兒目標剪枝 · 執行輔助", warRoom: false, sidebarHidden: true },
    { id: "ncd_checkup", path: "教會健康檢查 Church Health Check-up.html", label: "教會健康 Check-up（Vue）", category: "教會健康", tier: "extended", relatedId: "ncd", blurb: "數位診斷舊版 · 功能重疊 NCD", warRoom: false, sidebarHidden: true },
    { id: "planning_step0", path: "planning/health.html", label: "Step0 歷史與健康自評", category: "教會健康", tier: "extended", relatedId: "ncd", blurb: "舊 planning 流程里程碑表", warRoom: false, sidebarHidden: true }
  ];

  var CATEGORY_ORDER = [
    "靈命與真理",
    "恩賜與事奉",
    "治理與優先",
    "團隊與關係",
    "文化與戰略",
    "目標衡量",
    "教會健康"
  ];

  var BY_ID = {};
  var EXT_BY_ID = {};
  TOOLS.forEach(function (t) {
    BY_ID[t.id] = t;
  });
  EXTENDED.forEach(function (t) {
    EXT_BY_ID[t.id] = t;
  });

  function isCanonicalTool(t) {
    return t && t.sidebarStep3 !== false && t.tier !== "extended" && t.status !== "planned";
  }

  function canonicalTools() {
    return TOOLS.filter(isCanonicalTool);
  }

  function toolsForStep3Submenu() {
    return TOOLS.filter(function (t) {
      return t.sidebarStep3 !== false;
    });
  }

  function toolIdsFromConfig(key) {
    var cfg = global.PlanningPhaseConfig;
    return cfg && cfg[key] ? cfg[key].slice() : [];
  }

  function toolsByIds(ids) {
    return (ids || [])
      .map(function (id) {
        return BY_ID[id];
      })
      .filter(Boolean);
  }

  function toolsForSidebarStep2() {
    return toolsByIds(toolIdsFromConfig("SIDEBAR_STEP2_TOOL_IDS"));
  }

  function toolsForSidebarStep5() {
    return toolsByIds(toolIdsFromConfig("SIDEBAR_STEP5_TOOL_IDS"));
  }

  function toolsForJourneyPhase(phaseId) {
    var cfg = global.PlanningPhaseConfig;
    if (!cfg || !cfg.PHASES) return [];
    var phase = cfg.PHASES.filter(function (p) {
      return p.id === phaseId;
    })[0];
    return phase ? toolsByIds(phase.toolIds) : [];
  }

  global.PlanningToolRegistry = {
    tools: TOOLS,
    extended: EXTENDED,
    byId: BY_ID,
    extendedById: EXT_BY_ID,
    categoryOrder: CATEGORY_ORDER,
    canonicalTools: canonicalTools,
    toolsForStep3Submenu: toolsForStep3Submenu,
    toolsForSidebarStep2: toolsForSidebarStep2,
    toolsForSidebarStep5: toolsForSidebarStep5,
    toolsForJourneyPhase: toolsForJourneyPhase,
    toolsByIds: toolsByIds,
    pathById: function (id) {
      var t = BY_ID[id];
      return t ? t.path : null;
    },
    extendedPathById: function (id) {
      var t = EXT_BY_ID[id];
      return t ? t.path : null;
    },
    rootUrl: function (relPath) {
      relPath = String(relPath || "").replace(/^\/+/, "");
      if (relPath.indexOf("church_planning/") === 0) return relPath;
      return "church_planning/" + relPath;
    }
  };
})(typeof window !== "undefined" ? window : this);
