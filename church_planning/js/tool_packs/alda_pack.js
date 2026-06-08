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
    A: "願景 Aspiration",
    L: "學習 Learning",
    D: "執行 Delivery",
    Ag: "敏捷 Agility"
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
      agile_leader: "全面成熟的敏捷領袖期",
      delivery_machine: "戰功執行期 · 事工機器（高 D 低 L）",
      vision_stuck: "有願景卻在敏捷變革中受挫（高 A 低 Ag）",
      aspiration_burst: "願景爆發期（高 A · 宜補執行）",
      learning_explore: "學習探索期（高 L）",
      developing: "均衡培育／梯隊試任區"
    };
    return {
      profile_type: profile,
      profile_label: labels[profile] || labels.developing,
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
      coaching: {
        leadership_note:
          "主使徒「" +
          scored.primary +
          "」／副使徒「" +
          scored.secondary +
          "」— 修飾帶領節奏，不作任免依據。"
      },
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
        "戰功執行期 · 事工機器（高 D 低 L）— 宜安排學習陪跑與節奏調整，防燒盡。";
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
