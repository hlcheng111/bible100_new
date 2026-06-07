/**
 * 教會規劃 · 工具 SSOT（與 cta_os_war_room.js TOOL_LINKS / cta_os_bridge TOOL_META 對齊）
 * path：相對 church_planning/ 目錄，勿加前綴。
 * status: "live" | "planned" — planned 為占位頁，日後再設計填表。
 */
(function (global) {
  "use strict";

  var TOOLS = [
    { id: "spiritual", path: "信徒靈性生命健康自我審查.html", label: "信徒靈命健康", category: "靈命與真理", ctv: ["P", "F"], blurb: "全會友自評 · 微型教會必選", status: "live", maturity: { aldaTier: 9, note: "spiritual_pack + assessment_run 已接" } },
    { id: "pastoral", path: "pastoral-spiritual-survey-pro.html", label: "領袖健康診斷", category: "靈命與真理", ctv: ["P", "F"], blurb: "教牧／核心同工負擔與節奏", status: "live", maturity: { aldaTier: 10, note: "pastoral_pack + assessment_run · 戰情室 CTV" } },
    { id: "shape", path: "shape-gifts-assessment.html", label: "SHAPE 恩賜", category: "恩賜與事奉", ctv: ["S"], blurb: "恩賜整合盤點", status: "live" },
    { id: "competency", path: "ministry-competency-assessment.html", label: "事奉能力模型", category: "恩賜與事奉", ctv: ["S"], blurb: "崗位能力對照", status: "live" },
    { id: "alda", path: "12 Apostles Leadership Assessment.html", label: "ALDA 領導力", category: "恩賜與事奉", ctv: ["S", "G"], blurb: "十二使徒領導力測評", status: "live" },
    { id: "ministry8020", path: "ministry-8020-planning.html", label: "教會版 80/20", category: "文化與戰略", ctv: ["G", "C"], blurb: "聚焦關鍵少數事工", status: "live" },
    { id: "urgent", path: "important-urgent-matrix.html", label: "重要 vs 緊急", category: "治理與優先", ctv: ["G"], blurb: "優先序與取捨", status: "live", maturity: { aldaTier: 11, note: "14 題 + assessment_run + 战情室 CTA" } },
    { id: "smart", path: "smart-assessment.html", label: "教會版 SMART", category: "目標衡量", ctv: ["G", "C"], blurb: "可守住的事工目標 · 快評", status: "live", maturity: { aldaTier: 10, note: "smart_pack + assessment_run · 多計畫見 smart-planning.html" } },
    { id: "pdca", path: "pdca-planning.html", label: "教會版 PDCA", category: "治理與優先", ctv: ["G"], blurb: "計畫—執行—檢核迴圈", status: "live" },
    { id: "kpiokr", path: "kpi-okr-alignment.html", label: "KPI/OKR 對齊", category: "目標衡量", ctv: ["G"], blurb: "目標與衡量對齊（非人事考核）", status: "live" },
    { id: "johari", path: "johari-window-assessment.html", label: "Johari 盲點", category: "團隊與關係", ctv: ["R"], blurb: "團隊互知與盲點", status: "live" },
    { id: "disc", path: "disc-profile-assessment.html", label: "DISC 溝通風格", category: "團隊與關係", ctv: ["R"], blurb: "溝通風格自評 · 規劃中", status: "planned" },
    { id: "mbti", path: "mbti-self-awareness.html", label: "MBTI 性格傾向（簡化）", category: "團隊與關係", ctv: ["R"], blurb: "性格傾向自覺 · 規劃中", status: "planned" },
    { id: "swot", path: "swot-planning.html", label: "教會版 SWOT", category: "文化與戰略", ctv: ["C"], blurb: "診斷用 · 步驟5可再深化", status: "live" },
    { id: "culture", path: "culture-alignment-assessment.html", label: "文化契合度", category: "文化與戰略", ctv: ["C"], blurb: "異象與價值契合 · 規劃中", status: "planned" },
    { id: "ncd", path: "Church_Health_NCD_planning.html", label: "NCD 教會健康", category: "教會健康", ctv: ["F", "P"], blurb: "中大型教會八維健康診斷", status: "live" },
    /* RACI 為步驟3主入口，不列入頂部量表索引；戰情室仍引用 */
    { id: "raci", path: "planning/raci-reflection.html", label: "RACI 權責反思", category: "治理與優先", ctv: ["G", "R"], blurb: "誰主責、誰配合 · 步驟3", status: "live", sidebarStep3: false }
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
  TOOLS.forEach(function (t) {
    BY_ID[t.id] = t;
  });

  function toolsForStep3Submenu() {
    return TOOLS.filter(function (t) {
      return t.sidebarStep3 !== false;
    });
  }

  global.PlanningToolRegistry = {
    tools: TOOLS,
    byId: BY_ID,
    categoryOrder: CATEGORY_ORDER,
    toolsForStep3Submenu: toolsForStep3Submenu,
    pathById: function (id) {
      var t = BY_ID[id];
      return t ? t.path : null;
    },
    rootUrl: function (relPath) {
      relPath = String(relPath || "").replace(/^\/+/, "");
      if (relPath.indexOf("church_planning/") === 0) return relPath;
      return "church_planning/" + relPath;
    }
  };
})(typeof window !== "undefined" ? window : this);
