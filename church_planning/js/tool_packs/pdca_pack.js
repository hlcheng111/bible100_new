/**
 * PDCA 戴明循環（pdca）· Church OS 治理鏈
 * Weick Small Wins · Deming Δ_variance · pdca_contract SSOT
 * 上游：AssessmentRunStore.loadLatest('swot'|'kpiokr'|'ncd'|'smart') — 禁止硬編碼假數據（示範須 is_demo）
 */
(function (global) {
  "use strict";

  var TOOL_ID = "pdca";
  var TOOL_LABEL = "教會版 PDCA";
  var PACK_VERSION = 2;
  var DEMING_ALERT_THRESHOLD = 2.5;
  var SMALL_WIN_FORTNIGHTS = 4;

  var PHASE_LABELS = {
    plan: "Plan 計畫",
    do: "Do 執行",
    check: "Check 檢核",
    act: "Act 調整"
  };

  var WO_ANCHOR_MSG =
    "依據 SWOT 戰略矩陣，本季核心計畫已由系統自動錨定為：【WO 轉變／內部排毒戰略】— 以社區外展為祭壇的靈性重燃，優先修補破口再談擴張。";

  /** 12 題 Likert · Plan/Do/Check/Act 各 3 題 */
  var QUESTIONS = [
    { id: "P1", phase: "plan", label: "本季計畫寫得清楚：誰受益、看見什麼改變、何時檢核（非活動清單）。" },
    { id: "P2", phase: "plan", label: "大目標已切碎為兩週可感知的微小進度（Small Wins），同工說得出具體下一步。" },
    { id: "P3", phase: "plan", label: "計畫與 SWOT／五年異象主軸對齊，長執會已禱告分辨過優先序。" },
    { id: "D1", phase: "do", label: "資源（人力、預算、時間）已按計畫配置，小事上忠心可見。" },
    { id: "D2", phase: "do", label: "執行過程有跟進節奏（例：雙週檢點），不是開會後石沉大海。" },
    { id: "D3", phase: "do", label: "遇到延遲或衝突時，有權責人調整而非互相指責。" },
    { id: "C1", phase: "check", label: "我們誠實面對落差：數據與觀察並陳，不粉飾、不隱瞞。" },
    { id: "C2", phase: "check", label: "檢核時先問「神教會我們什麼」，再談資源或人事。" },
    { id: "C3", phase: "check", label: "季度節奏健康：團隊可持續，未陷入透支或交差文化。" },
    { id: "A1", phase: "act", label: "願意修剪僵化事工，把資源傾向已驗證的破口修補。" },
    { id: "A2", phase: "act", label: "微小勝利有被慶祝與記錄，激勵同工而非只追大目標。" },
    { id: "A3", phase: "act", label: "下一輪 PDCA 行動明確：誰、何時、如何再檢核。" }
  ];

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function round1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  function avgPhase(answers, phase) {
    var vals = [];
    QUESTIONS.forEach(function (q) {
      if (q.phase !== phase) return;
      var v = Number(answers[q.id]);
      if (v >= 1 && v <= 5) vals.push(v);
    });
    if (!vals.length) return null;
    return round2(vals.reduce(function (s, x) { return s + x; }, 0) / vals.length);
  }

  /** 活體上游鏈路 — 僅讀 AssessmentRunStore */
  function loadUpstreamChain(store) {
    store = store || global.AssessmentRunStore;
    if (!store || typeof store.loadLatest !== "function") {
      return { ok: false, source: "store_missing", runs: {} };
    }
    var swot = store.loadLatest("swot");
    var kpi = store.loadLatest("kpiokr");
    var ncd = store.loadLatest("ncd");
    var smart = store.loadLatest("smart");
    var culture = store.loadLatest("culture");

    var matrix = swot && swot.derived && swot.derived.matrix_result;
    var contract = swot && swot.pdca_contract ? swot.pdca_contract : swot && swot.derived && swot.derived.swot_contract;
    if (!contract && swot && swot.swot_contract) contract = swot.swot_contract;
    if (!contract && swot && swot.derived && swot.derived.swot_contract) contract = swot.derived.swot_contract;

    var primary = (swot && swot.derived && swot.derived.focus_strategy) ||
      (matrix && matrix.primary_strategy) ||
      (contract && contract.primary_strategy) ||
      null;
    var pastoralOverride = matrix && matrix.pastoral_override ? matrix.pastoral_override : null;
    var deltaSwot = matrix && matrix.Delta_Variance != null ? matrix.Delta_Variance : null;

    return {
      ok: !!(swot || kpi || ncd),
      source: "assessment_run_store",
      runs: { swot: swot, kpiokr: kpi, ncd: ncd, smart: smart, culture: culture },
      swot_primary: primary,
      pastoral_override: pastoralOverride,
      swot_delta_variance: deltaSwot,
      kpi_health:
        kpi && kpi.derived && kpi.derived.pillar_health_score != null
          ? kpi.derived.pillar_health_score
          : null,
      ncd_minimum:
        ncd && ncd.derived && ncd.derived.minimum_factor ? ncd.derived.minimum_factor : null,
      timestamps: {
        swot: swot && swot.timestamp,
        kpiokr: kpi && kpi.timestamp,
        ncd: ncd && ncd.timestamp,
        smart: smart && smart.timestamp
      }
    };
  }

  function buildSmallWins(planFocus, P_target) {
    var focus = String(planFocus || "本季焦點事工").slice(0, 80);
    var wins = [];
    for (var i = 0; i < SMALL_WIN_FORTNIGHTS; i++) {
      wins.push({
        id: "sw_" + (i + 1),
        fortnight: i + 1,
        label: "第 " + (i * 2 + 1) + "–" + (i * 2 + 2) + " 週：" + focus + " 可感知進度",
        metric: P_target != null ? "目標強度基線 " + P_target + "/5" : "待填",
        status: "pending"
      });
    }
    return wins;
  }

  function resolveStrategicAnchor(upstream) {
    upstream = upstream || {};
    if (upstream.pastoral_override || upstream.swot_primary === "WO") {
      return {
        text: WO_ANCHOR_MSG,
        highlight: true,
        code: "WO"
      };
    }
    if (upstream.swot_primary) {
      return {
        text:
          "依據 SWOT 戰略矩陣，本季主軸錨定為【" +
          upstream.swot_primary +
          "】— 請在 Plan 對齊具體行動。",
        highlight: false,
        code: upstream.swot_primary
      };
    }
    return { text: null, highlight: false, code: null };
  }

  /**
   * Deming Δ_variance = P_target − D_actual
   * velocity_score：Small Wins 推進率（Do 相對 Plan + Act 收尾）
   */
  function calculateDemingMetrics(P_target, D_actual, actAvg) {
    P_target = P_target != null ? Number(P_target) : null;
    D_actual = D_actual != null ? Number(D_actual) : null;
    var Delta_variance =
      P_target != null && D_actual != null ? round2(P_target - D_actual) : null;
    var deming_alert = Delta_variance != null && Delta_variance >= DEMING_ALERT_THRESHOLD;
    var velocity_score = null;
    if (P_target != null && P_target > 0 && D_actual != null) {
      var ratio = Math.min(1.2, D_actual / P_target);
      var actBoost = actAvg != null ? (actAvg - 3) * 5 : 0;
      velocity_score = Math.round(Math.min(100, Math.max(0, ratio * 70 + actBoost + 15)));
    }
    return {
      Delta_variance: Delta_variance,
      deming_alert: deming_alert,
      velocity_score: velocity_score,
      algorithm: "Deming_Variance_v1",
      formula: "Delta_variance = P_target - D_actual"
    };
  }

  function buildPdcaContract(answers, profile, upstream) {
    upstream = upstream || loadUpstreamChain();
    profile = profile || {};
    answers = answers || {};

    var P_target = avgPhase(answers, "plan");
    var D_actual = avgPhase(answers, "do");
    var checkAvg = avgPhase(answers, "check");
    var actAvg = avgPhase(answers, "act");
    var deming = calculateDemingMetrics(P_target, D_actual, actAvg);
    var anchor = resolveStrategicAnchor(upstream);

    var doTraffic =
      D_actual == null
        ? "unknown"
        : D_actual >= 4
          ? "green"
          : D_actual >= 3
            ? "yellow"
            : "red";

    var completion_rate =
      P_target != null && D_actual != null && P_target > 0
        ? round2(Math.min(1, D_actual / P_target))
        : null;

    return {
      version: 1,
      schema: "pdca_contract",
      upstream_refs: {
        swot_timestamp: upstream.timestamps && upstream.timestamps.swot,
        kpiokr_timestamp: upstream.timestamps && upstream.timestamps.kpiokr,
        ncd_timestamp: upstream.timestamps && upstream.timestamps.ncd,
        smart_timestamp: upstream.timestamps && upstream.timestamps.smart,
        live_chain: upstream.source === "assessment_run_store"
      },
      plan_metrics: {
        P_target: P_target,
        check_avg: checkAvg,
        strategic_anchor: anchor.text,
        strategic_anchor_code: anchor.code,
        strategic_anchor_highlight: anchor.highlight,
        small_wins: buildSmallWins(profile.season_focus || profile.ministry_context, P_target),
        stewardship_note:
          "P（Plan）明白神的心意 — 哥林多前書 4:2：管家須被發現是忠心的。"
      },
      do_progress: {
        D_actual: D_actual,
        completion_rate: completion_rate,
        do_traffic_light: doTraffic,
        stewardship_note: "D（Do）在小事上忠心 — 資源配置與同工跟進。"
      },
      check_variance: Object.assign({}, deming, {
        check_avg: checkAvg,
        stewardship_note: "C（Check）誠實面對破口 — 不隱瞞數據、坦然面對 Δ。"
      }),
      act_commitments: {
        A_score: actAvg,
        prune_prompt: deming.deming_alert
          ? "Δ ≥ " + DEMING_ALERT_THRESHOLD + "：啟動止血降溫 — 暫停非核心新案、雙週禱告鏈。"
          : "順服聖靈修剪：深化有效事工，僵化者勇敢止血。",
        stewardship_note: "A（Act）順服修剪 — 好的深化，僵化的止血。"
      },
      kpi_link: upstream.kpi_health != null ? { pillar_health_score: upstream.kpi_health } : null,
      ncd_link: upstream.ncd_minimum || null
    };
  }

  function validate(answers) {
    var map = answers || {};
    var errors = [];
    var n = 0;
    QUESTIONS.forEach(function (q) {
      var v = Number(map[q.id]);
      if (v >= 1 && v <= 5) n++;
      else if (map[q.id] != null && map[q.id] !== "") errors.push(q.id + " 須為 1–5");
    });
    if (!n) errors.push("尚未作答");
    if (n > 0 && n < QUESTIONS.length) errors.push("請完成全部 " + QUESTIONS.length + " 題");
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: n };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };

    var upstream = loadUpstreamChain(opts.store);
    var pdca_contract = buildPdcaContract(check.answers, profile, upstream);
    var deming = pdca_contract.check_variance;
    var risk = [];
    if (deming.deming_alert) risk.push("DEMING_VARIANCE_ALERT");
    if (pdca_contract.plan_metrics.strategic_anchor_highlight) risk.push("SWOT_WO_ANCHOR");
    if (upstream.kpi_health != null && upstream.kpi_health < 50) risk.push("KPI_RESOURCE_WEAK");

    var derived = {
      pdca_contract: pdca_contract,
      matrix_result: deming,
      velocity_score: deming.velocity_score,
      Delta_variance: deming.Delta_variance,
      upstream_summary: {
        swot_primary: upstream.swot_primary,
        has_live_swot: !!(upstream.runs && upstream.runs.swot && !upstream.runs.swot.is_demo)
      },
      summary_line:
        "P_target=" +
        (pdca_contract.plan_metrics.P_target != null ? pdca_contract.plan_metrics.P_target : "—") +
        " · D_actual=" +
        (pdca_contract.do_progress.D_actual != null ? pdca_contract.do_progress.D_actual : "—") +
        " · Δ=" +
        (deming.Delta_variance != null ? deming.Delta_variance : "—") +
        " · velocity=" +
        (deming.velocity_score != null ? deming.velocity_score : "—")
    };

    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: null,
      profile: Object.assign(
        { ministry_context: "", season_focus: "", church_name: "", role: "board" },
        profile || {}
      ),
      authenticity_score: opts.is_demo ? 0.5 : 1,
      feature_vector: {
        P: pdca_contract.plan_metrics.P_target || 0,
        D: pdca_contract.do_progress.D_actual || 0,
        Delta_variance: deming.Delta_variance || 0,
        velocity_score: deming.velocity_score || 0
      },
      derived: derived,
      pdca_contract: pdca_contract,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, phase: q.phase, value: check.answers[q.id] };
      }),
      risk_flags: risk,
      is_demo: !!opts.is_demo,
      source_note: "pdca_pack v" + PACK_VERSION + " · Weick Small Wins · Deming Δ"
    };
    return { ok: true, run: run };
  }

  function saveQuizRun(answers, profile) {
    var built = buildRun(answers, profile, {});
    if (!built.ok) return built;
    if (!global.AssessmentRunStore) return { ok: false, errors: ["AssessmentRunStore 未載入"] };
    var saved = AssessmentRunStore.saveRun(built.run);
    if (!saved.ok) return saved;
    return { ok: true, run: saved.run };
  }

  function buildPreviewFromUpstream() {
    var upstream = loadUpstreamChain();
    if (!upstream.ok || !upstream.runs.swot) return { ok: false };
    var swot = upstream.runs.swot;
    if (!swot || swot.is_demo) return { ok: false };
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.phase === "plan" ? 4 : q.phase === "do" ? 2 : 3;
    });
    var built = buildRun(answers, { season_focus: "上游 SWOT 預覽", ministry_context: "鏈路預覽" }, {});
    if (built.ok && built.run) {
      built.run.is_preview = true;
      built.run.source_note += " · upstream preview";
    }
    return built;
  }

  function clamp15(n) {
    return Math.max(1, Math.min(5, Math.round(Number(n) || 3)));
  }

  function planScoreFromWorkshop(cycle) {
    cycle = cycle || {};
    var rows = Array.isArray(cycle.planRows) ? cycle.planRows : [];
    var filled = rows.filter(function (r) {
      return r && String(r.action || "").trim();
    }).length;
    if (!filled && !String(cycle.planProblem || "").trim()) return 3;
    var base = 2 + filled * 0.75 + (String(cycle.planProblem || "").trim() ? 0.5 : 0);
    return round2(Math.min(5, base));
  }

  function doScoreFromWorkshop(cycle) {
    cycle = cycle || {};
    var map = { done: 5, partial: 3, none: 1, "": 2 };
    var rows = Array.isArray(cycle.doRows) ? cycle.doRows : [];
    if (!rows.length) return 2;
    var vals = rows.map(function (d) {
      return map[d && d.status ? d.status : ""] != null ? map[d.status] : 2;
    });
    var avg = vals.reduce(function (s, x) {
      return s + x;
    }, 0) / vals.length;
    if (cycle.doTrafficLight === "red") avg = Math.min(avg, 2);
    if (cycle.doTrafficLight === "yellow") avg = Math.min(avg, 3.2);
    return round2(avg);
  }

  function actScoreFromWorkshop(cycle) {
    cycle = cycle || {};
    var n = 0;
    if (String(cycle.actKeep || "").trim()) n++;
    if (String(cycle.actAdjust || "").trim()) n++;
    if (String(cycle.actStop || "").trim()) n++;
    if (String(cycle.actMustChange || "").trim()) n++;
    if (String(cycle.actOwner || "").trim()) n++;
    if (!n) return 3;
    return round2(Math.min(5, 2 + n * 0.6));
  }

  function deriveAnswersFromWorkshop(payload) {
    payload = payload || {};
    var cycle = payload.cycle || payload;
    var p = clamp15(planScoreFromWorkshop(cycle));
    var d = clamp15(doScoreFromWorkshop(cycle));
    var c = clamp15(payload.likertSel != null && payload.likertSel !== "" ? payload.likertSel : 3);
    var a = clamp15(actScoreFromWorkshop(cycle));
    var answers = {};
    QUESTIONS.forEach(function (q) {
      if (q.phase === "plan") answers[q.id] = p;
      else if (q.phase === "do") answers[q.id] = d;
      else if (q.phase === "check") answers[q.id] = c;
      else answers[q.id] = a;
    });
    return answers;
  }

  function answersFromRun(run) {
    var map = {};
    (run.raw_answers || []).forEach(function (row) {
      if (row && row.q) map[row.q] = row.value;
    });
    return map;
  }

  function formatWorkshopNotes(payload) {
    var c = payload.cycle || {};
    var season = payload.seasonLine || "";
    return {
      schema: "workshop_notes_v1",
      submitted_at: new Date().toISOString(),
      ministry_context: c.ministryContext || "",
      season_focus: season,
      linked_focus_label: c.linkedFocusLabel || "",
      linked_focus_source: c.linkedFocusSource || "none",
      plan: {
        problem: c.planProblem || "",
        rows: (c.planRows || []).map(function (r) {
          return {
            action: (r && r.action) || "",
            owner: (r && r.ownerRole) || "",
            eta: (r && r.eta) || ""
          };
        })
      },
      do: {
        rows: (c.doRows || []).map(function (d, i) {
          return {
            status: (d && d.status) || "",
            note: (d && d.actualNote) || "",
            plan_action: (c.planRows && c.planRows[i] && c.planRows[i].action) || ""
          };
        }),
        progress_notes: c.doProgressNotes || "",
        traffic_light: c.doTrafficLight || "green"
      },
      check: {
        outcome: c.checkOutcome || "",
        evidence: c.checkEvidence || "",
        gap: c.checkGap || "",
        rhythm_score:
          payload.likertSel != null && payload.likertSel !== "" ? Number(payload.likertSel) : null,
        rhythm_note: c.checkRhythmNote || ""
      },
      act: {
        keep: c.actKeep || "",
        adjust: c.actAdjust || "",
        stop: c.actStop || "",
        must_change: c.actMustChange || "",
        owner: c.actOwner || "",
        due_date: c.actDueDate || "",
        standardize: !!c.actStandardize
      }
    };
  }

  function backupLegacyPdcaLog(payload) {
    try {
      var c = payload.cycle;
      if (!c || !global.localStorage) return;
      var key = "chp2026-pdca-log";
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : { version: 1, cycles: [], seasonFocusLines: ["", "", ""] };
      if (!parsed.cycles) parsed.cycles = [];
      parsed.seasonFocusLines = parsed.seasonFocusLines || ["", "", ""];
      parsed.seasonFocusLines[0] = payload.seasonLine || "";
      var idx = -1;
      parsed.cycles.forEach(function (x, i) {
        if (x && x.id === "pdca-wizard-main") idx = i;
      });
      if (idx >= 0) parsed.cycles[idx] = c;
      else parsed.cycles.unshift(c);
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch (e) {}
  }

  function applyWorkshopUpstreamPrefill(cycle, seasonLine) {
    cycle = cycle || {};
    var upstream = loadUpstreamChain();
    seasonLine = seasonLine || "";
    if (upstream.ncd_minimum && !String(cycle.planProblem || "").trim()) {
      cycle.planProblem =
        "【NCD 破口優先】「" +
        (upstream.ncd_minimum.label || "健康破口") +
        "」— 本季計畫須對齊此修補主軸。";
    }
    if (upstream.pastoral_override || upstream.swot_primary === "WO") {
      if (!String(seasonLine).trim()) seasonLine = WO_ANCHOR_MSG.slice(0, 160);
      cycle.linkedFocusLabel = "SWOT · WO 轉變／內部排毒";
      cycle.linkedFocusSource = "swot_store";
    } else if (upstream.swot_primary) {
      if (!String(seasonLine).trim()) {
        seasonLine = "對齊 SWOT 戰略主軸：「" + upstream.swot_primary + "」";
      }
      cycle.linkedFocusLabel = "SWOT · " + upstream.swot_primary;
      cycle.linkedFocusSource = "swot_store";
    }
    if (upstream.kpi_health != null && !String(cycle.ministryContext || "").trim()) {
      cycle.ministryContext = "KPI 健康 " + upstream.kpi_health + " · 季度迴圈";
    }
    var first = cycle.planRows && cycle.planRows[0];
    if (first && !String(first.action || "").trim() && upstream.swot_primary) {
      first.action =
        "落實「" +
        upstream.swot_primary +
        "」：具體行動（誰受益、何時檢核）";
    }
    return { cycle: cycle, seasonLine: seasonLine, upstream: upstream };
  }

  function mergeWorkshop(payload) {
    payload = payload || {};
    if (!payload.cycle) return { ok: false, errors: ["缺少工作坊資料"] };
    var store = global.AssessmentRunStore;
    if (!store) return { ok: false, errors: ["AssessmentRunStore 未載入"] };

    var latest = store.loadLatest(TOOL_ID);
    var answers;
    var trackNote = "B軌工作坊";
    if (latest && !latest.is_demo && latest.raw_answers && latest.raw_answers.length >= 12) {
      answers = answersFromRun(latest);
      trackNote = "A+B 雙軌合流";
    } else {
      answers = deriveAnswersFromWorkshop(payload);
    }

    var profile = {
      ministry_context: payload.cycle.ministryContext || "",
      season_focus: payload.seasonLine || "",
      role: "board",
      track: "workshop"
    };
    var built = buildRun(answers, profile, {});
    if (!built.ok) return built;

    var notes = formatWorkshopNotes(payload);
    built.run.pdca_contract.workshop_notes = notes;
    built.run.profile.track = trackNote;
    built.run.source_note += " · " + trackNote;

    var deming = built.run.pdca_contract.check_variance;
    var plan = built.run.pdca_contract.plan_metrics;
    var doing = built.run.pdca_contract.do_progress;
    built.run.derived.summary_line =
      (profile.ministry_context || "本季事工") +
      " · 計畫 " +
      (plan.P_target != null ? plan.P_target : "—") +
      " · 執行 " +
      (doing.D_actual != null ? doing.D_actual : "—") +
      " · Δ=" +
      (deming.Delta_variance != null ? deming.Delta_variance : "—") +
      " · " +
      trackNote;

    backupLegacyPdcaLog(payload);
    var saved = store.saveRun(built.run);
    if (!saved.ok) return saved;
    return { ok: true, run: saved.run || built.run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.phase === "plan" ? 5 : q.phase === "do" ? 2 : 3;
    });
    var built = buildRun(
      answers,
      { season_focus: "靈性重燃試行", ministry_context: "示範季度", church_name: "示範堂" },
      { is_demo: true }
    );
    if (!built.ok || !built.run) return built;
    var contract = built.run.pdca_contract;
    var plan = contract.plan_metrics;
    var doing = contract.do_progress;
    var chk = contract.check_variance;
    plan.P_target = 4.8;
    doing.D_actual = 2;
    chk.Delta_variance = 2.8;
    chk.deming_alert = true;
    chk.velocity_score = chk.velocity_score != null ? chk.velocity_score : 38;
    if (built.run.derived) {
      built.run.derived.Delta_variance = 2.8;
      built.run.derived.summary_line =
        "示範：計畫 4.8 · 執行 2.0 · 落差 Δ=2.8（警戒）· 微小勝利推進率 " +
        (chk.velocity_score != null ? chk.velocity_score : "—");
    }
    built.run.feature_vector.Delta_variance = 2.8;
    if (!built.run.risk_flags) built.run.risk_flags = [];
    if (built.run.risk_flags.indexOf("DEMING_VARIANCE_ALERT") < 0) {
      built.run.risk_flags.push("DEMING_VARIANCE_ALERT");
    }
    return built;
  }

  global.PdcaPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    PHASE_LABELS: PHASE_LABELS,
    DEMING_ALERT_THRESHOLD: DEMING_ALERT_THRESHOLD,
    WO_ANCHOR_MSG: WO_ANCHOR_MSG,
    loadUpstreamChain: loadUpstreamChain,
    buildPdcaContract: buildPdcaContract,
    calculateDemingMetrics: calculateDemingMetrics,
    validate: validate,
    buildRun: buildRun,
    saveQuizRun: saveQuizRun,
    buildPreviewFromUpstream: buildPreviewFromUpstream,
    buildDemoRun: buildDemoRun,
    mergeWorkshop: mergeWorkshop,
    formatWorkshopNotes: formatWorkshopNotes,
    deriveAnswersFromWorkshop: deriveAnswersFromWorkshop,
    applyWorkshopUpstreamPrefill: applyWorkshopUpstreamPrefill
  };
})(typeof window !== "undefined" ? window : global);
