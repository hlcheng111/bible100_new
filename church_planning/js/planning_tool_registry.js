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
    { id: "shape", path: "shape-gifts-assessment.html", label: "SHAPE 恩賜", category: "恩賜與事奉", ctv: ["S", "C"], blurb: "事奉主軸 · path_cards 出路導航", status: "live", maturity: { aldaTier: 11, note: "shape_pack + MinistryPathBridge" } },
    { id: "competency", path: "ministry-competency-assessment.html", label: "事奉能力模型", category: "恩賜與事奉", ctv: ["S", "C"], blurb: "KSA 矩陣 · path_cards 能力降級", status: "live", maturity: { aldaTier: 12, note: "competency_pack v2 · KSA 培訓缺口 · MinistryPathBridge" } },
    { id: "alda", path: "alda-leadership-assessment.html", label: "ALDA 領導力", category: "恩賜與事奉", ctv: ["P", "G"], blurb: "長執／帶領基準 · P 軸 · path_cards 帶領修飾", status: "live", maturity: { aldaTier: 11, note: "alda_pack + MinistryPathBridge · 戰情室 P 軸" } },
    { id: "ministry8020", path: "ministry-8020-planning.html", label: "教會版 80/20", category: "文化與戰略", ctv: ["G", "C"], blurb: "聚焦關鍵少數事工", status: "live" },
    { id: "urgent", path: "important-urgent-matrix.html", label: "重要 vs 緊急", category: "治理與優先", ctv: ["G", "F"], blurb: "優先序與取捨 · F 軸成形果效", status: "live", maturity: { aldaTier: 11, note: "urgency_pack + assessment_run · 戰情室 F 軸" } },
    { id: "smart", path: "smart-assessment.html", label: "教會版 SMART", category: "目標衡量", ctv: ["G", "C"], blurb: "可守住的事工目標 · 快評", status: "live", maturity: { aldaTier: 10, note: "smart_pack + assessment_run · 多計畫見 smart-planning.html" } },
    { id: "pdca", path: "pdca-planning.html", label: "教會版 PDCA", category: "治理與優先", ctv: ["G"], blurb: "計畫—執行—檢核迴圈", status: "live" },
    { id: "kpiokr", path: "kpi-okr-alignment.html", label: "神國標竿導航儀", category: "目標衡量", ctv: ["G"], blurb: "目標與衡量對齊 · 12 題快評 · 非人事考核", status: "live", maturity: { aldaTier: 10, note: "kpi_pack + assessment_run · 80/20 資源傾斜提示" } },
    { id: "johari", path: "johari-window-assessment.html", label: "Johari 盲點", category: "團隊與關係", ctv: ["R"], blurb: "24 自評 + 24 他評 · path_cards", status: "live", maturity: { aldaTier: 11, note: "johari_pack peer + MinistryPathBridge" } },
    { id: "disc", path: "disc-profile-assessment.html", label: "DISC 溝通風格", category: "團隊與關係", ctv: ["R"], blurb: "溝通節奏修飾 · path_cards", status: "live", maturity: { aldaTier: 11, note: "disc_pack + MinistryPathBridge" } },
    { id: "mbti", path: "mbti-self-awareness.html", label: "MBTI 性格傾向（簡化）", category: "團隊與關係", ctv: ["R"], blurb: "SHAPE P 軸 fallback · 簡化自覺", status: "live", maturity: { aldaTier: 11, note: "mbti_pack + MinistryPathBridge" } },
    { id: "swot", path: "swot-planning.html", label: "教會版 SWOT", category: "文化與戰略", ctv: ["C"], blurb: "診斷用 · 步驟5可再深化", status: "live" },
    { id: "culture", path: "culture-alignment-assessment.html", label: "堂會 DNA 共鳴", category: "文化與戰略", ctv: ["C"], blurb: "異象與價值共鳴 · 24 題 · 五年計劃基石", status: "live", maturity: { aldaTier: 10, note: "culture_pack · TRUST_BREACH 團隊信任<3.0" } },
    { id: "ncd", path: "Church_Health_NCD_planning.html", label: "NCD 教會健康", category: "教會健康", ctv: ["F", "P"], blurb: "ACS 四 Tab · 24 題快評 + 十步精靈 · 最小因子 → PDCA", status: "live", maturity: { aldaTier: 12, note: "ncd_pack v2 · 八維最小因子 · Tab④ SWOT/SMART 傳送門" } },
    /* RACI 為步驟3主入口，不列入頂部量表索引；戰情室仍引用 */
    { id: "raci", path: "planning/raci-reflection.html", label: "RACI 權責反思", category: "治理與優先", ctv: ["G", "R"], blurb: "誰主責、誰配合 · 步驟3", status: "live", sidebarStep3: false, charterExempt: true, maturity: { note: "步驟3工作桌 · 非測評4-Tab憲章 · 含長執開會手冊分頁" } }
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
