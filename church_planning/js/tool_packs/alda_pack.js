/**
 * ALDA · 十二使徒領導力動力學 · 工具包
 * 16 題迫選 · 四群 C/O/S/F · 十二使徒 rollup
 * 依賴：alda_questions.js（ALDA_QUESTIONS）
 */
(function (global) {
  "use strict";

  var TOOL_ID = "alda";
  var TOOL_LABEL = "十二使徒領導力動力學 (ALDA)";
  var LEGACY_STORAGE_KEY = "alda_test_results";

  var QUESTIONS = global.ALDA_QUESTIONS || [];

  var CLUSTER_LABELS = {
    C: "核心決策與文化",
    O: "運營與合規",
    S: "專業與風控",
    F: "一線執行與財務高壓"
  };

  var LIFECYCLE_LABELS = {
    A: "看方向 Aspiration",
    L: "持續學習 Learning",
    D: "把事情做成 Delivery",
    Ag: "變局中調整 Agility"
  };

  var LIFECYCLE_PLAIN = {
    A: "看方向",
    L: "持續學習",
    D: "把事情做成",
    Ag: "變局中調整"
  };

  var DRAFT_STORAGE_KEY = "bible100_alda_survey_draft";

  var QUESTION_PLAIN_LEADS = {
    1: "💡 小組長版：主日聚會前設備或人手出狀況，你的第一反应？",
    2: "💡 事奉很累、家庭也吃緊，你通常怎麼面對？",
    3: "💡 小組分享時大家只說「很好」，你對自己真實狀況會？",
    4: "💡 教會要改用新流程／新工具，同工有抗拒，你會？",
    5: "💡 教會有一筆奉獻要怎麼用，你的第一直覺？",
    6: "💡 帶領團隊的決定與你想法不同，你會？",
    7: "💡 有人想大筆奉獻但要求自己全權決定怎麼用，你傾向？",
    8: "💡 你帶的年輕同工搞錯了簽到或奉獻記錄，你會？",
    9: "💡 要推一個有爭議的關懷計劃，你怎麼跟會友溝通？",
    10: "💡 有人匿名中傷你的服事或家庭，你會？",
    11: "💡 誠實面對：服事中你有沒有私心或驕傲？",
    12: "💡 小組分裂問題開會討論很久沒結論，你最容易？",
    13: "💡 教會要開展新事工或外展，你覺得第一步是？",
    14: "💡 有人要求停掉日常聚會、全部資源做外展，你會？",
    15: "💡 有人說你做事不公平或有偏見，你的真實反应？",
    16: "💡 青年事工連續虧損，從管錢角度你會？"
  };

  var SURVEY_SECTIONS = [
    { title: "第一節 · 危機與真實（1–4 題）", ids: [1, 2, 3, 4] },
    { title: "第二節 · 治理與責任（5–8 題）", ids: [5, 6, 7, 8] },
    { title: "第三節 · 溝通與內耗（9–12 題）", ids: [9, 10, 11, 12] },
    { title: "第四節 · 異象與取捨（13–16 題）", ids: [13, 14, 15, 16] }
  ];

  var LIFECYCLE_GROWTH_COPY = {
    agile_leader: "四軸都還不錯——可以談成全誰、怎麼授權，而不是再加更多專案。",
    delivery_machine: "你很可能很會把事情做成——這一季先安排一項裝備或 shadow，防燒盡。",
    vision_stuck: "方向感是禮物——先拆成 90 天小實驗，再找執行夥伴一起落地。",
    aspiration_burst: "異象很大——配一位能幫你落地的同工，小步試驗比一次推全部更安全。",
    learning_explore: "正在學習探索——宜安排試任與導師陪跑，不必急著獨當一面。",
    developing: "整體在成長區——與牧者談一個小步試任，持續陪伴即可。"
  };

  var LIFECYCLE_THRESHOLD = 3.0;

  function vectorToLifecycle(vectors) {
    vectors = vectors || { C: 12, O: 12, S: 12, F: 12 };
    function to5(x) {
      var n = Math.max(0, Math.min(24, Number(x) || 0));
      return Math.round(((n / 24) * 4 + 1) * 10) / 10;
    }
    return {
      A: to5(vectors.C),
      L: to5(vectors.O),
      D: to5(vectors.F),
      Ag: to5(vectors.S)
    };
  }

  function buildLifecyclePosition(lifecycle) {
    lifecycle = lifecycle || { A: 3, L: 3, D: 3, Ag: 3 };
    var A = Number(lifecycle.A) || 0;
    var L = Number(lifecycle.L) || 0;
    var D = Number(lifecycle.D) || 0;
    var Ag = Number(lifecycle.Ag) || 0;
    var hi = 3.5;
    var lo = 2.8;
    var profile;
    if (A >= hi && L >= hi && D >= hi && Ag >= hi) profile = "agile_leader";
    else if (D >= hi && L < lo) profile = "delivery_machine";
    else if (A >= hi && Ag < lo) profile = "vision_stuck";
    else if (A >= hi && D < lo) profile = "aspiration_burst";
    else if (L >= hi && D < hi) profile = "learning_explore";
    else profile = "developing";
    var labels = {
      agile_leader: "核心穩定期（四軸均衡，可談成全授權）",
      delivery_machine: "執行強、學習需更新（宜安排裝備，防燒盡）",
      vision_stuck: "方向感強、變革節奏需調（宜小步試驗）",
      aspiration_burst: "異象大、落地需同伴（宜配對執行夥伴）",
      learning_explore: "學習探索期（宜 shadow 試任）",
      developing: "均衡成長區（小步試任、持續陪伴）"
    };
    var growth =
      LIFECYCLE_GROWTH_COPY[profile] || LIFECYCLE_GROWTH_COPY.developing;
    return {
      profile_type: profile,
      profile_label: labels[profile] || labels.developing,
      growth_accompaniment: growth,
      dominant_axis:
        D >= A && D >= L && D >= Ag
          ? "D"
          : A >= L && A >= Ag
            ? "A"
            : L >= Ag
              ? "L"
              : "Ag"
    };
  }

  function buildLifecycleContract(derived, store) {
    var shape = store && store.loadLatest ? store.loadLatest("shape") : null;
    var comp = store && store.loadLatest ? store.loadLatest("competency") : null;
    return {
      schema_version: 1,
      source_tool: TOOL_ID,
      lifecycle: derived.lifecycle,
      lifecycle_position: derived.lifecycle_position,
      primary_apostle: derived.primary,
      shape_top_heart: shape && shape.derived ? shape.derived.top_heart : null,
      ksa_weakest: comp && comp.derived ? comp.derived.weakest_label : null,
      leadership_note: "ALDA 修飾帶領節奏與 path_cards；任免須 HITL。"
    };
  }

  var THRESHOLDS = {
    sincerity_low: 70,
    consistency_low: 70,
    cluster_low: 10
  };

  var FLAG_DESCRIPTIONS = {
    LOW_SINCERITY: "屬靈真實度偏低——可能過度維持屬靈形象；宜私下面談後再解讀。",
    LOW_CONSISTENCY: "邏輯一致度偏低——前後對照題矛盾；建議隔週重填或與導師談。",
    CLUSTER_GAP: "四大群組中有明顯弱勢維度——團隊功能可能缺位，宜找互補同工。"
  };

  var FLAG_SCENE_COPY = {
    LOW_SINCERITY: "填答可能偏「理想形象」——宜私下面談後再解讀，不作任免或考核。",
    LOW_CONSISTENCY: "前後選項不太一致——可能當天狀態起伏；隔週重填或與導師談一次即可。",
    CLUSTER_GAP: "某方面特別弱——找互補同工配搭，先陪跑最弱維度，不作淘汰。"
  };

  function buildMicroStep(lifecycle) {
    lifecycle = lifecycle || {};
    var weakest = "L";
    var minV = 99;
    ["A", "L", "D", "Ag"].forEach(function (k) {
      var v = Number(lifecycle[k]) || 0;
      if (v < minV) {
        minV = v;
        weakest = k;
      }
    });
    var steps = {
      A: "本週與牧者談一次：這季小組／服事要往哪裡去？只定一個可檢核的小方向。",
      L: "本週約一位資深同工 shadow 一次帶查經或服事，不必一次學會全部。",
      D: "本週把一項小組行政（通知／簽到）寫成三行交接，讓請假時事工不斷線。",
      Ag: "本週若計劃有變，先與一位同工對齊，再通知組員——小步調整即可。"
    };
    return steps[weakest] || "本週與牧者約 15 分鐘，談一個生命週期小突破。";
  }

  function buildCoaching(derived, risk_flags) {
    derived = derived || {};
    var lp = derived.lifecycle_position || {};
    var lc = derived.lifecycle || {};
    var growth = lp.growth_accompaniment || LIFECYCLE_GROWTH_COPY.developing;
    var micro = buildMicroStep(lc);
    var flagScene = "";
    if (risk_flags && risk_flags.length) {
      flagScene = risk_flags
        .map(function (f) {
          return FLAG_SCENE_COPY[f] || FLAG_DESCRIPTIONS[f] || f;
        })
        .join(" ");
    }
    return {
      leadership_note:
        "主使徒「" +
        (derived.primary || "—") +
        "」／副使徒「" +
        (derived.secondary || "—") +
        "」— 修飾帶領節奏，不作任免依據。",
      growth_accompaniment: growth,
      micro_step: micro,
      redflag: flagScene || growth
    };
  }

  var APOSTLE_NAMES = [
    "彼得", "雅各", "約翰", "安得烈", "腓力", "巴多羅買",
    "多馬", "馬太", "小雅各", "達太", "西門", "猶大"
  ];

  function findQuestion(qId) {
    var id = Number(qId);
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id === id) return QUESTIONS[i];
    }
    return null;
  }

  function findOption(q, optId) {
    if (!q || !q.options) return null;
    for (var i = 0; i < q.options.length; i++) {
      if (q.options[i].id === optId) return q.options[i];
    }
    return null;
  }

  function normalizeAnswers(input) {
    var map = {};
    if (!input || typeof input !== "object") return map;
    Object.keys(input).forEach(function (k) {
      var row = input[k];
      if (!row || !row.most || !row.least) return;
      map[String(k)] = { most: row.most, least: row.least };
    });
    return map;
  }

  function validate(answers) {
    var map = normalizeAnswers(answers);
    var errors = [];
    var missing = [];
    QUESTIONS.forEach(function (q) {
      var row = map[String(q.id)];
      if (!row || !row.most || !row.least) missing.push("Q" + q.id);
      else if (row.most === row.least) errors.push("Q" + q.id + " 最像與最不像不可相同");
    });
    if (missing.length) errors.push("尚未完成：" + missing.join(", "));
    return { ok: errors.length === 0, errors: errors, answers: map };
  }

  function computeScores(answersMap) {
    var clusterScores = { C: 0, O: 0, S: 0, F: 0 };
    var apostleScores = {};
    APOSTLE_NAMES.forEach(function (name) {
      apostleScores[name] = 0;
    });

    var sdSelections = 0;
    var maxSD = 3;
    var inconsistentScoring = 0;

    QUESTIONS.forEach(function (q) {
      var ans = answersMap[String(q.id)];
      if (!ans) return;
      var mostOpt = findOption(q, ans.most);
      var leastOpt = findOption(q, ans.least);
      if (!mostOpt || !leastOpt) return;

      clusterScores[mostOpt.group] += 2;
      if (apostleScores[mostOpt.apostle] != null) apostleScores[mostOpt.apostle] += 2;

      clusterScores[leastOpt.group] -= 1;
      if (apostleScores[leastOpt.apostle] != null) apostleScores[leastOpt.apostle] -= 1;

      if (mostOpt.isSD) sdSelections += 1;
    });

    var ansQ5 = answersMap["5"];
    var ansQ7 = answersMap["7"];
    if (ansQ5 && ansQ7) {
      if ((ansQ5.most === "B" && ansQ7.least === "A") || (ansQ5.least === "B" && ansQ7.most === "A")) {
        inconsistentScoring += 3;
      }
    }
    var ansQ10 = answersMap["10"];
    var ansQ15 = answersMap["15"];
    if (ansQ10 && ansQ15) {
      if (ansQ10.most === "B" && ansQ15.least === "A") inconsistentScoring += 2;
    }

    var sincerityPercent = Math.max(0, Math.round(((maxSD - sdSelections) / maxSD) * 100));
    var consistencyPercent = Math.max(0, Math.round(((10 - inconsistentScoring) / 10) * 100));

    var normalizedClusters = {
      C: Math.min(24, Math.max(0, clusterScores.C + 10)),
      O: Math.min(24, Math.max(0, clusterScores.O + 10)),
      S: Math.min(24, Math.max(0, clusterScores.S + 10)),
      F: Math.min(24, Math.max(0, clusterScores.F + 10))
    };

    var sortedApostles = Object.keys(apostleScores)
      .map(function (key) {
        return { name: key, score: apostleScores[key] };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    return {
      vectors: normalizedClusters,
      sincerity: sincerityPercent,
      consistency: consistencyPercent,
      primary: sortedApostles[0] ? sortedApostles[0].name : "—",
      secondary: sortedApostles[1] ? sortedApostles[1].name : "—",
      apostle_scores: apostleScores,
      sd_selections: sdSelections
    };
  }

  function computeFeatureVector(vectors) {
    vectors = vectors || {};
    function norm(x) {
      var n = Math.max(1, Math.min(5, (Number(x) / 24) * 4 + 1));
      return Math.round(((n - 1) / 4) * 1000) / 10;
    }
    if (global.CTAOSRuntime && typeof global.CTAOSRuntime.normalizeLikert === "function") {
      return {
        C: global.CTAOSRuntime.normalizeLikert(Math.max(1, Math.min(5, (Number(vectors.C) / 24) * 4 + 1))),
        G: global.CTAOSRuntime.normalizeLikert(Math.max(1, Math.min(5, (Number(vectors.O) / 24) * 4 + 1))),
        S: global.CTAOSRuntime.normalizeLikert(Math.max(1, Math.min(5, (Number(vectors.S) / 24) * 4 + 1))),
        P: global.CTAOSRuntime.normalizeLikert(Math.max(1, Math.min(5, (Number(vectors.F) / 24) * 4 + 1))),
        R: norm((Number(vectors.C) + Number(vectors.O)) / 2),
        F: norm((Number(vectors.S) + Number(vectors.F)) / 2)
      };
    }
    return {
      C: norm(vectors.C),
      G: norm(vectors.O),
      S: norm(vectors.S),
      P: norm(vectors.F),
      R: norm((Number(vectors.C) + Number(vectors.O)) / 2),
      F: norm((Number(vectors.S) + Number(vectors.F)) / 2)
    };
  }

  function computeRiskFlags(derived) {
    var flags = [];
    if (derived.sincerity < THRESHOLDS.sincerity_low) flags.push("LOW_SINCERITY");
    if (derived.consistency < THRESHOLDS.consistency_low) flags.push("LOW_CONSISTENCY");
    var vals = [derived.vectors.C, derived.vectors.O, derived.vectors.S, derived.vectors.F];
    var min = Math.min.apply(null, vals);
    if (min < THRESHOLDS.cluster_low) flags.push("CLUSTER_GAP");
    return flags;
  }

  function legacyPayloadFromRun(run) {
    var d = run.derived || {};
    return {
      profile: run.profile || {},
      vectors: d.vectors || {},
      sincerity: d.sincerity,
      consistency: d.consistency,
      primary: d.primary,
      secondary: d.secondary,
      timestamp: new Date(run.timestamp).toISOString()
    };
  }

  function runFromLegacyPayload(data) {
    if (!data || !data.vectors) return null;
    var raw_answers = [];
    if (Array.isArray(data.raw_answers)) raw_answers = data.raw_answers;
    var derived = {
      vectors: data.vectors,
      sincerity: data.sincerity,
      consistency: data.consistency,
      primary: data.primary,
      secondary: data.secondary
    };
    return {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: data.timestamp ? Date.parse(data.timestamp) || Date.now() : Date.now(),
      member_id: null,
      profile: data.profile || {},
      authenticity_score: (data.sincerity != null ? data.sincerity : 100) / 100,
      feature_vector: computeFeatureVector(data.vectors),
      derived: derived,
      raw_answers: raw_answers,
      risk_flags: computeRiskFlags(derived),
      source_note: "migrated from " + LEGACY_STORAGE_KEY
    };
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };

    var scored = computeScores(check.answers);
    var risk_flags = computeRiskFlags(scored);
    var raw_answers = QUESTIONS.map(function (q) {
      var row = check.answers[String(q.id)] || {};
      return { q: String(q.id), most: row.most, least: row.least };
    });

    var lifecycle = vectorToLifecycle(scored.vectors);
    var lifecycle_position = buildLifecyclePosition(lifecycle);
    var derived = {
      vectors: scored.vectors,
      sincerity: scored.sincerity,
      consistency: scored.consistency,
      primary: scored.primary,
      secondary: scored.secondary,
      apostle_scores: scored.apostle_scores,
      lifecycle: lifecycle,
      lifecycle_position: lifecycle_position,
      lifecycle_threshold: LIFECYCLE_THRESHOLD,
      lifecycle_note:
        lifecycle_position.growth_accompaniment ||
        lifecycle_position.profile_label +
          " — 最弱維度建議陪跑，不作淘汰。"
    };
    var lifecycleContract = buildLifecycleContract(derived, global.AssessmentRunStore);
    derived.alda_lifecycle_contract = lifecycleContract;

    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign(
        { name: "", role: "", branch: "", years: "", exp: "" },
        profile || {}
      ),
      authenticity_score: scored.sincerity / 100,
      feature_vector: computeFeatureVector(scored.vectors),
      derived: derived,
      alda_lifecycle_contract: lifecycleContract,
      raw_answers: raw_answers,
      risk_flags: risk_flags,
      coaching: buildCoaching(
        {
          primary: scored.primary,
          secondary: scored.secondary,
          lifecycle: lifecycle,
          lifecycle_position: lifecycle_position
        },
        risk_flags
      ),
      source_note: "alda_pack v1 · " + QUESTIONS.length + " 題迫選"
    };
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "alda", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q, i) {
      var opts = q.options || [];
      if (opts.length < 2) return;
      answers[String(q.id)] = { most: opts[i % opts.length].id, least: opts[(i + 1) % opts.length].id };
    });
    var built = buildRun(answers, {
      name: "張建信 Timothy (示範執事)",
      role: "關懷/牧養, 財務/審計",
      branch: "海外植堂",
      years: "11-20年",
      exp: "曾任本堂同工"
    });
    if (built.ok && built.run && built.run.derived) {
      built.run.is_demo = true;
      built.run.derived.vectors = { C: 14, O: 8, S: 9, F: 22 };
      built.run.derived.lifecycle = { A: 3.3, L: 2.2, D: 4.7, Ag: 2.5 };
      built.run.derived.lifecycle_position = buildLifecyclePosition(built.run.derived.lifecycle);
      built.run.derived.lifecycle_note =
        "執行強、學習需更新——這一季先安排一項裝備或 shadow，防燒盡。";
      built.run.alda_lifecycle_contract = buildLifecycleContract(
        built.run.derived,
        global.AssessmentRunStore
      );
      built.run.derived.alda_lifecycle_contract = built.run.alda_lifecycle_contract;
    }
    return built;
  }

  function migrateLegacyToStore() {
    if (!global.AssessmentRunStore) return null;
    var latest = global.AssessmentRunStore.loadLatest(TOOL_ID);
    if (latest) return latest;
    try {
      var raw = global.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var run = runFromLegacyPayload(data);
      if (run) global.AssessmentRunStore.saveRun(run);
      return run;
    } catch (e) {
      return null;
    }
  }

  global.AldaPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    LEGACY_STORAGE_KEY: LEGACY_STORAGE_KEY,
    QUESTIONS: QUESTIONS,
    CLUSTER_LABELS: CLUSTER_LABELS,
    THRESHOLDS: THRESHOLDS,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    FLAG_SCENE_COPY: FLAG_SCENE_COPY,
    QUESTION_PLAIN_LEADS: QUESTION_PLAIN_LEADS,
    SURVEY_SECTIONS: SURVEY_SECTIONS,
    DRAFT_STORAGE_KEY: DRAFT_STORAGE_KEY,
    LIFECYCLE_PLAIN: LIFECYCLE_PLAIN,
    LIFECYCLE_GROWTH_COPY: LIFECYCLE_GROWTH_COPY,
    buildMicroStep: buildMicroStep,
    buildCoaching: buildCoaching,
    validate: validate,
    computeScores: computeScores,
    computeFeatureVector: computeFeatureVector,
    computeRiskFlags: computeRiskFlags,
    buildRun: buildRun,
    buildDemoRun: buildDemoRun,
    legacyPayloadFromRun: legacyPayloadFromRun,
    runFromLegacyPayload: runFromLegacyPayload,
    migrateLegacyToStore: migrateLegacyToStore,
    LIFECYCLE_LABELS: LIFECYCLE_LABELS,
    LIFECYCLE_THRESHOLD: LIFECYCLE_THRESHOLD,
    vectorToLifecycle: vectorToLifecycle,
    buildLifecyclePosition: buildLifecyclePosition,
    buildLifecycleContract: buildLifecycleContract
  };
})(typeof window !== "undefined" ? window : global);
