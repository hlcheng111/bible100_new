/**
 * 領袖健康診斷 · 工具包（pastoral）
 * 30 題封閉（A1–F5）· 七維 rollup · CTV 投影
 *
 * 隱私：禁止將 A6–F6 開放題寫入 assessment_run。
 * HITL：數據僅供煙霧警示，非人事考核；診斷須回到牧長一對一陪伴。
 *
 * 依賴（可選）：spiritual_health_scoring.js、pastoral_spiritual_health.js、CTAOSRuntime
 */
(function (global) {
  "use strict";

  var TOOL_ID = "pastoral";
  var TOOL_LABEL = "領袖健康診斷";

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var HITL_DISCLAIMER =
    "本報告是教會內部的「煙霧探測器」：提早發現耗盡、空轉等警訊，供長執開會時有共同基礎。" +
    "數據僅供警示，非人事考核、非績效排名。最終分辨與陪伴必須回到牧長／導師的一對一對話（Human-in-the-loop）。";

  /** 與 cta_os_bridge.js PASTORAL_DIM_MAP 100% 一致，勿改權重 */
  var DIM_PROJECTION = {
    joy: { P: 0.1, S: 0.45, G: 0, C: 0, R: 0.15, F: 0.3 },
    scripture_word: { P: 0.05, S: 0.65, G: 0, C: 0.1, R: 0.1, F: 0.1 },
    load_boundary: { P: 0.2, S: 0.1, G: 0.25, C: 0.35, R: 0.05, F: 0.05 },
    rest_family: { P: 0.4, S: 0.15, G: 0, C: 0.05, R: 0.2, F: 0.2 },
    team_support: { P: 0.15, S: 0.1, G: 0.05, C: 0.1, R: 0.5, F: 0.1 },
    emotion_stress: { P: 0.45, S: 0.25, G: 0, C: 0.1, R: 0.15, F: 0.05 },
    vision_mission: { P: 0.1, S: 0.2, G: 0.4, C: 0.15, R: 0.1, F: 0.05 }
  };

  var DIM_LABELS = {
    joy: "喜樂／被愛",
    scripture_word: "靈修與話語",
    load_boundary: "負荷與界線",
    rest_family: "休息與家庭",
    team_support: "團隊支持",
    emotion_stress: "情緒壓力",
    vision_mission: "異象與使命"
  };

  var CATEGORY_IDS = ["A", "B", "C", "D", "E", "F"];
  var CATEGORY_QUESTION_IDS = {
    A: ["A1", "A2", "A3", "A4", "A5"],
    B: ["B1", "B2", "B3", "B4", "B5"],
    C: ["C1", "C2", "C3", "C4", "C5"],
    D: ["D1", "D2", "D3", "D4", "D5"],
    E: ["E1", "E2", "E3", "E4", "E5"],
    F: ["F1", "F2", "F3", "F4", "F5"]
  };

  var QUESTION_MAP = {
    A1: { dim: "scripture_word", reversed: false },
    A2: { dim: "scripture_word", reversed: false },
    A3: { dim: "scripture_word", reversed: false },
    A4: { dim: "joy", reversed: false },
    A5: { dim: "joy", reversed: false },
    B1: { dim: "emotion_stress", reversed: false },
    B2: { dim: "emotion_stress", reversed: false },
    B3: { dim: "emotion_stress", reversed: false },
    B4: { dim: "emotion_stress", reversed: false },
    B5: { dim: "emotion_stress", reversed: false },
    C1: { dim: "load_boundary", reversed: false },
    C2: { dim: "rest_family", reversed: false },
    C3: { dim: "load_boundary", reversed: false },
    C4: { dim: "load_boundary", reversed: false },
    C5: { dim: "load_boundary", reversed: false },
    D1: { dim: "rest_family", reversed: false },
    D2: { dim: "team_support", reversed: false },
    D3: { dim: "load_boundary", reversed: false },
    D4: { dim: "team_support", reversed: false },
    D5: { dim: "team_support", reversed: false },
    E1: { dim: "vision_mission", reversed: false },
    E2: { dim: "vision_mission", reversed: false },
    E3: { dim: "vision_mission", reversed: false },
    E4: { dim: "vision_mission", reversed: false },
    E5: { dim: "vision_mission", reversed: false },
    F1: { dim: "team_support", reversed: false },
    F2: { dim: "team_support", reversed: false },
    F3: { dim: "team_support", reversed: false },
    F4: { dim: "vision_mission", reversed: false },
    F5: { dim: "vision_mission", reversed: false }
  };

  var QUESTIONS = Object.keys(QUESTION_MAP).map(function (id) {
    return { id: id, dim: QUESTION_MAP[id].dim, label: id + "（題幹見問卷頁）" };
  });

  var THRESHOLDS = { green: 4.0, yellow: 2.8, min_answered: 20 };

  var RISK_PRIORITY = [
    "burnout",
    "power",
    "spiritual_stagnation",
    "family",
    "performance",
    "numbness"
  ];
  var RISK_MAX_FLAGS = 4;

  var FLAG_DESCRIPTIONS = {
    LOW_COMPLETION:
      "填答還不完整——像煙霧探測器還沒接好線。請補填封閉題後再開會解讀，勿用半成品做決策。",
    BURNOUT:
      "【耗盡警訊】負荷高、內心壓力大、休息不足——核心車頭快沒油了。長執議程應先談「如何減負、強制安息」，而非加新活動或加預算。",
    POWER:
      "【權力盲點】身邊少有人敢說真話、孤立感偏高——決策容易變成「只有一個聲音」。宜先建立問責與外部導師，再談擴張。",
    SPIRITUAL_STAGNATION:
      "【屬靈空轉警訊】異象／靈修面向不算低，但團隊信任與人際極度吃緊——大家在「咬牙做對的事」，同工之間卻少愛。請先停會議、修復關係，別急著檢討績效。",
    FAMILY:
      "【家庭被擠到邊緣】服事投入高，家人陪伴感偏低——教會在消耗核心家庭。議程應包含休假、家庭日與節奏調整。",
    PERFORMANCE:
      "【績效陷阱】容易把教會成敗當成自我價值——數字好才覺得有用。宜重述「被神所愛的兒女」身分，而非只看人數。",
    NUMBNESS:
      "【心靈麻木】情緒覺察低、與神也覺得遠——不一定立刻爆發，但像引擎沒機油。宜先恢復短禱告、短安息與可信任對話。"
  };

  var TIER_COPY = {
    green: "🟢 綠燈｜飽滿區：油箱很滿，適合在節奏穩定下談開拓（仍須守安息）。",
    yellow: "🟡 黃燈｜耗損區：油燈閃爍，事工還在跑但私下健康在扣分——長執宜當剎車皮，砍掉次要雜務。",
    red: "🔴 紅燈｜熔斷區：引擎過熱——暫停新提案，唯一議程是如何讓同工放假、休養生息。"
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

  function levelFromScore(score) {
    if (global.levelFromScore) return global.levelFromScore(score);
    if (score == null || !isFinite(score)) return "red";
    if (score >= THRESHOLDS.green) return "green";
    if (score >= THRESHOLDS.yellow) return "yellow";
    return "red";
  }

  function computeDimScores(strAnswers) {
    if (global.computeDimensionScores && global.PASTORAL_QUESTION_MAP) {
      return global.computeDimensionScores(strAnswers, global.PASTORAL_QUESTION_MAP);
    }
    if (global.computeDimensionScores) {
      return global.computeDimensionScores(strAnswers, QUESTION_MAP);
    }
    var buckets = {};
    Object.keys(QUESTION_MAP).forEach(function (qid) {
      var v = Number(strAnswers[qid]);
      if (!isFinite(v) || v < 1 || v > 5) return;
      var dim = QUESTION_MAP[qid].dim;
      if (!buckets[dim]) buckets[dim] = { sum: 0, n: 0 };
      buckets[dim].sum += v;
      buckets[dim].n += 1;
    });
    var out = {};
    Object.keys(buckets).forEach(function (d) {
      if (buckets[d].n) out[d] = round1(buckets[d].sum / buckets[d].n);
    });
    return out;
  }

  function computeOverall(dimScores) {
    if (global.computeOverallScore) return global.computeOverallScore(dimScores);
    var vals = Object.keys(dimScores).map(function (k) {
      return dimScores[k];
    });
    if (!vals.length) return null;
    return round1(
      vals.reduce(function (a, b) {
        return a + b;
      }, 0) / vals.length
    );
  }

  function computeCategoryAvgs(map) {
    var avgs = {};
    CATEGORY_IDS.forEach(function (catId) {
      var ids = CATEGORY_QUESTION_IDS[catId];
      var sum = 0;
      var n = 0;
      ids.forEach(function (qid) {
        var v = map[qid];
        if (v != null && isFinite(v)) {
          sum += v;
          n += 1;
        }
      });
      avgs[catId] = n ? round1(sum / n) : null;
    });
    return avgs;
  }

  /** 鏡像 pastoral-spiritual-survey-pro.html riskRuleHit（P1 SSOT） */
  function riskRuleHit(ruleId, map, avgs) {
    var e3 = map.E3;
    var d4 = map.D4;
    var d1 = map.D1;
    if (ruleId === "burnout") {
      return avgs.C != null && avgs.B != null && avgs.C < 2.8 && avgs.B < 2.8;
    }
    if (ruleId === "performance") {
      return avgs.E != null && e3 != null && avgs.E < 3.0 && e3 >= 4;
    }
    if (ruleId === "power") {
      return avgs.F != null && d4 != null && avgs.F < 3.0 && d4 <= 2;
    }
    if (ruleId === "family") {
      return avgs.C != null && d1 != null && d1 <= 2 && avgs.C >= 3.5;
    }
    if (ruleId === "numbness") {
      return avgs.A != null && avgs.B != null && avgs.A < 3.0 && avgs.B < 3.0;
    }
    if (ruleId === "spiritual_stagnation") {
      return avgs.A != null && avgs.A >= 3.5 && avgs.D != null && avgs.D < 2.8;
    }
    return false;
  }

  function computeCrossRiskFlags(map, avgs) {
    var flags = [];
    for (var i = 0; i < RISK_PRIORITY.length; i++) {
      var rid = RISK_PRIORITY[i];
      if (riskRuleHit(rid, map, avgs)) flags.push(rid.toUpperCase());
      if (flags.length >= RISK_MAX_FLAGS) break;
    }
    return flags;
  }

  function computeRiskFlags(dimScores, overall, answeredCount, map, avgs) {
    var flags = [];
    if (answeredCount < THRESHOLDS.min_answered) flags.push("LOW_COMPLETION");
    flags = flags.concat(computeCrossRiskFlags(map, avgs));
    return flags;
  }

  function computeFeatureVector(dimScores) {
    var items = [];
    Object.keys(dimScores).forEach(function (dim) {
      var v = dimScores[dim];
      if (v == null || !isFinite(v)) return;
      items.push({
        value: v,
        projection: DIM_PROJECTION[dim] || { P: 0.15, S: 0.2, G: 0.15, C: 0.2, R: 0.15, F: 0.15 }
      });
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

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var answeredCount = 0;
    Object.keys(QUESTION_MAP).forEach(function (qid) {
      var v = map[qid];
      if (v == null || !isFinite(v)) return;
      answeredCount += 1;
      if (v < 1 || v > 5) errors.push(qid + " 須為 1–5");
    });
    if (!answeredCount) errors.push("尚未作答");
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: answeredCount };
  }

  function buildCoaching(dimScores, overall, flags) {
    var weakest = null;
    var weakestScore = 99;
    Object.keys(dimScores).forEach(function (dim) {
      if (dimScores[dim] < weakestScore) {
        weakestScore = dimScores[dim];
        weakest = dim;
      }
    });
    var tier = levelFromScore(overall);
    return {
      disclaimer: HITL_DISCLAIMER,
      tier_copy: TIER_COPY[tier] || TIER_COPY.yellow,
      growth:
        "優先關心「" +
        (DIM_LABELS[weakest] || "核心負擔") +
        "」——選一個未來四週可守住的小步（休息、對話或界線），勿一次改全部。",
      collaboration:
        flags.indexOf("BURNOUT") >= 0 || flags.indexOf("SPIRITUAL_STAGNATION") >= 0
          ? "長執開會前先問：「我們是否在要求一台快爆掉的引擎再加速？」必要時暫緩新事工表決。"
          : "與可信任導師約談，用本報告當對話起點，而非考核依據。",
      redflag: HITL_DISCLAIMER
    };
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    return (
      HITL_DISCLAIMER +
      "\n\n你是教會內部陪伴顧問（非權威，須牧者審核）。\n" +
      "工具：領袖健康診斷（僅封閉題彙總，不含開放心聲原文）\n" +
      "整體：" +
      (d.overall_score != null ? d.overall_score : "—") +
      "（" +
      (d.overall_level || "—") +
      "）\n" +
      "交叉警訊：" +
      ((run.risk_flags || []).join(", ") || "無") +
      "\n" +
      "CTV：P=" +
      run.feature_vector.P +
      " S=" +
      run.feature_vector.S +
      " G=" +
      run.feature_vector.G +
      " C=" +
      run.feature_vector.C +
      " R=" +
      run.feature_vector.R +
      " F=" +
      run.feature_vector.F +
      "\n\n" +
      "請產出：1) 四句式牧養摘要 2) 未來 30 天節奏建議 3) 給長執的三個「剎車皮」問題\n" +
      "勿編造經文；不宣稱屬靈權威；不確定處明說需當面查證。"
    );
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.answeredCount) {
      return { ok: false, errors: check.errors.length ? check.errors : ["尚無作答"] };
    }
    var map = check.answers;
    var strAnswers = {};
    Object.keys(map).forEach(function (k) {
      strAnswers[k] = String(map[k]);
    });

    var dimScores = computeDimScores(strAnswers);
    var categoryAvgs = computeCategoryAvgs(map);
    var overall = computeOverall(dimScores);
    var dimLevels = {};
    Object.keys(dimScores).forEach(function (k) {
      dimLevels[k] = levelFromScore(dimScores[k]);
    });

    var risk_flags = computeRiskFlags(dimScores, overall, check.answeredCount, map, categoryAvgs);
    var coaching = buildCoaching(dimScores, overall, risk_flags);

    var raw_answers = Object.keys(QUESTION_MAP).map(function (qid) {
      return { q: qid, value: map[qid] != null ? map[qid] : null };
    });

    var safeProfile = {};
    if (profile && typeof profile === "object") {
      ["p_church_size", "p_years_role", "p_team", "p_role", "label"].forEach(function (k) {
        if (profile[k] != null && profile[k] !== "") safeProfile[k] = profile[k];
      });
    }

    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: null,
      profile: safeProfile,
      authenticity_score: round1(check.answeredCount / 30),
      feature_vector: computeFeatureVector(dimScores),
      derived: {
        dim_scores: dimScores,
        dim_levels: dimLevels,
        category_avgs: categoryAvgs,
        overall_score: overall,
        overall_level: levelFromScore(overall),
        answered_count: check.answeredCount,
        tier_copy: TIER_COPY[levelFromScore(overall)] || ""
      },
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: coaching,
      source_note: "pastoral_pack v1 · " + check.answeredCount + "/30 封閉題（不含開放心聲）"
    };
    run.ai_prompt = buildAiPrompt(run);
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {
      A1: 5,
      A2: 2,
      A3: 4,
      A4: 3,
      A5: 4,
      B1: 2,
      B2: 2,
      B3: 2,
      B4: 2,
      B5: 2,
      C1: 2,
      C2: 2,
      C3: 2,
      C4: 2,
      C5: 2,
      D1: 3,
      D2: 2,
      D3: 3,
      D4: 2,
      D5: 3,
      E1: 2,
      E2: 2,
      E3: 5,
      E4: 2,
      E5: 2,
      F1: 2,
      F2: 2,
      F3: 2,
      F4: 2,
      F5: 2
    };
    var built = buildRun(answers, { label: "示範牧者" });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.PastoralPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    HITL_DISCLAIMER: HITL_DISCLAIMER,
    QUESTIONS: QUESTIONS,
    QUESTION_MAP: QUESTION_MAP,
    DIM_LABELS: DIM_LABELS,
    DIM_PROJECTION: DIM_PROJECTION,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    TIER_COPY: TIER_COPY,
    RISK_PRIORITY: RISK_PRIORITY,
    validate: validate,
    computeCategoryAvgs: computeCategoryAvgs,
    riskRuleHit: riskRuleHit,
    computeCrossRiskFlags: computeCrossRiskFlags,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildAiPrompt: buildAiPrompt,
    levelFromScore: levelFromScore
  };
})(typeof window !== "undefined" ? window : global);
