/**
 * School Management · 情境導向 SSOT（小白三大按鈕 · W1）
 */
(function (g) {
  "use strict";

  var BUILD = "20260806sch";

  var SCENARIOS = [
    {
      id: "today_attendance",
      emoji: "✅",
      label: "今天我要點名、登成績",
      hint: "選班級 → 勾出席 → 可順便登分",
      tab: "today",
      hash: "tab-today",
    },
    {
      id: "enroll_review",
      emoji: "📋",
      label: "我要審核報名、對齊會友",
      hint: "待取錄 → 連結中央會友庫 → 取錄",
      tab: "enroll",
      hash: "tab-enroll",
    },
    {
      id: "finance_reconcile",
      emoji: "💰",
      label: "我要對帳學費、匯出教會帳",
      hint: "標記已繳 → 收據 → 匯出 financeSystemData",
      tab: "finance",
      hash: "tab-finance",
    },
  ];

  g.SchScenarioSsot = {
    BUILD: BUILD,
    SCENARIOS: SCENARIOS,
    byId: function (id) {
      for (var i = 0; i < SCENARIOS.length; i++) {
        if (SCENARIOS[i].id === id) return SCENARIOS[i];
      }
      return null;
    },
  };
})(typeof window !== "undefined" ? window : this);
