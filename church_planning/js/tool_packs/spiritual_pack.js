/**
 * 信徒灵命健康 · 工具包（spiritual）
 * 13 题 Likert · 五维度 · 依赖（可选）：spiritual_health_scoring.js
 */
(function (global) {
  "use strict";

  var TOOL_ID = "spiritual";
  var TOOL_LABEL = "信徒灵命健康";

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  var DIM_LABELS = {
    reading_devotion: "讀經與靈修",
    prayer: "禱告與親近神",
    church_life: "聚會與事奉",
    character: "生命品格",
    gospel_giving: "福音與奉獻"
  };

  var QUESTIONS = [
    { id: "q1", dim: "reading_devotion", section: "一、讀經與靈修生活", label: "這一週裡，我有至少 3 天留 10 分鐘以上安靜讀經或聽道？" },
    { id: "q2", dim: "reading_devotion", section: null, label: "讀經或聽道後，我會用一兩句話記下或向人分享我領受到的？" },
    { id: "q3", dim: "reading_devotion", section: null, label: "最近一兩週，我有因某段經文而調整一個具體行為（例如說話、用錢、待人）？" },
    { id: "q4", dim: "prayer", section: "二、禱告與親近神關係", label: "這一週裡，我有至少 3 天有開口向神說話（不限長短）？" },
    { id: "q5", dim: "prayer", section: null, label: "遇到憂慮或難處時，我會先向神訴說，而不是只自己硬撐或發洩？" },
    { id: "q6", dim: "prayer", section: null, label: "這一週裡，我有因具體的事向神說過「謝謝」或讚美？" },
    { id: "q7", dim: "church_life", section: "三、教會聚會與肢體事奉", label: "過去一個月，我主日聚會出席穩定（除生病、出差等不得已）？" },
    { id: "q8", dim: "church_life", section: null, label: "這一個月內，我有實際關心或服事至少一位弟兄姊妹（問候、代禱、幫手都算）？" },
    { id: "q9", dim: "church_life", section: null, label: "若教會有合理需要（例如聚會、事工），我願意配合調整時間參與？" },
    { id: "q10", dim: "character", section: "四、生命品格與肢體相處", label: "與家人或教會肢體相處時，我能在被觸怒後仍選擇語氣溫和、不報復？" },
    { id: "q11", dim: "character", section: null, label: "最近若有人得罪我，我有嘗試饒恕或至少不當面翻舊帳？" },
    { id: "q12", dim: "gospel_giving", section: "五、福音負擔與金錢奉獻", label: "這一個月內，我有主動關心或向一位未信者分享信仰（哪怕只是一句見證）？" },
    { id: "q13", dim: "gospel_giving", section: null, label: "對於金錢奉獻，我按自己能力有規律地參與（不必與他人比較；僅供私人自覺）？" }
  ];

  var QUESTION_MAP = {
    q1: { dim: "reading_devotion", reversed: false },
    q2: { dim: "reading_devotion", reversed: false },
    q3: { dim: "reading_devotion", reversed: false },
    q4: { dim: "prayer", reversed: false },
    q5: { dim: "prayer", reversed: false },
    q6: { dim: "prayer", reversed: false },
    q7: { dim: "church_life", reversed: false },
    q8: { dim: "church_life", reversed: false },
    q9: { dim: "church_life", reversed: false },
    q10: { dim: "character", reversed: false },
    q11: { dim: "character", reversed: false },
    q12: { dim: "gospel_giving", reversed: false },
    q13: { dim: "gospel_giving", reversed: false }
  };

  var DIM_PROJECTION = {
    reading_devotion: { P: 0.05, S: 0.55, G: 0, C: 0.1, R: 0.1, F: 0.2 },
    prayer: { P: 0.1, S: 0.6, G: 0, C: 0, R: 0.1, F: 0.2 },
    church_life: { P: 0.15, S: 0.2, G: 0.1, C: 0.15, R: 0.35, F: 0.05 },
    character: { P: 0.35, S: 0.25, G: 0, C: 0.1, R: 0.2, F: 0.1 },
    gospel_giving: { P: 0.1, S: 0.2, G: 0.35, C: 0.1, R: 0.1, F: 0.15 }
  };

  var THRESHOLDS = { green: 4.0, yellow: 2.8, min_answered: 10 };

  var FLAG_DESCRIPTIONS = {
    LOW_COMPLETION: "作答題數偏少，報告僅供初步參考，建議補填後再決策。",
    DIM_CRITICAL: "有範疇落在紅色門檻（<2.8），建議與牧者或小組長約談。",
    OVERALL_YELLOW: "整體指數在黃色區間，建議選定 1～2 個具體成長行動。",
    INNER_LIFE_LOW: "整體靈命指數偏低，優先恢復讀經禱告與穩定聚會。"
  };

  var DIM_HINTS = {
    reading_devotion: "固定讀經、默想與在生活中實踐神話語的習慣。",
    prayer: "個人禱告、交托憂慮與讚美感恩的節奏。",
    church_life: "主日與聚會穩定度、事奉參與與對教會的委身。",
    character: "忍耐、饒恕、和睦與肢體相處的品格操練。",
    gospel_giving: "關心未信者、見證與金錢奉獻的態度。"
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

  function computeDimScores(strAnswers) {
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
    return round1(vals.reduce(function (a, b) {
      return a + b;
    }, 0) / vals.length);
  }

  function levelFromScore(score) {
    if (global.levelFromScore) return global.levelFromScore(score);
    if (score == null || !isFinite(score)) return "red";
    if (score >= THRESHOLDS.green) return "green";
    if (score >= THRESHOLDS.yellow) return "yellow";
    return "red";
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var missing = [];
    Object.keys(QUESTION_MAP).forEach(function (qid) {
      if (map[qid] == null || !isFinite(map[qid])) missing.push(qid);
      else if (map[qid] < 1 || map[qid] > 5) errors.push(qid + " 须为 1–5");
    });
    if (missing.length === Object.keys(QUESTION_MAP).length) {
      errors.push("尚未作答");
    }
    return { ok: errors.length === 0, errors: errors, answers: map, answeredCount: Object.keys(map).length };
  }

  function computeFeatureVector(dimScores) {
    var items = [];
    Object.keys(dimScores).forEach(function (dim) {
      var v = dimScores[dim];
      if (v == null || !isFinite(v)) return;
      items.push({ value: v, projection: DIM_PROJECTION[dim] || { P: 0.15, S: 0.2, G: 0.15, C: 0.2, R: 0.15, F: 0.15 } });
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

  function computeRiskFlags(dimScores, overall, answeredCount) {
    var flags = [];
    if (answeredCount < THRESHOLDS.min_answered) flags.push("LOW_COMPLETION");
    var hasRed = false;
    Object.keys(dimScores).forEach(function (dim) {
      if (levelFromScore(dimScores[dim]) === "red") hasRed = true;
    });
    if (hasRed) flags.push("DIM_CRITICAL");
    if (overall != null && levelFromScore(overall) === "yellow") flags.push("OVERALL_YELLOW");
    if (overall != null && levelFromScore(overall) === "red") flags.push("INNER_LIFE_LOW");
    return flags;
  }

  function findWeakestDim(dimScores) {
    var weakest = null;
    var weakestScore = 99;
    Object.keys(dimScores).forEach(function (dim) {
      if (dimScores[dim] < weakestScore) {
        weakestScore = dimScores[dim];
        weakest = dim;
      }
    });
    return { dim: weakest, score: weakestScore };
  }

  function buildMicroStep(dimScores, overall, flags) {
    var w = findWeakestDim(dimScores);
    var steps = {
      reading_devotion: "本週選定一個固定時段（例如起床後 10 分鐘），只讀一章或一段經文並寫下一句領受。",
      prayer: "本週每天選同一個小時段，對神說出一件憂慮或一件感恩（各一句即可）。",
      church_life: "本週主日或聚會後，主動問一位肢體「近況如何」並為對方代禱一句。",
      character: "本週若被觸怒一次，先離開 5 分鐘再回應，避免當場爭辯。",
      gospel_giving: "本週為一位未信者做一件具體關心（問候、陪餐、代禱），不必強迫傳福音。"
    };
    if (flags.indexOf("INNER_LIFE_LOW") >= 0) {
      return "本週只做兩件事：每天 5 分鐘短讀＋短禱，並出席一次主日聚會。";
    }
    if (overall != null && levelFromScore(overall) === "green") {
      return "本週維持節奏，並主動陪伴一位初信者或軟弱的肢體（一次問候或代禱即可）。";
    }
    return steps[w.dim] || steps.reading_devotion;
  }

  function buildCoaching(dimScores, overall, flags) {
    var w = findWeakestDim(dimScores);
    var weakest = w.dim;
    var micro_step = buildMicroStep(dimScores, overall, flags);
    var growth =
      overall != null && levelFromScore(overall) === "green"
        ? "整體大致良好：請維持節奏，並考慮陪伴一位初信者或軟弱的肢體。"
        : "建議先聚焦「" + (DIM_LABELS[weakest] || "靈修") + "」，本週只守一個可檢核的小步（見報告「本週一小步」）。";
    var collab =
      flags.indexOf("DIM_CRITICAL") >= 0
        ? "有範疇需特別關注：請主動與牧者或小組長約 30 分鐘，不要獨自硬扛。"
        : "可與屬靈同伴互相代禱，每兩週問一次：「讀經、禱告、聚會哪一項需要調整？」";
    var redflag =
      flags.indexOf("INNER_LIFE_LOW") >= 0
        ? "整體指數偏低：先恢復基本屬靈習慣（短讀＋短禱＋主日），再談事奉加擔。"
        : flags.indexOf("LOW_COMPLETION") >= 0
          ? "作答較少：請補填題目或隔幾天重測，再作重要決定。"
          : "若長期抑鬱、無助或安全受威脅，請尋求專業協助與緊急支援。";
    return {
      growth: growth,
      micro_step: micro_step,
      collaboration: collab,
      redflag: redflag,
      peer_questions: [
        "哪一範疇我最容易「知道卻做不到」？",
        "誰可以陪我一起守住讀經或禱告節奏？",
        "我是否需要調整事奉份量？"
      ],
      mentor_questions: [
        "我的靈命節奏是否可持續？",
        "有哪些外在壓力在擠壓我與神獨處的時間？",
        "我是否適合增加或減少某項事奉？"
      ]
    };
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    var ds = d.dim_scores || {};
    var lines = Object.keys(DIM_LABELS).map(function (k) {
      return DIM_LABELS[k] + "=" + (ds[k] != null ? ds[k] : "—");
    });
    return (
      "你是教會屬靈陪伴顧問（非權威，僅供牧者審核）。\n" +
      "工具：信徒靈命健康自評\n" +
      "整體指數：" +
      (d.overall_score != null ? d.overall_score : "—") +
      "（" +
      (d.overall_level || "—") +
      "）\n" +
      "五範疇：" +
      lines.join(" / ") +
      "\n" +
      "風險：" +
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
      "請產出：1) 四句式摘要 2) 未來 12 週靈修行動計劃 3) 給小組長三個追問\n" +
      "勿編造經文；不宣稱屬靈權威；不確定處請明說需牧者查證。"
    );
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.answeredCount) {
      return { ok: false, errors: check.errors.length ? check.errors : ["尚无作答"] };
    }
    var map = check.answers;
    var strAnswers = {};
    Object.keys(map).forEach(function (k) {
      strAnswers[k] = String(map[k]);
    });
    var dimScores = computeDimScores(strAnswers);
    var overall = computeOverall(dimScores);
    var dimLevels = {};
    Object.keys(dimScores).forEach(function (k) {
      dimLevels[k] = levelFromScore(dimScores[k]);
    });
    var risk_flags = computeRiskFlags(dimScores, overall, check.answeredCount);
    var coaching = buildCoaching(dimScores, overall, risk_flags);
    var raw_answers = Object.keys(QUESTION_MAP).map(function (qid) {
      return { q: qid, value: map[qid] != null ? map[qid] : null };
    });

    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ open_text: "" }, profile || {}),
      authenticity_score: round1(check.answeredCount / 13),
      feature_vector: computeFeatureVector(dimScores),
      derived: {
        dim_scores: dimScores,
        dim_levels: dimLevels,
        overall_score: overall,
        overall_level: levelFromScore(overall),
        answered_count: check.answeredCount
      },
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: coaching,
      source_note: "spiritual_pack v1 · " + check.answeredCount + "/13 题"
    };
    run.ai_prompt = buildAiPrompt(run);
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {
      q1: 3, q2: 3, q3: 2, q4: 3, q5: 2, q6: 3,
      q7: 4, q8: 3, q9: 4, q10: 3, q11: 2, q12: 2, q13: 3
    };
    var built = buildRun(answers, { age_range: "26-35", years_in_faith: "4-10年" });
    if (built.ok && built.run) built.run.is_demo = true;
    return built;
  }

  global.SpiritualPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    QUESTION_MAP: QUESTION_MAP,
    DIM_LABELS: DIM_LABELS,
    DIM_HINTS: DIM_HINTS,
    DIM_PROJECTION: DIM_PROJECTION,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    buildAiPrompt: buildAiPrompt,
    levelFromScore: levelFromScore
  };
})(typeof window !== "undefined" ? window : global);
