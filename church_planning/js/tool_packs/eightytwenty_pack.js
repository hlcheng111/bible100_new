/**
 * 教會版 80/20 資源聚焦儀（ministry8020）· Pareto 帕累托長尾
 * SSOT：事工列評分、Impact_Ratio、剪枝候選、上游 NCD/SWOT/KPI
 */
(function (global) {
  "use strict";

  var TOOL_ID = "ministry8020";
  var TOOL_LABEL = "教會版 80/20 資源聚焦儀";
  var PACK_VERSION = 1;
  var Eng = global.EightyTwentyEngine;

  var THRESHOLDS = {
    min_rows: 3,
    prune_waste_min: 12,
    impact_ratio_low: 0.35,
    pareto_fraction: 0.2
  };

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function trim(s) {
    return String(s == null ? "" : s).trim();
  }

  function ministryRowScores(row) {
    if (Eng && typeof Eng.ministryScores === "function") return Eng.ministryScores(row);
    var m = Number(row && row.missionFit) || 0;
    var f = Number(row && row.fruit) || 0;
    var a = Number(row && row.adminBurden) || 0;
    return { valueScore: 2 * m + 2 * f - a, wasteScore: 2 * a + (6 - m) + (6 - f) };
  }

  function topFractionCount(n) {
    if (Eng && typeof Eng.topFractionCount === "function") return Eng.topFractionCount(n);
    n = Number(n) || 0;
    if (n <= 0) return 0;
    return Math.max(1, Math.ceil(n * THRESHOLDS.pareto_fraction));
  }

  function analyzeRows(rows, upstream) {
    var list = Array.isArray(rows) ? rows : [];
    var analyzed = list.map(function (row, idx) {
      var sc = ministryRowScores(row);
      var effort = Number(row.effortLoadIndex) || Number(row.adminBurden) || 3;
      var impact = Math.max(1, sc.valueScore);
      var impactRatio = effort > 0 ? round2(impact / (effort * 4)) : 0;
      var isPrune =
        sc.wasteScore >= THRESHOLDS.prune_waste_min && impactRatio <= THRESHOLDS.impact_ratio_low;
      return {
        index: idx,
        name: trim(row.name) || "（未命名事工 #" + (idx + 1) + "）",
        valueScore: sc.valueScore,
        wasteScore: sc.wasteScore,
        effortLoad: effort,
        impactRatio: impactRatio,
        isPruneCandidate: isPrune,
        theologyCategory: row.theologyCategory || "regular"
      };
    });
    var sortedValue = analyzed.slice().sort(function (a, b) { return b.valueScore - a.valueScore; });
    var topN = topFractionCount(analyzed.length);
    var top20Names = sortedValue.slice(0, topN).map(function (x) { return x.name; });
    var pruneList = analyzed.filter(function (x) { return x.isPruneCandidate; });
    var totalEffort = analyzed.reduce(function (a, x) { return a + x.effortLoad; }, 0);
    var topEffort = sortedValue.slice(0, topN).reduce(function (a, x) { return a + x.effortLoad; }, 0);
    var topImpact = sortedValue.slice(0, topN).reduce(function (a, x) { return a + x.valueScore; }, 0);
    var impactRatioAggregate =
      totalEffort > 0 ? round2(topImpact / (totalEffort * 4)) : 0;
    return applyUpstreamRowHints(
      {
        rows: analyzed,
        top20_names: top20Names,
        top20_count: topN,
        prune_candidates: pruneList,
        impact_ratio: impactRatioAggregate,
        effort_top20_pct: totalEffort > 0 ? Math.round((topEffort / totalEffort) * 100) : null,
        impact_top20_pct: analyzed.length
          ? Math.round((topN / analyzed.length) * 100)
          : null
      },
      upstream
    );
  }

  /** KPI≥70 強制剪枝 + NCD 最小因子優先檢視 */
  function applyUpstreamRowHints(analysis, upstream) {
    upstream = upstream || {};
    if (!analysis || !analysis.rows) return analysis;
    var ncdMin = upstream.ncd_minimum;
    var kpiStuck = upstream.kpi_resource_stuck;
    var forced = 0;
    analysis.rows = analysis.rows.map(function (row) {
      var r = Object.assign({}, row);
      if (kpiStuck != null && kpiStuck >= 70 && r.effortLoad >= 4 && r.impactRatio <= 0.45) {
        r.forced_prune = true;
        r.isPruneCandidate = true;
        r.prune_reason = "KPI 資源卡關 " + kpiStuck + "%";
        forced++;
      }
      if (ncdMin && ncdMin.id) {
        if (ncdMin.id === "functional" && r.wasteScore >= 10) {
          r.ncd_priority = true;
        }
        if (ncdMin.id === "passion" && (r.wasteScore >= 8 || r.impactRatio <= 0.4)) {
          r.ncd_priority = true;
        }
      }
      return r;
    });
    analysis.prune_candidates = analysis.rows.filter(function (x) {
      return x.isPruneCandidate;
    });
    analysis.forced_prune_count = forced;
    if (ncdMin && ncdMin.label) {
      analysis.ncd_priority_review = {
        id: ncdMin.id,
        label: ncdMin.label,
        score: ncdMin.score,
        hint: "NCD 最小因子 — 工作坊優先檢視與此破口相關事工"
      };
    }
    return analysis;
  }

  function loadUpstreamChain(store) {
    store = store || global.AssessmentRunStore;
    if (!store || typeof store.loadLatest !== "function") {
      return { ok: false, source: "store_missing", runs: {} };
    }
    var ncd = store.loadLatest("ncd");
    var swot = store.loadLatest("swot");
    var kpi = store.loadLatest("kpiokr");
    var matrix = swot && swot.derived && swot.derived.matrix_result;
    return {
      ok: !!(ncd || swot || kpi),
      source: "assessment_run_store",
      runs: { ncd: ncd, swot: swot, kpiokr: kpi },
      ncd_minimum: ncd && ncd.derived && ncd.derived.minimum_factor ? ncd.derived.minimum_factor : null,
      swot_primary:
        (swot && swot.derived && swot.derived.focus_strategy) ||
        (matrix && matrix.primary_strategy) ||
        null,
      kpi_resource_stuck:
        kpi && kpi.derived && kpi.derived.resource_stuck_rate != null
          ? kpi.derived.resource_stuck_rate
          : null,
      kpi_health:
        kpi && kpi.derived && kpi.derived.pillar_health_score != null
          ? kpi.derived.pillar_health_score
          : null
    };
  }

  function computeRiskFlags(analysis, answeredRows) {
    var flags = [];
    if (answeredRows < THRESHOLDS.min_rows) flags.push("LOW_SAMPLE");
    if (analysis.prune_candidates.length >= 2) flags.push("PRUNE_CLUSTER");
    if (analysis.impact_ratio != null && analysis.impact_ratio < THRESHOLDS.impact_ratio_low) {
      flags.push("IMPACT_DRAIN");
    }
    return flags;
  }

  function buildCoaching(analysis, flags, upstream) {
    var growth =
      analysis.top20_names.length
        ? "前 20% 高價值事工：" + analysis.top20_names.slice(0, 3).join("、") + " — 建議下季資源優先傾斜。"
        : "請至少列出 3 項事工再分析帕累托分布。";
    var collab =
      flags.indexOf("PRUNE_CLUSTER") >= 0
        ? "剪枝候選 ≥2：長執會宜分批討論，先處理「高行政耗損、低屬靈影響」者，避免一次砍掉所有傳統。"
        : "邀請事工負責人各自說明：這事工若暫停三個月，誰會受傷？誰會鬆一口氣？";
    var redflag =
      upstream && upstream.kpi_resource_stuck != null && upstream.kpi_resource_stuck >= 70
        ? "⚠️ KPI 資源卡關率 " + upstream.kpi_resource_stuck + "%：本 80/20 工作坊應直接對準卡關 KR，勿另起新案。"
        : flags.indexOf("IMPACT_DRAIN") >= 0
          ? "⚠️ 整體效益比偏低：團隊可能在 80% 瑣事上耗盡 20% 關鍵影響力，請啟動 Tab④ 剪枝腳本。"
          : "HITL：剪枝決議須牧者主持，本儀表僅供禱告分辨。";
    return { growth: growth, collaboration: collab, redflag: redflag };
  }

  function validate(rows) {
    var list = Array.isArray(rows) ? rows : [];
    var named = list.filter(function (r) { return trim(r && r.name).length > 0; });
    var errors = [];
    if (named.length < THRESHOLDS.min_rows) {
      errors.push("請至少填寫 " + THRESHOLDS.min_rows + " 項具名事工（目前 " + named.length + " 項）");
    }
    named.forEach(function (r, i) {
      ["missionFit", "fruit", "adminBurden"].forEach(function (k) {
        var v = Number(r[k]);
        if (!isFinite(v) || v < 1 || v > 5) errors.push("事工「" + r.name + "」的 " + k + " 須為 1–5");
      });
    });
    return { ok: errors.length === 0, errors: errors, rows: named, count: named.length };
  }

  function buildRun(rows, profile, opts) {
    opts = opts || {};
    var check = validate(rows);
    if (!check.ok) return { ok: false, errors: check.errors };
    var upstream = opts.skip_upstream ? null : loadUpstreamChain();
    var analysis = analyzeRows(check.rows, upstream);
    var flags = computeRiskFlags(analysis, check.count);
    var raw_answers = check.rows.map(function (r, i) {
      return {
        q: "ministry_" + (i + 1),
        dim: "pareto",
        value: ministryRowScores(r).valueScore,
        label: r.name
      };
    });
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      profile: Object.assign({ church_name: "", facilitator: "" }, profile || {}),
      authenticity_score: round2(check.count / Math.max(check.count, 10)),
      feature_vector: { G: analysis.impact_ratio * 20, C: analysis.effort_top20_pct || 0, F: 100 - analysis.prune_candidates.length * 10 },
      upstream_snapshot: upstream && upstream.ok ? upstream : null,
      derived: {
        analysis: analysis,
        impact_ratio: analysis.impact_ratio,
        effort_top20_pct: analysis.effort_top20_pct,
        prune_count: analysis.prune_candidates.length,
        row_count: check.count
      },
      raw_answers: raw_answers,
      raw_ministry_rows: check.rows,
      risk_flags: flags,
      coaching: buildCoaching(analysis, flags, upstream),
      source_note: "eightytwenty_pack v" + PACK_VERSION
    };
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var rows = [
      { name: "主日講道與門訓", missionFit: 5, fruit: 4, adminBurden: 3, effortLoadIndex: 4, theologyCategory: "core" },
      { name: "青年週五聚會", missionFit: 4, fruit: 4, adminBurden: 2, effortLoadIndex: 3, theologyCategory: "core" },
      { name: "兒童主日學", missionFit: 4, fruit: 3, adminBurden: 3, effortLoadIndex: 3, theologyCategory: "regular" },
      { name: "週報行政彙整", missionFit: 1, fruit: 1, adminBurden: 5, effortLoadIndex: 5, theologyCategory: "admin" },
      { name: "年度特會籌備", missionFit: 2, fruit: 2, adminBurden: 5, effortLoadIndex: 5, theologyCategory: "regular" },
      { name: "社區關懷探訪", missionFit: 4, fruit: 3, adminBurden: 2, effortLoadIndex: 2, theologyCategory: "core" },
      { name: "敬拜團練習", missionFit: 3, fruit: 3, adminBurden: 3, effortLoadIndex: 3, theologyCategory: "regular" },
      { name: "長執會行政會議", missionFit: 2, fruit: 2, adminBurden: 4, effortLoadIndex: 4, theologyCategory: "admin" },
      { name: "新同工培訓", missionFit: 4, fruit: 3, adminBurden: 2, effortLoadIndex: 2, theologyCategory: "core" },
      { name: "舊照片數位化", missionFit: 1, fruit: 1, adminBurden: 4, effortLoadIndex: 4, theologyCategory: "admin" }
    ];
    var built = buildRun(rows, { church_name: "示範堂", facilitator: "長執主席" }, { skip_upstream: true });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.EightytwentyPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    PACK_VERSION: PACK_VERSION,
    THRESHOLDS: THRESHOLDS,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    loadUpstreamChain: loadUpstreamChain,
    analyzeRows: analyzeRows,
    applyUpstreamRowHints: applyUpstreamRowHints,
    ministryRowScores: ministryRowScores
  };
})(typeof window !== "undefined" ? window : global);
