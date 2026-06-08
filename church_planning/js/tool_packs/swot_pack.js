/**
 * SWOT 戰略交叉矩陣 · 工具包（swot）
 * Weihrich TOWS 交叉耦合 · NCD 八維剛性輸入 · swot_contract SSOT
 */
(function (global) {
  "use strict";

  var TOOL_ID = "swot";
  var TOOL_LABEL = "SWOT 戰略交叉矩陣";
  var HEALTH_THRESHOLD = 3.0;

  var THEOLOGY = {
    S: "神量給本堂的恩賜邊界與托付基建（量帶 Stewardship of Gifts）— 非資產規模",
    W: "罪性破口與組織僵化造成的靈性／架構虧缺（須誠實面對、不可粉飾）",
    O: "聖靈在時代與社區中已開展的福音浪潮（呼召教會參與的時機）",
    T: "屬靈與文化爭戰中對教會的吞噬（忙碌、世俗化、內耗）"
  };

  var WEIHRICH_REF =
    "H. Weihrich, TOWS Matrix (1982) — 將內部 S/W 與外部 O/T 交叉耦合，產出 SO/ST/WO/WT 四類可執行戰略。";

  var PASTORAL_OVERRIDE_MSG =
    "【系統主軸覆寫】偵測到「事工機器堂會典型痛點」：結構功能高度擴張，內在屬靈生命嚴重坍塌。此時任何盲目的外展擴張（SO）都將加速同工燒盡。必須採取 WO 策略：以社區外展為祭壇的靈性重燃計畫。";

  /** 4 象限 × 5 題 = 20 題剛性快評題庫（1＝非常不同意 · 5＝非常同意） */
  var QUESTIONS = [
    { id: "S1", quad: "S", label: "堂會具備結構清晰、分工明確的組織架構與行政跟進系統。" },
    { id: "S2", quad: "S", label: "核心同工（長執／全職）團隊凝聚力與配搭默契足夠強大。" },
    { id: "S3", quad: "S", label: "堂會財務基建與硬體設備充裕且穩定。" },
    { id: "S4", quad: "S", label: "教會有清晰的門徒培育系統（主日學、生命養育流）。" },
    { id: "S5", quad: "S", label: "堂會有具開荒、講道或特定專業恩賜的領袖群。" },
    { id: "W1", quad: "W", label: "信徒個人靈修、禱告祭壇與屬靈生命流於形式（靈性塌陷）。", ncd_link: "passion" },
    { id: "W2", quad: "W", label: "聚會（主日／小組）陷入僵化，缺乏聖靈充滿與熱情。" },
    { id: "W3", quad: "W", label: "同工與義工團隊普遍處於事工燒盡（Burnout）狀態。" },
    { id: "W4", quad: "W", label: "小組與長執會之間存在溝通張力、派系或信任危機。" },
    { id: "W5", quad: "W", label: "對新朋友留存與牧養跟進極端軟弱或缺乏系統。" },
    { id: "O1", quad: "O", label: "教會周邊社區（學校、園區、老人社區）有未得之民龐大需求。" },
    { id: "O2", quad: "O", label: "當前有合適的外部福音機構或跨教會資源可戰略合作。" },
    { id: "O3", quad: "O", label: "新媒體、數位宣教工具為堂會提供跨地域外展契機。" },
    { id: "O4", quad: "O", label: "社區居民對教會慈惠事工（課後照顧、老人食堂）接受度高。" },
    { id: "O5", quad: "O", label: "時代環境（社會動盪、人心焦慮）使群眾對信仰渴求度上升。" },
    { id: "T1", quad: "T", label: "世俗化浪潮嚴重侵蝕信徒（特別是下一代）價值觀。" },
    { id: "T2", quad: "T", label: "少子化、高齡化、人口外流加速掏空堂會基數。" },
    { id: "T3", quad: "T", label: "法規或大環境對教會實體聚會或福音開展越發不友善。" },
    { id: "T4", quad: "T", label: "周邊同質堂會快速擴張，造成信徒與資源隱形流失。" },
    { id: "T5", quad: "T", label: "後疫情線上游離信徒增加、實體委身度大跌仍未好轉。" }
  ];

  var QUAD_LABELS = { S: "優勢 Strength", W: "劣勢 Weakness", O: "機會 Opportunity", T: "威脅 Threat" };

  function round2(n) {
    return Math.round(Number(n) * 100) / 100;
  }

  function round1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  function clamp15(n) {
    return Math.min(5, Math.max(1, Number(n) || 0));
  }

  function ncdMinimumFromStore() {
    if (global.StrategicToolBridge && StrategicToolBridge.ncdMinimumFactor) {
      return StrategicToolBridge.ncdMinimumFactor();
    }
    if (global.AssessmentRunStore) {
      var run = AssessmentRunStore.loadLatest("ncd");
      if (run && run.derived && run.derived.minimum_factor) return run.derived.minimum_factor;
    }
    return null;
  }

  function ncdDimScoresFromStore() {
    if (global.AssessmentRunStore) {
      var run = AssessmentRunStore.loadLatest("ncd");
      if (run && run.derived && run.derived.dim_scores) return run.derived.dim_scores;
    }
    return null;
  }

  function defaultDemoDimScores() {
    return {
      gift: 3.0,
      empower: 3.7,
      passion: 2.0,
      functional: 4.8,
      worship: 3.3,
      wholistic: 3.5,
      evangelism: 3.0,
      loving: 3.2
    };
  }

  function computeQuizAverages(answers) {
    if (!answers || typeof answers !== "object") return null;
    var buckets = { S: [], W: [], O: [], T: [] };
    QUESTIONS.forEach(function (q) {
      var v = Number(answers[q.id]);
      if (v >= 1 && v <= 5) buckets[q.quad].push(v);
    });
    function avg(arr) {
      if (!arr.length) return null;
      return round2(arr.reduce(function (s, x) { return s + x; }, 0) / arr.length);
    }
    return {
      S_avg: avg(buckets.S),
      W_severity: avg(buckets.W),
      O_avg: avg(buckets.O),
      T_severity: avg(buckets.T)
    };
  }

  function resolveAxisAverages(inputs) {
    inputs = inputs || {};
    var dimScores = inputs.ncd_dim_scores || ncdDimScoresFromStore() || defaultDemoDimScores();
    var ncdMin = inputs.ncd_minimum || ncdMinimumFromStore();
    var quiz = computeQuizAverages(inputs.answers);

    var S_avg =
      quiz && quiz.S_avg != null
        ? quiz.S_avg
        : round2(clamp15(dimScores.functional));
    if (quiz && quiz.S_avg == null && dimScores.functional != null) {
      S_avg = round2(clamp15(dimScores.functional));
    }

    var W_avg;
    if (ncdMin && ncdMin.score != null) {
      W_avg = clamp15(ncdMin.score);
    } else if (quiz && quiz.W_severity != null) {
      W_avg = round2(Math.max(1, Math.min(5, 6 - quiz.W_severity)));
    } else {
      W_avg = clamp15(dimScores.passion || 3);
    }

    var O_avg = quiz && quiz.O_avg != null ? quiz.O_avg : inputs.O_score != null ? clamp15(inputs.O_score) : 3.8;
    var T_avg = quiz && quiz.T_severity != null ? quiz.T_severity : inputs.T_score != null ? clamp15(inputs.T_score) : 3.6;

    if (inputs.workshop) {
      var ws = aggregateWorkshopScores(inputs.workshop);
      if (ws.O != null) O_avg = ws.O;
      if (ws.T != null) T_avg = ws.T;
      if (ws.S != null) S_avg = round2((S_avg + ws.S) / 2);
    }

    return {
      S_avg: round2(S_avg),
      W_avg: round2(W_avg),
      O_avg: round2(O_avg),
      T_avg: round2(T_avg),
      quiz: quiz,
      ncdMin: ncdMin || { id: "passion", label: "充滿熱情的靈性", score: W_avg },
      dimScores: dimScores
    };
  }

  /**
   * Weihrich TOWS：P_SO = S_avg×O_avg · P_WO = W_avg×O_avg · Delta_Variance = S_avg−W_avg
   */
  function calculateMatrix(inputs) {
    inputs = inputs || {};
    var axis = resolveAxisAverages(inputs);
    var S_avg = axis.S_avg;
    var W_avg = axis.W_avg;
    var O_avg = axis.O_avg;
    var T_avg = axis.T_avg;
    var ncdMin = axis.ncdMin;
    var W_intensity = round2((5 - W_avg) / 4);

    var P_raw = {
      SO: round2(S_avg * O_avg),
      WO: round2(W_avg * O_avg),
      ST: round2(S_avg * T_avg),
      WT: round2(W_avg * T_avg)
    };

    var cross_scores = {
      SO: round1((S_avg / 5) * (O_avg / 5) * 100),
      WO: round1(W_intensity * (O_avg / 5) * 100),
      ST: round1((S_avg / 5) * (T_avg / 5) * 100),
      WT: round1(W_intensity * (T_avg / 5) * 100)
    };

    var Delta_Variance = round2(S_avg - W_avg);
    var conflict_SO_WO = round2(Math.abs(P_raw.SO - P_raw.WO));
    var ranked = ["SO", "ST", "WO", "WT"]
      .map(function (id) {
        return { id: id, score: cross_scores[id], raw: P_raw[id] };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    var primary_strategy = ranked[0].id;
    var pastoral_override = null;
    var w1High =
      inputs.answers && Number(inputs.answers.W1) >= 4;
    if (Delta_Variance >= 2.0 && (W_avg <= 2.5 || w1High || (ncdMin && ncdMin.id === "passion"))) {
      primary_strategy = "WO";
      pastoral_override = PASTORAL_OVERRIDE_MSG;
    }

    return {
      algorithm: "Weihrich_TOWS_v2",
      literature: WEIHRICH_REF,
      weights: {
        S_avg: S_avg,
        W_avg: W_avg,
        O_avg: O_avg,
        T_avg: T_avg,
        S_w: S_avg,
        W_i: W_avg,
        W_intensity: W_intensity,
        O_j: O_avg,
        T_k: T_avg,
        ncd_minimum_id: ncdMin.id,
        ncd_minimum_label: ncdMin.label
      },
      P_raw: P_raw,
      cross_scores: cross_scores,
      delta_per_cross: {
        SO: round2(P_raw.SO - P_raw.WO),
        WO: round2(P_raw.WO - HEALTH_THRESHOLD),
        ST: round2(P_raw.ST - P_raw.WT),
        WT: round2(P_raw.WT)
      },
      Delta_Variance: Delta_Variance,
      conflict_SO_WO: conflict_SO_WO,
      so_wo_tension: round2(P_raw.SO - P_raw.WO),
      priority_ranking: ranked,
      primary_strategy: primary_strategy,
      pastoral_override: pastoral_override
    };
  }

  function aggregateWorkshopScores(workshop) {
    var dims = workshop.dimensions || [];
    if (!dims.length) return {};
    function avgClarity(key) {
      var sum = 0;
      var n = 0;
      dims.forEach(function (d) {
        var v = Number(d[key]) || 0;
        if (v > 0) {
          sum += v;
          n++;
        }
      });
      return n ? round2((sum / n / 5) * 5) : null;
    }
    return {
      S: avgClarity("sClarity"),
      O: avgClarity("oClarity"),
      T: avgClarity("tClarity"),
      W: avgClarity("wClarity")
    };
  }

  function buildQuadrants(ncdMin, dimScores, matrix) {
    dimScores = dimScores || {};
    matrix = matrix || calculateMatrix({ ncd_dim_scores: dimScores, ncd_minimum: ncdMin });
    var structural = matrix.weights.S_w;
    var passionScore = matrix.weights.W_i;
    var passionLabel = (ncdMin && ncdMin.label) || "充滿熱情的靈性";

    return {
      S: {
        weight: structural,
        primary:
          "結構功能的組織（" +
          structural +
          "）— 恩賜基建、會議治理與事事 SOP；Weihrich S_w 權重",
        items: [
          "functional=" + (dimScores.functional || "—") + " · empower=" + (dimScores.empower || "—"),
          "組織動員力可快速承接外展，但須警惕「機器運轉」掩蓋靈性",
          "SO 優先級評分 " + matrix.cross_scores.SO + "/100"
        ]
      },
      W: {
        weight: passionScore,
        primary:
          passionLabel +
          "（" +
          passionScore +
          "）— NCD 最小因子剛性鎖定；信徒靈命形式化、禱告祭壇塌陷",
        ncd_locked: true,
        ncd_factor_id: (ncdMin && ncdMin.id) || "passion",
        items: [
          "W_intensity=" + matrix.weights.W_intensity + "（破口強度，越高越需 WO/WT）",
          "Delta_Variance 結構−靈性=" + matrix.Delta_Variance,
          "WO 優先級評分 " + matrix.cross_scores.WO + "/100"
        ]
      },
      O: {
        weight: matrix.weights.O_j,
        primary: "社區關懷與外展機會（O_j=" + matrix.weights.O_j + "）— 聖靈在鄰里開展的服事敞口",
        items: [
          "長者關懷、家庭破碎、跨堂合作為具體 O 因子",
          "WO 耦合：以外展為祭壇重燃靈性（非再加活動堆疊）",
          "O 權重來自工作坊 oClarity 或預設 3.8"
        ]
      },
      T: {
        weight: matrix.weights.T_k,
        primary: "世俗化與忙碌文化（T_k=" + matrix.weights.T_k + "）— 吞噬靈修與團隊合一",
        ncd_linked: true,
        items: [
          "若只擴張 SO 而不處理 W，衝突係數 conflict_SO_WO=" + matrix.conflict_SO_WO,
          "ST 優先級 " + matrix.cross_scores.ST + " · WT 優先級 " + matrix.cross_scores.WT,
          "威脅需全教會禱告鏈，非常務會議單獨決議"
        ]
      }
    };
  }

  function buildCrossStrategies(quadrants, matrix) {
    matrix = matrix || {};
    var cs = matrix.cross_scores || {};
    return {
      SO: {
        id: "SO",
        title: "SO 增長戰略（優先級 " + (cs.SO || "—") + "/100）",
        body:
          "以 S_w=" +
          (matrix.weights && matrix.weights.S_w) +
          " 的組織優勢對接 O_j=" +
          (matrix.weights && matrix.weights.O_j) +
          " 的社區機會。適用條件：Delta_Variance < 2.0 且靈性未亮紅燈。行動：90 天 3 次鄰里探訪 + 跟進名單。",
        leverage: "S_w × O_j",
        priority_score: cs.SO,
        delta_coefficient: matrix.delta_per_cross && matrix.delta_per_cross.SO
      },
      ST: {
        id: "ST",
        title: "ST 多元化戰略（優先級 " + (cs.ST || "—") + "/100）",
        body:
          "以組織紀律（S）建立靈性護城河，抵禦 T_k=" +
          (matrix.weights && matrix.weights.T_k) +
          " 的世俗化威脅。每季全會禱告晨更；敬拜與小組長聯動。",
        leverage: "S_w × (5−T_k)",
        priority_score: cs.ST,
        delta_coefficient: matrix.delta_per_cross && matrix.delta_per_cross.ST
      },
      WO: {
        id: "WO",
        title: "WO 轉變戰略：以社區外展為祭壇的靈性重燃計畫（優先級 " + (cs.WO || "—") + "/100）",
        body:
          "W_i=" +
          (matrix.weights && matrix.weights.W_i) +
          " 破口 × O_j 機會：每週為社區對象禱告 → 每月外展 → 行動後靈修分享。Delta_Variance=" +
          matrix.Delta_Variance +
          " 時為牧養覆寫主軸。",
        leverage: "W_intensity × O_j",
        priority_score: cs.WO,
        delta_coefficient: matrix.delta_per_cross && matrix.delta_per_cross.WO,
        highlight: true
      },
      WT: {
        id: "WT",
        title: "WT 防禦／重組：禁食禱告與屬靈排毒（優先級 " + (cs.WT || "—") + "/100）",
        body:
          "W 破口與 T 威脅交會：40 天禱告鏈、暫緩非核心事工、長執調整靈修節奏。WT delta=" +
          (matrix.delta_per_cross && matrix.delta_per_cross.WT) +
          "。",
        leverage: "W_intensity × T_k",
        priority_score: cs.WT,
        delta_coefficient: matrix.delta_per_cross && matrix.delta_per_cross.WT
      }
    };
  }

  function buildDeltaAnalysis(matrix, cross) {
    matrix = matrix || {};
    cross = cross || {};
    return [
      {
        axis: "SO vs WO",
        tension: "擴張動能 P_SO=" + (matrix.cross_scores && matrix.cross_scores.SO) + " vs 修補動能 P_WO=" + (matrix.cross_scores && matrix.cross_scores.WO),
        delta: "衝突係數 conflict_SO_WO=" + (matrix.conflict_SO_WO || "—") + " · 張力 Δ=" + (matrix.so_wo_tension || "—"),
        resolution: (cross.WO && cross.WO.title) || "WO 轉變戰略"
      },
      {
        axis: "S 結構 vs W 靈性",
        tension: (matrix.weights && matrix.weights.S_w) + " vs " + (matrix.weights && matrix.weights.W_i),
        delta: "Delta_Variance=" + (matrix.Delta_Variance || "—") + "（≥2.0 觸發牧養覆寫）",
        resolution: matrix.pastoral_override || "依 priority_ranking 排序"
      },
      {
        axis: "ST vs WT",
        tension: "護城河 vs 雙重壓力",
        delta: "P_ST=" + (matrix.cross_scores && matrix.cross_scores.ST) + " · P_WT=" + (matrix.cross_scores && matrix.cross_scores.WT),
        resolution: (cross.WT && cross.WT.title) || "WT 排毒計畫"
      }
    ];
  }

  function buildSwotContract(derived) {
    derived = derived || {};
    var matrix = derived.matrix_result || calculateMatrix({
      ncd_dim_scores: derived.ncd_dim_scores,
      ncd_minimum: derived.ncd_minimum,
      workshop: derived.workshop
    });
    var quadrants = derived.quadrants || buildQuadrants(derived.ncd_minimum, derived.ncd_dim_scores, matrix);
    var cross = derived.cross_strategies || buildCrossStrategies(quadrants, matrix);
    return {
      version: 2,
      tool_id: TOOL_ID,
      theology: THEOLOGY,
      literature: WEIHRICH_REF,
      matrix_result: matrix,
      quadrants: quadrants,
      cross_strategies: cross,
      ncd_link: {
        minimum_factor_id: (derived.ncd_minimum && derived.ncd_minimum.id) || matrix.weights.ncd_minimum_id,
        minimum_factor_label: (derived.ncd_minimum && derived.ncd_minimum.label) || matrix.weights.ncd_minimum_label,
        minimum_score: matrix.weights.W_i,
        structural_strength: matrix.weights.S_w,
        Delta_Variance: matrix.Delta_Variance
      },
      delta_analysis: derived.delta_analysis || buildDeltaAnalysis(matrix, cross),
      primary_strategy: matrix.primary_strategy,
      calculateMatrix: "swot_contract.calculateMatrix — 前端請呼叫 SwotPack.calculateMatrix"
    };
  }

  function buildDerivedFromInputs(opts) {
    opts = opts || {};
    var ncdMin = opts.ncd_minimum || ncdMinimumFromStore() || {
      id: "passion",
      label: "充滿熱情的靈性",
      score: 2.0,
      diagnosis: "靈性生活可能流於形式，會眾真實遇見神的比例偏低。"
    };
    var dimScores = opts.ncd_dim_scores || ncdDimScoresFromStore() || defaultDemoDimScores();
    var matrix = calculateMatrix({
      ncd_minimum: ncdMin,
      ncd_dim_scores: dimScores,
      answers: opts.answers,
      workshop: opts.workshop,
      O_score: opts.O_score,
      T_score: opts.T_score
    });
    var quadrants = buildQuadrants(ncdMin, dimScores, matrix);
    var cross = buildCrossStrategies(quadrants, matrix);
    var derived = {
      ncd_minimum: ncdMin,
      ncd_dim_scores: dimScores,
      workshop: opts.workshop || null,
      matrix_result: matrix,
      quadrants: quadrants,
      cross_strategies: cross,
      delta_analysis: buildDeltaAnalysis(matrix, cross),
      focus_strategy: matrix.primary_strategy,
      summary_line:
        "Weihrich 矩陣已運算：Delta_Variance=" +
        matrix.Delta_Variance +
        " · 主軸 " +
        matrix.primary_strategy +
        "（P=" +
        matrix.cross_scores[matrix.primary_strategy] +
        "/100）· NCD 破口「" +
        ncdMin.label +
        "」" +
        matrix.weights.W_i +
        " 分"
    };
    derived.swot_contract = buildSwotContract(derived);
    return derived;
  }

  function workshopRawAnswers(dimensions) {
    return (dimensions || []).map(function (d) {
      return {
        dim_id: d.id,
        name: d.name,
        s: d.s,
        w: d.w,
        o: d.o,
        t: d.t,
        sClarity: d.sClarity,
        wClarity: d.wClarity,
        oClarity: d.oClarity,
        tClarity: d.tClarity
      };
    });
  }

  function buildAssessmentRun(derived, opts) {
    opts = opts || {};
    var m = derived.matrix_result || {};
    var risk = [];
    if (m.Delta_Variance >= 2.0) risk.push("STRUCTURE_SPIRIT_GAP");
    if (m.conflict_SO_WO >= 0.15) risk.push("SO_WO_ROUTE_CONFLICT");
    if (m.weights && m.weights.W_i <= 2.5) risk.push("NCD_MIN_FACTOR_CRITICAL");
    return {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: null,
      profile: opts.profile || {},
      authenticity_score: opts.is_demo ? 0.5 : 1,
      derived: derived,
      swot_contract: derived.swot_contract,
      workshop_snapshot: opts.workshop_snapshot || null,
      is_demo: !!opts.is_demo,
      raw_answers: opts.raw_answers || [],
      risk_flags: risk,
      feature_vector: {
        weakness_ncd_locked: true,
        primary_cross: derived.focus_strategy,
        Delta_Variance: m.Delta_Variance,
        conflict_SO_WO: m.conflict_SO_WO,
        cross_scores: m.cross_scores
      },
      source_note: "swot_pack v2 · Weihrich_TOWS_v1 · calculateMatrix"
    };
  }

  function buildDemoRun() {
    var derived = buildDerivedFromInputs({});
    var run = buildAssessmentRun(derived, {
      is_demo: true,
      profile: { church_name: "示範教會（結構強・靈性弱）", role: "board" },
      raw_answers: []
    });
    run.is_demo = true;
    return { ok: true, run: run };
  }

  function buildNcdPreviewRun() {
    var ncdMin = ncdMinimumFromStore();
    var dimScores = ncdDimScoresFromStore();
    if (!ncdMin && !dimScores) return buildDemoRun();
    var derived = buildDerivedFromInputs({
      ncd_minimum: ncdMin,
      ncd_dim_scores: dimScores
    });
    var run = buildAssessmentRun(derived, {
      is_demo: false,
      profile: { church_name: "NCD 鏈路自動預覽", role: "board" },
      raw_answers: []
    });
    run.is_preview = true;
    return { ok: true, run: run, preview: true };
  }

  function buildRunFromQuiz(answers, profile) {
    var missing = QUESTIONS.filter(function (q) {
      var v = Number(answers && answers[q.id]);
      return !(v >= 1 && v <= 5);
    });
    if (missing.length) {
      return { ok: false, errors: ["尚有 " + missing.length + " 題未作答（共需 20 題）"] };
    }
    var derived = buildDerivedFromInputs({
      answers: answers,
      ncd_minimum: ncdMinimumFromStore(),
      ncd_dim_scores: ncdDimScoresFromStore()
    });
    var raw = QUESTIONS.map(function (q) {
      return { q: q.id, quad: q.quad, value: Number(answers[q.id]) };
    });
    var run = buildAssessmentRun(derived, {
      is_demo: false,
      profile: profile || {},
      raw_answers: raw
    });
    return { ok: true, run: run };
  }

  function saveQuizRun(answers, profile) {
    var built = buildRunFromQuiz(answers, profile);
    if (!built.ok) return built;
    if (!global.AssessmentRunStore) {
      return { ok: false, errors: ["AssessmentRunStore 未載入"] };
    }
    return AssessmentRunStore.saveRun(built.run);
  }

  function buildRunFromWorkshop(payload) {
    payload = payload || {};
    var dims = payload.dimensions;
    if (!dims || !dims.length) {
      return { ok: false, errors: ["工作坊 dimensions 為空"] };
    }
    var derived = buildDerivedFromInputs({
      workshop: { dimensions: dims, meta: payload.meta },
      ncd_minimum: ncdMinimumFromStore(),
      ncd_dim_scores: ncdDimScoresFromStore()
    });
    var run = buildAssessmentRun(derived, {
      is_demo: false,
      profile: {
        church_name: (payload.meta && payload.meta.churchName) || "",
        role: (payload.meta && payload.meta.role) || "board",
        focus: (payload.meta && payload.meta.focus) || ""
      },
      workshop_snapshot: { dimensions: dims, meta: payload.meta },
      raw_answers: workshopRawAnswers(dims)
    });
    return { ok: true, run: run };
  }

  function saveWorkshopRun(payload) {
    var built = buildRunFromWorkshop(payload);
    if (!built.ok) return built;
    if (!global.AssessmentRunStore) {
      return { ok: false, errors: ["AssessmentRunStore 未載入"] };
    }
    return AssessmentRunStore.saveRun(built.run);
  }

  function buildAiPrompt(run) {
    var d = run && run.derived;
    var c = (d && d.swot_contract) || (run && run.swot_contract);
    var m = c && c.matrix_result;
    if (!c) return "請先完成 SWOT 測評或點「先看示範報告」。";
    var wo = c.cross_strategies && c.cross_strategies.WO;
    return [
      "【SWOT 戰略平衡指令 · Weihrich TOWS · Church OS】",
      "",
      "文獻：" + WEIHRICH_REF,
      "Delta_Variance（結構−靈性）=" + (m && m.Delta_Variance) + "",
      "衝突係數 conflict_SO_WO=" + (m && m.conflict_SO_WO) + "",
      "優先級：SO=" + (m && m.cross_scores.SO) + " WO=" + (m && m.cross_scores.WO) + " ST=" + (m && m.cross_scores.ST) + " WT=" + (m && m.cross_scores.WT),
      "",
      "NCD 鎖定 W：「" + (c.ncd_link && c.ncd_link.minimum_factor_label) + "」(" + (c.ncd_link && c.ncd_link.minimum_score) + "/5)",
      "主軸策略：" + c.primary_strategy,
      wo ? wo.title + "\n" + wo.body : "",
      "",
      "請產出：① SO/WO 雙軌平衡方案 ② 90 天 SMART-compliant 目標 ③ 長執會決議草案 ④ 是否需要 WT 禁食禱告排毒。",
      "勿編造經文；語氣牧養陪伴。"
    ].join("\n");
  }

  function ensureAssessmentRun() {
    if (!global.AssessmentRunStore) return null;
    return AssessmentRunStore.loadLatest(TOOL_ID);
  }

  global.SwotPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    THEOLOGY: THEOLOGY,
    WEIHRICH_REF: WEIHRICH_REF,
    QUESTIONS: QUESTIONS,
    QUAD_LABELS: QUAD_LABELS,
    PASTORAL_OVERRIDE_MSG: PASTORAL_OVERRIDE_MSG,
    calculateMatrix: calculateMatrix,
    computeQuizAverages: computeQuizAverages,
    buildSwotContract: buildSwotContract,
    buildDerivedFromInputs: buildDerivedFromInputs,
    buildDemoRun: buildDemoRun,
    buildNcdPreviewRun: buildNcdPreviewRun,
    buildRunFromQuiz: buildRunFromQuiz,
    saveQuizRun: saveQuizRun,
    buildRunFromWorkshop: buildRunFromWorkshop,
    saveWorkshopRun: saveWorkshopRun,
    buildAiPrompt: buildAiPrompt,
    ensureAssessmentRun: ensureAssessmentRun
  };
})(typeof window !== "undefined" ? window : global);
