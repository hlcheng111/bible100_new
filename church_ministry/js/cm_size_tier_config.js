/**
 * CM · 規模檔位參考（給小白對號入座）
 *
 * 原則（MRM 工程計畫 V1 §1）：
 *  - 四檔共用同一套資料與頁面，不分叉程式碼；本檔只決定「預設開啟」與「預設收起」。
 *  - 紅旗永遠開啟，不分檔位（安全不隨規模縮減）。
 *  - 本檔可用記事本直接改：數字與清單都在下方，不需懂程式。
 *  - 人數以「主日平均出席」計（華人教會慣例，不是會友名冊總數）。
 *  - 人數區間：下限含、上限不含。剛好 50 人算小、剛好 150 人算中、剛好 500 人算大
 *    （華人教會習慣說「滿 150 人進入中型、滿 500 人進入大型」）。
 *
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §1.1
 */
(function (global) {
  "use strict";

  /** 缺席預警的未聚會門檻（天）預設值與可選項（頁面下拉用） */
  var ABSENCE_THRESHOLD_DEFAULT_DAYS = 14;
  var ABSENCE_THRESHOLD_CHOICES = [7, 14, 21, 28];

  /**
   * 四檔。欄位說明：
   * - id：程式用代碼，請勿改
   * - label_zh：小白看到的名稱
   * - min／max：會友人數區間（min 含、max 不含；大檔 max 為 null）
   * - default_open：預設開啟的功能（記事本可增刪）
   * - default_collapsed：預設收起、需按「更多」才看到的功能
   */
  var TIERS = [
    {
      id: "micro",
      label_zh: "微",
      range_zh: "不滿 50 人",
      full_zh: "微型 · 不滿 50 人",
      min: 0,
      max: 50,
      default_open: ["名冊", "預警", "紅旗", "AI 草稿"],
      default_collapsed: ["配對", "多部門看板", "審計"],
      visible_depts: ["A", "B"],
      fold_advanced: true,
      show_large_tip: false,
      hint_zh: "微型堂先看敬拜＋牧養；其餘（含社會／詩歌／行政）在「更多」。"
    },
    {
      id: "small",
      label_zh: "小",
      range_zh: "50–149 人",
      full_zh: "小型 · 50–149 人",
      min: 50,
      max: 150,
      default_open: ["名冊", "預警", "紅旗", "AI 草稿", "新人漏斗", "排班建議"],
      default_collapsed: ["多分堂權限"],
      visible_depts: ["A", "B", "C", "G"],
      fold_advanced: true,
      show_large_tip: false,
      hint_zh: "小型堂先看敬拜／牧養／門訓／行政(G)；外展／社會／詩歌在「更多」。"
    },
    {
      id: "medium",
      label_zh: "中",
      range_zh: "150–499 人",
      full_zh: "中型 · 150–499 人",
      min: 150,
      max: 500,
      default_open: ["名冊", "預警", "紅旗", "AI 草稿", "新人漏斗", "排班建議", "跨部門 360", "每週 PDCA 摘要"],
      default_collapsed: ["多堂點隔離"],
      visible_depts: ["A", "B", "C", "D", "E", "F", "G"],
      fold_advanced: true,
      show_large_tip: false,
      hint_zh: "中型堂（150–499 人）：A–G 部門工作臺全開；進階工具預設收起，需要時按「更多」。"
    },
    {
      id: "large",
      label_zh: "大",
      range_zh: "500 人以上",
      full_zh: "大型 · 500 人以上",
      min: 500,
      max: null,
      default_open: ["全部功能"],
      default_collapsed: [],
      visible_depts: ["A", "B", "C", "D", "E", "F", "G"],
      fold_advanced: false,
      show_large_tip: true,
      hint_zh: "完整模式：A–G 部門與工具全開。"
    }
  ];

  /**
   * 功能清單：每個功能從哪一檔開始「預設顯示」（from）。
   * 比該檔小的教會，這個功能預設收起，按「更多」就會出現——功能不會被刪。
   * 頁面上用 data-size-feature="功能代碼" 標記；沒有標記的功能不受影響。
   * 紅旗、預警、名冊、AI 草稿、備份永遠顯示，不列入這裡。
   * 名稱（label_zh）要和上面 default_open／default_collapsed 的字一致（測試會檢查）。
   */
  var FEATURES = {
    newcomer_funnel: { label_zh: "新人漏斗", from: "small" },
    shift_suggest: { label_zh: "排班建議", from: "small" },
    cross_dept_360: { label_zh: "跨部門 360", from: "medium" },
    weekly_pdca: { label_zh: "每週 PDCA 摘要", from: "medium" },
    matching: { label_zh: "配對", from: "medium" },
    multi_dept_board: { label_zh: "多部門看板", from: "medium" },
    audit: { label_zh: "審計", from: "medium" },
    multi_campus_permission: { label_zh: "多分堂權限", from: "medium" },
    multi_service_isolation: { label_zh: "多堂點隔離", from: "large" }
  };

  var ORDER = ["micro", "small", "medium", "large"];

  function rankOf(tierId) {
    var i = ORDER.indexOf(String(tierId));
    return i < 0 ? 0 : i;
  }

  /** 這個功能在這一檔是否預設顯示（未登記的功能一律顯示，不亂藏） */
  function featureVisible(featureId, tierId) {
    var f = FEATURES[featureId];
    if (!f) return true;
    return rankOf(tierId) >= rankOf(f.from);
  }

  function tierById(tierId) {
    for (var i = 0; i < TIERS.length; i++) {
      if (TIERS[i].id === tierId) return TIERS[i];
    }
    return null;
  }

  /** 這個部門臺（A–G）在這一檔是否預設顯示 */
  function deptVisible(code, tierId) {
    var t = tierById(tierId) || TIERS[0];
    return t.visible_depts.indexOf(String(code || "").toUpperCase()) >= 0;
  }

  /** 依會友人數回傳檔位（非數字或負數視為微） */
  function tierFor(headcount) {
    var n = Number(headcount);
    if (!isFinite(n) || n < 0) n = 0;
    for (var i = 0; i < TIERS.length; i++) {
      var t = TIERS[i];
      if (n >= t.min && (t.max === null || n < t.max)) return t;
    }
    return TIERS[0];
  }

  var BASIS_ZH = "以主日平均出席人數為準（不是會友名冊總數）";

  var api = {
    BASIS_ZH: BASIS_ZH,
    ABSENCE_THRESHOLD_DEFAULT_DAYS: ABSENCE_THRESHOLD_DEFAULT_DAYS,
    ABSENCE_THRESHOLD_CHOICES: ABSENCE_THRESHOLD_CHOICES,
    TIERS: TIERS,
    FEATURES: FEATURES,
    tierFor: tierFor,
    tierById: tierById,
    featureVisible: featureVisible,
    deptVisible: deptVisible
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmSizeTierConfig = api;
  }
})(typeof window !== "undefined" ? window : this);
