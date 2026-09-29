/**
 * G 規劃 · 側欄標題 SSOT（18 canonical）
 * 主行：中文 4～6 字 · 方法縮寫（無縮寫則僅中文）
 * 副行：1～2 英文詞（不重複縮寫）
 * landing / H1 完整名見 planning_tool_registry.js label
 */
(function (global) {
  "use strict";

  /** @type {Record<string, { main: string, en: string, landingHint?: string }>} */
  var SIDEBAR = {
    spiritual: { main: "靈命健康", en: "Spiritual Health", landingHint: "看見會眾靈命輪廓 · 13 題 · 約 10 分鐘" },
    pastoral: { main: "領袖健康", en: "Leader Care", landingHint: "察覺帶領者是否快燃盡 · 30 題" },
    ncd: { main: "教會健康 · NCD", en: "Church Health", landingHint: "整堂體質最小因子 · 24 題快評" },
    shape: { main: "恩賜探索 · SHAPE", en: "Gift Profile", landingHint: "事奉方向 · 恩賜與心志" },
    competency: { main: "事奉能力 · KSA", en: "Ministry Skills", landingHint: "知識態度技能缺口 · 安排陪跑" },
    alda: { main: "領導基準 · ALDA", en: "Leadership", landingHint: "長執／團隊帶領四維基準" },
    johari: { main: "盲點覺察 · Johari", en: "Blind Spots", landingHint: "自評＋他評 · 團隊節奏" },
    disc: { main: "溝通風格 · DISC", en: "Communication", landingHint: "減少同工摩擦 · 16 題" },
    mbti: { main: "性格傾向 · MBTI", en: "Personality", landingHint: "簡化自覺 · 不作神學定論" },
    matchmaker: { main: "崗位配對 · Fit", en: "Role Fit", landingHint: "匯總前測 · 牧者確認（HITL）" },
    raci: { main: "權責梳理 · RACI", en: "Job Clarity", landingHint: "誰負責、誰配合 · 工作桌" },
    urgent: { main: "輕重緩急 · Priority", en: "Urgent Matrix", landingHint: "本季先處理什麼 · 四象限" },
    swot: { main: "戰略盤點 · SWOT", en: "Strategy Map", landingHint: "內外局勢配對 · 八維工作坊" },
    smart: { main: "目標設定 · SMART", en: "Clear Goals", landingHint: "可守住的本季事工目標" },
    kpiokr: { main: "指標對齊 · KPI", en: "KPI Alignment", landingHint: "目標與衡量、資源對齊" },
    pdca: { main: "季度跟進 · PDCA", en: "Review Cycle", landingHint: "計劃—執行—檢查—調整" },
    ministry8020: { main: "事工聚焦 · 80/20", en: "Focus Prune", landingHint: "關鍵少數事工 · 溫和剪枝" },
    culture: { main: "長執同心 · Culture", en: "Team Alignment", landingHint: "推大變動前 · 四維同心" }
  };

  function applyToRegistry() {
    var reg = global.PlanningToolRegistry;
    if (!reg) return;
    function patch(list) {
      (list || []).forEach(function (t) {
        var s = SIDEBAR[t.id];
        if (s) {
          t.sidebarLabel = s.main;
          t.sidebarEn = s.en;
          t.landingHint = s.landingHint || t.landingHint || "";
        } else if (!t.sidebarLabel) {
          t.sidebarLabel = t.label;
          t.sidebarEn = t.sidebarEn || "";
        }
      });
    }
    patch(reg.tools);
    patch(reg.extended);
  }

  function displayLabel(t) {
    if (!t) return "";
    return t.sidebarLabel || t.label || t.id || "";
  }

  function displayEn(t) {
    if (!t) return "";
    return t.sidebarEn || "";
  }

  function landingHint(t) {
    if (!t) return "";
    return t.landingHint || "";
  }

  global.PlanningSidebarLabels = {
    SIDEBAR: SIDEBAR,
    applyToRegistry: applyToRegistry,
    displayLabel: displayLabel,
    displayEn: displayEn,
    landingHint: landingHint
  };

  applyToRegistry();
})(typeof window !== "undefined" ? window : this);
