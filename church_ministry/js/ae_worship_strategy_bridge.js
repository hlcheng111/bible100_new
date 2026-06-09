/**
 * W4/A · 敬拜 ← 教会规划 只读战略桥接（横幅提示，不自动改排班）
 */
(function (win) {
  "use strict";

  var PLANNING_KEYS = [
    "church_planning_pdca_cycles_v1",
    "church_planning_pdca_v1",
    "pdca_cycles_v1",
    "assessment_run_store_v1",
    "church_planning_strategic_report_v1",
    "church_planning_kpi_alignment_v1"
  ];

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function scanPlanningStores() {
    var i;
    for (i = 0; i < PLANNING_KEYS.length; i++) {
      var v = readJson(PLANNING_KEYS[i]);
      if (v) return { key: PLANNING_KEYS[i], data: v };
    }
    return null;
  }

  function stressFromPdca(data) {
    if (!data) return null;
    var cycles = Array.isArray(data) ? data : data.cycles || data.items || [];
    if (!cycles.length && data.plan) cycles = [data];
    var maxDelta = 0;
    var stuck = 0;
    cycles.forEach(function (c) {
      var delta = parseFloat(c.delta || c.gap || c.pdcaDelta || 0);
      if (!isNaN(delta) && delta > maxDelta) maxDelta = delta;
      var rate = parseFloat(c.stuckRate || c.blockRate || c.kpiStuckRate || 0);
      if (!isNaN(rate) && rate > stuck) stuck = rate;
    });
    return { maxDelta: maxDelta, stuckRate: stuck };
  }

  function getStrategyHints() {
    var hit = scanPlanningStores();
    if (!hit) {
      return { available: false, simplify: false, message: "", source: null };
    }
    var stress = stressFromPdca(hit.data);
    var simplify = false;
    var msg = "";
    if (stress.maxDelta >= 2.5 || stress.stuckRate >= 70) {
      simplify = true;
      msg =
        "本季规划数据显示同工负荷偏高（PDCA 落差或 KPI 卡关率偏高）。建议本周启动简约崇拜：减少器乐编制、影音改用单机直播，减轻同工负担。";
    } else if (stress.maxDelta >= 1.5 || stress.stuckRate >= 50) {
      msg = "规划数据提示部分团队压力上升，请部长留意排班均衡与安息节奏。";
    }
    return {
      available: true,
      simplify: simplify,
      message: msg,
      source: hit.key,
      stress: stress
    };
  }

  win.AeWorshipStrategyBridge = {
    getStrategyHints: getStrategyHints,
    PLANNING_KEYS: PLANNING_KEYS
  };
})(window);
