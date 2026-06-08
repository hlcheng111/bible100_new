/**
 * 神國標竿導航儀 · 目標與衡量對齊（kpiokr）
 * 12 題 Likert · 四向度 rollup · 非人事考核
 */
(function (global) {
  "use strict";

  var TOOL_ID = "kpiokr";
  var TOOL_LABEL = "目標與衡量對齊";
  var PACK_VERSION = 1;

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var DIM_KEYS = ["kr_quality", "vision_align", "review_rhythm", "pastoral_balance"];

  var DIM_LABELS = {
    kr_quality: "KR｜結果可見",
    vision_align: "異象｜標竿對齊",
    review_rhythm: "節奏｜回顧共學",
    pastoral_balance: "生命｜同工與門訓"
  };

  var QUESTIONS = [
    {
      id: "kpi_kr1",
      dim: "kr_quality",
      section: "KR｜結果可見（3 題）",
      label: "我們的「關鍵結果」描述的是可觀察的改變，而不是活動清單（例：探訪次數 vs 被探訪者感到被記念）。"
    },
    {
      id: "kpi_kr2",
      dim: "kr_quality",
      section: null,
      label: "每項 KR 都有清楚的資料來源、基準值與目標值，團隊能說出「從哪裡看見進展」。"
    },
    {
      id: "kpi_kr3",
      dim: "kr_quality",
      section: null,
      label: "我們避免用單一出席數字代表整體聖工健康，會搭配生命與關係指標一起看。"
    },
    {
      id: "kpi_v1",
      dim: "vision_align",
      section: "異象｜標竿對齊（3 題）",
      label: "年度／五年目標能追溯到本堂異象與核心價值，不是臨時起意的新計畫。"
    },
    {
      id: "kpi_v2",
      dim: "vision_align",
      section: null,
      label: "長執與事工負責人對「今年要守住哪一條主線」有共同語言。"
    },
    {
      id: "kpi_v3",
      dim: "vision_align",
      section: null,
      label: "若 NCD／SWOT 已指出破口，本年度 KR 有呼應該破口，而非另起爐灶。"
    },
    {
      id: "kpi_r1",
      dim: "review_rhythm",
      section: "節奏｜回顧共學（3 題）",
      label: "我們有固定（至少季度）回顧 KR 的節奏，而不是年底才發現偏離。"
    },
    {
      id: "kpi_r2",
      dim: "review_rhythm",
      section: null,
      label: "回顧會以「學習與調整」為主，而非追責或排名。"
    },
    {
      id: "kpi_r3",
      dim: "review_rhythm",
      section: null,
      label: "卡關時，團隊願意公開討論資源、後勤或權責缺口，而不是隱藏數字。"
    },
    {
      id: "kpi_p1",
      dim: "pastoral_balance",
      section: "生命｜同工與門訓（3 題）",
      label: "我們同時追蹤事工產出與同工健康、門訓深度，不會只衝數字。"
    },
    {
      id: "kpi_p2",
      dim: "pastoral_balance",
      section: null,
      label: "若 KR 達標但同工明顯過勞，長執會願意調整目標或資源，而非硬撐。"
    },
    {
      id: "kpi_p3",
      dim: "pastoral_balance",
      section: null,
      label: "衡量指標的設計經過牧者／小組長把關，避免讓弟兄姊妹產生罪咎或比較心。"
    }
  ];

  var DIM_PROJECTION = {
    kr_quality: { P: 0.05, S: 0.1, G: 0.2, C: 0.45, R: 0.1, F: 0.1 },
    vision_align: { P: 0.1, S: 0.15, G: 0.35, C: 0.25, R: 0.1, F: 0.05 },
    review_rhythm: { P: 0.1, S: 0.05, G: 0.35, C: 0.3, R: 0.15, F: 0.05 },
    pastoral_balance: { P: 0.35, S: 0.25, G: 0.05, C: 0.1, R: 0.2, F: 0.05 }
  };

  var THRESHOLDS = {
    green: 4.0,
    yellow: 2.8,
    min_answered: 12,
    health_low: 50,
    kr_low: 45,
    trust_low: 3.0
  };

  var FLAG_DESCRIPTIONS = {
    LOW_COMPLETION: "作答少於 " + THRESHOLDS.min_answered + " 題，報告僅供初步對話。",
    KR_AS_TASK_LIST: "KR 向度偏低：指標可能仍是「活動清單」，宜改寫為可觀察的生命改變。",
    VISION_DRIFT: "異象對齊偏低：年度標竿可能與五年異象或 NCD／SWOT 破口脫節。",
    NO_REVIEW_RHYTHM: "回顧節奏不足：容易年底才發現偏航，建議建立季度學習式檢視。",
    PASTORAL_BLIND: "生命向度偏低：有只衝數字、忽略同工與門訓的風險。",
    RESOURCE_STUCK: "聖工健康度偏低且回顧節奏弱：多為資源／後勤卡關，建議連動 80/20 精簡次要事工。"
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function normalizeAnswers(input) {
    var map = {};
    if (!input) return map;
    if (Array.isArray(input)) {
      input.forEach(function (row) {
        if (row && row.q != null) map[row.q] = Number(row.value);
      });
      return map;
    }
    Object.keys(input).forEach(function (k) {
      if (input[k] != null && input[k] !== "") map[k] = Number(input[k]);
    });
    return map;
  }

  function avgValues(values) {
    var nums = values.filter(function (v) {
      return v != null && isFinite(v);
    });
    if (!nums.length) return null;
    return round1(nums.reduce(function (a, b) { return a + b; }, 0) / nums.length);
  }

  function computeDimScores(answerMap) {
    var buckets = {};
    DIM_KEYS.forEach(function (k) { buckets[k] = []; });
    QUESTIONS.forEach(function (q) {
      var v = answerMap[q.id];
      if (v != null && isFinite(v) && v >= 1 && v <= 5 && buckets[q.dim]) {
        buckets[q.dim].push(v);
      }
    });
    var out = {};
    DIM_KEYS.forEach(function (k) {
      out[k] = avgValues(buckets[k]);
    });
    return out;
  }

  function dimToPercent(avg) {
    if (avg == null || !isFinite(avg)) return null;
    return Math.round((avg / 5) * 100);
  }

  function aggregateFromDimScores(dimScores) {
    var parts = DIM_KEYS.map(function (k) { return dimScores[k]; }).filter(function (x) { return x != null; });
    var overallAvg = parts.length ? parts.reduce(function (a, b) { return a + b; }, 0) / parts.length : null;
    return {
      pillar_health_score: dimToPercent(overallAvg),
      kr_clarity_score: dimToPercent(dimScores.kr_quality),
      vision_tether_score: dimToPercent(dimScores.vision_align),
      review_rhythm_score: dimToPercent(dimScores.review_rhythm),
      pastoral_balance_score: dimToPercent(dimScores.pastoral_balance),
      resource_feedback_score: dimToPercent(
        avgValues([dimScores.review_rhythm, dimScores.pastoral_balance].filter(function (x) { return x != null; }))
      )
    };
  }

  function computeFeatureVector(answerMap) {
    var items = [];
    QUESTIONS.forEach(function (q) {
      var v = Number(answerMap[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) return;
      items.push({ value: v, projection: DIM_PROJECTION[q.dim] || DIM_PROJECTION.kr_quality });
    });
    if (global.CTAOSRuntime && global.CTAOSRuntime.scoreByProjection) {
      return global.CTAOSRuntime.scoreByProjection(items);
    }
    var sums = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    var weights = { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
    items.forEach(function (item) {
      var normalized = ((Math.max(1, Math.min(5, item.value)) - 1) / 4) * 100;
      DIMENSIONS.forEach(function (d) {
        var w = (item.projection && item.projection[d]) || 0;
        if (w <= 0) return;
        sums[d] += normalized * w;
        weights[d] += w;
      });
    });
    var out = {};
    DIMENSIONS.forEach(function (d) {
      out[d] = weights[d] > 0 ? round1(sums[d] / weights[d]) : 0;
    });
    return out;
  }

  function computeRiskFlags(dimScores, agg, answeredCount) {
    var flags = [];
    if (answeredCount < THRESHOLDS.min_answered) flags.push("LOW_COMPLETION");
    if (agg.kr_clarity_score != null && agg.kr_clarity_score < THRESHOLDS.kr_low) flags.push("KR_AS_TASK_LIST");
    if (agg.vision_tether_score != null && agg.vision_tether_score < THRESHOLDS.kr_low) flags.push("VISION_DRIFT");
    if (agg.review_rhythm_score != null && agg.review_rhythm_score < THRESHOLDS.kr_low) flags.push("NO_REVIEW_RHYTHM");
    if (agg.pastoral_balance_score != null && agg.pastoral_balance_score < THRESHOLDS.kr_low) flags.push("PASTORAL_BLIND");
    if (
      agg.pillar_health_score != null &&
      agg.pillar_health_score < THRESHOLDS.health_low &&
      flags.indexOf("NO_REVIEW_RHYTHM") >= 0
    ) {
      flags.push("RESOURCE_STUCK");
    }
    return flags;
  }

  function buildCoaching(dimScores, agg, flags) {
    var growth =
      agg.vision_tether_score != null && agg.vision_tether_score >= 55
        ? "異象對齊尚可（" + agg.vision_tether_score + "）：把年度 KR 寫成「誰受益、看見什麼改變」兩句話，貼在長執會議程首頁。"
        : "異象對齊需加強：請對照五年異象與 NCD／SWOT 破口，確認今年只守一條主線。";
    var collab =
      flags.indexOf("NO_REVIEW_RHYTHM") >= 0
        ? "回顧節奏偏弱：建議建立季度「學習式檢視」——先問「神教會我們什麼」，再調資源。"
        : "邀請事工負責人彼此分享 KR 定義，避免各部門用不同字典談「達標」。";
    var redflag =
      flags.indexOf("RESOURCE_STUCK") >= 0
        ? "⚠️ 聖工健康度與回顧節奏雙弱：該事工多半不是同工不努力，而是資源與後勤卡關。建議長執會一鍵開啟 <a href=\"ministry-8020-planning.html\">80/20 精實減重</a>，暫緩次要事工，集中攻堅。"
        : flags.indexOf("PASTORAL_BLIND") >= 0
          ? "生命向度亮紅：請牧者把關，避免指標製造罪咎感；數字是為彼此扶持，不是淘汰。"
          : "若長期卡關且團隊士氣下滑，請主任牧師 facilitation；導航儀不能取代關係。";
    return {
      growth: growth,
      collaboration: collab,
      redflag: redflag,
      peer_questions: [
        "我們的 KR 是在量「神的收成」還是在量「我們有多忙」？",
        "誰會因這組指標最累？我們願意為他調整節奏嗎？",
        "下一個季度檢視，我們要先慶祝什麼、再調整什麼？"
      ],
      mentor_questions: [
        "這組衡量是否呼應五年異象與本季 SWOT 主線？",
        "若 KR 未達標，我們會先檢視資源還是先追問個人？",
        "什麼情況下應下調目標、暫停或尋求友堂支援？"
      ]
    };
  }

  function buildExecutiveDesk(dimScores, agg, flags) {
    var lines = [];
    lines.push("【長執桌摘要】聖工健康度 " + (agg.pillar_health_score != null ? agg.pillar_health_score : "—") + "/100");
    lines.push("KR 清晰度 " + (agg.kr_clarity_score != null ? agg.kr_clarity_score : "—") + " · 異象對齊 " + (agg.vision_tether_score != null ? agg.vision_tether_score : "—"));
    lines.push("回顧節奏 " + (agg.review_rhythm_score != null ? agg.review_rhythm_score : "—") + " · 生命平衡 " + (agg.pastoral_balance_score != null ? agg.pastoral_balance_score : "—"));
    if (flags.indexOf("RESOURCE_STUCK") >= 0) {
      lines.push("→ 建議動作：啟動 80/20 工作坊，精簡次要事工，把資源傾斜到卡關 KR。");
    } else if (flags.indexOf("VISION_DRIFT") >= 0) {
      lines.push("→ 建議動作：暫緩新指標，先回到 SWOT／五年異象對齊會。");
    } else {
      lines.push("→ 建議動作：選一項 KR 寫進 PDCA 季度檢核，並指定負責回顧的同工。");
    }
    return {
      summary_lines: lines,
      resource_tilt_hint: flags.indexOf("RESOURCE_STUCK") >= 0 ? "eighty_twenty" : null
    };
  }

  function buildMetricBridge(dimScores, agg) {
    function fmt(k) {
      return dimScores[k] != null ? dimScores[k].toFixed(1) : "—";
    }
    return (
      "聖工健康度 " +
      (agg.pillar_health_score != null ? agg.pillar_health_score : "—") +
      " ← avg(四向度) · KR=" +
      fmt("kr_quality") +
      " · 異象=" +
      fmt("vision_align") +
      " · 回顧=" +
      fmt("review_rhythm") +
      " · 生命=" +
      fmt("pastoral_balance")
    );
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    var s = d.dim_scores || {};
    return (
      "你是教會事工規劃顧問（非權威，僅供牧者審核）。\n" +
      "工具：神國標竿導航儀（目標與衡量對齊，非人事考核）\n" +
      "焦點：" +
      ((run.profile && run.profile.focus_label) || "—") +
      "\n" +
      "四向度：" +
      DIM_KEYS.map(function (k) { return DIM_LABELS[k] + "=" + (s[k] != null ? s[k] : "—"); }).join(" / ") +
      "\n" +
      "聖工健康度 " +
      (d.pillar_health_score != null ? d.pillar_health_score : "—") +
      "\n風險：" +
      ((run.risk_flags || []).join(", ") || "無") +
      "\n\n請產出：1) 年度 KR 白話摘要 2) 季度回顧三問 3) 資源傾斜建議\n" +
      "強調非考核；勿編造經文。"
    );
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var answeredCount = 0;
    QUESTIONS.forEach(function (q) {
      if (map[q.id] != null && isFinite(map[q.id])) {
        if (map[q.id] < 1 || map[q.id] > 5) errors.push(q.id + " 須為 1–5");
        else answeredCount++;
      }
    });
    if (!answeredCount) errors.push("尚未作答");
    if (answeredCount > 0 && answeredCount < QUESTIONS.length) {
      errors.push("請完成全部 " + QUESTIONS.length + " 題（目前 " + answeredCount + " 題）");
    }
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: answeredCount };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok || !check.answeredCount) {
      return { ok: false, errors: check.errors.length ? check.errors : ["尚無足夠作答"] };
    }
    var answerMap = check.answers;
    var dimScores = computeDimScores(answerMap);
    var agg = aggregateFromDimScores(dimScores);
    var risk_flags = computeRiskFlags(dimScores, agg, check.answeredCount);
    var coaching = buildCoaching(dimScores, agg, risk_flags);
    var raw_answers = QUESTIONS.map(function (q) {
      return { q: q.id, dim: q.dim, value: answerMap[q.id] != null ? answerMap[q.id] : null };
    });

    var run = {
      schema_version: PACK_VERSION,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ focus_label: "", season_label: "", team_name: "" }, profile || {}),
      authenticity_score: round1(check.answeredCount / QUESTIONS.length),
      feature_vector: computeFeatureVector(answerMap),
      derived: Object.assign(
        {
          dim_scores: dimScores,
          answered_count: check.answeredCount,
          question_total: QUESTIONS.length,
          metric_bridge: buildMetricBridge(dimScores, agg),
          executive_desk: buildExecutiveDesk(dimScores, agg, risk_flags)
        },
        agg
      ),
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: coaching,
      source_note: "kpi_pack v" + PACK_VERSION + " · " + check.answeredCount + "/" + QUESTIONS.length + " 題"
    };
    run.ai_prompt = buildAiPrompt(run);
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {
      kpi_kr1: 3, kpi_kr2: 2, kpi_kr3: 3,
      kpi_v1: 4, kpi_v2: 3, kpi_v3: 2,
      kpi_r1: 2, kpi_r2: 3, kpi_r3: 2,
      kpi_p1: 4, kpi_p2: 3, kpi_p3: 4
    };
    var built = buildRun(answers, {
      focus_label: "示範：青年門訓季度標竿",
      season_label: "2026 年度",
      team_name: "青年事工小組"
    });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.KpiPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    PACK_VERSION: PACK_VERSION,
    QUESTIONS: QUESTIONS,
    DIM_KEYS: DIM_KEYS,
    DIM_LABELS: DIM_LABELS,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildAiPrompt: buildAiPrompt,
    computeDimScores: computeDimScores,
    aggregateFromDimScores: aggregateFromDimScores
  };
})(typeof window !== "undefined" ? window : global);
