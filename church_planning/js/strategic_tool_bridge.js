/**
 * 五年計劃戰略鏈 · NCD / KPI / SWOT 資料互通（AssessmentRunStore SSOT）
 */
(function (global) {
  "use strict";

  function loadRun(toolId) {
    if (!global.AssessmentRunStore || !toolId) return null;
    return AssessmentRunStore.loadLatest(toolId);
  }

  function ncdMinimumFactor() {
    var run = loadRun("ncd");
    if (!run || !run.derived || !run.derived.minimum_factor) return null;
    var min = run.derived.minimum_factor;
    return {
      id: min.id,
      legacy: min.legacy,
      label: min.label,
      score: min.score,
      swot_note:
        "【NCD 最小因子自動匯入】" +
        (min.label || "健康破口") +
        "（" +
        (min.score != null ? min.score : "—") +
        "/5）— 建議列為 SWOT 內部劣勢（W）優先對話項。"
    };
  }

  function swotWeaknessPrefill() {
    var min = ncdMinimumFactor();
    if (!min) return null;
    if (global.NcdPack && typeof NcdPack.readPdcaPrefill === "function") {
      var p = NcdPack.readPdcaPrefill();
      if (p && p.swot_note) return p.swot_note;
    }
    return min.swot_note;
  }

  function cultureTrustAlert() {
    var run = loadRun("culture");
    if (!run || !run.derived || !run.derived.dim_scores) return null;
    var trust = run.derived.dim_scores.team_trust;
    if (trust == null || trust >= 3.0) return null;
    return {
      level: "red",
      message:
        "本堂「團隊信任」均分 " +
        trust +
        " 低於 3.0：此時強推大型五年擴建計劃將面臨內部張力。建議優先在小組中滾動 NCD「相親相愛的關係」維度。"
    };
  }

  function kpiResourceStuck() {
    var run = loadRun("kpiokr");
    if (!run || !run.risk_flags) return false;
    return run.risk_flags.indexOf("RESOURCE_STUCK") >= 0;
  }

  global.StrategicToolBridge = {
    loadRun: loadRun,
    ncdMinimumFactor: ncdMinimumFactor,
    swotWeaknessPrefill: swotWeaknessPrefill,
    cultureTrustAlert: cultureTrustAlert,
    kpiResourceStuck: kpiResourceStuck
  };
})(typeof window !== "undefined" ? window : global);
